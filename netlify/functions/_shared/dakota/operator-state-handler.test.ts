import type { User } from "@netlify/identity";
import { describe, expect, it } from "vitest";

import type { DakotaAuthorization } from "./auth";
import {
  DAKOTA_OPERATOR_BLOB_KEY,
  type DakotaOperatorStateDependencies,
  type DakotaOperatorStateStore,
  handleDakotaOperatorStateRequest,
} from "./operator-state-handler";
import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  createEmptyDakotaCommercialClose,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_REQUEST_MAX_BYTES,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  type DakotaOperatorRecordInput,
  type DakotaOperatorStateEnvelope,
  type DakotaTask,
} from "./operator-state-schema";

const URL = "https://www.dakota.littlefightnyc.com/api/dakota/operator-state";
const NOW = new Date("2026-08-03T12:00:00.000Z");

function openTask(overrides: Partial<DakotaTask> = {}): DakotaTask {
  return {
    taskId: "550e8400-e29b-41d4-a716-446655440100",
    type: "research",
    status: "open",
    title: "Advance the opportunity to its next evidence-backed step.",
    dueAt: "2026-08-04T12:00:00.000Z",
    contactId: null,
    channel: "internal",
    createdAt: "2026-08-01T12:00:00.000Z",
    resolvedAt: null,
    resolutionNote: "",
    ...overrides,
  };
}

function operatorUser(): User {
  return {
    id: "operator",
    email: "hello@littlefightnyc.com",
    roles: ["dakota_operator"],
  };
}

function input(overrides: Partial<DakotaOperatorRecordInput> = {}): DakotaOperatorRecordInput {
  return {
    identity: {
      businessName: "Example Bakery",
      source: "nys_dos",
      sourceId: "nys-dos:12345",
      verifiedUrl: "https://example.com/",
    },
    status: "early_signal",
    notes: "Needs human review.",
    verifiedPain: "",
    offerFit: "",
    nextAction: "Review the storefront.",
    dueDate: "",
    estimatedValue: null,
    actualRevenue: null,
    winLossReason: "",
    proof: "",
    draft: "",
    contacts: [{
      contactId: "550e8400-e29b-41d4-a716-446655440001",
      name: "Alex Owner",
      role: "Owner",
      channel: "email",
      value: "alex@example.com",
      sourceUrl: "https://example.com/contact",
      verifiedAt: "2026-08-03",
      consentClassification: "public_business",
    }],
    activities: [],
    commercialClose: createEmptyDakotaCommercialClose(),
    selectedContactId: null,
    tasks: [],
    ...overrides,
  };
}

function payload(
  candidateKey = "nys_dos:nys-dos:12345",
  record = input(),
  expectedUpdatedAt: string | null = null,
): Record<string, unknown> {
  return {
    candidate_key: candidateKey,
    expected_updated_at: expectedUpdatedAt,
    record,
  };
}

type WriteCall = {
  key: string;
  value: unknown;
  options: Record<string, unknown>;
};

class FakeStore {
  data: DakotaOperatorStateEnvelope | unknown | null = null;
  etag: string | null = null;
  conflicts = 0;
  failGet = false;
  failSet = false;
  onConflict: (() => void) | null = null;
  writeCalls: WriteCall[] = [];

  async getWithMetadata(key: string): Promise<
    | { data: unknown; etag?: string; metadata: Record<string, unknown> }
    | null
  > {
    expect(key).toBe(DAKOTA_OPERATOR_BLOB_KEY);
    if (this.failGet) throw new Error("synthetic get failure");
    if (this.data === null) return null;
    return { data: this.data, etag: this.etag ?? undefined, metadata: {} };
  }

  async setJSON(
    key: string,
    value: unknown,
    options: Record<string, unknown>,
  ): Promise<{ modified: boolean; etag?: string }> {
    if (this.failSet) throw new Error("synthetic set failure");
    this.writeCalls.push({ key, value, options });
    if (this.conflicts > 0) {
      this.conflicts -= 1;
      this.onConflict?.();
      return { modified: false };
    }
    if (options.onlyIfNew === true && this.data !== null) return { modified: false };
    if (typeof options.onlyIfMatch === "string" && options.onlyIfMatch !== this.etag) {
      return { modified: false };
    }
    this.data = value;
    this.etag = `etag-${this.writeCalls.length}`;
    return { modified: true, etag: this.etag };
  }
}

function dependencies(
  store: FakeStore,
  authorization: DakotaAuthorization = { allowed: true, user: operatorUser() },
): DakotaOperatorStateDependencies {
  return {
    authorize: async () => authorization,
    getStore: () => store as unknown as DakotaOperatorStateStore,
    now: () => NOW,
  };
}

function getRequest(suffix = ""): Request {
  return new Request(`${URL}${suffix}`, { method: "GET" });
}

function putRequest(
  body: BodyInit = JSON.stringify(payload()),
  headers: Record<string, string> = {},
): Request {
  return new Request(URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.dakota.littlefightnyc.com",
      ...headers,
    },
    body,
  });
}

async function json(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

describe("Dakota operator-state handler", () => {
  it("allows only GET and PUT", async () => {
    const response = await handleDakotaOperatorStateRequest(
      new Request(URL, { method: "DELETE" }),
      dependencies(new FakeStore()),
    );
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, PUT");
  });

  it("requires authentication, exact email, and operator role through shared authorization", async () => {
    const anonymous = await handleDakotaOperatorStateRequest(
      getRequest(),
      dependencies(new FakeStore(), { allowed: false, status: 401 }),
    );
    const forbidden = await handleDakotaOperatorStateRequest(
      getRequest(),
      dependencies(new FakeStore(), { allowed: false, status: 403 }),
    );
    expect(anonymous.status).toBe(401);
    expect(forbidden.status).toBe(403);

    const unavailable = await handleDakotaOperatorStateRequest(getRequest(), {
      ...dependencies(new FakeStore()),
      authorize: async () => {
        throw new Error("synthetic Identity failure");
      },
    });
    expect(unavailable.status).toBe(503);
  });

  it("returns a private empty snapshot without mutating storage", async () => {
    const store = new FakeStore();
    const response = await handleDakotaOperatorStateRequest(getRequest(), dependencies(store));
    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({
      schema_version: "dakota.operator-state.v3",
      updated_at: null,
      records: {},
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("cross-origin-resource-policy")).toBe("same-origin");
    expect(response.headers.get("vary")).toBe("Cookie, Authorization");
    expect(store.writeCalls).toHaveLength(0);
  });

  it("returns a valid stored snapshot and rejects query parameters", async () => {
    const store = new FakeStore();
    store.data = createDakotaOperatorStateEnvelope(
      {
        "nys_dos:nys-dos:12345": createDakotaOperatorRecord(input(), NOW.toISOString()),
      },
      NOW.toISOString(),
    );
    store.etag = "etag-current";

    const response = await handleDakotaOperatorStateRequest(getRequest(), dependencies(store));
    expect(response.status).toBe(200);
    expect((await json(response)).records).toBeDefined();

    const query = await handleDakotaOperatorStateRequest(
      getRequest("?candidate_key=nys_dos:nys-dos:12345"),
      dependencies(store),
    );
    expect(query.status).toBe(400);
  });

  it("fails closed for malformed stored state or storage errors", async () => {
    const corrupt = new FakeStore();
    corrupt.data = { records: "not valid" };
    corrupt.etag = "etag-corrupt";
    expect(
      (await handleDakotaOperatorStateRequest(getRequest(), dependencies(corrupt))).status,
    ).toBe(503);

    const unavailable = new FakeStore();
    unavailable.failGet = true;
    expect(
      (await handleDakotaOperatorStateRequest(getRequest(), dependencies(unavailable))).status,
    ).toBe(503);
  });

  it("requires same-origin JSON writes", async () => {
    const noOrigin = putRequest(JSON.stringify(payload()), { Origin: "" });
    const wrongType = putRequest(JSON.stringify(payload()), {
      "Content-Type": "text/plain",
    });

    expect(
      (await handleDakotaOperatorStateRequest(noOrigin, dependencies(new FakeStore()))).status,
    ).toBe(403);
    expect(
      (await handleDakotaOperatorStateRequest(wrongType, dependencies(new FakeStore()))).status,
    ).toBe(415);
    for (const origin of [
      "null",
      "not a URL",
      "http://www.dakota.littlefightnyc.com",
      "https://www.dakota.littlefightnyc.com:8443",
      "https://attacker.example.net",
    ]) {
      const response = await handleDakotaOperatorStateRequest(
        putRequest(JSON.stringify(payload()), { Origin: origin }),
        dependencies(new FakeStore()),
      );
      expect(response.status, origin).toBe(403);
    }
  });

  it("rejects oversized, malformed, non-UTF-8, and invalid-shape bodies", async () => {
    const oversized = putRequest("x".repeat(DAKOTA_OPERATOR_REQUEST_MAX_BYTES + 1));
    expect(
      (await handleDakotaOperatorStateRequest(oversized, dependencies(new FakeStore()))).status,
    ).toBe(413);

    const malformed = putRequest("{not-json");
    expect(
      (await handleDakotaOperatorStateRequest(malformed, dependencies(new FakeStore()))).status,
    ).toBe(400);

    const invalidUtf8 = putRequest(new Uint8Array([0xff]));
    expect(
      (await handleDakotaOperatorStateRequest(invalidUtf8, dependencies(new FakeStore()))).status,
    ).toBe(400);

    const invalidShape = putRequest(JSON.stringify({ candidate_key: "bad", record: {} }));
    expect(
      (await handleDakotaOperatorStateRequest(invalidShape, dependencies(new FakeStore()))).status,
    ).toBe(422);
  });

  it("creates a record atomically with server timestamps and safe metadata", async () => {
    const store = new FakeStore();
    const response = await handleDakotaOperatorStateRequest(
      putRequest(),
      dependencies(store),
    );
    expect(response.status).toBe(200);
    const body = await json(response);
    expect(body).toEqual(
      expect.objectContaining({
        schema_version: "dakota.operator-state.v3",
        updated_at: NOW.toISOString(),
        candidate_key: "nys_dos:nys-dos:12345",
      }),
    );
    expect((body.record as Record<string, unknown>).updated_at).toBe(NOW.toISOString());
    expect((body.record as Record<string, unknown>).milestones).toEqual({
      humanApprovedAt: null,
      firstContactedAt: null,
      repliedAt: null,
      meetingAt: null,
      proposalAt: null,
      wonAt: null,
      lostAt: null,
      paidAt: null,
    });
    expect(store.writeCalls).toHaveLength(1);
    expect(store.writeCalls[0]?.key).toBe(DAKOTA_OPERATOR_BLOB_KEY);
    expect(store.writeCalls[0]?.options).toEqual(
      expect.objectContaining({
        onlyIfNew: true,
        metadata: {
          schemaVersion: "dakota.operator-state.v3",
          recordCount: 1,
          updatedAt: NOW.toISOString(),
        },
      }),
    );
  });

  it("requires null for creates and the exact record timestamp for updates", async () => {
    const createStore = new FakeStore();
    const invalidCreate = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(undefined, input(), NOW.toISOString()))),
      dependencies(createStore),
    );
    expect(invalidCreate.status).toBe(409);
    expect(await json(invalidCreate)).toEqual({
      error: "This opportunity changed in another tab. Refresh Dakota and try again.",
    });
    expect(createStore.writeCalls).toHaveLength(0);

    const previousUpdatedAt = NOW.toISOString();
    const updateStore = new FakeStore();
    updateStore.data = createDakotaOperatorStateEnvelope({
      "nys_dos:nys-dos:12345": createDakotaOperatorRecord(input(), previousUpdatedAt),
    }, previousUpdatedAt);
    updateStore.etag = "etag-versioned";

    for (const expectedUpdatedAt of [null, "2026-08-03T11:59:59.999Z"]) {
      const stale = await handleDakotaOperatorStateRequest(
        putRequest(JSON.stringify(payload(
          undefined,
          input({ notes: "Stale edit." }),
          expectedUpdatedAt,
        ))),
        dependencies(updateStore),
      );
      expect(stale.status).toBe(409);
      expect(await json(stale)).toEqual({
        error: "This opportunity changed in another tab. Refresh Dakota and try again.",
      });
    }
    expect(updateStore.writeCalls).toHaveLength(0);

    const exact = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(
        undefined,
        input({ notes: "Version-matched edit." }),
        previousUpdatedAt,
      ))),
      dependencies(updateStore),
    );
    expect(exact.status).toBe(200);
    expect((await json(exact)).record).toEqual(
      expect.objectContaining({ updated_at: "2026-08-03T12:00:00.001Z" }),
    );
    expect(updateStore.writeCalls).toHaveLength(1);
  });

  it("detects a same-record race after an aggregate ETag conflict", async () => {
    const store = new FakeStore();
    const viewedAt = "2026-08-03T11:00:00.000Z";
    const concurrentAt = "2026-08-03T11:30:00.000Z";
    store.data = createDakotaOperatorStateEnvelope({
      "nys_dos:nys-dos:12345": createDakotaOperatorRecord(input(), viewedAt),
    }, viewedAt);
    store.etag = "etag-viewed";
    store.conflicts = 1;
    store.onConflict = () => {
      store.data = createDakotaOperatorStateEnvelope({
        "nys_dos:nys-dos:12345": createDakotaOperatorRecord(
          input({ notes: "Concurrent tab edit." }),
          concurrentAt,
        ),
      }, concurrentAt);
      store.etag = "etag-concurrent-record";
      store.onConflict = null;
    };

    const response = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(
        undefined,
        input({ notes: "Stale tab edit." }),
        viewedAt,
      ))),
      dependencies(store),
    );
    expect(response.status).toBe(409);
    expect(await json(response)).toEqual({
      error: "This opportunity changed in another tab. Refresh Dakota and try again.",
    });
    expect(store.writeCalls).toHaveLength(1);
    expect(
      (store.data as DakotaOperatorStateEnvelope)
        .records["nys_dos:nys-dos:12345"]?.notes,
    ).toBe("Concurrent tab edit.");
  });

  it("rejects live-work writes that do not carry exactly one open task", async () => {
    const store = new FakeStore();
    const response = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(undefined, input({ status: "research_ready" })))),
      dependencies(store),
    );

    expect(response.status).toBe(422);
    expect(await json(response)).toEqual({
      error: "This stage requires exactly one open task.",
    });
    expect(store.writeCalls).toHaveLength(0);
  });

  it("records immutable server timestamps for revenue milestones", async () => {
    const store = new FakeStore();
    let currentTime = new Date("2026-07-31T12:00:00.000Z");
    const milestoneDependencies: DakotaOperatorStateDependencies = {
      ...dependencies(store),
      now: () => currentTime,
    };
    const evidence = {
      verifiedPain: "The mobile customer path was verified manually.",
      offerFit: "A specific conversion repair fits the observed evidence.",
    };
    const contactId = "550e8400-e29b-41d4-a716-446655440001";
    const contacts = [{
      ...input().contacts[0],
      consentClassification: "existing_relationship" as const,
    }];
    const activities: DakotaOperatorRecordInput["activities"] = [];
    let tasks: DakotaTask[] = [openTask({
      type: "research",
      channel: "internal",
      contactId: null,
      title: "Verify the opportunity before pursuit.",
      createdAt: currentTime.toISOString(),
    })];
    let commercialClose = createEmptyDakotaCommercialClose();
    let expectedUpdatedAt: string | null = null;
    const addActivity = (
      activityId: string,
      channel: DakotaOperatorRecordInput["activities"][number]["channel"],
      type: DakotaOperatorRecordInput["activities"][number]["type"],
      outcome: DakotaOperatorRecordInput["activities"][number]["outcome"],
    ) => {
      const activeTask = tasks.find((candidate) => candidate.status === "open");
      if (!activeTask) throw new Error("milestone fixture has no open task");
      activities.push({
        activityId,
        taskId: activeTask.taskId,
        contactId,
        channel,
        type,
        outcome,
        note: "Operator-recorded evidence.",
        occurredAt: currentTime.toISOString(),
        followUpAt: null,
        ...(["outreach", "call", "follow_up", "reply"].includes(type) ? {
          pursuitAttribution: {
            templateId: "restaurant_booking_fix_sop" as const,
            templateVersion: "1.0.0" as const,
            packetId: "550e8400-e29b-41d4-a716-446655440200",
            packetVersion: "1.0.0" as const,
            segment: "restaurant" as const,
            approvedAt: "2026-08-01T12:00:00.000Z",
          },
        } : {}),
      });
    };
    const advanceTask = (
      taskId: string,
      type: DakotaTask["type"],
      channel: DakotaTask["channel"],
      title: string,
    ) => {
      const activeTask = tasks.find((candidate) => candidate.status === "open");
      if (!activeTask) throw new Error("milestone fixture has no task to complete");
      tasks = tasks.map((candidate) => candidate.taskId === activeTask.taskId
        ? {
            ...candidate,
            status: "completed" as const,
            resolvedAt: currentTime.toISOString(),
            resolutionNote: "The evidenced task was completed.",
          }
        : candidate);
      tasks.push(openTask({
        taskId,
        type,
        channel,
        contactId: channel === "internal" ? null : contactId,
        title,
        dueAt: null,
        createdAt: currentTime.toISOString(),
      }));
    };
    const saveStatus = async (status: DakotaOperatorRecordInput["status"], notes = "") => {
      const request = putRequest(JSON.stringify(payload(undefined, input({
        ...evidence,
        status,
        notes,
        contacts,
        activities: [...activities],
        commercialClose,
        selectedContactId: contactId,
        tasks: tasks.map((candidate) => ({ ...candidate })),
      }), expectedUpdatedAt)));
      const response = await handleDakotaOperatorStateRequest(request, milestoneDependencies);
      if (response.status === 200) expectedUpdatedAt = currentTime.toISOString();
      return response;
    };

    expect((await saveStatus("research_ready")).status).toBe(200);
    currentTime = new Date("2026-08-01T12:00:00.000Z");
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440106",
      "outreach",
      "email",
      "Send the approved first outreach.",
    );
    expect((await saveStatus("pursuit_ready")).status).toBe(200);
    const approvedAt = currentTime.toISOString();
    currentTime = new Date("2026-08-02T09:00:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440010", "email", "outreach", "sent");
    addActivity("550e8400-e29b-41d4-a716-446655440011", "email", "reply", "replied");
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440101",
      "meeting",
      "meeting",
      "Hold the qualified discovery meeting.",
    );
    expect((await saveStatus("replied")).status).toBe(200);
    const repliedAt = currentTime.toISOString();
    currentTime = new Date("2026-08-02T11:00:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440012", "meeting", "meeting", "completed");
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440102",
      "proposal",
      "proposal",
      "Send the scoped proposal.",
    );
    expect((await saveStatus("meeting")).status).toBe(200);
    const meetingAt = currentTime.toISOString();
    currentTime = new Date("2026-08-02T15:00:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440013", "proposal", "proposal_sent", "sent");
    commercialClose = {
      ...commercialClose,
      proposalRef: "Proposal 1001",
      proposalAmount: 12_500,
      proposalSentDate: "2026-08-02",
    };
    expect((await saveStatus("proposal")).status).toBe(200);
    const proposalAt = currentTime.toISOString();
    currentTime = new Date("2026-08-03T08:00:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440014", "contract", "contract_signed", "won");
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440103",
      "invoice",
      "invoice",
      "Send the signed engagement invoice.",
    );
    commercialClose = { ...commercialClose, signedDate: "2026-08-03" };
    expect((await saveStatus("won")).status).toBe(200);
    const wonAt = currentTime.toISOString();
    currentTime = new Date("2026-08-03T10:00:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440016", "invoice", "invoice_sent", "sent");
    commercialClose = {
      ...commercialClose,
      invoiceRef: "Invoice 1001",
      amountDue: 12_500,
      balance: 12_500,
    };
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440104",
      "payment",
      "payment",
      "Confirm cleared payment.",
    );
    expect((await saveStatus("won")).status).toBe(200);
    currentTime = new Date("2026-08-03T10:30:00.000Z");
    addActivity("550e8400-e29b-41d4-a716-446655440015", "payment", "payment_received", "paid");
    commercialClose = {
      ...commercialClose,
      amountPaid: 12_500,
      paidDate: "2026-08-03",
      balance: 0,
      onboardingNextAction: "Schedule the paid kickoff.",
    };
    advanceTask(
      "550e8400-e29b-41d4-a716-446655440105",
      "onboarding",
      "internal",
      "Schedule the paid kickoff.",
    );
    expect((await saveStatus("paid")).status).toBe(200);
    const paidAt = currentTime.toISOString();
    currentTime = new Date("2026-08-03T12:00:00.000Z");
    expect((await saveStatus("research_ready", "A later note must not rewrite milestones.")).status).toBe(200);

    const saved = (store.data as DakotaOperatorStateEnvelope).records["nys_dos:nys-dos:12345"];
    expect(saved?.milestones).toEqual({
      humanApprovedAt: approvedAt,
      firstContactedAt: repliedAt,
      repliedAt,
      meetingAt,
      proposalAt,
      wonAt,
      lostAt: null,
      paidAt,
    });
    expect(saved?.status).toBe("research_ready");
    expect(saved?.updated_at).toBe(currentTime.toISOString());
  });

  it("normalizes legacy records on read without mutating the Blob", async () => {
    const store = new FakeStore();
    const legacyUpdatedAt = "2026-07-31T10:00:00.000Z";
    store.data = {
      schema_version: "dakota.operator-state.v1",
      updated_at: legacyUpdatedAt,
      records: {
        "nys_dos:nys-dos:12345": {
          ...(() => {
            const {
              contacts: _contacts,
              activities: _activities,
              commercialClose: _commercialClose,
              selectedContactId: _selectedContactId,
              tasks: _tasks,
              ...legacy
            } = input({
            status: "proposal",
            verifiedPain: "Verified legacy evidence.",
            offerFit: "Verified legacy offer fit.",
            });
            return legacy;
          })(),
          updated_at: legacyUpdatedAt,
        },
      },
    };
    store.etag = "etag-legacy";

    const response = await handleDakotaOperatorStateRequest(getRequest(), dependencies(store));
    expect(response.status).toBe(200);
    const body = await json(response);
    const records = body.records as Record<string, Record<string, unknown>>;
    expect(records["nys_dos:nys-dos:12345"]?.milestones).toEqual({
      humanApprovedAt: legacyUpdatedAt,
      firstContactedAt: legacyUpdatedAt,
      repliedAt: null,
      meetingAt: null,
      proposalAt: legacyUpdatedAt,
      wonAt: null,
      lostAt: null,
      paidAt: null,
    });
    expect(store.writeCalls).toHaveLength(0);
  });

  it("updates one record with ETag matching and preserves every other record", async () => {
    const store = new FakeStore();
    const otherKey = "manual:550e8400-e29b-41d4-a716-446655440000";
    const otherRecord = createDakotaOperatorRecord(
      input({
        identity: {
          businessName: "Manual Business",
          source: "manual",
          sourceId: "550e8400-e29b-41d4-a716-446655440000",
        },
      }),
      "2026-08-02T12:00:00.000Z",
    );
    store.data = createDakotaOperatorStateEnvelope(
      {
        "nys_dos:nys-dos:12345": createDakotaOperatorRecord(
          input(),
          "2026-08-02T12:00:00.000Z",
        ),
        [otherKey]: otherRecord,
      },
      "2026-08-02T12:00:00.000Z",
    );
    store.etag = "etag-existing";

    const response = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(undefined, input({
        status: "research_ready",
        tasks: [openTask()],
      }), "2026-08-02T12:00:00.000Z"))),
      dependencies(store),
    );
    expect(response.status).toBe(200);
    expect(store.writeCalls[0]?.options).toEqual(
      expect.objectContaining({ onlyIfMatch: "etag-existing" }),
    );
    const saved = store.data as DakotaOperatorStateEnvelope;
    expect(saved.records[otherKey]).toEqual(otherRecord);
    expect(saved.records["nys_dos:nys-dos:12345"]?.status).toBe("research_ready");
  });

  it("retries conditional write conflicts without replacing the store wholesale", async () => {
    const store = new FakeStore();
    store.conflicts = 1;
    const concurrentKey = "nys_dos:nys-dos:99999";
    store.onConflict = () => {
      store.data = createDakotaOperatorStateEnvelope(
        {
          [concurrentKey]: createDakotaOperatorRecord(
            input({
              identity: {
                businessName: "Concurrent Bakery",
                source: "nys_dos",
                sourceId: "nys-dos:99999",
              },
            }),
            "2026-08-03T11:59:00.000Z",
          ),
        },
        "2026-08-03T11:59:00.000Z",
      );
      store.etag = "etag-concurrent";
      store.onConflict = null;
    };
    const response = await handleDakotaOperatorStateRequest(putRequest(), dependencies(store));
    expect(response.status).toBe(200);
    expect(store.writeCalls).toHaveLength(2);
    expect((store.data as DakotaOperatorStateEnvelope).records[concurrentKey]).toBeDefined();
    expect(
      (store.data as DakotaOperatorStateEnvelope).records["nys_dos:nys-dos:12345"],
    ).toBeDefined();
    expect(store.writeCalls[1]?.options).toEqual(
      expect.objectContaining({ onlyIfMatch: "etag-concurrent" }),
    );

    const exhausted = new FakeStore();
    exhausted.conflicts = 3;
    const conflict = await handleDakotaOperatorStateRequest(
      putRequest(),
      dependencies(exhausted),
    );
    expect(conflict.status).toBe(409);
    expect(exhausted.writeCalls).toHaveLength(3);
  });

  it("enforces the stored-record cap without deleting older operator work", async () => {
    const store = new FakeStore();
    const records = Object.fromEntries(
      Array.from({ length: DAKOTA_OPERATOR_RECORD_LIMIT }, (_, index) => [
        `nys_dos:nys-dos:${index}`,
        createDakotaOperatorRecord(
          input({
            identity: {
              businessName: `Business ${index}`,
              source: "nys_dos",
              sourceId: `nys-dos:${index}`,
            },
          }),
          "2026-08-02T12:00:00.000Z",
        ),
      ]),
    );
    store.data = createDakotaOperatorStateEnvelope(records, "2026-08-02T12:00:00.000Z");
    store.etag = "etag-full";

    const response = await handleDakotaOperatorStateRequest(
      putRequest(
        JSON.stringify(
          payload(
            "manual:550e8400-e29b-41d4-a716-446655440000",
            input({
              identity: {
                businessName: "One Too Many",
                source: "manual",
                sourceId: "550e8400-e29b-41d4-a716-446655440000",
              },
            }),
          ),
        ),
      ),
      dependencies(store),
    );
    expect(response.status).toBe(409);
    expect(store.writeCalls).toHaveLength(0);
    expect(Object.keys((store.data as DakotaOperatorStateEnvelope).records)).toHaveLength(
      DAKOTA_OPERATOR_RECORD_LIMIT,
    );
  });

  it("enforces the aggregate Blob-size cap before a conditional write", async () => {
    const store = new FakeStore();
    const records: Record<string, ReturnType<typeof createDakotaOperatorRecord>> = {};
    const largeFields = {
      notes: "n".repeat(4_000),
      verifiedPain: "p".repeat(2_000),
      offerFit: "o".repeat(1_000),
      nextAction: "a".repeat(1_000),
      winLossReason: "w".repeat(1_000),
      proof: "r".repeat(4_000),
      draft: "d".repeat(6_000),
    };

    for (let index = 0; index < DAKOTA_OPERATOR_RECORD_LIMIT - 1; index += 1) {
      const key = `nys_dos:nys-dos:${index}`;
      const next = {
        ...records,
        [key]: createDakotaOperatorRecord(
          input({
            ...largeFields,
            identity: {
              businessName: `Business ${index}`,
              source: "nys_dos",
              sourceId: `nys-dos:${index}`,
            },
          }),
          "2026-08-02T12:00:00.000Z",
        ),
      };
      const envelope = createDakotaOperatorStateEnvelope(
        next,
        "2026-08-02T12:00:00.000Z",
      );
      if (new TextEncoder().encode(JSON.stringify(envelope)).byteLength >= DAKOTA_OPERATOR_STATE_MAX_BYTES) {
        break;
      }
      records[key] = next[key]!;
    }

    store.data = createDakotaOperatorStateEnvelope(records, "2026-08-02T12:00:00.000Z");
    store.etag = "etag-near-limit";
    const candidateIndex = Object.keys(records).length;
    const response = await handleDakotaOperatorStateRequest(
      putRequest(
        JSON.stringify(
          payload(
            `nys_dos:nys-dos:${candidateIndex}`,
            input({
              ...largeFields,
              identity: {
                businessName: `Business ${candidateIndex}`,
                source: "nys_dos",
                sourceId: `nys-dos:${candidateIndex}`,
              },
            }),
          ),
        ),
      ),
      dependencies(store),
    );

    expect(response.status).toBe(409);
    expect(await json(response)).toEqual({
      error: "Operator-state storage limit has been reached.",
    });
    expect(store.writeCalls).toHaveLength(0);
  });

  it("enforces durable history and cleared-cash evidence through the HTTP handler", async () => {
    const store = new FakeStore();
    const activity = {
      activityId: "550e8400-e29b-41d4-a716-446655440020",
      channel: "internal" as const,
      type: "note" as const,
      outcome: "recorded" as const,
      note: "Immutable operator note.",
      occurredAt: NOW.toISOString(),
      followUpAt: null,
    };
    store.data = createDakotaOperatorStateEnvelope({
      "nys_dos:nys-dos:12345": createDakotaOperatorRecord(
        input({ activities: [activity] }),
        NOW.toISOString(),
      ),
    }, NOW.toISOString());
    store.etag = "etag-history";

    const removeActivity = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(undefined, input({ activities: [] }), NOW.toISOString()))),
      dependencies(store),
    );
    expect(removeActivity.status).toBe(422);

    const removeContact = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(
        undefined,
        input({ contacts: [], activities: [activity] }),
        NOW.toISOString(),
      ))),
      dependencies(store),
    );
    expect(removeContact.status).toBe(422);

    const unsupportedCash = await handleDakotaOperatorStateRequest(
      putRequest(JSON.stringify(payload(undefined, input({
        activities: [activity],
        commercialClose: {
          ...createEmptyDakotaCommercialClose(),
          amountPaid: 500,
          paidDate: "2026-08-03",
        },
      }), NOW.toISOString()))),
      dependencies(store),
    );
    expect(unsupportedCash.status).toBe(422);
    expect(store.writeCalls).toHaveLength(0);
  });

  it("returns a generic 503 when a write fails", async () => {
    const store = new FakeStore();
    store.failSet = true;
    const response = await handleDakotaOperatorStateRequest(putRequest(), dependencies(store));
    expect(response.status).toBe(503);
    expect(await json(response)).toEqual({
      error: "Dakota operator state is temporarily unavailable.",
    });
  });
});

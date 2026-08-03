import { describe, expect, it } from "vitest";

import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  createEmptyDakotaCommercialClose,
  DAKOTA_ACTIVITY_COMPATIBILITY,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  DAKOTA_OPERATOR_STATUSES,
  DAKOTA_TASK_LIMIT,
  type DakotaActivity,
  type DakotaTask,
  isDakotaCandidateKey,
  validateDakotaOperatorPutPayload,
  validateDakotaOperatorRecordInput,
  validateDakotaOperatorStateEnvelope,
  validateDakotaOperatorTransition,
} from "./operator-state-schema";

const UPDATED_AT = "2026-08-03T12:00:00.000Z";
const CONTACT_ID = "550e8400-e29b-41d4-a716-446655440001";
const TASK_ID = "550e8400-e29b-41d4-a716-446655440100";

function task(overrides: Partial<DakotaTask> = {}): DakotaTask {
  return {
    taskId: TASK_ID,
    type: "research",
    status: "open",
    title: "Research the storefront and confirm the opportunity.",
    dueAt: "2026-08-04T12:00:00.000Z",
    contactId: null,
    channel: "internal",
    createdAt: UPDATED_AT,
    resolvedAt: null,
    resolutionNote: "",
    ...overrides,
  };
}

function activity(overrides: Partial<DakotaActivity> = {}): DakotaActivity {
  return {
    activityId: "550e8400-e29b-41d4-a716-446655440010",
    taskId: null,
    contactId: null,
    channel: "internal",
    type: "note",
    outcome: "recorded",
    note: "Operator-recorded factual evidence.",
    occurredAt: UPDATED_AT,
    followUpAt: null,
    ...overrides,
  };
}

function consentedEmailContact(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    contactId: CONTACT_ID,
    name: "Alex Owner",
    role: "Owner",
    channel: "email",
    value: "alex@example.com",
    sourceUrl: "https://example.com/contact",
    verifiedAt: "2026-08-03",
    consentClassification: "existing_relationship",
    ...overrides,
  };
}

function identity(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    businessName: "Example Bakery",
    dba: "Example",
    category: "Bakery",
    city: "Brooklyn",
    borough: "Brooklyn",
    source: "nys_dos",
    sourceId: "nys-dos:12345",
    verifiedUrl: "https://example.com/",
    publicSourceUrl: "https://data.ny.gov/example",
    ...overrides,
  };
}

function record(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    identity: identity(),
    status: "early_signal",
    notes: "Needs a human identity review.",
    verifiedPain: "Mobile navigation obscures the booking path.",
    offerFit: "Conversion-focused website engagement.",
    nextAction: "Verify the storefront and decide whether to pursue.",
    dueDate: "2026-08-15",
    estimatedValue: 12_500,
    actualRevenue: null,
    winLossReason: "",
    proof: "Public filing and business site reviewed manually.",
    draft: "Hi [Business Name], I noticed a possible booking-path issue.",
    contacts: [{
      contactId: CONTACT_ID,
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

function storedRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const {
    contacts: _contacts,
    activities: _activities,
    commercialClose: _commercialClose,
    selectedContactId: _selectedContactId,
    tasks: _tasks,
    ...legacy
  } = record(overrides);
  return { ...legacy, updated_at: UPDATED_AT };
}

function storedV2Record(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const {
    selectedContactId: _selectedContactId,
    tasks: _tasks,
    ...v2
  } = createDakotaOperatorRecord(
    record(overrides) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
    UPDATED_AT,
  );
  return v2;
}

function validatedInput(overrides: Record<string, unknown> = {}) {
  const validation = validateDakotaOperatorRecordInput(record(overrides));
  if (!validation.valid) throw new Error(validation.error);
  return validation.value;
}

describe("Dakota operator-state schema", () => {
  it("accepts every approved human status and exact record fields", () => {
    for (const status of DAKOTA_OPERATOR_STATUSES) {
      expect(validateDakotaOperatorRecordInput(record({ status }))).toEqual(
        expect.objectContaining({ valid: true }),
      );
    }
  });

  it("requires pursuit evidence in the server transition gate", () => {
    for (const status of [
      "pursuit_ready",
      "pursuing",
      "replied",
      "meeting",
      "proposal",
      "won",
      "lost",
    ]) {
      expect(
        validateDakotaOperatorTransition(
          record({
            status,
            verifiedPain: "",
            offerFit: "",
            winLossReason: status === "lost" ? "Budget changed." : "",
            tasks: status === "lost" ? [] : [task()],
          }) as unknown as Parameters<typeof validateDakotaOperatorTransition>[0],
          undefined,
          new Date(UPDATED_AT),
        ).valid,
        status,
      ).toBe(false);
    }
    expect(
      validateDakotaOperatorTransition(
        record({
          status: "research_ready",
          verifiedPain: "",
          offerFit: "",
          tasks: [task()],
        }) as unknown as Parameters<typeof validateDakotaOperatorTransition>[0],
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("keeps milestone timestamps server-owned", () => {
    expect(
      validateDakotaOperatorRecordInput(
        record({
          milestones: {
            humanApprovedAt: UPDATED_AT,
            repliedAt: null,
            meetingAt: null,
            proposalAt: null,
            wonAt: null,
          },
        }),
      ).valid,
    ).toBe(false);
  });

  it("stamps each bounded milestone once and preserves it across later edits", () => {
    const approvedAt = "2026-08-01T12:00:00.000Z";
    const repliedAt = "2026-08-02T12:00:00.000Z";
    const laterEditAt = "2026-08-03T12:00:00.000Z";
    const approved = createDakotaOperatorRecord(
      record({ status: "pursuit_ready" }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      approvedAt,
    );
    expect(approved.milestones).toEqual({
      humanApprovedAt: approvedAt,
      firstContactedAt: null,
      repliedAt: null,
      meetingAt: null,
      proposalAt: null,
      wonAt: null,
      lostAt: null,
      paidAt: null,
    });

    const replied = createDakotaOperatorRecord(
      record({ status: "replied" }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      repliedAt,
      approved,
    );
    const edited = createDakotaOperatorRecord(
      record({ status: "research_ready", notes: "Later research note." }) as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
      laterEditAt,
      replied,
    );
    expect(edited.milestones.humanApprovedAt).toBe(approvedAt);
    expect(edited.milestones.repliedAt).toBe(repliedAt);
    expect(edited.updated_at).toBe(laterEditAt);
  });

  it("accepts stable feed keys and only UUID-shaped manual keys", () => {
    expect(isDakotaCandidateKey("nys_dos:nys-dos:12345")).toBe(true);
    expect(isDakotaCandidateKey("manual:550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    for (const key of [
      "manual:not-a-uuid",
      "NYS_DOS:nys-dos:12345",
      "nys_dos/../../state:123",
      "https://example.com:123",
      "nys_dos:",
      "__proto__",
    ]) {
      expect(isDakotaCandidateKey(key)).toBe(false);
    }
  });

  it("requires exact request and record shapes", () => {
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        expected_updated_at: null,
        record: record(),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        expected_updated_at: null,
        record: record(),
        extra: true,
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        expected_updated_at: "not-a-timestamp",
        record: record(),
      }),
    ).toEqual({
      valid: false,
      error: "expected_updated_at must be null or an ISO timestamp.",
    });
    expect(validateDakotaOperatorRecordInput({ ...record(), extra: true }).valid).toBe(false);

    const { draft: _draft, ...missing } = record();
    expect(validateDakotaOperatorRecordInput(missing).valid).toBe(false);
  });

  it("accepts v1 and v2 input shapes and normalizes their new v3 fields", () => {
    const {
      selectedContactId: _selectedContactId,
      tasks: _tasks,
      ...v2
    } = record();
    const v2Validation = validateDakotaOperatorRecordInput(v2);
    expect(v2Validation.valid).toBe(true);
    if (v2Validation.valid) {
      expect(v2Validation.value.selectedContactId).toBeNull();
      expect(v2Validation.value.tasks).toEqual([]);
    }

    const {
      contacts: _contacts,
      activities: _activities,
      commercialClose: _commercialClose,
      ...v1
    } = v2;
    const v1Validation = validateDakotaOperatorRecordInput(v1);
    expect(v1Validation.valid).toBe(true);
    if (v1Validation.valid) {
      expect(v1Validation.value.contacts).toEqual([]);
      expect(v1Validation.value.activities).toEqual([]);
      expect(v1Validation.value.selectedContactId).toBeNull();
      expect(v1Validation.value.tasks).toEqual([]);
    }
  });

  it("requires a bounded identity snapshot and rejects mismatched feed identity", () => {
    expect(validateDakotaOperatorRecordInput(record({ identity: { businessName: "Bakery" } })).valid).toBe(
      true,
    );
    expect(validateDakotaOperatorRecordInput(record({ identity: {} })).valid).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ businessName: "x".repeat(241) }) }),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ city: "x".repeat(160) }) }),
      ).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorRecordInput(
        record({ identity: identity({ city: "x".repeat(161) }) }),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(record({ identity: identity({ rawPayload: {} }) })).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nyc_dcwp:nys-dos:12345",
        expected_updated_at: null,
        record: record(),
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:abc123",
        expected_updated_at: UPDATED_AT,
        record: record({
          identity: identity({ source: "NYS_DOS", sourceId: "NYS-DOS:ABC123" }),
        }),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "nys_dos:nys-dos:12345",
        expected_updated_at: null,
        record: record({
          identity: {
            businessName: "Example Bakery",
            source: "nys_dos",
          },
        }),
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "manual:550e8400-e29b-41d4-a716-446655440000",
        expected_updated_at: null,
        record: record({
          identity: {
            businessName: "Manual Bakery",
            source: "manual",
            sourceId: "550e8400-e29b-41d4-a716-446655440000",
          },
        }),
      }).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorPutPayload({
        candidate_key: "manual:550e8400-e29b-41d4-a716-446655440000",
        expected_updated_at: null,
        record: record({ identity: { businessName: "Manual Bakery" } }),
      }).valid,
    ).toBe(false);
  });

  it("allows only safe public HTTPS URLs in the two identity URL fields", () => {
    for (const verifiedUrl of [
      "javascript:alert(1)",
      "data:text/html,unsafe",
      "http://example.com/path",
      "https://user:pass@example.com/",
      "https://localhost/path",
      "http://127.0.0.1/path",
      "https://example.com:8443/path",
      " https://example.com/",
    ]) {
      expect(
        validateDakotaOperatorRecordInput(
          record({ identity: identity({ verifiedUrl }) }),
        ).valid,
      ).toBe(false);
    }

    expect(
      validateDakotaOperatorRecordInput(
        record({
          identity: identity({
            verifiedUrl: "https://example.com/path?q=1",
            publicSourceUrl: "https://www.google.com/maps/place/example",
          }),
        }),
      ).valid,
    ).toBe(true);
  });

  it("allows HTTPS web-contact values without allowing URLs in text or direct routes", () => {
    const baseContact = (record().contacts as Record<string, unknown>[])[0] ?? {};
    for (const contact of [
      {
        ...baseContact,
        channel: "website_form",
        value: "https://example.com/contact",
      },
      {
        ...baseContact,
        channel: "linkedin",
        value: "https://www.linkedin.com/in/alex-owner",
      },
    ]) {
      expect(validateDakotaOperatorRecordInput(record({ contacts: [contact] })).valid).toBe(true);
    }

    for (const contact of [
      { ...baseContact, name: "https://example.com/alex" },
      { ...baseContact, role: "https://example.com/owner" },
      { ...baseContact, channel: "email", value: "https://example.com/contact" },
      { ...baseContact, channel: "phone", value: "https://example.com/contact" },
      { ...baseContact, channel: "sms", value: "https://example.com/contact" },
      { ...baseContact, channel: "website_form", value: "http://example.com/contact" },
      { ...baseContact, channel: "linkedin", value: "https://example.com/in/alex-owner" },
    ]) {
      expect(validateDakotaOperatorRecordInput(record({ contacts: [contact] })).valid).toBe(false);
    }
  });

  it("rejects URLs, HTML, controls, and oversized operator prose", () => {
    for (const notes of [
      "Review https://example.com",
      "<strong>unsafe</strong>",
      "unsafe --!> comment close",
      "unsafe\u0000text",
      "x".repeat(4_001),
    ]) {
      expect(validateDakotaOperatorRecordInput(record({ notes })).valid).toBe(false);
    }
    expect(validateDakotaOperatorRecordInput(record({ draft: "x".repeat(6_001) })).valid).toBe(false);
  });

  it("validates real date-only values and bounded two-decimal money values", () => {
    expect(validateDakotaOperatorRecordInput(record({ dueDate: "", estimatedValue: 0 })).valid).toBe(
      true,
    );
    expect(validateDakotaOperatorRecordInput(record({ dueDate: "2028-02-29" })).valid).toBe(true);
    for (const dueDate of ["2026-02-29", "2026-13-01", "08/15/2026", null]) {
      expect(validateDakotaOperatorRecordInput(record({ dueDate })).valid).toBe(false);
    }
    for (const estimatedValue of [-1, 100_000_001, 12.345, Number.NaN, "1000"]) {
      expect(validateDakotaOperatorRecordInput(record({ estimatedValue })).valid).toBe(false);
    }
  });

  it("validates stored timestamps, record keys, limits, and envelope size", () => {
    const valid = createDakotaOperatorStateEnvelope(
      {
        "nys_dos:nys-dos:12345": createDakotaOperatorRecord(
          record() as unknown as Parameters<typeof createDakotaOperatorRecord>[0],
          UPDATED_AT,
        ),
      },
      UPDATED_AT,
    );
    expect(validateDakotaOperatorStateEnvelope(valid).valid).toBe(true);
    const legacy = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedRecord({ status: "proposal" }),
      },
    });
    expect(legacy.valid).toBe(true);
    if (legacy.valid) {
      expect(legacy.value.records["nys_dos:nys-dos:12345"]?.milestones).toEqual({
        humanApprovedAt: UPDATED_AT,
        firstContactedAt: UPDATED_AT,
        repliedAt: null,
        meetingAt: null,
        proposalAt: UPDATED_AT,
        wonAt: null,
        lostAt: null,
        paidAt: null,
      });
    }
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: {
          "nys_dos:nys-dos:12345": {
            ...valid.records["nys_dos:nys-dos:12345"],
            milestones: {
              ...valid.records["nys_dos:nys-dos:12345"]?.milestones,
              wonAt: "not-a-timestamp",
            },
          },
        },
      }).valid,
    ).toBe(false);
    expect(validateDakotaOperatorStateEnvelope({ ...valid, updated_at: "yesterday" }).valid).toBe(
      false,
    );
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: { "bad/key": storedRecord() },
      }).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorStateEnvelope({
        ...valid,
        records: {
          "nyc_dcwp:nyc-dcwp:12345": storedRecord(),
        },
      }).valid,
    ).toBe(false);

    const tooMany = Object.fromEntries(
      Array.from({ length: DAKOTA_OPERATOR_RECORD_LIMIT + 1 }, (_, index) => [
        `nys_dos:nys-dos:${index}`,
        storedRecord(),
      ]),
    );
    expect(
      validateDakotaOperatorStateEnvelope({
        schema_version: "dakota.operator-state.v1",
        updated_at: UPDATED_AT,
        records: tooMany,
      }).valid,
    ).toBe(false);

    const oversized = Object.fromEntries(
      Array.from({ length: DAKOTA_OPERATOR_RECORD_LIMIT }, (_, index) => [
        `nys_dos:nys-dos:${index}`,
        storedRecord({
          identity: identity({ sourceId: `nys-dos:${index}` }),
          draft: "x".repeat(6_000),
        }),
      ]),
    );
    const oversizedResult = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: oversized,
    });
    expect(new TextEncoder().encode(JSON.stringify({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: oversized,
    })).byteLength).toBeGreaterThan(DAKOTA_OPERATOR_STATE_MAX_BYTES);
    expect(oversizedResult).toEqual({
      valid: false,
      error: "Operator-state envelope is oversized.",
    });
  });

  it("normalizes historical realized revenue into one cleared-cash truth", () => {
    const migrated = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v1",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedRecord({ status: "won", actualRevenue: 2_500 }),
      },
    });
    expect(migrated.valid).toBe(true);
    if (!migrated.valid) return;
    const migratedRecord = migrated.value.records["nys_dos:nys-dos:12345"];
    expect(migrated.value.schema_version).toBe("dakota.operator-state.v3");
    expect(migratedRecord?.commercialClose).toEqual(
      expect.objectContaining({ amountDue: 2_500, amountPaid: 2_500, balance: 0, paidDate: "2026-08-03" }),
    );
    expect(migratedRecord?.actualRevenue).toBe(2_500);
    expect(migratedRecord?.milestones.paidAt).toBe(UPDATED_AT);
    expect(migratedRecord?.selectedContactId).toBeNull();
    expect(migratedRecord?.tasks).toEqual([]);
  });

  it("normalizes v2 envelopes to v3 without inventing contact selection or work", () => {
    const migrated = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v2",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedV2Record({ status: "research_ready" }),
      },
    });
    expect(migrated.valid).toBe(true);
    if (!migrated.valid) return;
    expect(migrated.value.schema_version).toBe("dakota.operator-state.v3");
    expect(migrated.value.records["nys_dos:nys-dos:12345"]).toEqual(
      expect.objectContaining({
        status: "research_ready",
        selectedContactId: null,
        tasks: [],
      }),
    );

    const legacyCombination = {
      activityId: "550e8400-e29b-41d4-a716-446655440010",
      channel: "email",
      type: "note",
      outcome: "recorded",
      note: "Legacy v2 evidence remains durable.",
      occurredAt: UPDATED_AT,
      followUpAt: null,
    };
    const migratedLegacyActivity = validateDakotaOperatorStateEnvelope({
      schema_version: "dakota.operator-state.v2",
      updated_at: UPDATED_AT,
      records: {
        "nys_dos:nys-dos:12345": storedV2Record({ activities: [legacyCombination] }),
      },
    });
    expect(migratedLegacyActivity.valid).toBe(true);
    if (migratedLegacyActivity.valid) {
      const previous = migratedLegacyActivity.value.records["nys_dos:nys-dos:12345"];
      expect(
        previous?.activities,
      ).toEqual([{
        ...legacyCombination,
        taskId: null,
        contactId: null,
      }]);
      expect(
        validateDakotaOperatorTransition(
          validatedInput({
            notes: "Edited after migration.",
            activities: [legacyCombination],
          }),
          previous,
          new Date(UPDATED_AT),
        ).valid,
      ).toBe(true);
    }
  });

  it("enforces the server-owned activity type, channel, and outcome matrix", () => {
    let sequence = 1;
    for (const [type, channels] of Object.entries(DAKOTA_ACTIVITY_COMPATIBILITY)) {
      for (const [channel, outcomes] of Object.entries(channels)) {
        for (const outcome of outcomes ?? []) {
          const suffix = sequence.toString(16).padStart(12, "0");
          sequence += 1;
          const validation = validateDakotaOperatorRecordInput(record({
              activities: [{
                activityId: "550e8400-e29b-41d4-a716-" + suffix,
                channel,
                type,
                outcome,
                note: "Evidence recorded by the operator.",
                occurredAt: UPDATED_AT,
                followUpAt: null,
              }],
            }));
          expect(validation.valid, type + "/" + channel + "/" + outcome).toBe(true);
          if (validation.valid) {
            const transition = validateDakotaOperatorTransition(
              validation.value,
              undefined,
              new Date(UPDATED_AT),
            );
            if (type === "note") {
              expect(transition.valid, type + "/" + channel + "/" + outcome).toBe(true);
            } else {
              expect(transition, type + "/" + channel + "/" + outcome).toEqual({
                valid: false,
                error: "New non-note activity evidence must reference one durable task and exact usable contact route.",
              });
            }
          }
        }
      }
    }

    for (const activity of [
      { channel: "email", type: "note", outcome: "recorded" },
      { channel: "internal", type: "outreach", outcome: "sent" },
      { channel: "email", type: "payment_received", outcome: "paid" },
      { channel: "internal", type: "follow_up", outcome: "sent" },
      { channel: "email", type: "outreach", outcome: "connected" },
    ]) {
      const validation = validateDakotaOperatorRecordInput(record({
        activities: [{
          activityId: "550e8400-e29b-41d4-a716-446655440010",
          note: "Evidence recorded by the operator.",
          occurredAt: UPDATED_AT,
          followUpAt: null,
          ...activity,
        }],
      }));
      expect(validation.valid).toBe(true);
      if (validation.valid) {
        expect(
          validateDakotaOperatorTransition(
            validation.value,
            undefined,
            new Date(UPDATED_AT),
          ),
        ).toEqual({
          valid: false,
          error: "Activity type, channel, and outcome are incompatible.",
        });
      }
    }
  });

  it("normalizes legacy activity provenance and rejects partial v3 shapes", () => {
    const legacy = {
      activityId: "550e8400-e29b-41d4-a716-446655440010",
      channel: "internal",
      type: "note",
      outcome: "recorded",
      note: "Legacy evidence remains readable.",
      occurredAt: UPDATED_AT,
      followUpAt: null,
    };
    const normalized = validateDakotaOperatorRecordInput(record({ activities: [legacy] }));
    expect(normalized.valid).toBe(true);
    if (normalized.valid) {
      expect(normalized.value.activities).toEqual([{
        ...legacy,
        taskId: null,
        contactId: null,
      }]);
    }

    expect(validateDakotaOperatorRecordInput(record({ activities: [activity()] })).valid).toBe(true);
    const { contactId: _contactId, ...partial } = activity();
    expect(validateDakotaOperatorRecordInput(record({ activities: [partial] }))).toEqual({
      valid: false,
      error: "Activity has an invalid shape.",
    });

    const linkedNote = activity({ taskId: TASK_ID });
    const previous = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      tasks: [task()],
      activities: [linkedNote],
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "research_ready",
      tasks: [task()],
      activities: [{ ...linkedNote, taskId: null }],
    }), previous, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "Existing activities are immutable.",
    });
  });

  it("requires exact durable provenance for every new non-note activity", () => {
    const contact = consentedEmailContact();
    const outreachTask = task({
      type: "outreach",
      channel: "email",
      contactId: CONTACT_ID,
    });
    const linkedOutreach = activity({
      taskId: TASK_ID,
      contactId: CONTACT_ID,
      channel: "email",
      type: "outreach",
      outcome: "sent",
    });
    const valid = validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [outreachTask],
      activities: [linkedOutreach],
    });
    const taskWasPersisted = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [outreachTask],
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(valid, taskWasPersisted, new Date(UPDATED_AT)).valid).toBe(true);

    const unlinked = validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [outreachTask],
      activities: [{ ...linkedOutreach, taskId: null, contactId: null }],
    });
    expect(validateDakotaOperatorTransition(unlinked, taskWasPersisted, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "New non-note activity evidence must reference one durable task and exact usable contact route.",
    });

    expect(validateDakotaOperatorRecordInput(record({
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [outreachTask],
      activities: [{
        ...linkedOutreach,
        taskId: "550e8400-e29b-41d4-a716-446655440099",
      }],
    }))).toEqual({
      valid: false,
      error: "Activity provenance must reference one durable task and its exact usable contact route.",
    });

    expect(validateDakotaOperatorRecordInput(record({
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "follow_up",
        channel: "email",
        contactId: CONTACT_ID,
      })],
      activities: [linkedOutreach],
    }))).toEqual({
      valid: false,
      error: "Activity provenance must reference one durable task and its exact usable contact route.",
    });

    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{ ...contact, consentClassification: "public_business" }],
      selectedContactId: CONTACT_ID,
      tasks: [outreachTask],
      activities: [linkedOutreach],
    }))).toEqual({
      valid: false,
      error: "Email tasks require explicit-inquiry or existing-relationship consent.",
    });
  });

  it("links new evidence only to the current task and within that task's lifetime", () => {
    const contact = consentedEmailContact();
    const openOutreach = task({
      type: "outreach",
      channel: "email",
      contactId: CONTACT_ID,
      createdAt: "2026-08-03T11:00:00.000Z",
    });
    const linkedOutreach = activity({
      taskId: TASK_ID,
      contactId: CONTACT_ID,
      channel: "email",
      type: "outreach",
      outcome: "sent",
    });
    const previous = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [openOutreach],
    }), UPDATED_AT);
    const completedOutreach = {
      ...openOutreach,
      status: "completed" as const,
      resolvedAt: UPDATED_AT,
      resolutionNote: "Outreach was sent and logged.",
    };
    const completedThisSave = validatedInput({
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [completedOutreach],
      activities: [linkedOutreach],
    });
    expect(
      validateDakotaOperatorTransition(completedThisSave, previous, new Date(UPDATED_AT)).valid,
    ).toBe(true);

    const oldCompletedRecord = createDakotaOperatorRecord(validatedInput({
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [completedOutreach],
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(
      completedThisSave,
      oldCompletedRecord,
      new Date(UPDATED_AT),
    )).toEqual({
      valid: false,
      error: "New activity evidence must reference the task open for this work.",
    });

    const secondContactId = "550e8400-e29b-41d4-a716-446655440002";
    const secondContact = consentedEmailContact({
      contactId: secondContactId,
      value: "second@example.com",
    });
    const wrongSelection = validatedInput({
      contacts: [contact, secondContact],
      selectedContactId: secondContactId,
      tasks: [completedOutreach],
      activities: [linkedOutreach],
    });
    expect(validateDakotaOperatorTransition(wrongSelection, previous, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "New external activity evidence must use selectedContactId exactly.",
    });

    for (const [createdAt, resolvedAt, occurredAt] of [
      ["2026-08-03T11:00:00.000Z", null, "2026-08-03T10:54:59.999Z"],
      ["2026-08-03T10:00:00.000Z", "2026-08-03T11:00:00.000Z", "2026-08-03T11:05:00.001Z"],
    ] as const) {
      const status = resolvedAt === null ? "open" : "completed";
      expect(validateDakotaOperatorRecordInput(record({
        status: status === "open" ? "research_ready" : "early_signal",
        contacts: [contact],
        selectedContactId: CONTACT_ID,
        tasks: [task({
          type: "outreach",
          channel: "email",
          contactId: CONTACT_ID,
          status,
          createdAt,
          resolvedAt,
          resolutionNote: resolvedAt === null ? "" : "Outreach task completed.",
        })],
        activities: [{ ...linkedOutreach, occurredAt }],
      }))).toEqual({
        valid: false,
        error: "Activity provenance must reference one durable task and its exact usable contact route.",
      });
    }
  });

  it("does not let unlinked legacy activity unlock a new stage, while grandfathering reached stages", () => {
    const contact = consentedEmailContact();
    const researchTask = task();
    const legacyActivities = [
      activity({
        activityId: "550e8400-e29b-41d4-a716-446655440010",
        channel: "email",
        type: "outreach",
        outcome: "sent",
      }),
      activity({
        activityId: "550e8400-e29b-41d4-a716-446655440011",
        channel: "email",
        type: "reply",
        outcome: "replied",
      }),
    ].map(({ taskId: _taskId, contactId: _contactId, ...legacy }) => legacy);
    const researchReady = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [researchTask],
      activities: legacyActivities,
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "replied",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [researchTask],
      activities: legacyActivities,
    }), researchReady, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "Pursuing requires a recorded contact activity.",
    });

    const alreadyReplied = createDakotaOperatorRecord(validatedInput({
      status: "replied",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [researchTask],
      activities: legacyActivities,
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "replied",
      notes: "Edited after the v3 migration without inventing task links.",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [researchTask],
      activities: legacyActivities,
    }), alreadyReplied, new Date(UPDATED_AT)).valid).toBe(true);
  });

  it("requires fresh linked evidence for commercial changes and keeps established truth lossless", () => {
    const contact = consentedEmailContact();
    const cases: Array<{
      name: string;
      taskType: DakotaTask["type"];
      taskChannel: DakotaTask["channel"];
      activity: Partial<DakotaActivity>;
      initialClose: ReturnType<typeof createEmptyDakotaCommercialClose>;
      changedClose: ReturnType<typeof createEmptyDakotaCommercialClose>;
      clearedClose: ReturnType<typeof createEmptyDakotaCommercialClose>;
      missingEvidenceError: string;
    }> = [
      {
        name: "proposal",
        taskType: "proposal",
        taskChannel: "proposal",
        activity: { channel: "proposal", type: "proposal_sent", outcome: "sent" },
        initialClose: {
          ...createEmptyDakotaCommercialClose(),
          proposalRef: "Proposal 1001",
          proposalAmount: 10_000,
          proposalSentDate: "2026-08-02",
        },
        changedClose: {
          ...createEmptyDakotaCommercialClose(),
          proposalRef: "Proposal 1001",
          proposalAmount: 11_000,
          proposalSentDate: "2026-08-02",
        },
        clearedClose: {
          ...createEmptyDakotaCommercialClose(),
          proposalAmount: 10_000,
          proposalSentDate: "2026-08-02",
        },
        missingEvidenceError: "Changed proposal terms require newly appended linked proposal-sent evidence.",
      },
      {
        name: "signature",
        taskType: "proposal",
        taskChannel: "proposal",
        activity: { channel: "contract", type: "contract_signed", outcome: "won" },
        initialClose: { ...createEmptyDakotaCommercialClose(), signedDate: "2026-08-02" },
        changedClose: { ...createEmptyDakotaCommercialClose(), signedDate: "2026-08-03" },
        clearedClose: createEmptyDakotaCommercialClose(),
        missingEvidenceError: "Changed signed date requires newly appended linked contract-signed evidence.",
      },
      {
        name: "invoice",
        taskType: "invoice",
        taskChannel: "invoice",
        activity: { channel: "invoice", type: "invoice_sent", outcome: "sent" },
        initialClose: {
          ...createEmptyDakotaCommercialClose(),
          invoiceRef: "Invoice 1001",
          amountDue: 10_000,
          balance: 10_000,
        },
        changedClose: {
          ...createEmptyDakotaCommercialClose(),
          invoiceRef: "Invoice 1001",
          amountDue: 11_000,
          balance: 11_000,
        },
        clearedClose: {
          ...createEmptyDakotaCommercialClose(),
          amountDue: 10_000,
          balance: 10_000,
        },
        missingEvidenceError: "Changed invoice terms require newly appended linked invoice-sent evidence.",
      },
      {
        name: "cleared cash",
        taskType: "payment",
        taskChannel: "payment",
        activity: { channel: "payment", type: "payment_received", outcome: "paid" },
        initialClose: {
          ...createEmptyDakotaCommercialClose(),
          amountPaid: 500,
          paidDate: "2026-08-02",
        },
        changedClose: {
          ...createEmptyDakotaCommercialClose(),
          amountPaid: 750,
          paidDate: "2026-08-03",
        },
        clearedClose: {
          ...createEmptyDakotaCommercialClose(),
          amountPaid: 500,
        },
        missingEvidenceError: "Changed cleared cash requires newly appended linked payment-received evidence.",
      },
    ];

    for (const commercialCase of cases) {
      const durableTask = task({
        type: commercialCase.taskType,
        channel: commercialCase.taskChannel,
        contactId: CONTACT_ID,
        createdAt: "2026-08-03T11:00:00.000Z",
      });
      const firstEvidence = activity({
        ...commercialCase.activity,
        taskId: TASK_ID,
        contactId: CONTACT_ID,
      });
      const initial = validatedInput({
        status: "research_ready",
        contacts: [contact],
        selectedContactId: CONTACT_ID,
        tasks: [durableTask],
        activities: [firstEvidence],
        commercialClose: commercialCase.initialClose,
      });
      const taskWasPersisted = createDakotaOperatorRecord(validatedInput({
        status: "research_ready",
        contacts: [contact],
        selectedContactId: CONTACT_ID,
        tasks: [durableTask],
      }), UPDATED_AT);
      expect(
        validateDakotaOperatorTransition(initial, taskWasPersisted, new Date(UPDATED_AT)).valid,
        commercialCase.name + " initial evidence",
      ).toBe(true);
      const previous = createDakotaOperatorRecord(initial, UPDATED_AT, taskWasPersisted);

      expect(
        validateDakotaOperatorTransition(validatedInput({
          status: "research_ready",
          contacts: [contact],
          selectedContactId: CONTACT_ID,
          tasks: [durableTask],
          activities: [firstEvidence],
          commercialClose: commercialCase.changedClose,
        }), previous, new Date(UPDATED_AT)),
        commercialCase.name + " stale evidence",
      ).toEqual({ valid: false, error: commercialCase.missingEvidenceError });

      const correctionEvidence = activity({
        ...commercialCase.activity,
        activityId: "550e8400-e29b-41d4-a716-446655440011",
        taskId: TASK_ID,
        contactId: CONTACT_ID,
        note: "Operator-recorded corrective commercial evidence.",
      });
      expect(
        validateDakotaOperatorTransition(validatedInput({
          status: "research_ready",
          contacts: [contact],
          selectedContactId: CONTACT_ID,
          tasks: [durableTask],
          activities: [firstEvidence, correctionEvidence],
          commercialClose: commercialCase.changedClose,
        }), previous, new Date(UPDATED_AT)).valid,
        commercialCase.name + " correction evidence",
      ).toBe(true);

      expect(
        validateDakotaOperatorTransition(validatedInput({
          status: "research_ready",
          contacts: [contact],
          selectedContactId: CONTACT_ID,
          tasks: [durableTask],
          activities: [firstEvidence, correctionEvidence],
          commercialClose: commercialCase.clearedClose,
        }), previous, new Date(UPDATED_AT)),
        commercialCase.name + " erasure",
      ).toEqual({
        valid: false,
        error: "Established commercial truth cannot be cleared; append corrective evidence instead.",
      });

      expect(
        validateDakotaOperatorTransition(initial, previous, new Date(UPDATED_AT)).valid,
        commercialCase.name + " unchanged",
      ).toBe(true);
    }

    const paymentCase = cases.at(-1);
    if (!paymentCase) throw new Error("payment fixture missing");
    const paymentTask = task({
      type: "payment",
      channel: "payment",
      contactId: CONTACT_ID,
      createdAt: "2026-08-03T11:00:00.000Z",
    });
    const paymentEvidence = activity({
      ...paymentCase.activity,
      taskId: TASK_ID,
      contactId: CONTACT_ID,
    });
    const paidInput = validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [paymentTask],
      activities: [paymentEvidence],
      commercialClose: paymentCase.initialClose,
    });
    const paidPrevious = createDakotaOperatorRecord(paidInput, UPDATED_AT);
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [paymentTask],
      activities: [paymentEvidence, activity({
        ...paymentCase.activity,
        activityId: "550e8400-e29b-41d4-a716-446655440011",
        taskId: TASK_ID,
        contactId: CONTACT_ID,
      })],
      commercialClose: {
        ...paymentCase.initialClose,
        amountPaid: 499,
      },
    }), paidPrevious, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "Cleared cash cannot decrease; record a separate correction outside Dakota.",
    });
  });

  it("allows commercial dates through UTC tomorrow and rejects later changed dates", () => {
    const contact = consentedEmailContact();
    const cases: Array<{
      name: string;
      taskType: DakotaTask["type"];
      taskChannel: DakotaTask["channel"];
      activity: Partial<DakotaActivity>;
      close: (date: string) => ReturnType<typeof createEmptyDakotaCommercialClose>;
    }> = [
      {
        name: "proposal sent",
        taskType: "proposal",
        taskChannel: "proposal",
        activity: { channel: "proposal", type: "proposal_sent", outcome: "sent" },
        close: (date) => ({
          ...createEmptyDakotaCommercialClose(),
          proposalRef: "Proposal 1002",
          proposalAmount: 12_500,
          proposalSentDate: date,
        }),
      },
      {
        name: "signed",
        taskType: "proposal",
        taskChannel: "proposal",
        activity: { channel: "contract", type: "contract_signed", outcome: "won" },
        close: (date) => ({ ...createEmptyDakotaCommercialClose(), signedDate: date }),
      },
      {
        name: "paid",
        taskType: "payment",
        taskChannel: "payment",
        activity: { channel: "payment", type: "payment_received", outcome: "paid" },
        close: (date) => ({
          ...createEmptyDakotaCommercialClose(),
          amountPaid: 500,
          paidDate: date,
        }),
      },
    ];

    for (const commercialCase of cases) {
      const durableTask = task({
        type: commercialCase.taskType,
        channel: commercialCase.taskChannel,
        contactId: CONTACT_ID,
      });
      const previous = createDakotaOperatorRecord(validatedInput({
        status: "research_ready",
        contacts: [contact],
        selectedContactId: CONTACT_ID,
        tasks: [durableTask],
      }), UPDATED_AT);
      const evidence = activity({
        ...commercialCase.activity,
        taskId: durableTask.taskId,
        contactId: CONTACT_ID,
      });
      const transitionFor = (date: string) => validateDakotaOperatorTransition(validatedInput({
        status: "research_ready",
        contacts: [contact],
        selectedContactId: CONTACT_ID,
        tasks: [durableTask],
        activities: [evidence],
        commercialClose: commercialCase.close(date),
      }), previous, new Date(UPDATED_AT));

      expect(transitionFor("2026-08-04").valid, commercialCase.name + " UTC tomorrow").toBe(true);
      expect(transitionFor("2026-08-05"), commercialCase.name + " too far future").toEqual({
        valid: false,
        error: "Commercial dates cannot be later than the next UTC calendar day.",
      });
    }

    const historicalInput = validatedInput({
      status: "research_ready",
      tasks: [task()],
      commercialClose: {
        ...createEmptyDakotaCommercialClose(),
        signedDate: "2026-08-10",
      },
    });
    const historical = createDakotaOperatorRecord(historicalInput, UPDATED_AT);
    expect(validateDakotaOperatorTransition(
      { ...historicalInput, notes: "Historical date left unchanged." },
      historical,
      new Date(UPDATED_AT),
    ).valid).toBe(true);
  });

  it("requires paid work to hand off from payment into one aligned onboarding task", () => {
    const contact = consentedEmailContact();
    const invoiceTask = task({
      taskId: "550e8400-e29b-41d4-a716-446655440200",
      type: "invoice",
      channel: "invoice",
      contactId: CONTACT_ID,
      status: "completed",
      createdAt: "2026-08-03T09:00:00.000Z",
      resolvedAt: "2026-08-03T10:00:00.000Z",
      resolutionNote: "Invoice was sent.",
    });
    const paymentTask = task({
      taskId: "550e8400-e29b-41d4-a716-446655440201",
      type: "payment",
      channel: "payment",
      contactId: CONTACT_ID,
      createdAt: "2026-08-03T10:00:00.000Z",
    });
    const invoiceEvidence = activity({
      activityId: "550e8400-e29b-41d4-a716-446655440020",
      taskId: invoiceTask.taskId,
      contactId: CONTACT_ID,
      channel: "invoice",
      type: "invoice_sent",
      outcome: "sent",
      occurredAt: "2026-08-03T09:30:00.000Z",
    });
    const previousClose = {
      ...createEmptyDakotaCommercialClose(),
      proposalRef: "Proposal 2001",
      proposalAmount: 1_000,
      proposalSentDate: "2026-08-02",
      signedDate: "2026-08-02",
      invoiceRef: "Invoice 2001",
      amountDue: 1_000,
      balance: 1_000,
    };
    const previous = createDakotaOperatorRecord(validatedInput({
      status: "won",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [invoiceTask, paymentTask],
      activities: [invoiceEvidence],
      commercialClose: previousClose,
    }), UPDATED_AT);
    const paymentEvidence = activity({
      activityId: "550e8400-e29b-41d4-a716-446655440021",
      taskId: paymentTask.taskId,
      contactId: CONTACT_ID,
      channel: "payment",
      type: "payment_received",
      outcome: "paid",
    });
    const completedPaymentTask = {
      ...paymentTask,
      status: "completed" as const,
      resolvedAt: UPDATED_AT,
      resolutionNote: "Payment cleared in the bank.",
    };
    const onboardingTitle = "Schedule the paid kickoff.";
    const onboardingTask = task({
      taskId: "550e8400-e29b-41d4-a716-446655440202",
      type: "onboarding",
      channel: "internal",
      contactId: null,
      title: onboardingTitle,
    });
    const paidClose = {
      ...previousClose,
      amountPaid: 1_000,
      paidDate: "2026-08-03",
      balance: 0,
      onboardingNextAction: onboardingTitle,
    };
    const paid = validatedInput({
      status: "paid",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [invoiceTask, completedPaymentTask, onboardingTask],
      activities: [invoiceEvidence, paymentEvidence],
      commercialClose: paidClose,
    });
    expect(validateDakotaOperatorTransition(paid, previous, new Date(UPDATED_AT)).valid).toBe(true);

    const paymentStillOpen = validatedInput({
      status: "paid",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [invoiceTask, paymentTask],
      activities: [invoiceEvidence, paymentEvidence],
      commercialClose: paidClose,
    });
    expect(validateDakotaOperatorTransition(paymentStillOpen, previous, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "Paid requires one open internal onboarding task whose title exactly matches the onboarding next action.",
    });
    expect(validateDakotaOperatorTransition(validatedInput({
      ...paid,
      commercialClose: { ...paidClose, onboardingNextAction: "Send a different instruction." },
    }), previous, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "Paid requires one open internal onboarding task whose title exactly matches the onboarding next action.",
    });

    const legacyPaid = createDakotaOperatorRecord(paymentStillOpen, UPDATED_AT);
    expect(validateDakotaOperatorTransition(
      { ...paymentStillOpen, notes: "Legacy paid loop remains editable while flagged for repair." },
      legacyPaid,
      new Date(UPDATED_AT),
    ).valid).toBe(true);
  });

  it("requires selected contacts and task contact routes to be usable and compatible", () => {
    expect(validateDakotaOperatorRecordInput(record({ selectedContactId: CONTACT_ID })).valid).toBe(true);
    expect(validateDakotaOperatorRecordInput(record({
      selectedContactId: CONTACT_ID,
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "website_form",
        value: "https://example.com/contact",
      }],
    })).valid).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(record({
        selectedContactId: "550e8400-e29b-41d4-a716-446655440099",
      })).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(record({
        selectedContactId: CONTACT_ID,
        contacts: [{
          ...(record().contacts as Record<string, unknown>[])[0],
          consentClassification: "unknown",
        }],
      })).valid,
    ).toBe(false);

    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        consentClassification: "explicit_inquiry",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "email",
        contactId: CONTACT_ID,
      })],
    })).valid).toBe(true);
    expect(validateDakotaOperatorRecordInput(record({
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "email",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "Email tasks require explicit-inquiry or existing-relationship consent.",
    });
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "phone",
        value: "+1 (212) 555-0199",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "phone",
        contactId: CONTACT_ID,
      })],
    })).valid).toBe(true);
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "sms",
        value: "+1 (212) 555-0199",
        consentClassification: "explicit_inquiry",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "sms",
        contactId: CONTACT_ID,
      })],
    })).valid).toBe(true);
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "sms",
        value: "+1 (212) 555-0199",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "sms",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "SMS tasks require explicit-inquiry or existing-relationship consent.",
    });
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "phone",
        value: "+1 (212) 555-0199",
        consentClassification: "explicit_inquiry",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "sms",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "Task channel does not match its verified contact route.",
    });
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        channel: "sms",
        value: "+1 (212) 555-0199",
        consentClassification: "explicit_inquiry",
      }],
      selectedContactId: CONTACT_ID,
      tasks: [task({
        type: "outreach",
        channel: "phone",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "Task channel does not match its verified contact route.",
    });
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [{
        ...(record().contacts as Record<string, unknown>[])[0],
        consentClassification: "explicit_inquiry",
      }],
      tasks: [task({
        type: "outreach",
        channel: "email",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "The open direct-channel task must use selectedContactId.",
    });
    const secondContactId = "550e8400-e29b-41d4-a716-446655440002";
    expect(validateDakotaOperatorRecordInput(record({
      contacts: [
        {
          ...(record().contacts as Record<string, unknown>[])[0],
          consentClassification: "explicit_inquiry",
        },
        {
          ...(record().contacts as Record<string, unknown>[])[0],
          contactId: secondContactId,
          value: "second@example.com",
          consentClassification: "explicit_inquiry",
        },
      ],
      selectedContactId: secondContactId,
      tasks: [task({
        type: "outreach",
        channel: "email",
        contactId: CONTACT_ID,
      })],
    }))).toEqual({
      valid: false,
      error: "The open direct-channel task must use selectedContactId.",
    });
    for (const invalidTask of [
      task({ contactId: CONTACT_ID }),
      task({ type: "outreach", channel: "email", contactId: null }),
      task({ type: "outreach", channel: "sms", contactId: CONTACT_ID }),
      task({ type: "meeting", channel: "email", contactId: CONTACT_ID }),
    ]) {
      expect(validateDakotaOperatorRecordInput(record({ tasks: [invalidTask] })).valid).toBe(false);
    }
  });

  it("requires every new non-internal task to use the exact previously saved selected route", () => {
    const contact = consentedEmailContact();
    const previousTask = task();
    const previous = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [previousTask],
    }), UPDATED_AT);
    const completedPreviousTask = {
      ...previousTask,
      status: "completed" as const,
      resolvedAt: UPDATED_AT,
      resolutionNote: "Research was completed.",
    };
    const routedTask = task({
      taskId: "550e8400-e29b-41d4-a716-446655440101",
      type: "proposal",
      channel: "proposal",
      contactId: CONTACT_ID,
    });
    const next = validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [completedPreviousTask, routedTask],
    });
    expect(validateDakotaOperatorTransition(next, previous, new Date(UPDATED_AT)).valid).toBe(true);

    const missingRoute = validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [completedPreviousTask, { ...routedTask, contactId: null }],
    });
    expect(validateDakotaOperatorTransition(missingRoute, previous, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "New non-internal tasks require the exact selected contact route to be persisted first.",
    });
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [routedTask],
    }), undefined, new Date(UPDATED_AT))).toEqual({
      valid: false,
      error: "New non-internal tasks require the exact selected contact route to be persisted first.",
    });

    const legacyTask = task({
      type: "proposal",
      channel: "proposal",
      contactId: null,
    });
    const legacy = createDakotaOperatorRecord(validatedInput({
      status: "research_ready",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [legacyTask],
    }), UPDATED_AT);
    expect(validateDakotaOperatorTransition(validatedInput({
      status: "research_ready",
      notes: "Legacy task remains visible until repaired.",
      contacts: [contact],
      selectedContactId: CONTACT_ID,
      tasks: [legacyTask],
    }), legacy, new Date(UPDATED_AT)).valid).toBe(true);
  });

  it("bounds task history and permits at most one open task", () => {
    const resolvedTasks = Array.from({ length: DAKOTA_TASK_LIMIT }, (_, index) => task({
      taskId: "550e8400-e29b-41d4-a716-" + index.toString(16).padStart(12, "0"),
      status: "completed",
      resolvedAt: UPDATED_AT,
      resolutionNote: "Completed.",
    }));
    expect(validateDakotaOperatorRecordInput(record({ tasks: resolvedTasks })).valid).toBe(true);
    expect(validateDakotaOperatorRecordInput(record({
      tasks: [task({ status: "completed", resolvedAt: UPDATED_AT })],
    }))).toEqual({
      valid: false,
      error: "Resolved tasks require a factual resolutionNote.",
    });
    expect(
      validateDakotaOperatorRecordInput(record({
        tasks: [...resolvedTasks, task({ taskId: "550e8400-e29b-41d4-a716-ffffffffffff" })],
      })).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorRecordInput(record({
        tasks: [task(), task({ taskId: "550e8400-e29b-41d4-a716-446655440101" })],
      })).valid,
    ).toBe(false);
  });

  it("requires exactly one open task for live work and none for terminal or early stages", () => {
    for (const status of [
      "research_ready", "pursuit_ready", "pursuing", "replied", "meeting", "proposal",
      "won", "paid", "snoozed",
    ] as const) {
      const result = validateDakotaOperatorTransition(
        validatedInput({ status, dueDate: status === "snoozed" ? "2026-08-15" : "", tasks: [] }),
        undefined,
        new Date(UPDATED_AT),
      );
      expect(result).toEqual({
        valid: false,
        error: "This stage requires exactly one open task.",
      });
    }
    for (const status of ["early_signal", "lost", "not_fit", "do_not_contact"] as const) {
      const result = validateDakotaOperatorTransition(
        validatedInput({
          status,
          winLossReason: status === "lost" ? "Budget changed." : "",
          tasks: [task()],
        }),
        undefined,
        new Date(UPDATED_AT),
      );
      expect(result).toEqual({
        valid: false,
        error: "This stage cannot retain an open task.",
      });
    }
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready", tasks: [task()] }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "snoozed",
          dueDate: "2026-08-15",
          tasks: [task({ dueAt: "2026-08-15T17:00:00-04:00" })],
        }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
    for (const dueAt of [null, "2026-08-16T09:00:00-04:00"]) {
      expect(
        validateDakotaOperatorTransition(
          validatedInput({
            status: "snoozed",
            dueDate: "2026-08-15",
            tasks: [task({ dueAt })],
          }),
          undefined,
          new Date(UPDATED_AT),
        ),
      ).toEqual({
        valid: false,
        error: "A snoozed record's open task dueAt must match its wake date.",
      });
    }
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "pursuit_ready", tasks: [task()] }),
        undefined,
        new Date(UPDATED_AT),
      ),
    ).toEqual({
      valid: false,
      error: "Active pursuit requires a selected verified usable contact route.",
    });
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "pursuit_ready",
          selectedContactId: CONTACT_ID,
          tasks: [task()],
        }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("keeps task order and instructions durable with only one-way resolution", () => {
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          tasks: [task({
            status: "completed",
            resolvedAt: UPDATED_AT,
            resolutionNote: "Pre-resolved before insertion.",
          })],
        }),
        undefined,
        new Date(UPDATED_AT),
      ),
    ).toEqual({
      valid: false,
      error: "New tasks must enter the ledger as open.",
    });

    const previous = createDakotaOperatorRecord(
      validatedInput({ status: "research_ready", tasks: [task()] }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "early_signal", tasks: [] }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "research_ready",
          tasks: [task({ title: "Rewrite the existing task." })],
        }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);

    const resolved = task({
      status: "completed",
      resolvedAt: UPDATED_AT,
      resolutionNote: "Research completed.",
    });
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "early_signal", tasks: [resolved] }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "research_ready",
          tasks: [
            resolved,
            task({
              taskId: "550e8400-e29b-41d4-a716-446655440101",
              title: "Prepare the next evidence-backed action.",
            }),
          ],
        }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);

    const resolvedRecord = createDakotaOperatorRecord(
      validatedInput({ status: "early_signal", tasks: [resolved] }),
      UPDATED_AT,
      previous,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready", tasks: [task()] }),
        resolvedRecord,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "early_signal",
          tasks: [{ ...resolved, resolutionNote: "Rewritten resolution." }],
        }),
        resolvedRecord,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);

    const orderedPrevious = createDakotaOperatorRecord(
      validatedInput({
        status: "research_ready",
        tasks: [
          task({
            taskId: "550e8400-e29b-41d4-a716-446655440099",
            status: "completed",
            resolvedAt: UPDATED_AT,
            resolutionNote: "Completed before the next task opened.",
          }),
          task(),
        ],
      }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready", tasks: [...orderedPrevious.tasks].reverse() }),
        orderedPrevious,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
  });

  it("rejects future task creation and resolution timestamps", () => {
    const future = "2026-08-03T12:05:00.001Z";
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready", tasks: [task({ createdAt: future })] }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);

    const previous = createDakotaOperatorRecord(
      validatedInput({ status: "research_ready", tasks: [task()] }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          status: "early_signal",
          tasks: [task({
            status: "skipped",
            resolvedAt: future,
            resolutionNote: "No longer relevant.",
          })],
        }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
  });

  it("enforces immutable durable contacts and immutable append-only activities", () => {
    const firstActivity = {
      activityId: "550e8400-e29b-41d4-a716-446655440010",
      channel: "internal",
      type: "note",
      outcome: "recorded",
      note: "Initial operator note.",
      occurredAt: UPDATED_AT,
      followUpAt: null,
    };
    const previous = createDakotaOperatorRecord(
      validatedInput({ activities: [firstActivity] }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ contacts: [], activities: [firstActivity] }),
        previous,
        new Date(UPDATED_AT),
      ),
    ).toEqual(expect.objectContaining({ valid: false }));
    const priorContact = (record().contacts as Record<string, unknown>[])[0] ?? {};
    for (const contactChanges of [
      { name: "Rewritten Name" },
      { role: "Rewritten Role" },
      { value: "changed@example.com" },
      { sourceUrl: "https://example.com/other-source" },
      { verifiedAt: "2026-08-02" },
      { consentClassification: "existing_relationship" },
      { channel: "website_form", value: "https://example.com/contact-form" },
    ]) {
      const next = validatedInput({
        contacts: [{ ...priorContact, ...contactChanges }],
        activities: [firstActivity],
      });
      expect(
        validateDakotaOperatorTransition(next, previous, new Date(UPDATED_AT)),
      ).toEqual({
        valid: false,
        error: "Persisted verified contacts are immutable; append a new contact route instead.",
      });
    }
    expect(
      validateDakotaOperatorTransition(
        validatedInput({
          contacts: [
            priorContact,
            {
              ...priorContact,
              contactId: "550e8400-e29b-41d4-a716-446655440002",
              value: "new-route@example.com",
            },
          ],
          activities: [firstActivity],
        }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ activities: [{ ...firstActivity, note: "Rewritten note." }] }),
        previous,
        new Date(UPDATED_AT),
      ),
    ).toEqual(expect.objectContaining({ valid: false }));
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ activities: [firstActivity, {
          ...firstActivity,
          activityId: "550e8400-e29b-41d4-a716-446655440011",
          note: "Appended note.",
        }] }),
        previous,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("keeps unknown and do-not-contact routes research-only and protects DNC transitions", () => {
    const unknownContact = {
      ...(record().contacts as Record<string, unknown>[])[0],
      consentClassification: "unknown",
    };
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "pursuit_ready", contacts: [unknownContact] }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);

    const dnc = createDakotaOperatorRecord(
      validatedInput({ status: "do_not_contact" }),
      UPDATED_AT,
    );
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "pursuit_ready" }),
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "research_ready" }),
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    const appendedContactId = "550e8400-e29b-41d4-a716-446655440002";
    const reclassified = validatedInput({
      status: "pursuit_ready",
      tasks: [task()],
      contacts: [
        ...(record().contacts as Record<string, unknown>[]),
        {
          ...(record().contacts as Record<string, unknown>[])[0],
          contactId: appendedContactId,
          value: "new-inquiry@example.com",
          consentClassification: "explicit_inquiry",
        },
      ],
      selectedContactId: appendedContactId,
    });
    expect(validateDakotaOperatorTransition(reclassified, dnc, new Date(UPDATED_AT)).valid).toBe(true);
    expect(
      validateDakotaOperatorTransition(
        { ...reclassified, status: "research_ready" },
        dnc,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(true);
  });

  it("requires evidence wherever commercial truth is recorded and reserves lost for pursuit", () => {
    const cashWithoutEvidence = validatedInput({
      commercialClose: {
        ...createEmptyDakotaCommercialClose(),
        amountPaid: 500,
        paidDate: "2026-08-03",
      },
    });
    expect(validateDakotaOperatorTransition(cashWithoutEvidence, undefined, new Date(UPDATED_AT)).valid).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "lost", winLossReason: "Budget changed." }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
    expect(
      validateDakotaOperatorTransition(
        validatedInput({ status: "snoozed", dueDate: "" }),
        undefined,
        new Date(UPDATED_AT),
      ).valid,
    ).toBe(false);
  });
});

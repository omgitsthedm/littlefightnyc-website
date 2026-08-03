import { describe, expect, it } from "vitest";

import inboundFunction from "../../dakota-inbound.mts";
import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  type DakotaOperatorStateEnvelope,
} from "./operator-state-schema";
import {
  captureTechAuditInbound,
  createTechAuditInboundCandidate,
  createWebsiteAuditInboundCandidate,
  type DakotaInboundStore,
  DAKOTA_TECH_AUDIT_SOURCE,
  DAKOTA_WEBSITE_AUDIT_SOURCE,
  persistDakotaInboundCandidate,
} from "./inbound";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const CAPTURE_ID = "11111111-2222-4333-a444-555555555555";

function techAuditData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    "form-name": "tech-audit-scratch",
    source: "littlefightnyc.com/tech-audit",
    name: "Avery Owner",
    business: "Corner Market",
    contact: "avery@example.com",
    follow_up: "email",
    message: "Customers cannot tell what we sell, and mobile checkout is difficult.",
    symptom: "The storefront is not converting",
    urgency: "This month",
    intent: "website",
    lead_origin: "service page",
    website_url: "https://corner-market.example.org/menu",
    report_id: "corner-market-1a2b3c4d",
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: "local-growth",
    gclid: "provider-token-must-not-survive",
    dakota_capture_id: CAPTURE_ID,
    dakota_submitted_at: NOW.toISOString(),
    "bot-field": "",
    ...overrides,
  };
}

class MemoryStore {
  data: DakotaOperatorStateEnvelope | null = null;
  etag: string | null = null;
  writes: Array<{ key: string; value: unknown; options: Record<string, unknown> }> = [];
  injectConcurrentState: DakotaOperatorStateEnvelope | null = null;

  async getWithMetadata(): Promise<
    { data: unknown; etag?: string; metadata: Record<string, unknown> } | null
  > {
    if (!this.data) return null;
    return { data: this.data, etag: this.etag ?? undefined, metadata: {} };
  }

  async setJSON(
    key: string,
    value: unknown,
    options: Record<string, unknown> = {},
  ): Promise<{ modified: boolean; etag?: string }> {
    this.writes.push({ key, value, options });
    if (this.injectConcurrentState) {
      this.data = this.injectConcurrentState;
      this.injectConcurrentState = null;
      this.etag = "etag-concurrent";
      return { modified: false };
    }
    if (options.onlyIfNew === true && this.data !== null) return { modified: false };
    if (typeof options.onlyIfMatch === "string" && options.onlyIfMatch !== this.etag) {
      return { modified: false };
    }
    this.data = value as DakotaOperatorStateEnvelope;
    this.etag = `etag-${this.writes.length}`;
    return { modified: true, etag: this.etag };
  }
}

function dependencies(store: MemoryStore) {
  return {
    getStore: () => store as unknown as DakotaInboundStore,
    now: () => NOW,
  };
}

describe("Dakota consented inbound mapping", () => {
  it("maps only bounded, explicit Tech Audit inquiry data into research-ready state", () => {
    const candidate = createTechAuditInboundCandidate(techAuditData(), NOW);

    expect(candidate).not.toBeNull();
    expect(candidate?.candidateKey).toBe(`${DAKOTA_TECH_AUDIT_SOURCE}:${CAPTURE_ID}`);
    expect(candidate?.record.status).toBe("research_ready");
    expect(candidate?.record.identity).toMatchObject({
      businessName: "Corner Market",
      source: DAKOTA_TECH_AUDIT_SOURCE,
      sourceId: CAPTURE_ID,
      publicSourceUrl: "https://corner-market.example.org/menu",
    });
    expect(candidate?.record.contacts).toEqual([
      expect.objectContaining({
        name: "Avery Owner",
        channel: "email",
        value: "avery@example.com",
        consentClassification: "explicit_inquiry",
        verifiedAt: NOW.toISOString().slice(0, 10),
      }),
    ]);
    expect(candidate?.record.activities).toEqual([
      expect.objectContaining({
        taskId: null,
        contactId: null,
        channel: "internal",
        type: "note",
        outcome: "recorded",
        followUpAt: null,
      }),
    ]);
    expect(candidate?.record.activities[0]?.note).toContain("No outreach was sent");
    expect(candidate?.record.selectedContactId).toBe(candidate?.record.contacts[0]?.contactId);
    expect(candidate?.record.tasks).toEqual([
      expect.objectContaining({
        type: "research",
        status: "open",
        channel: "internal",
        contactId: null,
        createdAt: NOW.toISOString(),
        dueAt: NOW.toISOString(),
      }),
    ]);
    expect(candidate?.record.verifiedPain).toContain("Self-reported");
    expect(candidate?.record.proof).toContain("Requested follow-up: email");
  });

  it("persists the requested Tech Audit follow-up route structurally", () => {
    const text = createTechAuditInboundCandidate(techAuditData({
      contact: "+1 (212) 555-0199",
      follow_up: "text",
    }), NOW);
    const call = createTechAuditInboundCandidate(techAuditData({
      contact: "+1 (212) 555-0199",
      follow_up: "phone",
    }), NOW);
    const fastestEmail = createTechAuditInboundCandidate(techAuditData({
      contact: "avery@example.com",
      follow_up: "fastest",
    }), NOW);
    const fastestPhone = createTechAuditInboundCandidate(techAuditData({
      contact: "+1 (212) 555-0199",
      follow_up: "fastest",
    }), NOW);

    expect(text?.record.contacts[0]).toEqual(
      expect.objectContaining({
        channel: "sms",
        value: "+1 (212) 555-0199",
        consentClassification: "explicit_inquiry",
      }),
    );
    expect(call?.record.contacts[0]).toEqual(
      expect.objectContaining({
        channel: "phone",
        value: "+1 (212) 555-0199",
        consentClassification: "explicit_inquiry",
      }),
    );
    expect(text?.record.contacts[0]?.contactId).not.toBe(call?.record.contacts[0]?.contactId);
    expect(fastestEmail?.record.contacts[0]).toEqual(
      expect.objectContaining({ channel: "email", value: "avery@example.com" }),
    );
    expect(fastestPhone?.record.contacts[0]).toEqual(
      expect.objectContaining({ channel: "phone", value: "+1 (212) 555-0199" }),
    );

    for (const mismatch of [
      { contact: "avery@example.com", follow_up: "text" },
      { contact: "avery@example.com", follow_up: "phone" },
      { contact: "+1 (212) 555-0199", follow_up: "email" },
    ]) {
      expect(
        createTechAuditInboundCandidate(techAuditData(mismatch), NOW),
      ).toBeNull();
    }
  });

  it("rejects every contact shape the public Tech Audit contract marks unreachable", () => {
    for (const contact of [
      "hello@yourshop",
      "555-0199",
      "2125550199 surprise",
      "david marsh",
    ]) {
      expect(createTechAuditInboundCandidate(techAuditData({ contact }), NOW)).toBeNull();
    }
  });

  it("bounds prose, strips URL-like content, and uses a stable hash when capture metadata is absent", () => {
    const data = techAuditData({
      dakota_capture_id: "",
      dakota_submitted_at: "",
      business: "B".repeat(1_000),
      message: `${"Slow checkout. ".repeat(800)} https://secret.example/private`,
    });
    const first = createTechAuditInboundCandidate(data, NOW);
    const retry = createTechAuditInboundCandidate(data, new Date("2026-08-03T12:05:00.000Z"));

    expect(first?.candidateKey).toMatch(/^inbound:tech-audit:fallback-[0-9a-f]{32}$/u);
    expect(retry?.candidateKey).toBe(first?.candidateKey);
    expect(retry?.record.tasks[0]?.taskId).toBe(first?.record.tasks[0]?.taskId);
    expect(first?.record.identity.businessName.length).toBeLessThanOrEqual(240);
    expect(first?.record.verifiedPain.length).toBeLessThanOrEqual(2_000);
    expect(first?.record.verifiedPain).not.toContain("https://secret.example/private");
  });

  it("clamps future client timestamps so server transition gates remain authoritative", () => {
    const candidate = createTechAuditInboundCandidate(techAuditData({
      dakota_submitted_at: "2026-08-04T12:00:00.000Z",
    }), NOW);

    expect(candidate?.record.activities[0]?.occurredAt).toBe(NOW.toISOString());
    expect(candidate?.record.tasks[0]?.createdAt).toBe(NOW.toISOString());
    expect(candidate?.record.tasks[0]?.dueAt).toBe(NOW.toISOString());
  });

  it.each([
    ["another form", techAuditData({ "form-name": "contact" })],
    ["honeypot spam", techAuditData({ "bot-field": "filled" })],
    ["missing business", techAuditData({ business: "" })],
    ["malformed contact", techAuditData({ contact: "not-a-contact" })],
    ["malformed event", []],
  ])("ignores %s", (_label, value) => {
    expect(createTechAuditInboundCandidate(value, NOW)).toBeNull();
  });

  it("does not retain raw network, secret, provider, or arbitrary event payload", () => {
    const candidate = createTechAuditInboundCandidate(techAuditData({
      ip: "203.0.113.77",
      secret: "top-secret-value",
      provider_payload: "raw-provider-payload",
      gclid: "raw-google-click-id",
      unknown: "unbounded-extra-field",
    }), NOW);
    const serialized = JSON.stringify(candidate);

    expect(serialized).not.toContain("203.0.113.77");
    expect(serialized).not.toContain("top-secret-value");
    expect(serialized).not.toContain("raw-provider-payload");
    expect(serialized).not.toContain("raw-google-click-id");
    expect(serialized).not.toContain("unbounded-extra-field");
    expect(serialized).toContain("raw provider token was not retained");
  });

  it("builds a report-delivery-only Website Audit helper record", () => {
    const candidate = createWebsiteAuditInboundCandidate({
      email: "owner@example.com",
      domain: "example.com",
      company: "Example Store",
      reportId: "example-com-1a2b3c4d",
      jobId: "job-12345678",
      submittedAt: NOW.toISOString(),
      source: "public Website Audit form",
    }, NOW);

    expect(candidate?.candidateKey).toBe(
      `${DAKOTA_WEBSITE_AUDIT_SOURCE}:example-com-1a2b3c4d`,
    );
    expect(candidate?.record.status).toBe("research_ready");
    expect(candidate?.record.contacts[0]).toMatchObject({
      channel: "email",
      consentClassification: "explicit_inquiry",
    });
    expect(candidate?.record.activities[0]?.note).toContain("report delivery");
    expect(candidate?.record.activities[0]?.note).toContain("No outreach was sent");
    expect(candidate?.record.activities[0]).toEqual(expect.objectContaining({
      taskId: null,
      contactId: null,
    }));
    expect(candidate?.record.selectedContactId).toBe(candidate?.record.contacts[0]?.contactId);
    expect(candidate?.record.tasks).toEqual([
      expect.objectContaining({
        type: "research",
        status: "open",
        channel: "internal",
      }),
    ]);
  });
});

describe("Dakota consented inbound persistence", () => {
  it("runs generated candidates through the same live-work transition gate", async () => {
    const store = new MemoryStore();
    const candidate = createTechAuditInboundCandidate(techAuditData(), NOW);
    if (!candidate) throw new Error("fixture did not map");

    await expect(persistDakotaInboundCandidate({
      ...candidate,
      record: { ...candidate.record, tasks: [] },
    }, dependencies(store))).rejects.toThrow("Generated Dakota inbound transition is invalid");
    expect(store.writes).toHaveLength(0);
  });

  it("deduplicates retries by candidate key without replacing the original", async () => {
    const store = new MemoryStore();
    const candidate = createTechAuditInboundCandidate(techAuditData(), NOW);
    if (!candidate) throw new Error("fixture did not map");

    await expect(persistDakotaInboundCandidate(candidate, dependencies(store))).resolves.toEqual({
      outcome: "stored",
      candidateKey: candidate.candidateKey,
    });
    await expect(persistDakotaInboundCandidate(candidate, dependencies(store))).resolves.toEqual({
      outcome: "duplicate",
      candidateKey: candidate.candidateKey,
    });
    expect(store.writes).toHaveLength(1);
    expect(store.data?.records[candidate.candidateKey]?.milestones.humanApprovedAt).toBeNull();
    expect(store.data?.records[candidate.candidateKey]?.activities).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "outreach" })]),
    );
    expect(store.data?.records[candidate.candidateKey]?.tasks).toEqual([
      expect.objectContaining({ type: "research", status: "open" }),
    ]);
  });

  it("retries an ETag conflict and preserves the concurrent operator write", async () => {
    const store = new MemoryStore();
    const inbound = createTechAuditInboundCandidate(techAuditData(), NOW);
    const concurrent = createTechAuditInboundCandidate(techAuditData({
      dakota_capture_id: "aaaaaaaa-bbbb-4ccc-addd-eeeeeeeeeeee",
      business: "Concurrent Operator Record",
      contact: "+1 (212) 555-0199",
      follow_up: "phone",
    }), NOW);
    if (!inbound || !concurrent) throw new Error("fixture did not map");
    const concurrentRecord = createDakotaOperatorRecord(concurrent.record, NOW.toISOString());
    store.injectConcurrentState = createDakotaOperatorStateEnvelope({
      [concurrent.candidateKey]: concurrentRecord,
    }, NOW.toISOString());

    await expect(persistDakotaInboundCandidate(inbound, dependencies(store))).resolves.toEqual({
      outcome: "stored",
      candidateKey: inbound.candidateKey,
    });
    expect(store.writes).toHaveLength(2);
    expect(store.writes[0]?.options).toMatchObject({ onlyIfNew: true });
    expect(store.writes[1]?.options).toMatchObject({ onlyIfMatch: "etag-concurrent" });
    expect(Object.keys(store.data?.records ?? {})).toEqual(expect.arrayContaining([
      concurrent.candidateKey,
      inbound.candidateKey,
    ]));
  });

  it("refuses to overwrite malformed existing state", async () => {
    const store = new MemoryStore();
    store.data = { records: {} } as unknown as DakotaOperatorStateEnvelope;
    store.etag = "etag-malformed";
    const candidate = createTechAuditInboundCandidate(techAuditData(), NOW);
    if (!candidate) throw new Error("fixture did not map");

    await expect(persistDakotaInboundCandidate(candidate, dependencies(store))).rejects.toThrow(
      "Stored Dakota state is invalid",
    );
    expect(store.writes).toHaveLength(0);
  });

  it("does not instantiate storage for ignored or malformed form events", async () => {
    let storeCalls = 0;
    const result = await captureTechAuditInbound(techAuditData({
      "form-name": "unrelated-form",
    }), {
      getStore: () => {
        storeCalls += 1;
        throw new Error("must not be called");
      },
      now: () => NOW,
    });

    expect(result).toBeNull();
    expect(storeCalls).toBe(0);
  });
});

describe("Dakota formSubmitted event wrapper", () => {
  it("resolves as a no-op for unrelated verified site forms", async () => {
    await expect(inboundFunction.formSubmitted({
      data: {
        "form-name": "unrelated-form",
        email: "someone@example.com",
      },
    })).resolves.toBeUndefined();
  });

  it("resolves as a no-op for malformed or honeypot-filled Tech Audit submissions", async () => {
    await expect(inboundFunction.formSubmitted({
      data: {
        "form-name": "tech-audit-scratch",
        "bot-field": "filled",
      },
    })).resolves.toBeUndefined();
  });
});

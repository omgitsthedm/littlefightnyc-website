import { describe, expect, it } from "vitest";

import {
  mapWebsiteAuditFindings,
  normalizedWebsiteAuditGrade,
  reconcileWebsiteAuditDelivery,
  reconcileWebsiteAuditEngagement,
  reconcileWebsiteAuditGenerated,
  reconcileWebsiteAuditRequested,
  websiteAuditCandidateKey,
} from "./website-audit-bridge";
import type { DakotaRevenueBridgeEnvelope } from "./revenue-bridge-schema";
import type {
  DakotaRevenueBridgeStore,
  DakotaRevenueBridgeStoreDependencies,
} from "./revenue-bridge-store";

const NOW = new Date("2026-08-03T12:00:00.000Z");

class FakeStore {
  data: DakotaRevenueBridgeEnvelope | null = null;
  etag: string | null = null;
  writes = 0;

  async getWithMetadata() {
    return this.data && this.etag
      ? { data: structuredClone(this.data), etag: this.etag, metadata: {} }
      : null;
  }

  async setJSON(
    _key: string,
    value: unknown,
    options: { onlyIfNew?: boolean; onlyIfMatch?: string },
  ) {
    if (options.onlyIfNew && this.data) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) return { modified: false };
    this.writes += 1;
    this.data = structuredClone(value) as DakotaRevenueBridgeEnvelope;
    this.etag = `etag-${this.writes}`;
    return { modified: true };
  }
}

function dependencies(store: FakeStore): DakotaRevenueBridgeStoreDependencies {
  return {
    getStore: () => store as unknown as DakotaRevenueBridgeStore,
    now: () => NOW,
  };
}

describe("Website Audit Revenue Bridge adapter", () => {
  it("normalizes report identity, grades, and bounded findings", () => {
    expect(websiteAuditCandidateKey("corner-market-12345678"))
      .toBe("inbound:website-audit:corner-market-12345678");
    expect(normalizedWebsiteAuditGrade("B+")).toBe("B");
    expect(normalizedWebsiteAuditGrade(null)).toBeNull();
    expect(mapWebsiteAuditFindings([{
      severity: "critical",
      title: "Missing accessible label <button>",
      description: "Customers cannot identify checkout controls.",
    }])).toEqual([
      expect.objectContaining({
        area: "accessibility",
        severity: "high",
        summary: expect.not.stringContaining("<"),
      }),
    ]);
  });

  it("writes requested and generated facts with one needs-review event and alert", async () => {
    const store = new FakeStore();
    await reconcileWebsiteAuditRequested({
      slug: "corner-market-12345678",
      domain: "corner.example",
      requestedAt: "2026-08-03T10:00:00.000Z",
    }, dependencies(store));
    const generated = await reconcileWebsiteAuditGenerated({
      slug: "corner-market-12345678",
      patch: {
        domain: "corner.example",
        generated_at: "2026-08-03T11:00:00.000Z",
        report_url: "https://littlefightnyc.com/examples/audit/report/corner-market-12345678",
        measurement_state: "complete",
        scores: { performance: 70, seo: 80, accessibility: 90, best_practices: 100 },
        overall_score: 85,
        grade: "B",
        summary: "The complete measured report is ready.",
        findings: [],
      },
    }, dependencies(store));

    expect(generated.outcome).toBe("stored");
    if (generated.outcome !== "stored") return;
    const record = generated.envelope.records["inbound:website-audit:corner-market-12345678"];
    expect(record?.website_audit).toMatchObject({ status: "generated", overall_score: 85, grade: "B" });
    expect(record?.external_events).toHaveLength(1);
    expect(record?.external_events[0]?.review_state).toBe("needs_review");
    expect(record?.alerts).toHaveLength(1);
    expect(generated.envelope.providers.website_audit?.health).toBe("healthy");
  });

  it("records audit delivery without claiming Gmail read/reply provider health", async () => {
    const store = new FakeStore();
    const delivered = await reconcileWebsiteAuditDelivery({
      slug: "corner-market-12345678",
      domain: "corner.example",
      status: "sent",
      updatedAt: "2026-08-03T11:30:00.000Z",
    }, dependencies(store));

    expect(delivered.outcome).toBe("stored");
    if (delivered.outcome !== "stored") return;
    expect(delivered.envelope.records[
      "inbound:website-audit:corner-market-12345678"
    ]?.website_audit?.email_delivery.status).toBe("sent");
    expect(delivered.envelope.providers.gmail).toBeUndefined();
  });

  it("does not turn a raw or low-confidence fetch into a sales alert", () => {
    const store = new FakeStore();
    expect(() => reconcileWebsiteAuditEngagement({
        slug: "corner-market-12345678",
        domain: "corner.example",
        observedAt: "2026-08-03T11:01:00.000Z",
        firstViewAt: "2026-08-03T11:00:00.000Z",
        lastViewAt: "2026-08-03T11:01:00.000Z",
        totalViews: 1,
        maxScrollDepth: 0,
        maxTimeOnPageSeconds: 0,
      }, dependencies(store)))
      .toThrow("sustained browser-confidence threshold");
    expect(store.data).toBeNull();
  });

  it("alerts only after a sustained same-origin browser engagement threshold", async () => {
    const store = new FakeStore();
    const result = await reconcileWebsiteAuditEngagement({
      slug: "corner-market-12345678",
      domain: "corner.example",
      observedAt: "2026-08-03T11:01:00.000Z",
      firstViewAt: "2026-08-03T11:00:00.000Z",
      lastViewAt: "2026-08-03T11:01:00.000Z",
      totalViews: 1,
      maxScrollDepth: 25,
      maxTimeOnPageSeconds: 20,
    }, dependencies(store));

    expect(result.outcome).toBe("stored");
    if (result.outcome !== "stored") return;
    const record = result.envelope.records["inbound:website-audit:corner-market-12345678"];
    expect(record?.external_events[0]?.summary).toContain("not verified identity or buying intent");
    expect(record?.alerts[0]?.message).toContain("identity and intent remain unverified");
    expect(record?.alerts[0]?.message).not.toContain("prospect opened");
  });
});

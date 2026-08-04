import { describe, expect, it } from "vitest";

import {
  applyDakotaRevenueBridgeOperatorMutation,
  applyDakotaRevenueBridgeServerMutations,
  archiveDakotaRevenueBridgeCandidate,
  restoreDakotaRevenueBridgeCandidate,
  type DakotaRevenueBridgeStore,
  type DakotaRevenueBridgeStoreDependencies,
} from "./revenue-bridge-store";
import type {
  DakotaRevenueBridgeEnvelope,
  DakotaRevenueBridgeServerMutation,
} from "./revenue-bridge-schema";

const CANDIDATE_KEY = "website_audit:report-12345678";
const T1 = "2026-08-03T10:00:00.000Z";
const T2 = "2026-08-03T10:10:00.000Z";
const T3 = "2026-08-03T10:20:00.000Z";
const T4 = "2026-08-03T10:30:00.000Z";
const T5 = "2026-08-03T10:40:00.000Z";
const NOW = new Date("2026-08-03T12:00:00.000Z");

class FakeStore {
  data: DakotaRevenueBridgeEnvelope | null = null;
  etag: string | null = null;
  conflicts = 0;
  writes = 0;

  async getWithMetadata(): Promise<{ data: DakotaRevenueBridgeEnvelope; etag: string; metadata: {} } | null> {
    if (!this.data || !this.etag) return null;
    return { data: structuredClone(this.data), etag: this.etag, metadata: {} };
  }

  async setJSON(
    _key: string,
    value: unknown,
    options: { onlyIfNew?: boolean; onlyIfMatch?: string },
  ): Promise<{ modified: boolean }> {
    this.writes += 1;
    if (this.conflicts > 0) {
      this.conflicts -= 1;
      return { modified: false };
    }
    if (options.onlyIfNew && this.data !== null) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) return { modified: false };
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

function generatedPatch(generatedAt = T3, summary = "The complete report is ready."): DakotaRevenueBridgeServerMutation {
  return {
    type: "reconcile_website_audit",
    candidate_key: CANDIDATE_KEY,
    patch: {
      patch_type: "generated",
      report_id: "report-12345678",
      domain: "example.com",
      generated_at: generatedAt,
      report_url: "https://example.com/audit/report-12345678",
      measurement_state: "complete",
      scores: { performance: 60, seo: 90, accessibility: 85, best_practices: 95 },
      overall_score: 83,
      grade: "B",
      summary,
      findings: [{
        finding_id: "finding:performance:1",
        area: "performance",
        severity: "high",
        summary: "The largest content appears late on mobile.",
      }],
    },
  };
}

function outOfOrderAuditMutations(): DakotaRevenueBridgeServerMutation[] {
  return [
    {
      type: "reconcile_website_audit",
      candidate_key: CANDIDATE_KEY,
      patch: {
        patch_type: "delivery",
        report_id: "report-12345678",
        domain: "example.com",
        status: "sent",
        updated_at: T4,
        sent_at: T4,
        failed_at: null,
        failure_reason: "",
      },
    },
    {
      type: "reconcile_website_audit",
      candidate_key: CANDIDATE_KEY,
      patch: {
        patch_type: "engagement",
        report_id: "report-12345678",
        domain: "example.com",
        observed_at: T5,
        first_view_at: T4,
        last_view_at: T5,
        total_views: 3,
        max_scroll_depth: 84,
        max_time_on_page_seconds: 70,
      },
    },
    generatedPatch(),
    {
      type: "reconcile_website_audit",
      candidate_key: CANDIDATE_KEY,
      patch: {
        patch_type: "requested",
        report_id: "report-12345678",
        domain: "example.com",
        requested_at: T1,
      },
    },
    {
      type: "reconcile_website_audit",
      candidate_key: CANDIDATE_KEY,
      patch: {
        patch_type: "failed",
        report_id: "report-12345678",
        domain: "example.com",
        failed_at: T2,
        failure_reason: "An earlier render attempt timed out.",
      },
    },
  ];
}

describe("Dakota Revenue Bridge CAS store", () => {
  it("reconciles audit lifecycle, delivery, and engagement facts out of order", async () => {
    const store = new FakeStore();
    const result = await applyDakotaRevenueBridgeServerMutations(
      outOfOrderAuditMutations(),
      dependencies(store),
    );
    expect(result.outcome).toBe("stored");
    if (result.outcome !== "stored") return;
    const audit = result.envelope.records[CANDIDATE_KEY]?.website_audit;
    expect(audit).toMatchObject({
      status: "generated",
      status_updated_at: T3,
      requested_at: T1,
      generated_at: T3,
      failed_at: T2,
      failure_reason: "An earlier render attempt timed out.",
      email_delivery: { status: "sent", sent_at: T4, updated_at: T4 },
      engagement: {
        first_view_at: T4,
        last_view_at: T5,
        total_views: 3,
        max_scroll_depth: 84,
        max_time_on_page_seconds: 70,
      },
    });
  });

  it("is idempotent for replayed patches and rejects same-timestamp conflicts", async () => {
    const store = new FakeStore();
    await applyDakotaRevenueBridgeServerMutations(outOfOrderAuditMutations(), dependencies(store));
    const writes = store.writes;
    const replay = await applyDakotaRevenueBridgeServerMutations(outOfOrderAuditMutations(), dependencies(store));
    expect(replay.outcome).toBe("unchanged");
    expect(store.writes).toBe(writes);

    const conflict = await applyDakotaRevenueBridgeServerMutations(
      [generatedPatch(T3, "Conflicting facts at the same generated timestamp.")],
      dependencies(store),
    );
    expect(conflict).toEqual({
      outcome: "invalid_transition",
      error: "A Website Audit generated_at timestamp cannot identify conflicting intelligence.",
    });
  });

  it("merges engagement snapshots monotonically even when an older observation arrives later", async () => {
    const store = new FakeStore();
    await applyDakotaRevenueBridgeServerMutations(outOfOrderAuditMutations(), dependencies(store));
    const result = await applyDakotaRevenueBridgeServerMutations([{
      type: "reconcile_website_audit",
      candidate_key: CANDIDATE_KEY,
      patch: {
        patch_type: "engagement",
        report_id: "report-12345678",
        domain: "example.com",
        observed_at: T4,
        first_view_at: T2,
        last_view_at: T4,
        total_views: 2,
        max_scroll_depth: 90,
        max_time_on_page_seconds: 50,
      },
    }], dependencies(store));
    expect(result.outcome).toBe("stored");
    if (result.outcome !== "stored") return;
    expect(result.envelope.records[CANDIDATE_KEY]?.website_audit?.engagement).toMatchObject({
      first_view_at: T2,
      last_view_at: T5,
      total_views: 3,
      max_scroll_depth: 90,
      max_time_on_page_seconds: 70,
      updated_at: T5,
    });
  });

  it("retries compare-and-swap conflicts without overwriting state", async () => {
    const store = new FakeStore();
    store.conflicts = 1;
    const result = await applyDakotaRevenueBridgeServerMutations(
      [generatedPatch()],
      dependencies(store),
    );
    expect(result.outcome).toBe("stored");
    expect(store.writes).toBe(2);
  });

  it("requires exact candidate versions for browser reviews", async () => {
    const store = new FakeStore();
    const seeded = await applyDakotaRevenueBridgeServerMutations([generatedPatch()], dependencies(store));
    expect(seeded.outcome).toBe("stored");
    if (seeded.outcome !== "stored") return;
    const stale = await applyDakotaRevenueBridgeOperatorMutation({
      candidate_key: CANDIDATE_KEY,
      expected_updated_at: T1,
      mutation: { type: "review_research", disposition: "pursue", reason: "The evidence supports review." },
    }, dependencies(store));
    expect(stale.outcome).toBe("version_conflict");

    const stored = await applyDakotaRevenueBridgeOperatorMutation({
      candidate_key: CANDIDATE_KEY,
      expected_updated_at: seeded.envelope.records[CANDIDATE_KEY]!.updated_at,
      mutation: { type: "review_research", disposition: "needs_evidence", reason: "Verify ownership before outreach." },
    }, dependencies(store));
    expect(stored.outcome).toBe("stored");
  });

  it("archives and restores only through idempotent server helpers", async () => {
    const store = new FakeStore();
    await applyDakotaRevenueBridgeServerMutations([generatedPatch()], dependencies(store));
    const archived = await archiveDakotaRevenueBridgeCandidate(CANDIDATE_KEY, {
      reason: "The core record was archived.",
      retention_until: "2027-08-03T12:00:00.000Z",
      source: "retention",
    }, dependencies(store));
    expect(archived.outcome).toBe("stored");

    const frozen = await applyDakotaRevenueBridgeServerMutations([generatedPatch()], dependencies(store));
    expect(frozen.outcome).toBe("invalid_transition");

    const restored = await restoreDakotaRevenueBridgeCandidate(CANDIDATE_KEY, dependencies(store));
    expect(restored.outcome).toBe("stored");
    if (restored.outcome !== "stored") return;
    expect(restored.envelope.records[CANDIDATE_KEY]?.archive).toBeNull();
    expect((await restoreDakotaRevenueBridgeCandidate(CANDIDATE_KEY, dependencies(store))).outcome).toBe("unchanged");
  });
});

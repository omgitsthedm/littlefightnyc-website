import { describe, expect, it } from "vitest";

import type { DakotaWebsiteAuditReconciliationPatch } from "./revenue-bridge-schema.ts";
import type { DakotaRevenueBridgeMutationResult } from "./revenue-bridge-store.ts";
import {
  acknowledgeFailedDakotaWebsiteAuditOutboxEntry,
  attemptDakotaWebsiteAuditOutboxEntry,
  DakotaWebsiteAuditOutboxCapacityError,
  DAKOTA_WEBSITE_AUDIT_OUTBOX_KEY,
  DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS,
  enqueueDakotaWebsiteAuditOutboxPatch,
  redriveFailedDakotaWebsiteAuditOutboxEntry,
  retryPendingDakotaWebsiteAuditOutbox,
  summarizeDakotaWebsiteAuditOutbox,
  type DakotaWebsiteAuditOutboxDependencies,
  type DakotaWebsiteAuditOutboxEnvelope,
  type DakotaWebsiteAuditOutboxStore,
} from "./website-audit-outbox.ts";

const REPORT_ID = "corner-market-12345678";
const DOMAIN = "corner.example";

class FakeOutboxStore {
  data: DakotaWebsiteAuditOutboxEnvelope | null = null;
  etag: string | null = null;
  writes = 0;
  failWrites = 0;

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
    if (this.failWrites > 0) {
      this.failWrites -= 1;
      throw new Error("synthetic outbox write failure");
    }
    if (options.onlyIfNew && this.data) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) {
      return { modified: false };
    }
    this.writes += 1;
    this.data = structuredClone(value) as DakotaWebsiteAuditOutboxEnvelope;
    this.etag = `etag-${this.writes}`;
    return { modified: true };
  }
}

function requestedPatch(
  reportId = REPORT_ID,
  requestedAt = "2026-08-03T10:00:00.000Z",
): DakotaWebsiteAuditReconciliationPatch {
  return {
    patch_type: "requested",
    report_id: reportId,
    domain: DOMAIN,
    requested_at: requestedAt,
  };
}

function engagementPatch(
  observedAt: string,
  totalViews: number,
): DakotaWebsiteAuditReconciliationPatch {
  return {
    patch_type: "engagement",
    report_id: REPORT_ID,
    domain: DOMAIN,
    observed_at: observedAt,
    first_view_at: "2026-08-03T10:05:00.000Z",
    last_view_at: observedAt,
    total_views: totalViews,
    max_scroll_depth: Math.min(100, totalViews * 20),
    max_time_on_page_seconds: totalViews * 30,
  };
}

function success(): DakotaRevenueBridgeMutationResult {
  return {
    outcome: "unchanged",
    envelope: {} as never,
    updated_at: "2026-08-03T12:00:00.000Z",
  };
}

function dependencies(
  store: FakeOutboxStore,
  now: () => Date,
  deliverPatch: DakotaWebsiteAuditOutboxDependencies["deliverPatch"],
  options: Pick<
    DakotaWebsiteAuditOutboxDependencies,
    "maximumEntries" | "maximumDeadLetters" | "maximumStateBytes"
  > = {},
): DakotaWebsiteAuditOutboxDependencies {
  return {
    getOutboxStore: () => store as unknown as DakotaWebsiteAuditOutboxStore,
    getRevenueBridgeStore: () => ({}) as never,
    now,
    deliverPatch,
    ...options,
  };
}

describe("Website Audit durable Revenue Bridge outbox", () => {
  it("retries a transient receipt write before any bridge delivery is possible", async () => {
    const store = new FakeOutboxStore();
    store.failWrites = 1;
    let deliveries = 0;
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T10:00:00.000Z"),
      async () => {
        deliveries += 1;
        return success();
      },
    );

    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);

    expect(queued.outcome).toBe("enqueued");
    expect(store.data?.entries[queued.entry.entry_id]).toBeDefined();
    expect(deliveries).toBe(0);
  });

  it("persists before delivery and survives a transient bridge failure", async () => {
    const store = new FakeOutboxStore();
    let now = new Date("2026-08-03T10:00:00.000Z");
    let calls = 0;
    const deps = dependencies(store, () => now, async () => {
      calls += 1;
      expect(store.data?.entries).toHaveProperty(
        Object.keys(store.data?.entries ?? {})[0] as string,
      );
      if (calls === 1) throw new Error("synthetic bridge outage");
      return success();
    });

    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);
    expect(queued.outcome).toBe("enqueued");
    expect(store.data?.entries[queued.entry.entry_id]?.attempts).toBe(0);

    const failedDelivery = await attemptDakotaWebsiteAuditOutboxEntry(
      queued.entry.entry_id,
      deps,
      true,
    );
    expect(failedDelivery).toMatchObject({
      outcome: "pending",
      attempts: 1,
      last_error_code: "storage_unavailable",
    });
    expect(store.data?.entries[queued.entry.entry_id]).toBeDefined();

    now = new Date("2026-08-03T10:05:00.000Z");
    const retry = await retryPendingDakotaWebsiteAuditOutbox(deps);
    expect(retry).toMatchObject({ attempted: 1, delivered: 1, pending: 0 });
    expect(store.data?.entries).toEqual({});
    expect(calls).toBe(2);
  });

  it("deduplicates identical facts and compacts newer aggregate facts", async () => {
    const store = new FakeOutboxStore();
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => success(),
    );

    const first = await enqueueDakotaWebsiteAuditOutboxPatch(
      engagementPatch("2026-08-03T11:00:00.000Z", 1),
      deps,
    );
    const duplicate = await enqueueDakotaWebsiteAuditOutboxPatch(
      engagementPatch("2026-08-03T11:00:00.000Z", 1),
      deps,
    );
    const newer = await enqueueDakotaWebsiteAuditOutboxPatch(
      engagementPatch("2026-08-03T11:30:00.000Z", 3),
      deps,
    );

    expect(first.outcome).toBe("enqueued");
    expect(duplicate.outcome).toBe("deduplicated");
    expect(newer.outcome).toBe("enqueued");
    expect(Object.keys(store.data?.entries ?? {})).toHaveLength(1);
    expect(store.data?.entries[newer.entry.entry_id]?.patch).toMatchObject({
      patch_type: "engagement",
      total_views: 3,
      max_scroll_depth: 60,
    });
  });

  it("merges an older out-of-order aggregate without erasing newer view facts", async () => {
    const store = new FakeOutboxStore();
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => success(),
    );
    const latest = await enqueueDakotaWebsiteAuditOutboxPatch(
      engagementPatch("2026-08-03T11:30:00.000Z", 3),
      deps,
    );
    const olderWithDeeperEngagement = engagementPatch(
      "2026-08-03T11:00:00.000Z",
      1,
    );
    if (olderWithDeeperEngagement.patch_type !== "engagement") return;
    olderWithDeeperEngagement.max_scroll_depth = 95;
    olderWithDeeperEngagement.max_time_on_page_seconds = 180;
    const old = await enqueueDakotaWebsiteAuditOutboxPatch(
      olderWithDeeperEngagement,
      deps,
    );

    expect(old.outcome).toBe("enqueued");
    expect(old.entry.payload_hash).not.toBe(latest.entry.payload_hash);
    expect(store.data?.entries[latest.entry.entry_id]?.patch).toMatchObject({
      observed_at: "2026-08-03T11:30:00.000Z",
      total_views: 3,
      max_scroll_depth: 95,
      max_time_on_page_seconds: 180,
    });
  });

  it("finalizes a legacy low-confidence fetch patch without delivering engagement", async () => {
    const store = new FakeOutboxStore();
    let deliveries = 0;
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => {
        deliveries += 1;
        return success();
      },
    );
    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(
      engagementPatch("2026-08-03T11:00:00.000Z", 1),
      deps,
    );

    const result = await attemptDakotaWebsiteAuditOutboxEntry(
      queued.entry.entry_id,
      deps,
      true,
    );
    expect(result.outcome).toBe("delivered");
    expect(deliveries).toBe(0);
    expect(store.data?.entries).toEqual({});
  });

  it("keeps a successful delivery recoverable when its acknowledgement write fails", async () => {
    const store = new FakeOutboxStore();
    let calls = 0;
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => {
        calls += 1;
        return success();
      },
    );
    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);
    store.failWrites = 1;

    await expect(attemptDakotaWebsiteAuditOutboxEntry(
      queued.entry.entry_id,
      deps,
      true,
    )).rejects.toThrow("synthetic outbox write failure");
    expect(store.data?.entries[queued.entry.entry_id]).toBeDefined();

    const retried = await attemptDakotaWebsiteAuditOutboxEntry(
      queued.entry.entry_id,
      deps,
      true,
    );
    expect(retried.outcome).toBe("delivered");
    expect(calls).toBe(2);
    expect(store.data?.entries).toEqual({});
  });

  it("stops retrying at the bounded terminal attempt and reports it", async () => {
    const store = new FakeOutboxStore();
    let now = new Date("2026-08-03T12:00:00.000Z");
    const deps = dependencies(store, () => now, async () => ({
      outcome: "capacity",
      error: "synthetic capacity",
    }));
    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);

    for (let attempt = 0; attempt < DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS; attempt += 1) {
      await attemptDakotaWebsiteAuditOutboxEntry(
        queued.entry.entry_id,
        deps,
        true,
      );
      now = new Date(now.getTime() + 6 * 60 * 60_000);
    }

    const summary = await summarizeDakotaWebsiteAuditOutbox(
      store as unknown as DakotaWebsiteAuditOutboxStore,
      now,
    );
    expect(summary).toMatchObject({ total: 1, pending: 0, failed: 1, invalid: 0 });
    expect(summary.entries[0]).toMatchObject({
      attempts: DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS,
      status: "failed",
      next_retry_at: null,
      last_error_code: "capacity",
      can_redrive: true,
      can_acknowledge: true,
    });
    expect(summary.capacity).toMatchObject({
      active_used: 0,
      active_limit: 500,
      dead_letter_used: 1,
      dead_letter_limit: 250,
      failed_retention_days: 30,
    });
  });

  it("keeps failed facts durable without consuming active capacity and requires surfacing before removal", async () => {
    const store = new FakeOutboxStore();
    let now = new Date("2026-08-03T12:00:00.000Z");
    const deps = dependencies(store, () => now, async () => ({
      outcome: "capacity",
      error: "synthetic capacity",
    }), { maximumEntries: 1 });
    const failed = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);
    for (let attempt = 0; attempt < DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS; attempt += 1) {
      await attemptDakotaWebsiteAuditOutboxEntry(failed.entry.entry_id, deps, true);
      now = new Date(now.getTime() + 6 * 60 * 60_000);
    }

    expect(await acknowledgeFailedDakotaWebsiteAuditOutboxEntry(
      failed.entry.entry_id,
      store as unknown as DakotaWebsiteAuditOutboxStore,
      now,
    )).toMatchObject({ outcome: "not_surfaced" });

    const second = await enqueueDakotaWebsiteAuditOutboxPatch(
      requestedPatch("second-market-12345678"),
      deps,
    );
    expect(second.outcome).toBe("enqueued");
    const summary = await summarizeDakotaWebsiteAuditOutbox(
      store as unknown as DakotaWebsiteAuditOutboxStore,
      now,
    );
    expect(summary).toMatchObject({ pending: 1, failed: 1 });

    const acknowledged = await acknowledgeFailedDakotaWebsiteAuditOutboxEntry(
      failed.entry.entry_id,
      store as unknown as DakotaWebsiteAuditOutboxStore,
      now,
    );
    expect(acknowledged.outcome).toBe("acknowledged");
    expect(store.data?.entries[failed.entry.entry_id]).toBeUndefined();
    expect(store.data?.entries[second.entry.entry_id]).toBeDefined();
  });

  it("redrives a surfaced failed fact and only removes it after confirmed delivery", async () => {
    const store = new FakeOutboxStore();
    let now = new Date("2026-08-03T12:00:00.000Z");
    let recovered = false;
    const deps = dependencies(store, () => now, async () => recovered
      ? success()
      : { outcome: "storage_unavailable", error: "synthetic outage" });
    const queued = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);
    for (let attempt = 0; attempt < DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS; attempt += 1) {
      await attemptDakotaWebsiteAuditOutboxEntry(queued.entry.entry_id, deps, true);
      now = new Date(now.getTime() + 6 * 60 * 60_000);
    }
    await summarizeDakotaWebsiteAuditOutbox(
      store as unknown as DakotaWebsiteAuditOutboxStore,
      now,
    );

    recovered = true;
    const redriven = await redriveFailedDakotaWebsiteAuditOutboxEntry(
      queued.entry.entry_id,
      deps,
    );
    expect(redriven).toMatchObject({
      outcome: "redriven",
      delivery: { outcome: "delivered" },
    });
    expect(store.data?.entries[queued.entry.entry_id]).toBeUndefined();
  });

  it("never drops a terminal fact when the bounded dead-letter lane is full", async () => {
    const store = new FakeOutboxStore();
    let now = new Date("2026-08-03T12:00:00.000Z");
    const deps = dependencies(store, () => now, async () => ({
      outcome: "capacity",
      error: "synthetic capacity",
    }), { maximumEntries: 1, maximumDeadLetters: 1 });
    const first = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);
    for (let attempt = 0; attempt < DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS; attempt += 1) {
      await attemptDakotaWebsiteAuditOutboxEntry(first.entry.entry_id, deps, true);
      now = new Date(now.getTime() + 6 * 60 * 60_000);
    }
    const second = await enqueueDakotaWebsiteAuditOutboxPatch(
      requestedPatch("second-market-12345678"),
      deps,
    );
    for (let attempt = 0; attempt < DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS; attempt += 1) {
      await attemptDakotaWebsiteAuditOutboxEntry(second.entry.entry_id, deps, true);
      now = new Date(now.getTime() + 6 * 60 * 60_000);
    }

    expect(store.data?.entries[first.entry.entry_id]?.status).toBe("failed");
    expect(store.data?.entries[second.entry.entry_id]).toMatchObject({
      status: "pending",
      attempts: DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS - 1,
      last_error_code: "dead_letter_capacity",
    });
    expect(store.data?.entries[second.entry.entry_id]?.next_retry_at).not.toBeNull();
  });

  it("enforces entry capacity without overwriting a durable receipt", async () => {
    const store = new FakeOutboxStore();
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => success(),
      { maximumEntries: 1 },
    );
    const first = await enqueueDakotaWebsiteAuditOutboxPatch(requestedPatch(), deps);

    await expect(enqueueDakotaWebsiteAuditOutboxPatch(
      requestedPatch("second-market-12345678"),
      deps,
    )).rejects.toBeInstanceOf(DakotaWebsiteAuditOutboxCapacityError);
    expect(store.data?.entries[first.entry.entry_id]).toBeDefined();
    expect(Object.keys(store.data?.entries ?? {})).toHaveLength(1);
  });

  it("redacts contact details before writing generated intelligence", async () => {
    const store = new FakeOutboxStore();
    const deps = dependencies(
      store,
      () => new Date("2026-08-03T12:00:00.000Z"),
      async () => success(),
    );
    await enqueueDakotaWebsiteAuditOutboxPatch({
      patch_type: "generated",
      report_id: REPORT_ID,
      domain: DOMAIN,
      generated_at: "2026-08-03T11:00:00.000Z",
      report_url: `https://littlefightnyc.com/examples/audit/report/${REPORT_ID}`,
      measurement_state: "complete",
      scores: { performance: 70, seo: 80, accessibility: 90, best_practices: 100 },
      overall_score: 85,
      grade: "B",
      summary: "Call (646) 360-0318 or owner@corner.example for context.",
      findings: [{
        finding_id: "contact-finding",
        area: "content",
        severity: "low",
        summary: "The page lists owner@corner.example.",
      }],
    }, deps);

    const serialized = JSON.stringify(store.data);
    expect(serialized).not.toContain("owner@corner.example");
    expect(serialized).not.toContain("646");
    expect(serialized).toContain("contact detail redacted");
    expect(store.data).toHaveProperty("schema_version");
    expect(DAKOTA_WEBSITE_AUDIT_OUTBOX_KEY).toBe("state/v1");
  });
});

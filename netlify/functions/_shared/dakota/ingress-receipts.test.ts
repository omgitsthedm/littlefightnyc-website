import { describe, expect, it } from "vitest";

import {
  captureTechAuditInboundReliably,
  DAKOTA_INGRESS_INDEX_MIGRATION_KEY,
  DAKOTA_INGRESS_RECEIPT_PREFIX,
  DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
  persistDakotaInboundReliably,
  redriveDakotaIngressReceipt,
  retryPendingDakotaIngress,
  summarizeDakotaIngressOperations,
  type DakotaIngressReceiptStore,
} from "./ingress-receipts";
import {
  createTechAuditInboundCandidate,
  type DakotaInboundStore,
} from "./inbound";
import type { DakotaOperatorStateEnvelope } from "./operator-state-schema";

const NOW = new Date("2026-08-03T12:00:00.000Z");

function techAuditData(index = 1): Record<string, unknown> {
  return {
    "form-name": "tech-audit-scratch",
    name: "Avery Owner",
    business: `Corner Market ${index}`,
    contact: "avery@example.com",
    follow_up: "email",
    message: "Customers cannot tell what we sell, and mobile checkout is difficult.",
    intent: "website",
    dakota_capture_id: `00000000-0000-4000-a000-${String(index).padStart(12, "0")}`,
    dakota_submitted_at: NOW.toISOString(),
    "bot-field": "",
  };
}

class OperatorStore {
  data: DakotaOperatorStateEnvelope | null = null;
  etag: string | null = null;
  failReads = false;
  events: string[];
  writes = 0;

  constructor(events: string[] = []) {
    this.events = events;
  }

  async getWithMetadata(): Promise<{
    data: unknown;
    etag?: string;
    metadata: Record<string, unknown>;
  } | null> {
    this.events.push("operator:get");
    if (this.failReads) throw new Error("synthetic operator failure");
    if (!this.data) return null;
    return { data: this.data, etag: this.etag ?? undefined, metadata: {} };
  }

  async setJSON(
    _key: string,
    value: unknown,
    options: Record<string, unknown> = {},
  ): Promise<{ modified: boolean; etag?: string }> {
    this.events.push("operator:set");
    if (options.onlyIfNew === true && this.data !== null) return { modified: false };
    if (typeof options.onlyIfMatch === "string" && options.onlyIfMatch !== this.etag) {
      return { modified: false };
    }
    this.writes += 1;
    this.data = structuredClone(value) as DakotaOperatorStateEnvelope;
    this.etag = `operator-${this.writes}`;
    return { modified: true, etag: this.etag };
  }
}

class ReceiptStore {
  entries = new Map<string, { value: unknown; etag: string }>();
  events: string[];
  failCreates = false;
  writes = 0;
  readKeys: string[] = [];

  constructor(events: string[] = []) {
    this.events = events;
  }

  async getWithMetadata(key: string): Promise<{
    data: unknown;
    etag?: string;
    metadata: Record<string, unknown>;
  } | null> {
    this.events.push("receipt:get");
    this.readKeys.push(key);
    const entry = this.entries.get(key);
    return entry
      ? { data: structuredClone(entry.value), etag: entry.etag, metadata: {} }
      : null;
  }

  async setJSON(
    key: string,
    value: unknown,
    options: Record<string, unknown> = {},
  ): Promise<{ modified: boolean; etag?: string }> {
    this.events.push("receipt:set");
    if (this.failCreates && options.onlyIfNew === true) {
      throw new Error("synthetic receipt failure");
    }
    const current = this.entries.get(key);
    if (options.onlyIfNew === true && current) return { modified: false };
    if (
      typeof options.onlyIfMatch === "string" &&
      options.onlyIfMatch !== current?.etag
    ) {
      return { modified: false };
    }
    this.writes += 1;
    const etag = `receipt-${this.writes}`;
    this.entries.set(key, { value: structuredClone(value), etag });
    return { modified: true, etag };
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  list(options: { prefix?: string; paginate?: boolean } = {}): unknown {
    const prefix = options.prefix ?? "";
    const page = {
      blobs: [...this.entries.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, entry]) => ({ key, etag: entry.etag })),
      directories: [],
    };
    if (options.paginate) {
      return (async function* pages() {
        yield page;
      })();
    }
    return Promise.resolve(page);
  }
}

function dependencies(
  operator: OperatorStore,
  receipts: ReceiptStore,
  now = NOW,
) {
  return {
    getOperatorStore: () => operator as unknown as DakotaInboundStore,
    getReceiptStore: () => receipts as unknown as DakotaIngressReceiptStore,
    now: () => now,
  };
}

describe("Dakota durable inbound receipts", () => {
  it("writes the receipt before attempting the active operator-state write", async () => {
    const events: string[] = [];
    const operator = new OperatorStore(events);
    const receipts = new ReceiptStore(events);

    const result = await captureTechAuditInboundReliably(
      techAuditData(),
      dependencies(operator, receipts),
    );

    expect(result).toMatchObject({
      accepted: true,
      receiptStatus: "stored",
      operatorOutcome: "stored",
      alertKind: "received",
    });
    expect(events.indexOf("receipt:set")).toBeLessThan(events.indexOf("operator:get"));
    expect([...receipts.entries.keys()]).toEqual([
      expect.stringMatching(new RegExp(`^${DAKOTA_INGRESS_RECEIPT_PREFIX}[0-9a-f]{32}$`, "u")),
    ]);
    expect([...receipts.entries.values()][0]?.value).toMatchObject({ candidate: null });
  });

  it("accepts a durable pending receipt when active-state persistence is unavailable", async () => {
    const operator = new OperatorStore();
    operator.failReads = true;
    const receipts = new ReceiptStore();

    await expect(captureTechAuditInboundReliably(
      techAuditData(),
      dependencies(operator, receipts),
    )).resolves.toMatchObject({
      accepted: true,
      receiptStatus: "failed",
      operatorOutcome: "storage_unavailable",
      attempts: 1,
      alertKind: "pending",
    });
    const receipt = [...receipts.entries.values()][0]?.value as {
      next_retry_at?: unknown;
      candidate?: unknown;
    };
    expect(receipt.next_retry_at).toBe("2026-08-03T12:01:00.000Z");
    expect(receipt.candidate).toBeTruthy();
  });

  it("throws before touching operator state when the receipt cannot be created", async () => {
    const events: string[] = [];
    const operator = new OperatorStore(events);
    const receipts = new ReceiptStore(events);
    receipts.failCreates = true;
    const candidate = createTechAuditInboundCandidate(techAuditData(), NOW);
    if (!candidate) throw new Error("fixture did not map");

    await expect(persistDakotaInboundReliably(
      candidate,
      dependencies(operator, receipts),
    )).rejects.toThrow("synthetic receipt failure");
    expect(events).not.toContain("operator:get");
    expect(events).not.toContain("operator:set");
  });

  it("deduplicates a repeated delivery without replacing the original receipt", async () => {
    const operator = new OperatorStore();
    const receipts = new ReceiptStore();

    const first = await captureTechAuditInboundReliably(
      techAuditData(),
      dependencies(operator, receipts),
    );
    const duplicate = await captureTechAuditInboundReliably(
      techAuditData(),
      dependencies(operator, receipts),
    );

    expect(first?.alertKind).toBe("received");
    expect(duplicate).toMatchObject({
      accepted: true,
      receiptStatus: "stored",
      alertKind: null,
    });
    expect(receipts.entries).toHaveLength(1);
    expect(operator.data && Object.keys(operator.data.records)).toHaveLength(1);
  });

  it("retries at most ten due receipts per scheduled pass", async () => {
    const receipts = new ReceiptStore();
    const unavailableOperator = new OperatorStore();
    unavailableOperator.failReads = true;
    for (let index = 1; index <= 11; index += 1) {
      await captureTechAuditInboundReliably(
        techAuditData(index),
        dependencies(unavailableOperator, receipts),
      );
    }

    const recoveringOperator = new OperatorStore();
    const result = await retryPendingDakotaIngress(
      dependencies(
        recoveringOperator,
        receipts,
        new Date("2026-08-03T12:02:00.000Z"),
      ),
      100,
    );

    expect(result.due).toBe(11);
    expect(result.retried).toBe(DAKOTA_INGRESS_RETRY_BATCH_LIMIT);
    expect(result.stored).toBe(DAKOTA_INGRESS_RETRY_BATCH_LIMIT);
    expect(Object.keys(recoveringOperator.data?.records ?? {})).toHaveLength(
      DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
    );
  });

  it("summarizes durable ingress without exposing the stored candidate payload", async () => {
    const receipts = new ReceiptStore();
    const healthyOperator = new OperatorStore();
    const unavailableOperator = new OperatorStore();
    unavailableOperator.failReads = true;

    await captureTechAuditInboundReliably(
      techAuditData(1),
      dependencies(healthyOperator, receipts),
    );
    await captureTechAuditInboundReliably(
      techAuditData(2),
      dependencies(unavailableOperator, receipts),
    );

    const summary = await summarizeDakotaIngressOperations(
      receipts as unknown as DakotaIngressReceiptStore,
      NOW,
    );

    expect(summary).toMatchObject({
      checked_at: NOW.toISOString(),
      total: 2,
      stored: 1,
      pending: 1,
      failed: 0,
      invalid: 0,
      oldest_pending_at: NOW.toISOString(),
    });
    expect(summary.receipts).toHaveLength(2);
    expect(summary.receipts[0]).toMatchObject({ attempts: 1, next_retry_at: "2026-08-03T12:01:00.000Z" });
    expect(summary.receipts.every((receipt) => !("candidate" in receipt))).toBe(true);
  });

  it("CAS-redrives an exhausted retained receipt once and stays idempotent", async () => {
    const receipts = new ReceiptStore();
    const unavailableOperator = new OperatorStore();
    unavailableOperator.failReads = true;
    const first = await captureTechAuditInboundReliably(
      techAuditData(7),
      dependencies(unavailableOperator, receipts),
    );
    if (!first) throw new Error("fixture did not map");
    const key = `${DAKOTA_INGRESS_RECEIPT_PREFIX}${first.receiptId}`;
    const entry = receipts.entries.get(key);
    if (!entry || typeof entry.value !== "object" || entry.value === null) throw new Error("receipt missing");
    entry.value = {
      ...entry.value as Record<string, unknown>,
      attempts: 12,
      status: "failed",
      next_retry_at: null,
      updated_at: "2026-08-03T18:00:00.000Z",
    };
    entry.etag = "terminal-receipt";
    expect(entry.value).toMatchObject({ candidate: expect.any(Object) });

    const recoveredOperator = new OperatorStore();
    const redriveDependencies = dependencies(
      recoveredOperator,
      receipts,
      new Date("2026-08-03T18:05:00.000Z"),
    );
    await expect(redriveDakotaIngressReceipt(first.receiptId, redriveDependencies)).resolves.toMatchObject({
      outcome: "redriven",
      status: "stored",
      attempts: 1,
    });
    await expect(redriveDakotaIngressReceipt(first.receiptId, redriveDependencies)).resolves.toMatchObject({
      outcome: "already_completed",
      status: "stored",
    });
    expect(Object.keys(recoveredOperator.data?.records ?? {})).toHaveLength(1);
    expect(receipts.entries.get(key)?.value).toMatchObject({ candidate: null });
  });

  it("does not strong-read completed receipts after the bounded index migration is complete", async () => {
    const receipts = new ReceiptStore();
    await captureTechAuditInboundReliably(
      techAuditData(8),
      dependencies(new OperatorStore(), receipts),
    );
    receipts.entries.set(DAKOTA_INGRESS_INDEX_MIGRATION_KEY, {
      etag: "migration-complete",
      value: {
        schema_version: "dakota.ingress-index-migration.v1",
        next_shard: 256,
        completed_at: "2026-08-03T18:00:00.000Z",
        updated_at: "2026-08-03T18:00:00.000Z",
      },
    });
    receipts.readKeys = [];

    await retryPendingDakotaIngress(
      dependencies(new OperatorStore(), receipts, new Date("2026-08-04T12:00:00.000Z")),
    );

    expect(receipts.readKeys.some((key) => key.startsWith(DAKOTA_INGRESS_RECEIPT_PREFIX))).toBe(false);
  });
});

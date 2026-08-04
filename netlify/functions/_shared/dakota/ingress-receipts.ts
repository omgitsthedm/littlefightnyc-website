import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import {
  createTechAuditInboundCandidate,
  createWebsiteAuditInboundCandidate,
  persistDakotaInboundCandidate,
  type DakotaInboundCandidate,
  type DakotaInboundPersistResult,
  type DakotaInboundStore,
  type WebsiteAuditInboundInput,
} from "./inbound.ts";
import {
  isDakotaCandidateKey,
  validateDakotaOperatorPutPayload,
} from "./operator-state-schema.ts";

export const DAKOTA_INGRESS_RECEIPT_SCHEMA = "dakota.ingress-receipt.v1" as const;
export const DAKOTA_INGRESS_RECEIPT_STORE = "dakota-ingress-receipts" as const;
export const DAKOTA_INGRESS_RECEIPT_PREFIX = "receipts/v1/" as const;
export const DAKOTA_INGRESS_DUE_PREFIX = "due/v1/" as const;
export const DAKOTA_INGRESS_INDEX_MIGRATION_KEY = "indexes/v1/receipt-migration" as const;
export const DAKOTA_INGRESS_RETRY_BATCH_LIMIT = 10;
export const DAKOTA_INGRESS_MAX_ATTEMPTS = 12;

const DAKOTA_INGRESS_DUE_SCHEMA = "dakota.ingress-due.v1" as const;
const DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA = "dakota.ingress-index-migration.v1" as const;
const INDEX_MIGRATION_SHARDS = 256;

const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  6 * 60 * 60_000,
] as const;

export type DakotaIngressReceiptStatus =
  | "pending"
  | "stored"
  | "duplicate"
  | "capacity"
  | "conflict"
  | "failed";

export type DakotaIngressOperatorOutcome =
  | DakotaInboundPersistResult["outcome"]
  | "storage_unavailable";

export type DakotaIngressAlertKind = "received" | "pending" | "failed";

export interface DakotaIngressReceipt {
  schema_version: typeof DAKOTA_INGRESS_RECEIPT_SCHEMA;
  receipt_id: string;
  candidate_key: string;
  source: string;
  received_at: string;
  updated_at: string;
  attempts: number;
  status: DakotaIngressReceiptStatus;
  next_retry_at: string | null;
  last_error_code: "capacity" | "conflict" | "storage_unavailable" | null;
  candidate: DakotaInboundCandidate | null;
}

export interface DakotaIngressAlert {
  kind: DakotaIngressAlertKind;
  receiptId: string;
  source: string;
}

export type DakotaIngressReceiptStore = Pick<
  Store,
  "delete" | "getWithMetadata" | "setJSON" | "list"
>;

export interface DakotaReliableIngressDependencies {
  getOperatorStore: () => DakotaInboundStore;
  getReceiptStore: () => DakotaIngressReceiptStore;
  now?: () => Date;
}

export interface DakotaReliableIngressResult {
  accepted: true;
  candidateKey: string;
  receiptId: string;
  source: string;
  receiptStatus: DakotaIngressReceiptStatus;
  operatorOutcome: DakotaIngressOperatorOutcome | null;
  attempts: number;
  nextRetryAt: string | null;
  alertKind: DakotaIngressAlertKind | null;
}

export interface DakotaIngressRetryResult {
  scanned: number;
  due: number;
  retried: number;
  stored: number;
  pending: number;
  failed: number;
  alerts: DakotaIngressAlert[];
}

export interface DakotaIngressOperationsReceipt {
  receipt_id: string;
  candidate_key: string;
  source: string;
  received_at: string;
  updated_at: string;
  attempts: number;
  status: DakotaIngressReceiptStatus;
  next_retry_at: string | null;
  last_error_code: DakotaIngressReceipt["last_error_code"];
}

export interface DakotaIngressOperationsSummary {
  checked_at: string;
  total: number;
  stored: number;
  pending: number;
  failed: number;
  invalid: number;
  oldest_pending_at: string | null;
  receipts: DakotaIngressOperationsReceipt[];
}

export interface DakotaIngressRedriveResult {
  outcome: "redriven" | "already_queued" | "already_completed";
  receipt_id: string;
  candidate_key: string;
  status: DakotaIngressReceiptStatus;
  attempts: number;
  next_retry_at: string | null;
}

interface DakotaIngressIndexMigration {
  schema_version: typeof DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA;
  next_shard: number;
  completed_at: string | null;
  updated_at: string;
}

export class DakotaIngressReceiptNotFoundError extends Error {}

interface LoadedReceipt {
  receipt: DakotaIngressReceipt | null;
  etag: string | null;
}

function receiptId(candidateKey: string): string {
  return createHash("sha256").update(candidateKey).digest("hex").slice(0, 32);
}

function receiptKey(id: string): string {
  return `${DAKOTA_INGRESS_RECEIPT_PREFIX}${id}`;
}

function dueIndexKey(receipt: DakotaIngressReceipt): string | null {
  if (completedStatus(receipt.status) || receipt.next_retry_at === null) return null;
  const dueAt = Date.parse(receipt.next_retry_at);
  if (!Number.isFinite(dueAt)) return null;
  const generation = createHash("sha256")
    .update(`${receipt.receipt_id}:${receipt.attempts}:${receipt.updated_at}:${receipt.next_retry_at}`)
    .digest("hex")
    .slice(0, 12);
  return `${DAKOTA_INGRESS_DUE_PREFIX}${String(dueAt).padStart(13, "0")}/${receipt.receipt_id}/${generation}`;
}

function parseDueIndexKey(key: string): { dueAt: number; receiptId: string } | null {
  const match = /^due\/v1\/(\d{13})\/([0-9a-f]{32})\/[0-9a-f]{12}$/u.exec(key);
  if (!match) return null;
  const dueAt = Number(match[1]);
  return Number.isSafeInteger(dueAt) && match[2]
    ? { dueAt, receiptId: match[2] }
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && Number.isFinite(Date.parse(value));
}

function validateReceipt(value: unknown): DakotaIngressReceipt | null {
  if (!isRecord(value)) return null;
  const expectedKeys = [
    "schema_version",
    "receipt_id",
    "candidate_key",
    "source",
    "received_at",
    "updated_at",
    "attempts",
    "status",
    "next_retry_at",
    "last_error_code",
    "candidate",
  ] as const;
  if (
    Object.keys(value).length !== expectedKeys.length ||
    expectedKeys.some((key) => !Object.hasOwn(value, key)) ||
    value.schema_version !== DAKOTA_INGRESS_RECEIPT_SCHEMA ||
    typeof value.receipt_id !== "string" ||
    !/^[0-9a-f]{32}$/u.test(value.receipt_id) ||
    typeof value.candidate_key !== "string" ||
    typeof value.source !== "string" ||
    value.source.length === 0 ||
    value.source.length > 80 ||
    !isIsoTimestamp(value.received_at) ||
    !isIsoTimestamp(value.updated_at) ||
    typeof value.attempts !== "number" ||
    !Number.isSafeInteger(value.attempts) ||
    value.attempts < 0 ||
    value.attempts > DAKOTA_INGRESS_MAX_ATTEMPTS ||
    !["pending", "stored", "duplicate", "capacity", "conflict", "failed"].includes(String(value.status)) ||
    (value.next_retry_at !== null && !isIsoTimestamp(value.next_retry_at)) ||
    ![null, "capacity", "conflict", "storage_unavailable"].includes(value.last_error_code as null | string) ||
    (value.candidate !== null && !isRecord(value.candidate))
  ) {
    return null;
  }

  const status = value.status as DakotaIngressReceiptStatus;
  if (value.candidate === null) {
    return completedStatus(status) &&
      isDakotaCandidateKey(value.candidate_key) &&
      receiptId(value.candidate_key) === value.receipt_id
      ? value as unknown as DakotaIngressReceipt
      : null;
  }

  const candidate = value.candidate as unknown as DakotaInboundCandidate;
  const candidateValidation = validateDakotaOperatorPutPayload({
    candidate_key: candidate.candidateKey,
    expected_updated_at: null,
    record: candidate.record,
  });
  if (
    !candidateValidation.valid ||
    candidate.candidateKey !== value.candidate_key ||
    receiptId(candidate.candidateKey) !== value.receipt_id ||
    candidate.record.identity.source !== value.source
  ) {
    return null;
  }

  return value as unknown as DakotaIngressReceipt;
}

function normalizeIndexMigration(value: unknown): DakotaIngressIndexMigration | null {
  if (
    !isRecord(value) ||
    value.schema_version !== DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA ||
    typeof value.next_shard !== "number" ||
    !Number.isSafeInteger(value.next_shard) ||
    value.next_shard < 0 ||
    value.next_shard > INDEX_MIGRATION_SHARDS ||
    (value.completed_at !== null && !isIsoTimestamp(value.completed_at)) ||
    !isIsoTimestamp(value.updated_at)
  ) {
    return null;
  }
  if ((value.next_shard === INDEX_MIGRATION_SHARDS) !== (value.completed_at !== null)) {
    return null;
  }
  return value as unknown as DakotaIngressIndexMigration;
}

async function ensureDueIndex(
  store: DakotaIngressReceiptStore,
  receipt: DakotaIngressReceipt,
): Promise<string | null> {
  const key = dueIndexKey(receipt);
  if (!key) return null;
  await store.setJSON(key, {
    schema_version: DAKOTA_INGRESS_DUE_SCHEMA,
    receipt_id: receipt.receipt_id,
    due_at: receipt.next_retry_at,
  }, {
    onlyIfNew: true,
    metadata: {
      schemaVersion: DAKOTA_INGRESS_DUE_SCHEMA,
      receiptId: receipt.receipt_id,
      dueAt: receipt.next_retry_at,
    },
  });
  return key;
}

async function deleteDueIndex(
  store: DakotaIngressReceiptStore,
  key: string | null,
): Promise<void> {
  if (!key) return;
  try {
    await store.delete(key);
  } catch {
    // A stale, identifier-only marker is safe. A later pass will reconcile it
    // against the canonical receipt without risking candidate-payload loss.
  }
}

async function reconcileDueIndex(
  store: DakotaIngressReceiptStore,
  before: DakotaIngressReceipt,
  after: DakotaIngressReceipt,
): Promise<void> {
  const beforeKey = dueIndexKey(before);
  const afterKey = await ensureDueIndex(store, after);
  if (beforeKey !== afterKey) await deleteDueIndex(store, beforeKey);
}

function retryAt(attempts: number, now: Date): string | null {
  if (attempts >= DAKOTA_INGRESS_MAX_ATTEMPTS) return null;
  const delay = RETRY_DELAYS_MS[
    Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MS.length - 1)
  ] ?? 6 * 60 * 60_000;
  return new Date(now.getTime() + delay).toISOString();
}

function initialReceipt(candidate: DakotaInboundCandidate, now: Date): DakotaIngressReceipt {
  const id = receiptId(candidate.candidateKey);
  const timestamp = now.toISOString();
  const source = candidate.record.identity.source;
  if (!source) throw new Error("receipt_source_missing");
  return {
    schema_version: DAKOTA_INGRESS_RECEIPT_SCHEMA,
    receipt_id: id,
    candidate_key: candidate.candidateKey,
    source,
    received_at: timestamp,
    updated_at: timestamp,
    attempts: 0,
    status: "pending",
    next_retry_at: timestamp,
    last_error_code: null,
    candidate,
  };
}

async function loadReceipt(
  store: DakotaIngressReceiptStore,
  key: string,
): Promise<LoadedReceipt> {
  const result = await store.getWithMetadata(key, { type: "json" });
  if (!result) return { receipt: null, etag: null };
  const receipt = validateReceipt(result.data);
  if (!receipt || !result.etag) throw new Error("invalid_receipt");
  return { receipt, etag: result.etag };
}

async function reserveReceipt(
  store: DakotaIngressReceiptStore,
  candidate: DakotaInboundCandidate,
  now: Date,
): Promise<LoadedReceipt> {
  const receipt = initialReceipt(candidate, now);
  const key = receiptKey(receipt.receipt_id);
  const proposedIndexKey = await ensureDueIndex(store, receipt);
  const reserved = await store.setJSON(key, receipt, {
    onlyIfNew: true,
    metadata: {
      schemaVersion: DAKOTA_INGRESS_RECEIPT_SCHEMA,
      candidateKey: receipt.candidate_key,
      status: receipt.status,
      updatedAt: receipt.updated_at,
    },
  });
  if (reserved.modified) {
    return loadReceipt(store, key);
  }

  const current = await loadReceipt(store, key);
  if (
    !current.receipt ||
    current.receipt.candidate_key !== candidate.candidateKey ||
    (!completedStatus(current.receipt.status) && JSON.stringify(current.receipt.candidate) !== JSON.stringify(candidate))
  ) {
    throw new Error("receipt_collision");
  }
  const currentIndexKey = await ensureDueIndex(store, current.receipt);
  if (proposedIndexKey !== currentIndexKey) await deleteDueIndex(store, proposedIndexKey);
  return current;
}

async function updateReceipt(
  store: DakotaIngressReceiptStore,
  id: string,
  mutate: (receipt: DakotaIngressReceipt) => DakotaIngressReceipt,
): Promise<DakotaIngressReceipt> {
  const key = receiptKey(id);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const current = await loadReceipt(store, key);
    if (!current.receipt || !current.etag) throw new Error("missing_receipt");
    const next = mutate(current.receipt);
    const validation = validateReceipt(next);
    if (!validation) throw new Error("invalid_receipt_transition");
    if (validation === current.receipt) return validation;
    const saved = await store.setJSON(key, validation, {
      onlyIfMatch: current.etag,
      metadata: {
        schemaVersion: DAKOTA_INGRESS_RECEIPT_SCHEMA,
        candidateKey: validation.candidate_key,
        status: validation.status,
        updatedAt: validation.updated_at,
      },
    });
    if (saved.modified) return validation;
  }
  throw new Error("receipt_conflict");
}

function completedStatus(status: DakotaIngressReceiptStatus): boolean {
  return status === "stored" || status === "duplicate";
}

function terminalFailure(receipt: DakotaIngressReceipt): boolean {
  return !completedStatus(receipt.status) && receipt.next_retry_at === null;
}

function resultFromReceipt(
  receipt: DakotaIngressReceipt,
  operatorOutcome: DakotaIngressOperatorOutcome | null,
  alertKind: DakotaIngressAlertKind | null,
): DakotaReliableIngressResult {
  return {
    accepted: true,
    candidateKey: receipt.candidate_key,
    receiptId: receipt.receipt_id,
    source: receipt.source,
    receiptStatus: receipt.status,
    operatorOutcome,
    attempts: receipt.attempts,
    nextRetryAt: receipt.next_retry_at,
    alertKind,
  };
}

function alertKindForTransition(
  before: DakotaIngressReceipt,
  after: DakotaIngressReceipt,
): DakotaIngressAlertKind | null {
  if (terminalFailure(after) && !terminalFailure(before)) return "failed";
  if (before.attempts === 0 && after.attempts > 0) {
    return completedStatus(after.status) ? "received" : "pending";
  }
  return null;
}

async function attemptReceipt(
  receipt: DakotaIngressReceipt,
  dependencies: DakotaReliableIngressDependencies,
  now: Date,
): Promise<DakotaReliableIngressResult> {
  if (completedStatus(receipt.status) || terminalFailure(receipt)) {
    return resultFromReceipt(receipt, null, null);
  }
  if (!receipt.candidate) throw new Error("retry_candidate_missing");
  await ensureDueIndex(dependencies.getReceiptStore(), receipt);

  let operatorOutcome: DakotaIngressOperatorOutcome;
  try {
    const result = await persistDakotaInboundCandidate(receipt.candidate, {
      getStore: dependencies.getOperatorStore,
      now: () => now,
    });
    operatorOutcome = result.outcome;
  } catch {
    operatorOutcome = "storage_unavailable";
  }

  try {
    const updated = await updateReceipt(
      dependencies.getReceiptStore(),
      receipt.receipt_id,
      (current) => {
        if (completedStatus(current.status)) return current;
        const attempts = Math.min(DAKOTA_INGRESS_MAX_ATTEMPTS, current.attempts + 1);
        const completed = operatorOutcome === "stored" || operatorOutcome === "duplicate";
        const exhausted = !completed && attempts >= DAKOTA_INGRESS_MAX_ATTEMPTS;
        let status: DakotaIngressReceiptStatus;
        if (operatorOutcome === "stored" || operatorOutcome === "duplicate") {
          status = operatorOutcome;
        } else if (exhausted || operatorOutcome === "storage_unavailable") {
          status = "failed";
        } else if (operatorOutcome === "capacity") {
          status = "capacity";
        } else {
          status = "conflict";
        }
        return {
          ...current,
          attempts,
          status,
          updated_at: now.toISOString(),
          next_retry_at: completed || exhausted ? null : retryAt(attempts, now),
          candidate: completed ? null : current.candidate,
          last_error_code: completed
            ? null
            : operatorOutcome === "capacity"
              ? "capacity"
              : operatorOutcome === "conflict"
                ? "conflict"
                : "storage_unavailable",
        };
      },
    );
    await reconcileDueIndex(dependencies.getReceiptStore(), receipt, updated);
    return resultFromReceipt(
      updated,
      operatorOutcome,
      alertKindForTransition(receipt, updated),
    );
  } catch {
    // The original pending receipt is already durable and immediately due. A
    // later scheduled pass can reconcile an active-state write whose receipt
    // status update lost a race or temporarily failed.
    return resultFromReceipt(
      receipt,
      operatorOutcome,
      receipt.attempts === 0 ? "pending" : null,
    );
  }
}

export async function persistDakotaInboundReliably(
  candidate: DakotaInboundCandidate,
  dependencies: DakotaReliableIngressDependencies,
): Promise<DakotaReliableIngressResult> {
  const now = (dependencies.now ?? (() => new Date()))();
  const receiptStore = dependencies.getReceiptStore();
  const reserved = await reserveReceipt(receiptStore, candidate, now);
  if (!reserved.receipt) throw new Error("receipt_unavailable");
  return attemptReceipt(reserved.receipt, dependencies, now);
}

function redriveResult(
  outcome: DakotaIngressRedriveResult["outcome"],
  receipt: Pick<DakotaIngressReceipt, "receipt_id" | "candidate_key" | "status" | "attempts" | "next_retry_at">,
): DakotaIngressRedriveResult {
  return {
    outcome,
    receipt_id: receipt.receipt_id,
    candidate_key: receipt.candidate_key,
    status: receipt.status,
    attempts: receipt.attempts,
    next_retry_at: receipt.next_retry_at,
  };
}

/**
 * Re-open one exhausted receipt without accepting a candidate payload from the
 * browser. The retained canonical payload is the only data that can be
 * replayed, and the ETag transition makes repeat operator clicks idempotent.
 */
export async function redriveDakotaIngressReceipt(
  id: string,
  dependencies: DakotaReliableIngressDependencies,
): Promise<DakotaIngressRedriveResult> {
  if (!/^[0-9a-f]{32}$/u.test(id)) throw new DakotaIngressReceiptNotFoundError("receipt_not_found");
  const store = dependencies.getReceiptStore();
  const now = (dependencies.now ?? (() => new Date()))();

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const loaded = await loadReceipt(store, receiptKey(id));
    if (!loaded.receipt || !loaded.etag) {
      throw new DakotaIngressReceiptNotFoundError("receipt_not_found");
    }
    if (completedStatus(loaded.receipt.status)) {
      return redriveResult("already_completed", loaded.receipt);
    }
    if (!terminalFailure(loaded.receipt)) {
      await ensureDueIndex(store, loaded.receipt);
      return redriveResult("already_queued", loaded.receipt);
    }
    if (!loaded.receipt.candidate) throw new Error("redrive_candidate_missing");

    const updatedAt = new Date(Math.max(
      now.getTime(),
      Date.parse(loaded.receipt.updated_at) + 1,
    )).toISOString();
    const queued: DakotaIngressReceipt = {
      ...loaded.receipt,
      updated_at: updatedAt,
      attempts: 0,
      status: "pending",
      next_retry_at: updatedAt,
      last_error_code: null,
    };
    if (!validateReceipt(queued)) throw new Error("invalid_redrive_transition");
    await ensureDueIndex(store, queued);
    const saved = await store.setJSON(receiptKey(id), queued, {
      onlyIfMatch: loaded.etag,
      metadata: {
        schemaVersion: DAKOTA_INGRESS_RECEIPT_SCHEMA,
        candidateKey: queued.candidate_key,
        status: queued.status,
        updatedAt: queued.updated_at,
      },
    });
    if (!saved.modified) continue;

    const result = await attemptReceipt(queued, dependencies, new Date(updatedAt));
    return redriveResult("redriven", {
      receipt_id: result.receiptId,
      candidate_key: result.candidateKey,
      status: result.receiptStatus,
      attempts: result.attempts,
      next_retry_at: result.nextRetryAt,
    });
  }
  throw new Error("receipt_redrive_conflict");
}

export async function captureTechAuditInboundReliably(
  data: unknown,
  dependencies: DakotaReliableIngressDependencies,
): Promise<DakotaReliableIngressResult | null> {
  const receivedAt = (dependencies.now ?? (() => new Date()))();
  const candidate = createTechAuditInboundCandidate(data, receivedAt);
  if (!candidate) return null;
  return persistDakotaInboundReliably(candidate, {
    ...dependencies,
    now: () => receivedAt,
  });
}

export async function captureWebsiteAuditInboundReliably(
  input: WebsiteAuditInboundInput,
  dependencies: DakotaReliableIngressDependencies,
): Promise<DakotaReliableIngressResult | null> {
  const receivedAt = (dependencies.now ?? (() => new Date()))();
  const candidate = createWebsiteAuditInboundCandidate(input, receivedAt);
  if (!candidate) return null;
  return persistDakotaInboundReliably(candidate, {
    ...dependencies,
    now: () => receivedAt,
  });
}

async function migrateNextReceiptIndexShard(
  store: DakotaIngressReceiptStore,
  now: Date,
): Promise<{ scanned: number; invalidAlerts: DakotaIngressAlert[] }> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const loaded = await store.getWithMetadata(DAKOTA_INGRESS_INDEX_MIGRATION_KEY, {
      type: "json",
      consistency: "strong",
    });
    if (!loaded) {
      const initialized: DakotaIngressIndexMigration = {
        schema_version: DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA,
        next_shard: 0,
        completed_at: null,
        updated_at: now.toISOString(),
      };
      await store.setJSON(DAKOTA_INGRESS_INDEX_MIGRATION_KEY, initialized, {
        onlyIfNew: true,
        metadata: {
          schemaVersion: DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA,
          nextShard: 0,
        },
      });
      continue;
    }
    if (!loaded.etag) throw new Error("receipt_index_migration_etag_missing");
    const current = normalizeIndexMigration(loaded.data) ?? {
      schema_version: DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA,
      next_shard: 0,
      completed_at: null,
      updated_at: now.toISOString(),
    };
    if (current.next_shard === INDEX_MIGRATION_SHARDS) {
      return { scanned: 0, invalidAlerts: [] };
    }

    const shard = current.next_shard.toString(16).padStart(2, "0");
    const invalidAlerts: DakotaIngressAlert[] = [];
    let scanned = 0;
    for await (const page of store.list({
      prefix: `${DAKOTA_INGRESS_RECEIPT_PREFIX}${shard}`,
      paginate: true,
    })) {
      for (const blob of page.blobs) {
        scanned += 1;
        try {
          const receipt = (await loadReceipt(store, blob.key)).receipt;
          if (receipt && !completedStatus(receipt.status) && !terminalFailure(receipt)) {
            await ensureDueIndex(store, receipt);
          }
        } catch {
          const id = blob.key.slice(DAKOTA_INGRESS_RECEIPT_PREFIX.length);
          if (/^[0-9a-f]{32}$/u.test(id) && invalidAlerts.length < DAKOTA_INGRESS_RETRY_BATCH_LIMIT) {
            invalidAlerts.push({ kind: "failed", receiptId: id, source: "inbound:unknown" });
          }
        }
      }
    }

    const nextShard = current.next_shard + 1;
    const updated: DakotaIngressIndexMigration = {
      schema_version: DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA,
      next_shard: nextShard,
      completed_at: nextShard === INDEX_MIGRATION_SHARDS ? now.toISOString() : null,
      updated_at: now.toISOString(),
    };
    const saved = await store.setJSON(DAKOTA_INGRESS_INDEX_MIGRATION_KEY, updated, {
      onlyIfMatch: loaded.etag,
      metadata: {
        schemaVersion: DAKOTA_INGRESS_INDEX_MIGRATION_SCHEMA,
        nextShard,
        completedAt: updated.completed_at,
      },
    });
    if (saved.modified) return { scanned, invalidAlerts };
  }
  throw new Error("receipt_index_migration_conflict");
}

export async function retryPendingDakotaIngress(
  dependencies: DakotaReliableIngressDependencies,
  requestedLimit = DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
): Promise<DakotaIngressRetryResult> {
  const now = (dependencies.now ?? (() => new Date()))();
  const store = dependencies.getReceiptStore();
  const migration = await migrateNextReceiptIndexShard(store, now);
  const dueIndexKeys = new Map<string, string[]>();
  const invalidAlerts: DakotaIngressAlert[] = [...migration.invalidAlerts];
  const transitionAlerts: DakotaIngressAlert[] = [];
  let scanned = migration.scanned;
  let failed = 0;

  for await (const page of store.list({
    prefix: DAKOTA_INGRESS_DUE_PREFIX,
    paginate: true,
  })) {
    for (const blob of page.blobs) {
      scanned += 1;
      const parsed = parseDueIndexKey(blob.key);
      if (!parsed || parsed.dueAt > now.getTime()) continue;
      const keys = dueIndexKeys.get(parsed.receiptId) ?? [];
      keys.push(blob.key);
      dueIndexKeys.set(parsed.receiptId, keys);
    }
  }

  const limit = Math.max(
    0,
    Math.min(requestedLimit, DAKOTA_INGRESS_RETRY_BATCH_LIMIT),
  );
  let retried = 0;
  let stored = 0;
  let pending = 0;

  const dueReceiptIds = [...dueIndexKeys.entries()]
    .sort((left, right) => (left[1][0] ?? "").localeCompare(right[1][0] ?? ""))
    .slice(0, limit)
    .map(([id]) => id);
  for (const id of dueReceiptIds) {
    const markerKeys = dueIndexKeys.get(id) ?? [];
    let receipt: DakotaIngressReceipt | null = null;
    try {
      receipt = (await loadReceipt(store, receiptKey(id))).receipt;
    } catch {
      failed += 1;
      if (invalidAlerts.length < DAKOTA_INGRESS_RETRY_BATCH_LIMIT) {
        invalidAlerts.push({ kind: "failed", receiptId: id, source: "inbound:unknown" });
      }
      continue;
    }
    if (!receipt) {
      await Promise.all(markerKeys.map((key) => deleteDueIndex(store, key)));
      continue;
    }
    if (completedStatus(receipt.status) || terminalFailure(receipt)) {
      await Promise.all(markerKeys.map((key) => deleteDueIndex(store, key)));
      continue;
    }
    if (!receipt.next_retry_at || Date.parse(receipt.next_retry_at) > now.getTime()) {
      const currentKey = await ensureDueIndex(store, receipt);
      await Promise.all(markerKeys.filter((key) => key !== currentKey).map((key) => deleteDueIndex(store, key)));
      continue;
    }
    retried += 1;
    const result = await attemptReceipt(receipt, dependencies, now);
    if (result.receiptStatus === "stored" || result.receiptStatus === "duplicate") {
      stored += 1;
    } else if (result.nextRetryAt === null) {
      failed += 1;
    } else {
      pending += 1;
    }
    if (result.attempts !== receipt.attempts || result.nextRetryAt !== receipt.next_retry_at) {
      await Promise.all(markerKeys.map((key) => deleteDueIndex(store, key)));
    }
    if (result.alertKind) {
      transitionAlerts.push({
        kind: result.alertKind,
        receiptId: result.receiptId,
        source: result.source,
      });
    }
  }

  return {
    scanned,
    due: dueIndexKeys.size,
    retried,
    stored,
    pending,
    failed,
    alerts: [...transitionAlerts, ...invalidAlerts].slice(
      0,
      DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
    ),
  };
}

/**
 * Return a bounded, operator-safe view of the durable ingress queue. Candidate
 * payloads can contain contact details, so this deliberately exposes only
 * routing IDs, status, attempts, and timestamps to the authenticated cockpit.
 */
export async function summarizeDakotaIngressOperations(
  store: DakotaIngressReceiptStore,
  now = new Date(),
  requestedLimit = 50,
): Promise<DakotaIngressOperationsSummary> {
  const receipts: DakotaIngressOperationsReceipt[] = [];
  let total = 0;
  let stored = 0;
  let pending = 0;
  let failed = 0;
  let invalid = 0;
  let oldestPendingAt: string | null = null;

  for await (const page of store.list({
    prefix: DAKOTA_INGRESS_RECEIPT_PREFIX,
    paginate: true,
  })) {
    for (const blob of page.blobs) {
      total += 1;
      try {
        const loaded = await loadReceipt(store, blob.key);
        const receipt = loaded.receipt;
        if (!receipt) {
          invalid += 1;
          continue;
        }
        if (completedStatus(receipt.status)) stored += 1;
        else if (terminalFailure(receipt)) failed += 1;
        else {
          pending += 1;
          if (!oldestPendingAt || receipt.received_at < oldestPendingAt) {
            oldestPendingAt = receipt.received_at;
          }
        }
        receipts.push({
          receipt_id: receipt.receipt_id,
          candidate_key: receipt.candidate_key,
          source: receipt.source,
          received_at: receipt.received_at,
          updated_at: receipt.updated_at,
          attempts: receipt.attempts,
          status: receipt.status,
          next_retry_at: receipt.next_retry_at,
          last_error_code: receipt.last_error_code,
        });
      } catch {
        invalid += 1;
      }
    }
  }

  const limit = Math.max(1, Math.min(requestedLimit, 100));
  receipts.sort((left, right) =>
    Number(terminalFailureForSummary(right)) - Number(terminalFailureForSummary(left)) ||
    Number(pendingForSummary(right)) - Number(pendingForSummary(left)) ||
    right.received_at.localeCompare(left.received_at) ||
    left.receipt_id.localeCompare(right.receipt_id)
  );

  return {
    checked_at: now.toISOString(),
    total,
    stored,
    pending,
    failed,
    invalid,
    oldest_pending_at: oldestPendingAt,
    receipts: receipts.slice(0, limit),
  };
}

function terminalFailureForSummary(receipt: DakotaIngressOperationsReceipt): boolean {
  return receipt.next_retry_at === null && !["stored", "duplicate"].includes(receipt.status);
}

function pendingForSummary(receipt: DakotaIngressOperationsReceipt): boolean {
  return !terminalFailureForSummary(receipt) && !["stored", "duplicate"].includes(receipt.status);
}

export function dakotaIngressReceiptKey(candidateKey: string): string {
  return receiptKey(receiptId(candidateKey));
}

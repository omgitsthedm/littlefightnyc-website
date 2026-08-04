import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import {
  createDakotaOperatorStateEnvelope,
  DAKOTA_OPERATOR_RECORD_LIMIT,
  DAKOTA_OPERATOR_STATE_MAX_BYTES,
  type DakotaOperatorRecord,
  type DakotaOperatorStateEnvelope,
  validateDakotaOperatorStateEnvelope,
} from "./operator-state-schema";
import { DAKOTA_OPERATOR_BLOB_KEY } from "./operator-state-constants";

export const DAKOTA_ARCHIVE_SCHEMA = "dakota.archive-record.v1" as const;
export const DAKOTA_ARCHIVE_STORE = "dakota-operator-archive" as const;
export const DAKOTA_ARCHIVE_PREFIX = "records/v1/" as const;
export const DAKOTA_ARCHIVE_RECONCILIATION_SCHEMA = "dakota.archive-reconciliation.v1" as const;
export const DAKOTA_ARCHIVE_RECONCILIATION_PREFIX = "reconciliation/v1/" as const;

const MAX_ARCHIVE_ATTEMPTS = 4;
const MAX_RECONCILIATION_BATCH = 25;
const ARCHIVE_IN_FLIGHT_GRACE_MS = 2 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["lost", "not_fit", "do_not_contact"]);

export type DakotaArchiveTransactionStatus = "copied" | "removed_from_active" | "restored";

export interface DakotaArchiveRecord {
  schema_version: typeof DAKOTA_ARCHIVE_SCHEMA;
  archive_id: string;
  candidate_key: string;
  source_schema_version: "dakota.operator-state.v3";
  checksum: string;
  reason: "terminal_record";
  archived_at: string;
  archived_by: "hello@littlefightnyc.com";
  transaction_status: DakotaArchiveTransactionStatus;
  active_removed_at: string | null;
  restored_at: string | null;
  record: DakotaOperatorRecord;
}

export interface DakotaArchivePreviewItem {
  candidateKey: string;
  businessName: string;
  status: DakotaOperatorRecord["status"];
  updatedAt: string;
}

export interface DakotaArchivedPreviewItem {
  archiveId: string;
  candidateKey: string;
  businessName: string;
  status: DakotaOperatorRecord["status"];
  archivedAt: string;
  transactionStatus: DakotaArchiveTransactionStatus;
}

export interface DakotaArchivePreview {
  activeCount: number;
  capacity: number;
  eligible: DakotaArchivePreviewItem[];
  archiveCount: number;
  recoverable: DakotaArchivedPreviewItem[];
}

export interface DakotaArchiveReconciliationItem {
  archiveId: string;
  candidateKey: string;
  archivedAt: string;
  queuedAt: string;
  transactionStatus: DakotaArchiveTransactionStatus;
}

export type DakotaArchiveTransactionReconciliation =
  | { outcome: "ready"; item: DakotaArchiveReconciliationItem }
  | { outcome: "in_flight" | "abandoned" | "conflict"; archiveId: string; candidateKey: string };

interface DakotaArchiveReconciliationRequest {
  schema_version: typeof DAKOTA_ARCHIVE_RECONCILIATION_SCHEMA;
  archive_id: string;
  candidate_key: string;
  queued_at: string;
}

export type DakotaArchiveOperatorStore = Pick<Store, "getWithMetadata" | "setJSON">;
export type DakotaArchiveStore = Pick<Store, "delete" | "getWithMetadata" | "setJSON" | "list">;

export interface DakotaArchiveDependencies {
  getOperatorStore: () => DakotaArchiveOperatorStore;
  getArchiveStore: () => DakotaArchiveStore;
  now?: () => Date;
}

interface LoadedOperatorState {
  envelope: DakotaOperatorStateEnvelope;
  etag: string | null;
}

interface LoadedArchive {
  archive: DakotaArchiveRecord | null;
  etag: string | null;
}

export class DakotaArchiveConflictError extends Error {}
export class DakotaArchiveValidationError extends Error {}
export class DakotaArchiveUnavailableError extends Error {}

function emptyOperatorState(now: Date): DakotaOperatorStateEnvelope {
  return createDakotaOperatorStateEnvelope({}, now.toISOString());
}

function canonicalRecord(record: DakotaOperatorRecord): string {
  return JSON.stringify(record);
}

function recordChecksum(record: DakotaOperatorRecord): string {
  return createHash("sha256").update(canonicalRecord(record)).digest("hex");
}

function archiveId(candidateKey: string, record: DakotaOperatorRecord, archivedAt: string): string {
  return createHash("sha256")
    .update(`${candidateKey}\u0000${record.updated_at}\u0000${recordChecksum(record)}\u0000${archivedAt}`)
    .digest("hex")
    .slice(0, 40);
}

function archiveKey(id: string): string {
  return `${DAKOTA_ARCHIVE_PREFIX}${id}`;
}

function reconciliationKey(id: string): string {
  return `${DAKOTA_ARCHIVE_RECONCILIATION_PREFIX}${id}`;
}

function isIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && Number.isFinite(Date.parse(value));
}

function isArchiveRecord(value: unknown): value is DakotaArchiveRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const keys = [
    "schema_version",
    "archive_id",
    "candidate_key",
    "source_schema_version",
    "checksum",
    "reason",
    "archived_at",
    "archived_by",
    "transaction_status",
    "active_removed_at",
    "restored_at",
    "record",
  ] as const;
  if (Object.keys(record).length !== keys.length || keys.some((key) => !Object.hasOwn(record, key))) return false;
  if (
    record.schema_version !== DAKOTA_ARCHIVE_SCHEMA ||
    typeof record.archive_id !== "string" ||
    !/^[0-9a-f]{40}$/u.test(record.archive_id) ||
    typeof record.candidate_key !== "string" ||
    record.source_schema_version !== "dakota.operator-state.v3" ||
    typeof record.checksum !== "string" ||
    !/^[0-9a-f]{64}$/u.test(record.checksum) ||
    record.reason !== "terminal_record" ||
    !isIsoTimestamp(record.archived_at) ||
    record.archived_by !== "hello@littlefightnyc.com" ||
    !["copied", "removed_from_active", "restored"].includes(String(record.transaction_status)) ||
    (record.active_removed_at !== null && !isIsoTimestamp(record.active_removed_at)) ||
    (record.restored_at !== null && !isIsoTimestamp(record.restored_at))
  ) {
    return false;
  }
  const candidate = record.record as DakotaOperatorRecord;
  const candidateEnvelope = validateDakotaOperatorStateEnvelope({
    schema_version: "dakota.operator-state.v3",
    updated_at: candidate?.updated_at,
    records: { [record.candidate_key as string]: candidate },
  });
  const status = record.transaction_status as DakotaArchiveTransactionStatus;
  const validTransactionTimestamps = status === "copied"
    ? record.active_removed_at === null && record.restored_at === null
    : status === "removed_from_active"
      ? isIsoTimestamp(record.active_removed_at) && record.restored_at === null
      : isIsoTimestamp(record.active_removed_at) && isIsoTimestamp(record.restored_at);
  return Boolean(
    candidateEnvelope.valid &&
    validTransactionTimestamps &&
    recordChecksum(candidate) === record.checksum &&
    archiveId(record.candidate_key as string, candidate, record.archived_at as string) === record.archive_id,
  );
}

function isEligibleRecord(record: DakotaOperatorRecord): boolean {
  return TERMINAL_STATUSES.has(record.status) && record.tasks.every((task) => task.status !== "open");
}

async function loadOperatorState(
  store: DakotaArchiveOperatorStore,
  now: Date,
): Promise<LoadedOperatorState> {
  const result = await store.getWithMetadata(DAKOTA_OPERATOR_BLOB_KEY, { type: "json" });
  if (!result) return { envelope: emptyOperatorState(now), etag: null };
  if (!result.etag) throw new DakotaArchiveUnavailableError("operator_etag_missing");
  const validation = validateDakotaOperatorStateEnvelope(result.data);
  if (!validation.valid) throw new DakotaArchiveUnavailableError("operator_state_invalid");
  return { envelope: validation.value, etag: result.etag };
}

async function loadArchive(store: DakotaArchiveStore, id: string): Promise<LoadedArchive> {
  const result = await store.getWithMetadata(archiveKey(id), { type: "json" });
  if (!result) return { archive: null, etag: null };
  if (!result.etag || !isArchiveRecord(result.data)) {
    throw new DakotaArchiveUnavailableError("archive_invalid");
  }
  return { archive: result.data, etag: result.etag };
}

function archiveRecord(candidateKey: string, record: DakotaOperatorRecord, now: Date): DakotaArchiveRecord {
  const archivedAt = now.toISOString();
  return {
    schema_version: DAKOTA_ARCHIVE_SCHEMA,
    archive_id: archiveId(candidateKey, record, archivedAt),
    candidate_key: candidateKey,
    source_schema_version: "dakota.operator-state.v3",
    checksum: recordChecksum(record),
    reason: "terminal_record",
    archived_at: archivedAt,
    archived_by: "hello@littlefightnyc.com",
    transaction_status: "copied",
    active_removed_at: null,
    restored_at: null,
    record,
  };
}

function isReconciliationRequest(value: unknown): value is DakotaArchiveReconciliationRequest {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const request = value as Record<string, unknown>;
  const keys = ["schema_version", "archive_id", "candidate_key", "queued_at"] as const;
  return Object.keys(request).length === keys.length &&
    keys.every((key) => Object.hasOwn(request, key)) &&
    request.schema_version === DAKOTA_ARCHIVE_RECONCILIATION_SCHEMA &&
    typeof request.archive_id === "string" && /^[0-9a-f]{40}$/u.test(request.archive_id) &&
    typeof request.candidate_key === "string" && request.candidate_key.length <= 240 &&
    isIsoTimestamp(request.queued_at);
}

async function loadReconciliationRequest(
  store: DakotaArchiveStore,
  id: string,
): Promise<DakotaArchiveReconciliationRequest | null> {
  const result = await store.getWithMetadata(reconciliationKey(id), { type: "json" });
  if (!result) return null;
  if (!result.etag || !isReconciliationRequest(result.data)) {
    throw new DakotaArchiveUnavailableError("archive_reconciliation_invalid");
  }
  return result.data;
}

async function ensureReconciliationRequest(
  store: DakotaArchiveStore,
  archive: DakotaArchiveRecord,
  now: Date,
): Promise<void> {
  const request: DakotaArchiveReconciliationRequest = {
    schema_version: DAKOTA_ARCHIVE_RECONCILIATION_SCHEMA,
    archive_id: archive.archive_id,
    candidate_key: archive.candidate_key,
    queued_at: now.toISOString(),
  };
  await store.setJSON(reconciliationKey(archive.archive_id), request, {
    onlyIfNew: true,
    metadata: {
      schemaVersion: request.schema_version,
      candidateKey: request.candidate_key,
      queuedAt: request.queued_at,
    },
  });
  const loaded = await loadReconciliationRequest(store, archive.archive_id);
  if (!loaded || loaded.candidate_key !== archive.candidate_key) {
    throw new DakotaArchiveUnavailableError("archive_reconciliation_missing");
  }
}

export async function clearDakotaArchiveReconciliationRequest(
  id: string,
  store: DakotaArchiveStore,
): Promise<void> {
  if (!/^[0-9a-f]{40}$/u.test(id)) throw new DakotaArchiveValidationError("archive_id_invalid");
  await store.delete(reconciliationKey(id));
  if (await loadReconciliationRequest(store, id)) {
    throw new DakotaArchiveUnavailableError("archive_reconciliation_delete_failed");
  }
}

async function reserveArchive(
  store: DakotaArchiveStore,
  archive: DakotaArchiveRecord,
): Promise<DakotaArchiveRecord> {
  await store.setJSON(archiveKey(archive.archive_id), archive, {
    onlyIfNew: true,
    metadata: {
      schemaVersion: DAKOTA_ARCHIVE_SCHEMA,
      candidateKey: archive.candidate_key,
      status: archive.transaction_status,
      archivedAt: archive.archived_at,
    },
  });
  const loaded = await loadArchive(store, archive.archive_id);
  if (!loaded.archive) throw new DakotaArchiveUnavailableError("archive_copy_missing");
  if (
    loaded.archive.candidate_key !== archive.candidate_key ||
    loaded.archive.checksum !== archive.checksum
  ) {
    throw new DakotaArchiveUnavailableError("archive_copy_mismatch");
  }
  return loaded.archive;
}

async function markArchive(
  store: DakotaArchiveStore,
  id: string,
  status: "removed_from_active" | "restored",
  now: Date,
): Promise<DakotaArchiveRecord> {
  for (let attempt = 0; attempt < MAX_ARCHIVE_ATTEMPTS; attempt += 1) {
    const loaded = await loadArchive(store, id);
    if (!loaded.archive || !loaded.etag) throw new DakotaArchiveUnavailableError("archive_missing");
    if (loaded.archive.transaction_status === status) return loaded.archive;
    if (
      (status === "removed_from_active" && loaded.archive.transaction_status !== "copied") ||
      (status === "restored" && loaded.archive.transaction_status !== "removed_from_active")
    ) {
      throw new DakotaArchiveConflictError("archive_transition_invalid");
    }
    const transitionTime = new Date(Math.max(
      now.getTime(),
      Date.parse(loaded.archive.archived_at),
      loaded.archive.active_removed_at ? Date.parse(loaded.archive.active_removed_at) : Number.NEGATIVE_INFINITY,
    )).toISOString();
    const next: DakotaArchiveRecord = {
      ...loaded.archive,
      transaction_status: status,
      active_removed_at: status === "removed_from_active" ? transitionTime : loaded.archive.active_removed_at,
      restored_at: status === "restored" ? transitionTime : loaded.archive.restored_at,
    };
    const saved = await store.setJSON(archiveKey(id), next, {
      onlyIfMatch: loaded.etag,
      metadata: {
        schemaVersion: DAKOTA_ARCHIVE_SCHEMA,
        candidateKey: next.candidate_key,
        status: next.transaction_status,
        archivedAt: next.archived_at,
      },
    });
    if (saved.modified) return next;
  }
  throw new DakotaArchiveConflictError("archive_mark_conflict");
}

function encodedSize(envelope: DakotaOperatorStateEnvelope): number {
  return new TextEncoder().encode(JSON.stringify(envelope)).byteLength;
}

export async function previewDakotaArchive(
  dependencies: DakotaArchiveDependencies,
): Promise<DakotaArchivePreview> {
  const now = (dependencies.now ?? (() => new Date()))();
  const active = await loadOperatorState(dependencies.getOperatorStore(), now);
  const archiveStore = dependencies.getArchiveStore();
  const eligible = Object.entries(active.envelope.records)
    .filter(([, record]) => isEligibleRecord(record))
    .map(([candidateKey, record]) => ({
      candidateKey,
      businessName: record.identity.dba || record.identity.businessName,
      status: record.status,
      updatedAt: record.updated_at,
    }))
    .sort((left, right) => left.updatedAt.localeCompare(right.updatedAt));
  const recoverable: DakotaArchivedPreviewItem[] = [];
  let archiveCount = 0;
  for await (const page of archiveStore.list({ prefix: DAKOTA_ARCHIVE_PREFIX, paginate: true })) {
    for (const blob of page.blobs) {
      archiveCount += 1;
      const id = blob.key.slice(DAKOTA_ARCHIVE_PREFIX.length);
      if (!/^[0-9a-f]{40}$/u.test(id)) continue;
      const loaded = await loadArchive(archiveStore, id);
      // A copy is not recoverable until the active-state removal succeeds.
      // Exposing it would offer an action that must 409 while the active key exists.
      if (
        !loaded.archive ||
        loaded.archive.transaction_status !== "removed_from_active" ||
        Object.hasOwn(active.envelope.records, loaded.archive.candidate_key)
      ) continue;
      recoverable.push({
        archiveId: loaded.archive.archive_id,
        candidateKey: loaded.archive.candidate_key,
        businessName: loaded.archive.record.identity.dba || loaded.archive.record.identity.businessName,
        status: loaded.archive.record.status,
        archivedAt: loaded.archive.archived_at,
        transactionStatus: loaded.archive.transaction_status,
      });
    }
  }
  recoverable.sort((left, right) => right.archivedAt.localeCompare(left.archivedAt));
  return {
    activeCount: Object.keys(active.envelope.records).length,
    capacity: DAKOTA_OPERATOR_RECORD_LIMIT,
    eligible,
    archiveCount,
    recoverable: recoverable.slice(0, 50),
  };
}

export async function listDakotaArchiveReconciliationItems(
  store: DakotaArchiveStore,
  limit = 10,
): Promise<DakotaArchiveReconciliationItem[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_RECONCILIATION_BATCH) {
    throw new TypeError(`Archive reconciliation limit must be between 1 and ${MAX_RECONCILIATION_BATCH}.`);
  }
  const items: DakotaArchiveReconciliationItem[] = [];
  for await (const page of store.list({ prefix: DAKOTA_ARCHIVE_RECONCILIATION_PREFIX, paginate: true })) {
    for (const blob of page.blobs) {
      const id = blob.key.slice(DAKOTA_ARCHIVE_RECONCILIATION_PREFIX.length);
      if (!/^[0-9a-f]{40}$/u.test(id)) continue;
      const request = await loadReconciliationRequest(store, id);
      if (!request) continue;
      const loaded = await loadArchive(store, id);
      if (!loaded.archive || loaded.archive.candidate_key !== request.candidate_key) {
        throw new DakotaArchiveUnavailableError("archive_reconciliation_orphaned");
      }
      items.push({
        archiveId: loaded.archive.archive_id,
        candidateKey: loaded.archive.candidate_key,
        archivedAt: loaded.archive.archived_at,
        queuedAt: request.queued_at,
        transactionStatus: loaded.archive.transaction_status,
      });
      if (items.length >= limit) return items;
    }
  }
  return items;
}

export async function reconcileDakotaArchiveTransaction(
  id: string,
  dependencies: DakotaArchiveDependencies,
): Promise<DakotaArchiveTransactionReconciliation> {
  if (!/^[0-9a-f]{40}$/u.test(id)) throw new DakotaArchiveValidationError("archive_id_invalid");
  const now = (dependencies.now ?? (() => new Date()))();
  const archiveStore = dependencies.getArchiveStore();
  const loaded = await loadArchive(archiveStore, id);
  if (!loaded.archive) throw new DakotaArchiveValidationError("archive_missing");
  const request = await loadReconciliationRequest(archiveStore, id);
  if (!request || request.candidate_key !== loaded.archive.candidate_key) {
    throw new DakotaArchiveUnavailableError("archive_reconciliation_missing");
  }
  const active = await loadOperatorState(dependencies.getOperatorStore(), now);
  const activeRecord = active.envelope.records[loaded.archive.candidate_key];
  let archive = loaded.archive;

  if (archive.transaction_status === "copied") {
    if (activeRecord) {
      return now.getTime() - Date.parse(archive.archived_at) < ARCHIVE_IN_FLIGHT_GRACE_MS
        ? { outcome: "in_flight", archiveId: id, candidateKey: archive.candidate_key }
        : { outcome: "abandoned", archiveId: id, candidateKey: archive.candidate_key };
    }
    archive = await markArchive(archiveStore, id, "removed_from_active", now);
  } else if (archive.transaction_status === "removed_from_active" && activeRecord) {
    if (recordChecksum(activeRecord) !== archive.checksum) {
      return { outcome: "conflict", archiveId: id, candidateKey: archive.candidate_key };
    }
    archive = await markArchive(archiveStore, id, "restored", now);
  } else if (archive.transaction_status === "restored") {
    if (!activeRecord || recordChecksum(activeRecord) !== archive.checksum) {
      return { outcome: "conflict", archiveId: id, candidateKey: archive.candidate_key };
    }
  }

  return {
    outcome: "ready",
    item: {
      archiveId: archive.archive_id,
      candidateKey: archive.candidate_key,
      archivedAt: archive.archived_at,
      queuedAt: request.queued_at,
      transactionStatus: archive.transaction_status,
    },
  };
}

export async function archiveDakotaRecord(
  candidateKey: string,
  expectedUpdatedAt: string,
  dependencies: DakotaArchiveDependencies,
): Promise<DakotaArchiveRecord> {
  const now = (dependencies.now ?? (() => new Date()))();
  const operatorStore = dependencies.getOperatorStore();
  const archiveStore = dependencies.getArchiveStore();

  for (let attempt = 0; attempt < MAX_ARCHIVE_ATTEMPTS; attempt += 1) {
    const active = await loadOperatorState(operatorStore, now);
    const record = active.envelope.records[candidateKey];
    if (!record) throw new DakotaArchiveValidationError("active_record_missing");
    if (record.updated_at !== expectedUpdatedAt) throw new DakotaArchiveConflictError("active_record_changed");
    if (!isEligibleRecord(record)) throw new DakotaArchiveValidationError("record_not_eligible");

    const copied = await reserveArchive(archiveStore, archiveRecord(candidateKey, record, now));
    await ensureReconciliationRequest(archiveStore, copied, now);
    const records = { ...active.envelope.records };
    delete records[candidateKey];
    const envelope = createDakotaOperatorStateEnvelope(records, now.toISOString());
    const saved = await operatorStore.setJSON(
      DAKOTA_OPERATOR_BLOB_KEY,
      envelope,
      active.etag
        ? { onlyIfMatch: active.etag, metadata: { schemaVersion: envelope.schema_version, recordCount: Object.keys(records).length, updatedAt: envelope.updated_at, lastWrite: "archive" } }
        : { onlyIfNew: true, metadata: { schemaVersion: envelope.schema_version, recordCount: Object.keys(records).length, updatedAt: envelope.updated_at, lastWrite: "archive" } },
    );
    if (saved.modified) {
      const marked = await markArchive(archiveStore, copied.archive_id, "removed_from_active", now);
      await ensureReconciliationRequest(archiveStore, marked, now);
      return marked;
    }
  }
  throw new DakotaArchiveConflictError("active_state_conflict");
}

export async function restoreDakotaRecord(
  id: string,
  dependencies: DakotaArchiveDependencies,
): Promise<DakotaArchiveRecord> {
  if (!/^[0-9a-f]{40}$/u.test(id)) throw new DakotaArchiveValidationError("archive_id_invalid");
  const now = (dependencies.now ?? (() => new Date()))();
  const operatorStore = dependencies.getOperatorStore();
  const archiveStore = dependencies.getArchiveStore();
  const loadedArchive = await loadArchive(archiveStore, id);
  if (!loadedArchive.archive) throw new DakotaArchiveValidationError("archive_missing");
  let restorableArchive = loadedArchive.archive;
  if (restorableArchive.transaction_status === "restored") {
    const active = await loadOperatorState(operatorStore, now);
    const activeRecord = active.envelope.records[restorableArchive.candidate_key];
    if (activeRecord && recordChecksum(activeRecord) === restorableArchive.checksum) return restorableArchive;
    throw new DakotaArchiveConflictError("archive_not_restorable");
  }
  if (restorableArchive.transaction_status === "copied") {
    // A process can stop after the active-state CAS succeeds but before the
    // archive marker is updated. Absence from active state proves the copy is
    // now authoritative and lets the operator recover without deleting data.
    const active = await loadOperatorState(operatorStore, now);
    if (Object.hasOwn(active.envelope.records, restorableArchive.candidate_key)) {
      throw new DakotaArchiveConflictError("archive_copy_not_removed");
    }
    restorableArchive = await markArchive(archiveStore, id, "removed_from_active", now);
  }
  if (restorableArchive.transaction_status !== "removed_from_active") {
    throw new DakotaArchiveConflictError("archive_not_restorable");
  }
  await ensureReconciliationRequest(archiveStore, restorableArchive, now);

  for (let attempt = 0; attempt < MAX_ARCHIVE_ATTEMPTS; attempt += 1) {
    const active = await loadOperatorState(operatorStore, now);
    const activeRecord = active.envelope.records[restorableArchive.candidate_key];
    if (activeRecord) {
      if (recordChecksum(activeRecord) !== restorableArchive.checksum) {
        throw new DakotaArchiveConflictError("active_key_exists");
      }
      const marked = await markArchive(archiveStore, id, "restored", now);
      await ensureReconciliationRequest(archiveStore, marked, now);
      return marked;
    }
    if (Object.keys(active.envelope.records).length >= DAKOTA_OPERATOR_RECORD_LIMIT) {
      throw new DakotaArchiveConflictError("active_capacity_reached");
    }
    const records = {
      ...active.envelope.records,
      [restorableArchive.candidate_key]: restorableArchive.record,
    };
    const envelope = createDakotaOperatorStateEnvelope(records, now.toISOString());
    if (encodedSize(envelope) > DAKOTA_OPERATOR_STATE_MAX_BYTES) {
      throw new DakotaArchiveConflictError("active_storage_reached");
    }
    const validation = validateDakotaOperatorStateEnvelope(envelope);
    if (!validation.valid) throw new DakotaArchiveUnavailableError("restore_state_invalid");
    const saved = await operatorStore.setJSON(
      DAKOTA_OPERATOR_BLOB_KEY,
      validation.value,
      active.etag
        ? { onlyIfMatch: active.etag, metadata: { schemaVersion: envelope.schema_version, recordCount: Object.keys(records).length, updatedAt: envelope.updated_at, lastWrite: "restore" } }
        : { onlyIfNew: true, metadata: { schemaVersion: envelope.schema_version, recordCount: Object.keys(records).length, updatedAt: envelope.updated_at, lastWrite: "restore" } },
    );
    if (saved.modified) {
      const marked = await markArchive(archiveStore, id, "restored", now);
      await ensureReconciliationRequest(archiveStore, marked, now);
      return marked;
    }
  }
  throw new DakotaArchiveConflictError("active_state_conflict");
}

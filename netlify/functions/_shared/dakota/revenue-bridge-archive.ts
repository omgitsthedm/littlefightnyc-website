import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import {
  createDakotaRevenueBridgeEnvelope,
  DAKOTA_REVENUE_BRIDGE_KEY,
  DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT,
  DAKOTA_REVENUE_BRIDGE_SCHEMA,
  DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES,
  encodedRevenueBridgeSize,
  type DakotaRevenueBridgeRecord,
  validateDakotaRevenueBridgeEnvelope,
  validateDakotaRevenueBridgeRecord,
} from "./revenue-bridge-schema.ts";
import {
  type DakotaRevenueBridgeStore,
  loadDakotaRevenueBridgeState,
} from "./revenue-bridge-store.ts";
import { isDakotaCandidateKey } from "./operator-state-schema.ts";

export const DAKOTA_REVENUE_BRIDGE_ARCHIVE_SCHEMA = "dakota.revenue-bridge-archive.v1" as const;
export const DAKOTA_REVENUE_BRIDGE_ARCHIVE_STORE = "dakota-revenue-bridge-archive" as const;
export const DAKOTA_REVENUE_BRIDGE_ARCHIVE_PREFIX = "records/v1/" as const;
export const DAKOTA_REVENUE_BRIDGE_ARCHIVE_RECONCILIATION_PREFIX = "reconciliation/v1/" as const;

const MAX_ATTEMPTS = 5;

export type DakotaRevenueBridgeArchiveStatus = "copied" | "removed_from_active" | "restored";

export interface DakotaRevenueBridgeArchiveEntry {
  schema_version: typeof DAKOTA_REVENUE_BRIDGE_ARCHIVE_SCHEMA;
  archive_id: string;
  candidate_key: string;
  checksum: string;
  archived_at: string;
  restored_at: string | null;
  status: DakotaRevenueBridgeArchiveStatus;
  record: DakotaRevenueBridgeRecord;
}

export interface DakotaRevenueBridgeArchiveReconciliation {
  schema_version: "dakota.revenue-bridge-archive-reconciliation.v1";
  archive_id: string;
  candidate_key: string;
  core_status: "removed_from_active" | "restored";
  reconciled_at: string;
}

export type DakotaRevenueBridgeArchiveStore = Pick<Store, "getWithMetadata" | "setJSON">;

export interface DakotaRevenueBridgeArchiveDependencies {
  getBridgeStore: () => DakotaRevenueBridgeStore;
  getArchiveStore: () => DakotaRevenueBridgeArchiveStore;
  now?: () => Date;
}

export type DakotaRevenueBridgeArchiveResult =
  | { outcome: "stored" | "unchanged"; candidateKey: string; archiveId: string; status: DakotaRevenueBridgeArchiveStatus }
  | { outcome: "capacity" | "conflict" | "invalid"; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && Number.isFinite(Date.parse(value));
}

function checksum(record: DakotaRevenueBridgeRecord): string {
  return createHash("sha256").update(JSON.stringify(record)).digest("hex");
}

function archiveKey(id: string): string {
  return `${DAKOTA_REVENUE_BRIDGE_ARCHIVE_PREFIX}${id}`;
}

function reconciliationKey(id: string): string {
  return `${DAKOTA_REVENUE_BRIDGE_ARCHIVE_RECONCILIATION_PREFIX}${id}`;
}

function validateEntry(value: unknown): DakotaRevenueBridgeArchiveEntry | null {
  if (!isRecord(value)) return null;
  const keys = [
    "schema_version", "archive_id", "candidate_key", "checksum", "archived_at",
    "restored_at", "status", "record",
  ] as const;
  if (
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key)) ||
    value.schema_version !== DAKOTA_REVENUE_BRIDGE_ARCHIVE_SCHEMA ||
    typeof value.archive_id !== "string" || !/^[0-9a-f]{40}$/u.test(value.archive_id) ||
    typeof value.candidate_key !== "string" || !isDakotaCandidateKey(value.candidate_key) ||
    typeof value.checksum !== "string" || !/^[0-9a-f]{64}$/u.test(value.checksum) ||
    !isTimestamp(value.archived_at) ||
    (value.restored_at !== null && !isTimestamp(value.restored_at)) ||
    !["copied", "removed_from_active", "restored"].includes(String(value.status))
  ) {
    return null;
  }
  const record = validateDakotaRevenueBridgeRecord(value.record);
  if (!record.valid || checksum(record.value) !== value.checksum) return null;
  if (value.status === "restored" && value.restored_at === null) return null;
  if (value.status !== "restored" && value.restored_at !== null) return null;
  return { ...value, record: record.value } as DakotaRevenueBridgeArchiveEntry;
}

function entryMetadata(entry: DakotaRevenueBridgeArchiveEntry) {
  return {
    schemaVersion: entry.schema_version,
    candidateKey: entry.candidate_key,
    status: entry.status,
    archivedAt: entry.archived_at,
    restoredAt: entry.restored_at,
  };
}

async function loadEntry(
  store: DakotaRevenueBridgeArchiveStore,
  id: string,
): Promise<{ entry: DakotaRevenueBridgeArchiveEntry; etag: string } | null> {
  const result = await store.getWithMetadata(archiveKey(id), { type: "json", consistency: "strong" });
  if (!result) return null;
  const entry = validateEntry(result?.data);
  if (!entry || !result.etag) throw new Error("bridge_archive_invalid");
  return { entry, etag: result.etag };
}

async function reserveEntry(
  store: DakotaRevenueBridgeArchiveStore,
  entry: DakotaRevenueBridgeArchiveEntry,
): Promise<{ entry: DakotaRevenueBridgeArchiveEntry; etag: string }> {
  await store.setJSON(archiveKey(entry.archive_id), entry, {
    onlyIfNew: true,
    metadata: entryMetadata(entry),
  });
  const loaded = await loadEntry(store, entry.archive_id);
  if (!loaded || loaded.entry.candidate_key !== entry.candidate_key || loaded.entry.checksum !== entry.checksum) {
    throw new Error("bridge_archive_copy_mismatch");
  }
  return loaded;
}

async function markEntry(
  store: DakotaRevenueBridgeArchiveStore,
  id: string,
  status: "removed_from_active" | "restored",
  now: Date,
): Promise<DakotaRevenueBridgeArchiveEntry> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const loaded = await loadEntry(store, id);
    if (!loaded) throw new Error("bridge_archive_missing");
    if (loaded.entry.status === status) return loaded.entry;
    if (loaded.entry.status === "restored") throw new Error("bridge_archive_already_restored");
    const next: DakotaRevenueBridgeArchiveEntry = {
      ...loaded.entry,
      status,
      restored_at: status === "restored" ? now.toISOString() : null,
    };
    const saved = await store.setJSON(archiveKey(id), next, {
      onlyIfMatch: loaded.etag,
      metadata: entryMetadata(next),
    });
    if (saved.modified) return next;
  }
  throw new Error("bridge_archive_mark_conflict");
}

function nextTimestamp(now: Date, previous: string | null, minimum: string | null = null): string {
  const time = now.getTime();
  if (!Number.isFinite(time)) throw new Error("bridge_archive_time_invalid");
  return new Date(Math.max(
    time,
    previous ? Date.parse(previous) + 1 : Number.NEGATIVE_INFINITY,
    minimum ? Date.parse(minimum) : Number.NEGATIVE_INFINITY,
  )).toISOString();
}

function bridgeMetadata(envelope: ReturnType<typeof createDakotaRevenueBridgeEnvelope>, lastWrite: string) {
  return {
    schemaVersion: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    recordCount: Object.keys(envelope.records).length,
    providerCount: Object.keys(envelope.providers).length,
    updatedAt: envelope.updated_at,
    lastWrite,
  };
}

function restorableRecord(record: DakotaRevenueBridgeRecord, updatedAt: string): DakotaRevenueBridgeRecord {
  return { ...record, archive: null, updated_at: updatedAt };
}

function sameRestoredContent(left: DakotaRevenueBridgeRecord, right: DakotaRevenueBridgeRecord): boolean {
  return JSON.stringify({ ...left, archive: null, updated_at: "" }) ===
    JSON.stringify({ ...right, archive: null, updated_at: "" });
}

export async function getDakotaRevenueBridgeArchiveEntry(
  id: string,
  store: DakotaRevenueBridgeArchiveStore,
): Promise<DakotaRevenueBridgeArchiveEntry | null> {
  if (!/^[0-9a-f]{40}$/u.test(id)) return null;
  return (await loadEntry(store, id))?.entry ?? null;
}

async function loadDakotaRevenueBridgeArchiveReconciliation(
  id: string,
  store: DakotaRevenueBridgeArchiveStore,
): Promise<{ marker: DakotaRevenueBridgeArchiveReconciliation; etag: string } | null> {
  if (!/^[0-9a-f]{40}$/u.test(id)) return null;
  const result = await store.getWithMetadata(reconciliationKey(id), { type: "json", consistency: "strong" });
  if (!result) return null;
  if (!result.etag || !isRecord(result.data)) throw new Error("bridge_archive_reconciliation_invalid");
  const value = result.data;
  const keys = ["schema_version", "archive_id", "candidate_key", "core_status", "reconciled_at"] as const;
  if (
    Object.keys(value).length !== keys.length ||
    keys.some((key) => !Object.hasOwn(value, key)) ||
    value.schema_version !== "dakota.revenue-bridge-archive-reconciliation.v1" ||
    value.archive_id !== id ||
    typeof value.candidate_key !== "string" || !isDakotaCandidateKey(value.candidate_key) ||
    !["removed_from_active", "restored"].includes(String(value.core_status)) ||
    !isTimestamp(value.reconciled_at)
  ) {
    throw new Error("bridge_archive_reconciliation_invalid");
  }
  return { marker: value as unknown as DakotaRevenueBridgeArchiveReconciliation, etag: result.etag };
}

export async function getDakotaRevenueBridgeArchiveReconciliation(
  id: string,
  store: DakotaRevenueBridgeArchiveStore,
): Promise<DakotaRevenueBridgeArchiveReconciliation | null> {
  return (await loadDakotaRevenueBridgeArchiveReconciliation(id, store))?.marker ?? null;
}

export async function markDakotaRevenueBridgeArchiveReconciled(
  input: Omit<DakotaRevenueBridgeArchiveReconciliation, "schema_version" | "reconciled_at">,
  store: DakotaRevenueBridgeArchiveStore,
  now = new Date(),
): Promise<void> {
  if (
    !/^[0-9a-f]{40}$/u.test(input.archive_id) ||
    !isDakotaCandidateKey(input.candidate_key) ||
    !["removed_from_active", "restored"].includes(input.core_status)
  ) {
    throw new Error("bridge_archive_reconciliation_invalid");
  }
  const marker: DakotaRevenueBridgeArchiveReconciliation = {
    schema_version: "dakota.revenue-bridge-archive-reconciliation.v1",
    ...input,
    reconciled_at: now.toISOString(),
  };
  if (!isTimestamp(marker.reconciled_at)) throw new Error("bridge_archive_reconciliation_time_invalid");
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const loaded = await loadDakotaRevenueBridgeArchiveReconciliation(input.archive_id, store);
    const current = loaded?.marker ?? null;
    if (current) {
      if (current.candidate_key !== input.candidate_key) {
        throw new Error("bridge_archive_reconciliation_candidate_conflict");
      }
      if (current.core_status === input.core_status) return;
      if (current.core_status === "restored" && input.core_status === "removed_from_active") {
        throw new Error("bridge_archive_reconciliation_regression");
      }
    }
    const saved = await store.setJSON(reconciliationKey(input.archive_id), marker, loaded
      ? {
          onlyIfMatch: loaded.etag,
          metadata: {
            schemaVersion: marker.schema_version,
            candidateKey: marker.candidate_key,
            coreStatus: marker.core_status,
            reconciledAt: marker.reconciled_at,
          },
        }
      : {
          onlyIfNew: true,
          metadata: {
            schemaVersion: marker.schema_version,
            candidateKey: marker.candidate_key,
            coreStatus: marker.core_status,
            reconciledAt: marker.reconciled_at,
          },
        });
    if (!saved.modified) continue;
    const verified = await getDakotaRevenueBridgeArchiveReconciliation(input.archive_id, store);
    if (
      verified?.candidate_key !== input.candidate_key ||
      verified.core_status !== input.core_status
    ) {
      throw new Error("bridge_archive_reconciliation_write_mismatch");
    }
    return;
  }
  throw new Error("bridge_archive_reconciliation_conflict");
}

export async function archiveDakotaRevenueBridgeRecord(
  candidateKey: string,
  archiveId: string,
  dependencies: DakotaRevenueBridgeArchiveDependencies,
): Promise<DakotaRevenueBridgeArchiveResult> {
  if (!isDakotaCandidateKey(candidateKey) || !/^[0-9a-f]{40}$/u.test(archiveId)) {
    return { outcome: "invalid", error: "Revenue Bridge archive identity is invalid." };
  }
  const bridgeStore = dependencies.getBridgeStore();
  const archiveStore = dependencies.getArchiveStore();
  const now = (dependencies.now ?? (() => new Date()))();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const current = await loadDakotaRevenueBridgeState(bridgeStore);
    const record = current.envelope?.records[candidateKey];
    const existingArchive = await loadEntry(archiveStore, archiveId);
    if (!record) {
      if (!existingArchive) {
        return { outcome: "unchanged", candidateKey, archiveId, status: "removed_from_active" };
      }
      const marked = existingArchive.entry.status === "copied"
        ? await markEntry(archiveStore, archiveId, "removed_from_active", now)
        : existingArchive.entry;
      if (marked.status === "restored") return { outcome: "conflict", error: "Revenue Bridge archive was already restored." };
      return { outcome: "unchanged", candidateKey, archiveId, status: marked.status };
    }
    let entry: DakotaRevenueBridgeArchiveEntry = {
      schema_version: DAKOTA_REVENUE_BRIDGE_ARCHIVE_SCHEMA,
      archive_id: archiveId,
      candidate_key: candidateKey,
      checksum: checksum(record),
      archived_at: now.toISOString(),
      restored_at: null,
      status: "copied",
      record,
    };
    let reserved: { entry: DakotaRevenueBridgeArchiveEntry; etag: string };
    if (existingArchive && existingArchive.entry.checksum !== entry.checksum) {
      if (existingArchive.entry.status === "restored" || existingArchive.entry.candidate_key !== candidateKey) {
        return { outcome: "conflict", error: "Revenue Bridge archive copy no longer matches the active record." };
      }
      entry = { ...entry, archived_at: existingArchive.entry.archived_at };
      const refreshed = await archiveStore.setJSON(archiveKey(archiveId), entry, {
        onlyIfMatch: existingArchive.etag,
        metadata: entryMetadata(entry),
      });
      if (!refreshed.modified) continue;
      const loaded = await loadEntry(archiveStore, archiveId);
      if (!loaded) return { outcome: "invalid", error: "Revenue Bridge archive refresh disappeared." };
      reserved = loaded;
    } else {
      reserved = await reserveEntry(archiveStore, entry);
    }
    if (reserved.entry.status === "restored") {
      return { outcome: "conflict", error: "Revenue Bridge archive was already restored." };
    }
    const records = { ...(current.envelope?.records ?? {}) };
    delete records[candidateKey];
    const updatedAt = nextTimestamp(now, current.envelope?.updated_at ?? null, record.updated_at);
    const envelope = createDakotaRevenueBridgeEnvelope(records, current.envelope?.providers ?? {}, updatedAt);
    const validation = validateDakotaRevenueBridgeEnvelope(envelope);
    if (!validation.valid) return { outcome: "invalid", error: validation.error };
    const saved = await bridgeStore.setJSON(DAKOTA_REVENUE_BRIDGE_KEY, validation.value, current.etag
      ? { onlyIfMatch: current.etag, metadata: bridgeMetadata(validation.value, "archive") }
      : { onlyIfNew: true, metadata: bridgeMetadata(validation.value, "archive") });
    if (!saved.modified) continue;
    const marked = await markEntry(archiveStore, archiveId, "removed_from_active", now);
    return { outcome: "stored", candidateKey, archiveId, status: marked.status };
  }
  return { outcome: "conflict", error: "Revenue Bridge changed during archive." };
}

export async function restoreDakotaRevenueBridgeRecord(
  candidateKey: string,
  archiveId: string,
  dependencies: DakotaRevenueBridgeArchiveDependencies,
): Promise<DakotaRevenueBridgeArchiveResult> {
  if (!isDakotaCandidateKey(candidateKey) || !/^[0-9a-f]{40}$/u.test(archiveId)) {
    return { outcome: "invalid", error: "Revenue Bridge archive identity is invalid." };
  }
  const bridgeStore = dependencies.getBridgeStore();
  const archiveStore = dependencies.getArchiveStore();
  const now = (dependencies.now ?? (() => new Date()))();
  let loaded = await loadEntry(archiveStore, archiveId);
  if (!loaded) return { outcome: "unchanged", candidateKey, archiveId, status: "restored" };
  if (loaded.entry.candidate_key !== candidateKey) {
    return { outcome: "invalid", error: "Revenue Bridge archive candidate does not match." };
  }
  if (loaded.entry.status === "copied") {
    const current = await loadDakotaRevenueBridgeState(bridgeStore);
    const active = current.envelope?.records[loaded.entry.candidate_key];
    if (active) {
      if (!sameRestoredContent(active, loaded.entry.record)) {
        return { outcome: "conflict", error: "Revenue Bridge archive copy is still active with different data." };
      }
      const marked = await markEntry(archiveStore, archiveId, "restored", now);
      return { outcome: "unchanged", candidateKey: marked.candidate_key, archiveId, status: marked.status };
    }
    await markEntry(archiveStore, archiveId, "removed_from_active", now);
    loaded = await loadEntry(archiveStore, archiveId);
    if (!loaded) return { outcome: "invalid", error: "Revenue Bridge archive disappeared." };
  }
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const current = await loadDakotaRevenueBridgeState(bridgeStore);
    const existing = current.envelope?.records[loaded.entry.candidate_key];
    if (existing) {
      if (!sameRestoredContent(existing, loaded.entry.record)) {
        return { outcome: "conflict", error: "An active Revenue Bridge record already uses this key." };
      }
      const marked = loaded.entry.status === "restored"
        ? loaded.entry
        : await markEntry(archiveStore, archiveId, "restored", now);
      return { outcome: "unchanged", candidateKey: marked.candidate_key, archiveId, status: marked.status };
    }
    if (Object.keys(current.envelope?.records ?? {}).length >= DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT) {
      return { outcome: "capacity", error: "Revenue Bridge record capacity has been reached." };
    }
    const updatedAt = nextTimestamp(now, current.envelope?.updated_at ?? null, loaded.entry.record.updated_at);
    const record = restorableRecord(loaded.entry.record, updatedAt);
    const records = { ...(current.envelope?.records ?? {}), [loaded.entry.candidate_key]: record };
    const envelope = createDakotaRevenueBridgeEnvelope(records, current.envelope?.providers ?? {}, updatedAt);
    if (encodedRevenueBridgeSize(envelope) > DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES) {
      return { outcome: "capacity", error: "Revenue Bridge storage capacity has been reached." };
    }
    const validation = validateDakotaRevenueBridgeEnvelope(envelope);
    if (!validation.valid) return { outcome: "invalid", error: validation.error };
    const saved = await bridgeStore.setJSON(DAKOTA_REVENUE_BRIDGE_KEY, validation.value, current.etag
      ? { onlyIfMatch: current.etag, metadata: bridgeMetadata(validation.value, "restore") }
      : { onlyIfNew: true, metadata: bridgeMetadata(validation.value, "restore") });
    if (!saved.modified) continue;
    const marked = await markEntry(archiveStore, archiveId, "restored", now);
    return { outcome: "stored", candidateKey: marked.candidate_key, archiveId, status: marked.status };
  }
  return { outcome: "conflict", error: "Revenue Bridge changed during restore." };
}

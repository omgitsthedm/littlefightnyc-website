import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import {
  type DakotaWebsiteAuditReconciliationPatch,
  validateDakotaRevenueBridgeServerMutation,
} from "./revenue-bridge-schema.ts";
import {
  type DakotaRevenueBridgeMutationResult,
  type DakotaRevenueBridgeStore,
} from "./revenue-bridge-store.ts";
import {
  reconcileWebsiteAuditDelivery,
  reconcileWebsiteAuditEngagement,
  reconcileWebsiteAuditFailed,
  reconcileWebsiteAuditGenerated,
  reconcileWebsiteAuditRequested,
  isConfidentWebsiteAuditEngagement,
  websiteAuditCandidateKey,
} from "./website-audit-bridge.ts";

export const DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA =
  "dakota.website-audit-outbox.v2" as const;
const DAKOTA_WEBSITE_AUDIT_OUTBOX_LEGACY_SCHEMA =
  "dakota.website-audit-outbox.v1" as const;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE =
  "dakota-website-audit-outbox" as const;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_KEY = "state/v1" as const;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT = 500;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT = 250;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_STATE_MAX_BYTES = 4 * 1024 * 1024;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS = 12;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_RETRY_BATCH_LIMIT = 8;
export const DAKOTA_WEBSITE_AUDIT_OUTBOX_FAILED_RETENTION_DAYS = 30;

const WRITE_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  6 * 60 * 60_000,
] as const;

export type DakotaWebsiteAuditOutboxStatus = "pending" | "failed";
export type DakotaWebsiteAuditOutboxErrorCode =
  | "storage_unavailable"
  | "capacity"
  | "conflict"
  | "version_conflict"
  | "not_found"
  | "invalid_transition"
  | "dead_letter_capacity";

export interface DakotaWebsiteAuditOutboxEntry {
  entry_id: string;
  candidate_key: string;
  patch_type: DakotaWebsiteAuditReconciliationPatch["patch_type"];
  patch: DakotaWebsiteAuditReconciliationPatch;
  fact_at: string;
  payload_hash: string;
  created_at: string;
  updated_at: string;
  attempts: number;
  status: DakotaWebsiteAuditOutboxStatus;
  next_retry_at: string | null;
  last_error_code: DakotaWebsiteAuditOutboxErrorCode | null;
  failed_at: string | null;
  surfaced_at: string | null;
  retention_until: string | null;
}

export interface DakotaWebsiteAuditOutboxEnvelope {
  schema_version: typeof DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA;
  updated_at: string;
  entries: Record<string, DakotaWebsiteAuditOutboxEntry>;
}

export type DakotaWebsiteAuditOutboxStore = Pick<
  Store,
  "getWithMetadata" | "setJSON"
>;

export interface DakotaWebsiteAuditOutboxDependencies {
  getOutboxStore: () => DakotaWebsiteAuditOutboxStore;
  getRevenueBridgeStore: () => DakotaRevenueBridgeStore;
  now?: () => Date;
  maximumEntries?: number;
  maximumDeadLetters?: number;
  maximumStateBytes?: number;
  deliverPatch?: (
    patch: DakotaWebsiteAuditReconciliationPatch,
  ) => Promise<DakotaRevenueBridgeMutationResult>;
}

export interface DakotaWebsiteAuditOutboxEnqueueResult {
  outcome: "enqueued" | "deduplicated" | "superseded";
  entry: DakotaWebsiteAuditOutboxEntry;
}

export interface DakotaWebsiteAuditOutboxAttemptResult {
  outcome: "delivered" | "pending" | "failed" | "missing" | "not_due" | "superseded";
  entry_id: string;
  attempts: number;
  next_retry_at: string | null;
  last_error_code: DakotaWebsiteAuditOutboxErrorCode | null;
}

export interface DakotaWebsiteAuditOutboxRetryResult {
  scanned: number;
  due: number;
  attempted: number;
  delivered: number;
  pending: number;
  failed: number;
  superseded: number;
}

export interface DakotaWebsiteAuditOutboxOperationsEntry {
  entry_id: string;
  candidate_key: string;
  patch_type: DakotaWebsiteAuditOutboxEntry["patch_type"];
  fact_at: string;
  created_at: string;
  updated_at: string;
  attempts: number;
  status: DakotaWebsiteAuditOutboxStatus;
  next_retry_at: string | null;
  last_error_code: DakotaWebsiteAuditOutboxErrorCode | null;
  failed_at: string | null;
  surfaced_at: string | null;
  retention_until: string | null;
  can_redrive: boolean;
  can_acknowledge: boolean;
}

export interface DakotaWebsiteAuditOutboxCapacitySummary {
  active_used: number;
  active_limit: number;
  active_available: number;
  dead_letter_used: number;
  dead_letter_limit: number;
  dead_letter_available: number;
  overdue_dead_letters: number;
  state_bytes: number;
  state_byte_limit: number;
  failed_retention_days: number;
}

export interface DakotaWebsiteAuditOutboxOperationsSummary {
  checked_at: string;
  total: number;
  pending: number;
  failed: number;
  invalid: number;
  oldest_pending_at: string | null;
  capacity: DakotaWebsiteAuditOutboxCapacitySummary;
  entries: DakotaWebsiteAuditOutboxOperationsEntry[];
}

export interface DakotaWebsiteAuditOutboxOperatorResult {
  outcome: "redriven" | "acknowledged" | "missing" | "not_failed" | "not_surfaced";
  entry_id: string;
  delivery?: DakotaWebsiteAuditOutboxAttemptResult;
}

interface LoadedOutbox {
  envelope: DakotaWebsiteAuditOutboxEnvelope | null;
  etag: string | null;
}

export class InvalidDakotaWebsiteAuditOutboxError extends Error {}
export class DakotaWebsiteAuditOutboxCapacityError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" &&
    value.length <= 64 &&
    /(?:Z|[+-]\d{2}:\d{2})$/u.test(value) &&
    Number.isFinite(Date.parse(value));
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) =>
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function payloadHash(patch: DakotaWebsiteAuditReconciliationPatch): string {
  return digest(canonicalJson(patch));
}

function entryId(candidateKey: string, patchType: string): string {
  return digest(`${candidateKey}\u0000${patchType}`);
}

function factTimestamp(patch: DakotaWebsiteAuditReconciliationPatch): string {
  switch (patch.patch_type) {
    case "requested": return patch.requested_at;
    case "generated": return patch.generated_at;
    case "failed": return patch.failed_at;
    case "delivery": return patch.updated_at;
    case "engagement": return patch.observed_at;
  }
}

function redactContactText(value: string): string {
  return value
    .replace(
      /\b[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+\b/giu,
      "contact detail redacted",
    )
    .replace(
      /(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/gu,
      "contact detail redacted",
    );
}

function withoutContactDetails(
  patch: DakotaWebsiteAuditReconciliationPatch,
): DakotaWebsiteAuditReconciliationPatch {
  if (patch.patch_type === "generated") {
    return {
      ...patch,
      summary: redactContactText(patch.summary),
      findings: patch.findings.map((finding) => ({
        ...finding,
        summary: redactContactText(finding.summary),
      })),
    };
  }
  if (patch.patch_type === "failed") {
    return { ...patch, failure_reason: redactContactText(patch.failure_reason) };
  }
  if (patch.patch_type === "delivery") {
    return { ...patch, failure_reason: redactContactText(patch.failure_reason) };
  }
  return patch;
}

function normalizedPatch(
  patch: DakotaWebsiteAuditReconciliationPatch,
): { candidateKey: string; patch: DakotaWebsiteAuditReconciliationPatch } {
  const contactSafePatch = withoutContactDetails(patch);
  const candidateKey = websiteAuditCandidateKey(contactSafePatch.report_id);
  const validation = validateDakotaRevenueBridgeServerMutation({
    type: "reconcile_website_audit",
    candidate_key: candidateKey,
    patch: contactSafePatch,
  });
  if (!validation.valid || validation.value.type !== "reconcile_website_audit") {
    throw new TypeError(validation.valid
      ? "Website Audit outbox received the wrong mutation type."
      : validation.error);
  }
  if (validation.value.patch.report_id !== contactSafePatch.report_id) {
    throw new TypeError("Website Audit outbox report identity is invalid.");
  }
  if (
    validation.value.patch.patch_type === "delivery" &&
    validation.value.patch.status === "pending"
  ) {
    throw new TypeError("Website Audit outbox only accepts final delivery facts.");
  }
  return { candidateKey, patch: validation.value.patch };
}

function validateEntry(
  value: unknown,
  legacySchema = false,
): DakotaWebsiteAuditOutboxEntry | null {
  const fields = [
    "entry_id",
    "candidate_key",
    "patch_type",
    "patch",
    "fact_at",
    "payload_hash",
    "created_at",
    "updated_at",
    "attempts",
    "status",
    "next_retry_at",
    "last_error_code",
    ...(legacySchema ? [] : ["failed_at", "surfaced_at", "retention_until"]),
  ];
  if (!isRecord(value) || !exactKeys(value, fields)) return null;

  if (
    typeof value.entry_id !== "string" ||
    !/^[0-9a-f]{32}$/u.test(value.entry_id) ||
    typeof value.candidate_key !== "string" ||
    typeof value.patch_type !== "string" ||
    !isTimestamp(value.fact_at) ||
    typeof value.payload_hash !== "string" ||
    !/^[0-9a-f]{32}$/u.test(value.payload_hash) ||
    !isTimestamp(value.created_at) ||
    !isTimestamp(value.updated_at) ||
    !Number.isInteger(value.attempts) ||
    (value.attempts as number) < 0 ||
    (value.attempts as number) > DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS ||
    !["pending", "failed"].includes(String(value.status)) ||
    (value.next_retry_at !== null && !isTimestamp(value.next_retry_at)) ||
    ![
      null,
      "storage_unavailable",
      "capacity",
      "conflict",
      "version_conflict",
      "not_found",
      "invalid_transition",
      "dead_letter_capacity",
    ].includes(value.last_error_code as string | null)
  ) return null;

  let normalized: ReturnType<typeof normalizedPatch>;
  try {
    normalized = normalizedPatch(value.patch as DakotaWebsiteAuditReconciliationPatch);
  } catch {
    return null;
  }
  const patch = normalized.patch;
  const expectedId = entryId(normalized.candidateKey, patch.patch_type);
  const expectedHash = payloadHash(patch);
  const failedAt = legacySchema && value.status === "failed"
    ? value.updated_at as string
    : value.failed_at;
  const surfacedAt = legacySchema ? null : value.surfaced_at;
  const retentionUntil = legacySchema && value.status === "failed"
    ? new Date(
      Date.parse(value.updated_at as string) +
        DAKOTA_WEBSITE_AUDIT_OUTBOX_FAILED_RETENTION_DAYS * 24 * 60 * 60_000,
    ).toISOString()
    : value.retention_until;
  if (
    value.entry_id !== expectedId ||
    value.candidate_key !== normalized.candidateKey ||
    value.patch_type !== patch.patch_type ||
    value.fact_at !== factTimestamp(patch) ||
    value.payload_hash !== expectedHash ||
    Date.parse(value.updated_at) < Date.parse(value.created_at) ||
    (value.status === "pending" && value.next_retry_at === null) ||
    (value.status === "failed" && value.next_retry_at !== null) ||
    (failedAt !== null && !isTimestamp(failedAt)) ||
    (surfacedAt !== null && !isTimestamp(surfacedAt)) ||
    (retentionUntil !== null && !isTimestamp(retentionUntil)) ||
    (value.status === "pending" &&
      (failedAt !== null || surfacedAt !== null || retentionUntil !== null)) ||
    (value.status === "failed" &&
      (failedAt === null || retentionUntil === null ||
        Date.parse(retentionUntil as string) <= Date.parse(failedAt as string))) ||
    (surfacedAt !== null && failedAt !== null &&
      Date.parse(surfacedAt as string) < Date.parse(failedAt as string))
  ) return null;

  return {
    entry_id: value.entry_id,
    candidate_key: value.candidate_key,
    patch_type: patch.patch_type,
    patch,
    fact_at: value.fact_at,
    payload_hash: value.payload_hash,
    created_at: value.created_at,
    updated_at: value.updated_at,
    attempts: value.attempts as number,
    status: value.status as DakotaWebsiteAuditOutboxStatus,
    next_retry_at: value.next_retry_at as string | null,
    last_error_code: value.last_error_code as DakotaWebsiteAuditOutboxErrorCode | null,
    failed_at: failedAt as string | null,
    surfaced_at: surfacedAt as string | null,
    retention_until: retentionUntil as string | null,
  };
}

function encodedSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

function validateEnvelope(value: unknown): DakotaWebsiteAuditOutboxEnvelope | null {
  if (!isRecord(value) || !exactKeys(value, ["schema_version", "updated_at", "entries"])) {
    return null;
  }
  if (
    ![
      DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      DAKOTA_WEBSITE_AUDIT_OUTBOX_LEGACY_SCHEMA,
    ].includes(value.schema_version as typeof DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA) ||
    !isTimestamp(value.updated_at) ||
    !isRecord(value.entries)
  ) return null;
  const rawEntries = value.entries;
  const keys = Object.keys(rawEntries);
  if (
    keys.length > DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT +
      DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT ||
    encodedSize(value) > DAKOTA_WEBSITE_AUDIT_OUTBOX_STATE_MAX_BYTES
  ) return null;
  const entries: Record<string, DakotaWebsiteAuditOutboxEntry> = Object.create(null);
  const legacySchema = value.schema_version === DAKOTA_WEBSITE_AUDIT_OUTBOX_LEGACY_SCHEMA;
  for (const key of keys) {
    const entry = validateEntry(rawEntries[key], legacySchema);
    if (!entry || entry.entry_id !== key || Date.parse(entry.updated_at) > Date.parse(value.updated_at)) {
      return null;
    }
    entries[key] = entry;
  }
  const pending = Object.values(entries).filter((entry) => entry.status === "pending").length;
  const failed = Object.values(entries).filter((entry) => entry.status === "failed").length;
  if (
    pending > DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT ||
    failed > DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT
  ) return null;
  return {
    schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
    updated_at: value.updated_at,
    entries,
  };
}

async function loadOutbox(store: DakotaWebsiteAuditOutboxStore): Promise<LoadedOutbox> {
  const result = await store.getWithMetadata(DAKOTA_WEBSITE_AUDIT_OUTBOX_KEY, {
    type: "json",
  });
  if (!result) return { envelope: null, etag: null };
  const envelope = validateEnvelope(result.data);
  if (!envelope || !result.etag) {
    throw new InvalidDakotaWebsiteAuditOutboxError(
      "Website Audit outbox state failed validation.",
    );
  }
  return { envelope, etag: result.etag };
}

function emptyEntries(): Record<string, DakotaWebsiteAuditOutboxEntry> {
  return Object.create(null) as Record<string, DakotaWebsiteAuditOutboxEntry>;
}

function monotonicTimestamp(now: Date, previous: string | null, minimum: string): string {
  const nowTime = now.getTime();
  if (!Number.isFinite(nowTime)) throw new TypeError("Website Audit outbox now() is invalid.");
  const previousTime = previous === null ? Number.NEGATIVE_INFINITY : Date.parse(previous) + 1;
  return new Date(Math.max(nowTime, previousTime, Date.parse(minimum))).toISOString();
}

function maximumEntries(dependencies: DakotaWebsiteAuditOutboxDependencies): number {
  const value = dependencies.maximumEntries ?? DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT;
  if (!Number.isInteger(value) || value < 1 || value > DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT) {
    throw new TypeError("Website Audit outbox maximumEntries is invalid.");
  }
  return value;
}

function maximumDeadLetters(dependencies: DakotaWebsiteAuditOutboxDependencies): number {
  const value = dependencies.maximumDeadLetters ??
    DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT;
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT
  ) {
    throw new TypeError("Website Audit outbox maximumDeadLetters is invalid.");
  }
  return value;
}

function maximumStateBytes(dependencies: DakotaWebsiteAuditOutboxDependencies): number {
  const value = dependencies.maximumStateBytes ?? DAKOTA_WEBSITE_AUDIT_OUTBOX_STATE_MAX_BYTES;
  if (!Number.isInteger(value) || value < 256 || value > DAKOTA_WEBSITE_AUDIT_OUTBOX_STATE_MAX_BYTES) {
    throw new TypeError("Website Audit outbox maximumStateBytes is invalid.");
  }
  return value;
}

async function writeOutbox(
  store: DakotaWebsiteAuditOutboxStore,
  current: LoadedOutbox,
  envelope: DakotaWebsiteAuditOutboxEnvelope,
): Promise<boolean> {
  const result = await store.setJSON(
    DAKOTA_WEBSITE_AUDIT_OUTBOX_KEY,
    envelope,
    {
      ...(current.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true }),
      metadata: {
        schemaVersion: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
        updatedAt: envelope.updated_at,
        pending: Object.values(envelope.entries).filter((entry) => entry.status === "pending").length,
        failed: Object.values(envelope.entries).filter((entry) => entry.status === "failed").length,
        activeLimit: DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT,
        deadLetterLimit: DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT,
      },
    },
  );
  return result.modified;
}

function newEntry(
  candidateKey: string,
  patch: DakotaWebsiteAuditReconciliationPatch,
  timestamp: string,
): DakotaWebsiteAuditOutboxEntry {
  return {
    entry_id: entryId(candidateKey, patch.patch_type),
    candidate_key: candidateKey,
    patch_type: patch.patch_type,
    patch,
    fact_at: factTimestamp(patch),
    payload_hash: payloadHash(patch),
    created_at: timestamp,
    updated_at: timestamp,
    attempts: 0,
    status: "pending",
    next_retry_at: timestamp,
    last_error_code: null,
    failed_at: null,
    surfaced_at: null,
    retention_until: null,
  };
}

function mergedEngagementPatch(
  stored: DakotaWebsiteAuditReconciliationPatch,
  incoming: DakotaWebsiteAuditReconciliationPatch,
): DakotaWebsiteAuditReconciliationPatch {
  if (stored.patch_type !== "engagement" || incoming.patch_type !== "engagement") {
    return incoming;
  }
  const merged: DakotaWebsiteAuditReconciliationPatch = {
    ...incoming,
    observed_at: Date.parse(stored.observed_at) > Date.parse(incoming.observed_at)
      ? stored.observed_at
      : incoming.observed_at,
    first_view_at: Date.parse(stored.first_view_at) < Date.parse(incoming.first_view_at)
      ? stored.first_view_at
      : incoming.first_view_at,
    last_view_at: Date.parse(stored.last_view_at) > Date.parse(incoming.last_view_at)
      ? stored.last_view_at
      : incoming.last_view_at,
    total_views: Math.max(stored.total_views, incoming.total_views),
    max_scroll_depth: Math.max(stored.max_scroll_depth, incoming.max_scroll_depth),
    max_time_on_page_seconds: Math.max(
      stored.max_time_on_page_seconds,
      incoming.max_time_on_page_seconds,
    ),
  };
  return normalizedPatch(merged).patch;
}

export async function enqueueDakotaWebsiteAuditOutboxPatch(
  input: DakotaWebsiteAuditReconciliationPatch,
  dependencies: DakotaWebsiteAuditOutboxDependencies,
): Promise<DakotaWebsiteAuditOutboxEnqueueResult> {
  const normalized = normalizedPatch(input);
  const id = entryId(normalized.candidateKey, normalized.patch.patch_type);
  const store = dependencies.getOutboxStore();
  const entryLimit = maximumEntries(dependencies);
  maximumDeadLetters(dependencies);
  const byteLimit = maximumStateBytes(dependencies);
  let lastStorageError: unknown;

  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt += 1) {
    let current: LoadedOutbox;
    try {
      current = await loadOutbox(store);
    } catch (error) {
      if (error instanceof InvalidDakotaWebsiteAuditOutboxError) throw error;
      lastStorageError = error;
      continue;
    }
    const existing = current.envelope?.entries[id];
    const patch = existing
      ? mergedEngagementPatch(existing.patch, normalized.patch)
      : normalized.patch;
    const hash = payloadHash(patch);
    if (existing?.payload_hash === hash) {
      return { outcome: "deduplicated", entry: existing };
    }
    if (existing && patch.patch_type !== "engagement") {
      const comparison = Date.parse(factTimestamp(patch)) - Date.parse(existing.fact_at);
      if (comparison < 0) return { outcome: "superseded", entry: existing };
      if (comparison === 0) {
        throw new TypeError("Website Audit outbox received conflicting facts for one timestamp.");
      }
    }

    const entries = current.envelope
      ? { ...current.envelope.entries }
      : emptyEntries();
    const activeEntries = Object.values(entries)
      .filter((entry) => entry.status === "pending").length;
    const addsActiveEntry = !existing || existing.status === "failed";
    if (addsActiveEntry && activeEntries >= entryLimit) {
      throw new DakotaWebsiteAuditOutboxCapacityError(
        "Website Audit outbox entry capacity has been reached.",
      );
    }
    const writeAt = monotonicTimestamp(
      (dependencies.now ?? (() => new Date()))(),
      current.envelope?.updated_at ?? null,
      factTimestamp(patch),
    );
    const entry = newEntry(normalized.candidateKey, patch, writeAt);
    entries[id] = entry;
    const envelope: DakotaWebsiteAuditOutboxEnvelope = {
      schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      updated_at: writeAt,
      entries,
    };
    if (encodedSize(envelope) > byteLimit) {
      throw new DakotaWebsiteAuditOutboxCapacityError(
        "Website Audit outbox byte capacity has been reached.",
      );
    }
    try {
      if (await writeOutbox(store, current, envelope)) {
        return { outcome: "enqueued", entry };
      }
    } catch (error) {
      lastStorageError = error;
    }
  }
  if (lastStorageError instanceof Error) throw lastStorageError;
  throw new Error("website_audit_outbox_conflict");
}

async function deliverPatch(
  patch: DakotaWebsiteAuditReconciliationPatch,
  dependencies: DakotaWebsiteAuditOutboxDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  if (dependencies.deliverPatch) return dependencies.deliverPatch(patch);
  const bridgeDependencies = {
    getStore: dependencies.getRevenueBridgeStore,
    now: dependencies.now,
  };
  switch (patch.patch_type) {
    case "requested":
      return reconcileWebsiteAuditRequested({
        slug: patch.report_id,
        domain: patch.domain,
        requestedAt: patch.requested_at,
      }, bridgeDependencies);
    case "generated": {
      const { patch_type: _patchType, report_id: reportId, ...generated } = patch;
      return reconcileWebsiteAuditGenerated({ slug: reportId, patch: generated }, bridgeDependencies);
    }
    case "failed":
      return reconcileWebsiteAuditFailed({
        slug: patch.report_id,
        domain: patch.domain,
        failedAt: patch.failed_at,
        reason: patch.failure_reason,
      }, bridgeDependencies);
    case "delivery":
      if (patch.status === "pending") {
        throw new TypeError("Website Audit outbox cannot deliver a pending delivery fact.");
      }
      return reconcileWebsiteAuditDelivery({
        slug: patch.report_id,
        domain: patch.domain,
        status: patch.status,
        updatedAt: patch.updated_at,
        failureReason: patch.failure_reason || undefined,
      }, bridgeDependencies);
    case "engagement":
      return reconcileWebsiteAuditEngagement({
        slug: patch.report_id,
        domain: patch.domain,
        observedAt: patch.observed_at,
        firstViewAt: patch.first_view_at,
        lastViewAt: patch.last_view_at,
        totalViews: patch.total_views,
        maxScrollDepth: patch.max_scroll_depth,
        maxTimeOnPageSeconds: patch.max_time_on_page_seconds,
      }, bridgeDependencies);
  }
}

function retryAt(attempts: number, now: Date): string | null {
  if (attempts >= DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS) return null;
  const delay = RETRY_DELAYS_MS[
    Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MS.length - 1)
  ] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
  return new Date(now.getTime() + delay).toISOString();
}

function failedRetentionUntil(failedAt: string): string {
  return new Date(
    Date.parse(failedAt) +
      DAKOTA_WEBSITE_AUDIT_OUTBOX_FAILED_RETENTION_DAYS * 24 * 60 * 60_000,
  ).toISOString();
}

function errorCodeForResult(
  result: Exclude<DakotaRevenueBridgeMutationResult, { outcome: "stored" | "unchanged" }>,
): DakotaWebsiteAuditOutboxErrorCode {
  return result.outcome;
}

async function finalizeAttempt(
  entry: DakotaWebsiteAuditOutboxEntry,
  delivered: boolean,
  errorCode: DakotaWebsiteAuditOutboxErrorCode | null,
  dependencies: DakotaWebsiteAuditOutboxDependencies,
  now: Date,
): Promise<DakotaWebsiteAuditOutboxAttemptResult> {
  const store = dependencies.getOutboxStore();
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt += 1) {
    const current = await loadOutbox(store);
    const stored = current.envelope?.entries[entry.entry_id];
    if (!stored) {
      return {
        outcome: delivered ? "delivered" : "missing",
        entry_id: entry.entry_id,
        attempts: entry.attempts + Number(!delivered),
        next_retry_at: null,
        last_error_code: errorCode,
      };
    }
    if (stored.payload_hash !== entry.payload_hash) {
      return {
        outcome: "superseded",
        entry_id: stored.entry_id,
        attempts: stored.attempts,
        next_retry_at: stored.next_retry_at,
        last_error_code: stored.last_error_code,
      };
    }
    const entries = { ...(current.envelope?.entries ?? emptyEntries()) };
    let resultEntry: DakotaWebsiteAuditOutboxEntry | null = null;
    if (delivered) {
      delete entries[entry.entry_id];
    } else {
      const requestedAttempts = Math.min(
        DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS,
        stored.attempts + 1,
      );
      const updatedAt = monotonicTimestamp(now, current.envelope?.updated_at ?? null, stored.fact_at);
      const terminalRequested = errorCode === "invalid_transition" ||
        requestedAttempts >= DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS;
      const deadLetters = Object.values(entries)
        .filter((candidate) =>
          candidate.entry_id !== stored.entry_id && candidate.status === "failed"
        ).length;
      const deadLetterFull = terminalRequested &&
        deadLetters >= maximumDeadLetters(dependencies);
      const terminal = terminalRequested && !deadLetterFull;
      const attempts = deadLetterFull
        ? Math.min(requestedAttempts, DAKOTA_WEBSITE_AUDIT_OUTBOX_MAX_ATTEMPTS - 1)
        : requestedAttempts;
      resultEntry = {
        ...stored,
        attempts,
        status: terminal ? "failed" : "pending",
        next_retry_at: terminal ? null : retryAt(attempts, now),
        last_error_code: deadLetterFull ? "dead_letter_capacity" : errorCode,
        updated_at: updatedAt,
        failed_at: terminal ? updatedAt : null,
        surfaced_at: null,
        retention_until: terminal ? failedRetentionUntil(updatedAt) : null,
      };
      entries[entry.entry_id] = resultEntry;
    }
    const writeAt = monotonicTimestamp(
      now,
      current.envelope?.updated_at ?? null,
      resultEntry?.updated_at ?? stored.fact_at,
    );
    if (resultEntry && resultEntry.updated_at !== writeAt) {
      resultEntry = { ...resultEntry, updated_at: writeAt };
      entries[entry.entry_id] = resultEntry;
    }
    const envelope: DakotaWebsiteAuditOutboxEnvelope = {
      schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      updated_at: writeAt,
      entries,
    };
    if (await writeOutbox(store, current, envelope)) {
      if (!resultEntry) {
        return {
          outcome: "delivered",
          entry_id: entry.entry_id,
          attempts: entry.attempts,
          next_retry_at: null,
          last_error_code: null,
        };
      }
      return {
        outcome: resultEntry.status,
        entry_id: resultEntry.entry_id,
        attempts: resultEntry.attempts,
        next_retry_at: resultEntry.next_retry_at,
        last_error_code: resultEntry.last_error_code,
      };
    }
  }
  throw new Error("website_audit_outbox_finalize_conflict");
}

export async function attemptDakotaWebsiteAuditOutboxEntry(
  id: string,
  dependencies: DakotaWebsiteAuditOutboxDependencies,
  ignoreSchedule = false,
): Promise<DakotaWebsiteAuditOutboxAttemptResult> {
  if (!/^[0-9a-f]{32}$/u.test(id)) throw new TypeError("Website Audit outbox entry ID is invalid.");
  const now = (dependencies.now ?? (() => new Date()))();
  const loaded = await loadOutbox(dependencies.getOutboxStore());
  const entry = loaded.envelope?.entries[id];
  if (!entry) {
    return {
      outcome: "missing",
      entry_id: id,
      attempts: 0,
      next_retry_at: null,
      last_error_code: null,
    };
  }
  if (entry.status === "failed") {
    return {
      outcome: "failed",
      entry_id: id,
      attempts: entry.attempts,
      next_retry_at: null,
      last_error_code: entry.last_error_code,
    };
  }
  if (!ignoreSchedule && entry.next_retry_at && Date.parse(entry.next_retry_at) > now.getTime()) {
    return {
      outcome: "not_due",
      entry_id: id,
      attempts: entry.attempts,
      next_retry_at: entry.next_retry_at,
      last_error_code: entry.last_error_code,
    };
  }

  if (
    entry.patch.patch_type === "engagement" &&
    !isConfidentWebsiteAuditEngagement({
      maxScrollDepth: entry.patch.max_scroll_depth,
      maxTimeOnPageSeconds: entry.patch.max_time_on_page_seconds,
    })
  ) {
    return finalizeAttempt(entry, true, null, dependencies, now);
  }

  let delivery: DakotaRevenueBridgeMutationResult;
  try {
    delivery = await deliverPatch(entry.patch, dependencies);
  } catch {
    return finalizeAttempt(entry, false, "storage_unavailable", dependencies, now);
  }
  if (delivery.outcome === "stored" || delivery.outcome === "unchanged") {
    return finalizeAttempt(entry, true, null, dependencies, now);
  }
  return finalizeAttempt(entry, false, errorCodeForResult(delivery), dependencies, now);
}

export async function retryPendingDakotaWebsiteAuditOutbox(
  dependencies: DakotaWebsiteAuditOutboxDependencies,
  requestedLimit = DAKOTA_WEBSITE_AUDIT_OUTBOX_RETRY_BATCH_LIMIT,
): Promise<DakotaWebsiteAuditOutboxRetryResult> {
  const now = (dependencies.now ?? (() => new Date()))();
  const loaded = await loadOutbox(dependencies.getOutboxStore());
  const entries = Object.values(loaded.envelope?.entries ?? {});
  const due = entries
    .filter((entry) =>
      entry.status === "pending" &&
      entry.next_retry_at !== null &&
      Date.parse(entry.next_retry_at) <= now.getTime()
    )
    .sort((left, right) =>
      left.fact_at.localeCompare(right.fact_at) ||
      (left.next_retry_at ?? "").localeCompare(right.next_retry_at ?? "") ||
      left.entry_id.localeCompare(right.entry_id)
    );
  const limit = Math.max(
    0,
    Math.min(requestedLimit, DAKOTA_WEBSITE_AUDIT_OUTBOX_RETRY_BATCH_LIMIT),
  );
  let delivered = 0;
  let pending = 0;
  let failed = 0;
  let superseded = 0;
  for (const entry of due.slice(0, limit)) {
    const result = await attemptDakotaWebsiteAuditOutboxEntry(
      entry.entry_id,
      { ...dependencies, now: () => now },
    );
    if (result.outcome === "delivered") delivered += 1;
    else if (result.outcome === "failed") failed += 1;
    else if (result.outcome === "superseded") superseded += 1;
    else pending += 1;
  }
  return {
    scanned: entries.length,
    due: due.length,
    attempted: Math.min(due.length, limit),
    delivered,
    pending,
    failed,
    superseded,
  };
}

async function loadOutboxWithSurfacedFailures(
  store: DakotaWebsiteAuditOutboxStore,
  now: Date,
): Promise<LoadedOutbox> {
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt += 1) {
    const current = await loadOutbox(store);
    const unsurfaced = Object.values(current.envelope?.entries ?? {})
      .filter((entry) => entry.status === "failed" && entry.surfaced_at === null);
    if (unsurfaced.length === 0) return current;

    const entries = { ...(current.envelope?.entries ?? emptyEntries()) };
    const writeAt = monotonicTimestamp(
      now,
      current.envelope?.updated_at ?? null,
      unsurfaced.reduce(
        (latest, entry) => entry.failed_at && entry.failed_at > latest
          ? entry.failed_at
          : latest,
        unsurfaced[0]?.failed_at ?? unsurfaced[0]!.updated_at,
      ),
    );
    for (const entry of unsurfaced) {
      entries[entry.entry_id] = {
        ...entry,
        surfaced_at: writeAt,
        updated_at: writeAt,
      };
    }
    const envelope: DakotaWebsiteAuditOutboxEnvelope = {
      schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      updated_at: writeAt,
      entries,
    };
    if (await writeOutbox(store, current, envelope)) {
      return { envelope, etag: null };
    }
  }
  throw new Error("website_audit_outbox_surface_conflict");
}

export async function redriveFailedDakotaWebsiteAuditOutboxEntry(
  id: string,
  dependencies: DakotaWebsiteAuditOutboxDependencies,
): Promise<DakotaWebsiteAuditOutboxOperatorResult> {
  if (!/^[0-9a-f]{32}$/u.test(id)) {
    throw new TypeError("Website Audit outbox entry ID is invalid.");
  }
  const store = dependencies.getOutboxStore();
  const now = (dependencies.now ?? (() => new Date()))();
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt += 1) {
    const current = await loadOutbox(store);
    const entry = current.envelope?.entries[id];
    if (!entry) return { outcome: "missing", entry_id: id };
    if (entry.status !== "failed") return { outcome: "not_failed", entry_id: id };
    if (entry.surfaced_at === null) return { outcome: "not_surfaced", entry_id: id };

    const writeAt = monotonicTimestamp(
      now,
      current.envelope?.updated_at ?? null,
      entry.fact_at,
    );
    const entries = { ...(current.envelope?.entries ?? emptyEntries()) };
    entries[id] = {
      ...entry,
      attempts: 0,
      status: "pending",
      next_retry_at: writeAt,
      last_error_code: null,
      updated_at: writeAt,
      failed_at: null,
      surfaced_at: null,
      retention_until: null,
    };
    const envelope: DakotaWebsiteAuditOutboxEnvelope = {
      schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      updated_at: writeAt,
      entries,
    };
    if (await writeOutbox(store, current, envelope)) {
      const delivery = await attemptDakotaWebsiteAuditOutboxEntry(
        id,
        { ...dependencies, now: () => now },
        true,
      );
      return { outcome: "redriven", entry_id: id, delivery };
    }
  }
  throw new Error("website_audit_outbox_redrive_conflict");
}

export async function acknowledgeFailedDakotaWebsiteAuditOutboxEntry(
  id: string,
  store: DakotaWebsiteAuditOutboxStore,
  now = new Date(),
): Promise<DakotaWebsiteAuditOutboxOperatorResult> {
  if (!/^[0-9a-f]{32}$/u.test(id)) {
    throw new TypeError("Website Audit outbox entry ID is invalid.");
  }
  for (let attempt = 0; attempt < WRITE_ATTEMPTS; attempt += 1) {
    const current = await loadOutbox(store);
    const entry = current.envelope?.entries[id];
    if (!entry) return { outcome: "missing", entry_id: id };
    if (entry.status !== "failed") return { outcome: "not_failed", entry_id: id };
    if (entry.surfaced_at === null) return { outcome: "not_surfaced", entry_id: id };

    const entries = { ...(current.envelope?.entries ?? emptyEntries()) };
    delete entries[id];
    const writeAt = monotonicTimestamp(
      now,
      current.envelope?.updated_at ?? null,
      entry.surfaced_at,
    );
    const envelope: DakotaWebsiteAuditOutboxEnvelope = {
      schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
      updated_at: writeAt,
      entries,
    };
    if (await writeOutbox(store, current, envelope)) {
      return { outcome: "acknowledged", entry_id: id };
    }
  }
  throw new Error("website_audit_outbox_acknowledge_conflict");
}

export async function summarizeDakotaWebsiteAuditOutbox(
  store: DakotaWebsiteAuditOutboxStore,
  now = new Date(),
  requestedLimit = 50,
): Promise<DakotaWebsiteAuditOutboxOperationsSummary> {
  const loaded = await loadOutboxWithSurfacedFailures(store, now);
  const entries = Object.values(loaded.envelope?.entries ?? {});
  const pending = entries.filter((entry) => entry.status === "pending");
  const failed = entries.filter((entry) => entry.status === "failed");
  const limit = Math.max(1, Math.min(requestedLimit, 100));
  const summaries = entries
    .map((entry): DakotaWebsiteAuditOutboxOperationsEntry => ({
      entry_id: entry.entry_id,
      candidate_key: entry.candidate_key,
      patch_type: entry.patch_type,
      fact_at: entry.fact_at,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      attempts: entry.attempts,
      status: entry.status,
      next_retry_at: entry.next_retry_at,
      last_error_code: entry.last_error_code,
      failed_at: entry.failed_at,
      surfaced_at: entry.surfaced_at,
      retention_until: entry.retention_until,
      can_redrive: entry.status === "failed" && entry.surfaced_at !== null,
      can_acknowledge: entry.status === "failed" && entry.surfaced_at !== null,
    }))
    .sort((left, right) =>
      Number(right.status === "failed") - Number(left.status === "failed") ||
      right.created_at.localeCompare(left.created_at) ||
      left.entry_id.localeCompare(right.entry_id)
    )
    .slice(0, limit);
  return {
    checked_at: now.toISOString(),
    total: entries.length,
    pending: pending.length,
    failed: failed.length,
    invalid: 0,
    oldest_pending_at: pending.length === 0
      ? null
      : pending.reduce((oldest, entry) =>
        entry.created_at < oldest ? entry.created_at : oldest,
      pending[0]!.created_at),
    capacity: {
      active_used: pending.length,
      active_limit: DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT,
      active_available: Math.max(
        0,
        DAKOTA_WEBSITE_AUDIT_OUTBOX_ENTRY_LIMIT - pending.length,
      ),
      dead_letter_used: failed.length,
      dead_letter_limit: DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT,
      dead_letter_available: Math.max(
        0,
        DAKOTA_WEBSITE_AUDIT_OUTBOX_DEAD_LETTER_LIMIT - failed.length,
      ),
      overdue_dead_letters: failed.filter((entry) =>
        entry.retention_until !== null && Date.parse(entry.retention_until) <= now.getTime()
      ).length,
      state_bytes: encodedSize(loaded.envelope ?? {
        schema_version: DAKOTA_WEBSITE_AUDIT_OUTBOX_SCHEMA,
        updated_at: now.toISOString(),
        entries: {},
      }),
      state_byte_limit: DAKOTA_WEBSITE_AUDIT_OUTBOX_STATE_MAX_BYTES,
      failed_retention_days: DAKOTA_WEBSITE_AUDIT_OUTBOX_FAILED_RETENTION_DAYS,
    },
    entries: summaries,
  };
}

export function websiteAuditOutboxEntryId(
  reportId: string,
  patchType: DakotaWebsiteAuditReconciliationPatch["patch_type"],
): string {
  return entryId(websiteAuditCandidateKey(reportId), patchType);
}

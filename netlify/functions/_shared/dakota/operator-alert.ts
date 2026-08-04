import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import type { Store } from "@netlify/blobs";

import type { DakotaIngressAlert } from "./ingress-receipts.ts";

const OPERATOR_EMAIL = "hello@littlefightnyc.com";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_ENDPOINT = `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(OPERATOR_EMAIL)}/messages/send`;

export const DAKOTA_OPERATOR_ALERT_STORE = "dakota-operator-alerts" as const;
export const DAKOTA_OPERATOR_ALERT_SCHEMA = "dakota.operator-alert.v1" as const;
export const DAKOTA_OPERATOR_ALERT_DUE_PREFIX = "due/v1/" as const;
export const DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY = "indexes/v1/alert-migration" as const;

const ALERT_PREFIX = "alerts/v1/";
const ALERT_DUE_SCHEMA = "dakota.operator-alert-due.v1" as const;
const ALERT_INDEX_MIGRATION_SCHEMA = "dakota.operator-alert-index-migration.v1" as const;
const INDEX_MIGRATION_SHARDS = 256;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [250, 1_000, 3_000] as const;
const ALERT_RETRY_DELAYS_MS = [5 * 60_000, 15 * 60_000, 60 * 60_000, 6 * 60 * 60_000, 24 * 60 * 60_000] as const;
export const DAKOTA_OPERATOR_ALERT_RETRY_LIMIT = 10;
const DAKOTA_APP_URL = "https://www.dakota.littlefightnyc.com/app/?view=do-next";

export type DakotaOperatorAlertDelivery =
  | { status: "sent"; providerRef: string | null }
  | { status: "not_configured" }
  | { status: "failed"; reason: "oauth" | "provider" | "transport" };

export type DakotaOperatorAlertOnceResult =
  | DakotaOperatorAlertDelivery
  | { status: "deduplicated" }
  | { status: "queued" };

export interface DakotaOperatorAlertDependencies {
  getEnv?: (name: string) => string | undefined;
  fetch?: typeof globalThis.fetch;
  wait?: (milliseconds: number) => Promise<void>;
  maxAttempts?: number;
  requestTimeoutMs?: number;
}

export type DakotaOperatorAlertStore = Pick<Store, "delete" | "getWithMetadata" | "setJSON" | "list">;

export interface DakotaIngressOperatorAlertDependencies
  extends DakotaOperatorAlertDependencies {
  getStore: () => DakotaOperatorAlertStore;
  now?: () => Date;
}

export interface DakotaOperatorAlertMarker {
  schema_version: typeof DAKOTA_OPERATOR_ALERT_SCHEMA;
  alert_id: string;
  receipt_id: string;
  kind: DakotaIngressAlert["kind"];
  source: string;
  created_at: string;
  updated_at: string;
  status: "reserved" | "sent" | "not_configured" | "failed";
  provider_ref: string | null;
  failure_reason: "oauth" | "provider" | "transport" | null;
  attempts: number;
  next_retry_at: string | null;
}

export interface DakotaOperatorAlertOperationsItem {
  alert_id: string;
  receipt_id: string;
  kind: DakotaIngressAlert["kind"];
  source: string;
  created_at: string;
  updated_at: string;
  status: DakotaOperatorAlertMarker["status"];
  attempts: number;
  next_retry_at: string | null;
  failure_reason: DakotaOperatorAlertMarker["failure_reason"];
}

export interface DakotaOperatorAlertOperationsSummary {
  checked_at: string;
  total: number;
  sent: number;
  pending: number;
  failed: number;
  not_configured: number;
  invalid: number;
  oldest_pending_at: string | null;
  alerts: DakotaOperatorAlertOperationsItem[];
}

interface DakotaOperatorAlertIndexMigration {
  schema_version: typeof ALERT_INDEX_MIGRATION_SCHEMA;
  next_shard: number;
  completed_at: string | null;
  updated_at: string;
}

function defaultGetEnv(name: string): string | undefined {
  return Netlify.env.get(name);
}

function boundedHeader(value: string, maximumLength: number): string {
  return value
    .replace(/[\r\n]+/gu, " ")
    .replace(/\s{2,}/gu, " ")
    .trim()
    .slice(0, maximumLength);
}

function boundedBody(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, " ")
    .replace(/\r\n?/gu, "\n")
    .trim()
    .slice(0, 8_000);
}

function base64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/gu, "-")
    .replace(/\//gu, "_")
    .replace(/=+$/gu, "");
}

function mimeMessage(subject: string, body: string): string {
  return [
    `From: Little Fight NYC <${OPERATOR_EMAIL}>`,
    `To: ${OPERATOR_EMAIL}`,
    `Subject: ${boundedHeader(subject, 160)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    boundedBody(body),
  ].join("\r\n");
}

async function defaultWait(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function fetchWithRetry(
  fetcher: typeof globalThis.fetch,
  wait: (milliseconds: number) => Promise<void>,
  input: string,
  init: RequestInit,
  maximumAttempts: number,
  requestTimeoutMs: number,
): Promise<Response> {
  let lastError: unknown;
  const attemptLimit = Math.max(1, Math.min(maximumAttempts, RETRY_DELAYS_MS.length));
  for (let attempt = 0; attempt < attemptLimit; attempt += 1) {
    try {
      const response = await fetcher(input, {
        ...init,
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (
        response.ok ||
        !RETRYABLE_STATUS.has(response.status) ||
        attempt === attemptLimit - 1
      ) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === attemptLimit - 1) throw error;
    }
    await wait(RETRY_DELAYS_MS[attempt] ?? 3_000);
  }
  throw lastError instanceof Error ? lastError : new Error("request_failed");
}

async function accessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  dependencies: DakotaOperatorAlertDependencies,
): Promise<string | null> {
  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const wait = dependencies.wait ?? defaultWait;
  let response: Response;
  try {
    response = await fetchWithRetry(
      fetcher,
      wait,
      GOOGLE_TOKEN_ENDPOINT,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      },
      dependencies.maxAttempts ?? RETRY_DELAYS_MS.length,
      dependencies.requestTimeoutMs ?? 10_000,
    );
  } catch {
    return null;
  }
  if (!response.ok) return null;
  try {
    const value = await response.json() as { access_token?: unknown };
    return typeof value.access_token === "string" && value.access_token.length > 0
      ? value.access_token
      : null;
  } catch {
    return null;
  }
}

export async function sendDakotaOperatorAlert(
  subject: string,
  body: string,
  dependencies: DakotaOperatorAlertDependencies = {},
): Promise<DakotaOperatorAlertDelivery> {
  const getEnv = dependencies.getEnv ?? defaultGetEnv;
  const clientId = getEnv("GMAIL_OAUTH_CLIENT_ID")?.trim() ?? "";
  const clientSecret = getEnv("GMAIL_OAUTH_CLIENT_SECRET")?.trim() ?? "";
  const refreshToken = getEnv("GMAIL_OAUTH_REFRESH_TOKEN")?.trim() ?? "";
  if (!clientId || !clientSecret || !refreshToken) return { status: "not_configured" };

  const token = await accessToken(clientId, clientSecret, refreshToken, dependencies);
  if (!token) return { status: "failed", reason: "oauth" };

  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const wait = dependencies.wait ?? defaultWait;
  let response: Response;
  try {
    response = await fetchWithRetry(
      fetcher,
      wait,
      GMAIL_SEND_ENDPOINT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: base64Url(mimeMessage(subject, body)) }),
      },
      dependencies.maxAttempts ?? RETRY_DELAYS_MS.length,
      dependencies.requestTimeoutMs ?? 10_000,
    );
  } catch {
    return { status: "failed", reason: "transport" };
  }
  if (!response.ok) return { status: "failed", reason: "provider" };

  try {
    const value = await response.json() as { id?: unknown };
    return {
      status: "sent",
      providerRef: typeof value.id === "string" ? value.id.slice(0, 200) : null,
    };
  } catch {
    return { status: "sent", providerRef: null };
  }
}

function alertId(alert: DakotaIngressAlert): string {
  return createHash("sha256")
    .update(`${alert.receiptId}:${alert.kind}`)
    .digest("hex")
    .slice(0, 32);
}

function alertCopy(alert: DakotaIngressAlert): { subject: string; body: string } {
  const source = boundedHeader(alert.source || "consented inbound", 80);
  const receipt = boundedHeader(alert.receiptId, 40);
  if (alert.kind === "failed") {
    return {
      subject: "[Dakota] Inbound receipt needs operator attention",
      body: [
        "Dakota retained a consented inbound receipt, but automatic persistence exhausted its retry budget.",
        `Source: ${source}`,
        `Receipt: ${receipt}`,
        `Review: ${DAKOTA_APP_URL}`,
        "No prospect outreach was sent.",
      ].join("\n\n"),
    };
  }
  if (alert.kind === "pending") {
    return {
      subject: "[Dakota] New inbound receipt is queued for retry",
      body: [
        "Dakota durably retained a consented inbound request, but the active operator record is still pending.",
        `Source: ${source}`,
        `Receipt: ${receipt}`,
        `Review: ${DAKOTA_APP_URL}`,
        "No prospect outreach was sent.",
      ].join("\n\n"),
    };
  }
  return {
    subject: "[Dakota] New consented inbound request",
    body: [
      "Dakota durably received a consented inbound request and saved it to the private operator notebook.",
      `Source: ${source}`,
      `Receipt: ${receipt}`,
      `Review: ${DAKOTA_APP_URL}`,
      "No prospect outreach was sent.",
    ].join("\n\n"),
  };
}

function markerFromDelivery(
  marker: DakotaOperatorAlertMarker,
  delivery: DakotaOperatorAlertDelivery,
  updatedAt: string,
): DakotaOperatorAlertMarker {
  return {
    ...marker,
    updated_at: updatedAt,
    status: delivery.status,
    provider_ref: delivery.status === "sent" ? delivery.providerRef : null,
    failure_reason: delivery.status === "failed" ? delivery.reason : null,
    next_retry_at: delivery.status === "sent" ? null : marker.next_retry_at,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && value.length <= 64 && Number.isFinite(Date.parse(value));
}

function normalizeMarker(value: unknown): DakotaOperatorAlertMarker | null {
  if (!isRecord(value)) return null;
  if (
    value.schema_version !== DAKOTA_OPERATOR_ALERT_SCHEMA ||
    typeof value.alert_id !== "string" || !/^[0-9a-f]{32}$/u.test(value.alert_id) ||
    typeof value.receipt_id !== "string" || !/^[0-9a-f]{32}$/u.test(value.receipt_id) ||
    !["received", "pending", "failed"].includes(String(value.kind)) ||
    typeof value.source !== "string" || value.source.length > 80 || /[\r\n<>\p{Cc}]/u.test(value.source) ||
    !isTimestamp(value.created_at) || !isTimestamp(value.updated_at) ||
    !["reserved", "sent", "not_configured", "failed"].includes(String(value.status)) ||
    (value.provider_ref !== null && (typeof value.provider_ref !== "string" || value.provider_ref.length > 200)) ||
    (value.failure_reason !== null && !["oauth", "provider", "transport"].includes(String(value.failure_reason)))
  ) {
    return null;
  }
  const attempts = value.attempts === undefined
    ? 1
    : typeof value.attempts === "number" && Number.isSafeInteger(value.attempts) && value.attempts >= 0 && value.attempts <= 10_000
      ? value.attempts
      : null;
  if (attempts === null) return null;
  const status = value.status as DakotaOperatorAlertMarker["status"];
  const nextRetryAt = value.next_retry_at === undefined
    ? status === "sent" ? null : value.updated_at as string
    : value.next_retry_at;
  if (nextRetryAt !== null && !isTimestamp(nextRetryAt)) return null;
  if (status === "sent" && nextRetryAt !== null) return null;
  return {
    schema_version: DAKOTA_OPERATOR_ALERT_SCHEMA,
    alert_id: value.alert_id,
    receipt_id: value.receipt_id,
    kind: value.kind as DakotaIngressAlert["kind"],
    source: value.source,
    created_at: value.created_at,
    updated_at: value.updated_at,
    status,
    provider_ref: value.provider_ref as string | null,
    failure_reason: value.failure_reason as DakotaOperatorAlertMarker["failure_reason"],
    attempts,
    next_retry_at: nextRetryAt,
  };
}

function markerKey(id: string): string {
  return `${ALERT_PREFIX}${id}`;
}

function dueIndexKey(marker: DakotaOperatorAlertMarker): string | null {
  if (marker.status === "sent") return null;
  const dueAtValue = marker.next_retry_at ?? marker.updated_at;
  const dueAt = Date.parse(dueAtValue);
  if (!Number.isFinite(dueAt)) return null;
  const generation = createHash("sha256")
    .update(`${marker.alert_id}:${marker.attempts}:${dueAtValue}`)
    .digest("hex")
    .slice(0, 12);
  return `${DAKOTA_OPERATOR_ALERT_DUE_PREFIX}${String(dueAt).padStart(13, "0")}/${marker.alert_id}/${generation}`;
}

function parseDueIndexKey(key: string): { dueAt: number; alertId: string } | null {
  const match = /^due\/v1\/(\d{13})\/([0-9a-f]{32})\/[0-9a-f]{12}$/u.exec(key);
  if (!match) return null;
  const dueAt = Number(match[1]);
  return Number.isSafeInteger(dueAt) && match[2] ? { dueAt, alertId: match[2] } : null;
}

async function ensureDueIndex(
  store: DakotaOperatorAlertStore,
  marker: DakotaOperatorAlertMarker,
): Promise<string | null> {
  const key = dueIndexKey(marker);
  if (!key) return null;
  await store.setJSON(key, {
    schema_version: ALERT_DUE_SCHEMA,
    alert_id: marker.alert_id,
    due_at: marker.next_retry_at ?? marker.updated_at,
  }, {
    onlyIfNew: true,
    metadata: {
      schemaVersion: ALERT_DUE_SCHEMA,
      alertId: marker.alert_id,
      dueAt: marker.next_retry_at ?? marker.updated_at,
    },
  });
  return key;
}

async function deleteDueIndex(store: DakotaOperatorAlertStore, key: string | null): Promise<void> {
  if (!key) return;
  try {
    await store.delete(key);
  } catch {
    // Identifier-only stale indexes are reconciled by the next scheduled pass.
  }
}

function normalizeIndexMigration(value: unknown): DakotaOperatorAlertIndexMigration | null {
  if (
    !isRecord(value) ||
    value.schema_version !== ALERT_INDEX_MIGRATION_SCHEMA ||
    typeof value.next_shard !== "number" ||
    !Number.isSafeInteger(value.next_shard) ||
    value.next_shard < 0 ||
    value.next_shard > INDEX_MIGRATION_SHARDS ||
    (value.completed_at !== null && !isTimestamp(value.completed_at)) ||
    !isTimestamp(value.updated_at)
  ) return null;
  if ((value.next_shard === INDEX_MIGRATION_SHARDS) !== (value.completed_at !== null)) return null;
  return value as unknown as DakotaOperatorAlertIndexMigration;
}

function markerMetadata(marker: DakotaOperatorAlertMarker) {
  return {
    schemaVersion: DAKOTA_OPERATOR_ALERT_SCHEMA,
    receiptId: marker.receipt_id,
    kind: marker.kind,
    status: marker.status,
    attempts: marker.attempts,
    nextRetryAt: marker.next_retry_at,
    updatedAt: marker.updated_at,
  };
}

async function loadMarker(
  store: DakotaOperatorAlertStore,
  id: string,
): Promise<{ marker: DakotaOperatorAlertMarker; etag: string } | null> {
  const result = await store.getWithMetadata(markerKey(id), {
    type: "json",
    consistency: "strong",
  });
  const marker = normalizeMarker(result?.data);
  return marker && result?.etag ? { marker, etag: result.etag } : null;
}

function alertRetryAt(now: Date, attempts: number): string {
  const delay = ALERT_RETRY_DELAYS_MS[Math.min(Math.max(attempts - 1, 0), ALERT_RETRY_DELAYS_MS.length - 1)];
  return new Date(now.getTime() + delay).toISOString();
}

function isDue(marker: DakotaOperatorAlertMarker, now: Date): boolean {
  return marker.status !== "sent" && (
    marker.next_retry_at === null || Date.parse(marker.next_retry_at) <= now.getTime()
  );
}

async function deliverLeasedMarker(
  marker: DakotaOperatorAlertMarker,
  etag: string,
  dependencies: DakotaIngressOperatorAlertDependencies,
  activeIndexKey = dueIndexKey(marker),
): Promise<DakotaOperatorAlertDelivery> {
  const copy = alertCopy({
    kind: marker.kind,
    receiptId: marker.receipt_id,
    source: marker.source,
  });
  const delivery = await sendDakotaOperatorAlert(copy.subject, copy.body, dependencies);
  const completed = markerFromDelivery(
    marker,
    delivery,
    (dependencies.now ?? (() => new Date()))().toISOString(),
  );
  const saved = await dependencies.getStore().setJSON(markerKey(marker.alert_id), completed, {
    onlyIfMatch: etag,
    metadata: markerMetadata(completed),
  });
  if (!saved.modified) throw new Error("operator_alert_completion_conflict");
  if (completed.status === "sent") await deleteDueIndex(dependencies.getStore(), activeIndexKey);
  return delivery;
}

async function retryExistingMarker(
  loaded: { marker: DakotaOperatorAlertMarker; etag: string },
  dependencies: DakotaIngressOperatorAlertDependencies,
  activeIndexKey = dueIndexKey(loaded.marker),
): Promise<DakotaOperatorAlertOnceResult> {
  const now = (dependencies.now ?? (() => new Date()))();
  if (loaded.marker.status === "sent") {
    await deleteDueIndex(dependencies.getStore(), activeIndexKey);
    return { status: "deduplicated" };
  }
  if (!isDue(loaded.marker, now)) {
    const currentIndexKey = await ensureDueIndex(dependencies.getStore(), loaded.marker);
    if (activeIndexKey !== currentIndexKey) await deleteDueIndex(dependencies.getStore(), activeIndexKey);
    return { status: "queued" };
  }
  const leased: DakotaOperatorAlertMarker = {
    ...loaded.marker,
    updated_at: now.toISOString(),
    status: "reserved",
    provider_ref: null,
    failure_reason: null,
    attempts: Math.min(10_000, loaded.marker.attempts + 1),
    next_retry_at: alertRetryAt(now, loaded.marker.attempts + 1),
  };
  const leasedIndexKey = await ensureDueIndex(dependencies.getStore(), leased);
  const reserved = await dependencies.getStore().setJSON(markerKey(leased.alert_id), leased, {
    onlyIfMatch: loaded.etag,
    metadata: markerMetadata(leased),
  });
  if (!reserved.modified) return { status: "queued" };
  if (activeIndexKey !== leasedIndexKey) await deleteDueIndex(dependencies.getStore(), activeIndexKey);
  const etag = reserved.etag ?? (await loadMarker(dependencies.getStore(), leased.alert_id))?.etag;
  if (!etag) throw new Error("operator_alert_lease_missing");
  return deliverLeasedMarker(leased, etag, dependencies, leasedIndexKey);
}

export async function sendDakotaIngressOperatorAlert(
  alert: DakotaIngressAlert,
  dependencies: DakotaIngressOperatorAlertDependencies,
): Promise<DakotaOperatorAlertOnceResult> {
  const nowDate = (dependencies.now ?? (() => new Date()))();
  const now = nowDate.toISOString();
  const id = alertId(alert);
  const marker: DakotaOperatorAlertMarker = {
    schema_version: DAKOTA_OPERATOR_ALERT_SCHEMA,
    alert_id: id,
    receipt_id: alert.receiptId,
    kind: alert.kind,
    source: boundedHeader(alert.source, 80),
    created_at: now,
    updated_at: now,
    status: "reserved",
    provider_ref: null,
    failure_reason: null,
    attempts: 1,
    next_retry_at: alertRetryAt(nowDate, 1),
  };
  const store = dependencies.getStore();
  const proposedIndexKey = await ensureDueIndex(store, marker);
  const reserved = await store.setJSON(markerKey(id), marker, {
    onlyIfNew: true,
    metadata: markerMetadata(marker),
  });
  if (!reserved.modified) {
    const existing = await loadMarker(store, id);
    if (!existing) throw new Error("operator_alert_marker_invalid");
    const existingIndexKey = await ensureDueIndex(store, existing.marker);
    if (proposedIndexKey !== existingIndexKey) await deleteDueIndex(store, proposedIndexKey);
    return retryExistingMarker(existing, dependencies, existingIndexKey);
  }
  const etag = reserved.etag ?? (await loadMarker(store, id))?.etag;
  if (!etag) throw new Error("operator_alert_reservation_missing");
  return deliverLeasedMarker(marker, etag, dependencies, proposedIndexKey);
}

async function migrateNextAlertIndexShard(
  store: DakotaOperatorAlertStore,
  now: Date,
): Promise<number> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const loaded = await store.getWithMetadata(DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY, {
      type: "json",
      consistency: "strong",
    });
    if (!loaded) {
      const initialized: DakotaOperatorAlertIndexMigration = {
        schema_version: ALERT_INDEX_MIGRATION_SCHEMA,
        next_shard: 0,
        completed_at: null,
        updated_at: now.toISOString(),
      };
      await store.setJSON(DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY, initialized, {
        onlyIfNew: true,
        metadata: { schemaVersion: ALERT_INDEX_MIGRATION_SCHEMA, nextShard: 0 },
      });
      continue;
    }
    if (!loaded.etag) throw new Error("operator_alert_index_migration_etag_missing");
    const current = normalizeIndexMigration(loaded.data) ?? {
      schema_version: ALERT_INDEX_MIGRATION_SCHEMA,
      next_shard: 0,
      completed_at: null,
      updated_at: now.toISOString(),
    };
    if (current.next_shard === INDEX_MIGRATION_SHARDS) return 0;

    const shard = current.next_shard.toString(16).padStart(2, "0");
    let scanned = 0;
    for await (const page of store.list({ prefix: `${ALERT_PREFIX}${shard}`, paginate: true })) {
      for (const blob of page.blobs) {
        scanned += 1;
        const id = blob.key.slice(ALERT_PREFIX.length);
        if (!/^[0-9a-f]{32}$/u.test(id)) continue;
        const marker = await loadMarker(store, id);
        if (marker && marker.marker.status !== "sent") await ensureDueIndex(store, marker.marker);
      }
    }

    const nextShard = current.next_shard + 1;
    const updated: DakotaOperatorAlertIndexMigration = {
      schema_version: ALERT_INDEX_MIGRATION_SCHEMA,
      next_shard: nextShard,
      completed_at: nextShard === INDEX_MIGRATION_SHARDS ? now.toISOString() : null,
      updated_at: now.toISOString(),
    };
    const saved = await store.setJSON(DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY, updated, {
      onlyIfMatch: loaded.etag,
      metadata: {
        schemaVersion: ALERT_INDEX_MIGRATION_SCHEMA,
        nextShard,
        completedAt: updated.completed_at,
      },
    });
    if (saved.modified) return scanned;
  }
  throw new Error("operator_alert_index_migration_conflict");
}

export async function retryPendingDakotaOperatorAlerts(
  dependencies: DakotaIngressOperatorAlertDependencies,
  requestedLimit = DAKOTA_OPERATOR_ALERT_RETRY_LIMIT,
): Promise<{ scanned: number; due: number; sent: number; pending: number; failed: number; notConfigured: number }> {
  const now = (dependencies.now ?? (() => new Date()))();
  const store = dependencies.getStore();
  let scanned = await migrateNextAlertIndexShard(store, now);
  const dueIndexKeys = new Map<string, string[]>();
  for await (const page of store.list({ prefix: DAKOTA_OPERATOR_ALERT_DUE_PREFIX, paginate: true })) {
    for (const blob of page.blobs) {
      scanned += 1;
      const parsed = parseDueIndexKey(blob.key);
      if (!parsed || parsed.dueAt > now.getTime()) continue;
      const keys = dueIndexKeys.get(parsed.alertId) ?? [];
      keys.push(blob.key);
      dueIndexKeys.set(parsed.alertId, keys);
    }
  }
  const limit = Math.max(1, Math.min(requestedLimit, 50));
  let sent = 0;
  let pending = 0;
  let failed = 0;
  let notConfigured = 0;
  const dueAlertIds = [...dueIndexKeys.entries()]
    .sort((left, right) => (left[1][0] ?? "").localeCompare(right[1][0] ?? ""))
    .slice(0, limit)
    .map(([id]) => id);
  for (const id of dueAlertIds) {
    const markerKeys = dueIndexKeys.get(id) ?? [];
    try {
      const candidate = await loadMarker(store, id);
      if (!candidate) {
        await Promise.all(markerKeys.map((key) => deleteDueIndex(store, key)));
        continue;
      }
      const currentIndexKey = await ensureDueIndex(store, candidate.marker);
      if (!isDue(candidate.marker, now)) {
        await Promise.all(markerKeys.filter((key) => key !== currentIndexKey).map((key) => deleteDueIndex(store, key)));
        continue;
      }
      const result = await retryExistingMarker(candidate, dependencies, currentIndexKey);
      await Promise.all(markerKeys.filter((key) => key !== currentIndexKey).map((key) => deleteDueIndex(store, key)));
      if (result.status === "sent") sent += 1;
      else if (result.status === "failed") failed += 1;
      else if (result.status === "not_configured") notConfigured += 1;
      else pending += 1;
    } catch {
      failed += 1;
    }
  }
  return { scanned, due: dueIndexKeys.size, sent, pending, failed, notConfigured };
}

export async function summarizeDakotaOperatorAlerts(
  store: DakotaOperatorAlertStore,
  now = new Date(),
  requestedLimit = 50,
): Promise<DakotaOperatorAlertOperationsSummary> {
  const alerts: DakotaOperatorAlertOperationsItem[] = [];
  let total = 0;
  let sent = 0;
  let pending = 0;
  let failed = 0;
  let notConfigured = 0;
  let invalid = 0;
  let oldestPendingAt: string | null = null;
  for await (const page of store.list({ prefix: ALERT_PREFIX, paginate: true })) {
    for (const blob of page.blobs) {
      total += 1;
      const id = blob.key.slice(ALERT_PREFIX.length);
      if (!/^[0-9a-f]{32}$/u.test(id)) {
        invalid += 1;
        continue;
      }
      const loaded = await loadMarker(store, id);
      if (!loaded) {
        invalid += 1;
        continue;
      }
      const marker = loaded.marker;
      if (marker.status === "sent") sent += 1;
      else {
        pending += 1;
        if (marker.status === "failed") failed += 1;
        if (marker.status === "not_configured") notConfigured += 1;
        if (!oldestPendingAt || marker.created_at < oldestPendingAt) oldestPendingAt = marker.created_at;
      }
      alerts.push({
        alert_id: marker.alert_id,
        receipt_id: marker.receipt_id,
        kind: marker.kind,
        source: marker.source,
        created_at: marker.created_at,
        updated_at: marker.updated_at,
        status: marker.status,
        attempts: marker.attempts,
        next_retry_at: marker.next_retry_at,
        failure_reason: marker.failure_reason,
      });
    }
  }
  alerts.sort((left, right) => Number(right.status !== "sent") - Number(left.status !== "sent") || right.updated_at.localeCompare(left.updated_at));
  return {
    checked_at: now.toISOString(),
    total,
    sent,
    pending,
    failed,
    not_configured: notConfigured,
    invalid,
    oldest_pending_at: oldestPendingAt,
    alerts: alerts.slice(0, Math.max(1, Math.min(requestedLimit, 100))),
  };
}

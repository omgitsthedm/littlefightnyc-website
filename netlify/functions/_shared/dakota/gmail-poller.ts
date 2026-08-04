import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import { DAKOTA_OPERATOR_EMAIL } from "./constants";
import {
  getGoogleWorkspaceAccessToken,
  GOOGLE_GMAIL_READ_SCOPES,
  googleApiFailureStatus,
  type GoogleOAuthDependencies,
  type GoogleWorkspaceHealthStatus,
} from "./google-oauth";
import type { DakotaExternalEventInput } from "./revenue-bridge-schema";
import {
  createPersistedContactEmailMatcher,
  extractHeaderEmails,
  type DakotaWorkspaceContactMatch,
  type DakotaWorkspaceEmailMatcher,
  type DakotaWorkspaceRecords,
} from "./workspace-contact-match";

const GMAIL_API_ROOT = "https://gmail.googleapis.com/gmail/v1/users/me";
const GMAIL_PROFILE_ENDPOINT = `${GMAIL_API_ROOT}/profile`;
const GMAIL_HISTORY_ENDPOINT = `${GMAIL_API_ROOT}/history`;
const GMAIL_MESSAGES_ENDPOINT = `${GMAIL_API_ROOT}/messages`;
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESULTS = 10;
const MAX_RESULTS = 50;
const DEFAULT_MAX_PAGES = 2;
const MAX_PAGES = 4;
const MAX_MESSAGE_IDS_PER_POLL = 40;
const METADATA_CONCURRENCY = 20;
const MAX_PAGE_TOKEN_BYTES = 300;
const MAX_PROVIDER_CURSOR_LENGTH = 512;
const RECOVERY_SAFETY_LOOKBACK_MS = 24 * 60 * 60_000;
const UNKNOWN_OCCURRENCE_AT = "1970-01-01T00:00:00.000Z";
const CURSOR_VERSION = "gh1";
const METADATA_HEADERS = ["From", "Reply-To", "Subject"] as const;
const MESSAGE_FIELDS = "id,threadId,labelIds,internalDate,payload(headers(name,value))";
const HISTORY_FIELDS = "history(id,messagesAdded(message(id,threadId))),historyId,nextPageToken";

interface GmailHeader {
  name?: unknown;
  value?: unknown;
}

interface GmailMessage {
  id?: unknown;
  threadId?: unknown;
  labelIds?: unknown;
  internalDate?: unknown;
  payload?: { headers?: unknown };
}

interface GmailHistoryRecord {
  id?: unknown;
  messagesAdded?: unknown;
}

type ParsedGmailCursor =
  | { mode: "history"; historyId: string; pageToken: string | null }
  | { mode: "recovery"; targetHistoryId: string; cutoffAt: string; pageToken: string | null };

export type DakotaGmailSignalDirection = "inbound" | "outbound" | "unknown";
export type DakotaGmailPollMode = "baseline" | "history" | "recovery";

export type DakotaGmailSignal = DakotaWorkspaceContactMatch & {
  provider: "gmail";
  kind: "gmail_message";
  reviewState: "needs_review";
  direction: DakotaGmailSignalDirection;
  providerRef: string;
  threadRef: string | null;
  occurredAt: string;
  subject: string;
  event: DakotaExternalEventInput;
};

export interface DakotaGmailPollInput {
  records: DakotaWorkspaceRecords;
  cursor?: string | null;
  recoveryAfter?: string | null;
  maxResults?: number;
  maxPages?: number;
}

export interface DakotaGmailPollResult {
  provider: "gmail";
  status: GoogleWorkspaceHealthStatus;
  checkedAt: string;
  nextCursor: string | null;
  resetRequired: boolean;
  mode: DakotaGmailPollMode | null;
  hasMore: boolean;
  signals: DakotaGmailSignal[];
}

export interface DakotaGmailPollDependencies extends GoogleOAuthDependencies {
  now?: () => Date;
  apiRequestTimeoutMs?: number;
}

type GmailMetadataResult =
  | { ok: true; message: GmailMessage | null }
  | { ok: false; status: "insufficient_scope" | "unavailable" };

type GmailProfileResult =
  | { ok: true; historyId: string }
  | { ok: false; status: "insufficient_scope" | "unavailable" };

type GmailSignalsResult =
  | { ok: true; signals: DakotaGmailSignal[] }
  | { ok: false; status: "insufficient_scope" | "unavailable" };

function boundedPlain(value: unknown, maximumLength: number): string {
  return typeof value === "string"
    ? value
      .replace(/\p{Cc}/gu, " ")
      .replace(/[<>]/gu, " ")
      .replace(/\s+/gu, " ")
      .trim()
      .slice(0, maximumLength)
    : "";
}

function boundedMessageId(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= 240 &&
    /^[a-z0-9_-]+$/iu.test(value)
    ? value
    : null;
}

function boundedHistoryId(value: unknown): string | null {
  return typeof value === "string" && /^\d{1,32}$/u.test(value) ? value : null;
}

function boundedPageToken(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    Buffer.byteLength(value, "utf8") <= MAX_PAGE_TOKEN_BYTES &&
    value === value.trim() &&
    !/[\s<>]|\p{Cc}/u.test(value)
    ? value
    : null;
}

function boundedInteger(value: unknown, fallback: number, maximum: number): number {
  return typeof value === "number" && Number.isSafeInteger(value)
    ? Math.min(Math.max(value, 1), maximum)
    : fallback;
}

function validRecoveryAfter(value: unknown, checkedAt: string): string | null {
  if (typeof value !== "string" || value.length > 64 || !value.trim()) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) && timestamp <= Date.parse(checkedAt)
    ? new Date(Math.max(0, timestamp - RECOVERY_SAFETY_LOOKBACK_MS)).toISOString()
    : null;
}

function encodePageToken(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodePageToken(value: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/u.test(value)) return null;
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    return encodePageToken(decoded) === value && boundedPageToken(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

function encodedCursor(value: ParsedGmailCursor): string | null {
  const cursor = value.mode === "history"
    ? value.pageToken
      ? `${CURSOR_VERSION}:p:${value.historyId}:${encodePageToken(value.pageToken)}`
      : `${CURSOR_VERSION}:h:${value.historyId}`
    : `${CURSOR_VERSION}:r:${value.targetHistoryId}:${Date.parse(value.cutoffAt)}:${value.pageToken ? encodePageToken(value.pageToken) : "-"}`;
  return cursor.length <= MAX_PROVIDER_CURSOR_LENGTH ? cursor : null;
}

function parsedCursor(value: unknown): ParsedGmailCursor | null {
  if (typeof value !== "string" || value.length > MAX_PROVIDER_CURSOR_LENGTH) return null;
  const history = new RegExp(`^${CURSOR_VERSION}:h:(\\d{1,32})$`, "u").exec(value);
  if (history) return { mode: "history", historyId: history[1], pageToken: null };
  const paged = new RegExp(`^${CURSOR_VERSION}:p:(\\d{1,32}):([A-Za-z0-9_-]+)$`, "u").exec(value);
  if (paged) {
    const pageToken = decodePageToken(paged[2]);
    return pageToken ? { mode: "history", historyId: paged[1], pageToken } : null;
  }
  const recovery = new RegExp(`^${CURSOR_VERSION}:r:(\\d{1,32}):(\\d{1,16}):(-|[A-Za-z0-9_-]+)$`, "u").exec(value);
  if (!recovery) return null;
  const cutoffMs = Number(recovery[2]);
  if (!Number.isSafeInteger(cutoffMs)) return null;
  const cutoff = new Date(cutoffMs);
  if (!Number.isFinite(cutoff.getTime())) return null;
  const pageToken = recovery[3] === "-" ? null : decodePageToken(recovery[3]);
  if (recovery[3] !== "-" && !pageToken) return null;
  return {
    mode: "recovery",
    targetHistoryId: recovery[1],
    cutoffAt: cutoff.toISOString(),
    pageToken,
  };
}

export function isDakotaGmailCursor(value: unknown): value is string {
  return parsedCursor(value) !== null;
}

function headersByName(message: GmailMessage): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const headers = Array.isArray(message.payload?.headers)
    ? message.payload.headers as GmailHeader[]
    : [];
  for (const header of headers) {
    const name = boundedPlain(header.name, 80).toLowerCase();
    const value = boundedPlain(header.value, 8_192);
    if (!name || !value || !METADATA_HEADERS.some((item) => item.toLowerCase() === name)) {
      continue;
    }
    result.set(name, [...(result.get(name) ?? []), value]);
  }
  return result;
}

function headerEmails(headers: Map<string, string[]>, name: string): string[] {
  return (headers.get(name) ?? []).flatMap(extractHeaderEmails);
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function occurredAt(value: unknown): string {
  if (typeof value !== "string" || !/^\d{1,16}$/u.test(value)) return UNKNOWN_OCCURRENCE_AT;
  const timestamp = Number(value);
  if (!Number.isSafeInteger(timestamp)) return UNKNOWN_OCCURRENCE_AT;
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  return Number.isFinite(date.getTime()) && year >= 2000 && year <= 2100
    ? date.toISOString()
    : UNKNOWN_OCCURRENCE_AT;
}

function stableDigest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function bridgeEvent(
  providerRef: string,
  occurred_at: string,
  match: DakotaWorkspaceContactMatch,
): DakotaExternalEventInput {
  return {
    event_id: `gmail:${stableDigest(providerRef)}`,
    provider: "gmail",
    kind: "message_received",
    summary: match.matchState === "matched"
      ? "Inbound Gmail metadata matched a persisted contact."
      : "Inbound Gmail metadata needs operator assignment.",
    external_ref: `gmail:${providerRef}`,
    occurred_at,
  };
}

function direction(
  message: GmailMessage,
  from: readonly string[],
): DakotaGmailSignalDirection {
  const labels = Array.isArray(message.labelIds)
    ? message.labelIds.filter((label): label is string => typeof label === "string")
    : [];
  if (labels.includes("SENT") || from.includes(DAKOTA_OPERATOR_EMAIL)) return "outbound";
  return from.length > 0 ? "inbound" : "unknown";
}

function signalFromMessage(
  message: GmailMessage,
  matchContact: DakotaWorkspaceEmailMatcher,
): DakotaGmailSignal | "skip" | null {
  const providerRef = boundedMessageId(message.id);
  if (!providerRef) return null;
  const headers = headersByName(message);
  const from = headerEmails(headers, "from");
  const messageDirection = direction(message, from);
  if (messageDirection !== "inbound") return "skip";
  const observedEmails = unique([
    ...from,
    ...headerEmails(headers, "reply-to"),
  ].filter((email) => email !== DAKOTA_OPERATOR_EMAIL));
  const match = matchContact(observedEmails);
  const observedAt = occurredAt(message.internalDate);
  return {
    provider: "gmail",
    kind: "gmail_message",
    reviewState: "needs_review",
    direction: messageDirection,
    providerRef,
    threadRef: boundedMessageId(message.threadId),
    occurredAt: observedAt,
    subject: boundedPlain(headers.get("subject")?.[0], 300),
    event: bridgeEvent(providerRef, observedAt, match),
    ...match,
  };
}

async function fetchProfile(
  accessToken: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
): Promise<GmailProfileResult> {
  const params = new URLSearchParams({ fields: "historyId" });
  let response: Response;
  try {
    response = await fetcher(`${GMAIL_PROFILE_ENDPOINT}?${params}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch {
    return { ok: false, status: "unavailable" };
  }
  if (!response.ok) return { ok: false, status: await googleApiFailureStatus(response) };
  try {
    const body = await response.json() as { historyId?: unknown };
    const historyId = boundedHistoryId(body.historyId);
    return historyId ? { ok: true, historyId } : { ok: false, status: "unavailable" };
  } catch {
    return { ok: false, status: "unavailable" };
  }
}

async function fetchMetadata(
  messageId: string,
  accessToken: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
): Promise<GmailMetadataResult> {
  const params = new URLSearchParams({ format: "metadata", fields: MESSAGE_FIELDS });
  for (const header of METADATA_HEADERS) params.append("metadataHeaders", header);
  let response: Response;
  try {
    response = await fetcher(`${GMAIL_MESSAGES_ENDPOINT}/${encodeURIComponent(messageId)}?${params}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
  } catch {
    return { ok: false, status: "unavailable" };
  }
  if (response.status === 404) return { ok: true, message: null };
  if (!response.ok) return { ok: false, status: await googleApiFailureStatus(response) };
  try {
    const message = await response.json() as GmailMessage;
    return boundedMessageId(message.id) === messageId
      ? { ok: true, message }
      : { ok: false, status: "unavailable" };
  } catch {
    return { ok: false, status: "unavailable" };
  }
}

async function signalsForMessages(
  messageIds: readonly string[],
  input: DakotaGmailPollInput,
  accessToken: string,
  checkedAt: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
  cutoffAt: string | null = null,
): Promise<GmailSignalsResult> {
  const signals: DakotaGmailSignal[] = [];
  const matchContact = createPersistedContactEmailMatcher(input.records);
  for (let offset = 0; offset < messageIds.length; offset += METADATA_CONCURRENCY) {
    const batch = messageIds.slice(offset, offset + METADATA_CONCURRENCY);
    const metadata = await Promise.all(batch.map((id) => (
      fetchMetadata(id, accessToken, fetcher, requestTimeoutMs)
    )));
    const failure = metadata.find((item) => !item.ok);
    if (failure && !failure.ok) return failure;
    for (const item of metadata) {
      if (!item.ok || item.message === null) continue;
      const signal = signalFromMessage(item.message, matchContact);
      if (!signal) return { ok: false, status: "unavailable" };
      if (signal === "skip") continue;
      if (cutoffAt && Date.parse(signal.occurredAt) < Date.parse(cutoffAt)) continue;
      signals.push(signal);
    }
  }
  return { ok: true, signals };
}

function emptyResult(
  status: Exclude<GoogleWorkspaceHealthStatus, "connected">,
  checkedAt: string,
  resetRequired = false,
): DakotaGmailPollResult {
  return {
    provider: "gmail",
    status,
    checkedAt,
    nextCursor: null,
    resetRequired,
    mode: null,
    hasMore: false,
    signals: [],
  };
}

function connectedResult(
  checkedAt: string,
  nextCursor: string,
  mode: DakotaGmailPollMode,
  hasMore: boolean,
  signals: DakotaGmailSignal[],
  resetRequired = false,
): DakotaGmailPollResult {
  return {
    provider: "gmail",
    status: "connected",
    checkedAt,
    nextCursor,
    resetRequired,
    mode,
    hasMore,
    signals,
  };
}

async function safeBaseline(
  input: DakotaGmailPollInput,
  checkedAt: string,
  accessToken: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
  resetRequired: boolean,
): Promise<DakotaGmailPollResult> {
  const profile = await fetchProfile(accessToken, fetcher, requestTimeoutMs);
  if (!profile.ok) return emptyResult(profile.status, checkedAt, resetRequired);
  const recoveryAfter = validRecoveryAfter(input.recoveryAfter, checkedAt);
  const nextCursor = recoveryAfter && resetRequired
    ? encodedCursor({
      mode: "recovery",
      targetHistoryId: profile.historyId,
      cutoffAt: recoveryAfter,
      pageToken: null,
    })
    : encodedCursor({ mode: "history", historyId: profile.historyId, pageToken: null });
  if (!nextCursor) return emptyResult("unavailable", checkedAt, resetRequired);
  return connectedResult(
    checkedAt,
    nextCursor,
    recoveryAfter && resetRequired ? "recovery" : "baseline",
    Boolean(recoveryAfter && resetRequired),
    [],
    resetRequired,
  );
}

function collectHistoryMessageIds(
  value: unknown,
  messageIds: Set<string>,
): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value)) return false;
  for (const record of value as GmailHistoryRecord[]) {
    if (typeof record !== "object" || record === null || !boundedHistoryId(record.id)) return false;
    if (record.messagesAdded === undefined) continue;
    if (!Array.isArray(record.messagesAdded)) return false;
    for (const added of record.messagesAdded) {
      if (typeof added !== "object" || added === null) return false;
      const message = (added as { message?: unknown }).message;
      if (typeof message !== "object" || message === null) return false;
      const id = boundedMessageId((message as { id?: unknown }).id);
      if (!id) return false;
      messageIds.add(id);
      if (messageIds.size > MAX_MESSAGE_IDS_PER_POLL) return false;
    }
  }
  return true;
}

async function pollHistory(
  cursor: Extract<ParsedGmailCursor, { mode: "history" }>,
  input: DakotaGmailPollInput,
  checkedAt: string,
  accessToken: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
  maxResults: number,
  maxPages: number,
): Promise<DakotaGmailPollResult> {
  const messageIds = new Set<string>();
  let pageToken = cursor.pageToken;
  let finalHistoryId: string | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      startHistoryId: cursor.historyId,
      historyTypes: "messageAdded",
      maxResults: String(maxResults),
      fields: HISTORY_FIELDS,
    });
    if (pageToken) params.set("pageToken", pageToken);
    let response: Response;
    try {
      response = await fetcher(`${GMAIL_HISTORY_ENDPOINT}?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (response.status === 400 && pageToken) {
      const restartCursor = encodedCursor({
        mode: "history",
        historyId: cursor.historyId,
        pageToken: null,
      });
      return restartCursor
        ? connectedResult(checkedAt, restartCursor, "history", true, [], true)
        : emptyResult("unavailable", checkedAt);
    }
    if (response.status === 404) {
      return safeBaseline(input, checkedAt, accessToken, fetcher, requestTimeoutMs, true);
    }
    if (!response.ok) return emptyResult(await googleApiFailureStatus(response), checkedAt);

    let body: { history?: unknown; historyId?: unknown; nextPageToken?: unknown };
    try {
      body = await response.json() as typeof body;
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (Array.isArray(body.history) && body.history.length > maxResults) {
      return emptyResult("unavailable", checkedAt);
    }
    if (!collectHistoryMessageIds(body.history, messageIds)) {
      return emptyResult("unavailable", checkedAt);
    }
    const nextPageToken = boundedPageToken(body.nextPageToken);
    if (body.nextPageToken !== undefined && body.nextPageToken !== null && !nextPageToken) {
      return emptyResult("unavailable", checkedAt);
    }
    if (nextPageToken && page < maxPages - 1) {
      pageToken = nextPageToken;
      continue;
    }
    if (nextPageToken) {
      const nextCursor = encodedCursor({
        mode: "history",
        historyId: cursor.historyId,
        pageToken: nextPageToken,
      });
      if (!nextCursor) return emptyResult("unavailable", checkedAt);
      const observed = await signalsForMessages(
        [...messageIds], input, accessToken, checkedAt, fetcher, requestTimeoutMs,
      );
      return observed.ok
        ? connectedResult(checkedAt, nextCursor, "history", true, observed.signals)
        : emptyResult(observed.status, checkedAt);
    }
    finalHistoryId = boundedHistoryId(body.historyId);
    if (!finalHistoryId || BigInt(finalHistoryId) < BigInt(cursor.historyId)) {
      return emptyResult("unavailable", checkedAt);
    }
    break;
  }

  if (!finalHistoryId) return emptyResult("unavailable", checkedAt);
  const nextCursor = encodedCursor({ mode: "history", historyId: finalHistoryId, pageToken: null });
  if (!nextCursor) return emptyResult("unavailable", checkedAt);
  const observed = await signalsForMessages(
    [...messageIds], input, accessToken, checkedAt, fetcher, requestTimeoutMs,
  );
  return observed.ok
    ? connectedResult(checkedAt, nextCursor, "history", false, observed.signals)
    : emptyResult(observed.status, checkedAt);
}

function collectMessageListIds(value: unknown, messageIds: Set<string>, maximum: number): boolean {
  if (value === undefined) return true;
  if (!Array.isArray(value) || value.length > maximum) return false;
  for (const message of value) {
    if (typeof message !== "object" || message === null) return false;
    const id = boundedMessageId((message as { id?: unknown }).id);
    if (!id) return false;
    messageIds.add(id);
    if (messageIds.size > MAX_MESSAGE_IDS_PER_POLL) return false;
  }
  return true;
}

async function pollRecovery(
  cursor: Extract<ParsedGmailCursor, { mode: "recovery" }>,
  input: DakotaGmailPollInput,
  checkedAt: string,
  accessToken: string,
  fetcher: typeof globalThis.fetch,
  requestTimeoutMs: number,
  maxResults: number,
  maxPages: number,
): Promise<DakotaGmailPollResult> {
  const messageIds = new Set<string>();
  let pageToken = cursor.pageToken;
  let nextCursor: string | null = null;
  let hasMore = false;

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      maxResults: String(maxResults),
      fields: "messages(id,threadId),nextPageToken",
    });
    if (pageToken) params.set("pageToken", pageToken);
    let response: Response;
    try {
      response = await fetcher(`${GMAIL_MESSAGES_ENDPOINT}?${params}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (response.status === 400 && pageToken) {
      const restartCursor = encodedCursor({ ...cursor, pageToken: null });
      return restartCursor
        ? connectedResult(checkedAt, restartCursor, "recovery", true, [], true)
        : emptyResult("unavailable", checkedAt);
    }
    if (!response.ok) return emptyResult(await googleApiFailureStatus(response), checkedAt);
    let body: { messages?: unknown; nextPageToken?: unknown };
    try {
      body = await response.json() as typeof body;
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (!collectMessageListIds(body.messages, messageIds, maxResults)) {
      return emptyResult("unavailable", checkedAt);
    }
    const nextPageToken = boundedPageToken(body.nextPageToken);
    if (body.nextPageToken !== undefined && body.nextPageToken !== null && !nextPageToken) {
      return emptyResult("unavailable", checkedAt);
    }
    if (nextPageToken && page < maxPages - 1) {
      pageToken = nextPageToken;
      continue;
    }
    if (nextPageToken) {
      nextCursor = encodedCursor({ ...cursor, pageToken: nextPageToken });
      hasMore = true;
    } else {
      nextCursor = encodedCursor({
        mode: "history",
        historyId: cursor.targetHistoryId,
        pageToken: null,
      });
    }
    break;
  }

  if (!nextCursor) return emptyResult("unavailable", checkedAt);
  const observed = await signalsForMessages(
    [...messageIds], input, accessToken, checkedAt, fetcher, requestTimeoutMs, cursor.cutoffAt,
  );
  return observed.ok
    ? connectedResult(checkedAt, nextCursor, "recovery", hasMore, observed.signals)
    : emptyResult(observed.status, checkedAt);
}

/**
 * Establish a safe no-backfill baseline, then observe only Gmail messageAdded
 * history using metadata-only reads. Bounded page continuations and recovery
 * scans are encoded in the provider cursor, but this adapter never persists a
 * cursor, sends mail, returns a body/snippet, or changes a pipeline stage.
 */
export async function pollDakotaGmail(
  input: DakotaGmailPollInput,
  dependencies: DakotaGmailPollDependencies = {},
): Promise<DakotaGmailPollResult> {
  const checkedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const token = await getGoogleWorkspaceAccessToken(
    { acceptedScopes: GOOGLE_GMAIL_READ_SCOPES },
    dependencies,
  );
  if (token.status !== "connected") return emptyResult(token.status, checkedAt);

  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const requestTimeoutMs = dependencies.apiRequestTimeoutMs ?? REQUEST_TIMEOUT_MS;
  const maxResults = boundedInteger(input.maxResults, DEFAULT_MAX_RESULTS, MAX_RESULTS);
  const maxPages = boundedInteger(input.maxPages, DEFAULT_MAX_PAGES, MAX_PAGES);
  if (input.cursor === undefined || input.cursor === null || input.cursor === "") {
    return safeBaseline(input, checkedAt, token.accessToken, fetcher, requestTimeoutMs, false);
  }
  const cursor = parsedCursor(input.cursor);
  if (!cursor) {
    return safeBaseline(input, checkedAt, token.accessToken, fetcher, requestTimeoutMs, true);
  }
  return cursor.mode === "history"
    ? pollHistory(
      cursor, input, checkedAt, token.accessToken, fetcher, requestTimeoutMs, maxResults, maxPages,
    )
    : pollRecovery(
      cursor, input, checkedAt, token.accessToken, fetcher, requestTimeoutMs, maxResults, maxPages,
    );
}

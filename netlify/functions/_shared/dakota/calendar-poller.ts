import { createHash } from "node:crypto";

import {
  getGoogleWorkspaceAccessToken,
  GOOGLE_CALENDAR_READ_SCOPES,
  googleApiFailureStatus,
  type GoogleOAuthDependencies,
  type GoogleWorkspaceHealthStatus,
} from "./google-oauth";
import type {
  DakotaExternalEventInput,
  DakotaExternalEventKind,
} from "./revenue-bridge-schema";
import {
  createPersistedContactEmailMatcher,
  type DakotaWorkspaceContactMatch,
  type DakotaWorkspaceEmailMatcher,
  type DakotaWorkspaceRecords,
} from "./workspace-contact-match";

const GOOGLE_CALENDAR_EVENTS_ENDPOINT = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESULTS = 250;
const MAX_RESULTS = 250;
const DEFAULT_MAX_PAGES = 4;
const MAX_PAGES = 10;
const UNKNOWN_OCCURRENCE_AT = "1970-01-01T00:00:00.000Z";
const EVENT_FIELDS = [
  "id",
  "status",
  "created",
  "updated",
  "summary",
  "start(date,dateTime)",
  "end(date,dateTime)",
  "attendees(email)",
  "recurringEventId",
  "originalStartTime(date,dateTime)",
].join(",");

interface CalendarAttendee {
  email?: unknown;
}

interface CalendarDateTime {
  date?: unknown;
  dateTime?: unknown;
}

interface CalendarEvent {
  id?: unknown;
  status?: unknown;
  created?: unknown;
  updated?: unknown;
  summary?: unknown;
  start?: CalendarDateTime;
  end?: CalendarDateTime;
  attendees?: unknown;
  recurringEventId?: unknown;
  originalStartTime?: CalendarDateTime;
}

export type DakotaCalendarSignal = DakotaWorkspaceContactMatch & {
  provider: "google_calendar";
  kind: "calendar_created" | "calendar_changed" | "calendar_cancelled";
  reviewState: "needs_review";
  providerRef: string;
  recurringEventRef: string | null;
  occurredAt: string;
  startsAt: string | null;
  endsAt: string | null;
  summary: string;
  event: DakotaExternalEventInput;
};

export interface DakotaCalendarPollInput {
  records: DakotaWorkspaceRecords;
  syncToken?: string | null;
  initialUpdatedMin?: string | null;
  maxResults?: number;
  maxPages?: number;
}

export interface DakotaCalendarPollResult {
  provider: "google_calendar";
  status: GoogleWorkspaceHealthStatus;
  checkedAt: string;
  nextSyncToken: string | null;
  resetRequired: boolean;
  signals: DakotaCalendarSignal[];
}

export interface DakotaCalendarPollDependencies extends GoogleOAuthDependencies {
  now?: () => Date;
  apiRequestTimeoutMs?: number;
}

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

function boundedToken(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= 2_048 &&
    value === value.trim() &&
    !/[\s<>]|\p{Cc}/u.test(value)
    ? value
    : null;
}

function boundedEventId(value: unknown): string | null {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= 1_024 &&
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

function isoTimestamp(value: unknown, fallback: string | null): string | null {
  if (typeof value !== "string" || value.length > 64 || !value.trim()) return fallback;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : fallback;
}

function observedTimestamp(event: CalendarEvent): string {
  for (const value of [event.updated, event.created]) {
    const parsed = isoTimestamp(value, null);
    if (parsed !== null) {
      const year = new Date(parsed).getUTCFullYear();
      if (year >= 2000 && year <= 2100) return parsed;
    }
  }
  // Sparse cancelled instances are only guaranteed to retain identity and
  // recurrence fields. A deterministic sentinel is safer than poll time: it
  // keeps retries idempotent and never fabricates a future occurrence.
  return UNKNOWN_OCCURRENCE_AT;
}

function eventDateTime(value: CalendarDateTime | undefined): string | null {
  return isoTimestamp(value?.dateTime, null) ?? (
    typeof value?.date === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value.date)
      ? value.date
      : null
  );
}

function attendeeEmails(event: CalendarEvent): string[] {
  if (!Array.isArray(event.attendees)) return [];
  const emails = new Set<string>();
  for (const attendee of event.attendees as CalendarAttendee[]) {
    const email = boundedPlain(attendee.email, 254).toLowerCase();
    if (/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(email)) emails.add(email);
  }
  return [...emails];
}

function stableDigest(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function calendarKinds(event: CalendarEvent): {
  signalKind: DakotaCalendarSignal["kind"];
  eventKind: DakotaExternalEventKind;
} {
  if (event.status === "cancelled") {
    return { signalKind: "calendar_cancelled", eventKind: "booking_cancelled" };
  }
  const createdAt = isoTimestamp(event.created, null);
  const updatedAt = isoTimestamp(event.updated, null);
  if (createdAt !== null && createdAt === updatedAt) {
    return { signalKind: "calendar_created", eventKind: "booking_created" };
  }
  return { signalKind: "calendar_changed", eventKind: "provider_notice" };
}

function externalEventReference(providerRef: string): string {
  const direct = `google_calendar:${providerRef}`;
  return direct.length <= 256 && /^[A-Za-z0-9][A-Za-z0-9._:/+=-]*$/u.test(direct)
    ? direct
    : `google_calendar:${stableDigest(providerRef)}`;
}

function bridgeEvent(
  providerRef: string,
  occurred_at: string,
  kind: DakotaExternalEventKind,
  match: DakotaWorkspaceContactMatch,
): DakotaExternalEventInput {
  const action = kind === "booking_cancelled"
    ? "cancellation"
    : kind === "booking_created"
      ? "creation"
      : "change";
  return {
    event_id: `google_calendar:${stableDigest(`${providerRef}:${kind}:${occurred_at}`)}`,
    provider: "google_calendar",
    kind,
    summary: match.matchState === "matched"
      ? `Google Calendar booking ${action} matched a persisted contact.`
      : `Google Calendar booking ${action} needs operator assignment.`,
    external_ref: externalEventReference(providerRef),
    occurred_at,
  };
}

function signalFromEvent(
  event: CalendarEvent,
  matchContact: DakotaWorkspaceEmailMatcher,
): DakotaCalendarSignal | null {
  const providerRef = boundedEventId(event.id);
  if (!providerRef) return null;
  const kinds = calendarKinds(event);
  const observedAt = observedTimestamp(event);
  const match = matchContact(attendeeEmails(event));
  return {
    provider: "google_calendar",
    kind: kinds.signalKind,
    reviewState: "needs_review",
    providerRef,
    recurringEventRef: boundedEventId(event.recurringEventId),
    occurredAt: observedAt,
    startsAt: eventDateTime(event.start) ?? eventDateTime(event.originalStartTime),
    endsAt: eventDateTime(event.end),
    summary: boundedPlain(event.summary, 300),
    event: bridgeEvent(providerRef, observedAt, kinds.eventKind, match),
    ...match,
  };
}

function emptyResult(
  status: Exclude<GoogleWorkspaceHealthStatus, "connected">,
  checkedAt: string,
  resetRequired = false,
): DakotaCalendarPollResult {
  return {
    provider: "google_calendar",
    status,
    checkedAt,
    nextSyncToken: null,
    resetRequired,
    signals: [],
  };
}

/**
 * Read the primary calendar using Google's durable incremental-sync token.
 * Deleted events are always requested. Signals are observational only: this
 * adapter neither persists them nor changes an opportunity stage.
 */
export async function pollDakotaGoogleCalendar(
  input: DakotaCalendarPollInput,
  dependencies: DakotaCalendarPollDependencies = {},
): Promise<DakotaCalendarPollResult> {
  const checkedAt = (dependencies.now ?? (() => new Date()))().toISOString();
  const token = await getGoogleWorkspaceAccessToken(
    { acceptedScopes: GOOGLE_CALENDAR_READ_SCOPES },
    dependencies,
  );
  if (token.status !== "connected") return emptyResult(token.status, checkedAt);

  const syncToken = boundedToken(input.syncToken);
  if (typeof input.syncToken === "string" && input.syncToken.trim() && !syncToken) {
    return emptyResult("unavailable", checkedAt);
  }
  const maxResults = boundedInteger(input.maxResults, DEFAULT_MAX_RESULTS, MAX_RESULTS);
  const maxPages = boundedInteger(input.maxPages, DEFAULT_MAX_PAGES, MAX_PAGES);
  const initialUpdatedMin = syncToken ? null : isoTimestamp(input.initialUpdatedMin, null);
  if (
    !syncToken &&
    typeof input.initialUpdatedMin === "string" &&
    input.initialUpdatedMin.trim() &&
    (!initialUpdatedMin || Date.parse(initialUpdatedMin) > Date.parse(checkedAt))
  ) {
    return emptyResult("unavailable", checkedAt);
  }
  const fetcher = dependencies.fetch ?? globalThis.fetch;
  const apiRequestTimeoutMs = dependencies.apiRequestTimeoutMs ?? REQUEST_TIMEOUT_MS;
  const signals: DakotaCalendarSignal[] = [];
  const matchContact = createPersistedContactEmailMatcher(input.records);
  let pageToken: string | null = null;

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({
      showDeleted: "true",
      singleEvents: "false",
      maxResults: String(maxResults),
      fields: `items(${EVENT_FIELDS}),nextPageToken,nextSyncToken`,
    });
    if (syncToken) params.set("syncToken", syncToken);
    else if (initialUpdatedMin) params.set("updatedMin", initialUpdatedMin);
    if (pageToken) params.set("pageToken", pageToken);

    let response: Response;
    try {
      response = await fetcher(`${GOOGLE_CALENDAR_EVENTS_ENDPOINT}?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(apiRequestTimeoutMs),
      });
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (!response.ok) {
      if (response.status === 410 && syncToken) {
        return emptyResult("unavailable", checkedAt, true);
      }
      return emptyResult(await googleApiFailureStatus(response), checkedAt);
    }

    let body: { items?: unknown; nextPageToken?: unknown; nextSyncToken?: unknown };
    try {
      body = await response.json() as typeof body;
    } catch {
      return emptyResult("unavailable", checkedAt);
    }
    if (body.items !== undefined && !Array.isArray(body.items)) {
      return emptyResult("unavailable", checkedAt);
    }
    const items = Array.isArray(body.items) ? body.items as CalendarEvent[] : [];
    if (items.length > maxResults) return emptyResult("unavailable", checkedAt);
    for (const event of items) {
      const signal = signalFromEvent(event, matchContact);
      if (!signal) return emptyResult("unavailable", checkedAt);
      signals.push(signal);
    }

    pageToken = boundedToken(body.nextPageToken);
    if (body.nextPageToken !== undefined && body.nextPageToken !== null && !pageToken) {
      return emptyResult("unavailable", checkedAt);
    }
    if (pageToken) continue;
    const nextSyncToken = boundedToken(body.nextSyncToken);
    if (!nextSyncToken) return emptyResult("unavailable", checkedAt);
    return {
      provider: "google_calendar",
      status: "connected",
      checkedAt,
      nextSyncToken,
      resetRequired: false,
      signals,
    };
  }

  // Never expose a partial page set as complete: without Google's final token,
  // a bridge could not advance safely and would risk missing later changes.
  return emptyResult("unavailable", checkedAt);
}

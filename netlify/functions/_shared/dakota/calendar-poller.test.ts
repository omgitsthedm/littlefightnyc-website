import { describe, expect, it, vi } from "vitest";

import { pollDakotaGoogleCalendar } from "./calendar-poller";
import { GOOGLE_CALENDAR_READ_SCOPES } from "./google-oauth";
import { validateDakotaRevenueBridgeServerMutation } from "./revenue-bridge-schema";
import type { DakotaWorkspaceRecords } from "./workspace-contact-match";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const CANDIDATE_KEY = "manual:550e8400-e29b-41d4-a716-446655440000";
const CONTACT_ID = "550e8400-e29b-41d4-a716-446655440001";

function records(): DakotaWorkspaceRecords {
  return {
    [CANDIDATE_KEY]: {
      contacts: [{
        contactId: CONTACT_ID,
        name: "Ari Owner",
        role: "Owner",
        channel: "email",
        value: "ari@example.com",
        sourceUrl: "https://example.com/contact",
        verifiedAt: "2026-08-01",
        consentClassification: "existing_relationship",
      }],
    },
  };
}

function getEnv(name: string): string | undefined {
  const environment: Record<string, string> = {
    GMAIL_OAUTH_CLIENT_ID: "client-id",
    GMAIL_OAUTH_CLIENT_SECRET: "client-secret",
    GMAIL_OAUTH_REFRESH_TOKEN: "refresh-token",
  };
  return environment[name];
}

function tokenResponse(scope: string = GOOGLE_CALENDAR_READ_SCOPES[0]): Response {
  return new Response(JSON.stringify({ access_token: "access-token", scope }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Dakota Google Calendar incremental poller", () => {
  it("keeps showDeleted and syncToken across pages, emits change/cancellation review signals, and leaves unmatched events unassigned", async () => {
    const persistedRecords = records();
    const before = JSON.stringify(persistedRecords);
    let calendarPage = 0;
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();

      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();
      expect(url.pathname).toBe("/calendar/v3/calendars/primary/events");
      expect(url.searchParams.get("showDeleted")).toBe("true");
      expect(url.searchParams.get("singleEvents")).toBe("false");
      expect(url.searchParams.get("syncToken")).toBe("sync-old");
      expect(url.searchParams.has("timeMin")).toBe(false);
      expect(url.searchParams.has("timeMax")).toBe(false);
      expect(url.searchParams.has("q")).toBe(false);
      expect(url.searchParams.get("fields")).toContain("attendees(email)");
      expect(url.searchParams.get("fields")).not.toMatch(/description|attachments|conferenceData/iu);

      calendarPage += 1;
      if (calendarPage === 1) {
        expect(url.searchParams.has("pageToken")).toBe(false);
        return new Response(JSON.stringify({
          items: [{
            id: "event-change",
            status: "confirmed",
            updated: "2026-08-03T11:45:00.000Z",
            summary: "Website review",
            start: { dateTime: "2026-08-05T14:00:00-04:00" },
            end: { dateTime: "2026-08-05T14:30:00-04:00" },
            attendees: [
              { email: "hello@littlefightnyc.com" },
              { email: "ARI@EXAMPLE.COM" },
            ],
          }],
          nextPageToken: "page-2",
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      expect(url.searchParams.get("pageToken")).toBe("page-2");
      return new Response(JSON.stringify({
        items: [{
          id: "event-cancelled",
          status: "cancelled",
          updated: "2026-08-03T11:50:00.000Z",
          recurringEventId: "series-1",
          originalStartTime: { dateTime: "2026-08-06T14:00:00-04:00" },
          attendees: [{ email: "unmatched@example.net" }],
        }],
        nextSyncToken: "sync-new",
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    const result = await pollDakotaGoogleCalendar({
      records: persistedRecords,
      syncToken: "sync-old",
    }, {
      getEnv,
      fetch: fetcher,
      now: () => NOW,
    });

    expect(result).toMatchObject({
      status: "connected",
      nextSyncToken: "sync-new",
      resetRequired: false,
    });
    expect(result.signals).toHaveLength(2);
    expect(result.signals[0]).toMatchObject({
      kind: "calendar_changed",
      reviewState: "needs_review",
      candidateKey: CANDIDATE_KEY,
      contactId: CONTACT_ID,
      matchedEmail: "ari@example.com",
      startsAt: "2026-08-05T18:00:00.000Z",
      event: {
        provider: "google_calendar",
        kind: "provider_notice",
        external_ref: "google_calendar:event-change",
        occurred_at: "2026-08-03T11:45:00.000Z",
      },
    });
    expect(result.signals[1]).toMatchObject({
      kind: "calendar_cancelled",
      reviewState: "needs_review",
      matchState: "unmatched",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
      recurringEventRef: "series-1",
      event: {
        provider: "google_calendar",
        kind: "booking_cancelled",
        external_ref: "google_calendar:event-cancelled",
      },
    });
    expect(result.signals[0]?.event.event_id).toMatch(/^google_calendar:[a-f0-9]{32}$/u);
    const matchedSignal = result.signals[0];
    if (!matchedSignal) throw new Error("Expected a matched Calendar signal.");
    expect(validateDakotaRevenueBridgeServerMutation({
      type: "append_external_event",
      candidate_key: CANDIDATE_KEY,
      event: matchedSignal.event,
    })).toMatchObject({ valid: true });
    expect(JSON.stringify(result)).not.toContain("unmatched@example.net");
    expect(JSON.stringify(persistedRecords)).toBe(before);
  });

  it("returns Google's final nextSyncToken for an initial full sync", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      expect(url.searchParams.has("syncToken")).toBe(false);
      return new Response(JSON.stringify({
        items: [{
          id: "event-created",
          status: "confirmed",
          created: "2026-08-03T11:55:00.000Z",
          updated: "2026-08-03T11:55:00.000Z",
          summary: "New discovery call",
          attendees: [{ email: "ari@example.com" }],
        }],
        nextSyncToken: "sync-initial",
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const result = await pollDakotaGoogleCalendar({ records: records() }, {
      getEnv,
      fetch: fetcher,
      now: () => NOW,
    });

    expect(result).toMatchObject({
      status: "connected",
      nextSyncToken: "sync-initial",
    });
    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]).toMatchObject({
      kind: "calendar_created",
      candidateKey: CANDIDATE_KEY,
      reviewState: "needs_review",
      event: {
        provider: "google_calendar",
        kind: "booking_created",
        occurred_at: "2026-08-03T11:55:00.000Z",
      },
    });
  });

  it("reports not_configured and insufficient_scope explicitly", async () => {
    const noFetch = vi.fn<typeof fetch>();
    const notConfigured = await pollDakotaGoogleCalendar({ records: records() }, {
      getEnv: () => undefined,
      fetch: noFetch,
      now: () => NOW,
    });
    const sendOnly = await pollDakotaGoogleCalendar({ records: records() }, {
      getEnv,
      fetch: async () => tokenResponse("https://www.googleapis.com/auth/gmail.send"),
      now: () => NOW,
    });

    expect(notConfigured.status).toBe("not_configured");
    expect(noFetch).not.toHaveBeenCalled();
    expect(sendOnly.status).toBe("insufficient_scope");
  });

  it("marks an expired sync token for reset and keeps provider outages unavailable", async () => {
    const expiredFetcher = vi.fn<typeof fetch>(async (input) => (
      String(input).includes("oauth2.googleapis.com")
        ? tokenResponse()
        : new Response("Sync token is no longer valid", { status: 410 })
    ));
    const unavailableFetcher = vi.fn<typeof fetch>(async (input) => (
      String(input).includes("oauth2.googleapis.com")
        ? tokenResponse()
        : new Response("provider outage", { status: 503 })
    ));

    const expired = await pollDakotaGoogleCalendar({
      records: records(),
      syncToken: "sync-old",
    }, { getEnv, fetch: expiredFetcher, now: () => NOW });
    const unavailable = await pollDakotaGoogleCalendar({
      records: records(),
      syncToken: "sync-old",
    }, { getEnv, fetch: unavailableFetcher, now: () => NOW });

    expect(expired).toMatchObject({
      status: "unavailable",
      resetRequired: true,
      nextSyncToken: null,
      signals: [],
    });
    expect(unavailable).toMatchObject({
      status: "unavailable",
      resetRequired: false,
      nextSyncToken: null,
      signals: [],
    });
  });

  it("keeps sparse cancellation IDs stable when a held cursor replays on a later run", async () => {
    const provider = vi.fn<typeof fetch>(async (input) => (
      String(input).includes("oauth2.googleapis.com")
        ? tokenResponse()
        : new Response(JSON.stringify({
          items: [{
            id: "sparse-cancellation",
            status: "cancelled",
            recurringEventId: "series-1",
            originalStartTime: { dateTime: "2026-08-10T14:00:00-04:00" },
          }],
          nextSyncToken: "sync-new",
        }), { status: 200, headers: { "Content-Type": "application/json" } })
    ));

    const first = await pollDakotaGoogleCalendar({ records: records(), syncToken: "sync-old" }, {
      getEnv,
      fetch: provider,
      now: () => NOW,
    });
    const replay = await pollDakotaGoogleCalendar({ records: records(), syncToken: "sync-old" }, {
      getEnv,
      fetch: provider,
      now: () => new Date("2026-08-03T12:15:00.000Z"),
    });

    expect(first.signals[0]?.event).toMatchObject({
      kind: "booking_cancelled",
      occurred_at: "1970-01-01T00:00:00.000Z",
    });
    expect(replay.signals[0]?.event).toEqual(first.signals[0]?.event);
  });
});

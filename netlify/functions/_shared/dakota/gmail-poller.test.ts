import { describe, expect, it, vi } from "vitest";

import { isDakotaGmailCursor, pollDakotaGmail } from "./gmail-poller";
import { GOOGLE_GMAIL_READ_SCOPES } from "./google-oauth";
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
  return {
    GMAIL_OAUTH_CLIENT_ID: "client-id",
    GMAIL_OAUTH_CLIENT_SECRET: "client-secret",
    GMAIL_OAUTH_REFRESH_TOKEN: "refresh-token",
  }[name];
}

function tokenResponse(scope: string | undefined = GOOGLE_GMAIL_READ_SCOPES[0]): Response {
  return new Response(JSON.stringify({
    access_token: "access-token",
    ...(scope ? { scope } : {}),
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function metadata(
  id: string,
  from = "Ari Owner <ari@example.com>",
  internalDate = "2026-08-03T11:45:00.000Z",
  labels: string[] = ["INBOX"],
): Response {
  return json({
    id,
    threadId: `thread-${id}`,
    labelIds: labels,
    internalDate: String(Date.parse(internalDate)),
    snippet: "body text must never escape",
    payload: {
      headers: [
        { name: "From", value: from },
        { name: "Subject", value: `Reply ${id}` },
      ],
      body: { data: "private-body-data" },
    },
  });
}

function historyRecord(id: string, messageId: string): Record<string, unknown> {
  return { id, messagesAdded: [{ message: { id: messageId, threadId: `thread-${messageId}` } }] };
}

describe("Dakota Gmail History metadata poller", () => {
  it("creates a safe current-mailbox baseline without reading historical messages", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      expect(init?.method).toBe("GET");
      expect(url.pathname).toBe("/gmail/v1/users/me/profile");
      expect(url.searchParams.get("fields")).toBe("historyId");
      return json({ historyId: "100" });
    });

    const result = await pollDakotaGmail({ records: records() }, {
      getEnv,
      fetch: fetcher,
      now: () => NOW,
    });

    expect(result).toMatchObject({
      status: "connected",
      mode: "baseline",
      hasMore: false,
      resetRequired: false,
      signals: [],
    });
    expect(result.nextCursor).toBe("gh1:h:100");
    expect(isDakotaGmailCursor(result.nextCursor)).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("reads every bounded History page, handles more than ten replies, and requests metadata only", async () => {
    const messageIds = Array.from({ length: 12 }, (_, index) => `message-${index + 1}`);
    let historyPage = 0;
    const fetcher = vi.fn<typeof fetch>(async (input, init) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      expect(init?.method).toBe("GET");
      expect(init?.body).toBeUndefined();

      if (url.pathname.endsWith("/history")) {
        expect(url.searchParams.get("startHistoryId")).toBe("100");
        expect(url.searchParams.get("historyTypes")).toBe("messageAdded");
        expect(url.searchParams.get("maxResults")).toBe("10");
        expect(url.searchParams.get("fields")).toBe(
          "history(id,messagesAdded(message(id,threadId))),historyId,nextPageToken",
        );
        expect(url.search).not.toMatch(/snippet|body|raw|parts/iu);
        historyPage += 1;
        if (historyPage === 1) {
          expect(url.searchParams.has("pageToken")).toBe(false);
          return json({
            history: messageIds.slice(0, 10).map((id, index) => historyRecord(String(101 + index), id)),
            nextPageToken: "history-page-2",
            historyId: "112",
          });
        }
        expect(url.searchParams.get("pageToken")).toBe("history-page-2");
        return json({
          history: messageIds.slice(10).map((id, index) => historyRecord(String(111 + index), id)),
          historyId: "130",
        });
      }

      const messageId = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
      expect(messageIds).toContain(messageId);
      expect(url.searchParams.get("format")).toBe("metadata");
      expect(url.searchParams.get("fields")).toBe(
        "id,threadId,labelIds,internalDate,payload(headers(name,value))",
      );
      expect(url.searchParams.getAll("metadataHeaders")).toEqual(["From", "Reply-To", "Subject"]);
      return metadata(messageId);
    });

    const result = await pollDakotaGmail({
      records: records(),
      cursor: "gh1:h:100",
      maxResults: 10,
      maxPages: 2,
    }, { getEnv, fetch: fetcher, now: () => NOW });

    expect(result).toMatchObject({
      status: "connected",
      mode: "history",
      hasMore: false,
      nextCursor: "gh1:h:130",
      resetRequired: false,
    });
    expect(result.signals).toHaveLength(12);
    expect(result.signals.every((signal) => (
      signal.matchState === "matched" && signal.candidateKey === CANDIDATE_KEY
    ))).toBe(true);
    expect(new Set(result.signals.map((signal) => signal.event.event_id)).size).toBe(12);
    expect(JSON.stringify(result)).not.toMatch(/body text|private-body-data/iu);
    const first = result.signals[0];
    if (!first) throw new Error("Expected a Gmail signal.");
    expect(validateDakotaRevenueBridgeServerMutation({
      type: "append_external_event",
      candidate_key: CANDIDATE_KEY,
      event: first.event,
    })).toMatchObject({ valid: true });
  });

  it("encodes a bounded History page continuation and resumes it on the next run", async () => {
    const firstFetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      if (url.pathname.endsWith("/history")) {
        expect(url.searchParams.has("pageToken")).toBe(false);
        return json({
          history: [historyRecord("101", "message-1"), historyRecord("102", "message-2")],
          nextPageToken: "continue-here",
          historyId: "140",
        });
      }
      return metadata(decodeURIComponent(url.pathname.split("/").at(-1) ?? ""));
    });
    const first = await pollDakotaGmail({
      records: records(),
      cursor: "gh1:h:100",
      maxPages: 1,
    }, { getEnv, fetch: firstFetcher, now: () => NOW });

    expect(first).toMatchObject({ status: "connected", mode: "history", hasMore: true });
    expect(first.signals).toHaveLength(2);
    expect(first.nextCursor).toMatch(/^gh1:p:100:/u);
    expect(isDakotaGmailCursor(first.nextCursor)).toBe(true);

    const secondFetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      if (url.pathname.endsWith("/history")) {
        expect(url.searchParams.get("startHistoryId")).toBe("100");
        expect(url.searchParams.get("pageToken")).toBe("continue-here");
        return json({ history: [historyRecord("140", "message-3")], historyId: "140" });
      }
      return metadata("message-3");
    });
    const second = await pollDakotaGmail({
      records: records(),
      cursor: first.nextCursor,
      maxPages: 1,
    }, { getEnv, fetch: secondFetcher, now: () => NOW });

    expect(second).toMatchObject({
      status: "connected",
      mode: "history",
      hasMore: false,
      nextCursor: "gh1:h:140",
    });
    expect(second.signals.map((signal) => signal.providerRef)).toEqual(["message-3"]);
  });

  it("keeps unknown senders unassigned and never mislabels operator-sent mail", async () => {
    const fetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      if (url.pathname.endsWith("/history")) {
        return json({
          history: [historyRecord("101", "unknown-1"), historyRecord("102", "sent-1")],
          historyId: "102",
        });
      }
      if (url.pathname.endsWith("/unknown-1")) {
        const response = metadata("unknown-1", "Unknown <stranger@example.net>");
        const body = await response.json() as { payload: { headers: unknown[] } };
        body.payload.headers.push({ name: "To", value: "Ari Owner <ari@example.com>" });
        return json(body);
      }
      return metadata(
        "sent-1",
        "Little Fight NYC <hello@littlefightnyc.com>",
        "2026-08-03T11:46:00.000Z",
        ["SENT"],
      );
    });

    const result = await pollDakotaGmail({ records: records(), cursor: "gh1:h:100" }, {
      getEnv,
      fetch: fetcher,
      now: () => NOW,
    });

    expect(result.signals).toHaveLength(1);
    expect(result.signals[0]).toMatchObject({
      providerRef: "unknown-1",
      matchState: "unmatched",
      candidateKey: null,
      contactId: null,
      matchedEmail: null,
    });
    expect(JSON.stringify(result)).not.toContain("stranger@example.net");
  });

  it("recovers invalid and expired History cursors with a bounded metadata-only full-sync continuation", async () => {
    const beginRecovery = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      expect(url.pathname).toBe("/gmail/v1/users/me/profile");
      return json({ historyId: "500" });
    });
    const invalid = await pollDakotaGmail({
      records: records(),
      cursor: "not-a-history-cursor",
      recoveryAfter: "2026-08-03T11:30:00.000Z",
    }, { getEnv, fetch: beginRecovery, now: () => NOW });

    expect(invalid).toMatchObject({
      status: "connected",
      mode: "recovery",
      resetRequired: true,
      hasMore: true,
      signals: [],
    });
    expect(invalid.nextCursor).toMatch(/^gh1:r:500:/u);

    const recoveryFetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      if (url.pathname.endsWith("/messages")) {
        expect(url.searchParams.has("pageToken")).toBe(false);
        expect(url.searchParams.get("fields")).toBe("messages(id,threadId),nextPageToken");
        return json({ messages: [{ id: "old-message" }, { id: "new-message" }] });
      }
      return url.pathname.endsWith("/old-message")
        ? metadata("old-message", undefined, "2026-08-01T10:00:00.000Z")
        : metadata("new-message", undefined, "2026-08-03T11:45:00.000Z");
    });
    const recovered = await pollDakotaGmail({
      records: records(),
      cursor: invalid.nextCursor,
    }, { getEnv, fetch: recoveryFetcher, now: () => NOW });

    expect(recovered).toMatchObject({
      status: "connected",
      mode: "recovery",
      resetRequired: false,
      hasMore: false,
      nextCursor: "gh1:h:500",
    });
    expect(recovered.signals.map((signal) => signal.providerRef)).toEqual(["new-message"]);

    const expiredFetcher = vi.fn<typeof fetch>(async (input) => {
      const url = new URL(String(input));
      if (url.hostname === "oauth2.googleapis.com") return tokenResponse();
      if (url.pathname.endsWith("/history")) return json({ error: "history expired" }, 404);
      expect(url.pathname).toBe("/gmail/v1/users/me/profile");
      return json({ historyId: "600" });
    });
    const expired = await pollDakotaGmail({
      records: records(),
      cursor: "gh1:h:100",
      recoveryAfter: "2026-08-03T11:30:00.000Z",
    }, { getEnv, fetch: expiredFetcher, now: () => NOW });

    expect(expired).toMatchObject({
      status: "connected",
      mode: "recovery",
      resetRequired: true,
      hasMore: true,
    });
    expect(expired.nextCursor).toMatch(/^gh1:r:600:/u);
  });

  it("reports configuration, scope, and provider failures without inventing a cursor", async () => {
    const noFetch = vi.fn<typeof fetch>();
    const notConfigured = await pollDakotaGmail({ records: records() }, {
      getEnv: () => undefined,
      fetch: noFetch,
      now: () => NOW,
    });
    const insufficient = await pollDakotaGmail({ records: records() }, {
      getEnv,
      fetch: async () => tokenResponse("https://www.googleapis.com/auth/gmail.send"),
      now: () => NOW,
    });
    const unavailable = await pollDakotaGmail({ records: records(), cursor: "gh1:h:100" }, {
      getEnv,
      fetch: async (input) => String(input).includes("oauth2.googleapis.com")
        ? tokenResponse(undefined)
        : new Response("provider outage", { status: 503 }),
      now: () => NOW,
    });

    expect(notConfigured).toMatchObject({ status: "not_configured", nextCursor: null, signals: [] });
    expect(noFetch).not.toHaveBeenCalled();
    expect(insufficient).toMatchObject({ status: "insufficient_scope", nextCursor: null });
    expect(unavailable).toMatchObject({ status: "unavailable", nextCursor: null });
  });
});

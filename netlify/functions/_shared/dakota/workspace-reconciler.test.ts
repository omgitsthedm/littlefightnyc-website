import { describe, expect, it, vi } from "vitest";

import type { DakotaCalendarPollResult, DakotaCalendarSignal } from "./calendar-poller";
import type { DakotaGmailPollResult, DakotaGmailSignal } from "./gmail-poller";
import type {
  DakotaRevenueBridgeEnvelope,
  DakotaRevenueBridgeServerMutation,
} from "./revenue-bridge-schema";
import {
  applyDakotaRevenueBridgeServerMutations,
  type DakotaRevenueBridgeStore,
} from "./revenue-bridge-store";
import {
  reconcileDakotaWorkspaceProviders,
  type DakotaWorkspaceReconcilerDependencies,
} from "./workspace-reconciler";
import type { DakotaWorkspaceRecords } from "./workspace-contact-match";

const CANDIDATE_KEY = "manual:550e8400-e29b-41d4-a716-446655440000";
const CONTACT_ID = "550e8400-e29b-41d4-a716-446655440001";
const INITIAL_TIME = "2026-08-03T10:00:00.000Z";
const POLL_TIME = "2026-08-03T12:00:00.000Z";
const WRITE_TIME = new Date("2026-08-03T12:01:00.000Z");

class FakeStore {
  data: DakotaRevenueBridgeEnvelope | null = null;
  etag: string | null = null;
  writes = 0;

  async getWithMetadata(): Promise<{
    data: DakotaRevenueBridgeEnvelope;
    etag: string;
    metadata: Record<string, never>;
  } | null> {
    if (!this.data || !this.etag) return null;
    return { data: structuredClone(this.data), etag: this.etag, metadata: {} };
  }

  async setJSON(
    _key: string,
    value: unknown,
    options: { onlyIfNew?: boolean; onlyIfMatch?: string },
  ): Promise<{ modified: boolean }> {
    if (options.onlyIfNew && this.data !== null) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) return { modified: false };
    this.writes += 1;
    this.data = structuredClone(value) as DakotaRevenueBridgeEnvelope;
    this.etag = `etag-${this.writes}`;
    return { modified: true };
  }
}

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

function gmailSignal(index: number): DakotaGmailSignal {
  const minute = String(10 + index).padStart(2, "0");
  const occurredAt = `2026-08-03T11:${minute}:00.000Z`;
  return {
    provider: "gmail",
    kind: "gmail_message",
    reviewState: "needs_review",
    direction: "inbound",
    providerRef: `gmail-message-${index}`,
    threadRef: `gmail-thread-${index}`,
    occurredAt,
    subject: `Reply ${index}`,
    event: {
      event_id: `gmail:event-${index}`,
      provider: "gmail",
      kind: "message_received",
      summary: "Inbound Gmail metadata matched a persisted contact.",
      external_ref: `gmail:gmail-message-${index}`,
      occurred_at: occurredAt,
    },
    matchState: "matched",
    candidateKey: CANDIDATE_KEY,
    contactId: CONTACT_ID,
    matchedEmail: "ari@example.com",
  };
}

function calendarSignal(index: number): DakotaCalendarSignal {
  const minute = String(20 + index).padStart(2, "0");
  const occurredAt = `2026-08-03T11:${minute}:00.000Z`;
  return {
    provider: "google_calendar",
    kind: "calendar_changed",
    reviewState: "needs_review",
    providerRef: `calendar-event-${index}`,
    recurringEventRef: null,
    occurredAt,
    startsAt: "2026-08-04T12:00:00.000Z",
    endsAt: "2026-08-04T12:30:00.000Z",
    summary: `Meeting ${index}`,
    event: {
      event_id: `google_calendar:event-${index}`,
      provider: "google_calendar",
      kind: "provider_notice",
      summary: "Google Calendar booking change matched a persisted contact.",
      external_ref: `google_calendar:calendar-event-${index}`,
      occurred_at: occurredAt,
    },
    matchState: "matched",
    candidateKey: CANDIDATE_KEY,
    contactId: CONTACT_ID,
    matchedEmail: "ari@example.com",
  };
}

function gmailResult(
  signals: DakotaGmailSignal[] = [],
  overrides: Partial<DakotaGmailPollResult> = {},
): DakotaGmailPollResult {
  return {
    provider: "gmail",
    status: "connected",
    checkedAt: POLL_TIME,
    nextCursor: "gh1:h:200",
    resetRequired: false,
    mode: "history",
    hasMore: false,
    signals,
    ...overrides,
  };
}

function calendarResult(
  signals: DakotaCalendarSignal[] = [],
  overrides: Partial<DakotaCalendarPollResult> = {},
): DakotaCalendarPollResult {
  return {
    provider: "google_calendar",
    status: "connected",
    checkedAt: POLL_TIME,
    nextSyncToken: "sync-200",
    resetRequired: false,
    signals,
    ...overrides,
  };
}

function providerSeedMutations(includeObservedPlaces = false): DakotaRevenueBridgeServerMutation[] {
  const mutations: DakotaRevenueBridgeServerMutation[] = [
    {
      type: "update_provider",
      provider_state: {
        provider: "gmail",
        health: "healthy",
        detail: "Gmail History active.",
        cursor: "gh1:h:100",
        checked_at: INITIAL_TIME,
        consecutive_failures: 0,
      },
    },
    {
      type: "update_provider",
      provider_state: {
        provider: "google_calendar",
        health: "healthy",
        detail: "Calendar sync active.",
        cursor: "sync-100",
        checked_at: INITIAL_TIME,
        consecutive_failures: 0,
      },
    },
  ];
  if (includeObservedPlaces) {
    mutations.push({
      type: "update_provider",
      provider_state: {
        provider: "google_places",
        health: "degraded",
        detail: "The latest on-demand Google Places lookup was unavailable.",
        cursor: null,
        checked_at: INITIAL_TIME,
        consecutive_failures: 2,
      },
    });
  }
  return mutations;
}

async function seededStore(includeObservedPlaces = false): Promise<FakeStore> {
  const store = new FakeStore();
  const result = await applyDakotaRevenueBridgeServerMutations(
    providerSeedMutations(includeObservedPlaces),
    {
      getStore: () => store as unknown as DakotaRevenueBridgeStore,
      now: () => new Date(INITIAL_TIME),
    },
  );
  if (result.outcome !== "stored") throw new Error("Unable to seed Revenue Bridge state.");
  return store;
}

function realApply(
  store: FakeStore,
  calls: DakotaRevenueBridgeServerMutation[][],
): DakotaWorkspaceReconcilerDependencies["applyMutations"] {
  return async (mutations) => {
    calls.push(structuredClone([...mutations]));
    return applyDakotaRevenueBridgeServerMutations(mutations, {
      getStore: () => store as unknown as DakotaRevenueBridgeStore,
      now: () => WRITE_TIME,
    });
  };
}

describe("Dakota Workspace durable reconciliation", () => {
  it("never advances a provider cursor before its matched event write succeeds", async () => {
    const store = await seededStore();
    const applyMutations = vi.fn<DakotaWorkspaceReconcilerDependencies["applyMutations"]>(
      async () => ({ outcome: "conflict", error: "synthetic write failure" }),
    );

    await expect(reconcileDakotaWorkspaceProviders({
      records: records(),
      bridge: structuredClone(store.data),
    }, {
      now: () => new Date(POLL_TIME),
      pollGmail: async () => gmailResult(),
      pollCalendar: async () => calendarResult([calendarSignal(1)]),
      applyMutations,
    })).rejects.toThrow("signal_reconciliation_conflict");

    expect(applyMutations).toHaveBeenCalledTimes(1);
    const firstBatch = applyMutations.mock.calls[0]?.[0] ?? [];
    expect(firstBatch.map((mutation) => mutation.type)).toEqual(["append_external_event"]);
    expect(store.data?.providers.google_calendar?.cursor).toBe("sync-100");
    expect(store.data?.records[CANDIDATE_KEY]).toBeUndefined();
  });

  it("drains more than four matched signals per provider across runs and advances each cursor only after the final durable batch", async () => {
    const store = await seededStore();
    const calls: DakotaRevenueBridgeServerMutation[][] = [];
    const gmailSignals = Array.from({ length: 6 }, (_, index) => gmailSignal(index + 1));
    const calendarSignals = Array.from({ length: 6 }, (_, index) => calendarSignal(index + 1));
    const gmailInputs: string[] = [];
    const calendarInputs: string[] = [];
    const dependencies: DakotaWorkspaceReconcilerDependencies = {
      now: () => new Date(POLL_TIME),
      pollGmail: async (input) => {
        gmailInputs.push(input.cursor ?? "");
        return gmailResult(gmailSignals);
      },
      pollCalendar: async (input) => {
        calendarInputs.push(input.syncToken ?? "");
        return calendarResult(calendarSignals);
      },
      applyMutations: realApply(store, calls),
    };

    const first = await reconcileDakotaWorkspaceProviders({
      records: records(),
      bridge: structuredClone(store.data),
    }, dependencies);

    expect(first).toMatchObject({
      persistedSignals: 8,
      pendingMatchedSignals: 4,
      gmailCursorAdvanced: false,
      calendarCursorAdvanced: false,
    });
    expect(store.data?.providers.gmail?.cursor).toBe("gh1:h:100");
    expect(store.data?.providers.google_calendar?.cursor).toBe("sync-100");
    expect(store.data?.records[CANDIDATE_KEY]?.external_events).toHaveLength(8);
    expect(calls[0]?.every((mutation) => mutation.type === "append_external_event")).toBe(true);
    expect(calls[1]?.some((mutation) => mutation.type === "update_provider")).toBe(true);

    calls.length = 0;
    const secondDependencies: DakotaWorkspaceReconcilerDependencies = {
      ...dependencies,
      now: () => new Date("2026-08-03T12:15:00.000Z"),
      pollGmail: async (input) => {
        gmailInputs.push(input.cursor ?? "");
        return gmailResult(gmailSignals, { checkedAt: "2026-08-03T12:15:00.000Z" });
      },
      pollCalendar: async (input) => {
        calendarInputs.push(input.syncToken ?? "");
        return calendarResult(calendarSignals, { checkedAt: "2026-08-03T12:15:00.000Z" });
      },
    };
    const second = await reconcileDakotaWorkspaceProviders({
      records: records(),
      bridge: structuredClone(store.data),
    }, secondDependencies);

    expect(second).toMatchObject({
      persistedSignals: 4,
      pendingMatchedSignals: 0,
      gmailCursorAdvanced: true,
      calendarCursorAdvanced: true,
    });
    expect(gmailInputs).toEqual(["gh1:h:100", "gh1:h:100"]);
    expect(calendarInputs).toEqual(["sync-100", "sync-100"]);
    expect(store.data?.providers.gmail?.cursor).toBe("gh1:h:200");
    expect(store.data?.providers.google_calendar?.cursor).toBe("sync-200");
    expect(store.data?.records[CANDIDATE_KEY]?.external_events).toHaveLength(12);
  });

  it("retains cursors during temporary outages and safely clears only an explicitly expired Calendar cursor", async () => {
    const store = await seededStore();
    const calls: DakotaRevenueBridgeServerMutation[][] = [];
    await reconcileDakotaWorkspaceProviders({ records: records(), bridge: structuredClone(store.data) }, {
      now: () => new Date(POLL_TIME),
      pollGmail: async () => gmailResult([], {
        status: "unavailable",
        nextCursor: null,
        resetRequired: true,
        mode: null,
      }),
      pollCalendar: async () => calendarResult([], {
        status: "unavailable",
        nextSyncToken: null,
        resetRequired: false,
      }),
      applyMutations: realApply(store, calls),
    });

    expect(store.data?.providers.gmail?.cursor).toBe("gh1:h:100");
    expect(store.data?.providers.google_calendar?.cursor).toBe("sync-100");

    await reconcileDakotaWorkspaceProviders({ records: records(), bridge: structuredClone(store.data) }, {
      now: () => new Date("2026-08-03T12:15:00.000Z"),
      pollGmail: async () => gmailResult([], {
        checkedAt: "2026-08-03T12:15:00.000Z",
        nextCursor: "gh1:h:100",
      }),
      pollCalendar: async () => calendarResult([], {
        checkedAt: "2026-08-03T12:15:00.000Z",
        status: "unavailable",
        nextSyncToken: null,
        resetRequired: true,
      }),
      applyMutations: realApply(store, calls),
    });

    expect(store.data?.providers.gmail?.cursor).toBe("gh1:h:100");
    expect(store.data?.providers.google_calendar?.cursor).toMatch(/^dcb1:\d+$/u);
  });

  it("anchors an initial Calendar lookback while a multi-run baseline drains", async () => {
    const store = await seededStore();
    const cleared = await applyDakotaRevenueBridgeServerMutations([{
      type: "update_provider",
      provider_state: {
        provider: "google_calendar",
        health: "degraded",
        detail: "A fresh baseline is required.",
        cursor: null,
        checked_at: "2026-08-03T10:05:00.000Z",
        consecutive_failures: 1,
      },
    }], {
      getStore: () => store as unknown as DakotaRevenueBridgeStore,
      now: () => new Date("2026-08-03T10:05:00.000Z"),
    });
    if (cleared.outcome !== "stored") throw new Error("Unable to clear Calendar cursor.");
    const signals = Array.from({ length: 6 }, (_, index) => calendarSignal(index + 1));
    const initialUpdatedMins: string[] = [];
    const calls: DakotaRevenueBridgeServerMutation[][] = [];

    await reconcileDakotaWorkspaceProviders({ records: records(), bridge: structuredClone(store.data) }, {
      now: () => new Date(POLL_TIME),
      pollGmail: async () => gmailResult([], { nextCursor: "gh1:h:100" }),
      pollCalendar: async (input) => {
        expect(input.syncToken).toBeNull();
        initialUpdatedMins.push(input.initialUpdatedMin ?? "");
        return calendarResult(signals);
      },
      applyMutations: realApply(store, calls),
    });

    expect(store.data?.providers.google_calendar?.cursor).toMatch(/^dcb1:\d+$/u);
    expect(store.data?.records[CANDIDATE_KEY]?.external_events).toHaveLength(4);

    await reconcileDakotaWorkspaceProviders({ records: records(), bridge: structuredClone(store.data) }, {
      now: () => new Date("2026-08-03T12:15:00.000Z"),
      pollGmail: async () => gmailResult([], {
        checkedAt: "2026-08-03T12:15:00.000Z",
        nextCursor: "gh1:h:100",
      }),
      pollCalendar: async (input) => {
        expect(input.syncToken).toBeNull();
        initialUpdatedMins.push(input.initialUpdatedMin ?? "");
        return calendarResult(signals, { checkedAt: "2026-08-03T12:15:00.000Z" });
      },
      applyMutations: realApply(store, calls),
    });

    expect(initialUpdatedMins).toEqual([
      "2026-07-04T12:00:00.000Z",
      "2026-07-04T12:00:00.000Z",
    ]);
    expect(store.data?.providers.google_calendar?.cursor).toBe("sync-200");
    expect(store.data?.records[CANDIDATE_KEY]?.external_events).toHaveLength(6);
  });

  it("preserves observed Places/Yelp health and labels configured-but-unchecked providers as unknown", async () => {
    const store = await seededStore(true);
    const calls: DakotaRevenueBridgeServerMutation[][] = [];
    await reconcileDakotaWorkspaceProviders({ records: records(), bridge: structuredClone(store.data) }, {
      now: () => new Date(POLL_TIME),
      configured: () => true,
      pollGmail: async () => gmailResult([], { nextCursor: "gh1:h:100" }),
      pollCalendar: async () => calendarResult([], { nextSyncToken: "sync-100" }),
      applyMutations: realApply(store, calls),
    });

    expect(store.data?.providers.google_places).toMatchObject({
      health: "degraded",
      detail: "The latest on-demand Google Places lookup was unavailable.",
      consecutive_failures: 2,
    });
    expect(store.data?.providers.yelp).toMatchObject({
      health: "unknown",
      detail: "Yelp is configured, not yet checked.",
    });
    const providerBatch = calls.find((batch) => batch.some((mutation) => mutation.type === "update_provider"));
    const touchedPlaces = providerBatch?.some((mutation) => (
      mutation.type === "update_provider" && mutation.provider_state.provider === "google_places"
    ));
    expect(touchedPlaces).toBe(false);
  });
});

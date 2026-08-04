import {
  isDakotaGmailCursor,
  pollDakotaGmail,
  type DakotaGmailPollInput,
  type DakotaGmailPollResult,
  type DakotaGmailSignal,
} from "./gmail-poller";
import {
  pollDakotaGoogleCalendar,
  type DakotaCalendarPollInput,
  type DakotaCalendarPollResult,
  type DakotaCalendarSignal,
} from "./calendar-poller";
import {
  DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT,
  type DakotaRevenueBridgeEnvelope,
  type DakotaRevenueBridgeServerMutation,
  type DakotaRevenueProvider,
  type DakotaRevenueProviderStateInput,
} from "./revenue-bridge-schema";
import type { DakotaRevenueBridgeMutationResult } from "./revenue-bridge-store";
import type { DakotaWorkspaceRecords } from "./workspace-contact-match";
import { createHash } from "node:crypto";

const MAX_NEW_SIGNALS_PER_PROVIDER_PER_RUN = 4;
const INITIAL_CALENDAR_LOOKBACK_DAYS = 30;
const CALENDAR_BASELINE_CURSOR_PREFIX = "dcb1:";

type WorkspaceSignal = DakotaGmailSignal | DakotaCalendarSignal;
type MatchedWorkspaceSignal = WorkspaceSignal & {
  matchState: "matched";
  candidateKey: string;
};

export interface DakotaWorkspaceReconcilerInput {
  records: DakotaWorkspaceRecords;
  bridge: DakotaRevenueBridgeEnvelope | null;
}

export interface DakotaWorkspaceReconcilerDependencies {
  applyMutations: (
    mutations: readonly DakotaRevenueBridgeServerMutation[],
  ) => Promise<DakotaRevenueBridgeMutationResult>;
  pollGmail?: (input: DakotaGmailPollInput) => Promise<DakotaGmailPollResult>;
  pollCalendar?: (input: DakotaCalendarPollInput) => Promise<DakotaCalendarPollResult>;
  configured?: (name: string) => boolean;
  now?: () => Date;
}

export interface DakotaWorkspaceReconciliationSummary {
  gmailStatus: DakotaGmailPollResult["status"];
  calendarStatus: DakotaCalendarPollResult["status"];
  persistedSignals: number;
  pendingMatchedSignals: number;
  gmailCursorAdvanced: boolean;
  calendarCursorAdvanced: boolean;
  alertsDeferred: boolean;
}

function stableId(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

function bridgeCursor(value: string | null): string | null {
  return value && value.length <= 512 && /^[A-Za-z0-9][A-Za-z0-9._:/+=-]*$/u.test(value)
    ? value
    : null;
}

function calendarBaselineCursor(updatedMin: string): string {
  return `${CALENDAR_BASELINE_CURSOR_PREFIX}${Date.parse(updatedMin)}`;
}

function calendarCursorInput(
  storedCursor: string | null,
  fallbackUpdatedMin: string,
): { syncToken: string | null; initialUpdatedMin: string; baselineCursor: string } {
  if (storedCursor?.startsWith(CALENDAR_BASELINE_CURSOR_PREFIX)) {
    const timestamp = Number(storedCursor.slice(CALENDAR_BASELINE_CURSOR_PREFIX.length));
    if (Number.isSafeInteger(timestamp) && timestamp >= 0) {
      const date = new Date(timestamp);
      if (Number.isFinite(date.getTime())) {
        const initialUpdatedMin = date.toISOString();
        return { syncToken: null, initialUpdatedMin, baselineCursor: storedCursor };
      }
    }
    return {
      syncToken: null,
      initialUpdatedMin: fallbackUpdatedMin,
      baselineCursor: calendarBaselineCursor(fallbackUpdatedMin),
    };
  }
  return {
    syncToken: storedCursor,
    initialUpdatedMin: fallbackUpdatedMin,
    baselineCursor: calendarBaselineCursor(fallbackUpdatedMin),
  };
}

function providerHealth(
  status: DakotaGmailPollResult["status"] | DakotaCalendarPollResult["status"],
): DakotaRevenueProviderStateInput["health"] {
  if (status === "connected") return "healthy";
  if (status === "unavailable") return "degraded";
  return "blocked";
}

function failureCount(
  provider: DakotaRevenueProvider,
  status: DakotaGmailPollResult["status"] | DakotaCalendarPollResult["status"],
  bridge: DakotaRevenueBridgeEnvelope | null,
): number {
  return status === "unavailable"
    ? Math.min(1_000, (bridge?.providers[provider]?.consecutive_failures ?? 0) + 1)
    : 0;
}

function providerMutation(input: DakotaRevenueProviderStateInput): DakotaRevenueBridgeServerMutation {
  return { type: "update_provider", provider_state: input };
}

function fixedProvider(
  provider: DakotaRevenueProvider,
  health: DakotaRevenueProviderStateInput["health"],
  detail: string,
  checkedAt: string,
): DakotaRevenueBridgeServerMutation {
  return providerMutation({
    provider,
    health,
    detail,
    cursor: null,
    checked_at: checkedAt,
    consecutive_failures: 0,
  });
}

function onDemandProvider(
  provider: "google_places" | "yelp",
  isConfigured: boolean,
  bridge: DakotaRevenueBridgeEnvelope | null,
  checkedAt: string,
): DakotaRevenueBridgeServerMutation | null {
  // Scheduled reconciliation has no observation to add. Preserve any actual
  // on-demand outcome instead of overwriting it from credential presence.
  if (bridge?.providers[provider]) return null;
  const label = provider === "google_places" ? "Google Places" : "Yelp";
  return fixedProvider(
    provider,
    isConfigured ? "unknown" : "blocked",
    isConfigured
      ? `${label} is configured, not yet checked.`
      : `${label} API access is not configured.`,
    checkedAt,
  );
}

function isMatchedSignal(signal: WorkspaceSignal): signal is MatchedWorkspaceSignal {
  return signal.matchState === "matched" && signal.candidateKey !== null;
}

function sameStoredEvent(
  signal: MatchedWorkspaceSignal,
  bridge: DakotaRevenueBridgeEnvelope | null,
): boolean {
  const stored = bridge?.records[signal.candidateKey]?.external_events.find(
    (event) => event.event_id === signal.event.event_id,
  );
  return Boolean(stored &&
    stored.provider === signal.event.provider &&
    stored.kind === signal.event.kind &&
    stored.summary === signal.event.summary &&
    stored.external_ref === signal.event.external_ref &&
    stored.occurred_at === signal.event.occurred_at);
}

function uniqueMatchedSignals(signals: readonly WorkspaceSignal[]): MatchedWorkspaceSignal[] {
  const unique = new Map<string, MatchedWorkspaceSignal>();
  for (const signal of signals) {
    if (!isMatchedSignal(signal)) continue;
    const key = `${signal.candidateKey}\u0000${signal.event.event_id}`;
    if (!unique.has(key)) unique.set(key, signal);
  }
  return [...unique.values()].sort((left, right) => (
    left.occurredAt.localeCompare(right.occurredAt)
  ));
}

function pendingSignals(
  signals: readonly MatchedWorkspaceSignal[],
  bridge: DakotaRevenueBridgeEnvelope | null,
): MatchedWorkspaceSignal[] {
  return signals.filter((signal) => !sameStoredEvent(signal, bridge));
}

function everySignalPersisted(
  signals: readonly MatchedWorkspaceSignal[],
  bridge: DakotaRevenueBridgeEnvelope | null,
): boolean {
  return signals.every((signal) => sameStoredEvent(signal, bridge));
}

function accepted(result: DakotaRevenueBridgeMutationResult): result is Extract<
  DakotaRevenueBridgeMutationResult,
  { outcome: "stored" | "unchanged" }
> {
  return result.outcome === "stored" || result.outcome === "unchanged";
}

function gmailDetail(
  gmail: DakotaGmailPollResult,
  pending: number,
): string {
  if (gmail.status === "not_configured") return "Gmail read access is not configured.";
  if (gmail.status === "insufficient_scope") return "Gmail OAuth is connected without a read scope.";
  if (gmail.status === "unavailable") {
    return gmail.resetRequired
      ? "Gmail History needs a safe recovery baseline."
      : "Gmail read access is temporarily unavailable; the durable cursor was retained.";
  }
  if (gmail.resetRequired || gmail.mode === "recovery") {
    return pending > 0
      ? `${pending} matched Gmail recovery signal${pending === 1 ? "" : "s"} remain to be persisted before recovery advances.`
      : gmail.hasMore
        ? "Gmail is safely draining a bounded metadata-only recovery scan."
        : "Gmail metadata recovery completed; exact contact matches still require review.";
  }
  if (gmail.mode === "baseline") return "Gmail History baseline established without importing old mail.";
  return pending > 0
    ? `${pending} matched Gmail signal${pending === 1 ? "" : "s"} remain to be persisted before the History cursor advances.`
    : `${gmail.signals.length} inbound Gmail metadata signal${gmail.signals.length === 1 ? "" : "s"} observed; exact contact matches require review.`;
}

function calendarDetail(
  calendar: DakotaCalendarPollResult,
  pending: number,
): string {
  if (calendar.resetRequired) return "Google Calendar requested a fresh incremental-sync baseline.";
  if (calendar.status === "not_configured") return "Google Calendar read access is not configured.";
  if (calendar.status === "insufficient_scope") return "Google OAuth is connected without a Calendar read scope.";
  if (calendar.status === "unavailable") {
    return "Google Calendar read access is temporarily unavailable; the durable cursor was retained.";
  }
  return pending > 0
    ? `${pending} matched Calendar signal${pending === 1 ? "" : "s"} remain to be persisted before the sync cursor advances.`
    : `${calendar.signals.length} Calendar signal${calendar.signals.length === 1 ? "" : "s"} observed; exact attendee matches require review.`;
}

function alertMutation(signal: MatchedWorkspaceSignal): DakotaRevenueBridgeServerMutation {
  return {
    type: "append_alert",
    candidate_key: signal.candidateKey,
    alert: {
      alert_id: stableId(`workspace-alert:${signal.event.event_id}`),
      provider: signal.event.provider,
      kind: "new_external_event",
      severity: "warning",
      message: signal.event.provider === "gmail"
        ? "A saved contact sent an email. Review the metadata before recording any pipeline outcome."
        : "A saved contact has a Calendar change. Review it before recording any meeting outcome.",
    },
  };
}

/**
 * Reconcile bounded provider observations. Event writes always happen before
 * cursor writes. When more than four matched signals remain for a provider,
 * the old provider cursor is intentionally retained so the next scheduled run
 * replays the same window and drains the next durable batch.
 */
export async function reconcileDakotaWorkspaceProviders(
  input: DakotaWorkspaceReconcilerInput,
  dependencies: DakotaWorkspaceReconcilerDependencies,
): Promise<DakotaWorkspaceReconciliationSummary> {
  const now = (dependencies.now ?? (() => new Date()))();
  const checkedAt = now.toISOString();
  const gmailProvider = input.bridge?.providers.gmail;
  const calendarProvider = input.bridge?.providers.google_calendar;
  const gmailCursor = bridgeCursor(gmailProvider?.cursor ?? null);
  const storedCalendarCursor = bridgeCursor(calendarProvider?.cursor ?? null);
  const fallbackUpdatedMin = new Date(
    now.getTime() - INITIAL_CALENDAR_LOOKBACK_DAYS * 24 * 60 * 60_000,
  ).toISOString();
  const calendarCursor = calendarCursorInput(storedCalendarCursor, fallbackUpdatedMin);
  const pollGmail = dependencies.pollGmail ?? pollDakotaGmail;
  const pollCalendar = dependencies.pollCalendar ?? pollDakotaGoogleCalendar;

  const [gmail, calendar] = await Promise.all([
    pollGmail({
      records: input.records,
      cursor: gmailCursor,
      recoveryAfter: gmailProvider?.cursor_updated_at ?? gmailProvider?.checked_at ?? null,
      maxResults: 10,
      maxPages: 2,
    }),
    pollCalendar({
      records: input.records,
      syncToken: calendarCursor.syncToken,
      initialUpdatedMin: calendarCursor.initialUpdatedMin,
      maxResults: 250,
      maxPages: 4,
    }),
  ]);

  const gmailMatched = uniqueMatchedSignals(gmail.signals);
  const calendarMatched = uniqueMatchedSignals(calendar.signals);
  const gmailPendingBefore = pendingSignals(gmailMatched, input.bridge);
  const calendarPendingBefore = pendingSignals(calendarMatched, input.bridge);
  const selected = [
    ...gmailPendingBefore.slice(0, MAX_NEW_SIGNALS_PER_PROVIDER_PER_RUN),
    ...calendarPendingBefore.slice(0, MAX_NEW_SIGNALS_PER_PROVIDER_PER_RUN),
  ];

  let latestBridge = input.bridge;
  if (selected.length > 0) {
    const signalResult = await dependencies.applyMutations(selected.map((signal) => ({
      type: "append_external_event" as const,
      candidate_key: signal.candidateKey,
      event: signal.event,
    })));
    if (!accepted(signalResult)) throw new Error(`signal_reconciliation_${signalResult.outcome}`);
    latestBridge = signalResult.envelope;
  }

  const gmailPending = pendingSignals(gmailMatched, latestBridge);
  const calendarPending = pendingSignals(calendarMatched, latestBridge);
  const gmailNextCursor = bridgeCursor(gmail.nextCursor);
  const calendarNextCursor = bridgeCursor(calendar.nextSyncToken);
  const gmailCanAdvance = gmail.status === "connected" &&
    gmailNextCursor !== null &&
    isDakotaGmailCursor(gmailNextCursor) &&
    everySignalPersisted(gmailMatched, latestBridge);
  const calendarCanAdvance = calendar.status === "connected" &&
    calendarNextCursor !== null &&
    everySignalPersisted(calendarMatched, latestBridge);
  const nextGmailCursor = gmailCanAdvance
    ? gmailNextCursor
    : gmailCursor;
  const nextCalendarCursor = calendarCanAdvance
    ? calendarNextCursor
    : calendar.resetRequired
      ? calendarBaselineCursor(fallbackUpdatedMin)
      : calendar.status === "connected" && calendarCursor.syncToken === null
        ? calendarCursor.baselineCursor
        : storedCalendarCursor;
  const gmailOperationallyPending = gmail.status === "connected" &&
    (gmailPending.length > 0 || gmail.hasMore || gmail.resetRequired);
  const calendarOperationallyPending = calendar.status === "connected" && calendarPending.length > 0;

  const providerMutations: DakotaRevenueBridgeServerMutation[] = [
    providerMutation({
      provider: "gmail",
      health: gmailOperationallyPending ? "degraded" : providerHealth(gmail.status),
      detail: gmailDetail(gmail, gmailPending.length),
      cursor: nextGmailCursor,
      checked_at: gmail.checkedAt,
      consecutive_failures: failureCount("gmail", gmail.status, input.bridge),
    }),
    providerMutation({
      provider: "google_calendar",
      health: calendarOperationallyPending ? "degraded" : providerHealth(calendar.status),
      detail: calendarDetail(calendar, calendarPending.length),
      cursor: nextCalendarCursor,
      checked_at: calendar.checkedAt,
      consecutive_failures: failureCount("google_calendar", calendar.status, input.bridge),
    }),
    fixedProvider("google_voice", "disabled", "Google Voice remains human-operated; Dakota never sends calls or texts.", checkedAt),
    fixedProvider("google_business_profile", "blocked", "The live Business Profile is not connected to Dakota's read-only evidence bridge.", checkedAt),
    fixedProvider("proposal", "blocked", "No proposal-generation provider is connected.", checkedAt),
    fixedProvider("e_sign", "blocked", "No electronic-signature provider is connected.", checkedAt),
    fixedProvider("invoicing", "blocked", "No invoicing provider is connected.", checkedAt),
    fixedProvider("payments", "blocked", "No cleared-payment provider is connected.", checkedAt),
    fixedProvider("crm", "disabled", "Dakota is the private system of record; no external CRM writes are enabled.", checkedAt),
    fixedProvider("netlify_forms", "healthy", "Durable inbound receipts and bounded automatic retries are enabled.", checkedAt),
    fixedProvider("dakota_engine", "healthy", "Revenue Bridge reconciliation is running on schedule.", checkedAt),
    fixedProvider("manual_research", "healthy", "Human research and disposition controls are available.", checkedAt),
  ];
  const configured = dependencies.configured ?? (() => false);
  const places = onDemandProvider(
    "google_places", configured("GOOGLE_PLACES_API_KEY"), input.bridge, checkedAt,
  );
  const yelp = onDemandProvider("yelp", configured("YELP_API_KEY"), input.bridge, checkedAt);
  if (places) providerMutations.push(places);
  if (yelp) providerMutations.push(yelp);

  const providerResult = await dependencies.applyMutations(providerMutations);
  if (!accepted(providerResult)) throw new Error(`provider_reconciliation_${providerResult.outcome}`);
  latestBridge = providerResult.envelope;

  // Alerts are secondary navigation aids. Events are already durable and
  // cursors are safe, so alert capacity or contention must not replay or lose
  // provider history.
  let alertsDeferred = false;
  const alertMutations = selected
    .filter((signal) => {
      const record = latestBridge?.records[signal.candidateKey];
      const alertId = stableId(`workspace-alert:${signal.event.event_id}`);
      return Boolean(record) &&
        !record?.alerts.some((alert) => alert.alert_id === alertId) &&
        (record?.alerts.length ?? DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT) < DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT;
    })
    .map(alertMutation);
  if (alertMutations.length > 0) {
    const alertResult = await dependencies.applyMutations(alertMutations);
    alertsDeferred = !accepted(alertResult);
  }

  return {
    gmailStatus: gmail.status,
    calendarStatus: calendar.status,
    persistedSignals: selected.length,
    pendingMatchedSignals: gmailPending.length + calendarPending.length,
    gmailCursorAdvanced: nextGmailCursor !== gmailCursor,
    calendarCursorAdvanced: nextCalendarCursor !== storedCalendarCursor,
    alertsDeferred,
  };
}

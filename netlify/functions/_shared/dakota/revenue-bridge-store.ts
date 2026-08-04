import type { Store } from "@netlify/blobs";

import {
  createDakotaRevenueBridgeEnvelope,
  createEmptyDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT,
  DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT,
  DAKOTA_REVENUE_BRIDGE_EXTERNAL_EVENT_LIMIT,
  DAKOTA_REVENUE_BRIDGE_KEY,
  DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT,
  DAKOTA_REVENUE_BRIDGE_SCHEMA,
  DAKOTA_REVENUE_BRIDGE_SERVER_BATCH_LIMIT,
  DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES,
  DAKOTA_REVENUE_BRIDGE_STORE,
  encodedRevenueBridgeSize,
  type DakotaArchiveInput,
  type DakotaExternalEventInput,
  type DakotaPrivateOfferSelection,
  type DakotaRevenueAlert,
  type DakotaRevenueAlertInput,
  type DakotaRevenueBridgeEnvelope,
  type DakotaRevenueBridgeOperatorMutation,
  type DakotaRevenueBridgePutPayload,
  type DakotaRevenueBridgeRecord,
  type DakotaRevenueBridgeServerMutation,
  type DakotaRevenueEvidence,
  type DakotaRevenueEvidenceSuggestionInput,
  type DakotaRevenueProvider,
  type DakotaRevenueProviderState,
  type DakotaRevenueProviderStateInput,
  type DakotaWebsiteAuditIntelligence,
  type DakotaWebsiteAuditReconciliationPatch,
  validateDakotaRevenueBridgeEnvelope,
  validateDakotaRevenueBridgePutPayload,
  validateDakotaRevenueBridgeServerMutation,
} from "./revenue-bridge-schema.ts";

export { DAKOTA_REVENUE_BRIDGE_KEY, DAKOTA_REVENUE_BRIDGE_STORE };

export type DakotaRevenueBridgeStore = Pick<Store, "getWithMetadata" | "setJSON">;

export interface DakotaRevenueBridgeStoreDependencies {
  getStore: () => DakotaRevenueBridgeStore;
  now?: () => Date;
  maximumAttempts?: number;
}

export interface LoadedDakotaRevenueBridgeState {
  envelope: DakotaRevenueBridgeEnvelope | null;
  etag: string | null;
}

export type DakotaRevenueBridgeMutationResult =
  | { outcome: "stored"; envelope: DakotaRevenueBridgeEnvelope; updated_at: string }
  | { outcome: "unchanged"; envelope: DakotaRevenueBridgeEnvelope; updated_at: string }
  | { outcome: "version_conflict" | "conflict" | "capacity" | "not_found" | "invalid_transition"; error: string };

export class InvalidDakotaRevenueBridgeStateError extends Error {}

const DEFAULT_MAXIMUM_ATTEMPTS = 5;
const MAXIMUM_ALLOWED_ATTEMPTS = 10;

function emptyRecords(): Record<string, DakotaRevenueBridgeRecord> {
  return Object.create(null) as Record<string, DakotaRevenueBridgeRecord>;
}

function emptyProviders(): Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>> {
  return Object.create(null) as Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>>;
}

function monotonicTimestamp(now: Date, previous: string | null, minimum: string | null = null): string {
  const nowTime = now.getTime();
  if (!Number.isFinite(nowTime)) throw new TypeError("Revenue Bridge now() returned an invalid date.");
  const previousTime = previous === null ? Number.NEGATIVE_INFINITY : Date.parse(previous);
  const minimumTime = minimum === null ? Number.NEGATIVE_INFINITY : Date.parse(minimum);
  return new Date(Math.max(nowTime, previousTime + 1, minimumTime)).toISOString();
}

function latestServerMutationFactTimestamp(
  mutations: readonly DakotaRevenueBridgeServerMutation[],
): string | null {
  const timestamps: string[] = [];
  for (const mutation of mutations) {
    switch (mutation.type) {
      case "append_evidence":
        timestamps.push(mutation.evidence.observed_at);
        break;
      case "append_external_event":
        timestamps.push(mutation.event.occurred_at);
        break;
      case "reconcile_website_audit":
        if (mutation.patch.patch_type === "requested") timestamps.push(mutation.patch.requested_at);
        else if (mutation.patch.patch_type === "generated") timestamps.push(mutation.patch.generated_at);
        else if (mutation.patch.patch_type === "failed") timestamps.push(mutation.patch.failed_at);
        else if (mutation.patch.patch_type === "delivery") timestamps.push(mutation.patch.updated_at);
        else timestamps.push(mutation.patch.observed_at);
        break;
      case "update_provider":
        timestamps.push(mutation.provider_state.checked_at);
        break;
      case "append_alert":
      case "archive_candidate":
      case "restore_candidate":
        break;
    }
  }
  return timestamps.length === 0
    ? null
    : timestamps.reduce((latest, candidate) => (
        Date.parse(candidate) > Date.parse(latest) ? candidate : latest
      ));
}

function maximumAttempts(dependencies: DakotaRevenueBridgeStoreDependencies): number {
  const value = dependencies.maximumAttempts ?? DEFAULT_MAXIMUM_ATTEMPTS;
  if (!Number.isInteger(value) || value < 1 || value > MAXIMUM_ALLOWED_ATTEMPTS) {
    throw new TypeError("Revenue Bridge maximumAttempts must be an integer from 1 through 10.");
  }
  return value;
}

function recordsFrom(envelope: DakotaRevenueBridgeEnvelope | null): Record<string, DakotaRevenueBridgeRecord> {
  return envelope ? { ...envelope.records } : emptyRecords();
}

function providersFrom(
  envelope: DakotaRevenueBridgeEnvelope | null,
): Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>> {
  return envelope ? { ...envelope.providers } : emptyProviders();
}

function createRecordIfNeeded(
  records: Record<string, DakotaRevenueBridgeRecord>,
  candidateKey: string,
  updatedAt: string,
): { record: DakotaRevenueBridgeRecord | null; created: boolean } {
  const existing = records[candidateKey];
  if (existing) return { record: existing, created: false };
  if (Object.keys(records).length >= DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT) {
    return { record: null, created: false };
  }
  return { record: createEmptyDakotaRevenueBridgeRecord(updatedAt), created: true };
}

function sameEvidenceInput(
  stored: DakotaRevenueEvidence,
  input: DakotaRevenueEvidenceSuggestionInput,
): boolean {
  return stored.provider === input.provider
    && stored.kind === input.kind
    && stored.summary === input.summary
    && stored.public_url === input.public_url
    && stored.external_ref === input.external_ref
    && stored.observed_at === input.observed_at;
}

function sameExternalEventInput(
  stored: DakotaRevenueBridgeRecord["external_events"][number],
  input: DakotaExternalEventInput,
): boolean {
  return stored.provider === input.provider
    && stored.kind === input.kind
    && stored.summary === input.summary
    && stored.external_ref === input.external_ref
    && stored.occurred_at === input.occurred_at;
}

function sameAlertInput(stored: DakotaRevenueAlert, input: DakotaRevenueAlertInput): boolean {
  return stored.provider === input.provider
    && stored.kind === input.kind
    && stored.severity === input.severity
    && stored.message === input.message;
}

function sameValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function latestTimestamp(left: string | null, right: string): string {
  return left === null || Date.parse(right) > Date.parse(left) ? right : left;
}

function earliestTimestamp(left: string | null, right: string): string {
  return left === null || Date.parse(right) < Date.parse(left) ? right : left;
}

function emptyWebsiteAudit(
  patch: DakotaWebsiteAuditReconciliationPatch,
  reconciledAt: string,
): DakotaWebsiteAuditIntelligence {
  return {
    report_id: patch.report_id,
    domain: patch.domain,
    report_url: null,
    status: "unknown",
    status_updated_at: reconciledAt,
    requested_at: null,
    generated_at: null,
    failed_at: null,
    failure_reason: "",
    measurement_state: "unavailable",
    scores: { performance: null, seo: null, accessibility: null, best_practices: null },
    overall_score: null,
    grade: null,
    summary: "",
    findings: [],
    email_delivery: {
      status: "unknown",
      sent_at: null,
      failed_at: null,
      failure_reason: "",
      updated_at: null,
    },
    engagement: {
      first_view_at: null,
      last_view_at: null,
      total_views: 0,
      max_scroll_depth: 0,
      max_time_on_page_seconds: 0,
      updated_at: null,
    },
    reconciled_at: reconciledAt,
  };
}

function deriveWebsiteAuditStatus(
  audit: DakotaWebsiteAuditIntelligence,
): Pick<DakotaWebsiteAuditIntelligence, "status" | "status_updated_at"> {
  const candidates: Array<{
    status: DakotaWebsiteAuditIntelligence["status"];
    timestamp: string;
    priority: number;
  }> = [];
  if (audit.requested_at) candidates.push({ status: "requested", timestamp: audit.requested_at, priority: 0 });
  if (audit.generated_at) candidates.push({ status: "generated", timestamp: audit.generated_at, priority: 1 });
  if (audit.failed_at) candidates.push({ status: "failed", timestamp: audit.failed_at, priority: 2 });
  candidates.sort((left, right) => {
    const byTime = Date.parse(right.timestamp) - Date.parse(left.timestamp);
    return byTime === 0 ? right.priority - left.priority : byTime;
  });
  const current = candidates[0];
  if (!current) return { status: audit.status, status_updated_at: audit.status_updated_at };
  return { status: current.status, status_updated_at: current.timestamp };
}

function reconcileWebsiteAudit(
  previous: DakotaWebsiteAuditIntelligence | null,
  patch: DakotaWebsiteAuditReconciliationPatch,
  reconciledAt: string,
): { intelligence?: DakotaWebsiteAuditIntelligence; unchanged?: boolean; rejection?: ApplyServerMutationResult["rejection"] } {
  if (previous && (previous.report_id !== patch.report_id || previous.domain !== patch.domain)) {
    return { rejection: { outcome: "invalid_transition", error: "Website Audit patches cannot change report identity." } };
  }
  const base = previous ?? emptyWebsiteAudit(patch, reconciledAt);
  let next: DakotaWebsiteAuditIntelligence = { ...base };

  switch (patch.patch_type) {
    case "requested":
      next.requested_at = latestTimestamp(base.requested_at, patch.requested_at);
      break;
    case "generated": {
      const comparison = base.generated_at === null
        ? 1
        : Date.parse(patch.generated_at) - Date.parse(base.generated_at);
      const generatedFacts = {
        report_url: patch.report_url,
        measurement_state: patch.measurement_state,
        scores: patch.scores,
        overall_score: patch.overall_score,
        grade: patch.grade,
        summary: patch.summary,
        findings: patch.findings,
      };
      if (comparison === 0) {
        const storedFacts = {
          report_url: base.report_url,
          measurement_state: base.measurement_state,
          scores: base.scores,
          overall_score: base.overall_score,
          grade: base.grade,
          summary: base.summary,
          findings: base.findings,
        };
        if (!sameValue(storedFacts, generatedFacts)) {
          return { rejection: { outcome: "invalid_transition", error: "A Website Audit generated_at timestamp cannot identify conflicting intelligence." } };
        }
      } else if (comparison > 0) {
        next = { ...next, generated_at: patch.generated_at, ...generatedFacts };
      }
      break;
    }
    case "failed": {
      const comparison = base.failed_at === null
        ? 1
        : Date.parse(patch.failed_at) - Date.parse(base.failed_at);
      if (comparison === 0 && base.failure_reason !== patch.failure_reason) {
        return { rejection: { outcome: "invalid_transition", error: "A Website Audit failed_at timestamp cannot identify conflicting failure facts." } };
      }
      if (comparison > 0) {
        next.failed_at = patch.failed_at;
        next.failure_reason = patch.failure_reason;
      }
      break;
    }
    case "delivery": {
      const comparison = base.email_delivery.updated_at === null
        ? 1
        : Date.parse(patch.updated_at) - Date.parse(base.email_delivery.updated_at);
      const delivery = {
        status: patch.status,
        sent_at: patch.sent_at,
        failed_at: patch.failed_at,
        failure_reason: patch.failure_reason,
        updated_at: patch.updated_at,
      };
      if (comparison === 0 && !sameValue(base.email_delivery, delivery)) {
        return { rejection: { outcome: "invalid_transition", error: "A Website Audit delivery updated_at timestamp cannot identify conflicting state." } };
      }
      if (comparison > 0) next.email_delivery = delivery;
      break;
    }
    case "engagement":
      next.engagement = {
        first_view_at: earliestTimestamp(base.engagement.first_view_at, patch.first_view_at),
        last_view_at: latestTimestamp(base.engagement.last_view_at, patch.last_view_at),
        total_views: Math.max(base.engagement.total_views, patch.total_views),
        max_scroll_depth: Math.max(base.engagement.max_scroll_depth, patch.max_scroll_depth),
        max_time_on_page_seconds: Math.max(base.engagement.max_time_on_page_seconds, patch.max_time_on_page_seconds),
        updated_at: latestTimestamp(base.engagement.updated_at, patch.observed_at),
      };
      break;
  }

  next = { ...next, ...deriveWebsiteAuditStatus(next) };
  const { reconciled_at: _baseReconciledAt, ...baseFacts } = base;
  const { reconciled_at: _nextReconciledAt, ...nextFacts } = next;
  if (previous && sameValue(baseFacts, nextFacts)) return { unchanged: true };
  return { intelligence: { ...next, reconciled_at: reconciledAt } };
}

function serverMutationCandidateKey(mutation: DakotaRevenueBridgeServerMutation): string | null {
  return mutation.type === "update_provider" ? null : mutation.candidate_key;
}

interface ApplyServerMutationResult {
  changed: boolean;
  rejection?: Exclude<DakotaRevenueBridgeMutationResult, { outcome: "stored" | "unchanged" }>;
}

function applyServerMutation(
  records: Record<string, DakotaRevenueBridgeRecord>,
  providers: Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>>,
  mutation: DakotaRevenueBridgeServerMutation,
  updatedAt: string,
): ApplyServerMutationResult {
  if (mutation.type === "update_provider") {
    const input = mutation.provider_state;
    const existing = providers[input.provider];
    if (existing) {
      const comparison = Date.parse(input.checked_at) - Date.parse(existing.checked_at);
      if (comparison < 0) {
        return { changed: false, rejection: { outcome: "invalid_transition", error: "Provider updates cannot move backward in time." } };
      }
      const sameInput = existing.health === input.health
        && existing.detail === input.detail
        && existing.cursor === input.cursor
        && existing.checked_at === input.checked_at
        && existing.consecutive_failures === input.consecutive_failures;
      if (comparison === 0) {
        return sameInput
          ? { changed: false }
          : { changed: false, rejection: { outcome: "invalid_transition", error: "A provider check timestamp cannot identify conflicting state." } };
      }
    }
    const cursorChanged = existing?.cursor !== input.cursor;
    providers[input.provider] = {
      health: input.health,
      detail: input.detail,
      cursor: input.cursor,
      checked_at: input.checked_at,
      cursor_updated_at: input.cursor === null
        ? null
        : cursorChanged
          ? updatedAt
          : existing?.cursor_updated_at ?? updatedAt,
      consecutive_failures: input.consecutive_failures,
      updated_at: updatedAt,
    };
    return { changed: true };
  }

  const candidateKey = mutation.candidate_key;
  if (mutation.type === "restore_candidate") {
    const existing = records[candidateKey];
    if (!existing) {
      return { changed: false, rejection: { outcome: "not_found", error: "Revenue Bridge record was not found." } };
    }
    if (existing.archive === null) return { changed: false };
    records[candidateKey] = { ...existing, archive: null, updated_at: updatedAt };
    return { changed: true };
  }
  const candidate = createRecordIfNeeded(records, candidateKey, updatedAt);
  if (!candidate.record) {
    return { changed: false, rejection: { outcome: "capacity", error: "Revenue Bridge record capacity has been reached." } };
  }
  const existing = candidate.record;
  if (existing.archive && mutation.type !== "archive_candidate") {
    return { changed: false, rejection: { outcome: "invalid_transition", error: "Archived Revenue Bridge records are immutable." } };
  }

  switch (mutation.type) {
    case "append_evidence": {
      const duplicate = existing.evidence.find((item) => item.evidence_id === mutation.evidence.evidence_id);
      if (duplicate) {
        return sameEvidenceInput(duplicate, mutation.evidence)
          ? { changed: false }
          : { changed: false, rejection: { outcome: "invalid_transition", error: "Evidence IDs cannot be reused for different evidence." } };
      }
      if (existing.evidence.length >= DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT) {
        return { changed: false, rejection: { outcome: "capacity", error: "Revenue evidence capacity has been reached." } };
      }
      const evidence: DakotaRevenueEvidence = {
        ...mutation.evidence,
        received_at: updatedAt,
        review_state: "suggested",
        reviewed_at: null,
        review_reason: "",
      };
      records[candidateKey] = { ...existing, evidence: [...existing.evidence, evidence], updated_at: updatedAt };
      return { changed: true };
    }
    case "append_external_event": {
      const duplicate = existing.external_events.find((item) => item.event_id === mutation.event.event_id);
      if (duplicate) {
        return sameExternalEventInput(duplicate, mutation.event)
          ? { changed: false }
          : { changed: false, rejection: { outcome: "invalid_transition", error: "External event IDs cannot be reused for different events." } };
      }
      if (existing.external_events.length >= DAKOTA_REVENUE_BRIDGE_EXTERNAL_EVENT_LIMIT) {
        return { changed: false, rejection: { outcome: "capacity", error: "External-event capacity has been reached." } };
      }
      records[candidateKey] = {
        ...existing,
        external_events: [...existing.external_events, {
          ...mutation.event,
          received_at: updatedAt,
          review_state: "needs_review",
          reviewed_at: null,
          review_reason: "",
        }],
        updated_at: updatedAt,
      };
      return { changed: true };
    }
    case "reconcile_website_audit": {
      const reconciliation = reconcileWebsiteAudit(existing.website_audit, mutation.patch, updatedAt);
      if (reconciliation.rejection) return { changed: false, rejection: reconciliation.rejection };
      if (reconciliation.unchanged) return { changed: false };
      if (!reconciliation.intelligence) {
        return { changed: false, rejection: { outcome: "invalid_transition", error: "Website Audit reconciliation produced no intelligence." } };
      }
      records[candidateKey] = {
        ...existing,
        website_audit: reconciliation.intelligence,
        updated_at: updatedAt,
      };
      return { changed: true };
    }
    case "append_alert": {
      const duplicate = existing.alerts.find((item) => item.alert_id === mutation.alert.alert_id);
      if (duplicate) {
        return sameAlertInput(duplicate, mutation.alert)
          ? { changed: false }
          : { changed: false, rejection: { outcome: "invalid_transition", error: "Alert IDs cannot be reused for different alerts." } };
      }
      if (existing.alerts.length >= DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT) {
        return { changed: false, rejection: { outcome: "capacity", error: "Revenue alert capacity has been reached." } };
      }
      records[candidateKey] = {
        ...existing,
        alerts: [...existing.alerts, {
          ...mutation.alert,
          created_at: updatedAt,
          status: "open",
          acknowledged_at: null,
          resolved_at: null,
          resolution_note: "",
        }],
        updated_at: updatedAt,
      };
      return { changed: true };
    }
    case "archive_candidate": {
      if (existing.archive) {
        const sameArchive = existing.archive.reason === mutation.archive.reason
          && existing.archive.retention_until === mutation.archive.retention_until
          && existing.archive.source === mutation.archive.source;
        return sameArchive
          ? { changed: false }
          : { changed: false, rejection: { outcome: "invalid_transition", error: "Archive metadata is immutable once recorded." } };
      }
      if (mutation.archive.retention_until !== null && Date.parse(mutation.archive.retention_until) < Date.parse(updatedAt)) {
        return { changed: false, rejection: { outcome: "invalid_transition", error: "Archive retention cannot end before archival." } };
      }
      records[candidateKey] = {
        ...existing,
        archive: { ...mutation.archive, archived_at: updatedAt },
        updated_at: updatedAt,
      };
      return { changed: true };
    }
  }
}

function candidateVersionMatches(
  record: DakotaRevenueBridgeRecord | undefined,
  expectedUpdatedAt: string | null,
): boolean {
  return record ? record.updated_at === expectedUpdatedAt : expectedUpdatedAt === null;
}

function applyOperatorMutation(
  record: DakotaRevenueBridgeRecord,
  mutation: DakotaRevenueBridgeOperatorMutation,
  updatedAt: string,
): { record?: DakotaRevenueBridgeRecord; unchanged?: boolean; rejection?: DakotaRevenueBridgeMutationResult } {
  if (record.archive) {
    return { rejection: { outcome: "invalid_transition", error: "Archived Revenue Bridge records are immutable." } };
  }
  switch (mutation.type) {
    case "review_research": {
      const unchanged = record.research_review.disposition === mutation.disposition
        && record.research_review.reason === mutation.reason;
      return unchanged ? { unchanged: true } : {
        record: {
          ...record,
          research_review: { disposition: mutation.disposition, reason: mutation.reason, reviewed_at: updatedAt },
          updated_at: updatedAt,
        },
      };
    }
    case "review_evidence": {
      const index = record.evidence.findIndex((item) => item.evidence_id === mutation.evidence_id);
      if (index < 0) return { rejection: { outcome: "not_found", error: "Revenue evidence was not found." } };
      const current = record.evidence[index];
      if (current.review_state !== "suggested") {
        const unchanged = current.review_state === mutation.decision && current.review_reason === mutation.reason;
        return unchanged
          ? { unchanged: true }
          : { rejection: { outcome: "invalid_transition", error: "Evidence review decisions are final." } };
      }
      const evidence = [...record.evidence];
      evidence[index] = { ...current, review_state: mutation.decision, reviewed_at: updatedAt, review_reason: mutation.reason };
      return { record: { ...record, evidence, updated_at: updatedAt } };
    }
    case "review_external_event": {
      const index = record.external_events.findIndex((item) => item.event_id === mutation.event_id);
      if (index < 0) return { rejection: { outcome: "not_found", error: "External event was not found." } };
      const current = record.external_events[index];
      if (current.review_state !== "needs_review") {
        const unchanged = current.review_state === mutation.decision && current.review_reason === mutation.reason;
        return unchanged
          ? { unchanged: true }
          : { rejection: { outcome: "invalid_transition", error: "External event review decisions are final." } };
      }
      const externalEvents = [...record.external_events];
      externalEvents[index] = { ...current, review_state: mutation.decision, reviewed_at: updatedAt, review_reason: mutation.reason };
      return { record: { ...record, external_events: externalEvents, updated_at: updatedAt } };
    }
    case "select_offer": {
      const selectedOffer: DakotaPrivateOfferSelection = {
        offer_code: mutation.offer_code,
        price_band: mutation.price_band,
        rationale: mutation.rationale,
        selected_at: updatedAt,
      };
      const unchanged = record.selected_offer?.offer_code === selectedOffer.offer_code
        && record.selected_offer.price_band === selectedOffer.price_band
        && record.selected_offer.rationale === selectedOffer.rationale;
      return unchanged ? { unchanged: true } : { record: { ...record, selected_offer: selectedOffer, updated_at: updatedAt } };
    }
    case "acknowledge_alert": {
      const index = record.alerts.findIndex((item) => item.alert_id === mutation.alert_id);
      if (index < 0) return { rejection: { outcome: "not_found", error: "Revenue alert was not found." } };
      const current = record.alerts[index];
      if (current.status === "resolved") return { rejection: { outcome: "invalid_transition", error: "Resolved alerts cannot be acknowledged again." } };
      if (current.status === "acknowledged") {
        return current.resolution_note === mutation.note
          ? { unchanged: true }
          : { rejection: { outcome: "invalid_transition", error: "Alert acknowledgements are immutable." } };
      }
      const alerts = [...record.alerts];
      alerts[index] = { ...current, status: "acknowledged", acknowledged_at: updatedAt, resolution_note: mutation.note };
      return { record: { ...record, alerts, updated_at: updatedAt } };
    }
    case "resolve_alert": {
      const index = record.alerts.findIndex((item) => item.alert_id === mutation.alert_id);
      if (index < 0) return { rejection: { outcome: "not_found", error: "Revenue alert was not found." } };
      const current = record.alerts[index];
      if (current.status === "resolved") {
        return current.resolution_note === mutation.note
          ? { unchanged: true }
          : { rejection: { outcome: "invalid_transition", error: "Alert resolutions are immutable." } };
      }
      const alerts = [...record.alerts];
      alerts[index] = { ...current, status: "resolved", resolved_at: updatedAt, resolution_note: mutation.note };
      return { record: { ...record, alerts, updated_at: updatedAt } };
    }
  }
}

function metadata(envelope: DakotaRevenueBridgeEnvelope): Record<string, string | number> {
  return {
    schemaVersion: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    recordCount: Object.keys(envelope.records).length,
    providerCount: Object.keys(envelope.providers).length,
    updatedAt: envelope.updated_at,
  };
}

async function writeEnvelope(
  store: DakotaRevenueBridgeStore,
  current: LoadedDakotaRevenueBridgeState,
  envelope: DakotaRevenueBridgeEnvelope,
): Promise<boolean> {
  const result = await store.setJSON(
    DAKOTA_REVENUE_BRIDGE_KEY,
    envelope,
    current.etag
      ? { metadata: metadata(envelope), onlyIfMatch: current.etag }
      : { metadata: metadata(envelope), onlyIfNew: true },
  );
  return result.modified;
}

export async function loadDakotaRevenueBridgeState(
  store: DakotaRevenueBridgeStore,
): Promise<LoadedDakotaRevenueBridgeState> {
  const result = await store.getWithMetadata(DAKOTA_REVENUE_BRIDGE_KEY, { type: "json" });
  if (!result) return { envelope: null, etag: null };
  if (!result.etag) throw new InvalidDakotaRevenueBridgeStateError("Stored Revenue Bridge state has no ETag.");
  const validation = validateDakotaRevenueBridgeEnvelope(result.data);
  if (!validation.valid) throw new InvalidDakotaRevenueBridgeStateError(validation.error);
  return { envelope: validation.value, etag: result.etag };
}

export async function applyDakotaRevenueBridgeServerMutations(
  mutations: readonly DakotaRevenueBridgeServerMutation[],
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  if (mutations.length === 0 || mutations.length > DAKOTA_REVENUE_BRIDGE_SERVER_BATCH_LIMIT) {
    throw new TypeError("Revenue Bridge server mutation batches require 1 through 16 mutations.");
  }
  const safeMutations = mutations.map((mutation) => {
    const validation = validateDakotaRevenueBridgeServerMutation(mutation);
    if (!validation.valid) throw new TypeError(validation.error);
    return validation.value;
  });
  const store = dependencies.getStore();
  const attempts = maximumAttempts(dependencies);
  const latestFactTimestamp = latestServerMutationFactTimestamp(safeMutations);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const current = await loadDakotaRevenueBridgeState(store);
    const updatedAt = monotonicTimestamp(
      (dependencies.now ?? (() => new Date()))(),
      current.envelope?.updated_at ?? null,
      latestFactTimestamp,
    );
    const records = recordsFrom(current.envelope);
    const providers = providersFrom(current.envelope);
    let changed = false;
    for (const mutation of safeMutations) {
      const result = applyServerMutation(records, providers, mutation, updatedAt);
      if (result.rejection) return result.rejection;
      changed = changed || result.changed;
    }
    if (!changed) {
      if (!current.envelope) throw new InvalidDakotaRevenueBridgeStateError("An unchanged mutation cannot target empty state.");
      return { outcome: "unchanged", envelope: current.envelope, updated_at: current.envelope.updated_at };
    }
    const envelope = createDakotaRevenueBridgeEnvelope(records, providers, updatedAt);
    if (encodedRevenueBridgeSize(envelope) > DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES) {
      return { outcome: "capacity", error: "Revenue Bridge storage capacity has been reached." };
    }
    if (await writeEnvelope(store, current, envelope)) {
      return { outcome: "stored", envelope, updated_at: updatedAt };
    }
  }
  return { outcome: "conflict", error: "Revenue Bridge changed during the server mutation." };
}

export async function applyDakotaRevenueBridgeOperatorMutation(
  payload: DakotaRevenueBridgePutPayload,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  const validation = validateDakotaRevenueBridgePutPayload(payload);
  if (!validation.valid) throw new TypeError(validation.error);
  const safePayload = validation.value;
  const store = dependencies.getStore();
  const attempts = maximumAttempts(dependencies);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const current = await loadDakotaRevenueBridgeState(store);
    const existing = current.envelope?.records[safePayload.candidate_key];
    if (!candidateVersionMatches(existing, safePayload.expected_updated_at)) {
      return { outcome: "version_conflict", error: "This Revenue Bridge record changed. Refresh Dakota and try again." };
    }
    const updatedAt = monotonicTimestamp((dependencies.now ?? (() => new Date()))(), current.envelope?.updated_at ?? null);
    const records = recordsFrom(current.envelope);
    const providers = providersFrom(current.envelope);
    if (!existing && Object.keys(records).length >= DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT) {
      return { outcome: "capacity", error: "Revenue Bridge record capacity has been reached." };
    }
    const record = existing ?? createEmptyDakotaRevenueBridgeRecord(updatedAt);
    const result = applyOperatorMutation(record, safePayload.mutation, updatedAt);
    if (result.rejection) return result.rejection;
    if (result.unchanged) {
      if (!current.envelope) throw new InvalidDakotaRevenueBridgeStateError("An unchanged operator mutation cannot target empty state.");
      return { outcome: "unchanged", envelope: current.envelope, updated_at: current.envelope.updated_at };
    }
    if (!result.record) throw new InvalidDakotaRevenueBridgeStateError("Operator mutation produced no record.");
    records[safePayload.candidate_key] = result.record;
    const envelope = createDakotaRevenueBridgeEnvelope(records, providers, updatedAt);
    if (encodedRevenueBridgeSize(envelope) > DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES) {
      return { outcome: "capacity", error: "Revenue Bridge storage capacity has been reached." };
    }
    if (await writeEnvelope(store, current, envelope)) {
      return { outcome: "stored", envelope, updated_at: updatedAt };
    }
  }
  return { outcome: "conflict", error: "Revenue Bridge changed during this save. Refresh and try again." };
}

export function appendDakotaRevenueEvidence(
  candidateKey: string,
  evidence: DakotaRevenueEvidenceSuggestionInput,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "append_evidence", candidate_key: candidateKey, evidence }],
    dependencies,
  );
}

export function appendDakotaExternalNeedsReviewEvent(
  candidateKey: string,
  event: DakotaExternalEventInput,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "append_external_event", candidate_key: candidateKey, event }],
    dependencies,
  );
}

export function reconcileDakotaWebsiteAuditIntelligence(
  candidateKey: string,
  patch: DakotaWebsiteAuditReconciliationPatch,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "reconcile_website_audit", candidate_key: candidateKey, patch }],
    dependencies,
  );
}

export function appendDakotaRevenueAlert(
  candidateKey: string,
  alert: DakotaRevenueAlertInput,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "append_alert", candidate_key: candidateKey, alert }],
    dependencies,
  );
}

export function updateDakotaRevenueProviderState(
  providerState: DakotaRevenueProviderStateInput,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "update_provider", provider_state: providerState }],
    dependencies,
  );
}

export function archiveDakotaRevenueBridgeCandidate(
  candidateKey: string,
  archive: DakotaArchiveInput,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "archive_candidate", candidate_key: candidateKey, archive }],
    dependencies,
  );
}

export function restoreDakotaRevenueBridgeCandidate(
  candidateKey: string,
  dependencies: DakotaRevenueBridgeStoreDependencies,
): Promise<DakotaRevenueBridgeMutationResult> {
  return applyDakotaRevenueBridgeServerMutations(
    [{ type: "restore_candidate", candidate_key: candidateKey }],
    dependencies,
  );
}

export function revenueBridgeMutationCandidateKeys(
  mutations: readonly DakotaRevenueBridgeServerMutation[],
): string[] {
  return [...new Set(mutations.map(serverMutationCandidateKey).filter((value): value is string => value !== null))];
}

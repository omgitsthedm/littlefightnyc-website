import { isDakotaCandidateKey } from "./operator-state-schema.ts";

export const DAKOTA_REVENUE_BRIDGE_SCHEMA = "dakota.revenue-bridge.v1" as const;
export const DAKOTA_REVENUE_BRIDGE_STORE = "dakota-revenue-bridge" as const;
export const DAKOTA_REVENUE_BRIDGE_KEY = "state/v1" as const;

export const DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT = 500;
export const DAKOTA_REVENUE_BRIDGE_PROVIDER_LIMIT = 16;
export const DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT = 64;
export const DAKOTA_REVENUE_BRIDGE_EXTERNAL_EVENT_LIMIT = 64;
export const DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT = 32;
export const DAKOTA_REVENUE_BRIDGE_FINDING_LIMIT = 16;
export const DAKOTA_REVENUE_BRIDGE_SERVER_BATCH_LIMIT = 16;
export const DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES = 32 * 1024;
export const DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES = 2 * 1024 * 1024;

export const DAKOTA_RESEARCH_DISPOSITIONS = [
  "unreviewed",
  "pursue",
  "hold",
  "needs_evidence",
  "blocked",
  "duplicate",
  "not_fit",
  "do_not_contact",
] as const;
export type DakotaResearchDisposition = (typeof DAKOTA_RESEARCH_DISPOSITIONS)[number];

export const DAKOTA_REVENUE_PROVIDERS = [
  "dakota_engine",
  "manual_research",
  "netlify_forms",
  "website_audit",
  "gmail",
  "google_calendar",
  "google_voice",
  "google_business_profile",
  "google_places",
  "yelp",
  "proposal",
  "e_sign",
  "invoicing",
  "payments",
  "crm",
] as const;
export type DakotaRevenueProvider = (typeof DAKOTA_REVENUE_PROVIDERS)[number];

export const DAKOTA_EVIDENCE_KINDS = [
  "public_profile",
  "website_observation",
  "website_audit",
  "inbound_request",
  "message",
  "booking",
  "call",
  "proposal",
  "contract",
  "invoice",
  "payment",
  "listing",
  "provider_status",
] as const;
export type DakotaRevenueEvidenceKind = (typeof DAKOTA_EVIDENCE_KINDS)[number];

export const DAKOTA_EVIDENCE_REVIEW_STATES = ["suggested", "confirmed", "rejected"] as const;
export type DakotaEvidenceReviewState = (typeof DAKOTA_EVIDENCE_REVIEW_STATES)[number];

export const DAKOTA_EXTERNAL_EVENT_KINDS = [
  "inquiry_received",
  "audit_completed",
  "message_received",
  "booking_created",
  "booking_cancelled",
  "call_missed",
  "voicemail_received",
  "listing_changed",
  "proposal_status_changed",
  "contract_status_changed",
  "invoice_status_changed",
  "payment_status_changed",
  "provider_notice",
] as const;
export type DakotaExternalEventKind = (typeof DAKOTA_EXTERNAL_EVENT_KINDS)[number];

export const DAKOTA_EXTERNAL_EVENT_REVIEW_STATES = [
  "needs_review",
  "confirmed",
  "rejected",
] as const;
export type DakotaExternalEventReviewState = (typeof DAKOTA_EXTERNAL_EVENT_REVIEW_STATES)[number];

export const DAKOTA_AUDIT_MEASUREMENT_STATES = ["complete", "partial", "unavailable"] as const;
export type DakotaAuditMeasurementState = (typeof DAKOTA_AUDIT_MEASUREMENT_STATES)[number];

export const DAKOTA_WEBSITE_AUDIT_STATUSES = ["unknown", "requested", "generated", "failed"] as const;
export type DakotaWebsiteAuditStatus = (typeof DAKOTA_WEBSITE_AUDIT_STATUSES)[number];

export const DAKOTA_EMAIL_DELIVERY_STATUSES = [
  "unknown",
  "pending",
  "not_configured",
  "sent",
  "failed",
] as const;
export type DakotaEmailDeliveryStatus = (typeof DAKOTA_EMAIL_DELIVERY_STATUSES)[number];

export const DAKOTA_AUDIT_AREAS = [
  "performance",
  "seo",
  "accessibility",
  "best_practices",
  "conversion",
  "content",
  "operations",
] as const;
export type DakotaAuditArea = (typeof DAKOTA_AUDIT_AREAS)[number];

export const DAKOTA_AUDIT_FINDING_SEVERITIES = ["low", "medium", "high"] as const;
export type DakotaAuditFindingSeverity = (typeof DAKOTA_AUDIT_FINDING_SEVERITIES)[number];

export const DAKOTA_PRIVATE_OFFER_CODES = [
  "scoped_test_task",
  "white_label_overflow_retainer",
  "ai_friction_audit",
  "ai_workflow_build",
  "automation_maintenance",
  "new_business_launch",
  "ongoing_care",
  "custom_scoped",
] as const;
export type DakotaPrivateOfferCode = (typeof DAKOTA_PRIVATE_OFFER_CODES)[number];

export const DAKOTA_PRIVATE_PRICE_BANDS = [
  "scoped_after_review",
  "included",
  "usd_500_2000",
  "usd_1000_monthly",
  "usd_1500_10000_setup",
  "usd_3000_5000_monthly",
  "private_custom",
] as const;
export type DakotaPrivatePriceBand = (typeof DAKOTA_PRIVATE_PRICE_BANDS)[number];

export const DAKOTA_ALERT_KINDS = [
  "follow_up_due",
  "new_external_event",
  "audit_ready",
  "offer_review",
  "provider_degraded",
  "provider_blocked",
  "archive_review",
  "custom",
] as const;
export type DakotaRevenueAlertKind = (typeof DAKOTA_ALERT_KINDS)[number];

export const DAKOTA_ALERT_SEVERITIES = ["info", "warning", "critical"] as const;
export type DakotaRevenueAlertSeverity = (typeof DAKOTA_ALERT_SEVERITIES)[number];

export const DAKOTA_ALERT_STATUSES = ["open", "acknowledged", "resolved"] as const;
export type DakotaRevenueAlertStatus = (typeof DAKOTA_ALERT_STATUSES)[number];

export const DAKOTA_PROVIDER_HEALTH_STATES = [
  "unknown",
  "healthy",
  "degraded",
  "blocked",
  "disabled",
] as const;
export type DakotaProviderHealthState = (typeof DAKOTA_PROVIDER_HEALTH_STATES)[number];

export const DAKOTA_ARCHIVE_SOURCES = ["operator", "retention", "connector"] as const;
export type DakotaArchiveSource = (typeof DAKOTA_ARCHIVE_SOURCES)[number];

export interface DakotaResearchReview {
  disposition: DakotaResearchDisposition;
  reason: string;
  reviewed_at: string | null;
}

export interface DakotaRevenueEvidence {
  evidence_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaRevenueEvidenceKind;
  summary: string;
  public_url: string | null;
  external_ref: string | null;
  observed_at: string;
  received_at: string;
  review_state: DakotaEvidenceReviewState;
  reviewed_at: string | null;
  review_reason: string;
}

export interface DakotaExternalNeedsReviewEvent {
  event_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaExternalEventKind;
  summary: string;
  external_ref: string;
  occurred_at: string;
  received_at: string;
  review_state: DakotaExternalEventReviewState;
  reviewed_at: string | null;
  review_reason: string;
}

export interface DakotaWebsiteAuditScores {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  best_practices: number | null;
}

export interface DakotaWebsiteAuditFinding {
  finding_id: string;
  area: DakotaAuditArea;
  severity: DakotaAuditFindingSeverity;
  summary: string;
}

export interface DakotaWebsiteAuditIntelligence {
  report_id: string;
  domain: string;
  report_url: string | null;
  status: DakotaWebsiteAuditStatus;
  status_updated_at: string;
  requested_at: string | null;
  generated_at: string | null;
  failed_at: string | null;
  failure_reason: string;
  measurement_state: DakotaAuditMeasurementState;
  scores: DakotaWebsiteAuditScores;
  overall_score: number | null;
  grade: "A" | "B" | "C" | "D" | "F" | null;
  summary: string;
  findings: DakotaWebsiteAuditFinding[];
  email_delivery: DakotaWebsiteAuditEmailDelivery;
  engagement: DakotaWebsiteAuditEngagement;
  reconciled_at: string;
}

export interface DakotaWebsiteAuditEmailDelivery {
  status: DakotaEmailDeliveryStatus;
  sent_at: string | null;
  failed_at: string | null;
  failure_reason: string;
  updated_at: string | null;
}

export interface DakotaWebsiteAuditEngagement {
  first_view_at: string | null;
  last_view_at: string | null;
  total_views: number;
  max_scroll_depth: number;
  max_time_on_page_seconds: number;
  updated_at: string | null;
}

export interface DakotaPrivateOfferSelection {
  offer_code: DakotaPrivateOfferCode;
  price_band: DakotaPrivatePriceBand;
  rationale: string;
  selected_at: string;
}

export interface DakotaRevenueAlert {
  alert_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaRevenueAlertKind;
  severity: DakotaRevenueAlertSeverity;
  message: string;
  created_at: string;
  status: DakotaRevenueAlertStatus;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolution_note: string;
}

export interface DakotaArchiveMetadata {
  archived_at: string;
  reason: string;
  retention_until: string | null;
  source: DakotaArchiveSource;
}

export interface DakotaRevenueBridgeRecord {
  research_review: DakotaResearchReview;
  evidence: DakotaRevenueEvidence[];
  external_events: DakotaExternalNeedsReviewEvent[];
  website_audit: DakotaWebsiteAuditIntelligence | null;
  selected_offer: DakotaPrivateOfferSelection | null;
  alerts: DakotaRevenueAlert[];
  archive: DakotaArchiveMetadata | null;
  updated_at: string;
}

export interface DakotaRevenueProviderState {
  health: DakotaProviderHealthState;
  detail: string;
  cursor: string | null;
  checked_at: string;
  cursor_updated_at: string | null;
  consecutive_failures: number;
  updated_at: string;
}

export interface DakotaRevenueBridgeEnvelope {
  schema_version: typeof DAKOTA_REVENUE_BRIDGE_SCHEMA;
  updated_at: string;
  records: Record<string, DakotaRevenueBridgeRecord>;
  providers: Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>>;
}

export interface DakotaRevenueEvidenceSuggestionInput {
  evidence_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaRevenueEvidenceKind;
  summary: string;
  public_url: string | null;
  external_ref: string | null;
  observed_at: string;
}

export interface DakotaExternalEventInput {
  event_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaExternalEventKind;
  summary: string;
  external_ref: string;
  occurred_at: string;
}

export interface DakotaWebsiteAuditRequestedPatch {
  patch_type: "requested";
  report_id: string;
  domain: string;
  requested_at: string;
}

export interface DakotaWebsiteAuditGeneratedPatch {
  patch_type: "generated";
  report_id: string;
  domain: string;
  generated_at: string;
  report_url: string;
  measurement_state: DakotaAuditMeasurementState;
  scores: DakotaWebsiteAuditScores;
  overall_score: number | null;
  grade: "A" | "B" | "C" | "D" | "F" | null;
  summary: string;
  findings: DakotaWebsiteAuditFinding[];
}

export interface DakotaWebsiteAuditFailedPatch {
  patch_type: "failed";
  report_id: string;
  domain: string;
  failed_at: string;
  failure_reason: string;
}

export interface DakotaWebsiteAuditDeliveryPatch {
  patch_type: "delivery";
  report_id: string;
  domain: string;
  status: Exclude<DakotaEmailDeliveryStatus, "unknown">;
  updated_at: string;
  sent_at: string | null;
  failed_at: string | null;
  failure_reason: string;
}

export interface DakotaWebsiteAuditEngagementPatch {
  patch_type: "engagement";
  report_id: string;
  domain: string;
  observed_at: string;
  first_view_at: string;
  last_view_at: string;
  total_views: number;
  max_scroll_depth: number;
  max_time_on_page_seconds: number;
}

export type DakotaWebsiteAuditReconciliationPatch =
  | DakotaWebsiteAuditRequestedPatch
  | DakotaWebsiteAuditGeneratedPatch
  | DakotaWebsiteAuditFailedPatch
  | DakotaWebsiteAuditDeliveryPatch
  | DakotaWebsiteAuditEngagementPatch;

export interface DakotaRevenueAlertInput {
  alert_id: string;
  provider: DakotaRevenueProvider;
  kind: DakotaRevenueAlertKind;
  severity: DakotaRevenueAlertSeverity;
  message: string;
}

export interface DakotaRevenueProviderStateInput {
  provider: DakotaRevenueProvider;
  health: DakotaProviderHealthState;
  detail: string;
  cursor: string | null;
  checked_at: string;
  consecutive_failures: number;
}

export interface DakotaArchiveInput {
  reason: string;
  retention_until: string | null;
  source: DakotaArchiveSource;
}

export type DakotaRevenueBridgeServerMutation =
  | {
      type: "append_evidence";
      candidate_key: string;
      evidence: DakotaRevenueEvidenceSuggestionInput;
    }
  | {
      type: "append_external_event";
      candidate_key: string;
      event: DakotaExternalEventInput;
    }
  | {
      type: "reconcile_website_audit";
      candidate_key: string;
      patch: DakotaWebsiteAuditReconciliationPatch;
    }
  | {
      type: "append_alert";
      candidate_key: string;
      alert: DakotaRevenueAlertInput;
    }
  | {
      type: "update_provider";
      provider_state: DakotaRevenueProviderStateInput;
    }
  | {
      type: "archive_candidate";
      candidate_key: string;
      archive: DakotaArchiveInput;
    }
  | {
      type: "restore_candidate";
      candidate_key: string;
    };

export type DakotaRevenueBridgeOperatorMutation =
  | {
      type: "review_research";
      disposition: Exclude<DakotaResearchDisposition, "unreviewed">;
      reason: string;
    }
  | {
      type: "review_evidence";
      evidence_id: string;
      decision: "confirmed" | "rejected";
      reason: string;
    }
  | {
      type: "review_external_event";
      event_id: string;
      decision: "confirmed" | "rejected";
      reason: string;
    }
  | {
      type: "select_offer";
      offer_code: DakotaPrivateOfferCode;
      price_band: DakotaPrivatePriceBand;
      rationale: string;
    }
  | {
      type: "acknowledge_alert";
      alert_id: string;
      note: string;
    }
  | {
      type: "resolve_alert";
      alert_id: string;
      note: string;
    }
;

export interface DakotaRevenueBridgePutPayload {
  candidate_key: string;
  expected_updated_at: string | null;
  mutation: DakotaRevenueBridgeOperatorMutation;
}

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

const IDENTIFIER = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const EXTERNAL_REF = /^[A-Za-z0-9][A-Za-z0-9._:/+=-]{0,255}$/u;
const CURSOR = /^[A-Za-z0-9][A-Za-z0-9._:/+=-]{0,511}$/u;
const CONTROL_OR_MARKUP = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/u;
const SECRET_LIKE = /(?:-----BEGIN [A-Z ]+PRIVATE KEY-----|\b(?:api[_-]?key|client[_-]?secret|password|authorization|bearer|refresh[_-]?token)\s*[:=]|\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/iu;
const ISO_TIMESTAMP = /(?:Z|[+-]\d{2}:\d{2})$/u;

const RESEARCH_FIELDS = ["disposition", "reason", "reviewed_at"] as const;
const EVIDENCE_FIELDS = [
  "evidence_id", "provider", "kind", "summary", "public_url", "external_ref",
  "observed_at", "received_at", "review_state", "reviewed_at", "review_reason",
] as const;
const EVIDENCE_INPUT_FIELDS = [
  "evidence_id", "provider", "kind", "summary", "public_url", "external_ref", "observed_at",
] as const;
const EXTERNAL_EVENT_FIELDS = [
  "event_id", "provider", "kind", "summary", "external_ref", "occurred_at",
  "received_at", "review_state", "reviewed_at", "review_reason",
] as const;
const EXTERNAL_EVENT_INPUT_FIELDS = [
  "event_id", "provider", "kind", "summary", "external_ref", "occurred_at",
] as const;
const AUDIT_SCORE_FIELDS = ["performance", "seo", "accessibility", "best_practices"] as const;
const AUDIT_FINDING_FIELDS = ["finding_id", "area", "severity", "summary"] as const;
const AUDIT_FIELDS = [
  "report_id", "domain", "report_url", "status", "status_updated_at", "requested_at",
  "generated_at", "failed_at", "failure_reason", "measurement_state", "scores",
  "overall_score", "grade", "summary", "findings", "email_delivery", "engagement", "reconciled_at",
] as const;
const AUDIT_DELIVERY_FIELDS = ["status", "sent_at", "failed_at", "failure_reason", "updated_at"] as const;
const AUDIT_ENGAGEMENT_FIELDS = [
  "first_view_at", "last_view_at", "total_views", "max_scroll_depth", "max_time_on_page_seconds", "updated_at",
] as const;
const AUDIT_REQUESTED_PATCH_FIELDS = ["patch_type", "report_id", "domain", "requested_at"] as const;
const AUDIT_GENERATED_PATCH_FIELDS = [
  "patch_type", "report_id", "domain", "generated_at", "report_url", "measurement_state", "scores",
  "overall_score", "grade", "summary", "findings",
] as const;
const AUDIT_FAILED_PATCH_FIELDS = ["patch_type", "report_id", "domain", "failed_at", "failure_reason"] as const;
const AUDIT_DELIVERY_PATCH_FIELDS = [
  "patch_type", "report_id", "domain", "status", "updated_at", "sent_at", "failed_at", "failure_reason",
] as const;
const AUDIT_ENGAGEMENT_PATCH_FIELDS = [
  "patch_type", "report_id", "domain", "observed_at", "first_view_at", "last_view_at", "total_views",
  "max_scroll_depth", "max_time_on_page_seconds",
] as const;
const OFFER_FIELDS = ["offer_code", "price_band", "rationale", "selected_at"] as const;
const ALERT_FIELDS = [
  "alert_id", "provider", "kind", "severity", "message", "created_at", "status",
  "acknowledged_at", "resolved_at", "resolution_note",
] as const;
const ALERT_INPUT_FIELDS = ["alert_id", "provider", "kind", "severity", "message"] as const;
const ARCHIVE_FIELDS = ["archived_at", "reason", "retention_until", "source"] as const;
const ARCHIVE_INPUT_FIELDS = ["reason", "retention_until", "source"] as const;
const RECORD_FIELDS = [
  "research_review", "evidence", "external_events", "website_audit", "selected_offer",
  "alerts", "archive", "updated_at",
] as const;
const PROVIDER_STATE_FIELDS = [
  "health", "detail", "cursor", "checked_at", "cursor_updated_at", "consecutive_failures", "updated_at",
] as const;
const PROVIDER_INPUT_FIELDS = [
  "provider", "health", "detail", "cursor", "checked_at", "consecutive_failures",
] as const;
const ENVELOPE_FIELDS = ["schema_version", "updated_at", "records", "providers"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value);
  return actual.length === keys.length && actual.every((key) => keys.includes(key));
}

function isEnumValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value as T[number]);
}

function isSafeText(value: unknown, maximumLength: number, allowEmpty = false): value is string {
  return typeof value === "string"
    && value.length <= maximumLength
    && (allowEmpty || value.trim().length > 0)
    && value === value.trim()
    && !CONTROL_OR_MARKUP.test(value)
    && !SECRET_LIKE.test(value);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER.test(value);
}

function isExternalRef(value: unknown): value is string {
  return typeof value === "string" && EXTERNAL_REF.test(value) && !SECRET_LIKE.test(value);
}

function isProviderCursor(value: unknown): value is string {
  return typeof value === "string" && CURSOR.test(value) && !SECRET_LIKE.test(value);
}

export function isRevenueBridgeTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 64 || !ISO_TIMESTAMP.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function isScore(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 100;
}

function isPublicHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/\.$/u, "");
  if (!normalized || normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
    return false;
  }
  if (/^(?:0|10|127)\./u.test(normalized) || /^192\.168\./u.test(normalized)) return false;
  const private172 = normalized.match(/^172\.(\d{1,3})\./u);
  if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return false;
  if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd")) return false;
  return normalized.includes(".") && normalized.length <= 253 && /^[a-z0-9.-]+$/u.test(normalized);
}

function isPublicHttpsUrl(value: unknown): value is string {
  if (value === null) return false;
  if (typeof value !== "string" || value.length > 2_048 || SECRET_LIKE.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.search
      && !url.hash
      && isPublicHostname(url.hostname);
  } catch {
    return false;
  }
}

function isDomain(value: unknown): value is string {
  return typeof value === "string"
    && value === value.toLowerCase()
    && !value.startsWith("www.")
    && isPublicHostname(value);
}

function timestampIsAtOrAfter(value: string, minimum: string): boolean {
  return Date.parse(value) >= Date.parse(minimum);
}

function timestampIsAtOrBefore(value: string, maximum: string): boolean {
  return Date.parse(value) <= Date.parse(maximum);
}

function allowedPriceBands(offer: DakotaPrivateOfferCode): readonly DakotaPrivatePriceBand[] {
  switch (offer) {
    case "scoped_test_task": return ["scoped_after_review"];
    case "white_label_overflow_retainer": return ["usd_1000_monthly"];
    case "ai_friction_audit": return ["included", "usd_500_2000"];
    case "ai_workflow_build": return ["usd_1500_10000_setup"];
    case "automation_maintenance": return ["usd_3000_5000_monthly"];
    case "new_business_launch":
    case "ongoing_care":
    case "custom_scoped": return ["private_custom"];
  }
}

export function isCompatiblePrivateOffer(
  offer: DakotaPrivateOfferCode,
  priceBand: DakotaPrivatePriceBand,
): boolean {
  return allowedPriceBands(offer).includes(priceBand);
}

function validateResearchReview(value: unknown): ValidationResult<DakotaResearchReview> {
  if (!isRecord(value) || !hasExactKeys(value, RESEARCH_FIELDS)) {
    return { valid: false, error: "Research review has an invalid shape." };
  }
  if (!isEnumValue(DAKOTA_RESEARCH_DISPOSITIONS, value.disposition)) {
    return { valid: false, error: "Research disposition is invalid." };
  }
  if (!isSafeText(value.reason, 1_000, value.disposition === "unreviewed")) {
    return { valid: false, error: "Research review reason is invalid." };
  }
  if (value.disposition === "unreviewed") {
    if (value.reason !== "" || value.reviewed_at !== null) {
      return { valid: false, error: "Unreviewed research cannot contain review evidence." };
    }
  } else if (!isRevenueBridgeTimestamp(value.reviewed_at)) {
    return { valid: false, error: "Reviewed research requires reviewed_at." };
  }
  return {
    valid: true,
    value: {
      disposition: value.disposition,
      reason: value.reason as string,
      reviewed_at: value.reviewed_at as string | null,
    },
  };
}

function validateEvidence(value: unknown): ValidationResult<DakotaRevenueEvidence> {
  if (!isRecord(value) || !hasExactKeys(value, EVIDENCE_FIELDS)) {
    return { valid: false, error: "Revenue evidence has an invalid shape." };
  }
  if (!isIdentifier(value.evidence_id)) return { valid: false, error: "Evidence ID is invalid." };
  if (!isEnumValue(DAKOTA_REVENUE_PROVIDERS, value.provider)) return { valid: false, error: "Evidence provider is invalid." };
  if (!isEnumValue(DAKOTA_EVIDENCE_KINDS, value.kind)) return { valid: false, error: "Evidence kind is invalid." };
  if (!isSafeText(value.summary, 1_000)) return { valid: false, error: "Evidence summary is invalid." };
  if (value.public_url !== null && !isPublicHttpsUrl(value.public_url)) return { valid: false, error: "Evidence public URL is invalid." };
  if (value.external_ref !== null && !isExternalRef(value.external_ref)) return { valid: false, error: "Evidence external reference is invalid." };
  if (!isRevenueBridgeTimestamp(value.observed_at) || !isRevenueBridgeTimestamp(value.received_at)) {
    return { valid: false, error: "Evidence timestamps are invalid." };
  }
  if (!timestampIsAtOrAfter(value.received_at, value.observed_at)) {
    return { valid: false, error: "Evidence cannot be received before it was observed." };
  }
  if (!isEnumValue(DAKOTA_EVIDENCE_REVIEW_STATES, value.review_state)) {
    return { valid: false, error: "Evidence review state is invalid." };
  }
  if (!isSafeText(value.review_reason, 1_000, value.review_state === "suggested")) {
    return { valid: false, error: "Evidence review reason is invalid." };
  }
  if (value.review_state === "suggested") {
    if (value.reviewed_at !== null || value.review_reason !== "") {
      return { valid: false, error: "Suggested evidence cannot contain a review decision." };
    }
  } else if (!isRevenueBridgeTimestamp(value.reviewed_at) || !timestampIsAtOrAfter(value.reviewed_at, value.received_at)) {
    return { valid: false, error: "Reviewed evidence requires a valid reviewed_at timestamp." };
  }
  return { valid: true, value: value as unknown as DakotaRevenueEvidence };
}

function validateExternalEvent(value: unknown): ValidationResult<DakotaExternalNeedsReviewEvent> {
  if (!isRecord(value) || !hasExactKeys(value, EXTERNAL_EVENT_FIELDS)) {
    return { valid: false, error: "External event has an invalid shape." };
  }
  if (!isIdentifier(value.event_id)) return { valid: false, error: "External event ID is invalid." };
  if (!isEnumValue(DAKOTA_REVENUE_PROVIDERS, value.provider)) return { valid: false, error: "External event provider is invalid." };
  if (!isEnumValue(DAKOTA_EXTERNAL_EVENT_KINDS, value.kind)) return { valid: false, error: "External event kind is invalid." };
  if (!isSafeText(value.summary, 1_000)) return { valid: false, error: "External event summary is invalid." };
  if (!isExternalRef(value.external_ref)) return { valid: false, error: "External event reference is invalid." };
  if (!isRevenueBridgeTimestamp(value.occurred_at) || !isRevenueBridgeTimestamp(value.received_at)) {
    return { valid: false, error: "External event timestamps are invalid." };
  }
  if (!timestampIsAtOrAfter(value.received_at, value.occurred_at)) {
    return { valid: false, error: "External event cannot be received before it occurred." };
  }
  if (!isEnumValue(DAKOTA_EXTERNAL_EVENT_REVIEW_STATES, value.review_state)) {
    return { valid: false, error: "External event review state is invalid." };
  }
  if (!isSafeText(value.review_reason, 1_000, value.review_state === "needs_review")) {
    return { valid: false, error: "External event review reason is invalid." };
  }
  if (value.review_state === "needs_review") {
    if (value.reviewed_at !== null || value.review_reason !== "") {
      return { valid: false, error: "Needs-review events cannot contain a review decision." };
    }
  } else if (!isRevenueBridgeTimestamp(value.reviewed_at) || !timestampIsAtOrAfter(value.reviewed_at, value.received_at)) {
    return { valid: false, error: "Reviewed external events require a valid reviewed_at timestamp." };
  }
  return { valid: true, value: value as unknown as DakotaExternalNeedsReviewEvent };
}

function validateAuditScores(value: unknown): ValidationResult<DakotaWebsiteAuditScores> {
  if (!isRecord(value) || !hasExactKeys(value, AUDIT_SCORE_FIELDS)) {
    return { valid: false, error: "Website Audit scores have an invalid shape." };
  }
  for (const field of AUDIT_SCORE_FIELDS) {
    if (value[field] !== null && !isScore(value[field])) {
      return { valid: false, error: `Website Audit ${field} score is invalid.` };
    }
  }
  return { valid: true, value: value as unknown as DakotaWebsiteAuditScores };
}

function validateAuditFinding(value: unknown): ValidationResult<DakotaWebsiteAuditFinding> {
  if (!isRecord(value) || !hasExactKeys(value, AUDIT_FINDING_FIELDS)) {
    return { valid: false, error: "Website Audit finding has an invalid shape." };
  }
  if (!isIdentifier(value.finding_id)) return { valid: false, error: "Website Audit finding ID is invalid." };
  if (!isEnumValue(DAKOTA_AUDIT_AREAS, value.area)) return { valid: false, error: "Website Audit finding area is invalid." };
  if (!isEnumValue(DAKOTA_AUDIT_FINDING_SEVERITIES, value.severity)) return { valid: false, error: "Website Audit finding severity is invalid." };
  if (!isSafeText(value.summary, 1_000)) return { valid: false, error: "Website Audit finding summary is invalid." };
  return { valid: true, value: value as unknown as DakotaWebsiteAuditFinding };
}

function validateAuditMeasurement(
  value: Record<string, unknown>,
  allowEmptySummary = false,
): ValidationResult<Pick<DakotaWebsiteAuditIntelligence, "measurement_state" | "scores" | "overall_score" | "grade" | "summary" | "findings">> {
  if (!isEnumValue(DAKOTA_AUDIT_MEASUREMENT_STATES, value.measurement_state)) {
    return { valid: false, error: "Website Audit measurement state is invalid." };
  }
  const scores = validateAuditScores(value.scores);
  if (!scores.valid) return scores;
  const scoreValues = Object.values(scores.value);
  const measuredCount = scoreValues.filter((score) => score !== null).length;
  if (value.measurement_state === "complete") {
    if (measuredCount !== 4 || !isScore(value.overall_score) || !["A", "B", "C", "D", "F"].includes(value.grade as string)) {
      return { valid: false, error: "Complete Website Audit intelligence requires all measured scores and a grade." };
    }
  } else {
    if (value.overall_score !== null || value.grade !== null) {
      return { valid: false, error: "Incomplete Website Audit intelligence cannot claim an overall score or grade." };
    }
    if ((value.measurement_state === "partial" && (measuredCount === 0 || measuredCount === 4))
      || (value.measurement_state === "unavailable" && measuredCount !== 0)) {
      return { valid: false, error: "Website Audit measurement state does not match its scores." };
    }
  }
  if (!isSafeText(value.summary, 2_000, allowEmptySummary)) return { valid: false, error: "Website Audit summary is invalid." };
  if (!Array.isArray(value.findings) || value.findings.length > DAKOTA_REVENUE_BRIDGE_FINDING_LIMIT) {
    return { valid: false, error: "Website Audit findings exceed the limit." };
  }
  const findingIds = new Set<string>();
  const findings: DakotaWebsiteAuditFinding[] = [];
  for (const candidate of value.findings) {
    const finding = validateAuditFinding(candidate);
    if (!finding.valid) return finding;
    if (findingIds.has(finding.value.finding_id)) return { valid: false, error: "Website Audit finding IDs must be unique." };
    findingIds.add(finding.value.finding_id);
    findings.push(finding.value);
  }
  return { valid: true, value: {
    measurement_state: value.measurement_state as DakotaAuditMeasurementState,
    scores: scores.value,
    overall_score: value.overall_score as number | null,
    grade: value.grade as DakotaWebsiteAuditIntelligence["grade"],
    summary: value.summary as string,
    findings,
  } };
}

function validateAuditEmailDelivery(value: unknown): ValidationResult<DakotaWebsiteAuditEmailDelivery> {
  if (!isRecord(value) || !hasExactKeys(value, AUDIT_DELIVERY_FIELDS)) {
    return { valid: false, error: "Website Audit email delivery has an invalid shape." };
  }
  if (!isEnumValue(DAKOTA_EMAIL_DELIVERY_STATUSES, value.status)) {
    return { valid: false, error: "Website Audit email delivery status is invalid." };
  }
  if (!isSafeText(value.failure_reason, 1_000, value.status !== "failed")) {
    return { valid: false, error: "Website Audit email delivery failure reason is invalid." };
  }
  if (value.status === "unknown") {
    if (value.sent_at !== null || value.failed_at !== null || value.failure_reason !== "" || value.updated_at !== null) {
      return { valid: false, error: "Unknown email delivery cannot contain reconciliation facts." };
    }
  } else {
    if (!isRevenueBridgeTimestamp(value.updated_at)) return { valid: false, error: "Website Audit email delivery updated_at is invalid." };
    if (value.status === "sent") {
      if (!isRevenueBridgeTimestamp(value.sent_at) || value.failed_at !== null || value.failure_reason !== ""
        || !timestampIsAtOrAfter(value.updated_at, value.sent_at)) {
        return { valid: false, error: "Sent email delivery facts are inconsistent." };
      }
    } else if (value.status === "failed") {
      if (!isRevenueBridgeTimestamp(value.failed_at) || !timestampIsAtOrAfter(value.updated_at, value.failed_at)) {
        return { valid: false, error: "Failed email delivery facts are inconsistent." };
      }
      if (value.sent_at !== null && !isRevenueBridgeTimestamp(value.sent_at)) {
        return { valid: false, error: "Email delivery sent_at is invalid." };
      }
    } else if (value.sent_at !== null || value.failed_at !== null || value.failure_reason !== "") {
      return { valid: false, error: "Pending email delivery cannot claim send or failure facts." };
    }
  }
  return { valid: true, value: value as unknown as DakotaWebsiteAuditEmailDelivery };
}

function validateAuditEngagement(value: unknown): ValidationResult<DakotaWebsiteAuditEngagement> {
  if (!isRecord(value) || !hasExactKeys(value, AUDIT_ENGAGEMENT_FIELDS)) {
    return { valid: false, error: "Website Audit engagement has an invalid shape." };
  }
  if (!Number.isInteger(value.total_views) || (value.total_views as number) < 0 || (value.total_views as number) > 1_000_000) {
    return { valid: false, error: "Website Audit total views are invalid." };
  }
  if (!Number.isInteger(value.max_scroll_depth) || (value.max_scroll_depth as number) < 0 || (value.max_scroll_depth as number) > 100) {
    return { valid: false, error: "Website Audit maximum scroll depth is invalid." };
  }
  if (!Number.isInteger(value.max_time_on_page_seconds) || (value.max_time_on_page_seconds as number) < 0 || (value.max_time_on_page_seconds as number) > 86_400) {
    return { valid: false, error: "Website Audit maximum time on page is invalid." };
  }
  if (value.total_views === 0) {
    if (value.first_view_at !== null || value.last_view_at !== null || value.updated_at !== null
      || value.max_scroll_depth !== 0 || value.max_time_on_page_seconds !== 0) {
      return { valid: false, error: "Zero-view engagement cannot contain view facts." };
    }
  } else if (!isRevenueBridgeTimestamp(value.first_view_at)
    || !isRevenueBridgeTimestamp(value.last_view_at)
    || !isRevenueBridgeTimestamp(value.updated_at)
    || !timestampIsAtOrAfter(value.last_view_at, value.first_view_at)
    || !timestampIsAtOrAfter(value.updated_at, value.last_view_at)) {
    return { valid: false, error: "Website Audit engagement timestamps are invalid." };
  }
  return { valid: true, value: value as unknown as DakotaWebsiteAuditEngagement };
}

function latestAuditReconciliationTimestamp(value: DakotaWebsiteAuditIntelligence): number {
  const timestamps = [value.status_updated_at, value.reconciled_at];
  for (const optional of [
    value.requested_at,
    value.generated_at,
    value.failed_at,
    value.email_delivery.updated_at,
    value.email_delivery.sent_at,
    value.email_delivery.failed_at,
    value.engagement.updated_at,
    value.engagement.first_view_at,
    value.engagement.last_view_at,
  ]) {
    if (optional) timestamps.push(optional);
  }
  return Math.max(...timestamps.map(Date.parse));
}

function expectedWebsiteAuditLifecycle(
  value: Pick<DakotaWebsiteAuditIntelligence, "requested_at" | "generated_at" | "failed_at">,
): { status: Exclude<DakotaWebsiteAuditStatus, "unknown">; timestamp: string } | null {
  const candidates: Array<{ status: Exclude<DakotaWebsiteAuditStatus, "unknown">; timestamp: string; priority: number }> = [];
  if (value.requested_at) candidates.push({ status: "requested", timestamp: value.requested_at, priority: 0 });
  if (value.generated_at) candidates.push({ status: "generated", timestamp: value.generated_at, priority: 1 });
  if (value.failed_at) candidates.push({ status: "failed", timestamp: value.failed_at, priority: 2 });
  candidates.sort((left, right) => {
    const byTime = Date.parse(right.timestamp) - Date.parse(left.timestamp);
    return byTime === 0 ? right.priority - left.priority : byTime;
  });
  return candidates[0] ?? null;
}

function validateWebsiteAudit(value: unknown): ValidationResult<DakotaWebsiteAuditIntelligence> {
  if (!isRecord(value) || !hasExactKeys(value, AUDIT_FIELDS)) {
    return { valid: false, error: "Website Audit intelligence has an invalid shape." };
  }
  if (!isIdentifier(value.report_id)) return { valid: false, error: "Website Audit report ID is invalid." };
  if (!isDomain(value.domain)) return { valid: false, error: "Website Audit domain is invalid." };
  if (value.report_url !== null && !isPublicHttpsUrl(value.report_url)) return { valid: false, error: "Website Audit report URL is invalid." };
  if (!isEnumValue(DAKOTA_WEBSITE_AUDIT_STATUSES, value.status)) return { valid: false, error: "Website Audit status is invalid." };
  if (!isRevenueBridgeTimestamp(value.status_updated_at) || !isRevenueBridgeTimestamp(value.reconciled_at)) {
    return { valid: false, error: "Website Audit reconciliation timestamps are invalid." };
  }
  for (const field of ["requested_at", "generated_at", "failed_at"] as const) {
    if (value[field] !== null && !isRevenueBridgeTimestamp(value[field])) {
      return { valid: false, error: `Website Audit ${field} is invalid.` };
    }
  }
  if (!isSafeText(value.failure_reason, 1_000, value.failed_at === null)) {
    return { valid: false, error: "Website Audit failure reason is invalid." };
  }
  if (value.failed_at === null && value.failure_reason !== "") {
    return { valid: false, error: "Website Audit failure reason requires failed_at." };
  }
  if (value.status === "unknown" && (value.requested_at !== null || value.generated_at !== null || value.failed_at !== null)) {
    return { valid: false, error: "Unknown Website Audit status cannot contain lifecycle facts." };
  }
  if (value.status === "requested" && value.requested_at === null) {
    return { valid: false, error: "Requested Website Audit intelligence requires requested_at." };
  }
  if (value.status === "generated" && (value.generated_at === null || value.report_url === null)) {
    return { valid: false, error: "Generated Website Audit intelligence requires generated_at and report_url." };
  }
  if (value.status === "failed" && (value.failed_at === null || value.failure_reason === "")) {
    return { valid: false, error: "Failed Website Audit intelligence requires failure facts." };
  }
  const measurement = validateAuditMeasurement(value, value.generated_at === null);
  if (!measurement.valid) return measurement;
  if (value.generated_at === null) {
    const scoresAreEmpty = Object.values(measurement.value.scores).every((score) => score === null);
    if (measurement.value.measurement_state !== "unavailable" || !scoresAreEmpty
      || measurement.value.overall_score !== null || measurement.value.grade !== null
      || measurement.value.summary !== "" || measurement.value.findings.length !== 0) {
      return { valid: false, error: "Ungenerated Website Audit intelligence cannot claim measured intelligence." };
    }
  }
  const emailDelivery = validateAuditEmailDelivery(value.email_delivery);
  if (!emailDelivery.valid) return emailDelivery;
  const engagement = validateAuditEngagement(value.engagement);
  if (!engagement.valid) return engagement;
  const intelligence: DakotaWebsiteAuditIntelligence = {
    report_id: value.report_id,
    domain: value.domain,
    report_url: value.report_url as string | null,
    status: value.status,
    status_updated_at: value.status_updated_at,
    requested_at: value.requested_at as string | null,
    generated_at: value.generated_at as string | null,
    failed_at: value.failed_at as string | null,
    failure_reason: value.failure_reason as string,
    ...measurement.value,
    email_delivery: emailDelivery.value,
    engagement: engagement.value,
    reconciled_at: value.reconciled_at,
  };
  const expectedLifecycle = expectedWebsiteAuditLifecycle(intelligence);
  if (expectedLifecycle === null) {
    if (intelligence.status !== "unknown") {
      return { valid: false, error: "Website Audit status does not match its lifecycle facts." };
    }
  } else if (intelligence.status !== expectedLifecycle.status
    || intelligence.status_updated_at !== expectedLifecycle.timestamp) {
    return { valid: false, error: "Website Audit status does not match its latest lifecycle fact." };
  }
  if (latestAuditReconciliationTimestamp(intelligence) > Date.parse(intelligence.reconciled_at)) {
    return { valid: false, error: "Website Audit reconciled_at predates reconciliation facts." };
  }
  return { valid: true, value: intelligence };
}

function validateOffer(value: unknown): ValidationResult<DakotaPrivateOfferSelection> {
  if (!isRecord(value) || !hasExactKeys(value, OFFER_FIELDS)) return { valid: false, error: "Private offer selection has an invalid shape." };
  if (!isEnumValue(DAKOTA_PRIVATE_OFFER_CODES, value.offer_code)) return { valid: false, error: "Private offer code is invalid." };
  if (!isEnumValue(DAKOTA_PRIVATE_PRICE_BANDS, value.price_band)) return { valid: false, error: "Private price band is invalid." };
  if (!isCompatiblePrivateOffer(value.offer_code, value.price_band)) return { valid: false, error: "Private price band does not match the offer." };
  if (!isSafeText(value.rationale, 1_000)) return { valid: false, error: "Private offer rationale is invalid." };
  if (!isRevenueBridgeTimestamp(value.selected_at)) return { valid: false, error: "Private offer selected_at is invalid." };
  return { valid: true, value: value as unknown as DakotaPrivateOfferSelection };
}

function validateAlert(value: unknown): ValidationResult<DakotaRevenueAlert> {
  if (!isRecord(value) || !hasExactKeys(value, ALERT_FIELDS)) return { valid: false, error: "Revenue alert has an invalid shape." };
  if (!isIdentifier(value.alert_id)) return { valid: false, error: "Revenue alert ID is invalid." };
  if (!isEnumValue(DAKOTA_REVENUE_PROVIDERS, value.provider)) return { valid: false, error: "Revenue alert provider is invalid." };
  if (!isEnumValue(DAKOTA_ALERT_KINDS, value.kind)) return { valid: false, error: "Revenue alert kind is invalid." };
  if (!isEnumValue(DAKOTA_ALERT_SEVERITIES, value.severity)) return { valid: false, error: "Revenue alert severity is invalid." };
  if (!isSafeText(value.message, 1_000)) return { valid: false, error: "Revenue alert message is invalid." };
  if (!isRevenueBridgeTimestamp(value.created_at)) return { valid: false, error: "Revenue alert created_at is invalid." };
  if (!isEnumValue(DAKOTA_ALERT_STATUSES, value.status)) return { valid: false, error: "Revenue alert status is invalid." };
  if (!isSafeText(value.resolution_note, 1_000, value.status === "open")) return { valid: false, error: "Revenue alert resolution note is invalid." };
  if (value.status === "open") {
    if (value.acknowledged_at !== null || value.resolved_at !== null || value.resolution_note !== "") {
      return { valid: false, error: "Open alerts cannot contain resolution evidence." };
    }
  } else if (value.status === "acknowledged") {
    if (!isRevenueBridgeTimestamp(value.acknowledged_at) || value.resolved_at !== null || !timestampIsAtOrAfter(value.acknowledged_at, value.created_at as string)) {
      return { valid: false, error: "Acknowledged alerts require a valid acknowledged_at timestamp." };
    }
  } else if (!isRevenueBridgeTimestamp(value.resolved_at)
    || !timestampIsAtOrAfter(value.resolved_at, value.created_at as string)
    || (value.acknowledged_at !== null && (!isRevenueBridgeTimestamp(value.acknowledged_at) || !timestampIsAtOrBefore(value.acknowledged_at, value.resolved_at)))) {
    return { valid: false, error: "Resolved alerts require valid resolution timestamps." };
  }
  return { valid: true, value: value as unknown as DakotaRevenueAlert };
}

function validateArchive(value: unknown): ValidationResult<DakotaArchiveMetadata> {
  if (!isRecord(value) || !hasExactKeys(value, ARCHIVE_FIELDS)) return { valid: false, error: "Archive metadata has an invalid shape." };
  if (!isRevenueBridgeTimestamp(value.archived_at)) return { valid: false, error: "Archive timestamp is invalid." };
  if (!isSafeText(value.reason, 1_000)) return { valid: false, error: "Archive reason is invalid." };
  if (value.retention_until !== null && (!isRevenueBridgeTimestamp(value.retention_until) || !timestampIsAtOrAfter(value.retention_until, value.archived_at as string))) {
    return { valid: false, error: "Archive retention timestamp is invalid." };
  }
  if (!isEnumValue(DAKOTA_ARCHIVE_SOURCES, value.source)) return { valid: false, error: "Archive source is invalid." };
  return { valid: true, value: value as unknown as DakotaArchiveMetadata };
}

function latestRecordTimestamp(record: DakotaRevenueBridgeRecord): number {
  const timestamps = [record.updated_at];
  if (record.research_review.reviewed_at) timestamps.push(record.research_review.reviewed_at);
  if (record.website_audit) timestamps.push(record.website_audit.reconciled_at);
  if (record.selected_offer) timestamps.push(record.selected_offer.selected_at);
  if (record.archive) timestamps.push(record.archive.archived_at);
  for (const evidence of record.evidence) timestamps.push(evidence.received_at, ...(evidence.reviewed_at ? [evidence.reviewed_at] : []));
  for (const event of record.external_events) timestamps.push(event.received_at, ...(event.reviewed_at ? [event.reviewed_at] : []));
  for (const alert of record.alerts) timestamps.push(alert.created_at, ...(alert.acknowledged_at ? [alert.acknowledged_at] : []), ...(alert.resolved_at ? [alert.resolved_at] : []));
  return Math.max(...timestamps.map(Date.parse));
}

export function validateDakotaRevenueBridgeRecord(value: unknown): ValidationResult<DakotaRevenueBridgeRecord> {
  if (!isRecord(value) || !hasExactKeys(value, RECORD_FIELDS)) return { valid: false, error: "Revenue Bridge record has an invalid shape." };
  if (!isRevenueBridgeTimestamp(value.updated_at)) return { valid: false, error: "Revenue Bridge record updated_at is invalid." };
  const research = validateResearchReview(value.research_review);
  if (!research.valid) return research;
  if (!Array.isArray(value.evidence) || value.evidence.length > DAKOTA_REVENUE_BRIDGE_EVIDENCE_LIMIT) {
    return { valid: false, error: "Revenue evidence exceeds the limit." };
  }
  const evidence: DakotaRevenueEvidence[] = [];
  const evidenceIds = new Set<string>();
  for (const candidate of value.evidence) {
    const result = validateEvidence(candidate);
    if (!result.valid) return result;
    if (evidenceIds.has(result.value.evidence_id)) return { valid: false, error: "Evidence IDs must be unique." };
    evidenceIds.add(result.value.evidence_id);
    evidence.push(result.value);
  }
  if (!Array.isArray(value.external_events) || value.external_events.length > DAKOTA_REVENUE_BRIDGE_EXTERNAL_EVENT_LIMIT) {
    return { valid: false, error: "External events exceed the limit." };
  }
  const externalEvents: DakotaExternalNeedsReviewEvent[] = [];
  const eventIds = new Set<string>();
  for (const candidate of value.external_events) {
    const result = validateExternalEvent(candidate);
    if (!result.valid) return result;
    if (eventIds.has(result.value.event_id)) return { valid: false, error: "External event IDs must be unique." };
    eventIds.add(result.value.event_id);
    externalEvents.push(result.value);
  }
  const websiteAudit = value.website_audit === null ? null : validateWebsiteAudit(value.website_audit);
  if (websiteAudit !== null && !websiteAudit.valid) return websiteAudit;
  const selectedOffer = value.selected_offer === null ? null : validateOffer(value.selected_offer);
  if (selectedOffer !== null && !selectedOffer.valid) return selectedOffer;
  if (!Array.isArray(value.alerts) || value.alerts.length > DAKOTA_REVENUE_BRIDGE_ALERT_LIMIT) {
    return { valid: false, error: "Revenue alerts exceed the limit." };
  }
  const alerts: DakotaRevenueAlert[] = [];
  const alertIds = new Set<string>();
  for (const candidate of value.alerts) {
    const result = validateAlert(candidate);
    if (!result.valid) return result;
    if (alertIds.has(result.value.alert_id)) return { valid: false, error: "Revenue alert IDs must be unique." };
    alertIds.add(result.value.alert_id);
    alerts.push(result.value);
  }
  const archive = value.archive === null ? null : validateArchive(value.archive);
  if (archive !== null && !archive.valid) return archive;
  const record: DakotaRevenueBridgeRecord = {
    research_review: research.value,
    evidence,
    external_events: externalEvents,
    website_audit: websiteAudit === null ? null : websiteAudit.value,
    selected_offer: selectedOffer === null ? null : selectedOffer.value,
    alerts,
    archive: archive === null ? null : archive.value,
    updated_at: value.updated_at,
  };
  if (latestRecordTimestamp(record) > Date.parse(record.updated_at)) {
    return { valid: false, error: "Revenue Bridge record updated_at predates contained evidence." };
  }
  return { valid: true, value: record };
}

function validateProviderState(value: unknown): ValidationResult<DakotaRevenueProviderState> {
  if (!isRecord(value) || !hasExactKeys(value, PROVIDER_STATE_FIELDS)) return { valid: false, error: "Provider state has an invalid shape." };
  if (!isEnumValue(DAKOTA_PROVIDER_HEALTH_STATES, value.health)) return { valid: false, error: "Provider health is invalid." };
  if (!isSafeText(value.detail, 1_000, true)) return { valid: false, error: "Provider detail is invalid." };
  if (value.cursor !== null && !isProviderCursor(value.cursor)) return { valid: false, error: "Provider cursor is invalid." };
  if (!isRevenueBridgeTimestamp(value.checked_at) || !isRevenueBridgeTimestamp(value.updated_at)) return { valid: false, error: "Provider timestamps are invalid." };
  if (!timestampIsAtOrAfter(value.updated_at, value.checked_at as string)) return { valid: false, error: "Provider updated_at predates checked_at." };
  if (value.cursor === null) {
    if (value.cursor_updated_at !== null) return { valid: false, error: "A missing provider cursor cannot have cursor_updated_at." };
  } else if (!isRevenueBridgeTimestamp(value.cursor_updated_at) || !timestampIsAtOrBefore(value.cursor_updated_at, value.updated_at as string)) {
    return { valid: false, error: "Provider cursor_updated_at is invalid." };
  }
  if (!Number.isInteger(value.consecutive_failures) || (value.consecutive_failures as number) < 0 || (value.consecutive_failures as number) > 10_000) {
    return { valid: false, error: "Provider consecutive failures are invalid." };
  }
  return { valid: true, value: value as unknown as DakotaRevenueProviderState };
}

export function encodedRevenueBridgeSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).byteLength;
}

export function validateDakotaRevenueBridgeEnvelope(value: unknown): ValidationResult<DakotaRevenueBridgeEnvelope> {
  if (!isRecord(value) || !hasExactKeys(value, ENVELOPE_FIELDS)) return { valid: false, error: "Revenue Bridge envelope has an invalid shape." };
  if (value.schema_version !== DAKOTA_REVENUE_BRIDGE_SCHEMA) return { valid: false, error: "Revenue Bridge schema version is invalid." };
  if (!isRevenueBridgeTimestamp(value.updated_at)) return { valid: false, error: "Revenue Bridge envelope updated_at is invalid." };
  if (!isRecord(value.records)) return { valid: false, error: "Revenue Bridge records must be an object." };
  const recordEntries = Object.entries(value.records);
  if (recordEntries.length > DAKOTA_REVENUE_BRIDGE_RECORD_LIMIT) return { valid: false, error: "Revenue Bridge record limit exceeded." };
  const records = Object.create(null) as Record<string, DakotaRevenueBridgeRecord>;
  for (const [candidateKey, candidate] of recordEntries) {
    if (!isDakotaCandidateKey(candidateKey)) return { valid: false, error: "Revenue Bridge candidate key is invalid." };
    const record = validateDakotaRevenueBridgeRecord(candidate);
    if (!record.valid) return record;
    if (!timestampIsAtOrBefore(record.value.updated_at, value.updated_at)) return { valid: false, error: "Revenue Bridge record is newer than its envelope." };
    records[candidateKey] = record.value;
  }
  if (!isRecord(value.providers)) return { valid: false, error: "Revenue Bridge providers must be an object." };
  const providerEntries = Object.entries(value.providers);
  if (providerEntries.length > DAKOTA_REVENUE_BRIDGE_PROVIDER_LIMIT) return { valid: false, error: "Revenue Bridge provider limit exceeded." };
  const providers: Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>> = Object.create(null);
  for (const [provider, candidate] of providerEntries) {
    if (!isEnumValue(DAKOTA_REVENUE_PROVIDERS, provider)) return { valid: false, error: "Revenue Bridge provider key is invalid." };
    const state = validateProviderState(candidate);
    if (!state.valid) return state;
    if (!timestampIsAtOrBefore(state.value.updated_at, value.updated_at)) return { valid: false, error: "Provider state is newer than its envelope." };
    providers[provider] = state.value;
  }
  const envelope: DakotaRevenueBridgeEnvelope = {
    schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    updated_at: value.updated_at,
    records,
    providers,
  };
  if (encodedRevenueBridgeSize(envelope) > DAKOTA_REVENUE_BRIDGE_STATE_MAX_BYTES) {
    return { valid: false, error: "Revenue Bridge state exceeds the storage limit." };
  }
  return { valid: true, value: envelope };
}

function validateEvidenceInput(value: unknown): ValidationResult<DakotaRevenueEvidenceSuggestionInput> {
  if (!isRecord(value) || !hasExactKeys(value, EVIDENCE_INPUT_FIELDS)) return { valid: false, error: "Evidence suggestion has an invalid shape." };
  const stored = validateEvidence({ ...value, received_at: value.observed_at, review_state: "suggested", reviewed_at: null, review_reason: "" });
  if (!stored.valid) return stored;
  const { received_at: _receivedAt, review_state: _reviewState, reviewed_at: _reviewedAt, review_reason: _reviewReason, ...input } = stored.value;
  return { valid: true, value: input };
}

function validateExternalEventInput(value: unknown): ValidationResult<DakotaExternalEventInput> {
  if (!isRecord(value) || !hasExactKeys(value, EXTERNAL_EVENT_INPUT_FIELDS)) return { valid: false, error: "External event input has an invalid shape." };
  const stored = validateExternalEvent({ ...value, received_at: value.occurred_at, review_state: "needs_review", reviewed_at: null, review_reason: "" });
  if (!stored.valid) return stored;
  const { received_at: _receivedAt, review_state: _reviewState, reviewed_at: _reviewedAt, review_reason: _reviewReason, ...input } = stored.value;
  return { valid: true, value: input };
}

function validateAuditPatchIdentity(value: Record<string, unknown>): ValidationResult<{
  report_id: string;
  domain: string;
}> {
  if (!isIdentifier(value.report_id)) return { valid: false, error: "Website Audit patch report ID is invalid." };
  if (!isDomain(value.domain)) return { valid: false, error: "Website Audit patch domain is invalid." };
  return { valid: true, value: { report_id: value.report_id, domain: value.domain } };
}

function validateWebsiteAuditPatch(
  value: unknown,
): ValidationResult<DakotaWebsiteAuditReconciliationPatch> {
  if (!isRecord(value) || typeof value.patch_type !== "string") {
    return { valid: false, error: "Website Audit reconciliation patch has an invalid shape." };
  }
  const identity = validateAuditPatchIdentity(value);
  if (!identity.valid) return identity;
  switch (value.patch_type) {
    case "requested":
      if (!hasExactKeys(value, AUDIT_REQUESTED_PATCH_FIELDS) || !isRevenueBridgeTimestamp(value.requested_at)) {
        return { valid: false, error: "Website Audit requested patch is invalid." };
      }
      return { valid: true, value: value as unknown as DakotaWebsiteAuditRequestedPatch };
    case "generated": {
      if (!hasExactKeys(value, AUDIT_GENERATED_PATCH_FIELDS)
        || !isRevenueBridgeTimestamp(value.generated_at)
        || !isPublicHttpsUrl(value.report_url)) {
        return { valid: false, error: "Website Audit generated patch is invalid." };
      }
      const measurement = validateAuditMeasurement(value);
      if (!measurement.valid) return measurement;
      return { valid: true, value: {
        patch_type: "generated",
        ...identity.value,
        generated_at: value.generated_at,
        report_url: value.report_url,
        ...measurement.value,
      } };
    }
    case "failed":
      if (!hasExactKeys(value, AUDIT_FAILED_PATCH_FIELDS)
        || !isRevenueBridgeTimestamp(value.failed_at)
        || !isSafeText(value.failure_reason, 1_000)) {
        return { valid: false, error: "Website Audit failed patch is invalid." };
      }
      return { valid: true, value: value as unknown as DakotaWebsiteAuditFailedPatch };
    case "delivery": {
      if (!hasExactKeys(value, AUDIT_DELIVERY_PATCH_FIELDS)
        || !isEnumValue(DAKOTA_EMAIL_DELIVERY_STATUSES, value.status)
        || value.status === "unknown") {
        return { valid: false, error: "Website Audit delivery patch is invalid." };
      }
      const delivery = validateAuditEmailDelivery({
        status: value.status,
        sent_at: value.sent_at,
        failed_at: value.failed_at,
        failure_reason: value.failure_reason,
        updated_at: value.updated_at,
      });
      if (!delivery.valid) return delivery;
      return { valid: true, value: {
        patch_type: "delivery",
        ...identity.value,
        ...delivery.value,
        status: delivery.value.status as Exclude<DakotaEmailDeliveryStatus, "unknown">,
        updated_at: delivery.value.updated_at as string,
      } };
    }
    case "engagement": {
      if (!hasExactKeys(value, AUDIT_ENGAGEMENT_PATCH_FIELDS)
        || !isRevenueBridgeTimestamp(value.observed_at)) {
        return { valid: false, error: "Website Audit engagement patch is invalid." };
      }
      const engagement = validateAuditEngagement({
        first_view_at: value.first_view_at,
        last_view_at: value.last_view_at,
        total_views: value.total_views,
        max_scroll_depth: value.max_scroll_depth,
        max_time_on_page_seconds: value.max_time_on_page_seconds,
        updated_at: value.observed_at,
      });
      if (!engagement.valid || engagement.value.total_views === 0) {
        return { valid: false, error: "Website Audit engagement patch requires at least one view." };
      }
      return { valid: true, value: {
        patch_type: "engagement",
        ...identity.value,
        observed_at: value.observed_at,
        first_view_at: engagement.value.first_view_at as string,
        last_view_at: engagement.value.last_view_at as string,
        total_views: engagement.value.total_views,
        max_scroll_depth: engagement.value.max_scroll_depth,
        max_time_on_page_seconds: engagement.value.max_time_on_page_seconds,
      } };
    }
    default:
      return { valid: false, error: "Website Audit reconciliation patch type is invalid." };
  }
}

function validateAlertInput(value: unknown): ValidationResult<DakotaRevenueAlertInput> {
  if (!isRecord(value) || !hasExactKeys(value, ALERT_INPUT_FIELDS)) return { valid: false, error: "Revenue alert input has an invalid shape." };
  const stored = validateAlert({ ...value, created_at: "2026-01-01T00:00:00.000Z", status: "open", acknowledged_at: null, resolved_at: null, resolution_note: "" });
  if (!stored.valid) return stored;
  const { created_at: _createdAt, status: _status, acknowledged_at: _acknowledgedAt, resolved_at: _resolvedAt, resolution_note: _resolutionNote, ...input } = stored.value;
  return { valid: true, value: input };
}

function validateProviderInput(value: unknown): ValidationResult<DakotaRevenueProviderStateInput> {
  if (!isRecord(value) || !hasExactKeys(value, PROVIDER_INPUT_FIELDS)) return { valid: false, error: "Provider update has an invalid shape." };
  if (!isEnumValue(DAKOTA_REVENUE_PROVIDERS, value.provider)) return { valid: false, error: "Provider update provider is invalid." };
  if (!isEnumValue(DAKOTA_PROVIDER_HEALTH_STATES, value.health)) return { valid: false, error: "Provider update health is invalid." };
  if (!isSafeText(value.detail, 1_000, true)) return { valid: false, error: "Provider update detail is invalid." };
  if (value.cursor !== null && !isProviderCursor(value.cursor)) return { valid: false, error: "Provider update cursor is invalid." };
  if (!isRevenueBridgeTimestamp(value.checked_at)) return { valid: false, error: "Provider update checked_at is invalid." };
  if (!Number.isInteger(value.consecutive_failures) || (value.consecutive_failures as number) < 0 || (value.consecutive_failures as number) > 10_000) {
    return { valid: false, error: "Provider update consecutive failures are invalid." };
  }
  return { valid: true, value: value as unknown as DakotaRevenueProviderStateInput };
}

function validateArchiveInput(value: unknown): ValidationResult<DakotaArchiveInput> {
  if (!isRecord(value) || !hasExactKeys(value, ARCHIVE_INPUT_FIELDS)) return { valid: false, error: "Archive input has an invalid shape." };
  if (!isSafeText(value.reason, 1_000)) return { valid: false, error: "Archive input reason is invalid." };
  if (value.retention_until !== null && !isRevenueBridgeTimestamp(value.retention_until)) return { valid: false, error: "Archive input retention timestamp is invalid." };
  if (!isEnumValue(DAKOTA_ARCHIVE_SOURCES, value.source)) return { valid: false, error: "Archive input source is invalid." };
  return { valid: true, value: value as unknown as DakotaArchiveInput };
}

export function validateDakotaRevenueBridgeServerMutation(
  value: unknown,
): ValidationResult<DakotaRevenueBridgeServerMutation> {
  if (!isRecord(value) || typeof value.type !== "string") return { valid: false, error: "Server mutation has an invalid shape." };
  if (value.type === "update_provider") {
    if (!hasExactKeys(value, ["type", "provider_state"])) return { valid: false, error: "Provider server mutation has an invalid shape." };
    const providerState = validateProviderInput(value.provider_state);
    return providerState.valid ? { valid: true, value: { type: "update_provider", provider_state: providerState.value } } : providerState;
  }
  if (!isDakotaCandidateKey(value.candidate_key)) return { valid: false, error: "Server mutation candidate key is invalid." };
  switch (value.type) {
    case "append_evidence": {
      if (!hasExactKeys(value, ["type", "candidate_key", "evidence"])) return { valid: false, error: "Evidence server mutation has an invalid shape." };
      const evidence = validateEvidenceInput(value.evidence);
      return evidence.valid ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key, evidence: evidence.value } } : evidence;
    }
    case "append_external_event": {
      if (!hasExactKeys(value, ["type", "candidate_key", "event"])) return { valid: false, error: "External-event server mutation has an invalid shape." };
      const event = validateExternalEventInput(value.event);
      return event.valid ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key, event: event.value } } : event;
    }
    case "reconcile_website_audit": {
      if (!hasExactKeys(value, ["type", "candidate_key", "patch"])) return { valid: false, error: "Website Audit server mutation has an invalid shape." };
      const patch = validateWebsiteAuditPatch(value.patch);
      return patch.valid ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key, patch: patch.value } } : patch;
    }
    case "append_alert": {
      if (!hasExactKeys(value, ["type", "candidate_key", "alert"])) return { valid: false, error: "Alert server mutation has an invalid shape." };
      const alert = validateAlertInput(value.alert);
      return alert.valid ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key, alert: alert.value } } : alert;
    }
    case "archive_candidate": {
      if (!hasExactKeys(value, ["type", "candidate_key", "archive"])) return { valid: false, error: "Archive server mutation has an invalid shape." };
      const archive = validateArchiveInput(value.archive);
      return archive.valid ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key, archive: archive.value } } : archive;
    }
    case "restore_candidate":
      return hasExactKeys(value, ["type", "candidate_key"])
        ? { valid: true, value: { type: value.type, candidate_key: value.candidate_key } }
        : { valid: false, error: "Restore server mutation has an invalid shape." };
    default:
      return { valid: false, error: "Server mutation type is invalid." };
  }
}

function validateOperatorMutation(value: unknown): ValidationResult<DakotaRevenueBridgeOperatorMutation> {
  if (!isRecord(value) || typeof value.type !== "string") return { valid: false, error: "Revenue Bridge mutation has an invalid shape." };
  switch (value.type) {
    case "review_research":
      if (!hasExactKeys(value, ["type", "disposition", "reason"])) return { valid: false, error: "Research-review mutation has an invalid shape." };
      if (!isEnumValue(DAKOTA_RESEARCH_DISPOSITIONS, value.disposition) || value.disposition === "unreviewed") return { valid: false, error: "Research-review disposition is invalid." };
      if (!isSafeText(value.reason, 1_000)) return { valid: false, error: "Research-review reason is invalid." };
      return { valid: true, value: value as unknown as DakotaRevenueBridgeOperatorMutation };
    case "review_evidence":
      if (!hasExactKeys(value, ["type", "evidence_id", "decision", "reason"])) return { valid: false, error: "Evidence-review mutation has an invalid shape." };
      if (!isIdentifier(value.evidence_id) || !["confirmed", "rejected"].includes(value.decision as string) || !isSafeText(value.reason, 1_000)) return { valid: false, error: "Evidence-review mutation is invalid." };
      return { valid: true, value: value as unknown as DakotaRevenueBridgeOperatorMutation };
    case "review_external_event":
      if (!hasExactKeys(value, ["type", "event_id", "decision", "reason"])) return { valid: false, error: "External-event review mutation has an invalid shape." };
      if (!isIdentifier(value.event_id) || !["confirmed", "rejected"].includes(value.decision as string) || !isSafeText(value.reason, 1_000)) return { valid: false, error: "External-event review mutation is invalid." };
      return { valid: true, value: value as unknown as DakotaRevenueBridgeOperatorMutation };
    case "select_offer":
      if (!hasExactKeys(value, ["type", "offer_code", "price_band", "rationale"])) return { valid: false, error: "Offer-selection mutation has an invalid shape." };
      if (!isEnumValue(DAKOTA_PRIVATE_OFFER_CODES, value.offer_code) || !isEnumValue(DAKOTA_PRIVATE_PRICE_BANDS, value.price_band) || !isCompatiblePrivateOffer(value.offer_code, value.price_band) || !isSafeText(value.rationale, 1_000)) return { valid: false, error: "Offer-selection mutation is invalid." };
      return { valid: true, value: value as unknown as DakotaRevenueBridgeOperatorMutation };
    case "acknowledge_alert":
    case "resolve_alert":
      if (!hasExactKeys(value, ["type", "alert_id", "note"])) return { valid: false, error: "Alert-review mutation has an invalid shape." };
      if (!isIdentifier(value.alert_id) || !isSafeText(value.note, 1_000)) return { valid: false, error: "Alert-review mutation is invalid." };
      return { valid: true, value: value as unknown as DakotaRevenueBridgeOperatorMutation };
    default:
      return { valid: false, error: "Revenue Bridge mutation type is invalid." };
  }
}

export function validateDakotaRevenueBridgePutPayload(
  value: unknown,
): ValidationResult<DakotaRevenueBridgePutPayload> {
  if (!isRecord(value) || !hasExactKeys(value, ["candidate_key", "expected_updated_at", "mutation"])) {
    return { valid: false, error: "Revenue Bridge request has an invalid shape." };
  }
  if (!isDakotaCandidateKey(value.candidate_key)) return { valid: false, error: "candidate_key is invalid." };
  if (value.expected_updated_at !== null && !isRevenueBridgeTimestamp(value.expected_updated_at)) {
    return { valid: false, error: "expected_updated_at must be null or an ISO timestamp." };
  }
  const mutation = validateOperatorMutation(value.mutation);
  if (!mutation.valid) return mutation;
  return {
    valid: true,
    value: {
      candidate_key: value.candidate_key,
      expected_updated_at: value.expected_updated_at as string | null,
      mutation: mutation.value,
    },
  };
}

export function createEmptyDakotaRevenueBridgeRecord(updatedAt: string): DakotaRevenueBridgeRecord {
  if (!isRevenueBridgeTimestamp(updatedAt)) throw new TypeError("Revenue Bridge updatedAt must be an ISO timestamp.");
  return {
    research_review: { disposition: "unreviewed", reason: "", reviewed_at: null },
    evidence: [],
    external_events: [],
    website_audit: null,
    selected_offer: null,
    alerts: [],
    archive: null,
    updated_at: updatedAt,
  };
}

export function createDakotaRevenueBridgeEnvelope(
  records: Record<string, DakotaRevenueBridgeRecord>,
  providers: Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>>,
  updatedAt: string,
): DakotaRevenueBridgeEnvelope {
  const candidate: DakotaRevenueBridgeEnvelope = {
    schema_version: DAKOTA_REVENUE_BRIDGE_SCHEMA,
    updated_at: updatedAt,
    records,
    providers,
  };
  const validation = validateDakotaRevenueBridgeEnvelope(candidate);
  if (!validation.valid) throw new TypeError(validation.error);
  return validation.value;
}

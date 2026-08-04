export interface Candidate {
  rank: number;
  score: number;
  business_name: string;
  dba: string;
  source: string;
  source_id: string;
  filed_at: string;
  category: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  county_or_borough: string;
  verified_url: string;
  domain_status: string;
  psi_status: string;
  psi_mobile_performance: number | null;
  missing_pieces: string;
  diagnosis: string;
  score_version: string;
  score_reasons: string;
}

export interface QueueEnvelope {
  schema_version: "dakota.queue.v1";
  generated_at: string;
  published_at?: string;
  records: Candidate[];
}

export const OPERATOR_STATUSES = [
  "early_signal",
  "research_ready",
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
  "lost",
  "snoozed",
  "not_fit",
  "do_not_contact",
] as const;

export type OperatorStatus = (typeof OPERATOR_STATUSES)[number];

export interface OperatorIdentity {
  businessName: string;
  dba?: string;
  category?: string;
  city?: string;
  borough?: string;
  source: string;
  sourceId: string;
  verifiedUrl?: string;
  publicSourceUrl?: string;
}

export interface OperatorRecordInput {
  identity: OperatorIdentity;
  contacts: DakotaVerifiedContact[];
  selectedContactId: string | null;
  activities: DakotaActivity[];
  tasks: DakotaTask[];
  commercialClose: DakotaCommercialClose;
  status: OperatorStatus;
  notes: string;
  verifiedPain: string;
  offerFit: string;
  nextAction: string;
  dueDate: string;
  estimatedValue: number | null;
  actualRevenue: number | null;
  winLossReason: string;
  proof: string;
  draft: string;
}

export interface OperatorMilestones {
  humanApprovedAt: string | null;
  firstContactedAt: string | null;
  repliedAt: string | null;
  meetingAt: string | null;
  proposalAt: string | null;
  wonAt: string | null;
  lostAt: string | null;
  paidAt: string | null;
}

export const CONTACT_CHANNELS = ["email", "phone", "sms", "website_form", "linkedin"] as const;
export type DakotaContactChannel = (typeof CONTACT_CHANNELS)[number];

export const CONSENT_CLASSIFICATIONS = [
  "unknown",
  "explicit_inquiry",
  "existing_relationship",
  "public_business",
  "do_not_contact",
] as const;
export type DakotaConsentClassification = (typeof CONSENT_CLASSIFICATIONS)[number];

export interface DakotaVerifiedContact {
  contactId: string;
  name: string;
  role: string;
  channel: DakotaContactChannel;
  value: string;
  sourceUrl: string;
  verifiedAt: string;
  consentClassification: DakotaConsentClassification;
}

export const ACTIVITY_CHANNELS = [
  "internal",
  "email",
  "phone",
  "sms",
  "website_form",
  "linkedin",
  "meeting",
  "proposal",
  "contract",
  "invoice",
  "payment",
] as const;
export type DakotaActivityChannel = (typeof ACTIVITY_CHANNELS)[number];

export const ACTIVITY_TYPES = [
  "note",
  "outreach",
  "reply",
  "call",
  "meeting",
  "proposal_sent",
  "contract_signed",
  "invoice_sent",
  "payment_received",
  "follow_up",
] as const;
export type DakotaActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_OUTCOMES = [
  "recorded",
  "sent",
  "delivered",
  "replied",
  "connected",
  "voicemail",
  "scheduled",
  "completed",
  "declined",
  "won",
  "lost",
  "paid",
  "no_response",
] as const;
export type DakotaActivityOutcome = (typeof ACTIVITY_OUTCOMES)[number];

export interface DakotaActivity {
  activityId: string;
  taskId: string | null;
  contactId: string | null;
  channel: DakotaActivityChannel;
  type: DakotaActivityType;
  outcome: DakotaActivityOutcome;
  note: string;
  occurredAt: string;
  followUpAt: string | null;
}

export const TASK_TYPES = [
  "research",
  "qualify",
  "value_brief",
  "outreach",
  "follow_up",
  "meeting",
  "proposal",
  "invoice",
  "payment",
  "onboarding",
] as const;
export type DakotaTaskType = (typeof TASK_TYPES)[number];

export const TASK_STATUSES = ["open", "completed", "skipped"] as const;
export type DakotaTaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_CHANNELS = [
  "internal",
  "email",
  "phone",
  "sms",
  "meeting",
  "proposal",
  "invoice",
  "payment",
] as const;
export type DakotaTaskChannel = (typeof TASK_CHANNELS)[number];

export interface DakotaTask {
  taskId: string;
  type: DakotaTaskType;
  status: DakotaTaskStatus;
  title: string;
  dueAt: string | null;
  contactId: string | null;
  channel: DakotaTaskChannel;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNote: string;
}

export interface DakotaCommercialClose {
  proposalRef: string;
  proposalAmount: number | null;
  proposalSentDate: string;
  signedDate: string;
  invoiceRef: string;
  amountDue: number | null;
  amountPaid: number | null;
  paidDate: string;
  balance: number | null;
  onboardingNextAction: string;
}

export interface OperatorRecord extends OperatorRecordInput {
  /** Optional only for a legacy snapshot returned during an atomic deploy transition. */
  milestones?: OperatorMilestones;
  updated_at: string;
}

export interface OperatorStateEnvelope {
  schema_version: "dakota.operator-state.v3";
  updated_at: string | null;
  records: Record<string, OperatorRecord>;
}

export interface OperatorStateSaveResponse {
  schema_version: "dakota.operator-state.v3";
  updated_at: string;
  candidate_key: string;
  record: OperatorRecord;
}

export type SessionState =
  | { status: "loading" }
  | { status: "anonymous"; message?: string }
  | { status: "denied"; message: string }
  | { status: "authorized"; email: string };

export type QueueState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; queue: QueueEnvelope }
  | { status: "empty" }
  | { status: "error"; message: string };

export type OperatorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; envelope: OperatorStateEnvelope }
  | { status: "error"; message: string };

export type DakotaResearchDisposition =
  | "unreviewed"
  | "pursue"
  | "hold"
  | "needs_evidence"
  | "blocked"
  | "duplicate"
  | "not_fit"
  | "do_not_contact";

export type DakotaRevenueProvider =
  | "dakota_engine"
  | "manual_research"
  | "netlify_forms"
  | "website_audit"
  | "gmail"
  | "google_calendar"
  | "google_voice"
  | "google_business_profile"
  | "google_places"
  | "yelp"
  | "proposal"
  | "e_sign"
  | "invoicing"
  | "payments"
  | "crm";

export type DakotaEvidenceReviewState = "suggested" | "confirmed" | "rejected";
export type DakotaExternalEventReviewState = "needs_review" | "confirmed" | "rejected";
export type DakotaProviderHealthState = "unknown" | "healthy" | "degraded" | "blocked" | "disabled";
export type DakotaRevenueAlertStatus = "open" | "acknowledged" | "resolved";

export interface DakotaResearchReview {
  disposition: DakotaResearchDisposition;
  reason: string;
  reviewed_at: string | null;
}

export interface DakotaRevenueEvidence {
  evidence_id: string;
  provider: DakotaRevenueProvider;
  kind: string;
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
  kind: string;
  summary: string;
  external_ref: string;
  occurred_at: string;
  received_at: string;
  review_state: DakotaExternalEventReviewState;
  reviewed_at: string | null;
  review_reason: string;
}

export interface DakotaWebsiteAuditIntelligence {
  report_id: string;
  domain: string;
  report_url: string | null;
  status: "unknown" | "requested" | "generated" | "failed";
  status_updated_at: string;
  requested_at: string | null;
  generated_at: string | null;
  failed_at: string | null;
  failure_reason: string;
  measurement_state: "complete" | "partial" | "unavailable";
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    best_practices: number | null;
  };
  overall_score: number | null;
  grade: "A" | "B" | "C" | "D" | "F" | null;
  summary: string;
  findings: Array<{
    finding_id: string;
    area: string;
    severity: "low" | "medium" | "high";
    summary: string;
  }>;
  email_delivery: {
    status: "unknown" | "pending" | "not_configured" | "sent" | "failed";
    sent_at: string | null;
    failed_at: string | null;
    failure_reason: string;
    updated_at: string | null;
  };
  engagement: {
    first_view_at: string | null;
    last_view_at: string | null;
    total_views: number;
    max_scroll_depth: number;
    max_time_on_page_seconds: number;
    updated_at: string | null;
  };
  reconciled_at: string;
}

export interface DakotaPrivateOfferSelection {
  offer_code: string;
  price_band: string;
  rationale: string;
  selected_at: string;
}

export interface DakotaRevenueAlert {
  alert_id: string;
  provider: DakotaRevenueProvider;
  kind: string;
  severity: "info" | "warning" | "critical";
  message: string;
  created_at: string;
  status: DakotaRevenueAlertStatus;
  acknowledged_at: string | null;
  resolved_at: string | null;
  resolution_note: string;
}

export interface DakotaRevenueBridgeRecord {
  research_review: DakotaResearchReview;
  evidence: DakotaRevenueEvidence[];
  external_events: DakotaExternalNeedsReviewEvent[];
  website_audit: DakotaWebsiteAuditIntelligence | null;
  selected_offer: DakotaPrivateOfferSelection | null;
  alerts: DakotaRevenueAlert[];
  archive: {
    archived_at: string;
    reason: string;
    retention_until: string | null;
    source: "operator" | "retention" | "connector";
  } | null;
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
  schema_version: "dakota.revenue-bridge.v1";
  updated_at: string | null;
  records: Record<string, DakotaRevenueBridgeRecord>;
  providers: Partial<Record<DakotaRevenueProvider, DakotaRevenueProviderState>>;
}

export type DakotaRevenueBridgeMutation =
  | { type: "review_research"; disposition: Exclude<DakotaResearchDisposition, "unreviewed">; reason: string }
  | { type: "review_evidence"; evidence_id: string; decision: "confirmed" | "rejected"; reason: string }
  | { type: "review_external_event"; event_id: string; decision: "confirmed" | "rejected"; reason: string }
  | { type: "select_offer"; offer_code: string; price_band: string; rationale: string }
  | { type: "acknowledge_alert"; alert_id: string; note: string }
  | { type: "resolve_alert"; alert_id: string; note: string };

export interface DakotaRevenueBridgeSaveResponse {
  schema_version: "dakota.revenue-bridge.v1";
  outcome: "stored" | "unchanged";
  updated_at: string;
  candidate_key: string;
  record: DakotaRevenueBridgeRecord;
}

export type RevenueBridgeState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; envelope: DakotaRevenueBridgeEnvelope }
  | { status: "error"; message: string };

export interface DakotaPrivateOffer {
  offerId: string;
  bridgeOfferCode: string;
  bridgePriceBand: string;
  catalogVersion: string;
  name: string;
  shortName: string;
  audience: "storefront" | "agency" | "any";
  pricingModel: "custom" | "fixed" | "range" | "retainer";
  minAmount: number | null;
  maxAmount: number | null;
  cadence: "one_time" | "monthly" | null;
  scopeSummary: string;
  proofPrompts: string[];
  stagePlaybook: string[];
  active: boolean;
}

export interface DakotaOfferCatalogEnvelope {
  schema_version: "dakota.offer-catalog.v1";
  catalog_version: string;
  offers: DakotaPrivateOffer[];
}

export type OfferCatalogState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; envelope: DakotaOfferCatalogEnvelope }
  | { status: "error"; message: string };

export interface DakotaArchivePreview {
  schema_version: "dakota.archive-preview.v1";
  activeCount: number;
  capacity: number;
  eligible: Array<{
    candidateKey: string;
    businessName: string;
    status: OperatorStatus;
    updatedAt: string;
  }>;
  archiveCount: number;
  recoverable: Array<{
    archiveId: string;
    candidateKey: string;
    businessName: string;
    status: OperatorStatus;
    archivedAt: string;
    transactionStatus: "copied" | "removed_from_active";
  }>;
}

export type ArchiveState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; preview: DakotaArchivePreview }
  | { status: "error"; message: string };

export interface DakotaIngressReceiptSummary {
  receipt_id: string;
  candidate_key: string;
  source: string;
  received_at: string;
  updated_at: string;
  attempts: number;
  status: "pending" | "stored" | "duplicate" | "capacity" | "conflict" | "failed";
  next_retry_at: string | null;
  last_error_code: string | null;
}

export interface DakotaIngressRedriveResponse {
  schema_version: "dakota.ingress-redrive.v1";
  outcome: "redriven" | "already_queued" | "already_completed";
  receipt_id: string;
  candidate_key: string;
  status: DakotaIngressReceiptSummary["status"];
  attempts: number;
  next_retry_at: string | null;
}

export interface DakotaOperationsEnvelope {
  schema_version: "dakota.operations.v1";
  checked_at: string;
  ingress: {
    checked_at: string;
    total: number;
    stored: number;
    pending: number;
    failed: number;
    invalid: number;
    oldest_pending_at: string | null;
    receipts: DakotaIngressReceiptSummary[];
  };
  operator_alerts: {
    checked_at: string;
    total: number;
    sent: number;
    pending: number;
    failed: number;
    not_configured: number;
    invalid: number;
    oldest_pending_at: string | null;
    alerts: Array<{
      alert_id: string;
      receipt_id: string;
      kind: "received" | "pending" | "failed";
      source: string;
      created_at: string;
      updated_at: string;
      status: "reserved" | "sent" | "not_configured" | "failed";
      attempts: number;
      next_retry_at: string | null;
      failure_reason: "oauth" | "provider" | "transport" | null;
    }>;
  };
  website_audit_outbox: {
    checked_at: string;
    total: number;
    pending: number;
    failed: number;
    invalid: number;
    oldest_pending_at: string | null;
    capacity: {
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
    };
    entries: Array<{
      entry_id: string;
      candidate_key: string;
      patch_type: "requested" | "generated" | "failed" | "delivery" | "engagement";
      fact_at: string;
      created_at: string;
      updated_at: string;
      attempts: number;
      status: "pending" | "failed";
      next_retry_at: string | null;
      last_error_code: "storage_unavailable" | "capacity" | "conflict" | "version_conflict" | "not_found" | "invalid_transition" | "dead_letter_capacity" | null;
      failed_at: string | null;
      surfaced_at: string | null;
      retention_until: string | null;
      can_redrive: boolean;
      can_acknowledge: boolean;
    }>;
  };
}

export type OperationsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; envelope: DakotaOperationsEnvelope }
  | { status: "error"; message: string };

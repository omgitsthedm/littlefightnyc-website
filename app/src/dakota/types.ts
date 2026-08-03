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

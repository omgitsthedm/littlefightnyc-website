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
  repliedAt: string | null;
  meetingAt: string | null;
  proposalAt: string | null;
  wonAt: string | null;
}

export interface OperatorRecord extends OperatorRecordInput {
  /** Optional only for a legacy snapshot returned during an atomic deploy transition. */
  milestones?: OperatorMilestones;
  updated_at: string;
}

export interface OperatorStateEnvelope {
  schema_version: "dakota.operator-state.v1";
  updated_at: string | null;
  records: Record<string, OperatorRecord>;
}

export interface OperatorStateSaveResponse {
  schema_version: "dakota.operator-state.v1";
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

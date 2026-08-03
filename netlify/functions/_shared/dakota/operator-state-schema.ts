export const DAKOTA_OPERATOR_STATE_SCHEMA_V1 = "dakota.operator-state.v1" as const;
export const DAKOTA_OPERATOR_STATE_SCHEMA_V2 = "dakota.operator-state.v2" as const;
export const DAKOTA_OPERATOR_STATE_SCHEMA = "dakota.operator-state.v3" as const;

export const DAKOTA_OPERATOR_STATUSES = [
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

export type DakotaOperatorStatus = (typeof DAKOTA_OPERATOR_STATUSES)[number];

export const DAKOTA_OPERATOR_RECORD_LIMIT = 500;
// PUT replaces one bounded record, including its append-only activity history.
// Keep enough room for the declared 100-event cap while staying far below the
// platform request limit and the aggregate two-megabyte state cap.
export const DAKOTA_OPERATOR_REQUEST_MAX_BYTES = 256 * 1024;
export const DAKOTA_OPERATOR_STATE_MAX_BYTES = 2 * 1024 * 1024;

const DAKOTA_OPERATOR_V1_INPUT_FIELDS = [
  "identity",
  "status",
  "notes",
  "verifiedPain",
  "offerFit",
  "nextAction",
  "dueDate",
  "estimatedValue",
  "actualRevenue",
  "winLossReason",
  "proof",
  "draft",
] as const;

const DAKOTA_OPERATOR_V2_INPUT_FIELDS = [
  ...DAKOTA_OPERATOR_V1_INPUT_FIELDS,
  "contacts",
  "activities",
  "commercialClose",
] as const;

export const DAKOTA_OPERATOR_INPUT_FIELDS = [
  ...DAKOTA_OPERATOR_V2_INPUT_FIELDS,
  "selectedContactId",
  "tasks",
] as const;

const DAKOTA_OPERATOR_V1_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_V1_INPUT_FIELDS,
  "updated_at",
] as const;

const DAKOTA_OPERATOR_V1_MILESTONE_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_V1_INPUT_FIELDS,
  "milestones",
  "updated_at",
] as const;

const DAKOTA_OPERATOR_V2_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_V2_INPUT_FIELDS,
  "milestones",
  "updated_at",
] as const;

const DAKOTA_OPERATOR_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_INPUT_FIELDS,
  "milestones",
  "updated_at",
] as const;

export const DAKOTA_OPERATOR_MILESTONE_FIELDS = [
  "humanApprovedAt",
  "firstContactedAt",
  "repliedAt",
  "meetingAt",
  "proposalAt",
  "wonAt",
  "lostAt",
  "paidAt",
] as const;

const DAKOTA_OPERATOR_V1_MILESTONE_FIELDS = [
  "humanApprovedAt",
  "repliedAt",
  "meetingAt",
  "proposalAt",
  "wonAt",
] as const;

export const DAKOTA_CONTACT_CHANNELS = ["email", "phone", "sms", "website_form", "linkedin"] as const;
export type DakotaContactChannel = (typeof DAKOTA_CONTACT_CHANNELS)[number];
export const DAKOTA_CONSENT_CLASSIFICATIONS = [
  "unknown",
  "explicit_inquiry",
  "existing_relationship",
  "public_business",
  "do_not_contact",
] as const;
export type DakotaConsentClassification = (typeof DAKOTA_CONSENT_CLASSIFICATIONS)[number];

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

export const DAKOTA_ACTIVITY_CHANNELS = [
  "internal", "email", "phone", "sms", "website_form", "linkedin",
  "meeting", "proposal", "contract", "invoice", "payment",
] as const;
export type DakotaActivityChannel = (typeof DAKOTA_ACTIVITY_CHANNELS)[number];
export const DAKOTA_ACTIVITY_TYPES = [
  "note", "outreach", "reply", "call", "meeting", "proposal_sent",
  "contract_signed", "invoice_sent", "payment_received", "follow_up",
] as const;
export type DakotaActivityType = (typeof DAKOTA_ACTIVITY_TYPES)[number];
export const DAKOTA_ACTIVITY_OUTCOMES = [
  "recorded", "sent", "delivered", "replied", "connected", "voicemail",
  "scheduled", "completed", "declined", "won", "lost", "paid", "no_response",
] as const;
export type DakotaActivityOutcome = (typeof DAKOTA_ACTIVITY_OUTCOMES)[number];

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

export const DAKOTA_ACTIVITY_COMPATIBILITY: Record<
  DakotaActivityType,
  Partial<Record<DakotaActivityChannel, readonly DakotaActivityOutcome[]>>
> = {
  note: { internal: ["recorded"] },
  outreach: {
    email: ["sent", "delivered", "no_response"],
    phone: ["sent", "connected", "voicemail", "no_response"],
    sms: ["sent", "delivered", "no_response"],
    website_form: ["sent", "delivered", "no_response"],
    linkedin: ["sent", "delivered", "no_response"],
  },
  reply: {
    email: ["replied", "completed", "declined"],
    phone: ["replied", "connected", "completed", "declined"],
    sms: ["replied", "completed", "declined"],
    website_form: ["replied", "completed", "declined"],
    linkedin: ["replied", "completed", "declined"],
  },
  call: { phone: ["connected", "voicemail", "completed", "declined", "no_response"] },
  meeting: { meeting: ["scheduled", "completed", "declined", "no_response"] },
  proposal_sent: { proposal: ["sent", "delivered", "completed", "declined", "no_response"] },
  contract_signed: { contract: ["completed", "won"] },
  invoice_sent: { invoice: ["sent", "delivered", "completed", "no_response"] },
  payment_received: { payment: ["paid"] },
  follow_up: {
    internal: ["recorded", "scheduled", "completed"],
    email: ["sent", "delivered", "completed", "no_response"],
    phone: ["connected", "voicemail", "completed", "no_response"],
    sms: ["sent", "delivered", "completed", "no_response"],
  },
};

export const DAKOTA_TASK_TYPES = [
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
export type DakotaTaskType = (typeof DAKOTA_TASK_TYPES)[number];

export const DAKOTA_TASK_STATUSES = ["open", "completed", "skipped"] as const;
export type DakotaTaskStatus = (typeof DAKOTA_TASK_STATUSES)[number];

export const DAKOTA_TASK_CHANNELS = [
  "internal",
  "email",
  "phone",
  "sms",
  "meeting",
  "proposal",
  "invoice",
  "payment",
] as const;
export type DakotaTaskChannel = (typeof DAKOTA_TASK_CHANNELS)[number];

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

export const DAKOTA_TASK_CHANNEL_COMPATIBILITY: Record<
  DakotaTaskType,
  readonly DakotaTaskChannel[]
> = {
  research: ["internal"],
  qualify: ["internal"],
  value_brief: ["internal"],
  outreach: ["email", "phone", "sms"],
  follow_up: ["internal", "email", "phone", "sms"],
  meeting: ["meeting"],
  proposal: ["proposal"],
  invoice: ["invoice"],
  payment: ["payment"],
  onboarding: ["internal"],
};

const DAKOTA_ACTIVITY_TASK_TYPE_COMPATIBILITY: Record<
  Exclude<DakotaActivityType, "note">,
  readonly DakotaTaskType[]
> = {
  outreach: ["outreach"],
  reply: ["outreach", "follow_up"],
  call: ["outreach", "follow_up"],
  meeting: ["meeting"],
  proposal_sent: ["proposal"],
  contract_signed: ["proposal"],
  invoice_sent: ["invoice"],
  payment_received: ["payment"],
  follow_up: ["follow_up"],
};

const DAKOTA_ACTIVITY_TASK_TIMESTAMP_SKEW_MS = 5 * 60_000;

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

type DakotaOperatorMilestoneField = (typeof DAKOTA_OPERATOR_MILESTONE_FIELDS)[number];

const DAKOTA_OPERATOR_TEXT_LIMITS = {
  notes: 4_000,
  verifiedPain: 2_000,
  offerFit: 1_000,
  nextAction: 1_000,
  winLossReason: 1_000,
  proof: 4_000,
  draft: 6_000,
} as const;

type DakotaOperatorTextField = keyof typeof DAKOTA_OPERATOR_TEXT_LIMITS;

const STATUS_SET = new Set<string>(DAKOTA_OPERATOR_STATUSES);
const CONTACT_CHANNEL_SET = new Set<string>(DAKOTA_CONTACT_CHANNELS);
const CONSENT_CLASSIFICATION_SET = new Set<string>(DAKOTA_CONSENT_CLASSIFICATIONS);
const ACTIVITY_CHANNEL_SET = new Set<string>(DAKOTA_ACTIVITY_CHANNELS);
const ACTIVITY_TYPE_SET = new Set<string>(DAKOTA_ACTIVITY_TYPES);
const ACTIVITY_OUTCOME_SET = new Set<string>(DAKOTA_ACTIVITY_OUTCOMES);
const TASK_TYPE_SET = new Set<string>(DAKOTA_TASK_TYPES);
const TASK_STATUS_SET = new Set<string>(DAKOTA_TASK_STATUSES);
const TASK_CHANNEL_SET = new Set<string>(DAKOTA_TASK_CHANNELS);
const HUMAN_APPROVED_STATUS_SET = new Set<string>([
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
]);
const CONTACTED_STATUS_SET = new Set<string>([
  "pursuing", "replied", "meeting", "proposal", "won", "paid",
]);
const OPEN_TASK_REQUIRED_STATUS_SET = new Set<DakotaOperatorStatus>([
  "research_ready",
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "paid",
  "snoozed",
]);
const STATUS_MILESTONE_FIELD: Partial<Record<DakotaOperatorStatus, DakotaOperatorMilestoneField>> = {
  replied: "repliedAt",
  meeting: "meetingAt",
  proposal: "proposalAt",
  won: "wonAt",
  lost: "lostAt",
  paid: "paidAt",
};
const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_LIKE_CONTENT = /(?:[<>]|<!--|--!?>|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;
const URL_LIKE_CONTENT = /(?:\b(?:https?|ftp|file|data|javascript|mailto):|:\/\/|\bwww\.)/iu;
const FEED_CANDIDATE_KEY = /^[a-z0-9][a-z0-9._-]{0,79}:[a-z0-9][a-z0-9._:-]{0,158}$/u;
const MANUAL_CANDIDATE_KEY = /^manual:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
export const DAKOTA_CONTACT_LIMIT = 8;
export const DAKOTA_ACTIVITY_LIMIT = 100;
export const DAKOTA_TASK_LIMIT = 100;

const DAKOTA_IDENTITY_FIELDS = [
  "businessName",
  "dba",
  "category",
  "city",
  "borough",
  "source",
  "sourceId",
  "verifiedUrl",
  "publicSourceUrl",
] as const;

const DAKOTA_IDENTITY_LIMITS = {
  businessName: 240,
  dba: 240,
  category: 160,
  city: 160,
  borough: 160,
  source: 80,
  sourceId: 200,
} as const;

type DakotaIdentityTextField = keyof typeof DAKOTA_IDENTITY_LIMITS;

export interface DakotaOperatorIdentity {
  businessName: string;
  dba?: string;
  category?: string;
  city?: string;
  borough?: string;
  source?: string;
  sourceId?: string;
  verifiedUrl?: string;
  publicSourceUrl?: string;
}

export interface DakotaOperatorRecordInput {
  identity: DakotaOperatorIdentity;
  status: DakotaOperatorStatus;
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
  contacts: DakotaVerifiedContact[];
  activities: DakotaActivity[];
  commercialClose: DakotaCommercialClose;
  selectedContactId: string | null;
  tasks: DakotaTask[];
}

export type DakotaOperatorMilestones = Record<DakotaOperatorMilestoneField, string | null>;

export interface DakotaOperatorRecord extends DakotaOperatorRecordInput {
  milestones: DakotaOperatorMilestones;
  updated_at: string;
}

export interface DakotaOperatorStateEnvelope {
  schema_version: typeof DAKOTA_OPERATOR_STATE_SCHEMA;
  updated_at: string;
  records: Record<string, DakotaOperatorRecord>;
}

export interface DakotaOperatorPutPayload {
  candidate_key: string;
  expected_updated_at: string | null;
  record: DakotaOperatorRecordInput;
}

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value);
  return keys.length === expected.length && expected.every((key) => Object.hasOwn(value, key));
}

function isPlainText(value: unknown, maximumLength: number): value is string {
  return (
    typeof value === "string" &&
    value.length <= maximumLength &&
    !FORBIDDEN_CONTROL_CHARACTERS.test(value) &&
    !HTML_LIKE_CONTENT.test(value) &&
    !URL_LIKE_CONTENT.test(value)
  );
}

function isSafePublicUrl(value: unknown): value is string {
  if (value === "") return true;
  if (
    typeof value !== "string" ||
    value.length > 2_048 ||
    value !== value.trim() ||
    /[\s<>]/u.test(value) ||
    FORBIDDEN_CONTROL_CHARACTERS.test(value)
  ) {
    return false;
  }
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "").replace(/\.$/u, "");
    const isIpLiteral = /^(?:\d{1,3}\.){3}\d{1,3}$/u.test(hostname) || hostname.includes(":");
    const blockedHost =
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".test") ||
      hostname.endsWith(".invalid") ||
      hostname.endsWith(".example");
    const standardPort =
      url.port === "" ||
      (url.protocol === "https:" && url.port === "443");
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      hostname.includes(".") &&
      !isIpLiteral &&
      !blockedHost &&
      standardPort
    );
  } catch {
    return false;
  }
}

function validateIdentity(value: unknown): ValidationResult<DakotaOperatorIdentity> {
  if (!isRecord(value)) {
    return { valid: false, error: "Operator identity must be an object." };
  }
  const keys = Object.keys(value);
  if (
    !Object.hasOwn(value, "businessName") ||
    keys.some((key) => !DAKOTA_IDENTITY_FIELDS.includes(key as (typeof DAKOTA_IDENTITY_FIELDS)[number]))
  ) {
    return { valid: false, error: "Operator identity has an invalid shape." };
  }

  for (const field of Object.keys(DAKOTA_IDENTITY_LIMITS) as DakotaIdentityTextField[]) {
    if (!Object.hasOwn(value, field)) continue;
    const fieldValue = value[field];
    if (
      !isPlainText(fieldValue, DAKOTA_IDENTITY_LIMITS[field]) ||
      fieldValue !== fieldValue.trim() ||
      (field === "businessName" && fieldValue.length === 0)
    ) {
      return { valid: false, error: `Operator identity ${field} is invalid.` };
    }
  }

  for (const field of ["verifiedUrl", "publicSourceUrl"] as const) {
    if (Object.hasOwn(value, field) && !isSafePublicUrl(value[field])) {
      return { valid: false, error: `Operator identity ${field} is not a safe public HTTPS URL.` };
    }
  }
  return { valid: true, value: value as unknown as DakotaOperatorIdentity };
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;
  if (!/(?:Z|[+-]\d{2}:\d{2})$/u.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function emptyMilestones(): DakotaOperatorMilestones {
  return {
    humanApprovedAt: null,
    firstContactedAt: null,
    repliedAt: null,
    meetingAt: null,
    proposalAt: null,
    wonAt: null,
    lostAt: null,
    paidAt: null,
  };
}

function legacyMilestones(
  status: DakotaOperatorStatus,
  updatedAt: string,
): DakotaOperatorMilestones {
  const milestones = emptyMilestones();
  if (HUMAN_APPROVED_STATUS_SET.has(status)) milestones.humanApprovedAt = updatedAt;
  if (CONTACTED_STATUS_SET.has(status)) milestones.firstContactedAt = updatedAt;
  const milestoneField = STATUS_MILESTONE_FIELD[status];
  if (milestoneField) milestones[milestoneField] = updatedAt;
  return milestones;
}

function validateMilestones(value: unknown): ValidationResult<DakotaOperatorMilestones> {
  if (!isRecord(value) || !hasExactKeys(value, DAKOTA_OPERATOR_MILESTONE_FIELDS)) {
    return { valid: false, error: "Operator record milestones have an invalid shape." };
  }
  for (const field of DAKOTA_OPERATOR_MILESTONE_FIELDS) {
    if (value[field] !== null && !isIsoTimestamp(value[field])) {
      return { valid: false, error: `Operator record milestone ${field} is invalid.` };
    }
  }
  return { valid: true, value: value as unknown as DakotaOperatorMilestones };
}

function isDateOnly(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string") return false;
  const match = DATE_ONLY.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isMoney(value: unknown): value is number | null {
  if (value === null) return true;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 100_000_000) {
    return false;
  }
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-7;
}

export function createEmptyDakotaCommercialClose(
  amountPaid: number | null = null,
): DakotaCommercialClose {
  return {
    proposalRef: "",
    proposalAmount: null,
    proposalSentDate: "",
    signedDate: "",
    invoiceRef: "",
    amountDue: null,
    amountPaid,
    paidDate: "",
    balance: 0,
    onboardingNextAction: "",
  };
}

function validateContact(value: unknown): ValidationResult<DakotaVerifiedContact> {
  const fields = [
    "contactId", "name", "role", "channel", "value", "sourceUrl", "verifiedAt",
    "consentClassification",
  ] as const;
  if (!isRecord(value) || !hasExactKeys(value, fields)) {
    return { valid: false, error: "Verified contact has an invalid shape." };
  }
  if (typeof value.contactId !== "string" || !UUID.test(value.contactId)) {
    return { valid: false, error: "Verified contact contactId must be a lowercase UUID." };
  }
  for (const field of ["name", "role"] as const) {
    if (!isPlainText(value[field], 160) || value[field] !== value[field].trim()) {
      return { valid: false, error: `Verified contact ${field} must be bounded plain text.` };
    }
  }
  if (!(value.name as string).trim() && !(value.role as string).trim()) {
    return { valid: false, error: "Verified contact requires a name or role." };
  }
  if (typeof value.channel !== "string" || !CONTACT_CHANNEL_SET.has(value.channel)) {
    return { valid: false, error: "Verified contact channel is unsupported." };
  }
  if (
    typeof value.consentClassification !== "string" ||
    !CONSENT_CLASSIFICATION_SET.has(value.consentClassification)
  ) {
    return { valid: false, error: "Verified contact consent classification is unsupported." };
  }
  if (!isSafePublicUrl(value.sourceUrl) || value.sourceUrl === "") {
    return { valid: false, error: "Verified contact sourceUrl must be a safe public HTTPS URL." };
  }
  if (!isDateOnly(value.verifiedAt) || value.verifiedAt === "") {
    return { valid: false, error: "Verified contact verifiedAt must be a YYYY-MM-DD date." };
  }

  const channel = value.channel as DakotaContactChannel;
  if (channel === "email") {
    if (
      typeof value.value !== "string" || value.value.length > 254 ||
      value.value !== value.value.trim() || !isPlainText(value.value, 254) || !EMAIL.test(value.value)
    ) {
      return { valid: false, error: "Verified email contact value is invalid." };
    }
  } else if (channel === "phone" || channel === "sms") {
    if (
      typeof value.value !== "string" || value.value.length > 40 ||
      value.value !== value.value.trim() || !isPlainText(value.value, 40) ||
      !/^\+?[0-9().\-\s]{7,32}(?:(?:x|ext\.?)\s*\d{1,8})?$/iu.test(value.value)
    ) {
      return { valid: false, error: "Verified phone contact value is invalid." };
    }
    const digits = value.value.replace(/\D/gu, "");
    if (digits.length < 7 || digits.length > 20) {
      return { valid: false, error: "Verified phone contact value is invalid." };
    }
  } else {
    if (!isSafePublicUrl(value.value) || value.value === "") {
      return { valid: false, error: "Verified web contact value must be a safe public HTTPS URL." };
    }
    if (channel === "linkedin") {
      const hostname = new URL(value.value).hostname.toLowerCase();
      if (hostname !== "linkedin.com" && !hostname.endsWith(".linkedin.com")) {
        return { valid: false, error: "Verified LinkedIn contact must use linkedin.com." };
      }
    }
  }
  return { valid: true, value: value as unknown as DakotaVerifiedContact };
}

function validateContacts(value: unknown): ValidationResult<DakotaVerifiedContact[]> {
  if (!Array.isArray(value) || value.length > DAKOTA_CONTACT_LIMIT) {
    return { valid: false, error: "Verified contacts must be a bounded array." };
  }
  const contacts: DakotaVerifiedContact[] = [];
  const ids = new Set<string>();
  for (const candidate of value) {
    const contact = validateContact(candidate);
    if (!contact.valid) return contact;
    if (ids.has(contact.value.contactId)) {
      return { valid: false, error: "Verified contact IDs must be unique." };
    }
    ids.add(contact.value.contactId);
    contacts.push(contact.value);
  }
  return { valid: true, value: contacts };
}

function validateActivity(value: unknown): ValidationResult<DakotaActivity> {
  const legacyFields = [
    "activityId", "channel", "type", "outcome", "note", "occurredAt", "followUpAt",
  ] as const;
  const fields = [
    "activityId", "taskId", "contactId", "channel", "type", "outcome", "note",
    "occurredAt", "followUpAt",
  ] as const;
  if (!isRecord(value)) {
    return { valid: false, error: "Activity has an invalid shape." };
  }
  const hasProvenance = hasExactKeys(value, fields);
  const isLegacyShape = hasExactKeys(value, legacyFields);
  if (!hasProvenance && !isLegacyShape) {
    return { valid: false, error: "Activity has an invalid shape." };
  }
  if (typeof value.activityId !== "string" || !UUID.test(value.activityId)) {
    return { valid: false, error: "Activity activityId must be a lowercase UUID." };
  }
  const taskId = hasProvenance ? value.taskId : null;
  const contactId = hasProvenance ? value.contactId : null;
  if (taskId !== null && (typeof taskId !== "string" || !UUID.test(taskId))) {
    return { valid: false, error: "Activity taskId must be null or a lowercase UUID." };
  }
  if (contactId !== null && (typeof contactId !== "string" || !UUID.test(contactId))) {
    return { valid: false, error: "Activity contactId must be null or a lowercase UUID." };
  }
  if (typeof value.channel !== "string" || !ACTIVITY_CHANNEL_SET.has(value.channel)) {
    return { valid: false, error: "Activity channel is unsupported." };
  }
  if (typeof value.type !== "string" || !ACTIVITY_TYPE_SET.has(value.type)) {
    return { valid: false, error: "Activity type is unsupported." };
  }
  if (typeof value.outcome !== "string" || !ACTIVITY_OUTCOME_SET.has(value.outcome)) {
    return { valid: false, error: "Activity outcome is unsupported." };
  }
  if (!isPlainText(value.note, 2_000)) {
    return { valid: false, error: "Activity note must be bounded plain text." };
  }
  if ((value.type === "note" || value.type === "follow_up") && !(value.note as string).trim()) {
    return { valid: false, error: "Note and follow-up activities require a note." };
  }
  if (!isIsoTimestamp(value.occurredAt)) {
    return { valid: false, error: "Activity occurredAt must be an ISO timestamp." };
  }
  if (value.followUpAt !== null && !isIsoTimestamp(value.followUpAt)) {
    return { valid: false, error: "Activity followUpAt must be null or an ISO timestamp." };
  }
  return {
    valid: true,
    value: {
      activityId: value.activityId,
      taskId: taskId as string | null,
      contactId: contactId as string | null,
      channel: value.channel as DakotaActivityChannel,
      type: value.type as DakotaActivityType,
      outcome: value.outcome as DakotaActivityOutcome,
      note: value.note as string,
      occurredAt: value.occurredAt as string,
      followUpAt: value.followUpAt as string | null,
    },
  };
}

function validateActivities(value: unknown): ValidationResult<DakotaActivity[]> {
  if (!Array.isArray(value) || value.length > DAKOTA_ACTIVITY_LIMIT) {
    return { valid: false, error: "Activities must be a bounded array." };
  }
  const activities: DakotaActivity[] = [];
  const ids = new Set<string>();
  for (const candidate of value) {
    const activity = validateActivity(candidate);
    if (!activity.valid) return activity;
    if (ids.has(activity.value.activityId)) {
      return { valid: false, error: "Activity IDs must be unique." };
    }
    ids.add(activity.value.activityId);
    activities.push(activity.value);
  }
  return { valid: true, value: activities };
}

function isCompatibleActivity(activity: DakotaActivity): boolean {
  const outcomes = DAKOTA_ACTIVITY_COMPATIBILITY[activity.type][activity.channel];
  return outcomes?.includes(activity.outcome) ?? false;
}

function isUsableContact(contact: DakotaVerifiedContact): boolean {
  return (
    ["email", "phone", "sms"].includes(contact.channel) &&
    (
      contact.consentClassification === "explicit_inquiry" ||
      contact.consentClassification === "existing_relationship" ||
      contact.consentClassification === "public_business"
    )
  );
}

function contactsAreEqual(
  left: DakotaVerifiedContact,
  right: DakotaVerifiedContact,
): boolean {
  return (
    left.contactId === right.contactId &&
    left.name === right.name &&
    left.role === right.role &&
    left.channel === right.channel &&
    left.value === right.value &&
    left.sourceUrl === right.sourceUrl &&
    left.verifiedAt === right.verifiedAt &&
    left.consentClassification === right.consentClassification
  );
}

function validateTask(value: unknown): ValidationResult<DakotaTask> {
  const fields = [
    "taskId", "type", "status", "title", "dueAt", "contactId", "channel", "createdAt",
    "resolvedAt", "resolutionNote",
  ] as const;
  if (!isRecord(value) || !hasExactKeys(value, fields)) {
    return { valid: false, error: "Task has an invalid shape." };
  }
  if (typeof value.taskId !== "string" || !UUID.test(value.taskId)) {
    return { valid: false, error: "Task taskId must be a lowercase UUID." };
  }
  if (typeof value.type !== "string" || !TASK_TYPE_SET.has(value.type)) {
    return { valid: false, error: "Task type is unsupported." };
  }
  if (typeof value.status !== "string" || !TASK_STATUS_SET.has(value.status)) {
    return { valid: false, error: "Task status is unsupported." };
  }
  if (typeof value.channel !== "string" || !TASK_CHANNEL_SET.has(value.channel)) {
    return { valid: false, error: "Task channel is unsupported." };
  }
  if (
    !DAKOTA_TASK_CHANNEL_COMPATIBILITY[value.type as DakotaTaskType]
      .includes(value.channel as DakotaTaskChannel)
  ) {
    return { valid: false, error: "Task type and channel are incompatible." };
  }
  if (
    !isPlainText(value.title, 240) || value.title !== value.title.trim() ||
    value.title.length === 0
  ) {
    return { valid: false, error: "Task title must be non-empty bounded plain text." };
  }
  if (!isPlainText(value.resolutionNote, 1_000) || value.resolutionNote !== value.resolutionNote.trim()) {
    return { valid: false, error: "Task resolutionNote must be bounded plain text." };
  }
  if (!isIsoTimestamp(value.createdAt)) {
    return { valid: false, error: "Task createdAt must be an ISO timestamp." };
  }
  if (value.dueAt !== null && !isIsoTimestamp(value.dueAt)) {
    return { valid: false, error: "Task dueAt must be null or an ISO timestamp." };
  }
  if (value.contactId !== null && (typeof value.contactId !== "string" || !UUID.test(value.contactId))) {
    return { valid: false, error: "Task contactId must be null or a lowercase UUID." };
  }
  if (value.status === "open") {
    if (value.resolvedAt !== null || value.resolutionNote !== "") {
      return { valid: false, error: "Open tasks cannot include resolution evidence." };
    }
  } else {
    if (!isIsoTimestamp(value.resolvedAt)) {
      return { valid: false, error: "Resolved tasks require an ISO resolvedAt timestamp." };
    }
    if (value.resolutionNote.length === 0) {
      return { valid: false, error: "Resolved tasks require a factual resolutionNote." };
    }
    if (Date.parse(value.resolvedAt) < Date.parse(value.createdAt as string)) {
      return { valid: false, error: "Task resolvedAt cannot precede createdAt." };
    }
  }
  return { valid: true, value: value as unknown as DakotaTask };
}

function validateTasks(
  value: unknown,
  contacts: DakotaVerifiedContact[],
): ValidationResult<DakotaTask[]> {
  if (!Array.isArray(value) || value.length > DAKOTA_TASK_LIMIT) {
    return { valid: false, error: "Tasks must be a bounded array." };
  }
  const contactById = new Map(contacts.map((contact) => [contact.contactId, contact]));
  const tasks: DakotaTask[] = [];
  const ids = new Set<string>();
  let openCount = 0;
  for (const candidate of value) {
    const task = validateTask(candidate);
    if (!task.valid) return task;
    if (ids.has(task.value.taskId)) {
      return { valid: false, error: "Task IDs must be unique." };
    }
    ids.add(task.value.taskId);
    if (task.value.status === "open") openCount += 1;

    const contact = task.value.contactId === null
      ? null
      : contactById.get(task.value.contactId) ?? null;
    if (task.value.contactId !== null && (!contact || !isUsableContact(contact))) {
      return { valid: false, error: "Task contactId must reference a usable verified contact." };
    }
    if (task.value.channel === "internal" && task.value.contactId !== null) {
      return { valid: false, error: "Internal tasks cannot reference a contact." };
    }
    if (["email", "phone", "sms"].includes(task.value.channel)) {
      if (!contact) {
        return { valid: false, error: "Direct-channel tasks require a usable verified contact." };
      }
      const compatible =
        (task.value.channel === "email" && contact.channel === "email") ||
        (task.value.channel === "phone" && contact.channel === "phone") ||
        (task.value.channel === "sms" && contact.channel === "sms");
      if (!compatible) {
        return { valid: false, error: "Task channel does not match its verified contact route." };
      }
      if (
        task.value.channel === "email" &&
        contact.consentClassification !== "explicit_inquiry" &&
        contact.consentClassification !== "existing_relationship"
      ) {
        return {
          valid: false,
          error: "Email tasks require explicit-inquiry or existing-relationship consent.",
        };
      }
      if (
        task.value.channel === "sms" &&
        contact.consentClassification !== "explicit_inquiry" &&
        contact.consentClassification !== "existing_relationship"
      ) {
        return {
          valid: false,
          error: "SMS tasks require explicit-inquiry or existing-relationship consent.",
        };
      }
    }
    tasks.push(task.value);
  }
  if (openCount > 1) {
    return { valid: false, error: "Operator records can have at most one open task." };
  }
  return { valid: true, value: tasks };
}

function activityHasDurableProvenance(
  activity: DakotaActivity,
  tasks: DakotaTask[],
  contacts: DakotaVerifiedContact[],
): boolean {
  if (activity.type === "note") {
    return activity.contactId === null && (
      activity.taskId === null || tasks.some((task) => task.taskId === activity.taskId)
    );
  }
  if (activity.taskId === null) return false;
  const task = tasks.find((candidate) => candidate.taskId === activity.taskId);
  if (!task || task.status === "skipped") return false;
  if (!DAKOTA_ACTIVITY_TASK_TYPE_COMPATIBILITY[activity.type].includes(task.type)) return false;
  const occurredAt = Date.parse(activity.occurredAt);
  const createdAt = Date.parse(task.createdAt);
  if (occurredAt + DAKOTA_ACTIVITY_TASK_TIMESTAMP_SKEW_MS < createdAt) return false;
  if (
    task.resolvedAt !== null &&
    occurredAt - DAKOTA_ACTIVITY_TASK_TIMESTAMP_SKEW_MS > Date.parse(task.resolvedAt)
  ) {
    return false;
  }
  const expectedTaskChannel = activity.type === "contract_signed" ? "proposal" : activity.channel;
  if (task.channel !== expectedTaskChannel) return false;
  if (activity.channel === "internal") return activity.contactId === null;
  if (activity.contactId === null) return false;
  const contact = contacts.find((candidate) => candidate.contactId === activity.contactId);
  if (!contact || !isUsableContact(contact)) return false;
  if (
    (activity.channel === "email" || activity.channel === "phone" || activity.channel === "sms") &&
    contact.channel !== activity.channel
  ) {
    return false;
  }
  if (
    (activity.channel === "email" || activity.channel === "sms") &&
    contact.consentClassification !== "explicit_inquiry" &&
    contact.consentClassification !== "existing_relationship"
  ) {
    return false;
  }
  if (activity.channel === "website_form" || activity.channel === "linkedin") return false;
  return task.contactId === activity.contactId;
}

function validateActivityReferences(
  activities: DakotaActivity[],
  tasks: DakotaTask[],
  contacts: DakotaVerifiedContact[],
): string | null {
  for (const activity of activities) {
    if (activity.type === "note") {
      if (activity.contactId !== null) return "Internal notes cannot reference an external contact.";
      if (activity.taskId !== null && !tasks.some((task) => task.taskId === activity.taskId)) {
        return "Activity taskId must reference a durable task.";
      }
      continue;
    }

    // Historical v1/v2/v3 activities are normalized to a null/null provenance
    // pair. Their evidence remains immutable, but transition validation never
    // lets that unlinked history unlock a newly reached stage.
    if (activity.taskId === null && activity.contactId === null) continue;
    if (!activityHasDurableProvenance(activity, tasks, contacts)) {
      return "Activity provenance must reference one durable task and its exact usable contact route.";
    }
  }
  return null;
}

function validateCommercialClose(value: unknown): ValidationResult<DakotaCommercialClose> {
  const fields = [
    "proposalRef", "proposalAmount", "proposalSentDate", "signedDate", "invoiceRef",
    "amountDue", "amountPaid", "paidDate", "balance", "onboardingNextAction",
  ] as const;
  if (!isRecord(value) || !hasExactKeys(value, fields)) {
    return { valid: false, error: "Commercial close has an invalid shape." };
  }
  for (const [field, limit] of [
    ["proposalRef", 240], ["invoiceRef", 240], ["onboardingNextAction", 1_000],
  ] as const) {
    if (!isPlainText(value[field], limit) || value[field] !== value[field].trim()) {
      return { valid: false, error: `Commercial close ${field} must be bounded plain text.` };
    }
  }
  for (const field of ["proposalSentDate", "signedDate", "paidDate"] as const) {
    if (!isDateOnly(value[field])) {
      return { valid: false, error: `Commercial close ${field} must be empty or YYYY-MM-DD.` };
    }
  }
  for (const field of ["proposalAmount", "amountDue", "amountPaid", "balance"] as const) {
    if (!isMoney(value[field])) {
      return { valid: false, error: `Commercial close ${field} is invalid.` };
    }
  }
  const amountDue = value.amountDue as number | null;
  const amountPaid = value.amountPaid as number | null;
  const balance = value.balance as number | null;
  const expectedBalance = Math.max(
    Math.round(((amountDue ?? 0) - (amountPaid ?? 0)) * 100) / 100,
    0,
  );
  if (balance !== null && balance !== expectedBalance) {
    return { valid: false, error: "Commercial close balance must equal amountDue minus amountPaid." };
  }
  return {
    valid: true,
    value: { ...(value as unknown as DakotaCommercialClose), balance: expectedBalance },
  };
}

export function isDakotaCandidateKey(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 240) return false;
  if (value.startsWith("manual:")) return MANUAL_CANDIDATE_KEY.test(value);
  return FEED_CANDIDATE_KEY.test(value);
}

function candidateKeyMatchesIdentity(
  candidateKey: string,
  identity: DakotaOperatorIdentity,
): boolean {
  if (!identity.source || !identity.sourceId) return false;
  return `${identity.source}:${identity.sourceId}`.toLowerCase() === candidateKey;
}

function validateRecordFields(
  value: Record<string, unknown>,
  expectedFields: readonly string[],
  version: "v1" | "v2" | "v3",
  legacyUpdatedAt?: string,
): ValidationResult<DakotaOperatorRecordInput> {
  if (!hasExactKeys(value, expectedFields)) {
    return { valid: false, error: "Operator record has an invalid shape." };
  }
  if (typeof value.status !== "string" || !STATUS_SET.has(value.status)) {
    return { valid: false, error: "Operator record status is unsupported." };
  }
  if (version === "v1" && value.status === "paid") {
    return { valid: false, error: "Legacy operator records cannot use the paid status." };
  }

  const identity = validateIdentity(value.identity);
  if (!identity.valid) return identity;
  for (const field of Object.keys(DAKOTA_OPERATOR_TEXT_LIMITS) as DakotaOperatorTextField[]) {
    if (!isPlainText(value[field], DAKOTA_OPERATOR_TEXT_LIMITS[field])) {
      return { valid: false, error: `Operator record ${field} must be bounded plain text.` };
    }
  }
  if (!isDateOnly(value.dueDate)) {
    return { valid: false, error: "Operator record dueDate must be empty or a real YYYY-MM-DD date." };
  }
  if (!isMoney(value.estimatedValue) || !isMoney(value.actualRevenue)) {
    return {
      valid: false,
      error: "Operator record values must be null or bounded non-negative amounts with at most two decimals.",
    };
  }

  let contacts: DakotaVerifiedContact[] = [];
  let activities: DakotaActivity[] = [];
  let selectedContactId: string | null = null;
  let tasks: DakotaTask[] = [];
  let commercialClose = createEmptyDakotaCommercialClose(value.actualRevenue as number | null);
  if (version === "v2" || version === "v3") {
    const contactsResult = validateContacts(value.contacts);
    if (!contactsResult.valid) return contactsResult;
    contacts = contactsResult.value;
    const activitiesResult = validateActivities(value.activities);
    if (!activitiesResult.valid) return activitiesResult;
    activities = activitiesResult.value;
    const closeResult = validateCommercialClose(value.commercialClose);
    if (!closeResult.valid) return closeResult;
    commercialClose = closeResult.value;

    if (version === "v3") {
      if (
        value.selectedContactId !== null &&
        (typeof value.selectedContactId !== "string" || !UUID.test(value.selectedContactId))
      ) {
        return { valid: false, error: "selectedContactId must be null or a lowercase UUID." };
      }
      selectedContactId = value.selectedContactId as string | null;
      if (selectedContactId !== null) {
        const selectedContact = contacts.find((contact) => contact.contactId === selectedContactId);
        if (!selectedContact || !isUsableContact(selectedContact)) {
          return { valid: false, error: "selectedContactId must reference a usable verified contact." };
        }
      }
      const tasksResult = validateTasks(value.tasks, contacts);
      if (!tasksResult.valid) return tasksResult;
      tasks = tasksResult.value;
      const activityReferenceError = validateActivityReferences(activities, tasks, contacts);
      if (activityReferenceError) return { valid: false, error: activityReferenceError };
      const directOpenTask = tasks.find((task) =>
        task.status === "open" && ["email", "phone", "sms"].includes(task.channel)
      );
      if (
        directOpenTask &&
        (selectedContactId === null || directOpenTask.contactId !== selectedContactId)
      ) {
        return {
          valid: false,
          error: "The open direct-channel task must use selectedContactId.",
        };
      }
    }
  } else if (value.actualRevenue !== null) {
    const paid = value.actualRevenue as number;
    commercialClose = {
      ...commercialClose,
      amountDue: paid,
      amountPaid: paid,
      paidDate: legacyUpdatedAt?.slice(0, 10) ?? "",
      balance: 0,
    };
  }

  const closePaid = commercialClose.amountPaid;
  if (
    version !== "v1" && value.actualRevenue !== null && closePaid !== null &&
    value.actualRevenue !== closePaid
  ) {
    return { valid: false, error: "actualRevenue must match commercialClose.amountPaid." };
  }
  if (version !== "v1" && closePaid === null && value.actualRevenue !== null) {
    const amountPaid = value.actualRevenue as number;
    commercialClose = {
      ...commercialClose,
      amountPaid,
      balance: Math.max(
        Math.round(((commercialClose.amountDue ?? 0) - amountPaid) * 100) / 100,
        0,
      ),
    };
  }
  const actualRevenue = commercialClose.amountPaid;

  return {
    valid: true,
    value: {
      identity: identity.value,
      status: value.status as DakotaOperatorStatus,
      notes: value.notes as string,
      verifiedPain: value.verifiedPain as string,
      offerFit: value.offerFit as string,
      nextAction: value.nextAction as string,
      dueDate: value.dueDate as string,
      estimatedValue: value.estimatedValue as number | null,
      actualRevenue,
      winLossReason: value.winLossReason as string,
      proof: value.proof as string,
      draft: value.draft as string,
      contacts,
      activities,
      commercialClose,
      selectedContactId,
      tasks,
    },
  };
}

export function validateDakotaOperatorRecordInput(
  value: unknown,
): ValidationResult<DakotaOperatorRecordInput> {
  if (!isRecord(value)) {
    return { valid: false, error: "Operator record must be an object." };
  }
  if (hasExactKeys(value, DAKOTA_OPERATOR_INPUT_FIELDS)) {
    return validateRecordFields(value, DAKOTA_OPERATOR_INPUT_FIELDS, "v3");
  }
  if (hasExactKeys(value, DAKOTA_OPERATOR_V2_INPUT_FIELDS)) {
    return validateRecordFields(value, DAKOTA_OPERATOR_V2_INPUT_FIELDS, "v2");
  }
  if (hasExactKeys(value, DAKOTA_OPERATOR_V1_INPUT_FIELDS)) {
    return validateRecordFields(value, DAKOTA_OPERATOR_V1_INPUT_FIELDS, "v1");
  }
  return { valid: false, error: "Operator record has an invalid shape." };
}

export function validateDakotaOperatorPutPayload(
  value: unknown,
): ValidationResult<DakotaOperatorPutPayload> {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, ["candidate_key", "expected_updated_at", "record"])
  ) {
    return { valid: false, error: "Operator-state request has an invalid shape." };
  }
  if (!isDakotaCandidateKey(value.candidate_key)) {
    return { valid: false, error: "candidate_key is invalid." };
  }
  if (value.expected_updated_at !== null && !isIsoTimestamp(value.expected_updated_at)) {
    return {
      valid: false,
      error: "expected_updated_at must be null or an ISO timestamp.",
    };
  }
  const record = validateDakotaOperatorRecordInput(value.record);
  if (!record.valid) return record;
  if (!candidateKeyMatchesIdentity(value.candidate_key, record.value.identity)) {
    return { valid: false, error: "candidate_key does not match the identity source." };
  }
  return {
    valid: true,
    value: {
      candidate_key: value.candidate_key,
      expected_updated_at: value.expected_updated_at as string | null,
      record: record.value,
    },
  };
}

function validateLegacyMilestones(
  value: unknown,
  status: DakotaOperatorStatus,
  updatedAt: string,
  actualRevenue: number | null,
): ValidationResult<DakotaOperatorMilestones> {
  const normalized = legacyMilestones(status, updatedAt);
  if (value !== undefined) {
    if (!isRecord(value) || !hasExactKeys(value, DAKOTA_OPERATOR_V1_MILESTONE_FIELDS)) {
      return { valid: false, error: "Legacy operator record milestones have an invalid shape." };
    }
    for (const field of DAKOTA_OPERATOR_V1_MILESTONE_FIELDS) {
      if (value[field] !== null && !isIsoTimestamp(value[field])) {
        return { valid: false, error: `Legacy operator record milestone ${field} is invalid.` };
      }
      normalized[field] = value[field] as string | null;
    }
  }
  if (actualRevenue !== null) normalized.paidAt = updatedAt;
  return { valid: true, value: normalized };
}

function validateStoredRecord(
  value: unknown,
  version: "v1" | "v2" | "v3",
): ValidationResult<DakotaOperatorRecord> {
  if (!isRecord(value)) {
    return { valid: false, error: "Stored operator record must be an object." };
  }
  if (!isIsoTimestamp(value.updated_at)) {
    return { valid: false, error: "Stored operator record timestamp is invalid." };
  }

  let fields: ValidationResult<DakotaOperatorRecordInput>;
  let milestones: ValidationResult<DakotaOperatorMilestones>;
  if (version === "v1") {
    const hasMilestones = Object.hasOwn(value, "milestones");
    fields = validateRecordFields(
      value,
      hasMilestones ? DAKOTA_OPERATOR_V1_MILESTONE_STORED_FIELDS : DAKOTA_OPERATOR_V1_STORED_FIELDS,
      "v1",
      value.updated_at,
    );
    if (!fields.valid) return fields;
    milestones = validateLegacyMilestones(
      hasMilestones ? value.milestones : undefined,
      fields.value.status,
      value.updated_at,
      fields.value.actualRevenue,
    );
  } else {
    const expectedFields = version === "v2"
      ? DAKOTA_OPERATOR_V2_STORED_FIELDS
      : DAKOTA_OPERATOR_STORED_FIELDS;
    fields = validateRecordFields(value, expectedFields, version);
    if (!fields.valid) return fields;
    milestones = validateMilestones(value.milestones);
  }
  if (!fields.valid) return fields;
  if (!milestones.valid) return milestones;
  return {
    valid: true,
    value: { ...fields.value, milestones: milestones.value, updated_at: value.updated_at },
  };
}

export function validateDakotaOperatorStateEnvelope(
  value: unknown,
): ValidationResult<DakotaOperatorStateEnvelope> {
  if (!isRecord(value) || !hasExactKeys(value, ["schema_version", "updated_at", "records"])) {
    return { valid: false, error: "Operator-state envelope has an invalid shape." };
  }
  const version = value.schema_version === DAKOTA_OPERATOR_STATE_SCHEMA
    ? "v3"
    : value.schema_version === DAKOTA_OPERATOR_STATE_SCHEMA_V2
      ? "v2"
      : value.schema_version === DAKOTA_OPERATOR_STATE_SCHEMA_V1
        ? "v1"
        : null;
  if (!version) {
    return { valid: false, error: "Operator-state schema version is unsupported." };
  }
  if (!isIsoTimestamp(value.updated_at)) {
    return { valid: false, error: "Operator-state timestamp is invalid." };
  }
  if (!isRecord(value.records)) {
    return { valid: false, error: "Operator-state records must be an object." };
  }

  const entries = Object.entries(value.records);
  if (entries.length > DAKOTA_OPERATOR_RECORD_LIMIT) {
    return { valid: false, error: "Operator-state record limit exceeded." };
  }
  const records = Object.create(null) as Record<string, DakotaOperatorRecord>;
  for (const [candidateKey, record] of entries) {
    if (!isDakotaCandidateKey(candidateKey)) {
      return { valid: false, error: "Stored candidate key is invalid." };
    }
    const validation = validateStoredRecord(record, version);
    if (!validation.valid) return validation;
    if (!candidateKeyMatchesIdentity(candidateKey, validation.value.identity)) {
      return { valid: false, error: "Stored candidate key does not match its identity source." };
    }
    records[candidateKey] = validation.value;
  }

  const normalizedEnvelope: DakotaOperatorStateEnvelope = {
    schema_version: DAKOTA_OPERATOR_STATE_SCHEMA,
    updated_at: value.updated_at,
    records,
  };
  if (
    new TextEncoder().encode(JSON.stringify(normalizedEnvelope)).byteLength >
    DAKOTA_OPERATOR_STATE_MAX_BYTES
  ) {
    return { valid: false, error: "Operator-state envelope is oversized." };
  }
  return { valid: true, value: normalizedEnvelope };
}

function hasLinkedActivity(
  record: Pick<DakotaOperatorRecordInput, "activities" | "tasks" | "contacts">,
  type: DakotaActivityType,
  outcomes: readonly DakotaActivityOutcome[],
  activities: DakotaActivity[] = record.activities,
): boolean {
  return activities.some((activity) =>
    activity.type === type &&
    outcomes.includes(activity.outcome) &&
    activityHasDurableProvenance(activity, record.tasks, record.contacts)
  );
}

function hasLinkedContactActivity(
  record: Pick<DakotaOperatorRecordInput, "activities" | "tasks" | "contacts">,
): boolean {
  return (
    hasLinkedActivity(record, "outreach", ["sent", "delivered", "connected", "voicemail", "no_response"]) ||
    hasLinkedActivity(record, "call", ["connected", "voicemail", "completed", "no_response"])
  );
}

function milestoneOrLinkedActivity(
  previous: DakotaOperatorRecord | undefined,
  milestone: DakotaOperatorMilestoneField,
  grandfatheredStatuses: readonly DakotaOperatorStatus[],
  linked: boolean,
): boolean {
  return Boolean(
    linked ||
    (previous && (
      previous.milestones[milestone] !== null ||
      grandfatheredStatuses.includes(previous.status)
    ))
  );
}

function changedCommercialFields(
  next: DakotaCommercialClose,
  previous: DakotaCommercialClose | undefined,
  fields: readonly (keyof DakotaCommercialClose)[],
): boolean {
  return fields.some((field) => next[field] !== previous?.[field]);
}

function clearedCommercialTruth(
  next: DakotaCommercialClose,
  previous: DakotaCommercialClose,
): boolean {
  return Boolean(
    (previous.proposalRef && !next.proposalRef) ||
    (previous.proposalAmount !== null && next.proposalAmount === null) ||
    (previous.proposalSentDate && !next.proposalSentDate) ||
    (previous.signedDate && !next.signedDate) ||
    (previous.invoiceRef && !next.invoiceRef) ||
    (previous.amountDue !== null && next.amountDue === null) ||
    (previous.paidDate && !next.paidDate)
  );
}

function isCommercialDateBeyondUtcTomorrow(value: string, now: Date): boolean {
  if (!value) return false;
  const latestAllowed = new Date(now.getTime() + 24 * 60 * 60_000).toISOString().slice(0, 10);
  return value > latestAllowed;
}

function hasAlignedPaidOnboardingTask(
  record: Pick<DakotaOperatorRecordInput, "tasks" | "commercialClose">,
): boolean {
  const openTasks = record.tasks.filter((task) => task.status === "open");
  const task = openTasks[0];
  const instruction = record.commercialClose.onboardingNextAction.trim();
  return Boolean(
    openTasks.length === 1 &&
    task?.type === "onboarding" &&
    task.channel === "internal" &&
    task.contactId === null &&
    instruction &&
    task.title === instruction
  );
}

export function validateDakotaOperatorTransition(
  next: DakotaOperatorRecordInput,
  previous: DakotaOperatorRecord | undefined,
  now: Date,
): ValidationResult<DakotaOperatorRecordInput> {
  if (previous) {
    const nextContactsById = new Map(next.contacts.map((contact) => [contact.contactId, contact]));
    for (const prior of previous.contacts) {
      const candidate = nextContactsById.get(prior.contactId);
      if (!candidate) {
        return { valid: false, error: "Verified contacts are durable and cannot be removed." };
      }
      if (!contactsAreEqual(prior, candidate)) {
        return {
          valid: false,
          error: "Persisted verified contacts are immutable; append a new contact route instead.",
        };
      }
    }
    if (next.activities.length < previous.activities.length) {
      return { valid: false, error: "Activities are append-only and cannot be removed." };
    }
    for (let index = 0; index < previous.activities.length; index += 1) {
      const prior = previous.activities[index];
      const candidate = next.activities[index];
      if (
        !prior || !candidate ||
        prior.activityId !== candidate.activityId || prior.channel !== candidate.channel ||
        prior.type !== candidate.type || prior.outcome !== candidate.outcome ||
        prior.taskId !== candidate.taskId || prior.contactId !== candidate.contactId ||
        prior.note !== candidate.note || prior.occurredAt !== candidate.occurredAt ||
        prior.followUpAt !== candidate.followUpAt
      ) {
        return { valid: false, error: "Existing activities are immutable." };
      }
    }
    if (next.tasks.length < previous.tasks.length) {
      return { valid: false, error: "Tasks are durable and cannot be removed." };
    }
    for (let index = 0; index < previous.tasks.length; index += 1) {
      const prior = previous.tasks[index];
      const candidate = next.tasks[index];
      if (
        !prior || !candidate || prior.taskId !== candidate.taskId ||
        prior.type !== candidate.type || prior.title !== candidate.title ||
        prior.dueAt !== candidate.dueAt || prior.contactId !== candidate.contactId ||
        prior.channel !== candidate.channel || prior.createdAt !== candidate.createdAt
      ) {
        return { valid: false, error: "Existing task identity, order, and instructions are immutable." };
      }
      if (prior.status !== "open") {
        if (
          prior.status !== candidate.status || prior.resolvedAt !== candidate.resolvedAt ||
          prior.resolutionNote !== candidate.resolutionNote
        ) {
          return { valid: false, error: "Resolved tasks are immutable." };
        }
      } else if (candidate.status === "open") {
        if (
          candidate.resolvedAt !== prior.resolvedAt ||
          candidate.resolutionNote !== prior.resolutionNote
        ) {
          return { valid: false, error: "Open tasks cannot gain resolution evidence." };
        }
      } else if (
        candidate.status !== "completed" && candidate.status !== "skipped"
      ) {
        return { valid: false, error: "Open tasks may only be completed or skipped." };
      }
    }
  }
  const appended = next.activities.slice(previous?.activities.length ?? 0);
  const appendedTasks = next.tasks.slice(previous?.tasks.length ?? 0);
  const eligibleActivityTaskIds = new Set([
    ...(previous?.tasks.filter((task) => task.status === "open").map((task) => task.taskId) ?? []),
    ...appendedTasks.map((task) => task.taskId),
  ]);
  const latestAllowed = now.getTime() + 5 * 60_000;
  // V2 allowed the enum cross-product. Preserve its immutable history, but
  // require every newly appended activity to satisfy the V3 compatibility matrix.
  if (appended.some((activity) => !isCompatibleActivity(activity))) {
    return { valid: false, error: "Activity type, channel, and outcome are incompatible." };
  }
  for (const activity of appended) {
    if (!activity.note.trim()) {
      return { valid: false, error: "New activity evidence requires a factual note." };
    }
    if (activity.type === "note") {
      if (!activityHasDurableProvenance(activity, next.tasks, next.contacts)) {
        return { valid: false, error: "New note provenance is invalid." };
      }
      continue;
    }
    if (!activityHasDurableProvenance(activity, next.tasks, next.contacts)) {
      return {
        valid: false,
        error: "New non-note activity evidence must reference one durable task and exact usable contact route.",
      };
    }
    if (activity.taskId === null || !eligibleActivityTaskIds.has(activity.taskId)) {
      return {
        valid: false,
        error: "New activity evidence must reference the task open for this work.",
      };
    }
    if (activity.channel !== "internal" && activity.contactId !== next.selectedContactId) {
      return {
        valid: false,
        error: "New external activity evidence must use selectedContactId exactly.",
      };
    }
  }
  if (appended.some((activity) => Date.parse(activity.occurredAt) > latestAllowed)) {
    return { valid: false, error: "New activities cannot be dated in the future." };
  }
  if (
    appendedTasks.some((task) =>
      Date.parse(task.createdAt) > latestAllowed ||
      (task.resolvedAt !== null && Date.parse(task.resolvedAt) > latestAllowed)
    )
  ) {
    return { valid: false, error: "New task timestamps cannot be dated in the future." };
  }
  if (appendedTasks.some((task) => task.status !== "open")) {
    return { valid: false, error: "New tasks must enter the ledger as open." };
  }
  if (appendedTasks.some((task) =>
    task.channel !== "internal" && (
      !previous ||
      task.contactId === null ||
      task.contactId !== previous.selectedContactId ||
      !previous.contacts.some((contact) => contact.contactId === task.contactId)
    )
  )) {
    return {
      valid: false,
      error: "New non-internal tasks require the exact selected contact route to be persisted first.",
    };
  }
  const newlyResolvedTasks = previous
    ? next.tasks.slice(0, previous.tasks.length).filter((task, index) =>
      previous.tasks[index]?.status === "open" && task.status !== "open"
    )
    : [];
  if (newlyResolvedTasks.some((task) => task.resolvedAt === null || Date.parse(task.resolvedAt) > latestAllowed)) {
    return { valid: false, error: "Task resolution timestamps cannot be dated in the future." };
  }

  const openTaskCount = next.tasks.filter((task) => task.status === "open").length;
  if (OPEN_TASK_REQUIRED_STATUS_SET.has(next.status)) {
    if (openTaskCount !== 1) {
      return { valid: false, error: "This stage requires exactly one open task." };
    }
  } else if (openTaskCount !== 0) {
    return { valid: false, error: "This stage cannot retain an open task." };
  }
  const nextOpenTask = next.tasks.find((task) => task.status === "open");
  if (nextOpenTask && nextOpenTask.channel !== "internal") {
    const selectedTaskContact = nextOpenTask.contactId === null
      ? null
      : next.contacts.find((contact) => contact.contactId === nextOpenTask.contactId) ?? null;
    const routedTaskIsAligned = Boolean(
      selectedTaskContact &&
      isUsableContact(selectedTaskContact) &&
      nextOpenTask.contactId === next.selectedContactId
    );
    const previousOpenTask = previous?.tasks.find((task) => task.status === "open");
    const previousRouteWasInvalid = Boolean(
      previousOpenTask &&
      previousOpenTask.channel !== "internal" &&
      (
        previousOpenTask.contactId === null ||
        previousOpenTask.contactId !== previous?.selectedContactId
      )
    );
    const unchangedLegacyRoutedTask = Boolean(
      previousRouteWasInvalid && previousOpenTask?.taskId === nextOpenTask.taskId
    );
    if (!routedTaskIsAligned && !unchangedLegacyRoutedTask) {
      return {
        valid: false,
        error: "Every open non-internal task must use selectedContactId exactly.",
      };
    }
  }

  if (next.status === "snoozed") {
    if (!next.dueDate) {
      return { valid: false, error: "Snoozed records require a wake date." };
    }
    const openTask = next.tasks.find((task) => task.status === "open");
    if (!openTask?.dueAt || openTask.dueAt.slice(0, 10) !== next.dueDate) {
      return {
        valid: false,
        error: "A snoozed record's open task dueAt must match its wake date.",
      };
    }
  }
  if (next.status === "lost" && !next.winLossReason.trim()) {
    return { valid: false, error: "Lost records require a reason." };
  }

  const linkedContacted = hasLinkedContactActivity(next);
  const contacted = milestoneOrLinkedActivity(
    previous,
    "firstContactedAt",
    ["pursuing", "replied", "meeting", "proposal", "won", "paid"],
    linkedContacted,
  );
  if (
    next.status === "lost" &&
    previous?.status !== "lost" &&
    !previous?.milestones.lostAt &&
    !previous?.milestones.humanApprovedAt &&
    !contacted
  ) {
    return { valid: false, error: "Lost is reserved for pursued opportunities; use not_fit for research closure." };
  }

  const close = next.commercialClose;
  const previousClose = previous?.commercialClose ?? createEmptyDakotaCommercialClose();
  for (const field of ["proposalSentDate", "signedDate", "paidDate"] as const) {
    if (
      close[field] !== previousClose[field] &&
      isCommercialDateBeyondUtcTomorrow(close[field], now)
    ) {
      return {
        valid: false,
        error: "Commercial dates cannot be later than the next UTC calendar day.",
      };
    }
  }
  const proposalChanged = changedCommercialFields(
    close,
    previousClose,
    ["proposalRef", "proposalAmount", "proposalSentDate"],
  );
  const signedDateChanged = close.signedDate !== previousClose.signedDate;
  const invoiceChanged = changedCommercialFields(close, previousClose, ["invoiceRef", "amountDue"]);
  const previousPaidAmount = previousClose.amountPaid ?? 0;
  const nextPaidAmount = close.amountPaid ?? 0;
  const paymentChanged = nextPaidAmount !== previousPaidAmount || close.paidDate !== previousClose.paidDate;
  if (nextPaidAmount < previousPaidAmount) {
    return { valid: false, error: "Cleared cash cannot decrease; record a separate correction outside Dakota." };
  }
  if (clearedCommercialTruth(close, previousClose)) {
    return {
      valid: false,
      error: "Established commercial truth cannot be cleared; append corrective evidence instead.",
    };
  }

  const linkedProposal = hasLinkedActivity(next, "proposal_sent", ["sent", "delivered", "completed"]);
  const linkedSigned = hasLinkedActivity(next, "contract_signed", ["completed", "won"]);
  const linkedInvoice = hasLinkedActivity(next, "invoice_sent", ["sent", "delivered", "completed"]);
  const linkedPaid = hasLinkedActivity(next, "payment_received", ["paid"]);
  const appendedProposal = hasLinkedActivity(next, "proposal_sent", ["sent", "delivered", "completed"], appended);
  const appendedSigned = hasLinkedActivity(next, "contract_signed", ["completed", "won"], appended);
  const appendedInvoice = hasLinkedActivity(next, "invoice_sent", ["sent", "delivered", "completed"], appended);
  const appendedPaid = hasLinkedActivity(next, "payment_received", ["paid"], appended);

  if (proposalChanged && !appendedProposal) {
    return { valid: false, error: "Changed proposal terms require newly appended linked proposal-sent evidence." };
  }
  if (signedDateChanged && !appendedSigned) {
    return { valid: false, error: "Changed signed date requires newly appended linked contract-signed evidence." };
  }
  if (invoiceChanged && !appendedInvoice) {
    return { valid: false, error: "Changed invoice terms require newly appended linked invoice-sent evidence." };
  }
  if (paymentChanged && !appendedPaid) {
    return { valid: false, error: "Changed cleared cash requires newly appended linked payment-received evidence." };
  }

  const proposalStageEvidence = milestoneOrLinkedActivity(
    previous,
    "proposalAt",
    ["proposal", "won", "paid"],
    linkedProposal,
  );
  const proposalSent = proposalStageEvidence || (!proposalChanged && Boolean(
    previousClose.proposalRef &&
    previousClose.proposalAmount !== null &&
    previousClose.proposalSentDate
  ));
  const signedStageEvidence = milestoneOrLinkedActivity(
    previous,
    "wonAt",
    ["won", "paid"],
    linkedSigned,
  );
  const signed = signedStageEvidence || (!signedDateChanged && Boolean(previousClose.signedDate));
  const invoiceStageEvidence = linkedInvoice || previous?.status === "paid" || previous?.milestones.paidAt !== null;
  const invoiceSent = invoiceStageEvidence || (!invoiceChanged && Boolean(
    previousClose.invoiceRef && previousClose.amountDue !== null
  ));
  const paidStageEvidence = milestoneOrLinkedActivity(
    previous,
    "paidAt",
    ["paid"],
    linkedPaid,
  );
  const paid = paidStageEvidence || (!paymentChanged && previousPaidAmount > 0 && Boolean(previousClose.paidDate));
  const hasAnyProposalTruth = Boolean(close.proposalRef || close.proposalAmount !== null || close.proposalSentDate);
  if (
    hasAnyProposalTruth &&
    (!close.proposalRef || close.proposalAmount === null || !close.proposalSentDate || !proposalSent)
  ) {
    return { valid: false, error: "Proposal commercial data requires complete sent-proposal evidence." };
  }
  if (close.signedDate && !signed) {
    return { valid: false, error: "A signed date requires signed-contract evidence." };
  }
  const hasAnyInvoiceTruth = Boolean(close.invoiceRef || close.amountDue !== null);
  if (hasAnyInvoiceTruth && (!close.invoiceRef || close.amountDue === null || !invoiceSent)) {
    return { valid: false, error: "Invoice commercial data requires a reference, amount due, and sent-invoice evidence." };
  }
  const hasAnyPaymentTruth = Boolean((close.amountPaid ?? 0) > 0 || close.paidDate);
  if (hasAnyPaymentTruth && (!(close.amountPaid && close.amountPaid > 0) || !close.paidDate || !paid)) {
    return { valid: false, error: "Recorded cash requires a paid date and cleared payment evidence." };
  }

  if (previous?.status === "do_not_contact" && next.status !== "do_not_contact") {
    const previousContactIds = new Set(previous.contacts.map((contact) => contact.contactId));
    const appendedUsableContact = next.contacts.some((contact) =>
      !previousContactIds.has(contact.contactId) && isUsableContact(contact)
    );
    if (!appendedUsableContact) {
      return {
        valid: false,
        error: "Leaving do-not-contact requires a newly appended usable contact route.",
      };
    }
  }

  const activeStatuses = new Set<DakotaOperatorStatus>([
    "pursuit_ready", "pursuing", "replied", "meeting", "proposal", "won", "paid",
  ]);
  if (!activeStatuses.has(next.status)) return { valid: true, value: next };

  if (!next.verifiedPain.trim() || !next.offerFit.trim()) {
    return { valid: false, error: "Active pursuit requires verified pain and offer fit." };
  }
  const selectedContact = next.selectedContactId === null
    ? null
    : next.contacts.find((contact) => contact.contactId === next.selectedContactId) ?? null;
  if (!selectedContact || !isUsableContact(selectedContact)) {
    return {
      valid: false,
      error: "Active pursuit requires a selected verified usable contact route.",
    };
  }
  const replied = milestoneOrLinkedActivity(
    previous,
    "repliedAt",
    ["replied", "meeting", "proposal", "won", "paid"],
    hasLinkedActivity(next, "reply", ["replied", "connected", "completed"]),
  );
  const met = milestoneOrLinkedActivity(
    previous,
    "meetingAt",
    ["meeting", "proposal", "won", "paid"],
    hasLinkedActivity(next, "meeting", ["scheduled", "completed"]),
  );

  if (["pursuing", "replied", "meeting", "proposal", "won", "paid"].includes(next.status) && !contacted) {
    return { valid: false, error: "Pursuing requires a recorded contact activity." };
  }
  if (["replied", "meeting", "proposal", "won", "paid"].includes(next.status) && !replied) {
    return { valid: false, error: "This stage requires reply evidence." };
  }
  if (["meeting", "proposal", "won", "paid"].includes(next.status) && !met) {
    return { valid: false, error: "This stage requires meeting evidence." };
  }
  if (["proposal", "won", "paid"].includes(next.status)) {
    if (!proposalStageEvidence || !close.proposalRef || close.proposalAmount === null || !close.proposalSentDate) {
      return { valid: false, error: "Proposal stage requires sent proposal evidence and commercial terms." };
    }
  }
  if (["won", "paid"].includes(next.status) && (!signedStageEvidence || !close.signedDate)) {
    return { valid: false, error: "Won stage requires signed-contract evidence." };
  }
  if (next.status === "paid") {
    const previousOpenTask = previous?.tasks.find((task) => task.status === "open");
    const unchangedLegacyPaidTask = Boolean(
      previous?.status === "paid" &&
      !hasAlignedPaidOnboardingTask(previous) &&
      previousOpenTask?.taskId === nextOpenTask?.taskId &&
      close.onboardingNextAction === previousClose.onboardingNextAction
    );
    if (!hasAlignedPaidOnboardingTask(next) && !unchangedLegacyPaidTask) {
      return {
        valid: false,
        error: "Paid requires one open internal onboarding task whose title exactly matches the onboarding next action.",
      };
    }
    if (
      !paidStageEvidence || !invoiceStageEvidence || !close.invoiceRef || close.amountDue === null || close.amountPaid === null ||
      close.amountPaid < close.amountDue || close.balance !== 0 || !close.paidDate ||
      !close.onboardingNextAction.trim()
    ) {
      return { valid: false, error: "Paid requires cleared-cash, invoice, zero-balance, and onboarding evidence." };
    }
  }
  return { valid: true, value: next };
}

export function createDakotaOperatorRecord(
  input: DakotaOperatorRecordInput,
  updatedAt: string,
  previous?: DakotaOperatorRecord,
): DakotaOperatorRecord {
  const milestones = previous
    ? { ...previous.milestones }
    : emptyMilestones();
  const hasRecordedContact = hasLinkedContactActivity(input);
  if (HUMAN_APPROVED_STATUS_SET.has(input.status) && milestones.humanApprovedAt === null) {
    milestones.humanApprovedAt = updatedAt;
  }
  if (input.status === "lost" && hasRecordedContact && milestones.humanApprovedAt === null) {
    milestones.humanApprovedAt = updatedAt;
  }
  if (CONTACTED_STATUS_SET.has(input.status) && milestones.firstContactedAt === null) {
    milestones.firstContactedAt = updatedAt;
  }
  if (hasRecordedContact && milestones.firstContactedAt === null) {
    milestones.firstContactedAt = updatedAt;
  }
  const milestoneField = STATUS_MILESTONE_FIELD[input.status];
  if (milestoneField && milestones[milestoneField] === null) {
    milestones[milestoneField] = updatedAt;
  }
  return { ...input, milestones, updated_at: updatedAt };
}

export function createDakotaOperatorStateEnvelope(
  records: Record<string, DakotaOperatorRecord>,
  updatedAt: string,
): DakotaOperatorStateEnvelope {
  return {
    schema_version: DAKOTA_OPERATOR_STATE_SCHEMA,
    updated_at: updatedAt,
    records,
  };
}

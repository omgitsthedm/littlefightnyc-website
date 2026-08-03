export const DAKOTA_OPERATOR_STATE_SCHEMA_V1 = "dakota.operator-state.v1" as const;
export const DAKOTA_OPERATOR_STATE_SCHEMA = "dakota.operator-state.v2" as const;

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

export const DAKOTA_OPERATOR_INPUT_FIELDS = [
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
  "contacts",
  "activities",
  "commercialClose",
] as const;

const DAKOTA_OPERATOR_V1_INPUT_FIELDS = DAKOTA_OPERATOR_INPUT_FIELDS.slice(0, -3);

const DAKOTA_OPERATOR_V1_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_V1_INPUT_FIELDS,
  "updated_at",
] as const;

const DAKOTA_OPERATOR_V1_MILESTONE_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_V1_INPUT_FIELDS,
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
  channel: DakotaActivityChannel;
  type: DakotaActivityType;
  outcome: DakotaActivityOutcome;
  note: string;
  occurredAt: string;
  followUpAt: string | null;
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
  const fields = [
    "activityId", "channel", "type", "outcome", "note", "occurredAt", "followUpAt",
  ] as const;
  if (!isRecord(value) || !hasExactKeys(value, fields)) {
    return { valid: false, error: "Activity has an invalid shape." };
  }
  if (typeof value.activityId !== "string" || !UUID.test(value.activityId)) {
    return { valid: false, error: "Activity activityId must be a lowercase UUID." };
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
  return { valid: true, value: value as unknown as DakotaActivity };
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
  version: "v1" | "v2",
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
  let commercialClose = createEmptyDakotaCommercialClose(value.actualRevenue as number | null);
  if (version === "v2") {
    const contactsResult = validateContacts(value.contacts);
    if (!contactsResult.valid) return contactsResult;
    contacts = contactsResult.value;
    const activitiesResult = validateActivities(value.activities);
    if (!activitiesResult.valid) return activitiesResult;
    activities = activitiesResult.value;
    const closeResult = validateCommercialClose(value.commercialClose);
    if (!closeResult.valid) return closeResult;
    commercialClose = closeResult.value;
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
    version === "v2" && value.actualRevenue !== null && closePaid !== null &&
    value.actualRevenue !== closePaid
  ) {
    return { valid: false, error: "actualRevenue must match commercialClose.amountPaid." };
  }
  if (version === "v2" && closePaid === null && value.actualRevenue !== null) {
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
    return validateRecordFields(value, DAKOTA_OPERATOR_INPUT_FIELDS, "v2");
  }
  if (hasExactKeys(value, DAKOTA_OPERATOR_V1_INPUT_FIELDS)) {
    return validateRecordFields(value, DAKOTA_OPERATOR_V1_INPUT_FIELDS, "v1");
  }
  return { valid: false, error: "Operator record has an invalid shape." };
}

export function validateDakotaOperatorPutPayload(
  value: unknown,
): ValidationResult<DakotaOperatorPutPayload> {
  if (!isRecord(value) || !hasExactKeys(value, ["candidate_key", "record"])) {
    return { valid: false, error: "Operator-state request has an invalid shape." };
  }
  if (!isDakotaCandidateKey(value.candidate_key)) {
    return { valid: false, error: "candidate_key is invalid." };
  }
  const record = validateDakotaOperatorRecordInput(value.record);
  if (!record.valid) return record;
  if (!candidateKeyMatchesIdentity(value.candidate_key, record.value.identity)) {
    return { valid: false, error: "candidate_key does not match the identity source." };
  }
  return { valid: true, value: { candidate_key: value.candidate_key, record: record.value } };
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
  version: "v1" | "v2",
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
    fields = validateRecordFields(value, DAKOTA_OPERATOR_STORED_FIELDS, "v2");
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

function hasActivity(
  activities: DakotaActivity[],
  type: DakotaActivityType,
  outcomes: readonly DakotaActivityOutcome[],
): boolean {
  return activities.some((activity) => activity.type === type && outcomes.includes(activity.outcome));
}

export function validateDakotaOperatorTransition(
  next: DakotaOperatorRecordInput,
  previous: DakotaOperatorRecord | undefined,
  now: Date,
): ValidationResult<DakotaOperatorRecordInput> {
  if (previous) {
    const nextContactIds = new Set(next.contacts.map((contact) => contact.contactId));
    if (previous.contacts.some((contact) => !nextContactIds.has(contact.contactId))) {
      return { valid: false, error: "Verified contacts are durable and cannot be removed." };
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
        prior.note !== candidate.note || prior.occurredAt !== candidate.occurredAt ||
        prior.followUpAt !== candidate.followUpAt
      ) {
        return { valid: false, error: "Existing activities are immutable." };
      }
    }
  }
  const appended = next.activities.slice(previous?.activities.length ?? 0);
  const latestAllowed = now.getTime() + 5 * 60_000;
  if (appended.some((activity) => Date.parse(activity.occurredAt) > latestAllowed)) {
    return { valid: false, error: "New activities cannot be dated in the future." };
  }

  if (next.status === "snoozed") {
    if (!next.dueDate) {
      return { valid: false, error: "Snoozed records require a wake date." };
    }
  }
  if (next.status === "lost" && !next.winLossReason.trim()) {
    return { valid: false, error: "Lost records require a reason." };
  }

  const contacted =
    hasActivity(next.activities, "outreach", ["sent", "delivered", "connected", "voicemail", "no_response"]) ||
    hasActivity(next.activities, "call", ["connected", "voicemail", "completed", "no_response"]);
  if (next.status === "lost" && !previous?.milestones.humanApprovedAt && !contacted) {
    return { valid: false, error: "Lost is reserved for pursued opportunities; use not_fit for research closure." };
  }

  const proposalSent = hasActivity(next.activities, "proposal_sent", ["sent", "delivered", "completed"]);
  const signed = hasActivity(next.activities, "contract_signed", ["completed", "won"]);
  const invoiceSent = hasActivity(next.activities, "invoice_sent", ["sent", "delivered", "completed"]);
  const paid = hasActivity(next.activities, "payment_received", ["paid"]);
  const close = next.commercialClose;
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
    const previouslyAllowed = new Map(
      previous.contacts.map((contact) => [contact.contactId, contact.consentClassification]),
    );
    const intentionallyReclassified = next.contacts.some((contact) => {
      const allowed =
        contact.consentClassification === "explicit_inquiry" ||
        contact.consentClassification === "existing_relationship" ||
        contact.consentClassification === "public_business";
      const prior = previouslyAllowed.get(contact.contactId);
      return allowed && (prior === undefined || prior !== contact.consentClassification);
    });
    if (!intentionallyReclassified) {
      return { valid: false, error: "Leaving do-not-contact requires an intentional contact reclassification." };
    }
  }

  const activeStatuses = new Set<DakotaOperatorStatus>([
    "pursuit_ready", "pursuing", "replied", "meeting", "proposal", "won", "paid",
  ]);
  if (!activeStatuses.has(next.status)) return { valid: true, value: next };

  if (!next.verifiedPain.trim() || !next.offerFit.trim()) {
    return { valid: false, error: "Active pursuit requires verified pain and offer fit." };
  }
  const usableContact = next.contacts.some((contact) =>
    contact.consentClassification === "explicit_inquiry" ||
    contact.consentClassification === "existing_relationship" ||
    contact.consentClassification === "public_business"
  );
  if (!usableContact) {
    return { valid: false, error: "Active pursuit requires a verified usable contact route." };
  }
  const replied = hasActivity(next.activities, "reply", ["replied", "connected", "completed"]);
  const met = hasActivity(next.activities, "meeting", ["scheduled", "completed"]);

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
    if (!proposalSent || !close.proposalRef || close.proposalAmount === null || !close.proposalSentDate) {
      return { valid: false, error: "Proposal stage requires sent proposal evidence and commercial terms." };
    }
  }
  if (["won", "paid"].includes(next.status) && (!signed || !close.signedDate)) {
    return { valid: false, error: "Won stage requires signed-contract evidence." };
  }
  if (next.status === "paid") {
    if (
      !paid || !close.invoiceRef || close.amountDue === null || close.amountPaid === null ||
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
  const hasRecordedContact =
    hasActivity(input.activities, "outreach", ["sent", "delivered", "connected", "voicemail", "no_response"]) ||
    hasActivity(input.activities, "call", ["connected", "voicemail", "completed", "no_response"]);
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

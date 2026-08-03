export const DAKOTA_OPERATOR_STATE_SCHEMA = "dakota.operator-state.v1" as const;

export const DAKOTA_OPERATOR_STATUSES = [
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

export type DakotaOperatorStatus = (typeof DAKOTA_OPERATOR_STATUSES)[number];

export const DAKOTA_OPERATOR_RECORD_LIMIT = 500;
export const DAKOTA_OPERATOR_REQUEST_MAX_BYTES = 32 * 1024;
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
] as const;

const DAKOTA_OPERATOR_LEGACY_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_INPUT_FIELDS,
  "updated_at",
] as const;

const DAKOTA_OPERATOR_STORED_FIELDS = [
  ...DAKOTA_OPERATOR_INPUT_FIELDS,
  "milestones",
  "updated_at",
] as const;

export const DAKOTA_OPERATOR_MILESTONE_FIELDS = [
  "humanApprovedAt",
  "repliedAt",
  "meetingAt",
  "proposalAt",
  "wonAt",
] as const;

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
const HUMAN_APPROVED_STATUS_SET = new Set<string>([
  "pursuit_ready",
  "pursuing",
  "replied",
  "meeting",
  "proposal",
  "won",
  "lost",
]);
const STATUS_MILESTONE_FIELD: Partial<Record<DakotaOperatorStatus, DakotaOperatorMilestoneField>> = {
  replied: "repliedAt",
  meeting: "meetingAt",
  proposal: "proposalAt",
  won: "wonAt",
};
const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const HTML_LIKE_CONTENT = /(?:[<>]|<!--|-->|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;
const URL_LIKE_CONTENT = /(?:\b(?:https?|ftp|file|data|javascript|mailto):|:\/\/|\bwww\.)/iu;
const FEED_CANDIDATE_KEY = /^[a-z0-9][a-z0-9._-]{0,79}:[a-z0-9][a-z0-9._:-]{0,158}$/u;
const MANUAL_CANDIDATE_KEY = /^manual:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/u;

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
    repliedAt: null,
    meetingAt: null,
    proposalAt: null,
    wonAt: null,
  };
}

function legacyMilestones(
  status: DakotaOperatorStatus,
  updatedAt: string,
): DakotaOperatorMilestones {
  const milestones = emptyMilestones();
  if (HUMAN_APPROVED_STATUS_SET.has(status)) milestones.humanApprovedAt = updatedAt;
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
): ValidationResult<DakotaOperatorRecordInput> {
  if (!hasExactKeys(value, expectedFields)) {
    return { valid: false, error: "Operator record has an invalid shape." };
  }

  if (typeof value.status !== "string" || !STATUS_SET.has(value.status)) {
    return { valid: false, error: "Operator record status is unsupported." };
  }

  const identity = validateIdentity(value.identity);
  if (!identity.valid) return identity;

  for (const field of Object.keys(DAKOTA_OPERATOR_TEXT_LIMITS) as DakotaOperatorTextField[]) {
    if (!isPlainText(value[field], DAKOTA_OPERATOR_TEXT_LIMITS[field])) {
      return { valid: false, error: `Operator record ${field} must be bounded plain text.` };
    }
  }
  if (
    HUMAN_APPROVED_STATUS_SET.has(value.status as string) &&
    (!(value.verifiedPain as string).trim() || !(value.offerFit as string).trim())
  ) {
    return {
      valid: false,
      error: "Human-approved pursuit states require verifiedPain and offerFit evidence.",
    };
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

  return { valid: true, value: value as unknown as DakotaOperatorRecordInput };
}

export function validateDakotaOperatorRecordInput(
  value: unknown,
): ValidationResult<DakotaOperatorRecordInput> {
  if (!isRecord(value)) {
    return { valid: false, error: "Operator record must be an object." };
  }
  return validateRecordFields(value, DAKOTA_OPERATOR_INPUT_FIELDS);
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
  return {
    valid: true,
    value: { candidate_key: value.candidate_key, record: record.value },
  };
}

function validateStoredRecord(value: unknown): ValidationResult<DakotaOperatorRecord> {
  if (!isRecord(value)) {
    return { valid: false, error: "Stored operator record must be an object." };
  }
  const hasMilestones = Object.hasOwn(value, "milestones");
  const fields = validateRecordFields(
    value,
    hasMilestones ? DAKOTA_OPERATOR_STORED_FIELDS : DAKOTA_OPERATOR_LEGACY_STORED_FIELDS,
  );
  if (!fields.valid) return fields;
  if (!isIsoTimestamp(value.updated_at)) {
    return { valid: false, error: "Stored operator record timestamp is invalid." };
  }
  const milestones = hasMilestones
    ? validateMilestones(value.milestones)
    : {
        valid: true as const,
        value: legacyMilestones(fields.value.status, value.updated_at),
      };
  if (!milestones.valid) return milestones;
  return {
    valid: true,
    value: {
      ...fields.value,
      milestones: milestones.value,
      updated_at: value.updated_at,
    },
  };
}

export function validateDakotaOperatorStateEnvelope(
  value: unknown,
): ValidationResult<DakotaOperatorStateEnvelope> {
  if (!isRecord(value) || !hasExactKeys(value, ["schema_version", "updated_at", "records"])) {
    return { valid: false, error: "Operator-state envelope has an invalid shape." };
  }
  if (value.schema_version !== DAKOTA_OPERATOR_STATE_SCHEMA) {
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
    const validation = validateStoredRecord(record);
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

export function createDakotaOperatorRecord(
  input: DakotaOperatorRecordInput,
  updatedAt: string,
  previous?: DakotaOperatorRecord,
): DakotaOperatorRecord {
  const milestones = previous
    ? { ...previous.milestones }
    : emptyMilestones();
  if (HUMAN_APPROVED_STATUS_SET.has(input.status) && milestones.humanApprovedAt === null) {
    milestones.humanApprovedAt = updatedAt;
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

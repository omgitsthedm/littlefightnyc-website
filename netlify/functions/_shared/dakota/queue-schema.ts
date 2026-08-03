import {
  DAKOTA_QUEUE_LIMIT,
  DAKOTA_QUEUE_SCHEMA,
} from "./constants";

export const DAKOTA_CANDIDATE_FIELDS = [
  "rank",
  "score",
  "business_name",
  "dba",
  "source",
  "source_id",
  "filed_at",
  "category",
  "phone",
  "address",
  "city",
  "state",
  "postal_code",
  "county_or_borough",
  "verified_url",
  "domain_status",
  "psi_status",
  "psi_mobile_performance",
  "missing_pieces",
  "diagnosis",
  "score_version",
  "score_reasons",
] as const;

type CandidateField = (typeof DAKOTA_CANDIDATE_FIELDS)[number];
type DakotaCandidateStringField = Exclude<
  CandidateField,
  "rank" | "score" | "psi_mobile_performance"
>;

export type DakotaCandidate = Record<DakotaCandidateStringField, string> & {
  rank: number;
  score: number;
  psi_mobile_performance: number | null;
};

export interface DakotaQueuePayload {
  schema_version: typeof DAKOTA_QUEUE_SCHEMA;
  generated_at: string;
  records: DakotaCandidate[];
}

export type QueueValidation =
  | { valid: true; payload: DakotaQueuePayload }
  | { valid: false; error: string };

const TOP_LEVEL_FIELDS = ["schema_version", "generated_at", "records"] as const;
const FIELD_LIMITS: Readonly<Record<CandidateField, number>> = {
  rank: 64,
  score: 64,
  business_name: 240,
  dba: 240,
  source: 80,
  source_id: 200,
  filed_at: 64,
  category: 160,
  phone: 64,
  address: 300,
  city: 120,
  state: 64,
  postal_code: 32,
  county_or_borough: 160,
  verified_url: 2_048,
  domain_status: 64,
  psi_status: 64,
  psi_mobile_performance: 64,
  missing_pieces: 2_000,
  diagnosis: 4_000,
  score_version: 80,
  score_reasons: 4_000,
};

const FORBIDDEN_CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const REQUIRED_STRING_FIELDS = new Set<CandidateField>([
  "business_name",
  "source",
  "source_id",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[],
): boolean {
  const keys = Object.keys(value);
  return (
    keys.length === expected.length &&
    expected.every((field) => Object.hasOwn(value, field))
  );
}

function isSafeString(value: unknown, maxLength: number): value is string {
  if (typeof value !== "string" || value.length > maxLength) return false;
  return !FORBIDDEN_CONTROL_CHARACTERS.test(value);
}

function isValidCandidateField(field: CandidateField, value: unknown): boolean {
  if (field === "rank") {
    return (
      typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 1 &&
      value <= DAKOTA_QUEUE_LIMIT
    );
  }

  if (field === "score") {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
  }

  if (field === "psi_mobile_performance") {
    return (
      value === null ||
      (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100)
    );
  }

  if (!isSafeString(value, FIELD_LIMITS[field])) return false;
  return !REQUIRED_STRING_FIELDS.has(field) || value.trim().length > 0;
}

function isValidGeneratedAt(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) {
    return false;
  }

  if (!/(?:Z|[+-]\d{2}:\d{2})$/u.test(value)) return false;
  return Number.isFinite(Date.parse(value));
}

function isSafeVerifiedUrl(value: string): boolean {
  if (value === "") return true;
  if (value !== value.trim() || /\s/u.test(value)) return false;

  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      url.username === "" &&
      url.password === "" &&
      url.hostname.length > 0
    );
  } catch {
    return false;
  }
}

export function validateQueuePayload(value: unknown): QueueValidation {
  if (!isRecord(value) || !hasExactKeys(value, TOP_LEVEL_FIELDS)) {
    return { valid: false, error: "Queue envelope has an invalid shape." };
  }

  if (value.schema_version !== DAKOTA_QUEUE_SCHEMA) {
    return { valid: false, error: "Queue schema version is unsupported." };
  }

  if (!isValidGeneratedAt(value.generated_at)) {
    return { valid: false, error: "generated_at must be an ISO timestamp." };
  }

  if (!Array.isArray(value.records) || value.records.length > DAKOTA_QUEUE_LIMIT) {
    return {
      valid: false,
      error: `records must contain at most ${DAKOTA_QUEUE_LIMIT} candidates.`,
    };
  }

  for (const [index, record] of value.records.entries()) {
    if (!isRecord(record) || !hasExactKeys(record, DAKOTA_CANDIDATE_FIELDS)) {
      return {
        valid: false,
        error: `records[${index}] has an invalid shape.`,
      };
    }

    for (const field of DAKOTA_CANDIDATE_FIELDS) {
      if (!isValidCandidateField(field, record[field])) {
        return {
          valid: false,
          error: `records[${index}].${field} has an invalid value.`,
        };
      }
    }

    if (record.rank !== index + 1) {
      return {
        valid: false,
        error: `records[${index}].rank must match its queue position.`,
      };
    }

    if (!isSafeVerifiedUrl(record.verified_url as string)) {
      return {
        valid: false,
        error: `records[${index}].verified_url must be an HTTP(S) URL without credentials.`,
      };
    }
  }

  return { valid: true, payload: value as unknown as DakotaQueuePayload };
}

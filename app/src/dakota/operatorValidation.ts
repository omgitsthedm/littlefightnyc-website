import type { OperatorIdentity } from "./types";

const HTML_LIKE_CONTENT = /(?:[<>]|<!--|-->|&(?:lt|gt|amp|quot|apos|#(?:x[0-9a-f]+|[0-9]+));)/iu;
const URL_LIKE_CONTENT = /(?:\b(?:https?|ftp|file|data|javascript|mailto):|:\/\/|\bwww\.)/iu;

export function containsUnsupportedControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0) ?? 0;
    if (
      codePoint <= 0x08 ||
      codePoint === 0x0b ||
      codePoint === 0x0c ||
      (codePoint >= 0x0e && codePoint <= 0x1f) ||
      codePoint === 0x7f
    ) {
      return true;
    }
  }
  return false;
}

const IDENTITY_LIMITS = {
  businessName: 240,
  dba: 240,
  category: 160,
  city: 160,
  borough: 160,
  source: 80,
  sourceId: 200,
} as const;

type IdentityTextField = keyof typeof IDENTITY_LIMITS;

const IDENTITY_LABELS: Record<IdentityTextField, string> = {
  businessName: "Business name",
  dba: "DBA",
  category: "Storefront category",
  city: "City",
  borough: "Borough or area",
  source: "Identity source",
  sourceId: "Identity source ID",
};

function plainTextError(label: string, value: string, maximumLength: number): string | null {
  if (value.length > maximumLength) return `${label} must be ${maximumLength} characters or fewer.`;
  if (value !== value.trim()) return `${label} cannot begin or end with spaces.`;
  if (containsUnsupportedControlCharacter(value)) return `${label} contains an unsupported control character.`;
  if (HTML_LIKE_CONTENT.test(value)) return `${label} must be plain text without HTML or encoded HTML.`;
  if (URL_LIKE_CONTENT.test(value)) return `${label} must be plain text; put public URLs in the dedicated URL fields.`;
  return null;
}

export function isSafePublicHttps(value: string): boolean {
  if (value === "") return true;
  if (
    value.length > 2_048 ||
    value !== value.trim() ||
    /[\s<>]/u.test(value) ||
    containsUnsupportedControlCharacter(value)
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
    const standardPort = url.port === "" || (url.protocol === "https:" && url.port === "443");

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

export function validateOperatorIdentity(identity: OperatorIdentity): string | null {
  for (const field of Object.keys(IDENTITY_LIMITS) as IdentityTextField[]) {
    const value = identity[field];
    if (value === undefined) continue;
    const error = plainTextError(IDENTITY_LABELS[field], value, IDENTITY_LIMITS[field]);
    if (error) return error;
    if (field === "businessName" && value.length === 0) return "Business name is required.";
  }

  if (!Object.hasOwn(identity, "businessName")) return "Business name is required.";
  if (identity.verifiedUrl !== undefined && !isSafePublicHttps(identity.verifiedUrl)) {
    return "Operator-verified website must be a safe public HTTPS URL.";
  }
  if (identity.publicSourceUrl !== undefined && !isSafePublicHttps(identity.publicSourceUrl)) {
    return "Public research source must be a safe public HTTPS URL.";
  }
  return null;
}

export function isRealDateOnly(value: string): boolean {
  if (value === "") return true;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

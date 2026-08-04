export const TECH_AUDIT_FOLLOW_UP_PREFERENCES = [
  "text",
  "phone",
  "email",
  "fastest",
] as const;

export type TechAuditFollowUpPreference =
  (typeof TECH_AUDIT_FOLLOW_UP_PREFERENCES)[number];
export type TechAuditContactRoute = "email" | "phone";
export type TechAuditPreferredRoute = TechAuditContactRoute | "sms";

export const TECH_AUDIT_LEAD_INTENTS = [
  "website",
  "support",
  "consulting",
  "systems",
  "general",
] as const;

export type TechAuditLeadIntent = (typeof TECH_AUDIT_LEAD_INTENTS)[number];

export const TECH_AUDIT_SESSION_KEYS = {
  draft: "lf_tech_audit_draft",
  intent: "lf_lead_intent",
  replyRoute: "lf_tech_audit_reply_route",
  report: "lf_tech_audit_report_id",
  submitted: "lf_tech_audit_submitted",
} as const;

export type TechAuditConfirmationState = {
  submitted: boolean;
  intent: TechAuditLeadIntent | null;
  replyRoute: TechAuditPreferredRoute | null;
  reportId: string;
};

export type TechAuditReplyLanguage = {
  action: "emails you" | "texts you" | "calls you" | "replies";
  expectation: "an email" | "a text" | "a call" | "a reply";
};

const FOLLOW_UP_PREFERENCE_SET = new Set<string>(TECH_AUDIT_FOLLOW_UP_PREFERENCES);
const LEAD_INTENT_SET = new Set<string>(TECH_AUDIT_LEAD_INTENTS);
const PREFERRED_ROUTE_SET = new Set<string>(["email", "phone", "sms"]);
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
const PHONE = /^\+?[0-9().\-\s]{7,32}(?:(?:x|ext\.?)\s*\d{1,8})?$/iu;
const CONFIRMATION_MARKER = "tech-audit";

/**
 * One shared contact contract powers both the public form and Dakota's inbound
 * mapper. A value accepted in the browser must be structurally usable by the
 * server; keeping that decision here prevents a successful-looking form post
 * from disappearing because the two sides interpreted the contact differently.
 */
export function techAuditContactRoute(value: string): TechAuditContactRoute | null {
  const contact = value.trim();
  if (contact.length <= 254 && EMAIL.test(contact)) return "email";
  if (contact.length > 40 || !PHONE.test(contact)) return null;
  const digitCount = contact.replace(/\D/gu, "").length;
  return digitCount >= 10 && digitCount <= 20 ? "phone" : null;
}

export function techAuditContactProblem(value: string): string | null {
  const contact = value.trim();
  if (contact === "") return "Add a phone or email so we can reply.";
  if (contact.includes("@")) {
    return techAuditContactRoute(contact) === "email"
      ? null
      : "That email looks incomplete — check for a typo.";
  }

  const digitCount = contact.replace(/\D/gu, "").length;
  if (techAuditContactRoute(contact) === "phone") return null;
  if (digitCount === 0) return "That does not look like a phone or email.";
  if (digitCount < 10) return "That phone number looks short — include the area code.";
  if (digitCount > 20) return "That phone number looks too long — check for a typo.";
  return "That phone number includes characters we cannot dial — check for a typo.";
}

export function normalizeTechAuditFollowUpPreference(
  value: unknown,
): TechAuditFollowUpPreference {
  return typeof value === "string" && FOLLOW_UP_PREFERENCE_SET.has(value)
    ? value as TechAuditFollowUpPreference
    : "fastest";
}

export function parseTechAuditLeadIntent(value: unknown): TechAuditLeadIntent | null {
  return typeof value === "string" && LEAD_INTENT_SET.has(value)
    ? value as TechAuditLeadIntent
    : null;
}

export function parseTechAuditPreferredRoute(value: unknown): TechAuditPreferredRoute | null {
  return typeof value === "string" && PREFERRED_ROUTE_SET.has(value)
    ? value as TechAuditPreferredRoute
    : null;
}

export function safeTechAuditReportId(value: unknown): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (trimmed.length === 0 || trimmed.length > 300) return "";
  return /^[a-z0-9](?:[a-z0-9-]{0,298}[a-z0-9])?$/.test(trimmed) ? trimmed : "";
}

/**
 * Resolve only exact routes. In particular, a phone number chosen for texting
 * is stored as SMS, while an email paired with a text request is not rewritten
 * into email consent.
 */
export function techAuditPreferredRoute(
  contactRoute: TechAuditContactRoute,
  preference: TechAuditFollowUpPreference,
): TechAuditPreferredRoute | null {
  if (preference === "fastest") return contactRoute;
  if (preference === "text") return contactRoute === "phone" ? "sms" : null;
  return preference === contactRoute ? contactRoute : null;
}

/**
 * Carry only non-sensitive, allowlisted state through Netlify's native POST
 * redirect. Contact details and form answers never enter the URL.
 */
export function techAuditConfirmationPath({
  intent,
  replyRoute,
  reportId = "",
}: {
  intent: TechAuditLeadIntent;
  replyRoute: TechAuditPreferredRoute | null;
  reportId?: string;
}): string {
  const params = new URLSearchParams({
    submitted: CONFIRMATION_MARKER,
    intent,
  });
  if (replyRoute) params.set("reply", replyRoute);
  const safeReportId = safeTechAuditReportId(reportId);
  if (safeReportId) params.set("report", safeReportId);
  return `/thanks/?${params.toString()}`;
}

export function readTechAuditConfirmation(search: string): TechAuditConfirmationState {
  const params = new URLSearchParams(search);
  return {
    submitted: params.get("submitted") === CONFIRMATION_MARKER,
    intent: parseTechAuditLeadIntent(params.get("intent")),
    replyRoute: parseTechAuditPreferredRoute(params.get("reply")),
    reportId: safeTechAuditReportId(params.get("report")),
  };
}

export function techAuditReplyLanguage(
  replyRoute: TechAuditPreferredRoute | null,
): TechAuditReplyLanguage {
  if (replyRoute === "email") return { action: "emails you", expectation: "an email" };
  if (replyRoute === "sms") return { action: "texts you", expectation: "a text" };
  if (replyRoute === "phone") return { action: "calls you", expectation: "a call" };
  return { action: "replies", expectation: "a reply" };
}

export function techAuditFollowUpProblem(
  contactValue: string,
  preference: TechAuditFollowUpPreference,
): string | null {
  const contactRoute = techAuditContactRoute(contactValue);
  if (!contactRoute || techAuditPreferredRoute(contactRoute, preference)) return null;
  if (preference === "text") {
    return "Text follow-up needs a phone number that can receive texts.";
  }
  if (preference === "phone") return "A phone call needs a phone number.";
  return "Email follow-up needs an email address.";
}

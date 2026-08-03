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

const FOLLOW_UP_PREFERENCE_SET = new Set<string>(TECH_AUDIT_FOLLOW_UP_PREFERENCES);
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u;
const PHONE = /^\+?[0-9().\-\s]{7,32}(?:(?:x|ext\.?)\s*\d{1,8})?$/iu;

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

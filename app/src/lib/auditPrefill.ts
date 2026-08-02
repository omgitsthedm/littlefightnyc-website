export const AUDIT_PREFILL_STORAGE_KEY = "lf_audit_prefill_v1";

export type AuditPrefillSource = "home" | "website_check_page";

const AUDIT_LAB_PATH = "/examples/audit/";
const MAX_URL_LENGTH = 2048;
const MAX_EMAIL_LENGTH = 254;

function boundedFieldValue(
  form: HTMLFormElement,
  name: "url" | "email",
  maxLength: number,
) {
  const field = form.querySelector<HTMLInputElement>(
    `[data-audit-prefill="${name}"]`,
  );
  return field
    ? field.value.trim().slice(0, maxLength)
    : "";
}

/**
 * Move prefill data to the Audit Lab without putting a submitted URL or email
 * in browser history, server logs, referrers, or analytics. The Lab consumes
 * and removes this same-tab record once. The preflight fields are deliberately
 * not named successful GET controls, so its no-JS fallback can carry the
 * bounded source but never URL/email.
 */
export function handoffToAuditLab(
  form: HTMLFormElement,
  source: AuditPrefillSource,
) {
  const record = {
    version: 1,
    createdAt: Date.now(),
    source,
    url: boundedFieldValue(form, "url", MAX_URL_LENGTH),
    email: boundedFieldValue(form, "email", MAX_EMAIL_LENGTH),
  };

  try {
    window.sessionStorage.setItem(
      AUDIT_PREFILL_STORAGE_KEY,
      JSON.stringify(record),
    );
  } catch {
    // Hardened browsers can reject storage. Continue to the Lab without PII
    // in the address bar; the visitor can re-enter the two fields there.
  }

  window.location.assign(AUDIT_LAB_PATH);
}

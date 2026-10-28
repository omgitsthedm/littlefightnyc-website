/* Lead attribution captures only fixed, public campaign labels once per
 * session. Form handoff must never collect a recipient, business, search
 * query, or advertising click ID from a landing-page URL. */
import { leadCampaignParameters, publicReferralParameters } from "./socialCampaign";
import { getAnalyticsConsent } from "./consent";

const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

const STORAGE_KEY = "lf-attribution";
let capturedDocument: Document | null = null;

export function clearAttribution(): void {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(STORAGE_KEY); } catch { /* Optional storage. */ }
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  if (getAnalyticsConsent() !== "granted") { clearAttribution(); return; }
  try {
    const search = new URLSearchParams(window.location.search);
    const tagged = ["utm_source", "utm_medium", "gclid", "gbraid", "wbraid", "msclkid"].some(key => search.has(key));
    // document.referrer does not change during SPA navigation. Re-reading it
    // after a paid or AI landing must not overwrite that arrival as organic.
    if (typeof document !== "undefined") {
      if (capturedDocument === document && !tagged) return;
      capturedDocument = document;
    }
    const campaign = leadCampaignParameters(search) || (!tagged && typeof document !== "undefined"
      ? publicReferralParameters(document.referrer) : null);
    // A new unknown campaign must not inherit credit from an older arrival.
    if (!campaign && tagged) { clearAttribution(); return; }
    if (!campaign) return;
    const found = Object.fromEntries(campaign) as Record<string, string>;
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(found)
    );
  } catch {
    // Storage unavailable (private mode etc.) — attribution is best-effort.
  }
}

export function readAttribution(): Record<string, string> {
  if (typeof window === "undefined") return {};
  if (getAnalyticsConsent() !== "granted") { clearAttribution(); return {}; }
  // Direct arrivals on the inquiry page can render before idle capture runs.
  captureAttribution();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const cached = new URLSearchParams();
    for (const key of PARAMS) {
      const value = (parsed as Record<string, unknown>)[key];
      if (typeof value === "string") cached.set(key, value);
    }
    const campaign = leadCampaignParameters(cached);
    return campaign ? Object.fromEntries(campaign) : {};
  } catch {
    return {};
  }
}

export function applyCurrentAttribution(body: URLSearchParams): URLSearchParams {
  // Recheck consent at the send boundary. Hidden inputs rendered before a
  // withdrawal must not retain a stale campaign in an otherwise valid inquiry.
  for (const key of PARAMS) body.delete(key);
  for (const [key, value] of Object.entries(readAttribution())) body.set(key, value);
  return body;
}

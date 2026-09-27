/* Lead attribution captures only fixed, public campaign labels once per
 * session. Form handoff must never collect a recipient, business, search
 * query, or advertising click ID from a landing-page URL. */
import { leadCampaignParameters } from "./socialCampaign";

const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

const STORAGE_KEY = "lf-attribution";

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const search = new URLSearchParams(window.location.search);
    const campaign = leadCampaignParameters(search);
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

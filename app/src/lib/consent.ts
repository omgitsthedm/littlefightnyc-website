export type AnalyticsConsent = "granted" | "denied" | null;

const STORAGE_KEY = "lf_analytics_consent_v1";
export const CONSENT_CHANGE_EVENT = "lf:analytics-consent";
export const CONSENT_OPEN_EVENT = "lf:open-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtagQueue() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function updateGoogleConsent(consent: Exclude<AnalyticsConsent, null>) {
  ensureGtagQueue();
  const value = consent === "granted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
}

/**
 * Establish a denied-by-default Google Consent Mode state before any vendor
 * config or event can run. A stored opt-in is then applied immediately.
 */
export function installConsentDefaults() {
  if (typeof window === "undefined") return;

  ensureGtagQueue();
  window.gtag?.("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });

  if (getAnalyticsConsent() === "granted") {
    updateGoogleConsent("granted");
  }
}

export function saveAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, consent);
  } catch {
    // Hardened/private browsers may reject storage. The current page still
    // honors the choice through the event detail even when it cannot persist.
  }

  updateGoogleConsent(consent);
  window.dispatchEvent(
    new CustomEvent<Exclude<AnalyticsConsent, null>>(CONSENT_CHANGE_EVENT, {
      detail: consent,
    }),
  );
}

export function onAnalyticsConsentChange(
  listener: (consent: Exclude<AnalyticsConsent, null>) => void,
) {
  const handle = (event: Event) => {
    const consent = (event as CustomEvent<Exclude<AnalyticsConsent, null>>).detail;
    if (consent === "granted" || consent === "denied") listener(consent);
  };

  window.addEventListener(CONSENT_CHANGE_EVENT, handle);
  return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handle);
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

export type ConsentChoice = "granted" | "denied" | null;
export type AnalyticsConsent = ConsentChoice;
export type AdvertisingConsent = ConsentChoice;

// Aside did not complete a usable TikTok Business handoff. Keep advertising
// measurement disabled until Little Fight can verify the destination account,
// access the reporting, and deliberately reopen this integration.
export const ADVERTISING_MEASUREMENT_AVAILABLE = false;

const ANALYTICS_STORAGE_KEY = "lf_analytics_consent_v1";
const ADVERTISING_STORAGE_KEY = "lf_advertising_consent_v1";
export const CONSENT_CHANGE_EVENT = "lf:analytics-consent";
export const ADVERTISING_CONSENT_CHANGE_EVENT = "lf:advertising-consent";
export const CONSENT_OPEN_EVENT = "lf:open-consent";
export const CONSENT_VISIBILITY_EVENT = "lf:consent-visibility";

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
    function gtag() {
      // Google Tag consumes the native Arguments object. An ordinary array
      // looks similar in tests but does not initialize the GA4 destination.
      // eslint-disable-next-line prefer-rest-params -- Google requires Arguments, not an Array.
      window.dataLayer?.push(arguments);
    };
}

export function getAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function getAdvertisingConsent(): AdvertisingConsent {
  if (typeof window === "undefined") return null;
  if (!ADVERTISING_MEASUREMENT_AVAILABLE) return "denied";

  try {
    const value = window.localStorage.getItem(ADVERTISING_STORAGE_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function updateGoogleAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  ensureGtagQueue();
  const value = consent === "granted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    analytics_storage: value,
  });
}

function updateGoogleAdvertisingConsent(
  consent: Exclude<AdvertisingConsent, null>,
) {
  ensureGtagQueue();
  const value = consent === "granted" ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
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

  const analyticsConsent = getAnalyticsConsent();
  const advertisingConsent = getAdvertisingConsent();
  if (analyticsConsent !== null) updateGoogleAnalyticsConsent(analyticsConsent);
  if (advertisingConsent !== null) updateGoogleAdvertisingConsent(advertisingConsent);
}

export function saveAnalyticsConsent(consent: Exclude<AnalyticsConsent, null>) {
  try {
    window.localStorage.setItem(ANALYTICS_STORAGE_KEY, consent);
  } catch {
    // Hardened/private browsers may reject storage. The current page still
    // honors the choice through the event detail even when it cannot persist.
  }

  updateGoogleAnalyticsConsent(consent);
  window.dispatchEvent(
    new CustomEvent<Exclude<AnalyticsConsent, null>>(CONSENT_CHANGE_EVENT, {
      detail: consent,
    }),
  );
}

export function saveAdvertisingConsent(
  consent: Exclude<AdvertisingConsent, null>,
) {
  const effectiveConsent = ADVERTISING_MEASUREMENT_AVAILABLE
    ? consent
    : "denied";
  try {
    window.localStorage.setItem(ADVERTISING_STORAGE_KEY, effectiveConsent);
  } catch {
    // The in-page event still makes the current choice effective when storage
    // is unavailable.
  }

  updateGoogleAdvertisingConsent(effectiveConsent);
  window.dispatchEvent(
    new CustomEvent<Exclude<AdvertisingConsent, null>>(
      ADVERTISING_CONSENT_CHANGE_EVENT,
      { detail: effectiveConsent },
    ),
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

export function onAdvertisingConsentChange(
  listener: (consent: Exclude<AdvertisingConsent, null>) => void,
) {
  const handle = (event: Event) => {
    const consent = (
      event as CustomEvent<Exclude<AdvertisingConsent, null>>
    ).detail;
    if (consent === "granted" || consent === "denied") listener(consent);
  };

  window.addEventListener(ADVERTISING_CONSENT_CHANGE_EVENT, handle);
  return () =>
    window.removeEventListener(ADVERTISING_CONSENT_CHANGE_EVENT, handle);
}

export function openConsentPreferences() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

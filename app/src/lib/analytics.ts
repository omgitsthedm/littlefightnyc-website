import {
  getAdvertisingConsent,
  getAnalyticsConsent,
  ADVERTISING_MEASUREMENT_AVAILABLE,
  onAdvertisingConsentChange,
  onAnalyticsConsentChange,
} from "./consent";

export type FirstPartyEventPlacement =
  | "home_hero"
  | "home_care"
  | "nav_desktop"
  | "mobile_menu"
  | "website_check_page"
  | "audit_lab"
  | "audit_report"
  | "client_desk"
  | "service_page"
  | "contact_block"
  | "contact_page"
  | "home_process"
  | "sticky_help"
  | "website_service_proof"
  | "es_hero"
  | "zh_hero"
  | "unknown";

export type FirstPartyEventSource =
  | "direct"
  | "home"
  | "navigation"
  | "website_check"
  | "audit_lab"
  | "audit_report"
  | "clients"
  | "service_page";

type FirstPartyEventContext = {
  placement: FirstPartyEventPlacement;
  source?: FirstPartyEventSource;
};

export type ServiceInquiryType =
  | "website"
  | "it_support"
  | "consulting"
  | "business_systems"
  | "other";

export type FirstPartyEventContract = {
  website_check_started: FirstPartyEventContext;
  website_check_ready: FirstPartyEventContext;
  report_opened: FirstPartyEventContext;
  human_review_requested: FirstPartyEventContext;
  booking_started: FirstPartyEventContext;
  service_inquiry: FirstPartyEventContext & { service: ServiceInquiryType };
};

export type FirstPartyEventName = keyof FirstPartyEventContract;

const FIRST_PARTY_EVENT_NAMES = new Set<FirstPartyEventName>([
  "website_check_started",
  "website_check_ready",
  "report_opened",
  "human_review_requested",
  "booking_started",
  "service_inquiry",
]);

const FIRST_PARTY_EVENT_PLACEMENTS = new Set<FirstPartyEventPlacement>([
  "home_hero",
  "home_care",
  "nav_desktop",
  "mobile_menu",
  "website_check_page",
  "audit_lab",
  "audit_report",
  "client_desk",
  "service_page",
  "contact_block",
  "contact_page",
  "home_process",
  "sticky_help",
  "website_service_proof",
  "es_hero",
  "zh_hero",
  "unknown",
]);

const FIRST_PARTY_EVENT_SOURCES = new Set<FirstPartyEventSource>([
  "direct",
  "home",
  "navigation",
  "website_check",
  "audit_lab",
  "audit_report",
  "clients",
  "service_page",
]);

const SERVICE_INQUIRY_TYPES = new Set<ServiceInquiryType>([
  "website",
  "it_support",
  "consulting",
  "business_systems",
  "other",
]);

function isFirstPartyEventName(value: string): value is FirstPartyEventName {
  return FIRST_PARTY_EVENT_NAMES.has(value as FirstPartyEventName);
}

function safeEventPlacement(value: string | undefined): FirstPartyEventPlacement {
  return FIRST_PARTY_EVENT_PLACEMENTS.has(value as FirstPartyEventPlacement)
    ? (value as FirstPartyEventPlacement)
    : "unknown";
}

function safeEventSource(value: string | undefined) {
  return FIRST_PARTY_EVENT_SOURCES.has(value as FirstPartyEventSource)
    ? (value as FirstPartyEventSource)
    : undefined;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
    TiktokAnalyticsObject?: string;
    ttq?: {
      load?: (pixelId: string) => void;
      page?: () => void;
      track?: (eventName: string, parameters?: Record<string, unknown>) => void;
      grantConsent?: () => void;
      revokeConsent?: () => void;
      methods?: string[];
      setAndDefer?: (target: Record<string, unknown>, method: string) => void;
      instance?: (pixelId: string) => Record<string, unknown>;
      _i?: Record<string, unknown>;
      _t?: Record<string, unknown>;
      _o?: Record<string, unknown>;
      [key: string]: unknown;
    };
  }
}

const configuredGaId = import.meta.env.VITE_GA_ID?.trim();
const GA_ID = configuredGaId || "G-0Q1TGWH0HL";
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
// No controlled Clarity project was handed off. Keep the dormant integration
// incapable of activating from a stale or inherited build variable until the
// destination account and data boundary are verified.
const CLARITY_MEASUREMENT_AVAILABLE = false;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID?.trim() ?? "";
const CLARITY_SRC = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
const configuredTikTokPixelId = import.meta.env.VITE_TIKTOK_PIXEL_ID?.trim();
const TIKTOK_PIXEL_ID = configuredTikTokPixelId || "";
const TIKTOK_EVENTS_SRC = "https://analytics.tiktok.com/i18n/pixel/events.js";
const VENDOR_BOOT_DELAY_MS = 1500;
let gaBooted = false;
let clarityBooted = false;
let tikTokBooted = false;
let tikTokPageTracked = false;
let vendorBootTimer: number | undefined;
let pendingGaEvents: Array<{ eventName: string; parameters: Record<string, unknown> }> = [];
let pendingTikTokEvents: Array<{ eventName: string; parameters?: Record<string, unknown> }> = [];

function hasRealGaId() {
  // The production property ID has a checked-in fallback so the live site can
  // still measure after consent if a build variable is ever missing. Keep
  // that convenience from polluting the same property from localhost,
  // deploy previews, or branch deploys.
  return (
    isProdHost() &&
    /^G-[A-Z0-9]{6,}$/.test(GA_ID) &&
    GA_ID !== "G-XXXXXXXXXX"
  );
}

function hasRealClarityId() {
  return (
    CLARITY_MEASUREMENT_AVAILABLE &&
    isProdHost() &&
    /^[a-z0-9]{6,}$/i.test(CLARITY_ID) &&
    CLARITY_ID !== "CLARITY_ID"
  );
}

function isProdHost() {
  // Production IDs can be hardcoded or present in a shared build environment.
  // Never let localhost, deploy previews, or branch deploys pollute the live
  // properties for any analytics vendor.
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "littlefightnyc.com" || host === "www.littlefightnyc.com";
}

function hasRealTikTokPixelId() {
  return (
    ADVERTISING_MEASUREMENT_AVAILABLE &&
    isProdHost() &&
    /^[A-Z0-9]{12,}$/i.test(TIKTOK_PIXEL_ID) &&
    TIKTOK_PIXEL_ID !== "TIKTOK_PIXEL_ID"
  );
}

function ensureGtag() {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag =
    window.gtag ??
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

function bootGoogleAnalytics() {
  if (getAnalyticsConsent() !== "granted" || !hasRealGaId() || gaBooted) return;

  ensureGtag();
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
  });
  window.gtag?.("js", new Date());
  window.gtag?.("config", GA_ID, { send_page_view: false });

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${GA_SRC}"]`);
  if (!existing) {
    const script = document.createElement("script");
    script.async = true;
    script.src = GA_SRC;
    document.head.appendChild(script);
  }

  gaBooted = true;
}

function bootClarity() {
  if (getAnalyticsConsent() !== "granted" || !hasRealClarityId() || clarityBooted) return;

  window.clarity =
    window.clarity ??
    Object.assign(
      (...args: unknown[]) => {
        window.clarity!.q = window.clarity!.q ?? [];
        window.clarity!.q?.push(args);
      },
      { q: [] as unknown[][] },
    );
  window.clarity("consentv2", {
    ad_Storage: getAdvertisingConsent() === "granted" ? "granted" : "denied",
    analytics_Storage: "granted",
  });

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${CLARITY_SRC}"]`);
  if (!existing) {
    const script = document.createElement("script");
    script.async = true;
    script.src = CLARITY_SRC;
    document.head.appendChild(script);
  }

  clarityBooted = true;
}

function ensureTikTokQueue() {
  if (window.ttq) return;

  // TikTok's events.js resolves the command queue via this global. Without it
  // the SDK dereferences `undefined` on init and throws
  // "Cannot set properties of undefined (setting '_env')". Set it before the
  // SDK script is inserted.
  window.TiktokAnalyticsObject = "ttq";

  const queue = [] as unknown as NonNullable<Window["ttq"]>;
  const methods = [
    "page",
    "track",
    "identify",
    "instances",
    "debug",
    "on",
    "off",
    "once",
    "ready",
    "alias",
    "group",
    "enableCookie",
    "disableCookie",
    "holdConsent",
    "revokeConsent",
    "grantConsent",
  ];

  queue.methods = methods;
  queue.setAndDefer = (target, method) => {
    target[method] = (...args: unknown[]) => {
      (target as unknown as unknown[]).push([method, ...args]);
    };
  };
  methods.forEach((method) => queue.setAndDefer?.(queue as Record<string, unknown>, method));
  queue.instance = (pixelId: string) => {
    queue._i = queue._i ?? {};
    const instance = (queue._i[pixelId] as unknown as unknown[] & Record<string, unknown>) ?? [];
    methods.forEach((method) => queue.setAndDefer?.(instance as Record<string, unknown>, method));
    queue._i[pixelId] = instance;
    return instance as Record<string, unknown>;
  };
  queue.load = (pixelId: string) => {
    queue._i = queue._i ?? {};
    queue._i[pixelId] = [];
    (queue._i[pixelId] as Record<string, unknown>)._u = TIKTOK_EVENTS_SRC;
    queue._t = queue._t ?? {};
    queue._t[pixelId] = Date.now();
    queue._o = queue._o ?? {};
    queue._o[pixelId] = {};

    if (!document.querySelector<HTMLScriptElement>(`script[src^="${TIKTOK_EVENTS_SRC}"]`)) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.src = `${TIKTOK_EVENTS_SRC}?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`;
      const firstScript = document.getElementsByTagName("script")[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    }
  };

  window.ttq = queue;
}

function bootTikTokPixel() {
  if (getAdvertisingConsent() !== "granted" || !hasRealTikTokPixelId() || tikTokBooted) return;

  ensureTikTokQueue();
  window.ttq?.grantConsent?.();
  window.ttq?.load?.(TIKTOK_PIXEL_ID);
  if (!tikTokPageTracked) {
    window.ttq?.page?.();
    tikTokPageTracked = true;
  }
  tikTokBooted = true;
}

function sendGaEvent(eventName: string, parameters: Record<string, unknown>) {
  if (getAnalyticsConsent() !== "granted") return;
  if (hasRealGaId() && typeof window.gtag === "function") {
    window.gtag("event", eventName, parameters);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...parameters });
}

function flushPendingGaEvents() {
  if (pendingGaEvents.length === 0) return;

  const events = pendingGaEvents;
  pendingGaEvents = [];
  events.forEach(({ eventName, parameters }) => sendGaEvent(eventName, parameters));
}

function sendTikTokEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (getAdvertisingConsent() !== "granted" || !hasRealTikTokPixelId()) return;
  if (!tikTokBooted) {
    pendingTikTokEvents.push({ eventName, parameters });
    scheduleVendorBoot();
    return;
  }

  window.ttq?.track?.(eventName, parameters);
}

function flushPendingTikTokEvents() {
  if (pendingTikTokEvents.length === 0) return;

  const events = pendingTikTokEvents;
  pendingTikTokEvents = [];
  events.forEach(({ eventName, parameters }) => sendTikTokEvent(eventName, parameters));
}

function bootVendors() {
  if (getAnalyticsConsent() === "granted") {
    bootGoogleAnalytics();
    bootClarity();
    flushPendingGaEvents();
  }
  if (getAdvertisingConsent() === "granted") {
    bootTikTokPixel();
    flushPendingTikTokEvents();
  }
}

function scheduleVendorBoot() {
  const hasMeasurementVendor =
    getAnalyticsConsent() === "granted" && (hasRealGaId() || hasRealClarityId());
  const hasAdvertisingVendor =
    getAdvertisingConsent() === "granted" && hasRealTikTokPixelId();
  if (
    vendorBootTimer !== undefined ||
    (!hasMeasurementVendor && !hasAdvertisingVendor)
  ) return;

  vendorBootTimer = window.setTimeout(() => {
    vendorBootTimer = undefined;
    if (window.requestIdleCallback) {
      window.requestIdleCallback(bootVendors, { timeout: 1500 });
      return;
    }

    bootVendors();
  }, VENDOR_BOOT_DELAY_MS);
}

function trackTikTokConversion(eventName: string, parameters: Record<string, unknown>) {
  const page = {
    url: new URL(window.location.pathname, window.location.origin).href,
    path: window.location.pathname,
    title: document.title,
  };

  if (eventName === "page_view") {
    // Fire on every SPA navigation, not just the first — otherwise TikTok
    // records one pageview per session while GA4 records each route change.
    if (tikTokBooted) {
      window.ttq?.page?.();
      tikTokPageTracked = true;
    }
    return;
  }

  if (
    eventName === "phone_click" ||
    eventName === "email_click" ||
    eventName === "sms_click" ||
    eventName === "human_review_requested" ||
    eventName === "service_inquiry"
  ) {
    sendTikTokEvent("Contact", { ...page, content_name: eventName, ...parameters });
  } else if (
    eventName === "tech_audit_intent" ||
    eventName === "website_plan_intent" ||
    eventName === "audit_scan_started" ||
    eventName === "tech_audit_started" ||
    eventName === "website_check_started" ||
    eventName === "booking_started"
  ) {
    sendTikTokEvent("ClickButton", { ...page, content_name: eventName, ...parameters });
  } else if (eventName === "website_check_ready" || eventName === "report_opened") {
    sendTikTokEvent("ViewContent", { ...page, content_name: eventName, ...parameters });
  } else if (eventName === "tech_audit_submit" || eventName === "form_submit" || eventName === "lead_success") {
    sendTikTokEvent("SubmitForm", { ...page, content_name: eventName, ...parameters });
  }
}

function funnelStage(eventName: string) {
  if (eventName === "lead_success" || eventName === "generate_lead") return "lead";
  if (eventName === "tech_audit_submit" || eventName === "form_submit") return "submit";
  if (eventName === "human_review_requested" || eventName === "service_inquiry") return "contact";
  if (eventName === "booking_started") return "submit";
  if (eventName.startsWith("intake_step_")) return "intake";
  if (
    eventName === "tech_audit_intent" ||
    eventName === "website_plan_intent" ||
    eventName === "tech_audit_started" ||
    eventName === "website_check_started"
  ) return "consideration";
  if (eventName === "website_check_ready" || eventName === "report_opened") return "engaged";
  if (eventName === "phone_click" || eventName === "email_click" || eventName === "sms_click") return "contact";
  if (eventName === "scroll_50") return "engaged";
  if (eventName === "page_view") return "awareness";
  return "diagnostic";
}

function track(eventName: string, parameters: Record<string, unknown> = {}, deferVendorBoot = false) {
  const analyticsAllowed = getAnalyticsConsent() === "granted";
  const advertisingAllowed = getAdvertisingConsent() === "granted";
  if (!analyticsAllowed && !advertisingAllowed) return;
  const normalized = {
    funnel_stage: funnelStage(eventName),
    ...parameters,
  };

  if (deferVendorBoot && analyticsAllowed && !gaBooted) {
    pendingGaEvents.push({ eventName, parameters: normalized });
    scheduleVendorBoot();
    return;
  }

  bootVendors();
  if (analyticsAllowed) sendGaEvent(eventName, normalized);
  if (advertisingAllowed) trackTikTokConversion(eventName, normalized);

  if (analyticsAllowed && typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

export function trackEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  track(eventName, parameters);
}

/**
 * Typed first-party conversion events. Only bounded taxonomy values are
 * accepted; the current pathname is injected here so callers cannot attach a
 * submitted URL, query string, report ID, email address, name, or free text.
 */
export function trackFirstPartyEvent<K extends FirstPartyEventName>(
  eventName: K,
  parameters: FirstPartyEventContract[K],
) {
  const placement = safeEventPlacement(parameters.placement);
  const source = safeEventSource(parameters.source);
  const safeParameters: Record<string, unknown> = {
    placement,
    page_path: window.location.pathname,
  };
  if (source) safeParameters.source = source;

  if (eventName === "service_inquiry") {
    const requestedService = (parameters as FirstPartyEventContract["service_inquiry"]).service;
    safeParameters.service = SERVICE_INQUIRY_TYPES.has(requestedService)
      ? requestedService
      : "other";
  }

  track(eventName, safeParameters);
}

export function trackPageView(path: string, title: string) {
  const pagePath = new URL(path, window.location.origin).pathname;
  track("page_view", {
    page_location: pagePath,
    page_path: pagePath,
    page_title: title,
  }, true);
}

/**
 * Expire the first-party cookies the vendors dropped.
 *
 * Withdrawing consent told each vendor to stop — gtag consent update, Clarity
 * consentv2, ttq.revokeConsent — but left every cookie already on the device.
 * Measured after granting then withdrawing on production: _ttp,
 * _tt_enable_cookie, ttcsid and ttcsid_<id> all still on .littlefightnyc.com,
 * expiring 2027-08-24. Thirteen months of a durable identifier tying that
 * browser to a TikTok ad profile, outliving the opt-out meant to end it.
 *
 * Blocking future writes is not withdrawal while the identifier persists.
 *
 * Matched by prefix because vendors mint per-property names — ttcsid_<id>,
 * _ga_<id>. Cleared across the bare host and the dot-prefixed domain, and both
 * the root and current path, because a cookie is only removable by a write
 * matching the domain and path it was set with, and we do not know which the
 * vendor used.
 *
 * Out of reach: _ttp is also set on .tiktok.com. That is TikTok's cookie on
 * TikTok's domain — no script on this origin can touch it. That one is between
 * the visitor's browser and TikTok.
 */
const ADVERTISING_COOKIE_PREFIXES = [
  "_ttp",
  "_tt_enable_cookie",
  "ttcsid",
];

const MEASUREMENT_COOKIE_PREFIXES = [
  "_ga",
  "_gid",
  "_gat",
  "_clck",
  "_clsk",
  "CLID",
];

function clearVendorCookies(prefixes: readonly string[]) {
  if (typeof document === "undefined") return;

  const host = window.location.hostname;
  const bare = host.replace(/^www\./, "");
  const domains = [undefined, host, `.${host}`, bare, `.${bare}`];
  const paths = ["/", window.location.pathname];

  const present = document.cookie
    .split(";")
    .map((pair) => pair.split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name));

  for (const name of new Set(present)) {
    if (!prefixes.some((prefix) => name === prefix || name.startsWith(prefix))) {
      continue;
    }
    for (const domain of domains) {
      for (const path of paths) {
        document.cookie =
          `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}` +
          (domain ? `; domain=${domain}` : "") +
          "; SameSite=Lax";
      }
    }
  }
}

function trackFirstPartyElementEvent(target: HTMLElement) {
  const namedEvent = target.dataset.lfEvent;
  if (!namedEvent || !isFirstPartyEventName(namedEvent)) return false;

  const context: FirstPartyEventContext = {
    placement: safeEventPlacement(target.dataset.lfLabel),
    source: safeEventSource(target.dataset.lfSource),
  };
  if (namedEvent === "service_inquiry") {
    const requestedService = target.dataset.lfService as ServiceInquiryType;
    trackFirstPartyEvent(namedEvent, {
      ...context,
      service: SERVICE_INQUIRY_TYPES.has(requestedService)
        ? requestedService
        : "other",
    });
  } else {
    trackFirstPartyEvent(namedEvent, context);
  }
  return true;
}

export function installAnalyticsHooks() {
  // A legacy analytics opt-in used to imply advertising consent. The new
  // contract does not: absent advertising consent is denied, and any durable
  // TikTok identifiers left by the old behavior are removed on the next load.
  if (getAdvertisingConsent() !== "granted") {
    window.ttq?.revokeConsent?.();
    tikTokPageTracked = false;
    clearVendorCookies(ADVERTISING_COOKIE_PREFIXES);
  }
  scheduleVendorBoot();
  let scrollTracked = false;

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("a, button")
      : null;
    if (!target) return;

    const namedEvent = target.dataset.lfEvent;
    if (namedEvent) {
      if (!trackFirstPartyElementEvent(target)) {
        track(namedEvent, {
          placement: target.dataset.lfLabel ?? "unknown",
          page_path: window.location.pathname,
        });
      }
    }

    if (!(target instanceof HTMLAnchorElement)) return;

    const href = target.getAttribute("href") ?? "";
    const contactParameters = {
      placement: target.dataset.lfLabel?.trim() || "contact_link",
      page_path: window.location.pathname,
    };

    if (href.startsWith("tel:")) {
      track("phone_click", { ...contactParameters, contact_channel: "phone" });
    } else if (href.startsWith("mailto:")) {
      track("email_click", { ...contactParameters, contact_channel: "email" });
    } else if (href.startsWith("sms:")) {
      track("sms_click", { ...contactParameters, contact_channel: "sms" });
    } else if (target.hostname && target.hostname !== window.location.hostname) {
      const destination = new URL(target.href, window.location.origin);
      track("external_link_click", {
        link_domain: destination.hostname,
        link_path: destination.pathname,
        page_path: window.location.pathname,
      });
    } else if (href.includes("tech-audit") && !namedEvent) {
      // Event name stays tech_audit_intent for analytics continuity — the
      // user-facing offer was renamed to "Tech Audit" on 2026-07-12.
      track("tech_audit_intent", {
        destination_path: new URL(href, window.location.origin).pathname,
        page_path: window.location.pathname,
      });
    }
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;

    // React prevents the browser GET after a valid website-check submit and
    // performs the privacy-safe same-tab handoff instead. Track that bounded
    // declarative event before the defaultPrevented guard. Native constraint
    // validation never dispatches submit, so invalid button clicks do not
    // become starts.
    trackFirstPartyElementEvent(form);

    // preventDefault() stops the submission but not the bubbling, so a
    // validation-blocked attempt still reached this window-level listener.
    // Every failed try was counted as a form_submit and a tech_audit_submit,
    // and it set lf_tech_audit_submitted — so someone who never got past the
    // required fields looked like a conversion and stopped being asked.
    if (event.defaultPrevented) return;

    const formName = form.getAttribute("name") ?? "unknown";
    track("form_submit", { form_name: formName, page_path: window.location.pathname });

    if (formName === "tech-audit-scratch") {
      try {
        window.sessionStorage.setItem("lf_tech_audit_submitted", "true");
      } catch {
        // Storage can be unavailable in hardened browsers; the generic submit event still fires.
      }

      track("tech_audit_submit", {
        form_name: formName,
        page_path: window.location.pathname,
      });
    }
  };

  const onScroll = () => {
    if (scrollTracked) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const depth = window.scrollY / scrollable;
    if (depth < 0.5) return;

    scrollTracked = true;
    track("scroll_50", {
      page_path: window.location.pathname,
      page_title: document.title,
    });
    window.removeEventListener("scroll", onScroll);
  };

  window.addEventListener("click", onClick, { passive: true });
  window.addEventListener("submit", onSubmit);
  window.addEventListener("scroll", onScroll, { passive: true });
  const removeConsentListener = onAnalyticsConsentChange((consent) => {
    if (consent === "granted") {
      window.clarity?.("consentv2", {
        ad_Storage: getAdvertisingConsent() === "granted" ? "granted" : "denied",
        analytics_Storage: "granted",
      });
      scheduleVendorBoot();
      trackPageView(
        `${window.location.pathname}${window.location.search}`,
        document.title,
      );
      return;
    }

    pendingGaEvents = [];
    if (vendorBootTimer !== undefined && getAdvertisingConsent() !== "granted") {
      window.clearTimeout(vendorBootTimer);
      vendorBootTimer = undefined;
    }
    window.gtag?.("consent", "update", {
      analytics_storage: "denied",
    });
    window.clarity?.("consentv2", {
      ad_Storage: getAdvertisingConsent() === "granted" ? "granted" : "denied",
      analytics_Storage: "denied",
    });
    clearVendorCookies(MEASUREMENT_COOKIE_PREFIXES);

    if (getAdvertisingConsent() !== "granted") {
      pendingTikTokEvents = [];
      window.ttq?.revokeConsent?.();
      tikTokPageTracked = false;
      clearVendorCookies(ADVERTISING_COOKIE_PREFIXES);
    }
  });

  const removeAdvertisingConsentListener = onAdvertisingConsentChange((consent) => {
    if (consent === "granted") {
      window.clarity?.("consentv2", {
        ad_Storage: "granted",
        analytics_Storage: getAnalyticsConsent() === "granted" ? "granted" : "denied",
      });
      window.ttq?.grantConsent?.();
      if (tikTokBooted && !tikTokPageTracked) {
        window.ttq?.page?.();
        tikTokPageTracked = true;
      }
      scheduleVendorBoot();
      return;
    }

    pendingTikTokEvents = [];
    if (vendorBootTimer !== undefined && getAnalyticsConsent() !== "granted") {
      window.clearTimeout(vendorBootTimer);
      vendorBootTimer = undefined;
    }
    window.clarity?.("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: getAnalyticsConsent() === "granted" ? "granted" : "denied",
    });
    window.ttq?.revokeConsent?.();
    tikTokPageTracked = false;
    clearVendorCookies(ADVERTISING_COOKIE_PREFIXES);
  });

  return () => {
    window.removeEventListener("click", onClick);
    window.removeEventListener("submit", onSubmit);
    window.removeEventListener("scroll", onScroll);
    removeConsentListener();
    removeAdvertisingConsentListener();
  };
}

import { getAnalyticsConsent, onAnalyticsConsentChange } from "./consent";

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

const GA_ID = import.meta.env.VITE_GA_ID?.trim() ?? "G-0Q1TGWH0HL";
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID?.trim() ?? "";
const CLARITY_SRC = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID?.trim() ?? "D94URCBC77UARCKAVGU0";
const TIKTOK_EVENTS_SRC = "https://analytics.tiktok.com/i18n/pixel/events.js";
const VENDOR_BOOT_DELAY_MS = 6500;
let gaBooted = false;
let clarityBooted = false;
let tikTokBooted = false;
let tikTokPageTracked = false;
let vendorBootTimer: number | undefined;
let pendingGaEvents: Array<{ eventName: string; parameters: Record<string, unknown> }> = [];
let pendingTikTokEvents: Array<{ eventName: string; parameters?: Record<string, unknown> }> = [];

function hasRealGaId() {
  return /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
}

function hasRealClarityId() {
  return /^[a-z0-9]{6,}$/i.test(CLARITY_ID) && CLARITY_ID !== "CLARITY_ID";
}

function isProdHost() {
  // The TikTok pixel id is hardcoded (so prod works without env config), which
  // means it would otherwise fire on localhost, deploy-previews, and branch
  // deploys and pollute the dataset. Only boot it on the canonical domain.
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "littlefightnyc.com" || host === "www.littlefightnyc.com";
}

function hasRealTikTokPixelId() {
  return (
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
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
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
    ad_Storage: "granted",
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
  if (getAnalyticsConsent() !== "granted" || !hasRealTikTokPixelId() || tikTokBooted) return;

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
  if (getAnalyticsConsent() !== "granted" || !hasRealTikTokPixelId()) return;
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
  if (getAnalyticsConsent() !== "granted") return;
  bootGoogleAnalytics();
  bootClarity();
  bootTikTokPixel();
  flushPendingGaEvents();
  flushPendingTikTokEvents();
}

function scheduleVendorBoot() {
  if (
    getAnalyticsConsent() !== "granted" ||
    vendorBootTimer !== undefined ||
    (!hasRealGaId() && !hasRealClarityId() && !hasRealTikTokPixelId())
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
    url: window.location.href,
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

  if (eventName === "phone_click" || eventName === "email_click" || eventName === "sms_click") {
    sendTikTokEvent("Contact", { ...page, content_name: eventName, ...parameters });
  } else if (
    eventName === "tech_audit_intent" ||
    eventName === "website_plan_intent" ||
    eventName === "audit_scan_started" ||
    eventName === "tech_audit_started"
  ) {
    sendTikTokEvent("ClickButton", { ...page, content_name: eventName, ...parameters });
  } else if (eventName === "tech_audit_submit" || eventName === "form_submit" || eventName === "lead_success") {
    sendTikTokEvent("SubmitForm", { ...page, content_name: eventName, ...parameters });
  }
}

function funnelStage(eventName: string) {
  if (eventName === "lead_success" || eventName === "generate_lead") return "lead";
  if (eventName === "tech_audit_submit" || eventName === "form_submit") return "submit";
  if (eventName.startsWith("intake_step_")) return "intake";
  if (
    eventName === "tech_audit_intent" ||
    eventName === "website_plan_intent" ||
    eventName === "tech_audit_started"
  ) return "consideration";
  if (eventName === "phone_click" || eventName === "email_click" || eventName === "sms_click") return "contact";
  if (eventName === "scroll_50") return "engaged";
  if (eventName === "page_view") return "awareness";
  return "diagnostic";
}

function track(eventName: string, parameters: Record<string, unknown> = {}, deferVendorBoot = false) {
  if (getAnalyticsConsent() !== "granted") return;
  const normalized = {
    funnel_stage: funnelStage(eventName),
    ...parameters,
  };

  if (deferVendorBoot && !gaBooted && !tikTokBooted) {
    pendingGaEvents.push({ eventName, parameters: normalized });
    scheduleVendorBoot();
    return;
  }

  bootVendors();
  sendGaEvent(eventName, normalized);
  trackTikTokConversion(eventName, normalized);

  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

export function trackEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  track(eventName, parameters);
}

export function trackPageView(path: string, title: string) {
  track("page_view", {
    page_location: path,
    page_path: new URL(path, window.location.origin).pathname,
    page_title: title,
  }, true);
}

export function installAnalyticsHooks() {
  scheduleVendorBoot();
  let scrollTracked = false;

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("a, button")
      : null;
    if (!target) return;

    const namedEvent = target.dataset.lfEvent;
    if (namedEvent) {
      track(namedEvent, {
        placement: target.dataset.lfLabel ?? "unknown",
        link_text: target.textContent?.trim(),
        page_path: window.location.pathname,
      });
    }

    if (!(target instanceof HTMLAnchorElement)) return;

    const href = target.getAttribute("href") ?? "";

    if (href.startsWith("tel:")) {
      track("phone_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (href.startsWith("mailto:")) {
      track("email_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (href.startsWith("sms:")) {
      track("sms_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (target.hostname && target.hostname !== window.location.hostname) {
      track("external_link_click", { link_url: target.href, link_text: target.textContent?.trim() });
    } else if (href.includes("tech-audit") && !namedEvent) {
      // Event name stays tech_audit_intent for analytics continuity — the
      // user-facing offer was renamed to "Tech Audit" on 2026-07-12.
      track("tech_audit_intent", { link_url: href, link_text: target.textContent?.trim() });
    }
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;

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
        ad_Storage: "granted",
        analytics_Storage: "granted",
      });
      window.ttq?.grantConsent?.();
      scheduleVendorBoot();
      trackPageView(
        `${window.location.pathname}${window.location.search}`,
        document.title,
      );
      return;
    }

    pendingGaEvents = [];
    pendingTikTokEvents = [];
    if (vendorBootTimer !== undefined) {
      window.clearTimeout(vendorBootTimer);
      vendorBootTimer = undefined;
    }
    window.gtag?.("consent", "update", {
      ad_storage: "denied",
      analytics_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.clarity?.("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });
    window.ttq?.revokeConsent?.();
  });

  return () => {
    window.removeEventListener("click", onClick);
    window.removeEventListener("submit", onSubmit);
    window.removeEventListener("scroll", onScroll);
    removeConsentListener();
  };
}

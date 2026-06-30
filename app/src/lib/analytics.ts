declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

const GA_ID = import.meta.env.VITE_GA_ID?.trim() ?? "";
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID?.trim() ?? "";
const CLARITY_SRC = `https://www.clarity.ms/tag/${encodeURIComponent(CLARITY_ID)}`;
const VENDOR_BOOT_DELAY_MS = 6500;
let gaBooted = false;
let clarityBooted = false;
let vendorBootTimer: number | undefined;
let pendingGaEvents: Array<{ eventName: string; parameters: Record<string, unknown> }> = [];

function hasRealGaId() {
  return /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== "G-XXXXXXXXXX";
}

function hasRealClarityId() {
  return /^[a-z0-9]{6,}$/i.test(CLARITY_ID) && CLARITY_ID !== "CLARITY_ID";
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
  if (!hasRealGaId() || gaBooted) return;

  ensureGtag();
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
  if (!hasRealClarityId() || clarityBooted) return;

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${CLARITY_SRC}"]`);
  if (!existing) {
    const script = document.createElement("script");
    script.async = true;
    script.src = CLARITY_SRC;
    document.head.appendChild(script);
  }

  clarityBooted = true;
}

function sendGaEvent(eventName: string, parameters: Record<string, unknown>) {
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

function bootVendors() {
  bootGoogleAnalytics();
  bootClarity();
  flushPendingGaEvents();
}

function scheduleVendorBoot() {
  if (vendorBootTimer !== undefined || (!hasRealGaId() && !hasRealClarityId())) return;

  vendorBootTimer = window.setTimeout(() => {
    vendorBootTimer = undefined;
    if (window.requestIdleCallback) {
      window.requestIdleCallback(bootVendors, { timeout: 1500 });
      return;
    }

    bootVendors();
  }, VENDOR_BOOT_DELAY_MS);
}

function track(eventName: string, parameters: Record<string, unknown> = {}, deferVendorBoot = false) {
  if (deferVendorBoot && !gaBooted) {
    pendingGaEvents.push({ eventName, parameters });
    scheduleVendorBoot();
    return;
  }

  bootVendors();
  sendGaEvent(eventName, parameters);

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
    const target = event.target instanceof Element ? event.target.closest("a") : null;
    if (!target) return;

    const href = target.getAttribute("href") ?? "";

    if (href.startsWith("tel:")) {
      track("phone_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (href.startsWith("mailto:")) {
      track("email_click", { link_url: href, link_text: target.textContent?.trim() });
    } else if (target.hostname && target.hostname !== window.location.hostname) {
      track("external_link_click", { link_url: target.href, link_text: target.textContent?.trim() });
    } else if (href.includes("fit-check")) {
      track("fit_check_intent", { link_url: href, link_text: target.textContent?.trim() });
    }
  };

  const onSubmit = (event: SubmitEvent) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;

    const formName = form.getAttribute("name") ?? "unknown";
    track("form_submit", { form_name: formName, page_path: window.location.pathname });

    if (formName === "fit-check-scratch") {
      try {
        window.sessionStorage.setItem("lf_fit_check_submitted", "true");
      } catch {
        // Storage can be unavailable in hardened browsers; the generic submit event still fires.
      }

      track("fit_check_submit", {
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

  return () => {
    window.removeEventListener("click", onClick);
    window.removeEventListener("submit", onSubmit);
    window.removeEventListener("scroll", onScroll);
  };
}

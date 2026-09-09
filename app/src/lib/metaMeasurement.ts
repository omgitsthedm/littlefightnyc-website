import routeMeta from "@/data/route-meta.json";
import { getMetaConsent, META_CONSENT_EVENT, META_CONSENT_KEY, refreshMetaConsent } from "./consent";
import { socialCampaignParameters } from "./socialCampaign";

// Verified in Little Fight NYC's Events Manager, September 9, 2026.
// This is the website dataset; the Publisher app has a different ID.
export const META_PIXEL_ID = "1093181229849562";
const SDK = "https://connect.facebook.net/en_US/fbevents.js";
const HOSTS = new Set(["littlefightnyc.com", "www.littlefightnyc.com"]);
const PUBLIC_PATHS = new Set(routeMeta.pages.map((page) => page.path));
type MetaQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][]; loaded: boolean; version: string; push?: MetaQueue; disablePushState?: boolean;
};
declare global { interface Window { fbq?: MetaQueue; _fbq?: MetaQueue; } }
type PendingEvent = { name: string; custom: boolean; source: string; location: string; id: string };
let ready = false;
let loading = false;
let pending: PendingEvent[] = [];
let lastPage = "";

// The SDK reads the real location and referrer. Do not load or emit on private
// routes, arbitrary query strings, report links, fragments, or unknown paths.
// No form values, automatic matching, DOM scraping, or inferred events.
export function isMetaPublicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!HOSTS.has(url.hostname) || url.protocol !== "https:" || url.port || url.username || url.password || url.hash ||
        !PUBLIC_PATHS.has(url.pathname)) return false;
    const social = socialCampaignParameters(url.searchParams);
    const google = url.searchParams.get("utm_source") === "google" &&
      url.searchParams.get("utm_medium") === "organic" &&
      url.searchParams.get("utm_campaign") === "business_profile";
    const seen = new Set<string>();
    for (const [key, val] of url.searchParams) {
      if (seen.has(key)) return false;
      seen.add(key);
      if (social?.get(key) === val) continue;
      if (google && ({ utm_source: "google", utm_medium: "organic", utm_campaign: "business_profile", utm_content: "booking" } as Record<string, string>)[key] === val) continue;
      if (key === "fbclid" && /^[A-Za-z0-9_.-]{16,500}$/.test(val)) continue;
      if (url.pathname === "/thanks/") {
        if (key === "submitted" && val === "tech-audit") continue;
        if (key === "intent" && ["website", "support", "consulting", "systems", "general"].includes(val)) continue;
        if (key === "reply" && ["email", "phone", "sms"].includes(val)) continue;
      }
      return false;
    }
    return true;
  } catch { return false; }
}

function allowed() {
  if (getMetaConsent() !== "granted" || !isMetaPublicUrl(window.location.href)) return false;
  if (!document.referrer) return true;
  try {
    const referrer = new URL(document.referrer);
    // Cross-origin browser referrers must be origin-only; never forward a
    // referring site's query or path that could identify its visitor.
    return HOSTS.has(referrer.hostname) ? isMetaPublicUrl(referrer.href)
      : referrer.pathname === "/" && !referrer.search && !referrer.hash;
  } catch { return false; }
}

function clearCookies() {
  if (!HOSTS.has(window.location.hostname)) return;
  const present = new Set(document.cookie.split(";").map((cookie) => cookie.trim().split("=")[0]));
  for (const name of ["_fbp", "_fbc"]) {
    if (!present.has(name)) continue;
    for (const domain of ["", window.location.hostname, ".littlefightnyc.com", "littlefightnyc.com"]) {
      document.cookie = name + "=; Max-Age=0; path=/; SameSite=Lax; Secure" + (domain ? "; domain=" + domain : "");
    }
  }
}

function stop() {
  pending = [];
  lastPage = "";
  window.fbq?.("consent", "revoke");
  clearCookies();
}

function flush() {
  if (!allowed()) { stop(); return; }
  if (!ready) return;
  window.fbq?.("consent", "grant");
  const events = pending;
  pending = [];
  for (const event of events) {
    // A route change while the SDK downloads must not relabel a prior event.
    if (event.location !== window.location.href) continue;
    window.fbq?.(event.custom ? "trackSingleCustom" : "trackSingle", META_PIXEL_ID,
      event.name, { content_name: event.source }, { eventID: event.id });
  }
}

function boot() {
  if (!allowed() || ready || loading) return;
  loading = true;
  const queue: MetaQueue = Object.assign((...args: unknown[]) => {
    if (queue.callMethod) queue.callMethod(...args);
    else queue.queue.push(args);
  }, { queue: [] as unknown[][], loaded: true, version: "2.0" });
  queue.push = queue;
  window.fbq = window.fbq ?? queue;
  window._fbq = window._fbq ?? window.fbq;
  // Our router owns page views and checks private URLs before every event.
  // Meta's automatic history listener would otherwise count the same visit twice.
  window.fbq.disablePushState = true;
  window.fbq("consent", "revoke");
  window.fbq("set", "autoConfig", false);
  window.fbq("set", "autoConfig", false, META_PIXEL_ID);
  window.fbq("init", META_PIXEL_ID);
  const script = document.createElement("script");
  script.src = SDK;
  script.async = true;
  script.referrerPolicy = "strict-origin";
  script.onload = () => { ready = true; loading = false; flush(); };
  script.onerror = () => { loading = false; pending = []; lastPage = ""; script.remove(); };
  document.head.appendChild(script);
}

function send(name: string, source: string, custom = false) {
  if (!allowed()) { stop(); return; }
  pending.push({ name, source, custom, location: window.location.href, id: crypto.randomUUID() });
  // Bound memory when a browser blocks a vendor indefinitely.
  pending = pending.slice(-20);
  boot();
  flush();
}

export function trackMetaPageView() {
  if (!allowed()) { stop(); return; }
  const location = window.location.href;
  if (lastPage === location) return;
  lastPage = location;
  send("PageView", "page_view");
  if (window.location.pathname.startsWith("/services/") && window.location.pathname !== "/services/") {
    send("ViewContent", "service_page");
  }
}

export function trackMetaEvent(event: string) {
  if (["phone_click", "email_click", "sms_click"].includes(event)) send("Contact", event);
  else if (event === "generate_lead") send("Lead", event);
  // An opened calendar or form is intent, not a completed booking or lead.
  else if (["booking_started", "website_check_started", "first_look_opened", "service_inquiry", "human_review_requested", "website_plan_intent"].includes(event)) {
    send("InquiryIntent", event, true);
  }
}

export function installMetaMeasurement() {
  const changed = () => { if (getMetaConsent() === "granted") trackMetaPageView(); else stop(); };
  const storage = (event: StorageEvent) => {
    if (event.key === META_CONSENT_KEY || event.key === null) { refreshMetaConsent(); changed(); }
  };
  window.addEventListener(META_CONSENT_EVENT, changed);
  window.addEventListener("storage", storage);
  window.addEventListener("hashchange", changed);
  changed();
  return () => {
    window.removeEventListener(META_CONSENT_EVENT, changed);
    window.removeEventListener("storage", storage);
    window.removeEventListener("hashchange", changed);
  };
}

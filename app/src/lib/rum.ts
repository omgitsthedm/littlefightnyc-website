import { onCLS, onFCP, onINP, onLCP, type Metric } from "web-vitals";
import { trackEvent } from "./analytics";
import { getAnalyticsConsent, onAnalyticsConsentChange } from "./consent";

let installed = false;
let listening = false;
let performanceRevoked = false;
let documentPath = "";
const reported = new Set<string>();
const metricValues = new Map<string, number>();

function browserBucket() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "safari";
  return "other";
}

function context(path = window.location.pathname) {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };

  return {
    page_path: path,
    browser: browserBucket(),
    device: window.matchMedia("(pointer: coarse)").matches ? "touch" : "desktop",
    connection: nav.connection?.effectiveType ?? "unknown",
  };
}

function reportMetric(metric: Metric) {
  if (performanceRevoked || getAnalyticsConsent() !== "granted" ||
      !Number.isFinite(metric.value) || metric.value < 0 ||
      !Number.isFinite(metric.delta) || metricValues.get(metric.id) === metric.value) return;
  metricValues.set(metric.id, metric.value);
  // Preserve the existing GA4 integer scale. IDs distinguish visits restored
  // from bfcache; deltas allow updates after a background/foreground cycle
  // without treating every callback as a new page or summing cumulative values.
  const scale = metric.name === "CLS" ? 1000 : 1;
  const value = Math.round(metric.value * scale);
  const delta = Math.round(metric.value * scale) - Math.round((metric.value - metric.delta) * scale);
  trackEvent("web_vital", {
    ...context(documentPath),
    page_location: new URL(documentPath, window.location.origin).href,
    metric_name: metric.name,
    metric_value: value,
    metric_delta: delta,
    metric_id: metric.id,
    metric_unit: metric.name === "CLS" ? "score_x1000" : "ms",
    metric_navigation: metric.navigationType,
    metric_version: "web-vitals-6",
    metric_rating: metric.rating.replace("-", "_"),
  });
}

function safeText(value: unknown, fallback: string) {
  const raw = typeof value === "string"
    ? value
    : value instanceof Error
      ? value.message
      : fallback;
  return raw
    .replace(/https?:\/\/[^\s]+/gi, "[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, "[phone]")
    .replace(/[?#][^\s]*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || fallback;
}

function reportError(kind: string, message: unknown, file = "") {
  if (getAnalyticsConsent() !== "granted") return;
  const cleaned = safeText(message, kind);
  const key = `${kind}:${cleaned}:${file}`;
  if (reported.has(key)) return;
  reported.add(key);

  trackEvent("client_error", {
    ...context(),
    // Keep diagnostics useful without sending a browser error message, URL,
    // filename, or other uncontrolled text to Google Analytics.
    failure_category: safeText(kind, "client_error")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .slice(0, 40),
  });
}

function observePerformance() {
  if (!("PerformanceObserver" in window)) return;
  // Delayed consent may follow a client-side route change. Navigation Timing
  // still identifies the document whose paint/layout metrics we are measuring.
  const navigation = performance.getEntriesByType("navigation")[0];
  documentPath = new URL(navigation?.name || window.location.href).pathname;
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    documentPath = window.location.pathname;
    metricValues.clear();
  }, true);
  // The standard, self-hosted library calculates CLS session windows, INP
  // outliers and bfcache lifecycles. Never send its entries, DOM targets or URLs.
  // Keep document-navigation metrics comparable across browsers; soft-nav
  // measurement is deliberately not enabled on this shared reporting stream.
  onCLS(reportMetric);
  onFCP(reportMetric);
  onINP(reportMetric);
  onLCP(reportMetric);
}

function beginRum() {
  if (installed || getAnalyticsConsent() !== "granted") return;
  installed = true;
  observePerformance();

  window.addEventListener(
    "error",
    (event) => {
      const target = event.target;
      if (target && target !== window && target instanceof Element) {
        const url = target.getAttribute("src") ?? target.getAttribute("href") ?? "";
        reportError("resource_error", target.tagName.toLowerCase(), url);
        return;
      }
      reportError("javascript_error", event.message, event.filename);
    },
    true,
  );
  window.addEventListener("unhandledrejection", (event) => {
    reportError("unhandled_rejection", event.reason);
  });
}

export function installRum() {
  if (listening) return;
  listening = true;
  beginRum();
  onAnalyticsConsentChange((consent) => {
    // web-vitals has no observer teardown/reset API. Once consent is withdrawn,
    // discard this document's performance stream even after re-grant, avoiding
    // a later report that includes the withdrawn interval. A new load resets it.
    if (installed && consent === "denied") performanceRevoked = true;
    if (consent === "granted") beginRum();
  });
}

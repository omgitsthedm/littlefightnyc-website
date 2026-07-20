import { trackEvent } from "./analyticsClient";
import { getAnalyticsConsent, onAnalyticsConsentChange } from "./consent";

type MetricName = "CLS" | "FCP" | "INP" | "LCP";

let installed = false;
const reported = new Set<string>();

function browserBucket() {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "safari";
  return "other";
}

function context() {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
  };

  return {
    page_path: window.location.pathname,
    browser: browserBucket(),
    device: window.matchMedia("(pointer: coarse)").matches ? "touch" : "desktop",
    connection: nav.connection?.effectiveType ?? "unknown",
  };
}

function metricRating(name: MetricName, value: number) {
  const limits: Record<MetricName, [number, number]> = {
    CLS: [0.1, 0.25],
    FCP: [1800, 3000],
    INP: [200, 500],
    LCP: [2500, 4000],
  };
  const [good, poor] = limits[name];
  return value <= good ? "good" : value <= poor ? "needs_improvement" : "poor";
}

function reportMetric(name: MetricName, value: number) {
  if (!Number.isFinite(value) || reported.has(name)) return;
  reported.add(name);
  const normalized = name === "CLS" ? Math.round(value * 1000) : Math.round(value);
  trackEvent("web_vital", {
    ...context(),
    metric_name: name,
    metric_value: normalized,
    metric_rating: metricRating(name, value),
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
    .replace(/[?#][^\s]*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180) || fallback;
}

function reportError(kind: string, message: unknown, file = "") {
  const cleaned = safeText(message, kind);
  const key = `${kind}:${cleaned}:${file}`;
  if (reported.has(key)) return;
  reported.add(key);

  trackEvent("client_error", {
    ...context(),
    error_type: kind,
    error_message: cleaned,
    file_name: file.split("/").pop()?.split("?")[0]?.slice(0, 80) ?? "",
  });
}

function observePerformance() {
  if (!("PerformanceObserver" in window)) return;
  const supported = PerformanceObserver.supportedEntryTypes ?? [];
  let lcp = 0;
  let cls = 0;
  let inp = 0;

  if (supported.includes("paint")) {
    const observer = new PerformanceObserver((list) => {
      const fcp = list.getEntriesByName("first-contentful-paint")[0];
      if (fcp) reportMetric("FCP", fcp.startTime);
    });
    observer.observe({ type: "paint", buffered: true });
  }

  if (supported.includes("largest-contentful-paint")) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      lcp = entries.at(-1)?.startTime ?? lcp;
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
  }

  if (supported.includes("layout-shift")) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
        if (!shift.hadRecentInput) cls += shift.value ?? 0;
      }
    });
    observer.observe({ type: "layout-shift", buffered: true });
  }

  if (supported.includes("event")) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEntry & { duration?: number; interactionId?: number };
        if ((interaction.interactionId ?? 0) > 0) {
          inp = Math.max(inp, interaction.duration ?? 0);
        }
      }
    });
    try {
      observer.observe({
        type: "event",
        buffered: true,
        durationThreshold: 40,
      } as PerformanceObserverInit);
    } catch {
      // Older WebKit accepts PerformanceObserver but not event timing options.
    }
  }

  const flush = () => {
    if (lcp > 0) reportMetric("LCP", lcp);
    reportMetric("CLS", cls);
    if (inp > 0) reportMetric("INP", inp);
  };
  window.addEventListener("pagehide", flush, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
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
  beginRum();
  onAnalyticsConsentChange((consent) => {
    if (consent === "granted") beginRum();
  });
}

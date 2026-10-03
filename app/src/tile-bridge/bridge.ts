import {
  getAnalyticsConsent,
  installConsentDefaults,
  onAnalyticsConsentChange,
} from "@/lib/consent";

type IslandKind = "tech-audit" | "contact" | "thanks" | "website-check";
type ReaderReadyDetail = { path?: unknown };
type InteractionDetail = {
  event?: unknown;
  contentId?: unknown;
  placement?: unknown;
};

type BridgeRuntime = typeof import("./island-runtime");
type AnalyticsModule = typeof import("@/lib/analytics");

const ISLAND_KINDS = new Set<IslandKind>([
  "tech-audit",
  "contact",
  "thanks",
  "website-check",
]);

let booted = false;
let runtimePromise: Promise<BridgeRuntime> | undefined;
let analyticsPromise: Promise<AnalyticsModule> | undefined;
let analyticsHooksInstalled = false;
let consentListenerInstalled = false;
let measurementStarted = false;
let pendingConsentDetail: unknown;
let consentOpenQueued = false;
let consentOpening = false;
let replayingConsentOpen = false;
let lastTrackedPath = "";
const exposedTileIds = new Set<string>();

function onIdle(task: () => void, timeout = 250) {
  const idle = (window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (idle) {
    idle(task, { timeout });
    return;
  }
  window.setTimeout(task, timeout);
}

function islandKind(value: string | null): IslandKind | null {
  return value && ISLAND_KINDS.has(value as IslandKind)
    ? value as IslandKind
    : null;
}

/**
 * Tile routes are static documents. Keep only the pathname as a measurement
 * identifier: query values can contain a business URL, report ID, or other
 * intake context that must never become analytics data.
 */
function publicPath(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 512) return null;
  try {
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return null;
    return url.pathname.replace(/\/{2,}/g, "/");
  } catch {
    return null;
  }
}

function interactionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9:_-]{0,79}$/.test(normalized) ? normalized : null;
}

function trackTileEvent(eventName: string, contentId: string) {
  if (getAnalyticsConsent() !== "granted") return;
  void prepareAnalytics()
    .then((analytics) => analytics.trackTileEvent(eventName, contentId))
    .catch(() => {});
}

function observeTileExposure(contentId: string) {
  if (exposedTileIds.has(contentId)) return;
  // Long readers can wrap their entire document in one element. Half of that
  // wrapper may never fit on screen; measure the visible story heading instead.
  const target = document.querySelector<HTMLElement>("#detail-body h1")
    ?? document.querySelector<HTMLElement>("#detail-body > :first-child");
  if (!target || typeof IntersectionObserver === "undefined") return;
  let dwellTimer: number | undefined;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
    if (!visible) {
      if (dwellTimer !== undefined) window.clearTimeout(dwellTimer);
      dwellTimer = undefined;
      return;
    }
    if (dwellTimer !== undefined) return;
    dwellTimer = window.setTimeout(() => {
      dwellTimer = undefined;
      observer.disconnect();
      if (getAnalyticsConsent() !== "granted") return;
      exposedTileIds.add(contentId);
      trackTileEvent("tile_exposure", contentId);
    }, 1000);
  }, { threshold: [0.5] });
  observer.observe(target);
}

function loadRuntime() {
  runtimePromise ??= import("./island-runtime");
  return runtimePromise;
}

function loadAnalytics() {
  analyticsPromise ??= import("@/lib/analytics");
  return analyticsPromise;
}

/**
 * The legacy application installed measurement hooks before its route manager
 * started emitting page views. Keep that ordering for static documents so a
 * consent change can initialize the existing Meta, Google Ads, and GA guards
 * before the bridge records anything.
 */
function prepareAnalytics() {
  return loadAnalytics().then((analytics) => {
    if (!analyticsHooksInstalled) {
      analytics.installAnalyticsHooks();
      analyticsHooksInstalled = true;
    }
    return analytics;
  });
}

function installMeasurement() {
  // A static page remains static for a first-time visitor. Do not download the
  // analytics/RUM code until the existing consent UI records a visit-counting
  // opt-in; the listener below starts it in the same page after that choice.
  if (measurementStarted || getAnalyticsConsent() !== "granted") return;
  measurementStarted = true;

  void prepareAnalytics()
    .then((analytics) => {
      // The old React route manager supplied the initial page view. Static
      // documents have no route manager, so the bridge supplies it exactly
      // once and only with the safe pathname.
      trackStaticPage(analytics, window.location.pathname);
    })
    .catch(() => {
      // Measurement is optional. A missing chunk never interrupts an inquiry.
    });

  void import("@/lib/rum")
    .then((rum) => rum.installRum())
    .catch(() => {});

  const captureAttribution = () => {
    void import("@/lib/attribution")
      .then((attribution) => attribution.captureAttribution())
      .catch(() => {});
  };

  captureAttribution();
}

function listenForMeasurementConsent() {
  if (!consentListenerInstalled) {
    consentListenerInstalled = true;
    onAnalyticsConsentChange((consent) => {
      if (consent !== "granted") return;
      installMeasurement();
    });
  }
}

function trackStaticPage(analytics: AnalyticsModule, path: string) {
  const safePath = publicPath(path);
  if (!safePath || safePath === lastTrackedPath) return;
  lastTrackedPath = safePath;
  analytics.trackPageView(safePath, document.title);
}

function mountIslands(path?: string) {
  const safePath = publicPath(path ?? window.location.pathname);
  const hosts = Array.from(document.querySelectorAll<HTMLElement>("[data-production-island]"));

  for (const host of hosts) {
    const kind = islandKind(host.dataset.productionIsland ?? null);
    const expectedPath = host.dataset.productionPath
      ? publicPath(host.dataset.productionPath)
      : null;
    if (!kind || host.dataset.productionIslandMounted === "true") continue;
    if (expectedPath && safePath !== expectedPath) continue;

    host.dataset.productionIslandMounted = "true";
    void loadRuntime()
      .then((runtime) => runtime.mountProductionIsland(host, kind))
      .catch(() => {
        // Keep the static document intact if a progressive island cannot load.
        delete host.dataset.productionIslandMounted;
      });
  }
}

function mountNotices(detail?: unknown) {
  // A bare `lf:open-consent` event is a valid reopen request. Keep its own
  // boolean rather than using the optional detail as a sentinel: callers such
  // as footer controls do not need to manufacture a trigger object.
  pendingConsentDetail = detail;
  consentOpenQueued = true;
  if (consentOpening) return;
  consentOpening = true;
  let runtime: BridgeRuntime | undefined;
  void loadRuntime()
    .then((loadedRuntime) => {
      runtime = loadedRuntime;
      return runtime.openConsentNotices();
    })
    // SiteNotices attaches its existing lf:open-consent handler in an effect.
    // Wait for a paint before replaying the user event so this works after a
    // cold dynamic import as well as when the dialog is reopened later.
    .then(() => new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
    }))
    .then(() => {
      if (!consentOpenQueued) return;
      const queued = pendingConsentDetail;
      pendingConsentDetail = undefined;
      consentOpenQueued = false;
      replayingConsentOpen = true;
      window.dispatchEvent(new CustomEvent("lf:open-consent", { detail: queued }));
      replayingConsentOpen = false;
    })
    // React applies the existing notice's visibility update asynchronously.
    // Reopen only after that update has had a paint, so a stale close from its
    // prior saved choice cannot leave an otherwise-visible panel inaccessible.
    .then(() => new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
    }))
    .then(() => runtime?.ensureConsentDialog())
    .catch(() => {
      // Privacy controls must not interrupt the static reader if a chunk fails.
    })
    .finally(() => {
      consentOpening = false;
    });
}

function listenForStaticEvents() {
  // The reader owns the fetched document and deliberately dispatches these
  // non-bubbling events on document. Listening there avoids changing its
  // keyboard/history behavior merely to mount a progressive island.
  document.addEventListener("lf:reader-ready", (event) => {
    const detail = (event as CustomEvent<ReaderReadyDetail>).detail;
    const path = publicPath(detail?.path);
    if (!path) return;
    mountIslands(path);
    if (getAnalyticsConsent() !== "granted") return;
    void prepareAnalytics()
      .then((analytics) => trackStaticPage(analytics, path))
      .catch(() => {});
  });

  document.addEventListener("lf:interaction", (event) => {
    const detail = (event as CustomEvent<InteractionDetail>).detail;
    const eventName = interactionId(detail?.event);
    const contentId = interactionId(detail?.contentId);
    if (!eventName || !contentId) return;
    if (eventName === "reader_open") {
      trackTileEvent("tile_open", contentId);
      trackTileEvent("answer_view", contentId);
      observeTileExposure(contentId);
    } else if (eventName === "reader_change") {
      trackTileEvent("answer_view", contentId);
      observeTileExposure(contentId);
    } else if (eventName === "search_result_selected") {
      trackTileEvent("search_result_selected", contentId);
    } else if (eventName === "search_no_match") {
      trackTileEvent("search_no_match", "mosaic");
    }
  });

  window.addEventListener("lf:open-consent", (event) => {
    if (replayingConsentOpen) return;
    // SiteNotices may still be closing its previous render when a footer or
    // another legacy island requests the panel. Capture this first, mount the
    // dialog, then replay it after its effect has subscribed. Without this,
    // the old listener can set its panel visible while the just-closing dialog
    // emits a stale `visible: false` and hides it again.
    event.stopImmediatePropagation();
    mountNotices((event as CustomEvent).detail);
  }, { capture: true });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-production-open-consent]")
      : null;
    if (!target) return;
    event.preventDefault();
    mountNotices({ trigger: target });
  });
}

/**
 * Starts the privacy-safe bridges after static HTML has painted. It is safe to
 * call more than once; the builder may call it after replacing reader content.
 */
export function bootTileBridge() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  installConsentDefaults();
  listenForStaticEvents();
  listenForMeasurementConsent();
  mountIslands();
  onIdle(installMeasurement);
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootTileBridge, { once: true });
  } else {
    bootTileBridge();
  }
}

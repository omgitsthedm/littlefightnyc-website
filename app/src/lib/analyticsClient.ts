type AnalyticsModule = typeof import("./analytics");

let analyticsModule: Promise<AnalyticsModule> | undefined;

function loadAnalytics(): Promise<AnalyticsModule> {
  analyticsModule ??= import("./analytics");
  return analyticsModule;
}

/**
 * Keep event call sites out of the vendor boot chunk. The module is normally
 * loaded by main.tsx at idle; this bridge also preserves very early events.
 */
export function trackEvent(eventName: string, parameters: Record<string, unknown> = {}) {
  void loadAnalytics()
    .then((analytics) => analytics.trackEvent(eventName, parameters))
    .catch(() => {
      // Analytics is non-critical and must never interrupt the user action.
    });
}

export function trackPageView(path: string, title: string) {
  void loadAnalytics()
    .then((analytics) => analytics.trackPageView(path, title))
    .catch(() => {
      // Route rendering must not depend on analytics availability.
    });
}

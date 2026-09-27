import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Metric } from "web-vitals";

const fixture = vi.hoisted(() => ({
  consent: "granted" as "granted" | "denied" | null,
  listeners: [] as ((consent: "granted" | "denied") => void)[],
  callbacks: new Map<string, (metric: Metric) => void>(),
  track: vi.fn(),
}));
vi.mock("./analytics", () => ({ trackEvent: fixture.track }));
vi.mock("./consent", () => ({
  getAnalyticsConsent: () => fixture.consent,
  onAnalyticsConsentChange: (listener: (consent: "granted" | "denied") => void) => {
    fixture.listeners.push(listener);
  },
}));
vi.mock("web-vitals", () => Object.fromEntries(
  ["CLS", "FCP", "INP", "LCP"].map((name) => [
    `on${name}`, (callback: (metric: Metric) => void) => fixture.callbacks.set(name, callback),
  ]),
));

function report(overrides: Partial<Metric> = {}) {
  const metric = {
    name: "CLS", value: 0.09, delta: 0.09, id: "v6-fixture-1",
    rating: "good", navigationType: "navigate", navigationId: 1,
    // Deliberately sensitive fixture data must never enter the payload.
    navigationURL: "https://littlefightnyc.com/?email=private@example.com",
    entries: [{ name: "private@example.com" }],
    ...overrides,
  } as Metric;
  fixture.callbacks.get(metric.name)?.(metric);
}
function consent(value: "granted" | "denied") {
  fixture.consent = value;
  fixture.listeners.forEach((listener) => listener(value));
}

describe("consented document performance reporting", () => {
  beforeEach(() => {
    vi.resetModules();
    fixture.consent = "granted";
    fixture.listeners = [];
    fixture.callbacks.clear();
    fixture.track.mockClear();
    vi.stubGlobal("window", Object.assign(new EventTarget(), {
      location: new URL("https://littlefightnyc.com/contact/?email=private@example.com"),
      PerformanceObserver: class {},
      matchMedia: () => ({ matches: false }),
    }));
    vi.stubGlobal("navigator", { userAgent: "Chrome/150 Safari/537.36" });
    vi.stubGlobal("performance", {
      getEntriesByType: () => [{ name: "https://littlefightnyc.com/services/?email=private@example.com" }],
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("preserves the initial page and integer units without exposing entries or query values", async () => {
    const { installRum } = await import("./rum");
    installRum();
    report();
    expect(fixture.track).toHaveBeenCalledWith("web_vital", {
      page_path: "/services/", page_location: "https://littlefightnyc.com/services/",
      browser: "chrome", device: "desktop", connection: "unknown",
      metric_name: "CLS", metric_value: 90, metric_delta: 90,
      metric_id: "v6-fixture-1", metric_unit: "score_x1000",
      metric_navigation: "navigate", metric_version: "web-vitals-6", metric_rating: "good",
    });
    expect(JSON.stringify(fixture.track.mock.calls)).not.toMatch(/private|email|entries|navigationURL/);
  });

  it("retains changed values with the same ID and distinguishes a restored visit", async () => {
    (await import("./rum")).installRum();
    report();
    report(); // An identical callback is not an additional observation.
    report({ value: 0.15, delta: 0.06, rating: "needs-improvement" });
    expect(fixture.track).toHaveBeenCalledTimes(2);
    expect(fixture.track.mock.calls[1][1]).toMatchObject({
      metric_id: "v6-fixture-1", metric_value: 150, metric_delta: 60, metric_rating: "needs_improvement",
    });
    window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted: true }));
    report({ id: "v6-fixture-2", value: 0, delta: 0, navigationType: "back-forward-cache" });
    expect(fixture.track.mock.calls[2][1]).toMatchObject({
      page_path: "/contact/", metric_id: "v6-fixture-2", metric_value: 0,
      metric_navigation: "back-forward-cache",
    });
  });

  it("starts once after opt-in and never reports a withdrawn interval after re-grant", async () => {
    fixture.consent = null;
    const { installRum } = await import("./rum");
    installRum();
    installRum();
    expect(fixture.callbacks.size).toBe(0);
    expect(fixture.listeners).toHaveLength(1);
    consent("granted");
    expect([...fixture.callbacks.keys()]).toEqual(["CLS", "FCP", "INP", "LCP"]);
    report();
    consent("denied");
    report({ value: 0.3, delta: 0.21 });
    consent("granted");
    report({ value: 0.4, delta: 0.1 });
    expect(fixture.track).toHaveBeenCalledTimes(1);
  });

  it("keeps timing values in milliseconds and rejects invalid observations", async () => {
    (await import("./rum")).installRum();
    report({ name: "INP", value: 208, delta: 208, rating: "needs-improvement" });
    expect(fixture.track.mock.calls[0][1]).toMatchObject({
      metric_name: "INP", metric_value: 208, metric_unit: "ms", metric_rating: "needs_improvement",
    });
    report({ id: "invalid", value: Number.NaN });
    report({ id: "invalid", value: -1 });
    report({ id: "invalid", delta: Number.POSITIVE_INFINITY });
    expect(fixture.track).toHaveBeenCalledTimes(1);
  });

  it("does not consume a private error while opted out or send its text after opting in", async () => {
    (await import("./rum")).installRum();
    const error = () => Object.assign(new Event("unhandledrejection"), {
      reason: new Error("private@example.com https://example.com/?secret=fixture"),
    });
    consent("denied");
    window.dispatchEvent(error());
    expect(fixture.track).not.toHaveBeenCalled();
    consent("granted");
    window.dispatchEvent(error());
    expect(fixture.track).toHaveBeenCalledWith("client_error", expect.objectContaining({ failure_category: "unhandled_rejection" }));
    expect(JSON.stringify(fixture.track.mock.calls)).not.toMatch(/private|secret|example\.com/);
  });
});

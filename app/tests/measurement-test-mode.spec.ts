import { expect, test, type Page } from "@playwright/test";

const requestedPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "4173", 10);
const localPreviewOrigin = `http://127.0.0.1:${requestedPort}`;

// Exercise the candidate through the production hostname so the test covers
// the branch that would otherwise load gtag.js. Every request still resolves
// to the local preview and no live property receives test traffic.
async function localProduction(page: Page, baseURL: string, requests: string[]) {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "littlefightnyc.com") {
      if (route.request().method() !== "GET") return route.abort();
      const response = await route.fetch({
        url: new URL(url.pathname + url.search, baseURL).href,
      });
      return route.fulfill({ response });
    }
    if (["www.googletagmanager.com", "connect.facebook.net", "www.clarity.ms", "analytics.tiktok.com"].includes(url.hostname)) {
      requests.push(url.hostname);
      return route.abort();
    }
    return route.continue();
  });
}

test.use({ serviceWorkers: "block" });

test(
  "ordinary QA stays local across routes while diagnostic collection is explicit and marked @chromium-desktop",
  async ({ browser }) => {
    const qaContext = await browser.newContext();
    const qaPage = await qaContext.newPage();
    const qaVendorRequests: string[] = [];
    await qaPage.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      (window as unknown as { __measurementEvents: unknown[] }).__measurementEvents = [];
      window.addEventListener("lf:measurement-qa", (event) => {
        (window as unknown as { __measurementEvents: unknown[] }).__measurementEvents.push(
          (event as CustomEvent).detail,
        );
      });
      document.addEventListener("click", (event) => {
        if ((event.target as Element | null)?.closest('a[href^="tel:"]')) event.preventDefault();
      });
    });
    await localProduction(qaPage, localPreviewOrigin, qaVendorRequests);

    await qaPage.goto("https://littlefightnyc.com/?qa=1", { waitUntil: "networkidle" });
    await expect.poll(() => qaPage.evaluate(() =>
      (window as unknown as { __measurementEvents: Array<{ eventName?: string }> })
        .__measurementEvents.map((event) => event.eventName),
    )).toContain("page_view");
    await qaPage.locator('a[href^="tel:"]:visible').first().click();
    await expect.poll(() => qaPage.evaluate(() =>
      (window as unknown as { __measurementEvents: Array<{ eventName?: string }> })
        .__measurementEvents.map((event) => event.eventName),
    )).toContain("phone_click");
    expect(await qaPage.evaluate(() => sessionStorage.getItem("lfnyc_measurement_test"))).toBe("qa");
    expect(qaVendorRequests).toEqual([]);
    expect(await qaPage.locator('script[src*="googletagmanager.com"], script[src*="connect.facebook.net"]').count()).toBe(0);

    await qaPage.goto("https://littlefightnyc.com/about/", { waitUntil: "networkidle" });
    await expect.poll(() => qaPage.evaluate(() =>
      (window as unknown as { __measurementEvents: Array<{ parameters?: { measurement_test?: string } }> })
        .__measurementEvents.some((event) => event.parameters?.measurement_test === "qa"),
    )).toBe(true);
    expect(qaVendorRequests).toEqual([]);
    await qaContext.close();

    const diagnosticContext = await browser.newContext();
    const diagnosticPage = await diagnosticContext.newPage();
    await diagnosticPage.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      const calls: unknown[][] = [];
      (window as unknown as { __gaCalls: unknown[][] }).__gaCalls = calls;
      window.gtag = (...args: unknown[]) => calls.push(args);
    });
    await diagnosticPage.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "littlefightnyc.com") {
        if (route.request().method() !== "GET") return route.abort();
        const response = await route.fetch({
          url: new URL(url.pathname + url.search, localPreviewOrigin).href,
        });
        return route.fulfill({ response });
      }
      if (url.hostname === "www.googletagmanager.com") {
        return route.fulfill({ contentType: "text/javascript", body: "" });
      }
      return route.continue();
    });
    await diagnosticPage.goto("https://littlefightnyc.com/?qa=diagnostic", { waitUntil: "networkidle" });
    await expect.poll(() => diagnosticPage.evaluate(() =>
      (window as unknown as { __gaCalls: unknown[][] }).__gaCalls.some((call) =>
        call[0] === "event" && call[1] === "page_view" &&
        (call[2] as { debug_mode?: boolean; traffic_type?: string })?.debug_mode === true &&
        (call[2] as { traffic_type?: string })?.traffic_type === "internal",
      ),
    )).toBe(true);
    expect(await diagnosticPage.evaluate(() => sessionStorage.getItem("lfnyc_measurement_test"))).toBe("diagnostic");
    expect(await diagnosticPage.locator('script[src*="connect.facebook.net"], script[src*="clarity.ms"], script[src*="tiktok.com"]').count()).toBe(0);
    await diagnosticContext.close();
  },
);

test(
  "QA and diagnostic URLs stay silent until analytics consent on both public surfaces @chromium-desktop",
  async ({ browser }) => {
    const scenarios = [
      { path: "/?qa=1", event: "lf:measurement-qa" },
      { path: "/?qa=diagnostic", event: "lf:measurement-qa" },
      { path: "/examples/audit/?qa=1", event: "lf:audit-analytics" },
      { path: "/examples/audit/?qa=diagnostic", event: "lf:audit-analytics" },
    ];

    for (const scenario of scenarios) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const vendorRequests: string[] = [];
      await page.addInitScript((eventName) => {
        (window as unknown as { __deniedMeasurementEvents: unknown[] }).__deniedMeasurementEvents = [];
        window.addEventListener(eventName, (event) => {
          (window as unknown as { __deniedMeasurementEvents: unknown[] })
            .__deniedMeasurementEvents.push((event as CustomEvent).detail);
        });
      }, scenario.event);
      await localProduction(page, localPreviewOrigin, vendorRequests);
      await page.goto(`https://littlefightnyc.com${scenario.path}`, { waitUntil: "networkidle" });

      expect(
        await page.evaluate(() =>
          (window as unknown as { __deniedMeasurementEvents: unknown[] })
            .__deniedMeasurementEvents,
        ),
        scenario.path,
      ).toEqual([]);
      expect(vendorRequests, scenario.path).toEqual([]);
      expect(
        await page.locator(
          'script[src*="googletagmanager.com"], script[src*="connect.facebook.net"], script[src*="clarity.ms"], script[src*="tiktok.com"]',
        ).count(),
        scenario.path,
      ).toBe(0);
      await context.close();
    }
  },
);

test(
  "Audit Lab ordinary QA emits its bounded local event without a GA request @chromium-desktop",
  async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const vendorRequests: string[] = [];
    await page.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      (window as unknown as { __auditEvents: unknown[] }).__auditEvents = [];
      window.addEventListener("lf:audit-analytics", (event) => {
        (window as unknown as { __auditEvents: unknown[] }).__auditEvents.push(
          (event as CustomEvent).detail,
        );
      });
    });
    await localProduction(page, localPreviewOrigin, vendorRequests);
    await page.goto("https://littlefightnyc.com/examples/audit/?qa=1", { waitUntil: "networkidle" });
    await expect.poll(() => page.evaluate(() =>
      (window as unknown as { __auditEvents: Array<{ eventName?: string; parameters?: { measurement_test?: string } }> })
        .__auditEvents.some((event) => event.eventName === "page_view" && event.parameters?.measurement_test === "qa"),
    )).toBe(true);
    expect(vendorRequests).toEqual([]);
    expect(await page.locator('script[src*="googletagmanager.com"]').count()).toBe(0);
    await context.close();

    const diagnosticContext = await browser.newContext();
    const diagnosticPage = await diagnosticContext.newPage();
    await diagnosticPage.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      const calls: unknown[][] = [];
      (window as unknown as { __gaCalls: unknown[][] }).__gaCalls = calls;
      window.gtag = (...args: unknown[]) => calls.push(args);
    });
    await localProduction(diagnosticPage, localPreviewOrigin, []);
    await diagnosticPage.goto("https://littlefightnyc.com/examples/audit/?qa=diagnostic", { waitUntil: "networkidle" });
    await expect.poll(() => diagnosticPage.evaluate(() =>
      (window as unknown as { __gaCalls: unknown[][] }).__gaCalls.some((call) =>
        call[0] === "event" && call[1] === "page_view" &&
        (call[2] as { debug_mode?: boolean; traffic_type?: string })?.debug_mode === true &&
        (call[2] as { traffic_type?: string })?.traffic_type === "internal",
      ),
    )).toBe(true);
    expect(await diagnosticPage.evaluate(() => sessionStorage.getItem("lfnyc_measurement_test"))).toBe("diagnostic");
    await diagnosticContext.close();
  },
);

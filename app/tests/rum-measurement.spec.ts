import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";

// This runs the built RUM chunk, not a copied observer or a source-module
// approximation. The fixture is served under the production origin solely so
// the production analytics gate is exercised without a vendor request.
test.use({ serviceWorkers: "block" });

const fixturePath = "/__rum-measurement-fixture/";

type LayoutShift = {
  value: number;
  startTime: number;
  hadRecentInput: boolean;
};

function builtRumAsset() {
  const assetDirectory = fileURLToPath(new URL("../dist/assets/", import.meta.url));
  const filename = readdirSync(assetDirectory).find((file) => /^rum-[\w-]+\.js$/u.test(file));
  if (!filename) throw new Error("The production build did not emit a RUM asset.");
  return `/assets/${filename}`;
}

function fixture(asset: string) {
  // The only state here is consent and a local gtag queue. It deliberately
  // contains no URL parameters, contact data, or production-only globals.
  return `<!doctype html>
<meta charset="utf-8">
<title>RUM local measurement fixture</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font: 20px/1.4 system-ui, sans-serif; }
  #anchor { min-height: 360px; padding: 32px; background: #f97316; color: #111; }
  #tail { min-height: 720px; padding: 32px; background: #f5f5f5; }
  .fixture-shift { height: 140px; background: #111; color: #fff; }
</style>
<script>
  localStorage.setItem("lf_analytics_consent_v1", "granted");
  window.dataLayer = [];
  window.gtag = function () { window.dataLayer.push(arguments); };
</script>
<main id="anchor">The anchor must visibly move for a real layout-shift entry.</main>
<section id="tail">The viewport stays occupied while the test shifts the anchor.</section>
<script type="module">
  import { installRum } from ${JSON.stringify(asset)};
  installRum();
  document.documentElement.dataset.rumFixtureReady = "true";
</script>`;
}

async function localProductionFixture(page: Page, baseURL: string) {
  const asset = builtRumAsset();
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname !== "littlefightnyc.com") return route.abort();
    if (request.method() !== "GET") return route.abort();
    if (url.pathname === fixturePath) {
      return route.fulfill({ contentType: "text/html", body: fixture(asset) });
    }
    return route.fulfill({ response: await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` }) });
  });
}

async function webVitalEvents(page: Page) {
  return page.evaluate(() => (window.dataLayer ?? [])
    .map((command) => Array.from(command as ArrayLike<unknown>))
    .filter((command) => command[0] === "event" && command[1] === "web_vital")
    .map((command) => command[2] as Record<string, unknown>));
}

function maximumClsSessionWindow(entries: LayoutShift[]) {
  let maximum = 0;
  let score = 0;
  let windowStart = 0;
  let previous = 0;

  for (const entry of [...entries].sort((left, right) => left.startTime - right.startTime)) {
    if (entry.startTime - previous > 1_000 || entry.startTime - windowStart > 5_000) {
      score = 0;
      windowStart = entry.startTime;
    }
    score += entry.value;
    previous = entry.startTime;
    maximum = Math.max(maximum, score);
  }
  return maximum;
}

test(
  "built RUM reports maximum-session CLS against the initial document path @chromium-desktop",
  async ({ page, baseURL }) => {
    await localProductionFixture(page, baseURL!);
    await page.goto(`https://littlefightnyc.com${fixturePath}`, { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-rum-fixture-ready", "true");

    const shifts = await page.evaluate(async () => {
      const entries: LayoutShift[] = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          entries.push({
            value: shift.value,
            startTime: shift.startTime,
            hadRecentInput: shift.hadRecentInput,
          });
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });

      const causeShift = () => {
        const band = document.createElement("div");
        band.className = "fixture-shift";
        band.textContent = "A deliberate automated shift";
        document.body.prepend(band);
      };
      // These are script-driven (not a recent input) and more than a second
      // apart, so each is a distinct CLS session window in the browser.
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      causeShift();
      await new Promise((resolve) => window.setTimeout(resolve, 1_150));
      causeShift();
      await new Promise((resolve) => window.setTimeout(resolve, 1_150));
      causeShift();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      observer.disconnect();
      return entries;
    });

    expect(shifts).toHaveLength(3);
    expect(shifts.every((shift) => !shift.hadRecentInput)).toBe(true);
    expect(shifts[1].startTime - shifts[0].startTime).toBeGreaterThan(1_000);
    expect(shifts[2].startTime - shifts[1].startTime).toBeGreaterThan(1_000);
    const total = shifts.reduce((sum, shift) => sum + shift.value, 0);
    const maximum = maximumClsSessionWindow(shifts);
    expect(total).toBeGreaterThan(maximum);

    // A SPA route can change before the page-lifecycle flush. CWV values here
    // still belong to the document that created them, not this later history
    // state.
    await page.evaluate(() => {
      history.pushState({}, "", "/services/");
      window.dispatchEvent(new PopStateEvent("popstate"));
      // web-vitals v6 flushes its final metric on a hidden document. This is
      // only a fixture lifecycle signal; the shifts above remain real browser
      // LayoutShift entries. Do not use pagehide here: it is not a v6 flush.
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => "hidden",
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await expect.poll(async () => (await webVitalEvents(page))
      .filter((event) => event.metric_name === "CLS").length).toBe(1);
    const cls = (await webVitalEvents(page)).find((event) => event.metric_name === "CLS");
    expect(cls).toMatchObject({
      page_path: fixturePath,
      metric_name: "CLS",
      metric_value: Math.round(maximum * 1_000),
    });
    expect(cls?.metric_value).not.toBe(Math.round(total * 1_000));
  },
);

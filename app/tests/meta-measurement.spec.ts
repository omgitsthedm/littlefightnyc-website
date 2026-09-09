import { expect, test, type Page } from "@playwright/test";

type Command = unknown[];
async function commands(page: Page) {
  return page.evaluate(() => (window as Window & { metaCommands?: unknown[][] }).metaCommands ?? []);
}
const hits = (all: Command[], name?: string) => all.filter((row) =>
  ["trackSingle", "trackSingleCustom"].includes(String(row[0])) && (!name || row[2] === name));

async function localProduction(page: Page, baseURL: string, options: { consent?: boolean; gpc?: boolean; delay?: boolean } = {}) {
  const sdkRequests: string[] = [];
  await page.addInitScript(({ consent, gpc }) => {
    if (consent) localStorage.setItem("lf_meta_consent_v1", "granted");
    if (gpc) Object.defineProperty(navigator, "globalPrivacyControl", { value: true });
    document.addEventListener("click", (event) => {
      if ((event.target as Element)?.closest('a[href^="tel:"],a[href^="mailto:"],a[href^="sms:"]')) event.preventDefault();
    });
  }, options);
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "littlefightnyc.com") {
      if (route.request().method() !== "GET") return route.abort();
      const response = await route.fetch({ url: baseURL + url.pathname + url.search });
      return route.fulfill({ response });
    }
    if (url.hostname === "connect.facebook.net") {
      sdkRequests.push(url.href);
      if (options.delay) await new Promise((resolve) => setTimeout(resolve, 600));
      return route.fulfill({ contentType: "text/javascript", body: [
        "window.metaCommands = [];",
        "window.fbq.callMethod = function() { window.metaCommands.push(Array.from(arguments)); };",
        "window.fbq.queue.forEach(function(args) { window.fbq.callMethod.apply(null, args); });",
        "window.fbq.queue = [];",
      ].join("\n") });
    }
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return sdkRequests;
}

test("Meta requires its own consent, tracks SPA once, and stops on withdrawal @chromium-desktop @chromium-mobile", async ({ page, baseURL }) => {
  const sdk = await localProduction(page, baseURL!);
  await page.goto("https://littlefightnyc.com/", { waitUntil: "networkidle" });
  expect(sdk).toEqual([]);
  await page.getByRole("button", { name: "Allow visit counting", exact: true }).click();
  expect(sdk).toEqual([]);
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await page.getByRole("button", { name: "Allow visits + Meta", exact: true }).click();
  await expect.poll(async () => hits(await commands(page), "PageView").length).toBe(1);
  const first = await commands(page);
  expect(first).toContainEqual(["set", "autoConfig", false, "1093181229849562"]);
  expect(first).toContainEqual(["init", "1093181229849562"]);
  expect(first.some((row) => row[0] === "init" && row.length > 2)).toBe(false);
  await page.evaluate(() => {
    history.pushState({}, "", "/services/custom-local-websites/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect.poll(async () => hits(await commands(page), "PageView").length).toBe(2);
  expect(hits(await commands(page), "ViewContent")).toHaveLength(1);
  await page.locator('a[href^="tel:"]:visible').first().click();
  await expect.poll(async () => hits(await commands(page), "Contact").length).toBe(1);
  await page.evaluate(() => {
    document.cookie = "_fbp=fixture; path=/; Secure";
    document.cookie = "_fbc=fixture; path=/; Secure";
  });
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await page.getByRole("button", { name: "Essential only", exact: true }).click();
  const before = hits(await commands(page)).length;
  await page.locator('a[href^="tel:"]:visible').first().click();
  expect(hits(await commands(page))).toHaveLength(before);
  expect((await commands(page)).at(-1)).toEqual(["consent", "revoke"]);
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/_fb[pc]=/);
  const ids = hits(await commands(page)).map((row) => (row[4] as { eventID: string }).eventID);
  expect(new Set(ids).size).toBe(ids.length);
});

test("Meta never loads on private URLs, legacy consent, or GPC @chromium-desktop", async ({ browser, baseURL }) => {
  for (const scenario of [
    { url: "/?email=private-fixture%40example.com", consent: true },
    { url: "/thanks/?report=private-report-fixture", consent: true },
    { url: "/?utm_source=facebook&utm_medium=organic_social&utm_campaign=new_chapter_2026_09&utm_content=private-fixture", consent: true },
    { url: "/", consent: true, gpc: true },
    { url: "/", consent: false },
  ]) {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const page = await context.newPage();
    const sdk = await localProduction(page, baseURL!, scenario);
    await page.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      localStorage.setItem("lf_advertising_consent_v1", "granted");
    });
    await page.goto("https://littlefightnyc.com" + scenario.url, { waitUntil: "networkidle" });
    expect(sdk, scenario.url).toEqual([]);
    expect(hits(await commands(page))).toEqual([]);
    await context.close();
  }
});

test("Meta lead means confirmed redirect, not refresh or form opening @chromium-desktop", async ({ page, baseURL }) => {
  await localProduction(page, baseURL!, { consent: true });
  await page.goto("https://littlefightnyc.com/thanks/?submitted=tech-audit&intent=website&reply=email", { waitUntil: "networkidle" });
  await expect.poll(async () => hits(await commands(page), "Lead").length).toBe(1);
  expect(JSON.stringify(hits(await commands(page)))).not.toContain("private-fixture");
  await page.reload({ waitUntil: "networkidle" });
  expect(hits(await commands(page), "Lead")).toHaveLength(0);
  await page.goto("https://littlefightnyc.com/tech-audit/", { waitUntil: "networkidle" });
  expect(hits(await commands(page), "Lead")).toHaveLength(0);
});

test("consent withdrawal while Meta downloads drops the pending event @chromium-desktop", async ({ page, baseURL }) => {
  await localProduction(page, baseURL!, { delay: true });
  await page.goto("https://littlefightnyc.com/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Allow visits + Meta", exact: true }).click();
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await page.getByRole("button", { name: "Essential only", exact: true }).click();
  await expect.poll(async () => (await commands(page)).some((row) => row[0] === "init")).toBe(true);
  expect(hits(await commands(page))).toEqual([]);
});

test("approved organic post labels survive GA sanitation; private fields do not @chromium-desktop", async ({ page, baseURL }) => {
  await page.goto(baseURL + "/?utm_source=facebook&utm_medium=organic_social&utm_campaign=new_chapter_2026_09&utm_content=01-interior-design-studios&email=private-fixture%40example.com");
  await page.getByRole("button", { name: "Allow visit counting", exact: true }).click();
  const locations = await page.evaluate(() => (window.dataLayer ?? [])
    .filter((row) => (row as { event?: string })?.event === "page_view")
    .map((row) => (row as { page_location: string }).page_location));
  expect(locations.length).toBeGreaterThan(0);
  expect(locations.at(-1)).toContain("utm_content=01-interior-design-studios");
  expect(locations.at(-1)).not.toContain("private-fixture");
  expect(await page.locator('script[src*="connect.facebook.net"]').count()).toBe(0);
});

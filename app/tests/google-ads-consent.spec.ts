import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

const campaign = "utm_source=google&utm_medium=cpc&utm_campaign=gulf_websites_search_2026_09&utm_content=search_human_help";
const clickId = "GoogleClickFixture_1234567890";
const landing = `https://littlefightnyc.com/tech-audit/?intent=website&${campaign}&gclid=${clickId}&email=private%40example.com`;

async function localProduction(page: Page, baseURL: string, options: { legacy?: boolean; gpc?: boolean } = {}) {
  const vendors: string[] = [];
  await page.addInitScript(({ legacy, gpc }) => {
    if (legacy) {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      localStorage.setItem("lf_advertising_consent_v1", "granted");
    }
    if (gpc) Object.defineProperty(navigator, "globalPrivacyControl", { value: true });
    document.addEventListener("click", (event) => {
      if ((event.target as Element)?.closest('a[href^="tel:"],a[href^="mailto:"],a[href^="sms:"]')) event.preventDefault();
    });
  }, options);
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "littlefightnyc.com") {
      if (route.request().method() !== "GET") return route.abort();
      return route.fulfill({ response: await route.fetch({ url: baseURL + url.pathname + url.search }) });
    }
    vendors.push(url.hostname);
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return vendors;
}

async function state(page: Page) {
  return page.evaluate(() => {
    const commands = (window.dataLayer ?? []).map((row) => Array.from(row as ArrayLike<unknown>));
    const consent = Object.assign({}, ...commands.filter((row) => row[0] === "consent").map((row) => row[2]));
    return { commands, consent };
  });
}

test("Google measurement needs fresh consent and never enables Meta or remarketing @chromium-desktop @chromium-mobile", async ({ page, baseURL }) => {
  const vendors = await localProduction(page, baseURL!);
  await page.goto(landing, { waitUntil: "networkidle" });
  expect(vendors).toEqual([]);
  expect((await state(page)).consent).toMatchObject({ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  await page.getByRole("button", { name: "Allow visits + Google Ads", exact: true }).click();
  await expect.poll(async () => (await state(page)).commands.filter((row) => row[0] === "event" && row[1] === "page_view").length).toBe(1);
  const result = await state(page);
  expect(result.consent).toMatchObject({ analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "denied" });
  const config = result.commands.find((row) => row[0] === "config");
  expect(config?.[2]).toMatchObject({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  expect(JSON.stringify(config)).toContain(`gclid=${clickId}`);
  expect(JSON.stringify(result.commands.filter((row) => ["config", "event", "set"].includes(String(row[0]))))).not.toMatch(/private|example\.com|email=/);
  expect(vendors).toContain("www.googletagmanager.com");
  expect(vendors).not.toContain("connect.facebook.net");
  expect(vendors).not.toContain("analytics.tiktok.com");
  expect(await page.evaluate(() => localStorage.getItem("lf_meta_consent_v1"))).toBe("denied");

  // Withdrawal applies before any subsequent event, including stored cookies.
  await page.evaluate(() => {
    document.cookie = "_gcl_aw=fixture; path=/; Secure";
    document.cookie = "_gac_fixture=fixture; path=/; Secure";
  });
  await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
  await page.getByRole("button", { name: "Allow visit counting", exact: true }).click();
  expect((await state(page)).consent).toMatchObject({ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
  expect(await page.evaluate(() => document.cookie)).not.toMatch(/_gcl|_gac/);
  await page.locator('a[href^="tel:"]:visible').first().click();
  const lastEvent = (await state(page)).commands.filter((row) => row[0] === "event").at(-1);
  expect(lastEvent?.[1]).toBe("phone_click");
  expect(JSON.stringify(lastEvent)).not.toContain(clickId);
});

test("legacy consent and GPC cannot authorize Google advertising @chromium-desktop", async ({ browser, baseURL }) => {
  for (const gpc of [false, true]) {
    const context = await browser.newContext({ serviceWorkers: "block" });
    const page = await context.newPage();
    await localProduction(page, baseURL!, { legacy: true, gpc });
    await page.goto(landing, { waitUntil: "networkidle" });
    await expect.poll(async () => (await state(page)).commands.some((row) => row[0] === "config")).toBe(true);
    expect((await state(page)).consent).toMatchObject({ ad_storage: "denied", ad_user_data: "denied" });
    expect(JSON.stringify((await state(page)).commands)).not.toContain(clickId);
    if (gpc) {
      await page.getByRole("button", { name: "Privacy choices", exact: true }).click();
      await page.getByRole("button", { name: "Allow visits + Google Ads", exact: true }).click();
      expect((await state(page)).consent).toMatchObject({ ad_storage: "denied", ad_user_data: "denied" });
      expect(await page.evaluate(() => localStorage.getItem("lf_google_ads_consent_v1"))).toBe("denied");
    }
    await context.close();
  }
});

test("Google click IDs require valid bounded values and the approved campaign @chromium-desktop", async ({ page, baseURL }) => {
  await localProduction(page, baseURL!);
  await page.goto(`https://littlefightnyc.com/tech-audit/?${campaign}&gclid=private%40example.com&gbraid=ValidBraidFixture_123&wbraid=${"x".repeat(257)}`);
  await page.getByRole("button", { name: "Allow visits + Google Ads", exact: true }).click();
  await page.locator('a[href^="tel:"]:visible').first().click();
  const lastEvent = (await state(page)).commands.filter((row) => row[0] === "event").at(-1);
  expect(JSON.stringify(lastEvent)).toContain("gbraid=ValidBraidFixture_123");
  expect(JSON.stringify(lastEvent)).not.toMatch(/private|gclid=|wbraid=/);
  await page.goto(`https://littlefightnyc.com/tech-audit/?utm_source=google&utm_medium=cpc&utm_campaign=unknown&gclid=${clickId}`, { waitUntil: "networkidle" });
  await expect.poll(async () => (await state(page)).commands.some((row) => row[0] === "config")).toBe(true);
  expect(JSON.stringify((await state(page)).commands)).not.toContain(clickId);
});

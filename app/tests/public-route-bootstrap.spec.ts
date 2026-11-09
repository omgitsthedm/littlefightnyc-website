import { expect, test } from "@playwright/test";

// These tests deliberately hold route requests and replace the Audit Lab
// destination with an inert local fixture. A service-worker cache must not
// bypass those network controls or consume the test's private prefill record.
test.use({ serviceWorkers: "block" });

test(
  "the complete header keeps readable separated routes and actions across desktop widths @all-projects",
  async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    for (const width of [768, 1216, 1280, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const header = page.locator(".lf-nav");
      await expect(header.getByRole("link", { name: "Get a free first look", exact: true })).toBeVisible();
      await expect(header.getByRole("button", { name: /Call or text/ })).toBeVisible();
      if (width >= 1216) {
        await expect(header.getByRole("navigation", { name: "Primary", exact: true }).getByRole("link")).toHaveCount(6);
      }
      const layout = await header.evaluate((element) => {
        const selectors = [".lf-nav__brand", ".lf-nav__primary", ".lf-nav__actions"];
        const boxes = selectors.map((selector) => element.querySelector(selector)!)
          .filter((node) => node.getBoundingClientRect().width > 0)
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return { left: rect.left, right: rect.right };
          });
        const cta = element.querySelector(".lf-nav__start")!;
        const ctaRect = cta.getBoundingClientRect();
        return {
          gaps: boxes.slice(1).map((box, index) => box.left - boxes[index].right),
          right: boxes[boxes.length - 1].right,
          viewport: document.documentElement.clientWidth,
          ctaHeight: ctaRect.height,
          ctaText: Number.parseFloat(getComputedStyle(cta).fontSize),
        };
      });
      expect(layout.gaps.every((gap) => gap >= 8), `${width}px header groups collide: ${JSON.stringify(layout)}`).toBe(true);
      expect(layout.right).toBeLessThanOrEqual(layout.viewport);
      expect(layout.ctaHeight).toBeGreaterThanOrEqual(44);
      expect(layout.ctaHeight).toBeLessThanOrEqual(48);
      expect(layout.ctaText).toBeGreaterThanOrEqual(16);
    }
  },
);

test(
  "a direct public URL keeps the real composition and entered values while its leaf chunk is delayed @all-projects",
  async ({ page }) => {
    let releaseChunk = () => {};
    const chunkReleased = new Promise<void>((resolve) => {
      releaseChunk = resolve;
    });
    let requestedChunk = () => {};
    const chunkRequested = new Promise<void>((resolve) => {
      requestedChunk = resolve;
    });
    await page.route("**/assets/WebsiteCheck-*.js", async (route) => {
      requestedChunk();
      await chunkReleased;
      await route.continue();
    });

    await page.goto("/website-check/", { waitUntil: "domcontentloaded" });
    const snapshot = page.locator('[data-lf-route-snapshot="initial"]');
    const mount = page.locator("[data-lf-route-mount]");

    await chunkRequested;
    await expect(snapshot).toBeVisible();
    await expect(snapshot).toContainText("See what a new customer sees.");
    await expect(mount).toHaveAttribute("hidden", "");
    // WebKit's FontFaceSet.ready can await document load, which is deliberately
    // held by the route request. Load the fonts we measure directly instead.
    await page.evaluate(() => Promise.all([
      document.fonts.load('700 90px "Oswald Variable"'),
      document.fonts.load('400 20px "Barlow"'),
      document.fonts.load('500 16px "JetBrains Mono"'),
    ]).then(() => undefined));
    const landmarks = ["h1", "#website-check-start", ".lf-website-check__form", ".lf-quiet-foot"];
    const initial = await snapshot.evaluate((element, selectors) => selectors.map((selector) => {
      const rect = element.querySelector(selector)!.getBoundingClientRect();
      return { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }), landmarks);
    await snapshot.getByLabel("Website URL", { exact: true }).fill("example.com");
    await snapshot.getByLabel("Email for your private report", { exact: true }).fill("owner@example.com");

    releaseChunk();
    await expect(snapshot).toHaveCount(0, { timeout: 5_000 });
    await expect(mount).not.toHaveAttribute("hidden", "");
    await expect(mount.getByRole("heading", { name: "See what a new customer sees." })).toBeVisible();
    await expect(mount.getByLabel("Website URL", { exact: true })).toHaveValue("example.com");
    await expect(mount.getByLabel("Email for your private report", { exact: true })).toHaveValue("owner@example.com");
    await expect(mount.getByLabel("Email for your private report", { exact: true })).toBeFocused();
    const interactive = await mount.evaluate((element, selectors) => selectors.map((selector) => {
      const rect = element.querySelector(selector)!.getBoundingClientRect();
      return { x: rect.x, y: rect.y + window.scrollY, width: rect.width, height: rect.height };
    }), landmarks);
    for (let index = 0; index < landmarks.length; index += 1) {
      for (const dimension of ["x", "y", "width", "height"] as const) {
        expect(Math.abs(interactive[index][dimension] - initial[index][dimension]),
          `${landmarks[index]} ${dimension}: initial ${initial[index][dimension]}, interactive ${interactive[index][dimension]}`,
        ).toBeLessThanOrEqual(2);
      }
    }
  },
);

test(
  "an explicit check submitted during loading keeps private details and hands off once @all-projects",
  async ({ page }) => {
    let releaseChunk = () => {};
    const held = new Promise<void>((resolve) => { releaseChunk = resolve; });
    let requestedChunk = () => {};
    const requested = new Promise<void>((resolve) => { requestedChunk = resolve; });
    await page.route("**/assets/WebsiteCheck-*.js", async (route) => {
      requestedChunk();
      await held;
      await route.continue();
    });
    let handoffs = 0;
    await page.route("**/examples/audit/", async (route) => {
      handoffs += 1;
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Local handoff fixture</title><h1>Local handoff fixture</h1>" });
    });
    await page.goto("/website-check/", { waitUntil: "domcontentloaded" });
    await requested;
    const snapshot = page.locator('[data-lf-route-snapshot="initial"]');
    await snapshot.getByLabel("Website URL", { exact: true }).fill("example.com");
    await snapshot.getByLabel("Email for your private report", { exact: true }).fill("owner@example.com");
    await snapshot.getByRole("button", { name: "Check my website", exact: true }).click();
    await expect(snapshot.locator(".lf-website-check__status")).toContainText("Your details are kept here");
    await expect(page).toHaveURL(/\/website-check\/$/);
    expect(handoffs).toBe(0);
    releaseChunk();
    await page.waitForURL("**/examples/audit/");
    expect(handoffs).toBe(1);
    expect(new URL(page.url()).search).toBe("");
    const prefill = await page.evaluate(() => JSON.parse(sessionStorage.getItem("lf_audit_prefill_v1") ?? "null"));
    expect(prefill).toMatchObject({ source: "website_check_page", url: "example.com", email: "owner@example.com" });
  },
);

test(
  "Website Check preserves useful navigation and explains its handoff without JavaScript @chromium-desktop @chromium-mobile",
  async ({ browser, baseURL }, testInfo) => {
    const mobile = testInfo.project.name.includes("mobile");
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: mobile ? 390 : 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseURL}/website-check/`);
    await expect(page.getByRole("heading", { name: "See what a new customer sees." })).toBeVisible();
    await expect(page.locator(".lf-nav__phone--direct")).toBeVisible();
    await expect(page.locator(".lf-nav__phone--chooser")).toBeHidden();
    await expect(page.locator(".lf-nav__toggle")).toBeHidden();
    const primary = page.getByRole("navigation", { name: mobile ? "Primary without JavaScript" : "Primary", exact: true });
    await expect(primary.getByRole("link")).toHaveCount(6);
    await expect(primary.getByRole("link", { name: "Websites", exact: true })).toBeVisible();
    if (mobile) {
      const group = page.locator(".lf-quiet-foot__group--fold").first();
      await group.locator("summary").click();
      await expect(group.getByRole("link", { name: "Custom websites", exact: true })).toBeVisible();
    }
    // Playwright's aggregate element text intentionally skips NOSCRIPT, even
    // in a script-disabled context. Inspect the actual visible paragraph.
    await expect(page.locator(".lf-website-check__noscript")).toBeVisible();
    await expect(page.locator(".lf-website-check__noscript")).toContainText("The automated check needs JavaScript.");
    await expect(page.locator(".lf-website-check__automated-controls")).toBeHidden();
    await expect(page.getByRole("link", { name: "Start a free human first look instead." })).toBeVisible();
    await page.getByRole("link", { name: "Start a free first look", exact: true }).click();
    await expect(page).toHaveURL(/\/tech-audit\/\?intent=website&source=no_website_check/);
    await context.close();
  },
);

for (const lastAction of ["privacy", "submit"] as const) {
  test(`the latest early action wins when ${lastAction} follows another intent @chromium-desktop @webkit-mobile`, async ({ page }) => {
    let releaseChunk = () => {};
    const held = new Promise<void>((resolve) => { releaseChunk = resolve; });
    let requestedChunk = () => {};
    const requested = new Promise<void>((resolve) => { requestedChunk = resolve; });
    await page.route("**/assets/WebsiteCheck-*.js", async (route) => {
      requestedChunk();
      await held;
      await route.continue();
    });
    let handoffs = 0;
    await page.route("**/examples/audit/", async (route) => {
      handoffs += 1;
      await route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Local handoff fixture</title><h1>Local handoff fixture</h1>" });
    });
    await page.goto("/website-check/", { waitUntil: "domcontentloaded" });
    await requested;
    const snapshot = page.locator('[data-lf-route-snapshot="initial"]');
    await snapshot.getByLabel("Website URL", { exact: true }).fill("example.com");
    const submit = snapshot.getByRole("button", { name: "Check my website", exact: true });
    const privacy = snapshot.getByRole("button", { name: "Privacy choices", exact: true });
    if (lastAction === "privacy") { await submit.click(); await privacy.click(); }
    else { await privacy.click(); await submit.click(); }
    releaseChunk();
    await expect(snapshot).toHaveCount(0);
    if (lastAction === "privacy") {
      await expect(page.getByRole("region", { name: "Privacy preferences", exact: true })).toBeFocused();
      expect(handoffs).toBe(0);
      await expect(page).toHaveURL(/\/website-check\/$/);
      await expect(page.getByLabel("Website URL", { exact: true })).toHaveValue("example.com");
      await page.getByRole("button", { name: "Essential only", exact: true }).click();
      await page.getByRole("button", { name: "Check my website", exact: true }).click();
    }
    await page.waitForURL("**/examples/audit/");
    expect(handoffs).toBe(1);
    const prefill = await page.evaluate(() => JSON.parse(sessionStorage.getItem("lf_audit_prefill_v1") ?? "null"));
    expect(prefill).toMatchObject({ url: "example.com" });
  });
}

for (const control of [
  { label: "menu", selector: ".lf-nav__toggle", width: 390 },
  { label: "phone choices", selector: ".lf-nav__phone--chooser", width: 1440 },
  { label: "privacy choices", selector: ".lf-quiet-foot__privacy-button", width: 390 },
]) {
  test(`an early ${control.label} activation reaches the real control @chromium-desktop @webkit-mobile`, async ({ page }) => {
    await page.setViewportSize({ width: control.width, height: 900 });
    let releaseChunk = () => {};
    const held = new Promise<void>((resolve) => { releaseChunk = resolve; });
    let requestedChunk = () => {};
    const requested = new Promise<void>((resolve) => { requestedChunk = resolve; });
    await page.route("**/assets/WebsiteCheck-*.js", async (route) => {
      requestedChunk();
      await held;
      await route.continue();
    });
    await page.goto("/website-check/", { waitUntil: "domcontentloaded" });
    await requested;
    const snapshot = page.locator('[data-lf-route-snapshot="initial"]');
    await snapshot.locator(control.selector).click();
    await expect(snapshot.locator(control.selector)).toHaveAttribute("aria-busy", "true");
    releaseChunk();
    await expect(snapshot).toHaveCount(0);
    const trigger = page.locator(`[data-lf-route-mount] ${control.selector}`);
    if (control.label === "privacy choices") {
      await expect(page.getByRole("region", { name: "Privacy preferences", exact: true })).toBeFocused();
      await page.getByRole("button", { name: "Essential only", exact: true }).click();
      await expect(trigger).toBeFocused();
    } else {
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      if (control.label === "menu") await expect(page.getByRole("dialog", { name: "Menu", exact: true })).toBeVisible();
      else await expect(page.locator(".lf-nav .lf-phone-action__menu")).toBeVisible();
    }
  });
}

test(
  "a selected SPA route keeps the live source page usable until its leaf commits @chromium-desktop @chromium-mobile",
  async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    let releaseChunk = () => {};
    const chunkReleased = new Promise<void>((resolve) => {
      releaseChunk = resolve;
    });
    let requestedChunk = () => {};
    const chunkRequested = new Promise<void>((resolve) => {
      requestedChunk = resolve;
    });
    await page.route("**/assets/About-*.js", async (route) => {
      requestedChunk();
      await chunkReleased;
      await route.continue();
    });

    const about = page.locator('a[href="/about/"]').first();
    await about.click();
    await chunkRequested;

    await expect(page.getByRole("heading", { name: /We handle the tech/i })).toBeVisible();
    await expect(about).toBeVisible();
    await expect(page.locator(".lf-route-fallback")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);

    releaseChunk();
    await page.waitForURL("**/about/");

    const mount = page.locator("[data-lf-route-mount]");
    await expect(mount).not.toHaveAttribute("hidden", "");
    await expect(mount.getByRole("heading", { name: /One studio for all of it/i })).toBeVisible();
  },
);

test(
  "browser Back cancels a pending selected route preload @chromium-desktop",
  async ({ page }) => {
    await page.goto("/services/", { waitUntil: "networkidle" });
    await page.locator('a[href="/"]').first().click();
    await page.waitForURL("**/");

    let releaseChunk = () => {};
    const chunkReleased = new Promise<void>((resolve) => {
      releaseChunk = resolve;
    });
    let requestedChunk = () => {};
    const chunkRequested = new Promise<void>((resolve) => {
      requestedChunk = resolve;
    });
    await page.route("**/assets/About-*.js", async (route) => {
      requestedChunk();
      await chunkReleased;
      await route.continue();
    });

    await page.locator('a[href="/about/"]').first().click();
    await chunkRequested;
    await page.goBack();
    await page.waitForURL("**/services/");
    await expect(page.getByRole("heading", { name: /Websites, fixes/i })).toBeVisible();

    releaseChunk();
    await page.waitForTimeout(250);
    await expect(page).toHaveURL(/\/services\/$/);
  },
);

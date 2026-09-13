import { expect, test } from "@playwright/test";

test(
  "owners without a website reach a person-first free intake without a URL @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/website-check/");

    const firstLook = page.getByRole("link", { name: "Start a free first look" });
    await expect(firstLook).toHaveAttribute(
      "href",
      "/tech-audit/?intent=website&source=no_website_check",
    );
    await firstLook.click();

    await expect(page).toHaveURL(/\/tech-audit\/\?intent=website&source=no_website_check$/);
    await expect(page.getByRole("heading", { name: "Get a clear next step." })).toBeVisible();
    await expect(page.getByText("Tell us what you want to improve or fix. Website, social page, everyday tools, or something broken. We’ll tell you what to keep, change, or leave alone.")).toBeVisible();
    await expect(page.getByLabel("What would you like to improve or fix?")).toBeVisible();
    await expect(page.getByText("No passwords or private customer data. A short sentence is enough. If helpful, add your city, social page, or how customers find you.")).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toHaveValue("");
    await expect(page.getByRole("button", { name: "Send my first-look request" })).toBeVisible();
  },
);

test(
  "the existing website URL entry remains available at its stable hash @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/website-check/#website-check-url");

    await expect(page.getByLabel("Website URL")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check my website" })).toBeVisible();
  },
);

test(
  "the no-site route clears an untouched website template but keeps contact details @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.goto("/tech-audit/?intent=website&source=website_check&url=https%3A%2F%2Fexample.com%2F");
    const message = page.locator('textarea[name="message"]');
    await expect(message).not.toHaveValue("");
    await page.getByLabel("Your name").fill("Alex Owner");
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).fields?.name : "";
    })).toBe("Alex Owner");
    await page.goto("/tech-audit/?intent=website&source=no_website_check");

    await expect(page.locator('textarea[name="message"]')).toHaveValue("");
    await expect(page.locator('input[name="symptom"]')).toHaveCount(0);
    await expect(page.locator('input[name="urgency"]')).toHaveCount(0);
    await expect(page.getByLabel("Your name")).toHaveValue("Alex Owner");
  },
);

test(
  "a typed no-site note remains when an owner returns to the first look @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const noSitePath = "/tech-audit/?intent=website&source=no_website_check";
    const note = "Customers find us through referrals and Instagram; we need appointment requests.";

    await page.goto(noSitePath);
    const mount = page.locator("[data-lf-route-mount]");
    await expect(mount).not.toHaveAttribute("hidden", "");
    await mount.locator('textarea[name="message"]').fill(note);
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).messageDirty : false;
    })).toBe(true);
    await page.goto("/website-check/");
    await page.goto(noSitePath);

    await expect(page.locator('textarea[name="message"]')).toHaveValue(note);
  },
);

test(
  "a note typed into the first-paint form moves into the live no-site form @chromium-desktop @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const noSitePath = "/tech-audit/?intent=website&source=no_website_check";
    const note = "Customers find us through referrals and Instagram; we need appointment requests.";
    let releaseChunk = () => {};
    const chunkReleased = new Promise<void>((resolve) => {
      releaseChunk = resolve;
    });
    let requestedChunk = () => {};
    const chunkRequested = new Promise<void>((resolve) => {
      requestedChunk = resolve;
    });
    await page.route("**/assets/TechAudit-*.js", async (route) => {
      requestedChunk();
      await chunkReleased;
      await route.continue();
    });

    await page.goto(noSitePath, { waitUntil: "domcontentloaded" });
    await chunkRequested;

    const snapshot = page.locator('[data-lf-route-snapshot="initial"]');
    await expect(snapshot).toBeVisible();
    await snapshot.locator('input[name="name"]').fill("Alex Owner");
    await snapshot.locator('input[name="contact"]').fill("alex@example.com");
    await snapshot.locator('textarea[name="message"]').fill(note);
    releaseChunk();

    const mount = page.locator("[data-lf-route-mount]");
    await expect(snapshot).toHaveCount(0);
    await expect(mount.locator('input[name="name"]')).toHaveValue("Alex Owner");
    await expect(mount.locator('input[name="contact"]')).toHaveValue("alex@example.com");
    await expect(mount.locator('textarea[name="message"]')).toHaveValue(note);
    await expect.poll(() => page.evaluate(() => {
      const raw = window.sessionStorage.getItem("lf_tech_audit_draft");
      return raw ? JSON.parse(raw).messageDirty : false;
    })).toBe(true);
  },
);


test("human first-look promises reach the intake once with truthful context @all-projects", async ({ page }) => {
  const writes: string[] = [];
  await page.route("**/*", async route => {
    const request = route.request();
    if (!["GET", "HEAD"].includes(request.method())) {
      writes.push(request.url());
      await route.abort();
    } else await route.continue();
  });
  for (const entry of [
    { path: "/", selector: ".lf-wall__check", intent: "website", source: "home" },
    { path: "/services/custom-local-websites/", selector: ".lf-pagehero__decision--primary", intent: "website", source: "page_hero" },
    { path: "/services/", selector: ".lf-pagehero__decision--primary", intent: "general", source: "page_hero" },
  ]) {
    await page.goto(entry.path);
    await page.locator(entry.selector).click();
    await expect(page).toHaveURL(/\/tech-audit\//);
    const form = page.locator('[data-lf-route-mount] form[name="tech-audit-scratch"]');
    await expect(form.locator('[name="intent"]')).toHaveValue(entry.intent);
    await expect(form.locator('[name="lead_origin"]')).toHaveValue(entry.source);
    await expect(form.locator('[name="message"]')).toHaveValue("");
    await expect(form.locator('[name="website_url"], [name="symptom"]')).toHaveCount(0);
    const business = form.getByLabel("Business or idea", { exact: true });
    await expect(business).toHaveAttribute("aria-describedby", "fit-business-hint");
    await expect(page.locator("#fit-business-hint")).toHaveText("No name yet? Tell us what you are starting.");
    await business.fill("A neighborhood repair shop, name undecided");
    await business.blur();
    await expect(business).not.toHaveAttribute("aria-invalid", "true");
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${entry.path.replaceAll("/", "\\/")}$`));
  }
  expect(writes).toEqual([]);
});

test("the four service choices fit one comparison on desktop and phone @all-projects", async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/services/", { waitUntil: "networkidle" });
    const chooser = page.getByRole("navigation", { name: "Start from the symptom" });
    const links = chooser.getByRole("link");
    await expect(links).toHaveCount(4);
    const box = await chooser.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(650);
    expect(box!.y).toBeLessThanOrEqual(844);
    for (const [index, slug] of ["custom-local-websites", "it-support", "tech-consulting", "business-systems"].entries()) {
      await expect(links.nth(index)).toHaveAttribute("href", `/services/${slug}/`);
      const target = await links.nth(index).boundingBox();
      expect(target!.height).toBeGreaterThanOrEqual(44);
    }
    await links.first().focus();
    for (let index = 1; index < 4; index += 1) {
      // Safari reserves ordinary Tab for form controls unless full keyboard access is enabled.
      await page.keyboard.press(test.info().project.name.startsWith("webkit") ? "Alt+Tab" : "Tab");
      await expect(links.nth(index)).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

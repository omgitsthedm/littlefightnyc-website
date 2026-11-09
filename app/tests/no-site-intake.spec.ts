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
    await page.goto("/tech-audit/?intent=website&source=website_check");
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

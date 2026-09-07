import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "block" });

for (const delay of ["entry", "route"] as const) {
  test(
    `a ${delay}-delayed owner calculator keeps an entered scenario and stays interactive @all-projects`,
    async ({ page }) => {
      const path = "/services/custom-local-websites/";
      const html = await (await page.request.get(path)).text();
      const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
      expect(entry).toBeTruthy();

      let release = () => {};
      const held = new Promise<void>((resolve) => { release = resolve; });
      let markRequested = () => {};
      const requested = new Promise<void>((resolve) => { markRequested = resolve; });
      await page.route(
        delay === "entry" ? `**${entry}` : "**/assets/ServiceDetail-*.js",
        async (route) => {
          markRequested();
          await held;
          await route.continue();
        },
      );

      await page.goto(path, { waitUntil: "commit" });
      await requested;
      if (delay === "route") {
        await expect(page.locator("[data-lf-route-snapshot=initial]")).toBeVisible();
      }
      const initial = page.locator(delay === "entry" ? "#root" : "[data-lf-route-snapshot=initial]");
      const calculator = initial.locator('[data-lf-visual-proof="owner-calculator"]').first();
      await calculator.getByLabel("Average sale or job value").fill("400");

      release();
      const mounted = page.locator("[data-lf-route-mount]");
      const liveCalculator = mounted.locator('[data-lf-visual-proof="owner-calculator"]').first();
      await expect(mounted).toBeVisible();
      await expect(liveCalculator.getByLabel("Average sale or job value")).toHaveValue("400");
      await expect(liveCalculator).toContainText("Your numbers");
      await expect(liveCalculator.getByRole("status")).toContainText("$3,200");
      await liveCalculator.getByLabel("Currency & number style").selectOption("GBP");
      await expect(liveCalculator.getByRole("status")).toContainText("£3,200");
    },
  );
}

test(
  "a route-delayed owner calculator keeps focus on an untouched field until its first edit @all-projects",
  async ({ page }) => {
    const path = "/services/custom-local-websites/";
    let release = () => {};
    const held = new Promise<void>((resolve) => { release = resolve; });
    let markRequested = () => {};
    const requested = new Promise<void>((resolve) => { markRequested = resolve; });
    await page.route("**/assets/ServiceDetail-*.js", async (route) => {
      markRequested();
      await held;
      await route.continue();
    });

    await page.goto(path, { waitUntil: "commit" });
    await requested;
    const snapshot = page.locator("[data-lf-route-snapshot=initial]");
    const earlyField = snapshot.getByLabel("Average sale or job value");
    await earlyField.focus();
    await expect(earlyField).toBeFocused();

    release();
    const mounted = page.locator("[data-lf-route-mount]");
    const field = mounted.getByLabel("Average sale or job value");
    await expect(mounted).toBeVisible();
    await expect(field).toHaveValue("250");
    await expect(field).toBeFocused();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("400");
    const calculator = mounted.locator('[data-lf-visual-proof="owner-calculator"]').first();
    await expect(field).toHaveValue("400");
    await expect(calculator).toContainText("Your numbers");
    await expect(calculator.getByRole("status")).toContainText("$3,200");
  },
);

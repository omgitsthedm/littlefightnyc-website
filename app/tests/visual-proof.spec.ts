import { expect, test } from "@playwright/test";

test.describe("Visual proof @all-projects", () => {

const answerRoutes = [
  "website-down-emergency-nyc",
  "wix-vs-custom-website-reddit",
  "how-to-find-good-it-guy-reddit",
] as const;

for (const slug of answerRoutes) {
  test(`answer visual proof: ${slug}`, async ({ page }) => {
    await page.goto(`/answers/${slug}/`);
    const proof = page.locator('[data-lf-visual-proof="answer"]');
    await expect(proof).toBeVisible();
    await expect(proof).toContainText(/.{20,}/);
  });
}

test("journal visual proof renders sourced owner guidance", async ({ page }) => {
  await page.goto("/journal/cybersecurity-for-small-business/");
  const proof = page.locator('[data-lf-visual-proof="journal"]');
  await expect(proof).toBeVisible();
  await expect(proof.getByRole("heading", { name: "Notice this" })).toBeVisible();
  await expect(proof.getByRole("heading", { name: "Do this next" })).toBeVisible();
  await expect(proof.locator('a[href^="https://"]')).toHaveCount(2);
});

test("owner calculator labels examples, then owner input", async ({ page }) => {
  // The compact phone homepage omits long-form instruments. Their service-page
  // placement remains visible on every viewport.
  await page.goto("/services/custom-local-websites/");
  const calculator = page.locator('[data-lf-visual-proof="owner-calculator"]').first();
  await expect(calculator).toContainText("Example");
  await calculator.getByLabel("Average sale or job value").fill("400");
  await expect(calculator).toContainText("Your numbers");
  await expect(calculator.getByRole("status")).toContainText("$3,200");
  await calculator.getByLabel("Currency & number style").selectOption("GBP");
  await expect(calculator.getByRole("status")).toContainText("£3,200");
});

test("owner formulas expose the promised business inputs", async ({ page }) => {
  await page.goto("/services/it-support/");
  const downtime = page.locator("section.lf-owner-math").filter({ hasText: "When the screen goes dark" });
  await downtime.getByLabel("Hours this path is down").fill("2");
  await downtime.getByLabel("Revenue in a normal open hour").fill("300");
  await downtime.getByLabel("Share of revenue affected").fill("50");
  await expect(downtime.getByRole("status")).toContainText("$300");

  await page.goto("/services/new-business-launch/");
  const breakEven = page.locator("section.lf-owner-math").filter({ hasText: "How many real customers" });
  await breakEven.getByLabel("Potential project cost").fill("3000");
  await breakEven.getByLabel("Contribution from one confirmed customer").fill("500");
  await expect(breakEven.getByRole("status")).toContainText("6 customers");

  await page.goto("/industries/retail-ecommerce/");
  const checkout = page.locator("section.lf-owner-math").filter({ hasText: "Checkout is a path" });
  await expect(checkout.getByRole("status")).toContainText("$2,100");
  await expect(checkout).toContainText("not lost profit");
});

test("night-shift path is replayable and never loops", async ({ page }) => {
  // Mobile home is the short acquisition path; the full explainer lives on
  // the website service page at every viewport.
  await page.goto("/services/custom-local-websites/");
  const nightShift = page.locator('[data-lf-visual-proof="website-night-shift"]');
  await expect(nightShift).toBeVisible();
  await nightShift.getByRole("button", { name: "Replay the Path" }).click();
  const looping = await nightShift.locator("*").evaluateAll((elements) =>
    elements.filter((element) => getComputedStyle(element).animationIterationCount === "infinite").length,
  );
  expect(looping).toBe(0);
});

test("service and multilingual paths expose complete text equivalents", async ({ page }) => {
  for (const path of [
    "/services/new-business-launch/",
    "/services/ongoing-care/",
    "/nationwide/",
    "/areas/lower-east-side/it-support/",
    "/glossary/crm/",
    "/es/",
    "/zh/",
  ]) {
    await page.goto(path);
    const proof = page.locator("[data-lf-visual-proof]").first();
    await expect(proof).toBeVisible();
    await expect(proof).toContainText(/.{20,}/);
  }
  await page.goto("/nationwide/");
  await expect(page.getByText("Not measured", { exact: true })).toBeVisible();
});

test("portfolio proof step changes with visible feedback", async ({ page }) => {
  await page.goto("/case-studies/hair-by-rachel-charles/");
  const proof = page.locator("[data-feature-proof]");
  const tabs = proof.getByRole("tab");
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(proof.getByRole("tabpanel")).toBeVisible();
});

});

import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
const clientCases = JSON.parse(readFileSync(new URL("../src/data/client-case-studies.json", import.meta.url), "utf8")) as Array<{
  slug: string; client: string; url: string;
  editorial: {
    intro: string;
    imageAlt: string;
    detailAlt: string;
    detailCaption: string;
    scope: Array<{ title: string; detail: string }>;
    detailNotes: Array<{ title: string; detail: string }>;
    evidence: Array<{ title: string; detail: string; url: string }>;
    questions: Array<{ question: string; answer: string }>;
    share: { image: string; alt: string };
  };
}>;

// Public reads and local disclosures only: never submit client forms or payments.
for (const study of clientCases) {
  test(`client case: ${study.slug} @all-projects`, async ({ page, request }) => {
    const path = `/case-studies/${study.slug}/`;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toMatch(/>\s*(?:undefined|null)\s*</);
    expect(html).toContain(`data-route-style="${path}"`);
    expect(html).toContain(`data-client-case="${study.slug}"`);
    expect(html).toContain(study.editorial.intro.replace(/&/g, "&amp;"));
    for (const className of ["lf-client-scope", "lf-client-detail-notes", "lf-client-evidence"]) {
      expect(html).toContain(className);
    }
    expect(html).not.toContain("Is this the Hair By Rachel Charles project?");
    expect(html).not.toContain("Looking at this case study does not buy a reading.");
    expect(html).not.toContain("no forms, purchases, or appointments were submitted");
    expect(html).not.toContain("This is not a claim that the website earned press coverage.");
    const blocks = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
    const nodes = blocks.flatMap(match => {
      const data = JSON.parse(match[1]);
      return data["@graph"] ?? [data];
    });
    const article = nodes.find(node => node["@type"] === "Article");
    expect(article?.about?.["@id"]).toBe(`https://littlefightnyc.com${path}#client`);
    const client = nodes.find(node => node["@id"] === `https://littlefightnyc.com${path}#client`);
    expect(client?.name).toBe(study.client);
    expect(client?.url).toBe(study.url);

    await page.goto(path);
    // Interactions start only after the complete SSR snapshot hands off.
    await expect(page.locator("[data-lf-route-snapshot]")).toHaveCount(0);
    await expect(page.locator("[data-lf-route-mount]:not([hidden])")).toBeAttached();
    await expect(page.locator("h1")).toHaveText(study.client);
    await expect(page.locator(`[data-client-case="${study.slug}"]`)).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://littlefightnyc.com${path}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `https://littlefightnyc.com${study.editorial.share.image}`);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", study.editorial.share.alt);
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).not.toContain("noindex");
    await expect(page.locator(".lf-client-capture--hero img")).toBeVisible();
    await expect(page.locator(".lf-client-capture--hero img")).toHaveAttribute("src", /\/assets\/cases\/2026-09-29\//);
    await expect.poll(() => page.locator(".lf-client-capture--hero img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator(".lf-client-capture--hero img")).toHaveAttribute("alt", study.editorial.imageAlt);
    const scope = page.locator(".lf-client-scope");
    await expect(scope.locator("dt")).toHaveCount(3);
    await expect(scope.locator("dd")).toHaveText(study.editorial.scope.map(item => item.detail));
    await expect(page.locator(".lf-client-detail-notes li")).toHaveCount(3);
    await expect(page.locator(".lf-client-detail-notes li p")).toHaveText(study.editorial.detailNotes.map(item => item.detail));
    await expect(page.locator(".lf-client-evidence li")).toHaveCount(3);
    for (const item of study.editorial.evidence) {
      const link = page.locator(".lf-client-evidence").getByRole("link", { name: item.title, exact: true });
      await expect(link).toHaveAttribute("href", item.url);
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(new URL(item.url).hostname).toBe(new URL(study.url).hostname);
    }
    await expect(page.locator(".lf-client-editorial__questions details")).toHaveCount(3);
    const detail = page.locator(".lf-client-capture--detail img");
    await detail.scrollIntoViewIfNeeded();
    await expect.poll(() => detail.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(detail).toHaveAttribute("alt", study.editorial.detailAlt);
    await expect(page.locator(".lf-client-capture--detail figcaption")).toContainText(study.editorial.detailCaption);
    expect(await page.locator(".lf-client-capture--detail").evaluate(figure => figure.lastElementChild?.tagName)).toBe("FIGCAPTION");
    const question = page.locator(".lf-client-editorial__questions details").first();
    await question.locator("summary").click();
    await expect(question).toHaveAttribute("open", "");
    await expect(question.locator("p")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    const clientLinks = page.locator(`a[href="${study.url}"]`);
    expect(await clientLinks.count()).toBeGreaterThan(0);
    const imageResponse = await request.get(study.editorial.share.image);
    expect(imageResponse.status()).toBe(200);
    expect(imageResponse.headers()["content-type"]).toContain("image/jpeg");
  });
}

test("client index connects all nine current businesses @all-projects", async ({ page }) => {
  const response = await page.goto("/examples/");
  expect(await response!.text()).not.toMatch(/>\s*(?:undefined|null)\s*</);
  await expect(page.getByRole("heading", { name: "9 live sites. 9 real customer paths." })).toBeVisible();
  for (const study of clientCases) {
    expect(await page.locator(`a[href="/case-studies/${study.slug}/"]`).count()).toBeGreaterThan(0);
  }
  await expect(page.getByRole("heading", { name: "Built for our own business." })).toBeVisible();
});


test("editorial evidence stays scoped and does not manufacture results @all-projects", () => {
  const cases = JSON.parse(readFileSync(new URL("../src/data/client-case-studies.json", import.meta.url), "utf8"));
  for (const study of cases) {
    expect(study.metrics).toEqual([]);
    const e = study.editorial;
    expect(study.body).toEqual([e.intro, ...e.design, ...e.detail, ...e.technical, e.closing]);
    expect(e.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(e.detailCaption).not.toBe(e.detailAlt);
  }
  const funding = cases.find((study: { slug: string }) => study.slug === "grand-funding-llc");
  expect(funding.editorial.imageAlt).toContain("nighttime city");
  expect(funding.editorial.share.alt).toContain("nighttime city");
  expect(JSON.stringify(funding.editorial)).not.toContain("desert imagery");
  const tarot = cases.find((study: { slug: string }) => study.slug === "the-tarot-hotline");
  expect(JSON.stringify(tarot)).not.toContain("Hair By Rachel Charles");
  const tiger = cases.find((study: { slug: string }) => study.slug === "easy-tiger");
  expect(tiger.body.join(" ")).toContain("draft");
  expect(tiger.body.join(" ")).not.toMatch(/five minutes|5 minutes|trained Bob|increased revenue/i);
});

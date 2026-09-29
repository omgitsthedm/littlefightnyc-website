import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
const clientCases = JSON.parse(readFileSync(new URL("../src/data/client-case-studies.json", import.meta.url), "utf8")) as Array<{
  slug: string; client: string; url: string;
  editorial: { intro: string; share: { image: string; alt: string } };
}>;

// Public reads and local disclosures only: never submit client forms or payments.
for (const study of clientCases) {
  test(`client case: ${study.slug} @all-projects`, async ({ page, request }) => {
    const path = `/case-studies/${study.slug}/`;
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(`data-client-case="${study.slug}"`);
    expect(html).toContain(study.editorial.intro.replace(/&/g, "&amp;"));
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
    await expect(page.locator("h1")).toHaveText(study.client);
    await expect(page.locator(`[data-client-case="${study.slug}"]`)).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://littlefightnyc.com${path}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `https://littlefightnyc.com${study.editorial.share.image}`);
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", study.editorial.share.alt);
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).not.toContain("noindex");
    await expect(page.locator(".lf-client-capture--hero img")).toBeVisible();
    await expect.poll(() => page.locator(".lf-client-capture--hero img").evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
    const detail = page.locator(".lf-client-capture--detail img");
    await detail.scrollIntoViewIfNeeded();
    await expect.poll(() => detail.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
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
  await page.goto("/examples/");
  await expect(page.getByRole("heading", { name: "9 live sites. 9 real customer paths." })).toBeVisible();
  for (const study of clientCases) {
    expect(await page.locator(`a[href="/case-studies/${study.slug}/"]`).count()).toBeGreaterThan(0);
  }
  await expect(page.getByRole("heading", { name: "Built for our own business." })).toBeVisible();
});

// Load the primary web font; missing optional local fallback fonts are not network failures.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

test.use({ serviceWorkers: "block" });

async function settleVisibleType(page: Page) {
  await page.waitForFunction(() => [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
    .every(link => Boolean(link.sheet)));
  await page.evaluate(async () => {
    // Wait for the faces the rendered text actually uses, including body
    // weights beyond 400. FontFaceSet.ready can depend on the document load
    // that this test deliberately holds, so it is not our readiness signal.
    const faces = new Set([...document.querySelectorAll("#root *")]
      .filter(element => element.getClientRects().length && [...element.childNodes]
        .some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()))
      .map(element => {
        const style = getComputedStyle(element);
        return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily.split(",")[0].trim()}`;
      }));
    await Promise.all([...faces].map(font => document.fonts.load(font)));
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

for (const route of [
  { path: "/", landmarks: ["h1", ".lf-wall__act", ".lf-quiet-foot"] },
  { path: "/services/", landmarks: ["h1", ".lf-svc-router", ".lf-pagehero__actions", ".lf-pagehero__image"] },
  { path: "/services/custom-local-websites/", landmarks: ["h1", ".lf-pagehero__actions", ".lf-sd-web", ".lf-quiet-foot"] },
  { path: "/case-studies/hair-by-rachel-charles/", landmarks: ["h1", ".lf-pagehero__actions", ".lf-live-explorer__viewport", ".lf-quiet-foot"] },
  { path: "/tech-audit/", landmarks: ["h1", ".lf-audit__form", ".lf-quiet-foot"] },
  { path: "/nationwide/", landmarks: ["h1", "[data-lf-website-proof-set]", ".lf-quiet-foot"] },
]) {
  test(`the initial ${route.path} composition matches the finished buying journey @all-projects`, async ({ page }) => {
    // Ordinary motion must not replay a first-paint entrance during mounting.
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const html = await (await page.request.get(route.path)).text();
    const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
    expect(entry).toBeTruthy();
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(`**${entry}`, async request => { await held; await request.continue(); });
    await page.goto(route.path, { waitUntil: "commit" });
    await expect(page.locator("#root h1")).toBeVisible();
    await settleVisibleType(page);
    const measure = async (selector: string) => page.locator(selector).evaluate((root, landmarks) => landmarks.map(name => {
      const element = root.querySelector(name);
      if (!element) throw new Error(`Missing initial/live landmark ${name}`);
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height };
    }), route.landmarks);
    const initial = await measure("#root");
    release();
    await expect(page.locator("[data-lf-route-mount]")).toBeVisible();
    await settleVisibleType(page);
    const loaded = await measure("[data-lf-route-mount]");
    await test.info().attach("initial-and-mounted-geometry", {
      body: JSON.stringify({ route: route.path, landmarks: route.landmarks, initial, loaded }),
      contentType: "application/json",
    });
    for (let i = 0; i < initial.length; i += 1) {
      for (const key of ["x", "y", "width", "height"] as const) {
        expect(Math.abs(loaded[i][key] - initial[i][key]), `${route.path} ${route.landmarks[i]} ${key}`).toBeLessThanOrEqual(2);
      }
    }
  });
}

test("industry and neighborhood first paints keep the real hero through mount at phone and tablet widths @chromium-desktop @chromium-mobile", async ({ page }) => {
  const routes = [
    {
      path: "/industries/salons-wellness/",
      h1: "Salon websites that make booking clear.",
      image: "/assets/cases/2026-09-29/case-hair-by-rachel-charles.webp",
    },
    {
      path: "/industries/retail-ecommerce/",
      h1: "The website and the shelf need to stop arguing.",
      image: "/assets/interior-jeans-rack.webp",
    },
    {
      path: "/areas/soho/",
      h1: "Websites, local search, and tech help for SoHo businesses.",
      image: "/assets/hero-soho-crosswalk.webp",
    },
  ];

  for (const viewport of [
    { width: 390, height: 844, name: "phone" },
    { width: 928, height: 768, name: "tablet" },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of routes) {
      const html = await (await page.request.get(route.path)).text();
      const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
      expect(entry, `${route.path} needs its app entry`).toBeTruthy();
      let release = () => {};
      const held = new Promise<void>(resolve => { release = resolve; });
      await page.route(`**${entry}`, async request => { await held; await request.continue(); });
      await page.goto(route.path, { waitUntil: "commit" });

      const initialHero = page.locator("#root .lf-pagehero");
      await expect(initialHero).toBeVisible();
      await expect(page.locator("#root .lf-seo")).toHaveCount(0);
      await expect(initialHero.getByRole("heading", { level: 1, name: route.h1 })).toBeVisible();
      await expect(initialHero.locator(".lf-pagehero__image img")).toHaveAttribute("src", route.image);
      await settleVisibleType(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route.path} first paint overflows at ${viewport.name}`).toBe(true);

      release();
      const mounted = page.locator("[data-lf-route-mount]");
      await expect(mounted).toBeVisible();
      const mountedHero = mounted.locator(".lf-pagehero");
      await expect(mountedHero.getByRole("heading", { level: 1, name: route.h1 })).toBeVisible();
      await expect(mountedHero.locator(".lf-pagehero__image img")).toHaveAttribute("src", route.image);
      await settleVisibleType(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${route.path} mounted page overflows at ${viewport.name}`).toBe(true);
      await page.unrouteAll({ behavior: "wait" });
    }
  }
});

test("the no-JS answer fallback keeps brand and phone separate at tablet width @chromium-desktop", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 928, height: 768 },
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/answers/website-form-not-working-small-business/`);
  const header = page.locator("header.lf-seo__nav");
  const brand = header.locator(".lf-seo__brand");
  const phone = header.locator(".lf-seo__phone");
  const links = header.locator(".lf-seo__nav-links");
  await expect(header).toBeVisible();
  await expect(brand).toBeVisible();
  await expect(phone).toBeVisible();
  await expect(links).toBeVisible();
  const layout = await header.evaluate((element) => {
    const rect = (selector: string) => {
      const box = element.querySelector(selector)!.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    };
    return {
      brand: rect(".lf-seo__brand"),
      phone: rect(".lf-seo__phone"),
      links: rect(".lf-seo__nav-links"),
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
    };
  });
  expect(layout.brand.right <= layout.phone.left || layout.phone.right <= layout.brand.left, "brand and phone overlap in the no-JS header").toBe(true);
  expect(layout.links.top, "primary links need a readable second row at tablet width").toBeGreaterThan(layout.brand.bottom);
  expect(layout.scrollWidth, "no-JS answer page overflows at tablet width").toBeLessThanOrEqual(layout.viewportWidth + 1);
  await context.close();
});

test("the first decisions and inquiry field fit their intended openings @all-projects", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const path of ["/website-check/", "/case-studies/hair-by-rachel-charles/", "/services/custom-local-websites/"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    const isFirstLook = path === "/website-check/";
    const hero = page.locator(isFirstLook ? ".lf-website-check__intro" : ".lf-pagehero");
    const decisions = isFirstLook
      ? [".lf-website-check__start", '.lf-website-check__contact a[href^="tel:"]', ".lf-website-check__hours"]
      : [".lf-pagehero__decision--primary", ".lf-pagehero__decision--urgent", ".lf-pagehero__hours"];
    for (const selector of decisions) {
      const box = await hero.locator(selector).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height, `${path} ${selector}`).toBeLessThanOrEqual(720);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tech-audit/", { waitUntil: "networkidle" });
  const firstLook = page.locator('[data-lf-first-look="compact"]');
  await expect(firstLook).toHaveJSProperty("open", false);
  await expect(firstLook.locator(".lf-first-look__compact-copy")).toBeHidden();
  const firstField = await page.locator("#fit-name").boundingBox();
  expect(firstField).not.toBeNull();
  expect(firstField!.y + firstField!.height).toBeLessThanOrEqual(844);
});

test("the homepage opening puts named client proof beside contact choices at composed desktop width @chromium-desktop", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const wall = page.locator(".lf-wall");
  const proof = wall.locator(".lf-wall__hero-proof");
  const primary = wall.locator(".lf-wall__check");
  const phone = wall.locator(".lf-wall__call");

  await expect(proof).toHaveAttribute("href", "/case-studies/hair-by-rachel-charles/");
  await expect(proof.getByRole("img", { name: "The Hair By Rachel Charles booking website with Rachel’s name and portrait visible" })).toBeVisible();
  await expect(primary).toBeVisible();
  await expect(phone).toBeVisible();

  const [proofBox, primaryBox, phoneBox, overflow] = await Promise.all([
    proof.boundingBox(),
    primary.boundingBox(),
    phone.boundingBox(),
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ]);
  expect(proofBox).not.toBeNull();
  expect(primaryBox).not.toBeNull();
  expect(phoneBox).not.toBeNull();
  expect(proofBox!.x).toBeGreaterThan(primaryBox!.x + 100);
  expect(primaryBox!.y + primaryBox!.height).toBeLessThanOrEqual(900);
  expect(phoneBox!.y + phoneBox!.height).toBeLessThanOrEqual(900);
  expect(overflow, "homepage proof must not introduce horizontal scroll at 960px").toBe(true);
});

test("the homepage phone order keeps the first look and direct phone ahead of proof @chromium-mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const wall = page.locator(".lf-wall");
  const [primaryBox, phoneBox, proofBox, overflow] = await Promise.all([
    wall.locator(".lf-wall__check").boundingBox(),
    wall.locator(".lf-wall__call").boundingBox(),
    wall.locator(".lf-wall__hero-proof").boundingBox(),
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ]);
  expect(primaryBox).not.toBeNull();
  expect(phoneBox).not.toBeNull();
  expect(proofBox).not.toBeNull();
  expect(primaryBox!.y + primaryBox!.height).toBeLessThanOrEqual(844);
  expect(phoneBox!.y + phoneBox!.height).toBeLessThanOrEqual(844);
  expect(proofBox!.y).toBeGreaterThan(phoneBox!.y + phoneBox!.height);
  expect(overflow, "homepage proof must not introduce horizontal scroll on phone").toBe(true);
});

test("the website service opening shows Rachel work beside its first decision at 960px @chromium-desktop", async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 900 });
  await page.goto("/services/custom-local-websites/", { waitUntil: "networkidle" });

  const hero = page.locator(".lf-pagehero--website");
  const image = hero.locator(".lf-pagehero__image");
  const primary = hero.locator(".lf-pagehero__decision--primary");
  const urgent = hero.locator(".lf-pagehero__decision--urgent");
  await expect(image.getByRole("img", { name: "The Hair By Rachel Charles website with Rachel’s name and portrait visible" })).toBeVisible();
  await expect(primary).toBeVisible();
  await expect(urgent).toBeVisible();

  const [imageBox, primaryBox, urgentBox, overflow] = await Promise.all([
    image.boundingBox(),
    primary.boundingBox(),
    urgent.boundingBox(),
    page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ]);
  expect(imageBox).not.toBeNull();
  expect(primaryBox).not.toBeNull();
  expect(urgentBox).not.toBeNull();
  expect(imageBox!.x).toBeGreaterThan(primaryBox!.x + 100);
  expect(primaryBox!.y + primaryBox!.height).toBeLessThanOrEqual(900);
  expect(urgentBox!.y + urgentBox!.height).toBeLessThanOrEqual(900);
  expect(overflow, "website service proof must not introduce horizontal scroll at 960px").toBe(true);
});

test("nationwide questions render from the canonical route metadata @all-projects", async ({ page }) => {
  const source = JSON.parse(
    readFileSync(new URL("../src/data/seo-pages.json", import.meta.url), "utf8"),
  ) as { pages: Array<{ path: string; faq?: Array<{ question: string; answer: string }> }> };
  const nationwide = source.pages.find((entry) => entry.path === "/nationwide/");
  expect(nationwide?.faq, "Missing authored nationwide FAQ metadata").toHaveLength(4);

  await page.goto("/nationwide/", { waitUntil: "networkidle" });
  const proof = page.locator('[data-lf-website-proof-set="public-live"]');
  await expect(proof.getByRole("heading", { name: "Three live sites. Three customer paths." })).toBeVisible();
  await expect(proof).toContainText("Hair By Rachel Charles");
  await expect(proof).toContainText("Chromatic Painting & Design");
  await expect(proof).toContainText("CC Films");
  const clippedProcessText = await page.locator(".lf-nationwide-process .lf-flow__node").evaluateAll(nodes =>
    nodes.filter(node => node.scrollWidth > node.clientWidth + 1).length,
  );
  expect(clippedProcessText, "the remote process must fit its column without clipped text").toBe(0);
  for (const item of nationwide!.faq!) {
    const question = page.locator(".lf-faq__item").filter({ hasText: item.question });
    await expect(question).toContainText(item.answer);
  }
});

test("comparison answers lead to full decision guides and back @chromium-desktop", async ({ page }) => {
  const pairs = [
    {
      answer: "airtable-vs-notion-reddit-small-business",
      journal: "airtable-vs-notion-vs-monday-small-business",
      title: "Airtable vs. Notion vs. monday.com: Pick the Job First",
    },
    {
      answer: "glossgenius-vs-square-appointments-reddit",
      journal: "square-appointments-vs-glossgenius-nyc-salons",
      title: "Square Appointments vs. GlossGenius for Salons",
    },
    {
      answer: "shopify-vs-squarespace-reddit",
      journal: "shopify-vs-squarespace-nyc-retail",
      title: "Shopify vs. Squarespace for a Local Shop",
    },
    {
      answer: "square-vs-toast-reddit",
      journal: "square-vs-toast-manhattan-restaurants",
      title: "Square vs. Toast for a Manhattan Restaurant",
    },
  ];

  for (const pair of pairs) {
    await page.goto(`/answers/${pair.answer}/`, { waitUntil: "networkidle" });
    await expect(page.getByText("Need the full decision guide?")).toBeVisible();
    await expect(page.getByRole("link", { name: pair.title })).toHaveAttribute(
      "href",
      `/journal/${pair.journal}/`,
    );

    await page.goto(`/journal/${pair.journal}/`, { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: "Read the quick owner answer" })).toHaveAttribute(
      "href",
      `/answers/${pair.answer}/`,
    );
  }
});

test("every inquiry entry retains its opening and the owner's supplied context @all-projects", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const variants = [
    { query: "", intent: "general", origin: "littlefightnyc.com" },
    { query: "?intent=website&source=no_website_check", intent: "website", origin: "no_website_check" },
    { query: "?intent=website&source=contact_block", intent: "website", origin: "contact_block" },
    { query: "?intent=support&source=contact_block", intent: "support", origin: "contact_block" },
    { query: "?text=https%3A%2F%2Fexample.com%2F", intent: "website", origin: "pwa_share" },
    { query: "?report=example-com-1a2b3c4d", intent: "website", origin: "audit-lab" },
  ];
  for (const variant of variants) {
    const path = `/tech-audit/${variant.query}`;
    const html = await (await page.request.get(path)).text();
    const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
    expect(entry).toBeTruthy();
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(`**${entry}`, async request => { await held; await request.continue(); });
    await page.goto(path, { waitUntil: "commit" });
    await expect(page.locator("#root h1")).toBeVisible();
    await settleVisibleType(page);
    const measure = async (selector: string) => page.locator(selector).evaluate(root => [
      "h1", ".lf-audit-intro__reach", ".lf-audit__form",
    ].map(name => {
      const rect = root.querySelector(name)!.getBoundingClientRect();
      return { x: rect.x, y: rect.y + scrollY, width: rect.width };
    }));
    const initial = await measure("#root");
    // The visitor's own unfinished note must win over an automatic prompt.
    // Attribution and supplied report/URL context must independently survive.
    await page.locator('#root textarea[name="message"]').fill("Please help customers find the right service.");
    release();
    const mounted = page.locator("[data-lf-route-mount]");
    await expect(mounted).toBeVisible();
    await settleVisibleType(page);
    const loaded = await measure("[data-lf-route-mount]");
    for (let i = 0; i < initial.length; i += 1) {
      for (const key of ["x", "y", "width"] as const) {
        expect(Math.abs(loaded[i][key] - initial[i][key]), `${path} landmark ${i} ${key}`).toBeLessThanOrEqual(2);
      }
    }
    await expect(mounted.locator('textarea[name="message"]')).toHaveValue("Please help customers find the right service.");
    await expect(mounted.locator('[name="intent"]')).toHaveValue(variant.intent);
    await expect(mounted.locator('[name="lead_origin"]')).toHaveValue(variant.origin);
    if (variant.origin === "pwa_share") await expect(mounted.locator('[name="website_url"]')).toHaveValue("https://example.com/");
    if (variant.origin === "audit-lab") await expect(mounted.locator('[name="report_id"]')).toHaveValue("example-com-1a2b3c4d");
    await page.unrouteAll({ behavior: "wait" });
    await page.evaluate(() => sessionStorage.clear());
  }
});

for (const delay of ["entry", "route"] as const) {
  test(`a contact edited and left during delayed ${delay} loading keeps its validation @all-projects`, async ({ page }) => {
    const html = await (await page.request.get("/tech-audit/")).text();
    const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
    expect(entry).toBeTruthy();
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(delay === "entry" ? `**${entry}` : "**/assets/TechAudit-*.js", async request => {
      await held;
      await request.continue();
    });
    await page.goto("/tech-audit/", { waitUntil: "commit" });
    if (delay === "route") await expect(page.locator("[data-lf-route-snapshot]")).toBeVisible();
    const contact = page.locator("#root #fit-contact");
    await contact.fill("hello@yourshop");
    await contact.blur();
    const scope = page.locator('#root [data-lf-disclosure="first-look:scope"]');
    await scope.locator("summary").click();
    await scope.locator("summary").focus();
    await expect(scope).toHaveJSProperty("open", true);
    release();
    const mounted = page.locator("[data-lf-route-mount]");
    await expect(mounted).toBeVisible();
    await expect(mounted.locator("#fit-contact")).toHaveValue("hello@yourshop");
    await expect(mounted.locator('[data-lf-disclosure="first-look:scope"]')).toHaveJSProperty("open", true);
    await expect(mounted.locator('[data-lf-disclosure="first-look:scope"] > summary')).toBeFocused();
    await expect(mounted.locator("#fit-contact-error")).toContainText(/incomplete|typo/i);
    await expect(mounted.locator("#fit-contact")).toHaveAttribute("aria-invalid", "true");
    await expect(mounted.locator("#fit-name-error, #fit-business-error, #fit-message-error")).toHaveCount(0);
    await mounted.locator("#fit-contact").fill("hello@yourshop.com");
    await mounted.locator("#fit-contact").blur();
    await expect(mounted.locator("#fit-contact-error")).toHaveCount(0);
  });
}

test("native inquiry stays usable with JavaScript disabled @chromium-desktop @chromium-mobile", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${baseURL}/tech-audit/?intent=website&source=no_website_check`);
  const form = page.locator('form[name="tech-audit-scratch"]');
  await expect(form).toBeVisible();
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form).not.toHaveAttribute("novalidate");
  await expect(form.locator('[name="form-name"]')).toHaveValue("tech-audit-scratch");
  await expect(form.locator('[name="discovery_source"]')).toHaveCount(1);
  await expect(form.locator('[name="discovery_source"] option')).toHaveCount(8);
  for (const name of ["name", "business", "contact", "message"]) {
    await expect(form.locator(`[name="${name}"]`)).toBeVisible();
    await expect(form.locator(`[name="${name}"]`)).toHaveAttribute("required", "");
  }
  // Inspect native constraints without sending a real provider-backed inquiry.
  expect(await form.evaluate(element => (element as HTMLFormElement).checkValidity())).toBe(false);
  await form.locator('[name="name"]').fill("Local test");
  await form.locator('[name="business"]').fill("Local test business");
  await form.locator('[name="contact"]').fill("owner@example.com");
  await form.locator('[name="message"]').fill("A local-only inquiry check.");
  expect(await form.evaluate(element => (element as HTMLFormElement).checkValidity())).toBe(true);
  await context.close();
});

for (const delay of ["entry", "route"] as const) {
  test(`native answers opened or reclosed during delayed ${delay} loading retain state and focus @all-projects`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const path = "/services/custom-local-websites/";
    const html = await (await page.request.get(path)).text();
    const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
    expect(entry).toBeTruthy();
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(delay === "entry" ? `**${entry}` : "**/assets/ServiceDetail-*.js", async request => {
      await held;
      await request.continue();
    });
    await page.goto(path, { waitUntil: "commit" });
    if (delay === "route") await expect(page.locator("[data-lf-route-snapshot]")).toBeVisible();
    const initial = page.locator(delay === "route" ? "[data-lf-route-snapshot]" : "#root");
    const answers = initial.locator(".lf-sd-decision-reference details");
    await answers.nth(0).locator("summary").click();
    await answers.nth(1).locator("summary").click();
    await answers.nth(1).locator("summary").click();
    await initial.locator('[data-lf-disclosure="money-leak:methodology"] > summary').click();
    const footer = initial.locator('[data-lf-disclosure="footer:What we fix"]');
    await footer.locator("summary").focus();
    await page.keyboard.press("Space");
    await expect(footer.locator("summary")).toBeFocused();
    await expect(footer).toHaveJSProperty("open", true);
    await settleVisibleType(page);
    // Chromium animates native details-content height. Compare settled
    // reading positions, not two different moments in that explicit opening.
    await footer.evaluate(node => Promise.all(node.getAnimations({ subtree: true })
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => undefined))));
    await settleVisibleType(page);
    const choices = await initial.locator("details[data-lf-disclosure]").evaluateAll(elements => elements.map(element => ({
      key: (element as HTMLElement).dataset.lfDisclosure!, open: (element as HTMLDetailsElement).open,
    })));
    expect(new Set(choices.map(choice => choice.key)).size).toBe(choices.length);
    // Browser scroll anchoring can legitimately change scrollY as type settles.
    // Measure the actual answer the owner is reading within the viewport.
    const readingPosition = (await footer.locator("summary").boundingBox())!.y;
    release();
    const mounted = page.locator("[data-lf-route-mount]");
    await expect(mounted).toBeVisible();
    for (const choice of choices) {
      await expect(mounted.locator(`details[data-lf-disclosure=${JSON.stringify(choice.key)}]`)).toHaveJSProperty("open", choice.open);
    }
    await expect(mounted.locator('[data-lf-disclosure="footer:What we fix"] > summary')).toBeFocused();
    await settleVisibleType(page);
    await mounted.locator('[data-lf-disclosure="footer:What we fix"]').evaluate(node => Promise.all(node.getAnimations({ subtree: true })
      .filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
      .map(animation => animation.finished.catch(() => undefined))));
    await settleVisibleType(page);
    const retainedPosition = (await mounted.locator('[data-lf-disclosure="footer:What we fix"] > summary').boundingBox())!.y;
    await test.info().attach("reading-landmark", {
      body: JSON.stringify({ delay, initialSummaryY: readingPosition, mountedSummaryY: retainedPosition }),
      contentType: "application/json",
    });
    // Scroll offsets are integral CSS pixels while layout boxes use 1/64px
    // fractions. Compare the same pixel precision on both sides of the handoff.
    expect(Math.abs(Math.round(retainedPosition) - Math.round(readingPosition))).toBeLessThanOrEqual(2);
    // The transferred summary must still be a working native control.
    await page.keyboard.press("Space");
    await expect(mounted.locator('[data-lf-disclosure="footer:What we fix"]')).toHaveJSProperty("open", false);
    // A subsequent actual navigation must still start at the next page's top.
    await mounted.locator('[data-lf-disclosure="footer:What we fix"] > summary').click();
    await mounted.locator('[data-lf-disclosure="footer:What we fix"] a[href="/services/it-support/"]').click();
    await expect(page).toHaveURL(/\/services\/it-support\/$/);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  });
}

for (const delay of ["entry", "route"] as const) {
  test(`a focused footer support link survives delayed ${delay} loading without reopening a closed answer @all-projects`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const path = "/services/custom-local-websites/";
    const html = await (await page.request.get(path)).text();
    const entry = html.match(/<script\s+type="module"[^>]*src="([^"]+)"/i)?.[1];
    expect(entry).toBeTruthy();
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route(delay === "entry" ? `**${entry}` : "**/assets/ServiceDetail-*.js", async request => {
      await held;
      await request.continue();
    });
    await page.goto(path, { waitUntil: "commit" });
    if (delay === "route") await expect(page.locator("[data-lf-route-snapshot]")).toBeVisible();
    const initial = page.locator(delay === "route" ? "[data-lf-route-snapshot]" : "#root");
    const reclosed = initial.locator(".lf-sd-decision-reference details").first();
    const reclosedKey = await reclosed.getAttribute("data-lf-disclosure");
    expect(reclosedKey).toBeTruthy();
    await reclosed.locator("summary").click();
    await reclosed.locator("summary").click();
    await expect(reclosed).toHaveJSProperty("open", false);
    const footer = initial.locator('[data-lf-disclosure="footer:What we fix"]');
    await footer.locator("summary").click();
    await expect(footer).toHaveJSProperty("open", true);
    await footer.evaluate(async node => {
      await Promise.all(node.getAnimations({ subtree: true })
        .filter(animation => Number.isFinite(Number(animation.effect?.getTiming().iterations)))
        .map(animation => animation.finished.catch(() => {})));
    });
    await settleVisibleType(page);
    const brokenTech = footer.locator('a[href="/services/it-support/"]');
    await brokenTech.focus();
    await expect(brokenTech).toBeFocused();
    release();
    const mounted = page.locator("[data-lf-route-mount]");
    await expect(mounted).toBeVisible();
    const mountedFooter = mounted.locator('[data-lf-disclosure="footer:What we fix"]');
    const mountedBrokenTech = mountedFooter.locator('a[href="/services/it-support/"]');
    await expect(mountedFooter).toHaveJSProperty("open", true);
    await expect(mounted.locator(`details[data-lf-disclosure=${JSON.stringify(reclosedKey)}]`)).toHaveJSProperty("open", false);
    await expect(mountedBrokenTech).toBeFocused();
    // This is a normal local navigation, activated through the actual native
    // keyboard path after the static document has handed off.
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/services\/it-support\/$/);
  });
}

test("a native proof disclosure finishes its held keyboard press across loading @all-projects", async ({ page }) => {
  let release = () => {};
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/assets/CaseStudyDetail-*.js", async request => { await held; await request.continue(); });
  await page.goto("/case-studies/hair-by-rachel-charles/", { waitUntil: "domcontentloaded" });
  const snapshot = page.locator("[data-lf-route-snapshot]");
  const mounted = page.locator("[data-lf-route-mount]");
  const selector = 'details[data-lf-disclosure="feature-proof:hair-by-rachel-charles"]';
  await snapshot.locator(`${selector} > summary`).focus();
  await page.keyboard.down("Space");
  release();
  await expect(mounted.locator(selector)).toBeAttached();
  await expect(snapshot).toBeVisible();
  await page.keyboard.up("Space");
  await expect(snapshot).toHaveCount(0);
  await expect(mounted.locator(selector)).toHaveJSProperty("open", true);
  await expect(mounted.locator(`${selector} > summary`)).toBeFocused();
});

test("the website decision follows evidence and terms before optional depth @all-projects", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/custom-local-websites/", { waitUntil: "networkidle" });
  await settleVisibleType(page);
  const proof = page.locator(".lf-sd-web");
  const contact = page.locator(".lf-contact-block");
  await expect(page.locator(".lf-sd-rachel-proof figcaption a")).toHaveAttribute("href", "/case-studies/hair-by-rachel-charles/");
  // The approved editorial removes stale scores; public work remains inspectable.
  await expect(proof).not.toContainText("30 Jul 2026");
  await expect(proof.locator(".lf-website-proof-set__check")).toHaveCount(0);
  await expect(proof.locator(".lf-website-proof-set__links a")).toHaveCount(6);
  await expect(proof).toContainText("Hair By Rachel Charles");
  await expect(proof).toContainText("Chromatic Painting & Design");
  await expect(proof).toContainText("CC Films");
  await expect(proof.locator('[data-lf-website-proof-set="public-live"]')).toHaveCount(1);
  await expect(proof.locator('.lf-sd-web__steps')).toContainText("Paid scope stays separate");
  await expect(proof).toContainText("qualifying written scopes");
  await expect(proof).not.toContainText("in two weeks");
  const sequence = await page.locator("main").evaluate(root => [
    ".lf-sd-web", ".lf-contact-block", ".lf-owner-path", ".lf-sd-decision-reference",
  ].map(selector => root.querySelector(selector)!.getBoundingClientRect().top));
  expect(sequence).toEqual([...sequence].sort((a, b) => a - b));
  const decision = await contact.locator(".lf-contact-block__door--plan").boundingBox();
  expect(decision!.y + decision!.height).toBeLessThanOrEqual(6 * 844);
  const question = page.locator(".lf-sd-decision-reference details").first();
  await expect(question.locator("p")).toBeHidden();
  await question.locator("summary").click();
  await expect(question.locator("p")).toBeVisible();
  await expect(page.locator(".lf-night-shift")).toHaveCount(0);
});

test("responsive case proof starts natively and preserves explicit device choices @all-projects", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/case-studies/hair-by-rachel-charles/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-lf-route-snapshot]")).toHaveCount(0);
  const explorer = page.locator(".lf-live-explorer");
  const image = explorer.locator(".lf-live-explorer__viewport img");
  await image.scrollIntoViewIfNeeded();
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).currentSrc)).toContain("-explore-mobile.webp");
  await expect(explorer.getByRole("button", { name: "Fit preview to this screen" })).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "Desktop preview", exact: true }).click();
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).currentSrc)).toContain("-explore.webp");
  await expect(explorer.getByRole("button", { name: "Desktop preview", exact: true })).toHaveAttribute("aria-pressed", "true");
  await explorer.getByRole("button", { name: "Fit preview to this screen" }).click();
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).currentSrc)).toContain("-explore-mobile.webp");
});

for (const gesture of ["pointer", "space", "cancelled pointer"] as const) {
  test(`initial proof retains a ${gesture} press through mounting without inventing activation @all-projects`, async ({ page }) => {
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/assets/CaseStudyDetail-*.js", async request => {
      await held;
      await request.continue();
    });
    await page.goto("/case-studies/hair-by-rachel-charles/", { waitUntil: "domcontentloaded" });
    const snapshot = page.locator("[data-lf-route-snapshot]");
    const mounted = page.locator("[data-lf-route-mount]");
    const tab = snapshot.locator('[data-feature-proof-step="1"]');
    await tab.scrollIntoViewIfNeeded();
    if (gesture === "space") {
      await tab.focus();
      await page.keyboard.down("Space");
    } else {
      const box = await tab.boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.down();
    }
    release();
    // React may finish mounting while the real press is still held. Its
    // ready tree must not replace the target before click/keyup occurs.
    await expect(mounted.locator("[data-feature-proof]")).toBeAttached();
    await expect(snapshot).toBeVisible();
    if (gesture === "space") await page.keyboard.up("Space");
    else {
      if (gesture === "cancelled pointer") await page.mouse.move(2, 2);
      await page.mouse.up();
    }
    await expect(snapshot).toHaveCount(0);
    const selected = gesture === "cancelled pointer" ? "0" : "1";
    await expect(mounted.locator(`[data-feature-proof-step="${selected}"]`)).toHaveAttribute("aria-selected", "true");
  });
}

for (const attempt of ["empty", "valid", "privacy after submit"] as const) {
  test(`a delayed human inquiry handles the ${attempt} attempt through the real handler @all-projects`, async ({ page }) => {
    let release = () => {};
    const held = new Promise<void>(resolve => { release = resolve; });
    const posts: string[] = [];
    await page.route("**/assets/TechAudit-*.js", async request => { await held; await request.continue(); });
    await page.route("**/*", async request => {
      if (request.request().method() !== "POST") return request.fallback();
      posts.push(request.request().postData() ?? "");
      await request.fulfill({ contentType: "text/html", body: "<!doctype html><title>Local inquiry fixture</title><h1>Local inquiry fixture</h1>" });
    });
    await page.goto("/tech-audit/?intent=website&source=no_website_check", { waitUntil: "domcontentloaded" });
    const snapshot = page.locator("[data-lf-route-snapshot]");
    const form = snapshot.locator(".lf-audit__form");
    await expect(form).toBeVisible();
    if (attempt !== "empty") {
      await form.locator('[name="name"]').fill("Local test");
      await form.locator('[name="business"]').fill("Local test business");
      await form.locator('[name="contact"]').fill("owner@example.com");
      await form.locator('[name="message"]').fill("Customers need a clearer way to book.");
    }
    await form.locator('button[type="submit"]').click();
    await expect(form).toHaveAttribute("aria-busy", "true");
    expect(posts).toEqual([]);
    if (attempt === "privacy after submit") {
      await snapshot.getByRole("button", { name: "Privacy choices", exact: true }).click();
      await expect(form).toHaveAttribute("aria-busy", "false");
      await expect(form.locator('button[type="submit"]')).toBeEnabled();
    }
    release();
    if (attempt === "valid") {
      await expect(page.getByRole("heading", { name: "Local inquiry fixture" })).toBeVisible();
      expect(posts).toHaveLength(1);
      const payload = new URLSearchParams(posts[0]);
      expect(payload.get("contact")).toBe("owner@example.com");
      expect(payload.get("intent")).toBe("website");
      expect(payload.get("lead_origin")).toBe("no_website_check");
    } else {
      const mounted = page.locator("[data-lf-route-mount]");
      await expect(mounted).toBeVisible();
      if (attempt === "empty") {
        await expect(mounted.locator('.lf-audit__error[role="alert"]')).toHaveCount(4);
        await expect(mounted.locator('[name="name"]')).toBeFocused();
      } else {
        await expect(page.getByRole("region", { name: "Privacy preferences", exact: true })).toBeFocused();
        await expect(mounted.locator('[name="contact"]')).toHaveValue("owner@example.com");
      }
      expect(posts).toEqual([]);
    }
  });
}

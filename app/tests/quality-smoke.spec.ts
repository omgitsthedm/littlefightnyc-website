import { readFileSync } from "node:fs";
import { AxeBuilder } from "@axe-core/playwright";
import {
  expect,
  test,
  type ConsoleMessage,
  type Page,
  type TestInfo,
} from "@playwright/test";

const PREVIEW_ORIGINS = new Set([
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;

type RouteMetaPage = {
  path: string;
  title: string;
  noindex?: boolean;
};

type RouteMetadata = {
  pages: RouteMetaPage[];
};

const ROUTE_METADATA = JSON.parse(
  readFileSync(
    new URL("../src/data/route-meta.json", import.meta.url),
    "utf8",
  ),
) as RouteMetadata;

type ProjectTag =
  | "@chromium-desktop"
  | "@chromium-mobile"
  | "@firefox-desktop"
  | "@webkit-mobile";

type RouteContract = {
  key: string;
  label: string;
  path: string;
  title: string;
  h1: RegExp;
  criticalLink: string;
  tags: readonly ProjectTag[];
  allows404Response?: boolean;
};

const ROUTES: readonly RouteContract[] = [
  {
    key: "home",
    label: "Home",
    path: "/",
    title: "Little Fight NYC | Websites, IT Support & Custom Software",
    h1: /Your business is custom\.\s*Your website should be too\./i,
    criticalLink: 'a[href="/tech-audit/?intent=website"]',
    tags: [
      "@chromium-desktop",
      "@chromium-mobile",
      "@firefox-desktop",
      "@webkit-mobile",
    ],
  },
  {
    key: "services",
    label: "Services",
    path: "/services/",
    title: "NYC Websites, IT Support & Custom Software | Little Fight NYC",
    h1: /You explain the day\.\s*We find the useful fix\./i,
    criticalLink: 'a[href="/services/custom-local-websites/"]',
    tags: ["@chromium-desktop", "@firefox-desktop"],
  },
  {
    key: "examples",
    label: "Examples",
    path: "/examples/",
    title: "NYC Work & Small Business Answers | Little Fight NYC",
    h1: /See what works\.\s*Try what is next\./i,
    criticalLink: 'a[href="/case-studies/hair-by-rachel-charles/"]',
    tags: ["@chromium-desktop", "@firefox-desktop"],
  },
  {
    key: "rachel",
    label: "Hair By Rachel Charles case study",
    path: "/case-studies/hair-by-rachel-charles/",
    title: "Hair By Rachel Charles Website Case Study | Little Fight NYC",
    h1: /A bright editorial chair in Chelsea/i,
    criticalLink: 'a[href="/services/custom-local-websites/"]',
    tags: ["@chromium-desktop", "@chromium-mobile", "@webkit-mobile"],
  },
  {
    key: "library",
    label: "Library",
    path: "/library/",
    title: "The Library: Owner Answers & Field Notes | Little Fight NYC",
    h1: /Start with what happened\.\s*Find the next move\./i,
    criticalLink: 'a[href="/answers/website-down-emergency-nyc/"]',
    tags: ["@chromium-desktop", "@chromium-mobile"],
  },
  {
    key: "about",
    label: "About",
    path: "/about/",
    title: "About Little Fight NYC | NYC Small Business Tech",
    h1: /Small firm\.\s*Serious pull\./i,
    criticalLink: 'a[href="tel:+16463600318"]',
    tags: ["@chromium-desktop"],
  },
  {
    key: "tech-audit",
    label: "Tech Audit",
    path: "/tech-audit/",
    title: "Free Tech Audit for NYC Small Businesses | Little Fight NYC",
    h1: /Tell us what is\s*getting in the way\./i,
    criticalLink: 'a[href="tel:+16463600318"]',
    tags: ["@chromium-desktop", "@chromium-mobile", "@webkit-mobile"],
  },
  {
    key: "spanish",
    label: "Spanish",
    path: "/es/",
    title: "Páginas web y tecnología en español | Little Fight NYC",
    h1: /Una página web hecha para su negocio\.\s*Ayuda real cuando algo falla\./i,
    criticalLink: 'a[href^="/tech-audit/"]',
    tags: ["@chromium-desktop"],
  },
  {
    key: "chinese",
    label: "Chinese",
    path: "/zh/",
    title: "Little Fight NYC 中文 | 纽约小生意的网站与技术支持",
    h1: /网站按您的生意来做。\s*技术出问题时，有真人帮您。/,
    criticalLink: 'a[href^="/tech-audit/"]',
    tags: ["@chromium-desktop", "@webkit-mobile"],
  },
  {
    key: "not-found",
    label: "404",
    path: "/quality-smoke-page-that-does-not-exist/",
    title: "Page Not Found | Little Fight NYC",
    h1: /This page got knocked out\./i,
    criticalLink: 'a[href="tel:+16463600318"]',
    tags: ["@chromium-desktop", "@firefox-desktop"],
    allows404Response: true,
  },
] as const;

/*
 * These representative React routes contain no documented third-party embed
 * or preserved archive DOM, so the correct axe exclusion set is empty. Keep
 * exclusions route-local if one of those surfaces is added later; never mask a
 * first-party component, rule, or whole page to make the scan pass.
 */
const DOCUMENTED_AXE_EXCLUSIONS: Readonly<Record<string, readonly string[]>> = {};

type RuntimeAudit = {
  consoleErrors: string[];
  pageErrors: string[];
};

function isFirstPartyConsoleMessage(message: ConsoleMessage): boolean {
  const source = message.location().url;
  if (!source || source.startsWith("blob:")) return true;

  try {
    return PREVIEW_ORIGINS.has(new URL(source).origin);
  } catch {
    return true;
  }
}

function watchRuntime(page: Page): RuntimeAudit {
  const audit: RuntimeAudit = {
    consoleErrors: [],
    pageErrors: [],
  };

  page.on("pageerror", (error) => {
    audit.pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error" || !isFirstPartyConsoleMessage(message)) {
      return;
    }

    const location = message.location();
    const source = location.url
      ? `${location.url}:${location.lineNumber}:${location.columnNumber}`
      : "unknown source";
    audit.consoleErrors.push(`${message.text()} (${source})`);
  });

  return audit;
}

function expectRuntimeClean(audit: RuntimeAudit): void {
  expect.soft(
    audit.pageErrors,
    `Unexpected uncaught page errors:\n${audit.pageErrors.join("\n")}`,
  ).toEqual([]);
  expect.soft(
    audit.consoleErrors,
    `Unexpected first-party console errors:\n${audit.consoleErrors.join("\n")}`,
  ).toEqual([]);
}

async function waitForStableDocument(page: Page): Promise<void> {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

function normalizeHeadingText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[‘’‛ʻʼʹ]/gu, "'")
    .replace(/[“”„‟]/gu, '"')
    .replace(/[‐‑‒–—―−]/gu, "-")
    .replace(/…/gu, "...")
    .replace(/\s+/gu, " ")
    .replace(/\s*([,.!?;:。！？；：])\s*/gu, "$1")
    .trim();
}

async function openRoute(page: Page, route: RouteContract): Promise<void> {
  const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
  expect.soft(response, `${route.label} did not return a navigation response`).not.toBeNull();

  if (response) {
    const status = response.status();
    const acceptable = route.allows404Response
      ? status === 200 || status === 404
      : status >= 200 && status < 400;
    expect.soft(
      acceptable,
      `${route.label} returned unexpected HTTP ${status}`,
    ).toBe(true);
  }

  await expect(page).toHaveTitle(route.title);
  await expect(
    page.getByRole("heading", { level: 1, name: route.h1 }),
  ).toBeVisible();
  await waitForStableDocument(page);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const report = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const scrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    );

    const offenders =
      scrollWidth <= viewportWidth + 1
        ? []
        : Array.from(document.querySelectorAll<HTMLElement>("body *"))
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && (
                rect.left < -1 || rect.right > viewportWidth + 1
              );
            })
            .slice(0, 8)
            .map((element) => {
              const id = element.id ? `#${element.id}` : "";
              const classes =
                typeof element.className === "string" && element.className.trim()
                  ? `.${element.className.trim().split(/\s+/).join(".")}`
                  : "";
              return `${element.tagName.toLowerCase()}${id}${classes}`;
            });

    return { offenders, scrollWidth, viewportWidth };
  });

  expect.soft(
    report.scrollWidth,
    `Horizontal overflow: ${report.scrollWidth}px document in ${report.viewportWidth}px viewport. Possible offenders: ${report.offenders.join(", ") || "none identified"}`,
  ).toBeLessThanOrEqual(report.viewportWidth + 1);
}

async function expectAxeClean(
  page: Page,
  route: RouteContract,
  testInfo: TestInfo,
): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags([...WCAG_TAGS]);
  for (const selector of DOCUMENTED_AXE_EXCLUSIONS[route.key] ?? []) {
    builder = builder.exclude(selector);
  }

  const results = await builder.analyze();
  if (results.violations.length > 0) {
    await testInfo.attach(`axe-${route.key}`, {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    });
  }

  const summary = results.violations.map((violation) => (
    `${violation.id} [${violation.impact ?? "impact unknown"}] ${violation.nodes.length} node(s): ${violation.help}`
  ));
  expect.soft(
    summary,
    `WCAG A/AA violations on ${route.path}:\n${summary.join("\n")}`,
  ).toEqual([]);
}

for (const route of ROUTES) {
  test(
    `route contract: ${route.label} ${route.tags.join(" ")}`,
    async ({ page }, testInfo) => {
      const runtime = watchRuntime(page);
      await openRoute(page, route);

      const main = page.getByRole("main");
      await expect.soft(main).toHaveCount(1);
      await expect.soft(main).toBeVisible();
      await expect.soft(page.locator("h1")).toHaveCount(1);
      await expect.soft(
        main.locator(route.criticalLink).filter({ visible: true }).first(),
        `${route.label} is missing its visible critical content link`,
      ).toBeVisible();

      await expectNoHorizontalOverflow(page);
      await expectAxeClean(page, route, testInfo);
      expectRuntimeClean(runtime);
    },
  );
}

test(
  "first-response and hydrated H1 stay equal on every indexed route @chromium-desktop",
  async ({ page, request }, testInfo) => {
    test.setTimeout(180_000);
    const runtime = watchRuntime(page);
    const indexedRoutes = ROUTE_METADATA.pages.filter((route) => !route.noindex);
    expect(
      indexedRoutes,
      "The indexed route baseline changed; review the route policy and update the expected count intentionally.",
    ).toHaveLength(130);

    type H1Mismatch = {
      path: string;
      firstResponse: string | null;
      hydrated: string | null;
      detail: string;
    };
    const mismatches: H1Mismatch[] = [];

    await openRoute(page, ROUTES[0]);

    for (const route of indexedRoutes) {
      try {
        const response = await request.get(route.path, {
          failOnStatusCode: false,
          headers: { "cache-control": "no-cache" },
        });
        if (!response.ok()) {
          mismatches.push({
            path: route.path,
            firstResponse: null,
            hydrated: null,
            detail: `First response returned HTTP ${response.status()}`,
          });
          continue;
        }

        const firstResponseMarkup = await response.text();
        const firstResponseH1 = await page.evaluate((markup) => {
          const documentFromResponse = new DOMParser().parseFromString(
            markup,
            "text/html",
          );
          const headings = Array.from(documentFromResponse.querySelectorAll("h1"));
          return {
            count: headings.length,
            text: headings[0]?.textContent ?? "",
          };
        }, firstResponseMarkup);

        await page.evaluate((nextPath) => {
          window.history.pushState(
            { __lfQualityParity: true },
            "",
            nextPath,
          );
          window.dispatchEvent(
            new PopStateEvent("popstate", { state: window.history.state }),
          );
        }, route.path);
        await page.waitForURL((url) => url.pathname === route.path);
        await page.waitForFunction(
          (expectedTitle) => document.title === expectedTitle,
          route.title,
        );
        await page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => resolve());
            });
          });
        });
        await page.waitForFunction(() => {
          const headings = document.querySelectorAll("main h1");
          return headings.length === 1
            && Boolean(headings[0]?.textContent?.trim());
        });

        const hydratedHeadings = await page.locator("main h1").allTextContents();
        const firstResponseText = normalizeHeadingText(firstResponseH1.text);
        const hydratedText = normalizeHeadingText(hydratedHeadings[0] ?? "");

        if (firstResponseH1.count !== 1) {
          mismatches.push({
            path: route.path,
            firstResponse: firstResponseText || null,
            hydrated: hydratedText || null,
            detail: `First response contained ${firstResponseH1.count} h1 elements`,
          });
        } else if (hydratedHeadings.length !== 1) {
          mismatches.push({
            path: route.path,
            firstResponse: firstResponseText || null,
            hydrated: hydratedText || null,
            detail: `Hydrated main contained ${hydratedHeadings.length} h1 elements`,
          });
        } else if (firstResponseText !== hydratedText) {
          mismatches.push({
            path: route.path,
            firstResponse: firstResponseText,
            hydrated: hydratedText,
            detail: "Normalized h1 text differs",
          });
        }
      } catch (error) {
        mismatches.push({
          path: route.path,
          firstResponse: null,
          hydrated: null,
          detail: error instanceof Error ? error.message : String(error),
        });
      }
    }

    if (mismatches.length > 0) {
      await testInfo.attach("indexed-route-h1-mismatches", {
        body: JSON.stringify(mismatches, null, 2),
        contentType: "application/json",
      });
    }

    const summary = mismatches.map((mismatch) => (
      `${mismatch.path}: ${mismatch.detail}; first="${mismatch.firstResponse ?? "missing"}"; hydrated="${mismatch.hydrated ?? "missing"}"`
    ));
    expect(
      summary,
      `First-response/hydrated h1 parity failed on ${mismatches.length} indexed route(s):\n${summary.join("\n")}`,
    ).toEqual([]);
    expectRuntimeClean(runtime);
  },
);

test(
  "reduced motion preserves meaning and removes long-running motion @all-projects",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRoute(page, ROUTES[0]);

    expect(
      await page.evaluate(() => (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )),
    ).toBe(true);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Your business is custom\.\s*Your website should be too\./i,
      }),
    ).toBeVisible();
    await expect(
      page.locator(".lf-hero").getByRole("link", {
        name: /Get my website plan/i,
      }),
    ).toBeVisible();

    const mainState = await page.getByRole("main").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        opacity: Number.parseFloat(style.opacity),
        visibility: style.visibility,
      };
    });
    expect(mainState.visibility).toBe("visible");
    expect(mainState.opacity).toBeGreaterThan(0);

    await page.waitForTimeout(250);
    const unsafeAnimations = await page.evaluate(() => (
      document.getAnimations()
        .filter((animation) => {
          const timing = animation.effect?.getComputedTiming();
          if (!timing || animation.playState !== "running") return false;
          const duration =
            typeof timing.duration === "number" ? timing.duration : 0;
          return timing.iterations === Infinity || duration > 1_000;
        })
        .map((animation) => {
          const namedAnimation = animation as Animation & {
            animationName?: string;
          };
          return namedAnimation.animationName || animation.id || "unnamed animation";
        })
    ));
    expect(
      unsafeAnimations,
      `Long-running animations remained active under reduced motion: ${unsafeAnimations.join(", ")}`,
    ).toEqual([]);

    await expectNoHorizontalOverflow(page);
    expectRuntimeClean(runtime);
  },
);

test(
  "mobile full-page scroll does not reload or crash @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    await page.addInitScript(() => {
      if (window !== window.top) return;
      const key = "__lf_quality_load_count__";
      const next = Number.parseInt(window.sessionStorage.getItem(key) ?? "0", 10) + 1;
      window.sessionStorage.setItem(key, String(next));
    });

    const runtime = watchRuntime(page);
    let crashed = false;
    page.on("crash", () => {
      crashed = true;
    });

    await openRoute(page, ROUTES[0]);
    const initialPath = new URL(page.url()).pathname;

    for (let pass = 0; pass < 2; pass += 1) {
      const height = await page.evaluate(() => (
        Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      ));
      const viewport = await page.evaluate(() => window.innerHeight);
      const distance = Math.max(0, height - viewport);

      for (let step = 1; step <= 10; step += 1) {
        await page.evaluate(
          (nextY) => window.scrollTo(0, nextY),
          Math.round(distance * (step / 10)),
        );
        await page.waitForTimeout(35);
      }
    }

    await page.evaluate(() => {
      const finalHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      window.scrollTo(0, Math.max(0, finalHeight - window.innerHeight));
    });
    await page.waitForTimeout(100);

    const bottomGap = await page.evaluate(() => (
      Math.max(
        0,
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight),
      )
    ));
    expect(bottomGap).toBeLessThanOrEqual(2);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const loadCount = await page.evaluate(() => (
      Number.parseInt(
        window.sessionStorage.getItem("__lf_quality_load_count__") ?? "0",
        10,
      )
    ));
    expect(loadCount, "The page reloaded during a full mobile scroll").toBe(1);
    expect(crashed, "Playwright observed a renderer crash").toBe(false);
    expect(new URL(page.url()).pathname).toBe(initialPath);

    await expectNoHorizontalOverflow(page);
    expectRuntimeClean(runtime);
  },
);

test(
  "Tech Audit blocks an empty required form without submitting @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    const firstPartyPosts: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "POST") return;
      try {
        if (PREVIEW_ORIGINS.has(new URL(request.url()).origin)) {
          firstPartyPosts.push(request.url());
        }
      } catch {
        firstPartyPosts.push(request.url());
      }
    });

    await openRoute(page, ROUTES.find((route) => route.key === "tech-audit")!);
    const form = page.locator('form[name="tech-audit-scratch"]');
    await expect(form).toBeVisible();
    await page.getByRole("button", { name: "Send my note" }).click();

    await expect(form.locator('.lf-audit__error[role="alert"]')).toHaveCount(4);
    for (const field of ["name", "business", "contact", "message"]) {
      await expect(form.locator(`[name="${field}"]`)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }
    await expect(form.locator('[name="name"]')).toBeFocused();
    expect(firstPartyPosts, "Validation allowed a first-party POST").toEqual([]);
    expect(new URL(page.url()).pathname).toBe("/tech-audit/");

    // A blocked attempt must not be counted as a conversion. preventDefault
    // stops the submission but not the bubbling, so the window-level analytics
    // listener used to fire anyway — recording form_submit and
    // tech_audit_submit, and setting the flag that marks this visitor as
    // already converted so they stop being asked.
    const submittedFlag = await page.evaluate(() => {
      try {
        return window.sessionStorage.getItem("lf_tech_audit_submitted");
      } catch {
        return "storage-unavailable";
      }
    });
    expect(
      submittedFlag,
      "A validation-blocked submit was recorded as a conversion",
    ).toBeNull();

    expectRuntimeClean(runtime);
  },
);

test(
  "Library search and type filters remain usable @chromium-desktop @chromium-mobile",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES.find((route) => route.key === "library")!);

    const search = page.getByRole("searchbox", { name: "Describe the problem" });
    const allFilter = page.getByRole("button", { name: /^All\s+\d+/i });
    const howToFilter = page.getByRole("button", { name: /^How To\s+\d+/i });

    await search.fill("email");
    await expect(page.locator(".lf-library-find__status")).toContainText(
      /result.*email/i,
    );
    await expect(allFilter).toBeDisabled();
    await expect(howToFilter).toBeDisabled();

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(search).toHaveValue("");
    await expect(allFilter).toBeEnabled();
    await expect(howToFilter).toBeEnabled();

    await howToFilter.click();
    await expect(howToFilter).toHaveAttribute("aria-pressed", "true");
    await expect(allFilter).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".lf-journal-featured")).toBeVisible();

    await expectNoHorizontalOverflow(page);
    expectRuntimeClean(runtime);
  },
);

test(
  "a malformed URL fragment does not blank the page @chromium-desktop @chromium-mobile",
  async ({ page, baseURL }) => {
    // decodeURIComponent throws URIError on these. RouteScrollManager decodes
    // the fragment in a layout effect mounted outside the error boundary, so an
    // unguarded throw unmounted the whole tree and served an empty #root.
    // A clipped share link or a mangled email URL was enough to trigger it.
    const malformed = ["#%", "#%zz", "#%E0%A4%A"];

    for (const fragment of malformed) {
      await page.goto(`${baseURL}/${fragment}`, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");

      const rendered = await page.evaluate(() => {
        const root = document.getElementById("root");
        return {
          children: root ? root.children.length : 0,
          text: (document.body.innerText || "").trim().length,
        };
      });

      expect(rendered.children, `#root should render for ${fragment}`).toBeGreaterThan(0);
      expect(rendered.text, `page should have content for ${fragment}`).toBeGreaterThan(40);
      await expect(page.locator("h1").first()).toBeVisible();
    }

    // A well-formed fragment must still scroll to its target.
    await page.goto(`${baseURL}/#main-content`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#main-content")).toBeAttached();
  },
);

test(
  "Spanish and Chinese first paint matches what hydration renders @chromium-desktop",
  async ({ browser, baseURL }) => {
    // /es/ and /zh/ are the one place the site paints twice: a hand-authored
    // snapshot in prerender-seo.mjs shows first, then the React page replaces
    // it. Those two had silently drifted into separate translations — same
    // twelve headings, completely different wording — so a Spanish speaker
    // watched the page rewrite itself and crawlers indexed copy no visitor
    // ever kept. Nothing failed while they disagreed, which is why it lasted.
    for (const locale of ["es", "zh"] as const) {
      const headings = async (javaScriptEnabled: boolean) => {
        const context = await browser.newContext({ javaScriptEnabled });
        const page = await context.newPage();
        await page.goto(`${baseURL}/${locale}/`, {
          waitUntil: javaScriptEnabled ? "networkidle" : "domcontentloaded",
        });
        const found = await page
          .locator("main :is(h1, h2, h3)")
          .allInnerTexts();
        await context.close();
        return found.map((text) => text.replace(/\s+/g, " ").trim());
      };

      const prerendered = await headings(false);
      const hydrated = await headings(true);

      expect(
        prerendered.length,
        `/${locale}/ prerendered no headings at all`,
      ).toBeGreaterThan(0);
      expect(
        prerendered,
        `/${locale}/ first paint and hydration disagree`,
      ).toEqual(hydrated);
    }
  },
);

test(
  "losing signal shows an offline page, not a blank one @chromium-desktop",
  async ({ browser, baseURL }) => {
    // The audience is owners on phones — subways, basements, back rooms. The
    // service worker used to fall back to the cached homepage for any
    // navigation it could not fetch, which meant the browser got a 200 and the
    // homepage's HTML under a different URL; React then hydrated, found a
    // route chunk that was not cached either, and emptied the root. Measured
    // offline: status 200, no h1, body of exactly 0 characters. A blank page
    // reported as success.
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
      await page.reload({ waitUntil: "networkidle" });
    }
    expect(
      await page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
      "service worker never took control, so this test proves nothing",
    ).toBe(true);

    await context.setOffline(true);

    // A route this device has never opened, so there is no cached copy.
    const response = await page.goto(`${baseURL}/services/it-support/`, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status(), "offline navigation must not claim success").toBe(503);

    const offline = await page.evaluate(() => ({
      heading: document.querySelector("h1")?.textContent?.trim() ?? "",
      characters: document.body.innerText.trim().length,
      phone: document.querySelector('a[href^="tel:"]')?.getAttribute("href") ?? null,
    }));
    expect(offline.heading).toContain("offline");
    expect(offline.characters, "offline page must not be blank").toBeGreaterThan(100);
    expect(offline.phone, "the phone works when the web does not").toBeTruthy();

    // A page that IS cached must still serve its real content offline.
    await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
    expect(
      (await page.evaluate(() => document.body.innerText.trim().length)),
      "cached pages must still work offline",
    ).toBeGreaterThan(1000);

    await context.close();
  },
);

test(
  "VERA listings can be opened with the keyboard @chromium-desktop",
  async ({ page, baseURL }) => {
    // /vera/ is a vanilla-JS app outside the React build, so it gets no
    // type checking and no lint. Everything interactive was wired to a single
    // delegated click listener, and the only keydown handler in the file
    // handled Escape. Measured on production: 226 Discover rows, 0 focusable;
    // focus() left activeElement on BODY; Enter did nothing; click worked.
    // A keyboard or switch user could not open one listing — WCAG 2.1.1,
    // Level A, on the product this site showcases.
    //
    // The feed is proxied via _redirects, which vite preview does not apply,
    // so serve a trimmed copy of the real payload.
    const feed = readFileSync(
      new URL("./fixtures/vera-feed.json", import.meta.url),
      "utf8",
    );
    await page.route("**/vera/data/public.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: feed }),
    );

    await page.goto(`${baseURL}/vera/#/discover`, { waitUntil: "networkidle" });
    const rows = page.locator("tr[data-open]");
    await rows.first().waitFor();

    const total = await rows.count();
    expect(total, "no listing rows rendered — the fixture may have gone stale").toBeGreaterThan(0);
    expect(
      await page.locator("tr[data-open][tabindex]").count(),
      "every listing row must be reachable by keyboard",
    ).toBe(total);

    // Enter opens the inspector, and exactly one row reports itself expanded.
    await rows.first().focus();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("TR");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    expect(await page.locator('tr[data-open][aria-expanded="true"]').count()).toBe(1);

    // Escape closes it and the claim is withdrawn.
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-inspector]")).not.toHaveClass(/is-open/);
    expect(await page.locator('tr[data-open][aria-expanded="true"]').count()).toBe(0);

    // Space activates too, and must not scroll the page instead.
    await page.evaluate(() => window.scrollTo(0, 0));
    await rows.nth(1).focus();
    await page.keyboard.press(" ");
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    expect(await page.evaluate(() => window.scrollY), "Space must not scroll").toBe(0);

    // A focusable row nobody can see focused is half a fix.
    const outline = await rows.nth(2).evaluate((el) => {
      el.focus();
      return getComputedStyle(el).outlineStyle;
    });
    expect(outline, "focused rows need a visible ring").not.toBe("none");
  },
);

test(
  "VERA hides the views you are not looking at @chromium-desktop",
  async ({ page, baseURL }) => {
    // `hidden` lives in the UA stylesheet, so the author rule
    // `.page { display: grid }` beat it and every inactive view stayed in
    // layout. Empty ones measured zero and hid the problem; once a view had
    // rendered, its box stayed. After visiting Discover, its table sat below
    // the fold on Command, in the accessibility tree, and in innerText —
    // 40,574 characters on a view with 3,490 characters of content.
    const feed = readFileSync(
      new URL("./fixtures/vera-feed.json", import.meta.url),
      "utf8",
    );
    await page.route("**/vera/data/public.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: feed }),
    );

    // Render Discover first so it has real content, then leave it.
    await page.goto(`${baseURL}/vera/#/discover`, { waitUntil: "networkidle" });
    await page.locator("tr[data-open]").first().waitFor();
    await page.evaluate(() => {
      window.location.hash = "#/command";
    });
    await page.locator(".page--command:not([hidden])").waitFor();

    const leaked = await page.evaluate(() =>
      [...document.querySelectorAll("#main .page[hidden]")]
        .filter((section) => section.getBoundingClientRect().height > 0)
        .map((section) => section.className),
    );
    expect(leaked, "a hidden view is still taking up layout").toEqual([]);

    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll("#main .page[hidden]")].every(
          (section) => getComputedStyle(section).display === "none",
        ),
      ),
      "every hidden view must compute to display:none",
    ).toBe(true);

    // The table from Discover must not be readable while on Command.
    expect(
      await page.evaluate(
        () => document.querySelector("#main")?.innerText.includes("Score") ?? false,
      ),
      "Discover's table is still in the visible text of Command",
    ).toBe(false);
  },
);

test(
  "VERA's listing inspector behaves like a dialog @chromium-desktop",
  async ({ page, baseURL }) => {
    // The inspector covers the page and a scrim blocks the pointer, so it is a
    // modal in every way except the ones that matter to a keyboard. Focus stayed
    // on the row behind it and Tab walked the table under the scrim: the detail
    // a keyboard user had just opened was the one thing they could not reach.
    // Making the rows keyboard-operable is what made this reachable at all.
    const feed = readFileSync(
      new URL("./fixtures/vera-feed.json", import.meta.url),
      "utf8",
    );
    await page.route("**/vera/data/public.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: feed }),
    );
    await page.goto(`${baseURL}/vera/#/discover`, { waitUntil: "networkidle" });
    const rows = page.locator("tr[data-open]");
    await rows.first().waitFor();

    const inspector = page.locator("[data-inspector]");
    await expect(inspector).toHaveAttribute("role", "dialog");
    await expect(inspector).toHaveAttribute("aria-modal", "true");

    await rows.nth(2).focus();
    await page.keyboard.press("Enter");
    await expect(inspector).toHaveClass(/is-open/);

    const focusIsInside = () =>
      page.evaluate(() =>
        document.querySelector("[data-inspector]")!.contains(document.activeElement),
      );
    expect(await focusIsInside(), "opening must move focus into the dialog").toBe(true);

    // Tab must not escape, in either direction. Count the stops first and go
    // past the end — a fixed number of presses smaller than the panel's own
    // focusable count never reaches the boundary, so the wrap is never
    // exercised and the check passes with no trap at all.
    const stops = await page.evaluate(() => {
      const panel = document.querySelector("[data-inspector]")!;
      return [
        ...panel.querySelectorAll(
          'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
        ),
      ].filter((el) => (el as HTMLElement).offsetWidth > 0 || (el as HTMLElement).offsetHeight > 0)
        .length;
    });
    expect(stops, "no focusable controls found in the dialog").toBeGreaterThan(1);

    for (let step = 0; step < stops + 3; step += 1) {
      await page.keyboard.press("Tab");
      expect(await focusIsInside(), `Tab ${step + 1} of ${stops + 3} left the dialog`).toBe(true);
    }
    for (let step = 0; step < stops + 3; step += 1) {
      await page.keyboard.press("Shift+Tab");
      expect(
        await focusIsInside(),
        `Shift+Tab ${step + 1} of ${stops + 3} left the dialog`,
      ).toBe(true);
    }

    // Escape closes and hands focus back to the row that opened it.
    await page.keyboard.press("Escape");
    await expect(inspector).not.toHaveClass(/is-open/);
    // The restore is deferred a tick so it lands after the panel finishes
    // closing, so poll rather than reading activeElement immediately.
    await expect
      .poll(
        () => page.evaluate(() => document.activeElement?.tagName),
        { message: "closing must return focus to the row, not the top of the document" },
      )
      .toBe("TR");
  },
);

test(
  "route changes move focus and announce the page you landed on @chromium-desktop",
  async ({ browser, baseURL }) => {
    // Reduced motion is the strongest proxy signal for assistive-technology
    // users, and it was the only setting where this broke. RouteFocusManager
    // used a single requestAnimationFrame, which on the first navigation away
    // from Home lands in the window where the old tree is gone and the lazy
    // route has not mounted: <main> null so focus stayed on <body>, <h1> null
    // so the announcement fell back to a document.title that had not updated —
    // the HOME page's title, read out while standing on About.
    //
    // Everyone else was saved by accident, because view transitions delay that
    // frame past the remount. So the test has to run with reduced motion on, or
    // it passes on the broken code.
    for (const reducedMotion of ["reduce", "no-preference"] as const) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();

      // The window this guards against only exists while the route's chunk is
      // in flight. Served from disk it lands inside the first frame, so the bug
      // does not reproduce locally at all and the first version of this test
      // passed against the broken code. Measured the threshold on the reverted
      // component: 0ms and 250ms both look fine, 800ms reproduces it — the
      // announcement becomes the home page's document.title while standing on
      // About. Hold route chunks back past that.
      await page.route("**/assets/*.js", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        await route.continue();
      });

      await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });

      // The first hop off Home is the one that broke; the second is the control.
      for (const [href, label] of [
        ["/about/", "first hop off Home"],
        ["/services/", "second hop"],
      ] as const) {
        await page.locator(`a[href="${href}"]`).first().click();
        await page.waitForURL(`**${href}`);

        await expect
          .poll(
            () =>
              page.evaluate(() => {
                const active = document.activeElement as HTMLElement | null;
                return active?.id || active?.tagName || "";
              }),
            { message: `${reducedMotion}: focus was not moved to the landmark on the ${label}` },
          )
          .toBe("main-content");

        // Compare on collapsed whitespace: headings here carry a line break,
        // so innerText yields "\n" where the live region's textContent yields a
        // space. That difference is presentational, not a mismatch in what the
        // user is told.
        const collapse = (value: string) => value.replace(/\s+/g, " ").trim();
        const heading = collapse(await page.locator("h1").first().innerText());
        await expect
          .poll(
            async () =>
              collapse(
                await page.evaluate(
                  () =>
                    document.querySelector('[aria-live="polite"]')?.textContent ?? "",
                ),
              ),
            { message: `${reducedMotion}: the announcement did not match the page on the ${label}` },
          )
          .toBe(heading);
      }

      await context.close();
    }
  },
);

test(
  "withdrawing analytics consent removes the identifiers @chromium-desktop",
  async ({ browser, baseURL }) => {
    // Withdrawal told each vendor to stop but left every cookie already on the
    // device. Measured on production after granting then withdrawing: _ttp,
    // _tt_enable_cookie, ttcsid and ttcsid_<id> still on .littlefightnyc.com,
    // expiring 2027-08-24 — thirteen months of a durable identifier surviving
    // the opt-out meant to end it.
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      try {
        localStorage.setItem("lf_analytics_consent_v1", "granted");
      } catch {
        /* storage blocked; the assertions below still hold */
      }
    });
    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });

    // The real pixels do not boot against a local build, so plant the cookies
    // they leave — including the per-property names, which a fixed list of
    // exact matches would miss.
    await page.evaluate(() => {
      const expires = new Date(Date.now() + 400 * 864e5).toUTCString();
      for (const name of [
        "_ttp",
        "_tt_enable_cookie",
        "ttcsid",
        "ttcsid_ABC123",
        "_ga",
        "_ga_XYZ",
        "_clck",
      ]) {
        document.cookie = `${name}=testvalue; expires=${expires}; path=/`;
      }
    });
    expect((await context.cookies()).length, "fixture cookies were not set").toBeGreaterThan(0);

    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "denied");
      window.dispatchEvent(new CustomEvent("lf:analytics-consent", { detail: "denied" }));
    });

    await expect
      .poll(
        async () =>
          (await context.cookies())
            .map((cookie) => cookie.name)
            .filter((name) => /^(_tt|ttcsid|_ga|_gid|_gat|_cl|CLID)/.test(name)),
        { message: "vendor identifiers survived consent withdrawal" },
      )
      .toEqual([]);

    await context.close();
  },
);

test(
  "a broken image stops pretending to load @chromium-desktop",
  async ({ page, baseURL }) => {
    // skelImg had onLoad and a ref but no onError, so an image that never
    // arrived kept its shimmer running forever. On a bad connection the proof
    // wall — the case-study grid carrying the site's credibility argument —
    // filled with boxes animating "still loading" at something that had already
    // given up.
    const blocked: string[] = [];
    await page.route("**/*.{webp,jpg,jpeg,png,avif}", (route) => {
      blocked.push(route.request().url());
      return route.abort();
    });

    await page.goto(`${baseURL}/examples/`, { waitUntil: "domcontentloaded" });
    // Scroll so lazily-loaded images are actually requested and can fail.
    for (let screen = 0; screen < 6; screen += 1) {
      await page.evaluate(() => window.scrollBy(0, 900));
      await page.waitForTimeout(300);
    }
    expect(blocked.length, "no image requests were intercepted").toBeGreaterThan(0);

    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              [...document.querySelectorAll("img[data-img-skel][data-failed]")].filter(
                (img) => getComputedStyle(img).animationName !== "none",
              ).length,
          ),
        { message: "a failed image is still running the loading shimmer" },
      )
      .toBe(0);

    // And the failure is actually being detected, not just absent.
    expect(
      await page.locator("img[data-img-skel][data-failed]").count(),
      "no image was marked failed, so this proves nothing",
    ).toBeGreaterThan(0);
  },
);

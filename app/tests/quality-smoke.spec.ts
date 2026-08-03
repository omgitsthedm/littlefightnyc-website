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

const PHC_CASE_PATH = "/case-studies/public-house-creative/";
const PHC_FILM_SELECTOR = ".lf-cinematic-media";
const PHC_FILM_ROUTES = [
  { path: "/", placements: 1 },
  { path: "/examples/", placements: 2 },
  { path: PHC_CASE_PATH, placements: 2 },
  { path: "/services/", placements: 1 },
  { path: "/services/business-systems/", placements: 1 },
  { path: "/studio/cockpit/", placements: 1 },
  { path: "/es/", placements: 1 },
  { path: "/zh/", placements: 1 },
  ...[
    "lower-east-side",
    "east-village",
    "soho",
    "chelsea",
    "midtown",
    "upper-east-side",
    "upper-west-side",
    "west-village",
    "williamsburg",
    "bushwick",
    "park-slope",
    "dumbo",
    "astoria",
    "long-island-city",
    "greenwich-village",
    "financial-district",
    "the-bronx",
    "staten-island",
  ].map((area) => ({
    path: `/areas/${area}/business-systems/`,
    placements: 1,
  })),
] as const;

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
    h1: /Make it easier\s*for the next\s*customer to\s*choose you\./i,
    criticalLink: 'form[action="/examples/audit/"]',
    tags: [
      "@chromium-desktop",
      "@chromium-mobile",
      "@firefox-desktop",
      "@webkit-mobile",
    ],
  },
  {
    key: "website-check",
    label: "Website Check",
    path: "/website-check/",
    title: "Free Small Business Website Check | Little Fight NYC",
    h1: /See what gets in the way\./i,
    criticalLink: 'form[action="/examples/audit/"]',
    tags: ["@chromium-desktop", "@chromium-mobile"],
  },
  {
    key: "new-business-launch",
    label: "New business launch",
    path: "/services/new-business-launch/",
    title: "New Business Website & Tech Launch NYC | Little Fight NYC",
    h1: /Open with the front door already working\./i,
    criticalLink: 'a[href="/tech-audit/?intent=website&source=contact_block"]',
    tags: ["@chromium-desktop"],
  },
  {
    key: "ongoing-care",
    label: "Ongoing care",
    path: "/services/ongoing-care/",
    title: "Small Business Website Care NYC | Little Fight NYC",
    h1: /Keep the front door honest after launch\./i,
    criticalLink: 'a[href="/clients/"]',
    tags: ["@chromium-desktop"],
  },
  {
    key: "clients",
    label: "Current client support",
    path: "/clients/",
    title: "Current Client Support | Little Fight NYC",
    h1: /One clean door back in\./i,
    criticalLink: 'a[href^="mailto:support@littlefightnyc.com"]',
    tags: ["@chromium-desktop", "@chromium-mobile"],
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
  "PHC process film selects the responsive cache-stable source @all-projects",
  async ({ page }, testInfo) => {
    const runtime = watchRuntime(page);
    const response = await page.goto(PHC_CASE_PATH, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.ok(), "The PHC case study did not load").toBe(true);
    await waitForStableDocument(page);

    const film = page.locator(`.lf-pagehero__backdrop ${PHC_FILM_SELECTOR}`).first();
    await expect(film).toBeVisible();

    const poster = film.locator("img");
    await expect(poster).toHaveAttribute(
      "src",
      "/media/cabinetry-process-poster-c6d59dbc.webp",
    );

    const video = film.locator("video");
    const expectedSource = testInfo.project.name.includes("mobile")
      ? "/media/cabinetry-process-film-540-1a0bac73.mp4"
      : "/media/cabinetry-process-film-720-3d0d35f6.mp4";
    await expect
      .poll(
        () => video.evaluate((element) => (element as HTMLVideoElement).currentSrc),
        { message: `The film never selected ${expectedSource}` },
      )
      .toContain(expectedSource);

    await expect
      .poll(
        () => video.evaluate((element) => {
          const media = element as HTMLVideoElement;
          return media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && !media.paused;
        }),
        { message: "The muted inline film did not reach playing state" },
      )
      .toBe(true);

    expect(
      await video.evaluate((element) => {
        const media = element as HTMLVideoElement;
        return {
          autoplay: media.autoplay,
          controls: media.controls,
          loop: media.loop,
          muted: media.muted,
          playsInline: media.hasAttribute("playsinline"),
        };
      }),
    ).toEqual({
      autoplay: true,
      controls: false,
      loop: true,
      muted: true,
      playsInline: true,
    });

    const control = film.locator(".lf-cinematic-media__control");
    await expect(control).toBeVisible();
    await expect(control).toHaveAccessibleName("Pause process film");
    await control.click();
    await expect(control).toHaveAccessibleName("Play process film");
    expect(await video.evaluate((element) => (element as HTMLVideoElement).paused)).toBe(true);
    await control.click();
    await expect(control).toHaveAccessibleName("Pause process film");
    await expect
      .poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused))
      .toBe(false);

    await expect(
      page.locator(
        'img[src*="case-public-house"], img[src*="og-case-public-house"], img[src*="phc"]',
      ),
      "A legacy PHC logo image is still rendered on the case study",
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    expectRuntimeClean(runtime);
  },
);

test(
  "every PHC work surface renders the film and no legacy logo @chromium-desktop",
  async ({ page }) => {
    test.setTimeout(90_000);
    const runtime = watchRuntime(page);
    let placementCount = 0;

    for (const route of PHC_FILM_ROUTES) {
      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect.soft(response?.ok(), `${route.path} did not load`).toBe(true);

      const films = page.locator(PHC_FILM_SELECTOR);
      await expect(films.first(), `${route.path} did not render the PHC film`).toBeAttached();
      await expect(
        films,
        `${route.path} changed its expected number of PHC film placements`,
      ).toHaveCount(route.placements);
      await expect(
        films.locator('source[data-src$="cabinetry-process-film-540-1a0bac73.mp4"]'),
      ).toHaveCount(route.placements);
      await expect(
        films.locator('source[data-src$="cabinetry-process-film-720-3d0d35f6.mp4"]'),
      ).toHaveCount(route.placements);
      await expect(
        page.locator(
          'img[src*="case-public-house"], img[src*="og-case-public-house"], img[src*="phc"]',
        ),
        `${route.path} still renders a legacy PHC logo image`,
      ).toHaveCount(0);

      placementCount += await films.count();
    }

    expect(PHC_FILM_ROUTES).toHaveLength(26);
    expect(placementCount).toBe(28);
    expectRuntimeClean(runtime);
  },
);

test(
  "first-response and hydrated H1 stay equal on every indexed route @chromium-desktop",
  async ({ page, request }, testInfo) => {
    test.setTimeout(180_000);
    const runtime = watchRuntime(page);
    const indexedRoutes = ROUTE_METADATA.pages.filter((route) => !route.noindex);
    expect(
      indexedRoutes,
      "The indexed route baseline changed; review the route policy and update the expected count intentionally.",
    ).toHaveLength(134);

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
    const videoRequests: string[] = [];
    page.on("request", (request) => {
      if (/cabinetry-process-film-\d+-[a-f0-9]{8}\.mp4(?:\?|$)/.test(request.url())) {
        videoRequests.push(request.url());
      }
    });
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
        name: /Make it easier\s*for the next\s*customer to\s*choose you\./i,
      }),
    ).toBeVisible();
    await expect(
      page.locator(".lf-hero").getByRole("button", {
        name: /Check my website/i,
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

    const film = page.locator(PHC_FILM_SELECTOR).first();
    await expect(film).toBeAttached();
    await expect(film).toHaveAttribute("data-motion", "still");
    await expect(film.locator(".lf-cinematic-media__control")).toBeHidden();
    expect(
      await film.evaluate((element) => {
        const video = element.querySelector("video") as HTMLVideoElement | null;
        const sources = Array.from(element.querySelectorAll("source"));
        const poster = element.querySelector("img");
        return {
          currentSrc: video?.currentSrc ?? "",
          posterSrc: poster?.getAttribute("src") ?? "",
          sourceAttributes: sources.map((source) => source.getAttribute("src")),
          videoDisplay: video ? getComputedStyle(video).display : "missing",
        };
      }),
    ).toEqual({
      currentSrc: "",
      posterSrc: "/media/cabinetry-process-poster-c6d59dbc.webp",
      sourceAttributes: [null, null],
      videoDisplay: "none",
    });
    expect(
      videoRequests,
      "Reduced-motion visitors should keep the poster without downloading the film",
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
  "Tech Audit carries safe Audit report context into submission and confirmation @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    const reportId = "example-com-1a2b3c4d";
    const auditUrl = new URL("/tech-audit/", baseURL!);
    auditUrl.searchParams.set("intent", "website");
    auditUrl.searchParams.set("source", "audit-lab");
    auditUrl.searchParams.set("url", "https://example.com");
    auditUrl.searchParams.set("report", reportId);

    await page.goto(auditUrl.toString(), { waitUntil: "networkidle" });
    const form = page.locator('form[name="tech-audit-scratch"]');
    await expect(form).toBeVisible();
    await expect(form.locator('input[name="report_id"]')).toHaveValue(reportId);
    await expect(form.locator('input[name="dakota_capture_id"]')).toHaveValue("");
    await expect(form.locator('input[name="dakota_submitted_at"]')).toHaveValue("");

    const action = await form.getAttribute("action");
    const confirmationUrl = new URL(action!, baseURL!);
    expect(confirmationUrl.pathname).toBe("/thanks/");
    expect(confirmationUrl.searchParams.get("report")).toBe(reportId);

    const submittedReport = await form.evaluate((element) => (
      new FormData(element as HTMLFormElement).get("report_id")
    ));
    expect(submittedReport).toBe(reportId);

    await form.locator('input[name="name"]').fill("Test Owner");
    await form.locator('input[name="business"]').fill("Example Business");
    await form.locator('input[name="contact"]').fill("owner@example.com");
    await form.evaluate((element) => {
      element.addEventListener("submit", (event) => event.preventDefault(), { once: true });
      (element as HTMLFormElement).requestSubmit();
    });
    await expect(form.locator('input[name="dakota_capture_id"]')).toHaveValue(/^[0-9a-f-]{32,36}$/u);
    await expect(form.locator('input[name="dakota_submitted_at"]')).not.toHaveValue("");
    const dakotaCapture = await form.evaluate((element) => {
      const data = new FormData(element as HTMLFormElement);
      return {
        id: String(data.get("dakota_capture_id") ?? ""),
        submittedAt: String(data.get("dakota_submitted_at") ?? ""),
      };
    });
    expect(dakotaCapture.id).toMatch(/^[0-9a-f-]{32,36}$/u);
    expect(Number.isFinite(Date.parse(dakotaCapture.submittedAt))).toBe(true);
    await expect.poll(() => page.evaluate(() => (
      window.sessionStorage.getItem("lf_tech_audit_report_id")
    ))).toBe(reportId);

    // Simulate Netlify accepting the native POST while deliberately omitting
    // the query on this navigation. The session fallback must still retain the
    // safe report context on the confirmation route.
    await page.evaluate(() => {
      window.sessionStorage.setItem("lf_tech_audit_submitted", "true");
    });
    await page.goto(new URL("/thanks/", baseURL!).toString(), { waitUntil: "networkidle" });
    await expect(page.getByText("Your brief and website report are safely in the queue.")).toBeVisible();
    await expect.poll(() => page.evaluate(() => (
      window.sessionStorage.getItem("lf_tech_audit_report_id")
    ))).toBeNull();

    expectRuntimeClean(runtime);
  },
);

test(
  "Tech Audit rejects malformed Audit report context @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    const auditUrl = new URL("/tech-audit/", baseURL!);
    auditUrl.searchParams.set("intent", "website");
    auditUrl.searchParams.set("report", "../../private<script>");

    await page.goto(auditUrl.toString(), { waitUntil: "networkidle" });
    const form = page.locator('form[name="tech-audit-scratch"]');
    await expect(form).toBeVisible();
    await expect(form.locator('input[name="report_id"]')).toHaveValue("");

    const action = await form.getAttribute("action");
    const confirmationUrl = new URL(action!, baseURL!);
    expect(confirmationUrl.pathname).toBe("/thanks/");
    expect(confirmationUrl.search).toBe("");

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
        ["/services/custom-local-websites/", "second hop"],
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
  "analytics consent stays measurement-only while advertising is disabled @chromium-desktop @chromium-mobile",
  async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const thirdPartyHosts = new Set<string>();

    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "localhost" && host !== "127.0.0.1") thirdPartyHosts.add(host);
    });

    await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
    const consentPanel = page.locator(".lf-consent");
    await expect(consentPanel).toBeVisible();
    const panelGeometry = await consentPanel.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        viewportWidth: window.innerWidth,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
      };
    });
    expect(panelGeometry.left).toBeGreaterThanOrEqual(0);
    expect(panelGeometry.right).toBeLessThanOrEqual(panelGeometry.viewportWidth);
    expect(panelGeometry.scrollWidth).toBeLessThanOrEqual(panelGeometry.clientWidth);
    await page.getByRole("button", { name: "Allow analytics", exact: true }).click();

    const measurementOnly = await page.evaluate(() => {
      const consentUpdates = (window.dataLayer ?? [])
        .map((entry) => Array.from(entry as ArrayLike<unknown>))
        .filter((entry) => entry[0] === "consent" && entry[1] === "update")
        .map((entry) => entry[2] as Record<string, string>);
      return {
        analytics: localStorage.getItem("lf_analytics_consent_v1"),
        advertising: localStorage.getItem("lf_advertising_consent_v1"),
        consentUpdates,
        hasTikTokQueue: Boolean(window.ttq),
        hasTikTokScript: Boolean(
          document.querySelector('script[src*="analytics.tiktok.com"]'),
        ),
      };
    });

    expect(measurementOnly.analytics).toBe("granted");
    expect(measurementOnly.advertising).toBe("denied");
    expect(measurementOnly.consentUpdates).toContainEqual({
      analytics_storage: "granted",
    });
    expect(
      measurementOnly.consentUpdates.some((update) =>
        update.ad_storage === "granted" ||
        update.ad_user_data === "granted" ||
        update.ad_personalization === "granted",
      ),
    ).toBe(false);
    expect(measurementOnly.hasTikTokQueue).toBe(false);
    expect(measurementOnly.hasTikTokScript).toBe(false);

    await page.locator("#home-website-url").fill("private-fixture.example");
    await page.locator("#home-report-email").fill("private-fixture@example.com");
    await page.locator(".lf-hero__form").evaluate((form) => {
      form.addEventListener("submit", (event) => event.preventDefault(), { once: true });
    });
    await page.getByRole("button", { name: "Check my website", exact: true }).click();

    const websiteCheckEvent = await page.evaluate(() =>
      (window.dataLayer ?? []).findLast(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { event?: string }).event === "website_check_started",
      ) as Record<string, unknown> | undefined,
    );
    expect(websiteCheckEvent).toEqual({
      event: "website_check_started",
      funnel_stage: "consideration",
      page_path: "/",
      placement: "home_hero",
      source: "home",
    });
    expect(JSON.stringify(websiteCheckEvent)).not.toContain("private-fixture");

    await page.evaluate(() => window.dispatchEvent(new Event("lf:open-consent")));
    await expect(
      page.getByRole("button", { name: "Analytics + advertising", exact: true }),
    ).toHaveCount(0);
    const advertisingState = await page.evaluate(() => ({
      analytics: localStorage.getItem("lf_analytics_consent_v1"),
      advertising: localStorage.getItem("lf_advertising_consent_v1"),
      hasTikTokQueue: Boolean(window.ttq),
      hasTikTokScript: Boolean(
        document.querySelector('script[src*="analytics.tiktok.com"]'),
      ),
    }));

    expect(advertisingState.analytics).toBe("granted");
    expect(advertisingState.advertising).toBe("denied");
    expect(advertisingState.hasTikTokQueue).toBe(false);
    expect(advertisingState.hasTikTokScript).toBe(false);
    expect([...thirdPartyHosts], "a preview contacted an analytics vendor").toEqual([]);

    await context.close();
  },
);

test(
  "contact and Tech Audit starts carry useful metadata without preview vendor traffic @chromium-desktop",
  async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const thirdPartyHosts = new Set<string>();

    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "localhost" && host !== "127.0.0.1") {
        thirdPartyHosts.add(host);
      }
    });
    await page.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
    });

    await page.goto(`${baseURL}/about/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('a[href^="tel:"]');
      if (!link) throw new Error("phone link fixture is missing");
      link.addEventListener("click", (event) => event.preventDefault(), { once: true });
      link.click();
    });

    const phoneEvent = await page.evaluate(() =>
      (window.dataLayer ?? []).find(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { event?: string }).event === "phone_click",
      ) as Record<string, unknown> | undefined,
    );
    expect(phoneEvent).toMatchObject({
      event: "phone_click",
      funnel_stage: "contact",
      page_path: "/about/",
      placement: "about_founder_phone",
    });

    await page.goto(`${baseURL}/tech-audit/`, { waitUntil: "networkidle" });
    await page.locator("#fit-name").fill("Test");
    await page.locator("#fit-name").fill("Test Person");

    const starts = await page.evaluate(() =>
      (window.dataLayer ?? []).filter(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { event?: string }).event === "tech_audit_started",
      ) as Array<Record<string, unknown>>,
    );
    expect(starts).toHaveLength(1);
    expect(starts[0]).toMatchObject({
      entry_point: "field_name",
      funnel_stage: "consideration",
      page_path: "/tech-audit/",
    });
    expect([...thirdPartyHosts], "a preview contacted an analytics vendor").toEqual([]);

    await context.close();
  },
);

test(
  "Audit Lab tracks a consented funnel without leaking submitted values @chromium-desktop",
  async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const thirdPartyHosts = new Set<string>();

    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "localhost" && host !== "127.0.0.1") {
        thirdPartyHosts.add(host);
      }
    });
    await page.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      const auditEvents: unknown[] = [];
      (window as unknown as { __auditEvents: unknown[] }).__auditEvents = auditEvents;
      window.addEventListener("lf:audit-analytics", (event) => {
        auditEvents.push((event as CustomEvent).detail);
      });
    });
    await page.route("**/examples/audit/api/run-audit", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "test-audit-id" }),
      }),
    );
    let statusRequestCount = 0;
    await page.route("**/examples/audit/api/status?id=*", async (route) => {
      statusRequestCount += 1;
      if (statusRequestCount === 1) {
        // Let a second interval request finish first. The late response from
        // this request must not settle the same audit a second time.
        await new Promise((resolve) => setTimeout(resolve, 3_500));
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: "done", url: "#test-report" }),
      });
    });

    await page.goto(`${baseURL}/examples/audit/`, { waitUntil: "networkidle" });
    await page.locator("#siteUrl").fill("private-fixture.example");
    await page.locator("#email").fill("private-fixture@example.com");
    await page.locator("#submitBtn").click();

    await expect
      .poll(
        () =>
          page.evaluate(() =>
            (window as unknown as {
              __auditEvents: Array<{ eventName?: string }>;
            }).__auditEvents.map((entry) => entry.eventName),
          ),
        { timeout: 12_000 },
      )
      .toEqual([
        "audit_scan_started",
        "website_check_started",
        "audit_scan_accepted",
        "generate_lead",
        "audit_report_ready",
        "website_check_ready",
      ]);

    const events = await page.evaluate(
      () => (window as unknown as { __auditEvents: unknown[] }).__auditEvents,
    );
    expect(
      events.find(
        (event) =>
          (event as { eventName?: string }).eventName === "audit_scan_accepted",
      ),
    ).toMatchObject({
      eventName: "audit_scan_accepted",
      parameters: {
        funnel_stage: "submit",
        page_path: "/examples/audit/",
        response_status: 201,
        source: "audit_lab",
      },
    });
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("private-fixture.example");
    expect(serialized).not.toContain("private-fixture@example.com");
    expect(serialized).not.toContain("test-audit-id");
    expect(statusRequestCount).toBeGreaterThanOrEqual(2);

    await page.waitForTimeout(2_000);
    const settledEventNames = await page.evaluate(() =>
      (window as unknown as {
        __auditEvents: Array<{ eventName?: string }>;
      }).__auditEvents.map((entry) => entry.eventName),
    );
    expect(settledEventNames.filter((name) => name === "audit_report_ready")).toHaveLength(1);
    expect([...thirdPartyHosts], "Audit Lab contacted a vendor from preview").toEqual([]);

    await context.close();
  },
);

test(
  "Audit Lab withdraws consent across custom, storage, and page-show synchronization @chromium-desktop",
  async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.route("https://www.googletagmanager.com/**", (route) => route.abort());
    await page.addInitScript(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      const auditEvents: unknown[] = [];
      (window as unknown as { __auditEvents: unknown[] }).__auditEvents = auditEvents;
      window.addEventListener("lf:audit-analytics", (event) => {
        auditEvents.push((event as CustomEvent).detail);
      });
    });

    await page.goto(`${baseURL}/examples/audit/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const analytics = (
        window as unknown as {
          LittleFightAuditAnalytics: {
            track: (eventName: string, parameters?: Record<string, unknown>) => void;
          };
        }
      ).LittleFightAuditAnalytics;
      analytics.track("audit_scan_started", { funnel_stage: "consideration" });
    });

    const plantGaFixtures = async () => {
      await page.evaluate(() => {
        document.cookie = `_ga_audit_fixture=testvalue; expires=${new Date(
          Date.now() + 864e5,
        ).toUTCString()}; path=/`;
        const script = document.createElement("script");
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-0Q1TGWH0HL";
        script.dataset.auditFixture = "true";
        document.head.appendChild(script);
      });
    };
    const expectGaFixturesRemoved = async () => {
      await expect
        .poll(async () => ({
          cookies: (await context.cookies()).filter((cookie) =>
            cookie.name.startsWith("_ga"),
          ).length,
          scripts: await page.locator('script[data-audit-fixture="true"]').count(),
        }))
        .toEqual({ cookies: 0, scripts: 0 });
    };

    await plantGaFixtures();
    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "denied");
      window.dispatchEvent(new CustomEvent("lf:analytics-consent", { detail: "denied" }));
    });
    await expectGaFixturesRemoved();

    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "lf_analytics_consent_v1",
          newValue: "granted",
        }),
      );
    });
    await plantGaFixtures();
    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "denied");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "lf_analytics_consent_v1",
          newValue: "denied",
        }),
      );
    });
    await expectGaFixturesRemoved();

    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "granted");
      window.dispatchEvent(new CustomEvent("lf:analytics-consent", { detail: "granted" }));
    });
    await plantGaFixtures();
    await page.evaluate(() => {
      localStorage.setItem("lf_analytics_consent_v1", "denied");
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });
    await expectGaFixturesRemoved();

    const result = await page.evaluate(() => {
      const analytics = (
        window as unknown as {
          LittleFightAuditAnalytics: {
            track: (eventName: string, parameters?: Record<string, unknown>) => void;
          };
          __auditEvents: unknown[];
        }
      ).LittleFightAuditAnalytics;
      analytics.track("audit_scan_started", { funnel_stage: "consideration" });

      return {
        capturedEvents: (window as unknown as { __auditEvents: unknown[] }).__auditEvents.length,
        deniedUpdates: (window.dataLayer ?? []).filter((entry) => {
          const command = Array.from(entry as ArrayLike<unknown>);
          return command[0] === "consent" &&
            command[1] === "update" &&
            (command[2] as { analytics_storage?: string })?.analytics_storage === "denied";
        }).length,
      };
    });
    expect(result.capturedEvents).toBe(1);
    expect(result.deniedUpdates).toBeGreaterThanOrEqual(3);

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

test(
  "VERA tells assistive tech which filters and tabs are active @chromium-desktop",
  async ({ page, baseURL }) => {
    // Every toggle signalled its state with an `is-on` class and nothing else.
    // Measured live: 36 filter toggles, 5 visually active, 0 with aria-pressed;
    // 6 role="tab" buttons with 0 aria-selected. A screen reader could read the
    // labels and never learn which lens, bracket or borough was applied — the
    // whole filtering model was invisible.
    const feed = readFileSync(
      new URL("./fixtures/vera-feed.json", import.meta.url),
      "utf8",
    );
    await page.route("**/vera/data/public.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: feed }),
    );
    await page.goto(`${baseURL}/vera/#/discover`, { waitUntil: "networkidle" });
    await page.locator("tr[data-open]").first().waitFor();

    const TOGGLES =
      "[data-bracket],[data-unit],[data-transit],[data-lens],[data-view]," +
      "[data-area],[data-brtile],[data-hoodbar],[data-density],[data-stage],[data-hood]";

    // aria-pressed must exist on every toggle and agree with the visual state.
    const pressed = await page.evaluate((selector) => {
      const all = [...document.querySelectorAll(selector)].filter(
        (el) => el.getAttribute("role") !== "tab",
      );
      return {
        total: all.length,
        missing: all.filter((el) => !el.hasAttribute("aria-pressed")).length,
        disagreeing: all.filter(
          (el) =>
            (el.getAttribute("aria-pressed") === "true") !==
            el.classList.contains("is-on"),
        ).length,
      };
    }, TOGGLES);
    expect(pressed.total, "no toggles found, so this proves nothing").toBeGreaterThan(10);
    expect(pressed.missing, "toggles without aria-pressed").toBe(0);
    expect(pressed.disagreeing, "aria-pressed disagrees with the visual state").toBe(0);

    // Every view needs exactly one h1 — six rendered none and About rendered two.
    for (const view of ["command", "map", "discover", "cases", "toolkit", "pipeline", "about"]) {
      await page.evaluate((hash) => {
        window.location.hash = `#/${hash}`;
      }, view);
      await page.locator(`.page--${view === "cases" ? "cases" : view}:not([hidden])`).waitFor();
      expect(
        await page.locator(`.page:not([hidden]) h1`).count(),
        `${view} must have exactly one h1`,
      ).toBe(1);
    }

    // aria-selected must follow the open tab, not freeze on the first one.
    await page.evaluate(() => {
      window.location.hash = "#/discover";
    });
    await page.locator("tr[data-open]").first().click();
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    for (const tab of ["money", "records", "owner"]) {
      await page.locator(`[data-insp-tabs] button[data-tab="${tab}"]`).click();
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document
                  .querySelector('[role="tab"][aria-selected="true"]')
                  ?.getAttribute("data-tab") ?? "",
            ),
          { message: `aria-selected did not follow the ${tab} tab` },
        )
        .toBe(tab);
      expect(
        await page.locator('[role="tab"][aria-selected="true"]').count(),
        "more than one tab claims to be selected",
      ).toBe(1);
    }
  },
);

test(
  "the areas map does not call a third party until asked @chromium-desktop",
  async ({ browser, baseURL }) => {
    // /areas/* was the only page type on the site contacting anyone before
    // consent. The map used an IntersectionObserver with a 300px margin, and on
    // /areas/ it was already in range on arrival — so cartocdn.com was hit on
    // load across all 91 area routes, with 472KB of JS on a mobile profile
    // against a 150KB ceiling. Every other page type makes zero third-party
    // requests. Scrolling past something is not a request to load it.
    const context = await browser.newContext();
    const page = await context.newPage();
    const thirdParty = new Set<string>();
    page.on("request", (request) => {
      const host = new URL(request.url()).hostname;
      if (host !== "localhost" && host !== "127.0.0.1") thirdParty.add(host);
    });

    await page.goto(`${baseURL}/areas/`, { waitUntil: "networkidle" });
    // Scroll the whole page — the old trigger fired on proximity, so a test that
    // never scrolls would pass against the broken code.
    for (let screen = 0; screen < 5; screen += 1) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(800);

    expect(
      [...thirdParty],
      "a third party was contacted before anyone asked for the map",
    ).toEqual([]);

    // The content the map illustrates must not be behind the button.
    expect(
      await page.locator(".lf-minimap__chip").count(),
      "the neighbourhood chips must be present without loading the map",
    ).toBeGreaterThan(10);

    // And asking for it must actually work.
    const load = page.locator(".lf-minimap__load").first();
    await load.scrollIntoViewIfNeeded();
    await load.click();
    await expect(page.locator(".leaflet-container")).toBeAttached({ timeout: 15_000 });
    await expect(load).toHaveCount(0);

    await context.close();
  },
);

test(
  "Library search ignores punctuation the reader would not type @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES.find((route) => route.key === "library")!);

    const search = page.getByRole("searchbox", { name: "Describe the problem" });
    const status = page.locator(".lf-library-find__status");

    // Nobody types the hyphen in "Wi-Fi". Before folding, this returned nothing
    // while the Wi-Fi post sat in the library — a search that answers "no" to a
    // question the site can answer is worse than no search.
    await search.fill("wifi");
    await expect(status).not.toContainText(/^0 results/);

    // The spelling on the page still has to work.
    await search.fill("wi-fi");
    await expect(status).not.toContainText(/^0 results/);

    // Folding must not turn into matching everything: a phrase that appears
    // nowhere still returns nothing, so the filter is doing real work.
    await search.fill("zzzznotathing");
    await expect(status).toContainText(/^0 results/);

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "Library announces a settled result count once, not per keystroke @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES.find((route) => route.key === "library")!);

    // Count what a screen reader would actually be handed: every distinct text
    // a polite live region holds while the user types. The visible counter is
    // deliberately NOT a live region, so it must not appear here.
    await page.evaluate(() => {
      const seen: string[] = [];
      (window as unknown as { __spoken: string[] }).__spoken = seen;
      const regions = document.querySelectorAll('[aria-live="polite"]');
      regions.forEach((region) => {
        new MutationObserver(() => {
          const text = (region.textContent ?? "").trim();
          if (text && text !== seen[seen.length - 1]) seen.push(text);
        }).observe(region, { childList: true, subtree: true, characterData: true });
      });
    });

    const search = page.getByRole("searchbox", { name: "Describe the problem" });
    await search.pressSequentially("booking system", { delay: 40 });
    await expect(page.locator(".lf-library-find__status")).toContainText(
      /booking system/,
    );
    await page.waitForTimeout(1200);

    const spoken = await page.evaluate(
      () => (window as unknown as { __spoken: string[] }).__spoken,
    );

    // Fourteen characters used to produce seventeen announcements racing each
    // other. One is the whole point; two would mean the debounce is leaking.
    expect(spoken.length).toBeLessThanOrEqual(2);
    expect(spoken.length).toBeGreaterThan(0);
    expect(spoken[spoken.length - 1]).toMatch(/booking system/);

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "Tech Audit rejects an unreachable phone or email @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES.find((route) => route.key === "tech-audit")!);

    const contact = page.locator("#fit-contact");
    const error = page.locator("#fit-contact-error");

    // "Phone or email" used to be validated as "not empty". This is the only
    // field that says how to reply, so a typo here is a lead that is lost in a
    // specific way: the visitor watches the form succeed, then waits for a call
    // that cannot be placed.
    const unreachable: [string, RegExp][] = [
      ["hello@yourshop", /incomplete|typo/i],
      ["555-0118", /area code/i],
      ["david marsh", /phone or email/i],
    ];

    for (const [value, expected] of unreachable) {
      await contact.fill(value);
      await contact.blur();
      await expect(error).toBeVisible();
      await expect(error).toHaveText(expected);
      await expect(contact).toHaveAttribute("aria-invalid", "true");
    }

    // The permissive half matters just as much: arguing with how someone writes
    // their own phone number wins nothing.
    for (const value of [
      "hello@yourshop.com",
      "(646) 555-0118",
      "+1 646 555 0118",
      "JEN@SHOP.COM",
    ]) {
      await contact.fill(value);
      await contact.blur();
      await expect(error).toHaveCount(0);
    }

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "Canvas instruments get the width their drawing needs on a small phone @chromium-mobile",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`${baseURL}/services/it-support/`, { waitUntil: "networkidle" });

    // The editorial column takes 88px at this width — 20px of section padding
    // and 24px of tile padding a side. That left the canvas 230px while its
    // drawing is laid out for ~300px, so labels collided: "CARD READER" ran off
    // the right edge and "IT BREAKS" sat on top of "CALLBACK ≤ 2 HRS". Nothing
    // threw; it just looked broken to anyone on a small phone.
    //
    // Asserting the width rather than the pixels, because the failure was one of
    // space, and 300 is the width the drawing is known to render cleanly at.
    const instrument = page.locator(".lf-instrument").first();
    await instrument.scrollIntoViewIfNeeded();
    const box = await instrument.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(300);

    // Full-bleed is one bad calc() away from a sideways-scrolling page, and this
    // site has a standing no-horizontal-overflow rule.
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "VERA toolkit sliders keep focus across repeated arrow keys @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);

    // VERA's feed is proxied to another origin in production; the preview server
    // has no _redirects, so the request falls through to the SPA shell and the
    // app never leaves its loading state. Serve the shape it expects.
    await page.route("**/vera/data/public.json", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generated_at: new Date(0).toISOString(),
          app: { name: "VERA", subtitle: "test", version: "0" },
          summary: { hero_summary: "0 pursue" },
          shortlist: [],
          manual_review: [],
          skip_insights: [],
          recommendations: [],
          daily_changes: [],
        }),
      }),
    );

    await page.goto(`${baseURL}/vera/#/toolkit`, { waitUntil: "networkidle" });
    const slider = page.locator("[data-toolrent]");
    await expect(slider).toBeVisible();
    await slider.focus();

    // A range input fires 'input' AND 'change' on a single arrow press — there
    // is no thumb to release. The change handler rebuilds the toolkit, which
    // replaced the very input being operated and dropped focus to <body>. One
    // step worked and every press after it went nowhere, which is the whole
    // slider for someone not using a mouse.
    const values: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(220);
      values.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLInputElement | null;
          return el?.hasAttribute?.("data-toolrent") ? el.value : "LOST FOCUS";
        }),
      );
    }

    expect(values).not.toContain("LOST FOCUS");
    // Four presses must produce four distinct, increasing values — not one step
    // then silence.
    expect(new Set(values).size).toBe(4);
    expect(Number(values[3])).toBeGreaterThan(Number(values[0]));

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

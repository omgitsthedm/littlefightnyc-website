import { readFileSync } from "node:fs";
import { AxeBuilder } from "@axe-core/playwright";
import {
  expect,
  test,
  type ConsoleMessage,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { BOOKING_HREF, PHONE_HREF } from "../src/data/contact";

const requestedPreviewPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "4173", 10);
const previewPort = Number.isInteger(requestedPreviewPort) &&
  requestedPreviewPort >= 1024 && requestedPreviewPort <= 65535
  ? requestedPreviewPort : 4173;
const PREVIEW_ORIGINS = new Set([
  `http://127.0.0.1:${previewPort}`,
  `http://localhost:${previewPort}`,
]);

const PHC_CASE_PATH = "/case-studies/public-house-creative/";
const PHC_FILM_SELECTOR = ".lf-cinematic-media";
// PHC is protected client work. Keep coverage on the routes that deliberately
// retain its approved film; the owner-first homepage no longer uses it.
const PHC_FILM_ROUTES = [
  { path: PHC_CASE_PATH, placements: 2 },
  { path: "/services/business-systems/", placements: 1 },
  { path: "/studio/cockpit/", placements: 1 },
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
const PHC_FILM_NOT_EAGER_ROUTES = ["/", "/examples/", "/services/", "/es/", "/zh/"] as const;

const LAB_CONCEPT_SLUGS = [
  "walkup-3d",
  "terminal-3d",
  "pill-scroll",
  "micro-animations",
  "aha-laser",
  "studio-engine",
  "growth-street",
  "goliath",
  "pool-room",
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] as const;
const WCAG_22_AA_TAG = "wcag22aa" as const;

const VERA_FEED_FIXTURE = readFileSync(
  new URL("./fixtures/vera-feed.json", import.meta.url),
  "utf8",
);

async function mockVeraData(page: Page, fixtureBody = VERA_FEED_FIXTURE) {
  // VERA reads one first-party public feed. Stub window.fetch before it boots
  // so a newly claiming service worker
  // cannot bypass Playwright routing and turn the preview's SPA fallback into
  // a JSON failure. Matching the filename covers the feed and its receipts.
  await page.addInitScript((fixture) => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const raw =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const path = new URL(raw, window.location.href).pathname;
      if (path.endsWith("/public.json")) {
        return new Response(fixture, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }
      if (path.endsWith("/archive.json")) {
        return new Response("[]", {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      }
      return nativeFetch(input, init);
    };
  }, fixtureBody);
}

async function waitForVeraPool(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                __vera?: { pool: () => Array<unknown> };
              }
            ).__vera?.pool().length ?? 0,
        ),
      { timeout: 15_000, message: "VERA did not adopt the mocked public feed" },
    )
    .toBeGreaterThan(0);
  await expect(page.locator("[data-snapshot-line]")).not.toHaveText("Sweeping…");
}

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
  | "@all-projects"
  | "@pool-room-all"
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
    h1: /Shops like yours,\s*already working\./i,
    // Every viewport carries the same direct decision: start the full Website
    // Check or call for the thing that is already broken.
    criticalLink: 'form[action="/examples/audit/"], a[href="/website-check/"]',
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
    h1: /One inbox for support, projects, and billing\./i,
    criticalLink: 'a[href^="mailto:hello@littlefightnyc.com"]',
    tags: ["@chromium-desktop", "@chromium-mobile"],
  },
  {
    key: "services",
    label: "Services",
    path: "/services/",
    title: "NYC Websites, IT Support & Custom Software | Little Fight NYC",
    h1: /Websites, fixes,\s*and software you own\./i,
    criticalLink: 'a[href="/services/custom-local-websites/"]',
    tags: ["@chromium-desktop", "@firefox-desktop"],
  },
  {
    key: "examples",
    label: "Examples",
    path: "/examples/",
    title: "Work Examples & Owner Answers | Little Fight NYC",
    h1: /See what works\.\s*Try what is next\./i,
    criticalLink: 'a[href="/case-studies/hair-by-rachel-charles/"]',
    tags: ["@chromium-desktop", "@firefox-desktop"],
  },
  {
    key: "pool-room",
    label: "Pool Room Lab film",
    path: "/examples/lab/concepts/pool-room/",
    title: "The Pool Room | The Lab · Little Fight NYC",
    h1: /We built a bar\s*that doesn’t exist\.\s*Then broke a rack in it\./i,
    criticalLink: 'a[href^="/tech-audit/"]',
    tags: ["@pool-room-all"],
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
    title: "About Little Fight NYC | Help for Small Businesses",
    h1: /One studio\s*for all of it\./i,
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
    title: "Páginas web y ayuda diaria en español | Little Fight NYC",
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

function isWebKitMediaControlNoise(message: ConsoleMessage): boolean {
  return (
    !message.location().url &&
    /^Button failed to load, iconName = (?:invalid-placard|pip-placard|airplay-placard), layoutTraits = \[MacOSLayoutTraits Inline\], src = blob:/.test(
      message.text(),
    )
  );
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
    if (
      message.type() !== "error" ||
      isWebKitMediaControlNoise(message) ||
      !isFirstPartyConsoleMessage(message)
    ) {
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

async function expectNoHorizontalOverflow(page: Page, label = ""): Promise<void> {
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
    `${label ? `${label}: ` : ""}Horizontal overflow: ${report.scrollWidth}px document in ${report.viewportWidth}px viewport. Possible offenders: ${report.offenders.join(", ") || "none identified"}`,
  ).toBeLessThanOrEqual(report.viewportWidth + 1);
}

async function expectAxeClean(
  page: Page,
  route: Pick<RouteContract, "key" | "path">,
  testInfo: TestInfo,
  scope?: string,
): Promise<void> {
  const tags = route.key === "pool-room" || route.key.startsWith("lab-")
    ? [...WCAG_TAGS, WCAG_22_AA_TAG]
    : [...WCAG_TAGS];
  let builder = new AxeBuilder({ page }).withTags(tags);
  if (scope) builder = builder.include(scope);
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

  const summary = results.violations.map((violation) => {
    const nodes = violation.nodes.map((node) => {
      const target = node.target.map(String).join(" ");
      return `${target}: ${node.failureSummary ?? node.html}`;
    }).join(" | ");
    return `${violation.id} [${violation.impact ?? "impact unknown"}] ${violation.nodes.length} node(s): ${violation.help}. ${nodes}`;
  });
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

      await expectNoHorizontalOverflow(page, route.path);
      await expectAxeClean(page, route, testInfo);
      if (route.key === "pool-room") {
        await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.locator("body > .lab-concept-shell")).toHaveCount(1);
        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = "auto";
          window.scrollTo(0, document.documentElement.scrollHeight);
        });
        await page.waitForFunction(
          () => Math.abs(window.scrollY + window.innerHeight - document.documentElement.scrollHeight) < 3,
        );
        const spacing = await page.evaluate(() => {
          const shell = document.querySelector<HTMLElement>(".lab-concept-shell");
          const footerLinks = Array.from(document.querySelectorAll<HTMLElement>("footer a"));
          const lastLink = footerLinks.at(-1);
          const controls = Array.from(
            document.querySelectorAll<HTMLElement>(".lab-concept-shell a, .lab-concept-shell button"),
          ).filter((control) => control.getClientRects().length > 0);
          return {
            controls: controls.map((control) => {
              const rect = control.getBoundingClientRect();
              return { height: rect.height, width: rect.width };
            }),
            lastLinkBottom: lastLink?.getBoundingClientRect().bottom ?? 0,
            shellTop: shell?.getBoundingClientRect().top ?? 0,
          };
        });
        expect(spacing.lastLinkBottom).toBeLessThanOrEqual(spacing.shellTop - 8);
        for (const control of spacing.controls) {
          expect(control.height).toBeGreaterThanOrEqual(44);
          expect(control.width).toBeGreaterThanOrEqual(44);
        }
      }
      expectRuntimeClean(runtime);
    },
  );
}

test(
  "Lab concept shell stays usable across every build @chromium-desktop @chromium-mobile",
  async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    for (const slug of LAB_CONCEPT_SLUGS) {
      const path = `/examples/lab/concepts/${slug}/`;
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.ok(), `${path} did not load`).toBe(true);

      const shell = page.locator("body > .lab-concept-shell");
      await expect(shell, `${path} did not receive the shared Lab shell`).toBeVisible();
      await expect(page.locator("html.lab-concept-page")).toHaveCount(1);
      await expectNoHorizontalOverflow(page, path);
      await expectAxeClean(
        page,
        { key: `lab-${slug}`, path },
        testInfo,
        ".lab-concept-shell",
      );

      const metrics = await page.evaluate(() => {
        const shellElement = document.querySelector<HTMLElement>(".lab-concept-shell");
        const shellRect = shellElement?.getBoundingClientRect();
        const controls = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".lab-concept-shell a, .lab-concept-shell button",
          ),
        ).filter((control) => control.getClientRects().length > 0);
        return {
          bottomPadding: Number.parseFloat(getComputedStyle(document.body).paddingBottom) || 0,
          shellBottomGap: shellRect ? window.innerHeight - shellRect.bottom : 0,
          shellHeight: shellRect?.height ?? 0,
          controls: controls.map((control) => {
            const rect = control.getBoundingClientRect();
            return { height: rect.height, width: rect.width };
          }),
        };
      });
      expect(metrics.bottomPadding).toBeGreaterThanOrEqual(
        metrics.shellHeight + metrics.shellBottomGap + 8,
      );
      for (const control of metrics.controls) {
        expect(control.height).toBeGreaterThanOrEqual(44);
        expect(control.width).toBeGreaterThanOrEqual(44);
      }
    }
  },
);

test(
  "Pool Room discovery, captions, replay, and share fallback work @chromium-desktop",
  async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: undefined,
      });
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            (window as unknown as { __poolRoomCopied?: string }).__poolRoomCopied = value;
          },
        },
      });
    });

    const runtime = watchRuntime(page);
    const response = await page.goto("/examples/lab/concepts/pool-room/", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.ok(), "The Pool Room page did not load").toBe(true);
    await waitForStableDocument(page);

    const discovery = await page.evaluate(() => {
      const content = (selector: string, attribute = "content") =>
        document.querySelector(selector)?.getAttribute(attribute) ?? "";
      const structured = JSON.parse(
        document.querySelector('script[type="application/ld+json"]')?.textContent ?? "{}",
      ) as Record<string, unknown>;
      return {
        canonical: content('link[rel="canonical"]', "href"),
        ogImage: content('meta[property="og:image"]'),
        ogImageAlt: content('meta[property="og:image:alt"]'),
        ogUrl: content('meta[property="og:url"]'),
        robots: content('meta[name="robots"]'),
        twitterCard: content('meta[name="twitter:card"]'),
        structured,
      };
    });
    expect(discovery).toMatchObject({
      canonical: "https://littlefightnyc.com/examples/lab/concepts/pool-room/",
      ogImage: "https://littlefightnyc.com/examples/lab/concepts/pool-room/img/opening/12-room-hero.webp",
      ogUrl: "https://littlefightnyc.com/examples/lab/concepts/pool-room/",
      robots: "index,follow,max-image-preview:large,max-video-preview:-1",
      twitterCard: "summary_large_image",
      structured: {
        "@type": "VideoObject",
        duration: "PT30S",
      },
    });
    expect(discovery.ogImageAlt.length).toBeGreaterThan(20);

    for (const heading of [
      "It had to look like somebody drinks here.",
      "Not animated. Solved.",
      "Every sound sits on a real hit.",
      "If it doesn’t exist yet, we can still show it.",
    ]) {
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }

    const film = page.locator("[data-pool-room-film]");
    await expect(film.locator('track[kind="captions"]')).toHaveAttribute(
      "src",
      "break-film-captions.vtt",
    );
    await expect(film.locator('track[kind="descriptions"]')).toHaveAttribute(
      "src",
      "break-film-descriptions.vtt",
    );
    const captionResponse = await page.request.get(
      "/examples/lab/concepts/pool-room/break-film-captions.vtt",
    );
    expect(captionResponse.ok(), "The sound-caption track is unavailable").toBe(true);
    expect(await captionResponse.text()).toContain("Pool cue strikes");
    const descriptionResponse = await page.request.get(
      "/examples/lab/concepts/pool-room/break-film-descriptions.vtt",
    );
    expect(descriptionResponse.ok(), "The visual-description track is unavailable").toBe(true);
    expect(await descriptionResponse.text()).toContain("The cue strikes");
    await page.getByText("Audio description and film transcript", { exact: true }).click();
    const describedFilm = page.getByRole("link", { name: "Open the audio-described film" });
    await expect(describedFilm).toHaveAttribute("href", "break-film-audio-described.mp4");
    const describedResponse = await page.request.head(
      "/examples/lab/concepts/pool-room/break-film-audio-described.mp4",
    );
    expect(describedResponse.ok(), "The audio-described film is unavailable").toBe(true);
    expect(describedResponse.headers()["content-type"]).toContain("video/mp4");

    await film.evaluate(async (element) => {
      const media = element as HTMLVideoElement;
      if (media.readyState === HTMLMediaElement.HAVE_NOTHING) {
        await new Promise<void>((resolve) => {
          media.addEventListener("loadedmetadata", () => resolve(), { once: true });
          media.load();
        });
      }
      media.pause();
      await new Promise<void>((resolve) => {
        media.addEventListener("seeked", () => resolve(), { once: true });
        media.currentTime = 5;
      });
    });
    await page.getByRole("button", { name: "Replay" }).click();
    await expect.poll(() => film.evaluate((element) => (element as HTMLVideoElement).currentTime))
      .toBeLessThan(1);

    await film.evaluate((element) => {
      const media = element as HTMLVideoElement;
      media.pause();
      media.currentTime = 5;
    });
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press("r");
    await page.waitForTimeout(80);
    expect(await film.evaluate((element) => (element as HTMLVideoElement).currentTime))
      .toBeGreaterThan(4.5);
    const poolRoomUrl = page.url();
    await page.keyboard.press("]");
    await page.waitForTimeout(80);
    expect(page.url()).toBe(poolRoomUrl);

    const share = page.getByRole("button", { name: "Share this build" });
    await expect(share).toBeVisible();
    await share.click();
    await expect(page.getByRole("status").filter({ hasText: "Link copied." })).toBeVisible();
    expect(
      await page.evaluate(
        () => (window as unknown as { __poolRoomCopied?: string }).__poolRoomCopied,
      ),
    ).toBe("https://littlefightnyc.com/examples/lab/concepts/pool-room/");

    const sitemap = await page.request.get("/sitemap.xml");
    expect(sitemap.ok(), "The generated sitemap is unavailable").toBe(true);
    expect(await sitemap.text()).toContain(
      "https://littlefightnyc.com/examples/lab/concepts/pool-room/",
    );
    expectRuntimeClean(runtime);
  },
);

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
  "every remaining PHC work surface renders the film and no legacy logo @chromium-desktop",
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

    expect(PHC_FILM_ROUTES).toHaveLength(21);
    expect(placementCount).toBe(22);
    expectRuntimeClean(runtime);
  },
);

test(
  "owner-first first views do not eagerly mount the protected PHC film @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);

    for (const path of PHC_FILM_NOT_EAGER_ROUTES) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect.soft(response?.ok(), `${path} did not load`).toBe(true);
      await waitForStableDocument(page);
      await expect(
        page.locator('source[data-src^="/media/cabinetry-process-film-"]'),
        `${path} eagerly embeds the protected PHC process film`,
      ).toHaveCount(0);
      await expect(
        page.locator('img[src="/media/cabinetry-process-poster-c6d59dbc.webp"]'),
        `${path} eagerly renders the protected PHC process poster`,
      ).toHaveCount(0);
    }

    expect(PHC_FILM_NOT_EAGER_ROUTES).toHaveLength(5);
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
        name: /Shops like yours,\s*already working\./i,
      }),
    ).toBeVisible();
    await expect(
      page
        .locator(".lf-wall")
        .locator('a:has-text("Check my website"), a[href^="tel:"]')
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    // The first screen is six live client sites, which is content rather than
    // motion — reduced motion takes nothing away from it. Each of the four
    // service drawings paints one settled frame and starts no rAF loop, so the
    // whole argument is still readable with every animation switched off.
    const wall = page.locator(".lf-wall__tile");
    await expect(wall).toHaveCount(6);
    await expect(wall.first().locator("img")).toBeVisible();

    const services = page.locator(".lf-svc");
    await expect(services).toHaveCount(4);
    for (const key of ["websites", "support", "software", "consult"]) {
      const section = page.locator(`.lf-svc[data-lf-service="${key}"]`);
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator("canvas")).toBeVisible();
      await expect(section.locator(".lf-svc__headline")).toBeVisible();
    }
    await page.locator(".lf-wall").scrollIntoViewIfNeeded();

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

    // The homepage now uses a real business scene. Exercise the protected
    // PHC film on its own retained case-study surface, under the same motion
    // preference, so the poster/no-download contract stays independently real.
    await openRoute(page, {
      key: "public-house-creative",
      label: "Public House Creative case study",
      path: PHC_CASE_PATH,
      title: "Private Estimating Software Case Study | Little Fight NYC",
      h1: /Private estimating software/i,
      criticalLink: "/contact/",
      tags: ["@all-projects"],
    });

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
  "desktop homepage leads with six trades and the phone above the fold @chromium-desktop",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES[0]);

    // The old hero was a promise, a phone playing a four-beat path, and the
    // beat list — three columns built around one salon, which on a desktop
    // read as a control panel and told a painting contractor this was not for
    // them. The first screen is now the argument itself: six live client sites
    // across six visibly different trades.
    const wall = page.locator(".lf-wall");
    const tiles = wall.locator(".lf-wall__tile");
    const lead = tiles.first().locator("img");

    await expect(wall).toBeVisible();
    await expect(tiles).toHaveCount(6);
    await expect(lead).toHaveAttribute("fetchpriority", "high");
    await expect
      .poll(() => lead.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);

    // Six DIFFERENT trades is the whole point — a repeated label would mean
    // the page is arguing by volume instead of by range.
    const trades = await wall.locator(".lf-wall__trade").allInnerTexts();
    expect(trades).toHaveLength(6);
    expect(new Set(trades.map((trade) => trade.trim().toLowerCase())).size).toBe(6);

    // No single client may own the first screen.
    const clients = await wall.locator(".lf-wall__client").allInnerTexts();
    expect(new Set(clients.map((client) => client.trim())).size).toBe(6);

    const call = wall.locator('a[href^="tel:"]');
    const websiteCheck = wall.locator('a[href="/website-check/"]');
    await expect(call).toBeVisible();
    await expect(websiteCheck).toBeVisible();

    const geometry = await page.evaluate(() => {
      const phone = document.querySelector<HTMLElement>(".lf-wall__call");
      const check = document.querySelector<HTMLElement>(".lf-wall__check");
      const firstTile = document.querySelector<HTMLElement>(".lf-wall__tile");
      if (!phone || !check || !firstTile) throw new Error("desktop wall fixture is incomplete");
      return {
        viewportHeight: window.innerHeight,
        phoneBottom: phone.getBoundingClientRect().bottom,
        checkBottom: check.getBoundingClientRect().bottom,
        tileTop: firstTile.getBoundingClientRect().top,
      };
    });

    // The number and the low-commitment alternative both land in the first
    // screen, and the wall has started before the fold so it is discoverable.
    expect(geometry.phoneBottom).toBeLessThanOrEqual(geometry.viewportHeight);
    expect(geometry.checkBottom).toBeLessThanOrEqual(geometry.viewportHeight);
    expect(geometry.tileTop).toBeLessThanOrEqual(geometry.viewportHeight);

    await expectNoHorizontalOverflow(page, "desktop wall hero");
    expectRuntimeClean(runtime);
  },
);

test(
  "mobile homepage puts a real decision and direct help in the first screen @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await openRoute(page, ROUTES[0]);

    const directCall = page.locator('.lf-nav__phone--direct[href^="tel:"]');
    const wall = page.locator(".lf-wall");
    const heroCall = wall.locator(".lf-wall__call");
    const websiteCheck = wall.locator('a[href="/website-check/"]');
    const heroChannels = page.locator(".lf-wall__channels a");

    await expect(directCall).toBeVisible();
    await expect(directCall).toHaveAttribute("href", PHONE_HREF);
    await expect(wall).toBeVisible();
    await expect(heroCall).toBeVisible();
    await expect(heroCall).toHaveAttribute("href", PHONE_HREF);
    await expect(websiteCheck).toBeVisible();

    // All four reach channels stay in the hero: call, text, email, form.
    await expect(heroChannels).toHaveCount(3);
    await expect(page.locator('.lf-wall__channels a[href^="sms:"]')).toBeVisible();
    await expect(page.locator('.lf-wall__channels a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator('.lf-wall__channels a[href="/tech-audit/"]')).toBeVisible();
    await expect(page.getByText(/9am–9pm Eastern: a human answers/i)).toBeVisible();

    const initialGeometry = await page.evaluate(() => {
      const call = document.querySelector<HTMLElement>(".lf-wall__call");
      const check = document.querySelector<HTMLElement>(".lf-wall__check");
      const consent = document.querySelector<HTMLElement>(".lf-consent");
      if (!call || !check) throw new Error("mobile hero fixture is incomplete");
      const consentRect = consent?.getBoundingClientRect();
      const channels = Array.from(document.querySelectorAll<HTMLElement>(".lf-wall__channels a"));
      return {
        viewportHeight: window.innerHeight,
        callBottom: call.getBoundingClientRect().bottom,
        checkBottom: check.getBoundingClientRect().bottom,
        consentTop: consentRect?.top ?? window.innerHeight,
        channelHeights: channels.map((channel) => channel.getBoundingClientRect().height),
      };
    });

    expect(initialGeometry.callBottom).toBeLessThanOrEqual(initialGeometry.viewportHeight);
    expect(initialGeometry.checkBottom).toBeLessThanOrEqual(initialGeometry.viewportHeight);
    expect(initialGeometry.callBottom).toBeLessThanOrEqual(initialGeometry.consentTop);
    expect(initialGeometry.channelHeights.every((height) => height >= 44)).toBe(true);

    await expect(page.locator(".lf-owner-path")).toBeHidden();
    await expect(page.locator(".lf-night-shift")).toBeHidden();
    await expect(page.locator(".lf-money-meter")).toBeHidden();
    await expect(page.locator(".lf-contact-block")).toBeVisible();

    // Six trades, six different clients — the range IS the argument, so a
    // duplicate label would mean the page is arguing by volume instead.
    const tiles = wall.locator(".lf-wall__tile");
    await expect(tiles).toHaveCount(6);
    const trades = await wall.locator(".lf-wall__trade").allInnerTexts();
    expect(new Set(trades.map((trade) => trade.trim().toLowerCase())).size).toBe(6);

    // Each tile is a real tap target that leads to that client's case.
    const tileTargets = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".lf-wall__tile a")).map((link) => ({
        height: link.getBoundingClientRect().height,
        href: link.getAttribute("href") ?? "",
      })),
    );
    expect(tileTargets).toHaveLength(6);
    expect(tileTargets.every((tile) => tile.height >= 44)).toBe(true);
    expect(tileTargets.every((tile) => /^\/case-studies\/[a-z0-9-]+\/$/.test(tile.href))).toBe(true);

    // The four services are sections now, not tabs — all four are reachable
    // by scrolling, and each one draws something.
    const services = page.locator(".lf-svc");
    await expect(services).toHaveCount(4);
    for (const key of ["websites", "support", "software", "consult"]) {
      const section = page.locator(`.lf-svc[data-lf-service="${key}"]`);
      await section.scrollIntoViewIfNeeded();
      await expect(section.locator("canvas")).toBeVisible();
    }

    const mobilePath = await page.evaluate(() => {
      const contact = document.querySelector<HTMLElement>(".lf-contact-block");
      const services = document.querySelector<HTMLElement>(".lf-svcs");
      if (!contact || !services) throw new Error("mobile path fixture is incomplete");
      const fullHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      return {
        servicesBeforeContact: Boolean(
          services.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
        contactTopInScreens: contact.getBoundingClientRect().top / window.innerHeight,
        pageScreens: fullHeight / window.innerHeight,
      };
    });

    expect(mobilePath.servicesBeforeContact).toBe(true);
    expect(mobilePath.pageScreens).toBeLessThanOrEqual(14);
    await expectNoHorizontalOverflow(page, "compact mobile home");
    expectRuntimeClean(runtime);
  },
);

test(
  "narrow mobile keeps every help path reachable without a desktop payload @chromium-mobile @webkit-mobile",
  async ({ page }) => {
    const runtime = watchRuntime(page);
    await page.setViewportSize({ width: 320, height: 568 });
    await openRoute(page, ROUTES[0]);

    const essentialOnly = page.getByRole("button", { name: "Essential only" });
    if (await essentialOnly.isVisible()) await essentialOnly.click();

    const firstScreen = await page.evaluate(() => {
      const website = document.querySelector<HTMLElement>(".lf-wall__check");
      const urgent = document.querySelector<HTMLElement>(".lf-wall__call");
      const channels = document.querySelector<HTMLElement>(".lf-wall__channels");
      const hours = document.querySelector<HTMLElement>(".lf-wall__hours");
      if (!website || !urgent || !channels || !hours) {
        throw new Error("narrow mobile decision fixture is incomplete");
      }
      return {
        viewportHeight: window.innerHeight,
        websiteBottom: website.getBoundingClientRect().bottom,
        urgentBottom: urgent.getBoundingClientRect().bottom,
        channelsBottom: channels.getBoundingClientRect().bottom,
        hoursBottom: hours.getBoundingClientRect().bottom,
        pageScreens: document.documentElement.scrollHeight / window.innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        desktopProofCount: document.querySelectorAll(".lf-owner-path,.lf-money-meter").length,
      };
    });

    expect(firstScreen.websiteBottom).toBeLessThanOrEqual(firstScreen.viewportHeight);
    expect(firstScreen.urgentBottom).toBeLessThanOrEqual(firstScreen.viewportHeight);
    expect(firstScreen.channelsBottom).toBeLessThanOrEqual(firstScreen.viewportHeight);
    expect(firstScreen.hoursBottom).toBeLessThanOrEqual(firstScreen.viewportHeight);
    // The homepage is three moves now — the wall, the four services, the close
    // — plus the footer, which carries all four contact channels at 44px touch
    // targets. The separate proof chapter is gone, because the wall IS the
    // proof and each service section names its own client; it was saying a
    // third time what the reader had been told twice. The four drawings are
    // sections rather than tabs, so all four are on the page at once. The cap
    // keeps its original job of catching a chapter that quietly pads itself.
    expect(firstScreen.pageScreens).toBeLessThanOrEqual(15);
    expect(firstScreen.horizontalOverflow).toBeLessThanOrEqual(0);
    expect(firstScreen.desktopProofCount).toBe(0);

    // The four services are four sections, not a tab strip. All four are on
    // the page at once, each draws on a canvas rather than shipping imagery,
    // and the urgent one still offers the phone directly.
    const svcs = page.locator(".lf-svcs");
    await svcs.scrollIntoViewIfNeeded();
    await expect(page.locator(".lf-svc")).toHaveCount(4);
    await expect(svcs.locator("img")).toHaveCount(0);
    // A missing instrument is invisible in a screenshot — the canvas element is
    // simply absent — so assert one per section directly.
    await expect(svcs.locator("canvas")).toHaveCount(4);
    await expect(
      page.locator('.lf-svc[data-lf-service="support"] a[href^="tel:"]'),
    ).toBeVisible();
    await expect(
      page.locator('.lf-svc[data-lf-service="software"] a[href="/services/business-systems/"]'),
    ).toBeVisible();
    await expect(page.locator(".lf-sticky-help")).toBeVisible();
    const stickyHeight = await page.locator(".lf-sticky-help").evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    expect(stickyHeight).toBeLessThanOrEqual(81);

    await page.getByRole("button", { name: "Open menu" }).click();
    const panel = page.getByRole("dialog", { name: "Menu" });
    await expect(panel).toBeVisible();
    const panelGeometry = await panel.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        overflowY: getComputedStyle(element).overflowY,
      };
    });
    expect(panelGeometry.bottom).toBeLessThanOrEqual(568);
    expect(panelGeometry.clientHeight).toBeLessThan(panelGeometry.scrollHeight);
    expect(panelGeometry.overflowY).toBe("auto");

    const panelCall = panel.getByRole("link", { name: "Call", exact: true });
    await panelCall.scrollIntoViewIfNeeded();
    await expect(panelCall).toBeVisible();
    const callBox = await panelCall.boundingBox();
    expect(callBox).not.toBeNull();
    expect((callBox?.y ?? 568) + (callBox?.height ?? 0)).toBeLessThanOrEqual(568);
    await page.getByRole("button", { name: "Close navigation panel" }).click();
    await expect(panel).toBeHidden();

    await expectNoHorizontalOverflow(page, "320px mobile home");
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
  "Website Check keeps the scan primary and offers a safe optional booking link @chromium-desktop @chromium-mobile",
  async ({ page }) => {
    const runtime = watchRuntime(page);

    await openRoute(page, ROUTES.find((route) => route.key === "website-check")!);
    // The plain-language submit is the primary control now; the removed
    // "Open" label exposed the same scan without telling an owner what it did.
    await expect(page.getByRole("button", { name: "Check my website" })).toBeVisible();

    const booking = page.locator(".lf-website-check__booking").getByRole("link", {
      name: "Pick a time",
    });
    await expect(booking).toHaveAttribute("href", BOOKING_HREF);
    await expect(booking).toHaveAttribute("target", "_blank");
    await expect(booking).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator(`a[href="${BOOKING_HREF}"]`)).toHaveCount(1);
    await expect(page.getByText("No login, prep, or commitment.")).toBeVisible();

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
    await expect(page.getByText("Your message and website report are ready for us to read.")).toBeVisible();
    const booking = page.locator(".lf-thanks__booking").getByRole("link", {
      name: "Choose a time",
    });
    await expect(booking).toHaveAttribute("href", BOOKING_HREF);
    await expect(booking).toHaveAttribute("target", "_blank");
    await expect(booking).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator(`a[href="${BOOKING_HREF}"]`)).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => (
      window.sessionStorage.getItem("lf_tech_audit_report_id")
    ))).toBeNull();
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator(".lf-thanks__booking")).toHaveCount(0);

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
    expect(confirmationUrl.searchParams.get("submitted")).toBe("tech-audit");
    expect(confirmationUrl.searchParams.get("intent")).toBe("website");
    expect(confirmationUrl.searchParams.get("report")).toBeNull();
    expect(confirmationUrl.search).not.toContain("private");
    expect(confirmationUrl.search).not.toContain("script");

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
    // The table row remains structural. One native button in its Listing cell
    // owns the action, keyboard behavior, focus ring, and accessible name.
    await mockVeraData(page);

    await page.goto(`${baseURL}/vera/#/browse`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);
    expect(
      await page.evaluate(
        () =>
          (
            window as unknown as {
              __VERA_APP: { FEEDS: Array<{ url: string; label: string }> };
            }
          ).__VERA_APP.FEEDS,
      ),
      "the public demo must expose one first-party Little Fight feed contract",
    ).toEqual([{ url: "./data/public.json", label: "site" }]);
    const rows = page.locator("tr[data-listing-row]");
    const openButtons = rows.locator(".t-title[data-open]");
    await openButtons.first().waitFor();

    const total = await rows.count();
    expect(total, "no listing rows rendered — the fixture may have gone stale").toBeGreaterThan(0);
    await expect(openButtons).toHaveCount(total);
    expect(await page.locator("tr[data-listing-row][tabindex]").count()).toBe(0);
    expect(await page.locator("tr[data-listing-row][data-open]").count()).toBe(0);
    await expect(openButtons.first()).toHaveAccessibleName(/open ledger for/i);

    // A sortable column is a real button now, not a click handler on a <th>.
    // Enter must sort and expose that direction through the table semantics.
    const rentSort = page.locator('thead button[data-sort="rent"]');
    await rentSort.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('th:has(button[data-sort="rent"])')).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(
      await page.evaluate(
        () =>
          (
            window as unknown as {
              __vera: { state: { sort: { key: string; dir: number } } };
            }
          ).__vera.state.sort,
      ),
    ).toEqual({ key: "rent", dir: -1 });

    // Enter opens the inspector from the native Listing-cell button. The row's
    // visual selection is a class, not an invalid disclosure state.
    await openButtons.first().focus();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("BUTTON");
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    expect(await page.locator("tr[data-listing-row].is-open").count()).toBe(1);
    expect(await page.locator("tr[data-listing-row][aria-expanded]").count()).toBe(0);

    // Escape closes it and the visual selection is withdrawn.
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-inspector]")).not.toHaveClass(/is-open/);
    expect(await page.locator("tr[data-listing-row].is-open").count()).toBe(0);
    /* Closing an in-app ledger consumes the history entry it created. Wait
       for that navigation to settle before starting a second interaction;
       otherwise its pending hashchange can correctly close the new ledger. */
    await expect(page).toHaveURL(/\/vera\/#\/browse$/);
    await expect(openButtons.first()).toBeFocused();

    // Space activates too, and must not scroll the page instead.
    await page.evaluate(() => window.scrollTo(0, 0));
    await openButtons.nth(1).focus();
    await page.keyboard.press(" ");
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    expect(await page.evaluate(() => window.scrollY), "Space must not scroll").toBe(0);

    // Close the modal before moving focus back into its inert background.
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-inspector]")).not.toHaveClass(/is-open/);
    const outline = await openButtons.nth(2).evaluate((el) => {
      el.focus();
      return getComputedStyle(el).outlineStyle;
    });
    expect(outline, "focused ledger buttons need a visible ring").not.toBe("none");
  },
);

test(
  "VERA renders only the view you are looking at @chromium-desktop",
  async ({ page, baseURL }) => {
    // The current router replaces one dynamic page instead of retaining a
    // stack of hidden panes. Browse must disappear completely after a route
    // change, including its table text and accessibility tree.
    await mockVeraData(page);

    await page.goto(`${baseURL}/vera/#/browse`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);
    await page.locator(".t-title[data-open]").first().waitFor();
    await page.evaluate(() => {
      window.location.hash = "#/market";
    });
    await expect(page.locator('.page[data-page="market"]')).toBeVisible();
    await expect(page.locator("#main .page")).toHaveCount(1);
    await expect(page.locator("#main .dt")).toHaveCount(0);

    expect(
      await page.evaluate(
        () => document.querySelector("#main")?.innerText.includes("Score") ?? false,
      ),
      "Browse's table is still in the visible text of Market",
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
    // The Listing cell's native button is the stable keyboard origin.
    await mockVeraData(page);
    await page.goto(`${baseURL}/vera/#/browse`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);
    const openButtons = page.locator("tr[data-listing-row] .t-title[data-open]");
    await openButtons.first().waitFor();

    const inspector = page.locator("[data-inspector]");
    await expect(inspector).toHaveAttribute("role", "dialog");
    await expect(inspector).toHaveAttribute("aria-modal", "true");

    await openButtons.nth(2).focus();
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

    // Escape closes and hands focus back to the button that opened it.
    await page.keyboard.press("Escape");
    await expect(inspector).not.toHaveClass(/is-open/);
    // The restore is deferred a tick so it lands after the panel finishes
    // closing, so poll rather than reading activeElement immediately.
    await expect
      .poll(
        () => page.evaluate(() => document.activeElement?.tagName),
        { message: "closing must return focus to the ledger button, not the top of the document" },
      )
      .toBe("BUTTON");
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
    expect(
      await page.evaluate(() =>
        Boolean(
          (window as unknown as Record<string, unknown>)[
            "ga-disable-G-0Q1TGWH0HL"
          ],
        ),
      ),
    ).toBe(true);

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

    const approvedCampaign =
      "utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=booking";
    await page.goto(
      `${baseURL}/?${approvedCampaign}&email=private-fixture%40example.com`,
      { waitUntil: "networkidle" },
    );
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
    await page.getByRole("button", { name: "Allow visit counting", exact: true }).click();

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
        gaDisabled: Boolean(
          (window as unknown as Record<string, unknown>)[
            "ga-disable-G-0Q1TGWH0HL"
          ],
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
    expect(measurementOnly.gaDisabled).toBe(false);

    const pageViewEvent = await page.evaluate(() =>
      (window.dataLayer ?? []).findLast(
        (entry) =>
          typeof entry === "object" &&
          entry !== null &&
          (entry as { event?: string }).event === "page_view",
      ) as Record<string, unknown> | undefined,
    );
    expect(pageViewEvent).toMatchObject({
      event: "page_view",
      funnel_stage: "awareness",
      page_location: `${baseURL}/?${approvedCampaign}`,
      page_path: "/",
    });
    expect(JSON.stringify(pageViewEvent)).not.toContain("private-fixture");
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent("lf:analytics-consent", { detail: "granted" }),
      );
    });
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window.dataLayer ?? []).filter(
            (entry) =>
              typeof entry === "object" &&
              entry !== null &&
              (entry as { event?: string }).event === "page_view",
          ).length,
        ),
      )
      .toBe(1);

    const websiteCheck = page.locator('.lf-wall a[href="/website-check/"]');
    await websiteCheck.evaluate((link) => {
      link.addEventListener("click", (event) => event.preventDefault(), { once: true });
    });
    await websiteCheck.click();

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
      entry_source: "home",
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
      const link = document.querySelector<HTMLAnchorElement>(
        'a[data-lf-label="about_founder_phone"][href^="tel:"]',
      );
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
        entry_source: "audit_lab",
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
    test.slow();
    await page.addInitScript(() => {
      localStorage.removeItem("vera-cases");
      localStorage.removeItem("vera-workspace");
    });
    await mockVeraData(page);
    await page.goto(`${baseURL}/vera/#/browse`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);
    await page.locator(".t-title[data-open]").first().waitFor();

    const TOGGLES =
      "[data-bracket],[data-unit],[data-transit],[data-lens],[data-view]," +
      "[data-area],[data-brtile],[data-hoodbar],[data-density]";

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

    // State must move with the actual button, and the Needs verification lens
    // must not pull matched_public_records back into the review queue.
    await page.locator('button[data-view="verify"]').click();
    await expect(page.locator('button[data-view="verify"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator('button[data-view="all"]')).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    const verificationStatuses = await page.evaluate(
      () =>
        (
          window as unknown as {
            __vera: { filtered: () => Array<{ verification_status?: string }> };
          }
        ).__vera
          .filtered()
          .map((listing) => listing.verification_status ?? ""),
    );
    expect(verificationStatuses.length, "fixture has no unresolved listings").toBeGreaterThan(0);
    expect(
      verificationStatuses.every((status) => !/^(matched|verified)/i.test(status)),
      "a matched record leaked into Needs verification",
    ).toBe(true);

    // Every current route owns one dynamic page and exactly one h1. Clearing
    // cases above makes this exercise Hunt's honest empty state too.
    for (const view of [
      "today",
      "market",
      "browse",
      "atlas",
      "hunt",
      "manual",
      "archive",
      "system",
    ]) {
      await page.evaluate((route) => {
        window.location.hash = `#/${route}`;
      }, view);
      await expect(page.locator(`.page[data-page="${view}"]`)).toBeVisible();
      await expect(page.locator("#main .page")).toHaveCount(1);
      expect(
        await page.locator("#main .page h1").count(),
        `${view} must have exactly one h1`,
      ).toBe(1);
    }

    // aria-selected must follow the open tab, not freeze on the first one.
    await page.evaluate(() => {
      window.location.hash = "#/browse";
    });
    await page.locator('button[data-view="all"]').click();
    await page.locator(".t-title[data-open]").first().waitFor();
    await page.locator(".t-title[data-open]").first().click();
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
  "VERA manual sliders keep focus across repeated arrow keys @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    await mockVeraData(page);
    await page.goto(`${baseURL}/vera/#/manual`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);

    for (const selector of ["[data-tool-rent]", "[data-tool-income]"]) {
      const slider = page.locator(selector);
      await expect(slider).toBeVisible();
      await slider.focus();

      // Rebuilding Manual during `input` replaces the range under the user's
      // finger or keyboard. Four presses must stay on the same live control and
      // produce four increasing values, not one step followed by silence.
      const values: string[] = [];
      for (let i = 0; i < 4; i += 1) {
        await page.keyboard.press("ArrowRight");
        values.push(
          await page.evaluate((attribute) => {
            const el = document.activeElement as HTMLInputElement | null;
            return el?.matches(attribute) ? el.value : "LOST FOCUS";
          }, selector),
        );
      }

      expect(values).not.toContain("LOST FOCUS");
      expect(new Set(values).size).toBe(4);
      expect(Number(values[3])).toBeGreaterThan(Number(values[0]));
    }

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "VERA confirms a user-supplied address locally without changing its score @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    const outboundWrites: string[] = [];
    let geoSearchUrl = "";
    let geoSearchCalls = 0;
    const addressFixture = JSON.parse(VERA_FEED_FIXTURE) as {
      pool: Array<Record<string, unknown>>;
    };
    const numericListing = addressFixture.pool.find(
      (listing) =>
        !/^(matched|verified)/i.test(String(listing.verification_status ?? "")),
    );
    if (!numericListing) throw new Error("VERA fixture has no unresolved listing");
    numericListing.address_raw = "2461";
    numericListing.address_normalized = "2461";
    numericListing.verification_status = "partial_address_only";
    numericListing.listing_confidence_score = 66;
    numericListing.listing_confidence_band = "medium";
    const addressListingUid = String(numericListing.listing_uid);

    await page.addInitScript(() => {
      localStorage.removeItem("vera-address-resolutions-v1");
      localStorage.removeItem("vera-workspace");
    });
    await mockVeraData(page, JSON.stringify(addressFixture));
    await page.route("**/v2/search**", (route) => {
      geoSearchCalls += 1;
      geoSearchUrl = route.request().url();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          features: [
            {
              properties: {
                label: "120 Broadway, Manhattan, NY",
                confidence: 0.97,
                match_type: "exact",
                addendum: {
                  pad: { bbl: "1000477501", bin: "1001026" },
                },
              },
            },
            {
              properties: {
                label: "120 Broadway, Manhattan, NY",
                confidence: 0.63,
                match_type: "fallback",
                addendum: {
                  pad: { bbl: "1000477501", bin: "1001026" },
                },
              },
            },
            {
              properties: {
                label: "120 Broadway, Manhattan, NY",
                confidence: 0.99,
                match_type: "exact",
                addendum: { pad: {} },
              },
            },
          ],
        }),
      });
    });
    page.on("request", (request) => {
      if (request.method() !== "GET") {
        outboundWrites.push(`${request.method()} ${request.url()}`);
      }
    });

    await page.goto(`${baseURL}/vera/#/browse`, { waitUntil: "domcontentloaded" });
    await waitForVeraPool(page);
    const target = await page.evaluate((uid) => {
      const app = (
        window as unknown as {
          __VERA_APP: {
            POOL: () => Array<Record<string, unknown>>;
            addressOf: (listing: Record<string, unknown>) => string | null;
          };
        }
      ).__VERA_APP;
      const listing = app
        .POOL()
        .find((item) => String(item.listing_uid ?? "") === uid);
      if (!listing) return null;
      return {
        uid: String(listing.listing_uid),
        score: Number(listing.overall_score),
        serialized: JSON.stringify(listing),
        displayedAddress: app.addressOf(listing),
      };
    }, addressListingUid);
    expect(target, "numeric-address fixture listing is missing").not.toBeNull();
    expect(target!.displayedAddress, "2461 must not masquerade as an address").toBeNull();

    await page.evaluate((uid) => {
      (
        window as unknown as { __vera: { open: (listingUid: string) => void } }
      ).__vera.open(uid);
    }, target!.uid);
    await expect(page.locator("[data-inspector]")).toHaveClass(/is-open/);
    await page.locator('[data-insp-tabs] button[data-tab="verify"]').click();

    const form = page.locator("form[data-address-check]");
    await expect(form).toBeVisible();
    await form.locator('input[name="vera-address"]').fill("17th Street");
    await form.getByRole("button", { name: "Check with NYC Planning" }).click();
    await expect(form.locator("[data-address-result]")).toContainText(
      "Enter a house number and street",
    );
    expect(geoSearchCalls, "a street name without a house number reached GeoSearch").toBe(0);

    await form.locator('input[name="vera-address"]').fill("Avenue B 12");
    await form.getByRole("button", { name: "Check with NYC Planning" }).click();
    expect(geoSearchCalls, "a trailing number masqueraded as a house number").toBe(0);

    await form.locator('input[name="vera-address"]').fill("120 Broadway, Manhattan");
    await form.getByRole("button", { name: "Check with NYC Planning" }).click();

    const choices = form.locator("button[data-address-candidate]");
    await expect(choices).toHaveCount(1);
    await expect(choices.first()).toContainText("120 Broadway, Manhattan, NY");
    expect(geoSearchCalls).toBe(1);
    expect(new URL(geoSearchUrl).searchParams.get("text")).toBe(
      "120 Broadway, Manhattan, New York NY",
    );
    expect(
      await page.evaluate((uid) => {
        const saved = JSON.parse(
          localStorage.getItem("vera-address-resolutions-v1") || "{}",
        ) as Record<string, unknown>;
        return saved[uid] ?? null;
      }, target!.uid),
      "nothing is saved before the user confirms a candidate",
    ).toBeNull();

    await choices.first().click();
    const proof = page.locator(".address-proof");
    await expect(proof).toContainText("Resolved from the address you supplied");
    await expect(proof).toContainText("1000477501");
    await expect(proof).toContainText("does not change VERA’s score");

    const stored = await page.evaluate((uid) => {
      const all = JSON.parse(
        localStorage.getItem("vera-address-resolutions-v1") || "{}",
      ) as Record<string, Record<string, unknown>>;
      return all[uid] ?? null;
    }, target!.uid);
    expect(stored).toMatchObject({
      label: "120 Broadway, Manhattan, NY",
      confidence: 0.97,
      matchType: "exact",
      bbl: "1000477501",
      bin: "1001026",
      provenance: "user_supplied",
    });
    expect(String(stored?.confirmedAt)).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const listingAfter = await page.evaluate((uid) => {
      const listing = (
        window as unknown as {
          __VERA_APP: { byUid: (listingUid: string) => Record<string, unknown> };
        }
      ).__VERA_APP.byUid(uid);
      return {
        score: Number(listing.overall_score),
        serialized: JSON.stringify(listing),
      };
    }, target!.uid);
    expect(listingAfter.score).toBe(target!.score);
    expect(listingAfter.serialized, "the shared listing object was mutated").toBe(
      target!.serialized,
    );
    expect(outboundWrites, "address confirmation made a server-side write").toEqual([]);

    await proof.getByRole("button", { name: "Forget this address" }).click();
    await expect(page.locator("form[data-address-check]")).toBeVisible();
    expect(
      await page.evaluate((uid) => {
        const all = JSON.parse(
          localStorage.getItem("vera-address-resolutions-v1") || "{}",
        ) as Record<string, unknown>;
        return all[uid] ?? null;
      }, target!.uid),
      "the operator can remove the locally saved address without clearing the whole site",
    ).toBeNull();

    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "VERA acceptance mode cannot overwrite a visitor's saved hunt @chromium-desktop",
  async ({ page, baseURL }) => {
    const runtime = watchRuntime(page);
    const sentinels = {
      "vera-workspace": JSON.stringify({ view: "owner", marker: "keep-workspace" }),
      "vera-cases": JSON.stringify({ saved: { stage: "toured", marker: "keep-hunt" } }),
      "vera-anchors": JSON.stringify(["Union Sq", "Bedford Av"]),
      "vera-profile": JSON.stringify({ income: 98765, marker: "keep-profile" }),
      "vera-address-resolutions-v1": JSON.stringify({ saved: { label: "keep-address" } }),
    };
    await page.addInitScript((seed) => {
      Object.entries(seed).forEach(([key, value]) => localStorage.setItem(key, value));
    }, sentinels);
    await mockVeraData(page);
    await page.goto(`${baseURL}/vera/?test=1#/today`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(
      () =>
        (window as unknown as { __testResults?: { pass: boolean } })
          .__testResults !== undefined,
    );
    const acceptance = await page.evaluate(
      () =>
        (
          window as unknown as {
            __testResults?: {
              pass: boolean;
              results: Array<{ name: string; ok: boolean; detail: string }>;
            };
          }
        ).__testResults,
    );
    expect(
      acceptance?.pass,
      JSON.stringify(acceptance?.results.filter((result) => !result.ok), null, 2),
    ).toBe(true);

    expect(
      await page.evaluate((keys) =>
        Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
      Object.keys(sentinels)),
    ).toEqual(sentinels);
    expect(runtime.pageErrors).toEqual([]);
    expect(runtime.consoleErrors).toEqual([]);
  },
);

test(
  "Every homepage instrument stays inside its own canvas at every width @chromium-mobile",
  async ({ page, baseURL }) => {
    // The instruments lay themselves out in FRACTIONS of the canvas box, so a
    // budget that fits at one aspect ratio quietly amputates itself at another.
    // Nothing throws and nothing overflows — the missing part is simply never
    // painted, which a screenshot cannot tell you. This reads the pixels: ink
    // touching the outermost rows was either cut off there or is one resize
    // from it. Caught the websites instrument losing its third booking card in
    // the 284×300 box the tablet grid handed it.
    const WIDTHS = [320, 390, 430, 720, 768, 1024, 1280, 1600];
    const SERVICES = ["websites", "support", "software", "consult"];
    // Bright enough to be a drawn object; the atmosphere washes sit well under.
    const INK_MIN = 86;
    // Enough consecutive inked pixels to be an object, not antialiasing dust.
    const RUN_MIN = 6;

    const problems: string[] = [];

    // A settled frame is the honest thing to measure: it is exactly what a
    // reduced-motion reader sees, and it is the fullest the drawing ever gets.
    await page.emulateMedia({ reducedMotion: "reduce" });

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);

      for (const key of SERVICES) {
        const section = page.locator(`.lf-svc[data-lf-service="${key}"]`);
        await section.scrollIntoViewIfNeeded();
        await section.locator("canvas").waitFor({ state: "visible" });
        // Let the ResizeObserver settle and the still frame repaint.
        await page.waitForTimeout(300);

        const report = await page.evaluate(
          ({ inkMin, runMin, service }) => {
            const canvas = document.querySelector(
              `.lf-svc[data-lf-service="${service}"] canvas.lf-instrument__canvas`,
            );
            if (!(canvas instanceof HTMLCanvasElement)) return { error: "no canvas" };
            const cx = canvas.getContext("2d", { willReadFrequently: true });
            const { width: w, height: h } = canvas;
            if (!cx || !w || !h) return { error: "canvas has no size" };
            const data = cx.getImageData(0, 0, w, h).data;

            const inked = (x: number, y: number) => {
              const i = (y * w + x) * 4;
              if (data[i + 3] < 24) return false;
              return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2] >= inkMin;
            };
            const longestRun = (count: number, at: (n: number) => boolean) => {
              let run = 0;
              let best = 0;
              for (let n = 0; n < count; n += 1) {
                run = at(n) ? run + 1 : 0;
                if (run > best) best = run;
              }
              return best;
            };

            const edges: Record<string, number> = {
              top: Math.max(longestRun(w, (x) => inked(x, 0)), longestRun(w, (x) => inked(x, 1))),
              bottom: Math.max(
                longestRun(w, (x) => inked(x, h - 1)),
                longestRun(w, (x) => inked(x, h - 2)),
              ),
              left: Math.max(longestRun(h, (y) => inked(0, y)), longestRun(h, (y) => inked(1, y))),
              right: Math.max(
                longestRun(h, (y) => inked(w - 1, y)),
                longestRun(h, (y) => inked(w - 2, y)),
              ),
            };
            return {
              size: `${w}×${h}`,
              hits: Object.entries(edges)
                .filter(([, run]) => run >= runMin)
                .map(([edge, run]) => `${edge} (${run}px of ink)`),
            };
          },
          { inkMin: INK_MIN, runMin: RUN_MIN, service: key },
        );

        if ("error" in report && report.error) {
          problems.push(`${width}px · ${key} · ${report.error}`);
        } else if ("hits" in report && report.hits.length) {
          problems.push(
            `${width}px · ${key} · canvas ${report.size} · ink at ${report.hits.join(", ")}`,
          );
        }
      }
    }

    expect(
      problems,
      `An instrument runs off its own canvas. Re-budget its layout fractions for that\naspect ratio, or give the wrapper a taller --lf-instrument-ratio-m:\n${problems.join("\n")}`,
    ).toEqual([]);
  },
);

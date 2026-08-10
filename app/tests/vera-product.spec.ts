import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

const VERA_FEED_FIXTURE = readFileSync(
  new URL("./fixtures/vera-feed.json", import.meta.url),
  "utf8",
);

type VeraCase = {
  stage?: string;
};

type VeraManifest = {
  id?: string;
  name?: string;
  short_name?: string;
  start_url?: string;
  scope?: string;
  display?: string;
  background_color?: string;
  theme_color?: string;
  icons?: Array<{
    src?: string;
    sizes?: string;
    type?: string;
    purpose?: string;
  }>;
};

async function mockVeraData(page: Page) {
  // Stub the first-party public feed before VERA or a newly claiming service
  // worker can request it. The product remains read-only throughout the flow.
  await page.addInitScript((fixture) => {
    localStorage.removeItem("vera-cases");
    localStorage.removeItem("vera-workspace");
    sessionStorage.removeItem("vera-sweep-seen");

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
          headers: { "Content-Type": "application/json" },
        });
      }
      if (path.endsWith("/archive.json")) {
        return new Response("[]", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return nativeFetch(input, init);
    };
  }, VERA_FEED_FIXTURE);
}

async function waitForVera(page: Page) {
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
  await expect(page.locator("[data-loading]")).toBeHidden();
  await expect(page.locator("[data-snapshot-line]")).not.toHaveText("Sweeping…");
}

async function openVera(page: Page, route: string) {
  await mockVeraData(page);
  await page.goto(`/vera/#/${route}`, { waitUntil: "domcontentloaded" });
  await waitForVera(page);
}

function visibleListings(page: Page) {
  return page.locator("#main [data-open]:visible");
}

async function revealBrowseFilters(page: Page) {
  const bracket = page.getByRole("group", { name: /price bracket/i });
  if (!(await bracket.isVisible())) {
    const disclosure = page.getByRole("button", { name: /filters/i }).first();
    await expect(disclosure).toBeVisible();
    await disclosure.click();
  }
  await expect(bracket).toBeVisible();
  return bracket;
}

async function expectSelected(control: Locator) {
  await expect
    .poll(async () => {
      const pressed = await control.getAttribute("aria-pressed");
      return pressed ?? (await control.getAttribute("aria-selected"));
    })
    .toBe("true");
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(widths.scroll, "VERA must not create document-level sideways scroll").toBeLessThanOrEqual(
    widths.client,
  );
}

test(
  "VERA keeps its shell and puts Browse controls beside usable results @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "today");

    const shell = page.locator("[data-shell]");
    const shellHandle = await shell.elementHandle();
    expect(shellHandle, "the persistent product shell is missing").not.toBeNull();
    await expect(shell).toBeVisible();

    const nav = page.getByRole("navigation", { name: /sections/i });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: /^today$/i })).toBeVisible();
    const browseLink = nav.getByRole("link", { name: /^browse$/i });
    await expect(browseLink).toBeVisible();
    await expect(nav.getByRole("link", { name: /^my hunt/i })).toBeVisible();

    await browseLink.click();
    await expect(page.locator('.page[data-page="browse"]')).toBeVisible();
    await expect(browseLink).toHaveAttribute("aria-current", "page");
    expect(
      await shellHandle!.evaluate((element) => element.isConnected),
      "route navigation replaced the app shell instead of its workspace",
    ).toBe(true);

    const firstResult = visibleListings(page).first();
    await expect(firstResult).toBeVisible();
    const resultBox = await firstResult.boundingBox();
    const viewport = page.viewportSize();
    expect(resultBox, "Browse rendered no measurable result").not.toBeNull();
    expect(viewport).not.toBeNull();
    if (viewport!.width <= 760) {
      const tabZone = await page.locator(".mastnav__zone").boundingBox();
      expect(tabZone, "the phone tab bar has no measurable surface").not.toBeNull();
      expect(
        tabZone!.y,
        "the phone tab bar is attached to the header instead of the viewport bottom",
      ).toBeGreaterThan(viewport!.height / 2);
      expect(tabZone!.y + tabZone!.height).toBeGreaterThan(viewport!.height - 24);
    }
    expect(
      resultBox!.y,
      "filter chrome pushed every Browse result below the first app viewport",
    ).toBeLessThan(viewport!.height);

    const bracket = await revealBrowseFilters(page);
    const filterDeck = page.locator("[data-filters]");
    await expect(filterDeck).toHaveAttribute("aria-hidden", "false");
    expect(
      await filterDeck.evaluate((element) => (element as HTMLElement).inert),
      "a visible filter deck must remain in the accessibility tree",
    ).toBe(false);
    const underTwoThousand = bracket.getByRole("button", {
      name: /(?:≤|under|up to).*2[,.]?000/i,
    });
    await expect(underTwoThousand).toBeVisible();
    await underTwoThousand.click();
    await expectSelected(underTwoThousand);
    await expect(visibleListings(page).first()).toBeVisible();

    await expectNoHorizontalOverflow(page);
  },
);

test(
  "VERA Atlas has explicit map and list modes @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "atlas");
    await expect(page.locator('.page[data-page="atlas"]')).toBeVisible();

    const mapMode = page.getByRole("button", { name: /^map(?: view)?$/i });
    const listMode = page.getByRole("button", { name: /^list(?: view)?$/i });
    await expect(mapMode).toBeVisible();
    await expect(listMode).toBeVisible();

    await listMode.click();
    await expectSelected(listMode);
    await expect(visibleListings(page).first()).toBeVisible();

    await mapMode.click();
    await expectSelected(mapMode);
    await expect(
      page
        .locator(
          '[data-veramap], #main [role="img"][aria-label*="map" i], #main [role="application"][aria-label*="map" i]',
        )
        .first(),
    ).toBeVisible({ timeout: 15_000 });
    const vectorMap = page.locator("[data-veramap]");
    if (await vectorMap.count()) {
      await expect
        .poll(
          async () =>
            Number(
              (await vectorMap.getAttribute("data-veramap-features")) ?? "0",
            ),
          {
            timeout: 15_000,
            message: "Atlas loaded its map shell but rendered no listing clusters or points",
          },
        )
        .toBeGreaterThan(0);
    } else {
      await expect(page.locator(".mp-pin").first()).toBeVisible();
    }
    await expectNoHorizontalOverflow(page);
  },
);

test(
  "VERA My Hunt saves a listing and advances a renter decision @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "browse");
    const opener = visibleListings(page).first();
    const uid = await opener.getAttribute("data-open");
    expect(uid, "the first Browse result has no stable listing identity").toBeTruthy();

    await opener.click();
    const inspector = page.getByRole("dialog", {
      name: /ledger|listing|rental/i,
    });
    await expect(inspector).toBeVisible();
    await inspector.getByRole("button", { name: /save to (?:my )?hunt/i }).click();
    await inspector.getByRole("button", { name: /close/i }).click();

    const huntLink = page
      .getByRole("navigation", { name: /sections/i })
      .getByRole("link", { name: /^my hunt/i });
    await huntLink.click();
    await expect(page.locator('.page[data-page="hunt"]')).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /case file|my hunt|decision (?:room|workspace)/i,
    );

    const savedCase = page.locator(`#main [data-open="${uid}"]`).first();
    await expect(savedCase).toBeVisible();
    const advance = page
      .locator(
        `#main [data-stage="contacted"][data-uid="${uid}"], #main [data-stage="touring"][data-uid="${uid}"]`,
      )
      .first();
    await expect(advance).toBeVisible();
    const expectedStage = await advance.getAttribute("data-stage");
    await advance.click();

    await expect
      .poll(() =>
        page.evaluate((listingUid) => {
          const cases = JSON.parse(localStorage.getItem("vera-cases") || "{}") as Record<
            string,
            VeraCase
          >;
          return cases[listingUid]?.stage ?? null;
        }, uid!),
      )
      .toBe(expectedStage);
    await expect(page.locator(`#main [data-open="${uid}"]`).first()).toBeVisible();
  },
);

test(
  "VERA inspector preserves route, scroll, and modal accessibility @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "browse");
    await page.evaluate(() => window.scrollTo(0, 360));
    const opener = visibleListings(page).first();
    await opener.scrollIntoViewIfNeeded();
    const routeBefore = await page.evaluate(() => window.location.hash);
    const scrollBefore = await page.evaluate(() => window.scrollY);

    const uid = await opener.getAttribute("data-open");
    await opener.click();

    const inspector = page.getByRole("dialog", {
      name: /ledger|listing|rental/i,
    });
    await expect(inspector).toBeVisible();
    await expect(inspector).toHaveAttribute("aria-modal", "true");
    expect(await page.evaluate(() => window.location.hash)).toMatch(/^#\/listing\//);
    expect(
      await inspector.evaluate((dialog) => dialog.contains(document.activeElement)),
      "opening the inspector did not move focus into the modal",
    ).toBe(true);

    const backgroundIsLocked = await page.evaluate(() => {
      const rootOverflow = getComputedStyle(document.documentElement).overflowY;
      const bodyOverflow = getComputedStyle(document.body).overflowY;
      const required = [".masthead", "[data-filters]", "[data-main]", ".deckfoot"]
        .map((selector) => document.querySelector<HTMLElement>(selector))
        .filter((element): element is HTMLElement => Boolean(element));
      const filterDock = document.querySelector<HTMLElement>(".filter-dock");
      return (
        [rootOverflow, bodyOverflow].some((value) => value === "hidden" || value === "clip") &&
        required.every((element) => element.inert && element.getAttribute("aria-hidden") === "true") &&
        (!filterDock || filterDock.inert)
      );
    });
    expect(backgroundIsLocked, "the page behind the inspector still scrolls").toBe(true);

    const activeTab = inspector.locator('[role="tab"][aria-selected="true"]');
    await expect(activeTab).toHaveCount(1);
    const panel = inspector.getByRole("tabpanel");
    await expect(panel).toBeVisible();
    const activeTabId = await activeTab.getAttribute("id");
    expect(activeTabId, "the selected inspector tab needs an id").toBeTruthy();
    await expect(panel).toHaveAttribute("aria-labelledby", activeTabId!);

    await inspector.getByRole("button", { name: /close/i }).click();
    await expect(inspector).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(routeBefore);
    await expect(page.locator('[data-nav="browse"][aria-current="page"]')).toHaveCount(1);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore)).toBeLessThanOrEqual(2);
    expect(
      await page.evaluate((listingUid) => document.activeElement?.getAttribute("data-open") === listingUid, uid),
      "closing the inspector did not return focus to its listing",
    ).toBe(true);
  },
);

test(
  "VERA has no blocking radar replay or infinite decorative motion @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "today");

    const blockingReplay = page.locator(
      ".sweepveil:visible, .sweephero:visible, [data-radar-overlay]:visible, [data-sweep-overlay]:visible",
    );
    await expect(blockingReplay).toHaveCount(0);

    await page.evaluate(() => {
      window.location.hash = "#/atlas";
    });
    await expect(page.locator('.page[data-page="atlas"]')).toBeVisible();
    await page.waitForTimeout(1_000);

    const infiniteAnimations = await page.evaluate(() => {
      const visible = (element: Element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };
      return [document.body, ...document.querySelectorAll("body *")]
        .filter(visible)
        .flatMap((element) => {
          const style = getComputedStyle(element);
          const names = style.animationName.split(",").map((value) => value.trim());
          const iterations = style.animationIterationCount
            .split(",")
            .map((value) => value.trim());
          return names
            .filter(
              (name, index) =>
                name !== "none" &&
                (iterations[index] ?? iterations[iterations.length - 1]) === "infinite",
            )
            .map((name) => ({
              animation: name,
              element:
                element === document.body
                  ? "body"
                  : `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
            }));
        });
    });

    expect(
      infiniteAnimations,
      "radar, status, background, and map decoration must settle instead of looping forever",
    ).toEqual([]);
  },
);

test(
  "VERA touch chrome respects safe areas and 44px targets @vera-touch",
  async ({ page }) => {
    await openVera(page, "browse");

    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
      "content",
      /viewport-fit=cover/,
    );
    const safeAreaCoverage = await page.evaluate(async () => {
      const hrefs = [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"][href]')]
        .map((link) => link.href)
        .filter((href) => new URL(href).origin === window.location.origin);
      const css = (await Promise.all(hrefs.map((href) => fetch(href).then((response) => response.text())))).join(
        "\n",
      );
      return ["top", "right", "bottom", "left"].filter((side) =>
        css.includes(`safe-area-inset-${side}`),
      );
    });
    expect(safeAreaCoverage).toEqual(["top", "right", "bottom", "left"]);

    const bracket = await revealBrowseFilters(page);
    const targets = [
      page
        .getByRole("navigation", { name: /sections/i })
        .getByRole("link", { name: /^browse$/i }),
      page
        .getByRole("navigation", { name: /sections/i })
        .getByRole("link", { name: /^my hunt/i }),
      bracket.getByRole("button").first(),
      bracket.getByRole("button").last(),
    ];

    for (const target of targets) {
      await expect(target).toBeVisible();
      const geometry = await target.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          height: rect.height,
          label:
            element.getAttribute("aria-label") ?? element.textContent?.trim() ?? element.tagName,
          width: rect.width,
          touchAction: getComputedStyle(element).touchAction,
        };
      });
      expect(
        geometry.height,
        `${geometry.label}: touch target is shorter than the iOS minimum`,
      ).toBeGreaterThanOrEqual(44);
      expect(
        geometry.width,
        `${geometry.label}: touch target is narrower than the iOS minimum`,
      ).toBeGreaterThanOrEqual(44);
      expect(geometry.touchAction, `${geometry.label}: touch-action`).toContain(
        "manipulation",
      );
    }

    await expectNoHorizontalOverflow(page);
  },
);

test("VERA manifest is installable on desktop and iOS @vera-all-platforms", async ({ page }) => {
  await page.goto("/vera/", { waitUntil: "domcontentloaded" });
  const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(manifestHref, "VERA has no linked web-app manifest").toBeTruthy();

  const manifestResponse = await page.request.get(new URL(manifestHref!, page.url()).href);
  expect(manifestResponse.ok()).toBe(true);
  expect(manifestResponse.headers()["content-type"]).toContain("application/manifest+json");
  const manifest = (await manifestResponse.json()) as VeraManifest;
  expect(manifest).toMatchObject({
    id: "/vera/",
    short_name: "VERA",
    start_url: "/vera/#/today",
    scope: "/vera/",
    display: "standalone",
  });
  expect(manifest.name?.trim().length).toBeGreaterThan(4);
  expect(manifest.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  expect(manifest.theme_color).toMatch(/^#[0-9a-f]{6}$/i);

  const icons = manifest.icons ?? [];
  expect(
    icons.some((icon) => /(^|\s)192x192(\s|$)/.test(icon.sizes ?? "")),
    "manifest needs a 192px install icon",
  ).toBe(true);
  expect(
    icons.some((icon) => /(^|\s)512x512(\s|$)/.test(icon.sizes ?? "")),
    "manifest needs a 512px install icon",
  ).toBe(true);
  expect(
    icons.some((icon) => /(^|\s)maskable(\s|$)/.test(icon.purpose ?? "")),
    "manifest needs a maskable icon",
  ).toBe(true);

  for (const icon of icons) {
    expect(icon.src, "manifest icon has no source").toBeTruthy();
    expect(icon.src, "install icons must be real cacheable files, not data URLs").not.toMatch(/^data:/i);
    const response = await page.request.get(new URL(icon.src!, page.url()).href);
    expect(response.ok(), `manifest icon failed to load: ${icon.src}`).toBe(true);
  }

  await expect(page.locator('meta[name="apple-mobile-web-app-capable"]')).toHaveAttribute(
    "content",
    "yes",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
});

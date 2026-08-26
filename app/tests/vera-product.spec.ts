import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const VERA_FEED_FIXTURE = readFileSync(
  new URL("./fixtures/vera-feed.json", import.meta.url),
  "utf8",
);
const VERA_MAP_TILE_FIXTURE = readFileSync(
  new URL("./fixtures/vera-map-tile.pbf", import.meta.url),
);
const VERA_MAP_TILEJSON_FIXTURE = JSON.parse(
  readFileSync(new URL("./fixtures/vera-map-tilejson.json", import.meta.url), "utf8"),
) as Record<string, unknown>;
const requestedPreviewPort = Number.parseInt(process.env.PLAYWRIGHT_PORT ?? "4173", 10);
const previewPort = Number.isInteger(requestedPreviewPort) &&
  requestedPreviewPort >= 1024 && requestedPreviewPort <= 65535
  ? requestedPreviewPort : 4173;
const PREVIEW_ORIGIN = `http://127.0.0.1:${previewPort}`;

function expandedVeraFixture(count: number) {
  const fixture = JSON.parse(VERA_FEED_FIXTURE) as {
    pool: Array<Record<string, unknown>>;
  };
  const seeds = fixture.pool;
  fixture.pool = Array.from({ length: count }, (_, index) => ({
    ...seeds[index % seeds.length],
    address_normalized: `${index + 1} Progressive Test Street`,
    listing_uid: `progressive-listing-${index + 1}`,
    title: `Progressive listing ${index + 1}`,
  }));
  return JSON.stringify(fixture);
}

type VeraCase = {
  stage?: string;
};

type VeraWorkspaceSeed = {
  atlasMode?: "list" | "map";
};

type VeraListingScopeItem = {
  borough?: string | null;
  latitude?: unknown;
  listing_uid?: string;
  longitude?: unknown;
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

async function mockVeraData(
  page: Page,
  workspaceSeed?: VeraWorkspaceSeed,
  fixture = VERA_FEED_FIXTURE,
  archive = "[]",
) {
  // Keep Atlas interaction coverage independent of the public tile CDN. The
  // local Liberty style and VERA GeoJSON layers still execute normally; an
  // empty, valid vector-tile source is enough for MapLibre to reach `load`.
  await page.route("https://tiles.openfreemap.org/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/planet") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          ...VERA_MAP_TILEJSON_FIXTURE,
          tiles: ["https://tiles.openfreemap.org/__vera-test/{z}/{x}/{y}.pbf"],
        }),
      });
      return;
    }
    if (url.pathname.startsWith("/__vera-test/") && url.pathname.endsWith(".pbf")) {
      await route.fulfill({
        contentType: "application/vnd.mapbox-vector-tile",
        body: VERA_MAP_TILE_FIXTURE,
      });
      return;
    }
    if (url.pathname.endsWith(".png")) {
      await route.fulfill({
        contentType: "image/png",
        body: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL8WQAAAABJRU5ErkJggg==",
          "base64",
        ),
      });
      return;
    }
    await route.fulfill({ status: 204, body: "" });
  });

  // Stub the first-party public feed before VERA or a newly claiming service
  // worker can request it. The product remains read-only throughout the flow.
  await page.addInitScript(({ fixture, workspace, archive }) => {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith("vera-")) localStorage.removeItem(key);
    }
    if (workspace) localStorage.setItem("vera-workspace", JSON.stringify(workspace));

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
        return new Response(archive, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return nativeFetch(input, init);
    };
  }, { fixture, workspace: workspaceSeed ?? null, archive });
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

async function openVera(page: Page, route: string, workspaceSeed?: VeraWorkspaceSeed) {
  await mockVeraData(page, workspaceSeed);
  await page.goto(`/vera/#/${route}`, { waitUntil: "domcontentloaded" });
  await waitForVera(page);
}

test(
  "VERA keeps a slow current publication alive past the former twelve-second cutoff @vera-desktop",
  async ({ page }) => {
    test.setTimeout(30_000);
    await page.addInitScript(({ fixture }) => {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (new URL(raw, window.location.href).pathname.endsWith("/public.json")) {
          let resolved = false;
          init?.signal?.addEventListener("abort", () => {
            if (!resolved) {
              (window as unknown as { __veraSlowPublicationAbortedBeforeResponse?: boolean }).__veraSlowPublicationAbortedBeforeResponse = true;
            }
          });
          await new Promise((resolve) => window.setTimeout(resolve, 12_500));
          resolved = true;
          return new Response(fixture, { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return nativeFetch(input, init);
      };
    }, { fixture: VERA_FEED_FIXTURE });

    await page.goto("/vera/#/today", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-loading]")).toContainText(/still loading the current vera publication/i, {
      timeout: 6_000,
    });
    await waitForVera(page);
    await expect
      .poll(() => page.evaluate(() => Boolean((window as unknown as { __veraSlowPublicationAbortedBeforeResponse?: boolean }).__veraSlowPublicationAbortedBeforeResponse)))
      .toBe(false);
  },
);

test(
  "VERA honors Retry-After and recovers from a transient 429 publication response @vera-desktop",
  async ({ page }) => {
    await page.addInitScript(({ fixture }) => {
      const nativeFetch = window.fetch.bind(window);
      let attempts = 0;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (new URL(raw, window.location.href).pathname.endsWith("/public.json")) {
          attempts += 1;
          (window as unknown as { __veraFeedAttempts: number }).__veraFeedAttempts = attempts;
          const times = ((window as unknown as { __veraFeedAttemptTimes?: number[] }).__veraFeedAttemptTimes ??= []);
          times.push(Date.now());
          if (attempts === 1) {
            return new Response("rate limited", {
              status: 429,
              headers: { "Retry-After": "1" },
            });
          }
          return new Response(fixture, { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return nativeFetch(input, init);
      };
    }, { fixture: VERA_FEED_FIXTURE });

    await page.goto("/vera/#/today", { waitUntil: "domcontentloaded" });
    await waitForVera(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __veraFeedAttempts?: number }).__veraFeedAttempts ?? 0)).toBe(2);
    await expect
      .poll(() => page.evaluate(() => {
        const times = (window as unknown as { __veraFeedAttemptTimes?: number[] }).__veraFeedAttemptTimes ?? [];
        return times.length === 2 ? times[1] - times[0] : 0;
      }))
      .toBeGreaterThanOrEqual(900);
  },
);

test(
  "VERA bounds automatic publication retries, then honors a manual retry @vera-desktop",
  async ({ page }) => {
    await page.addInitScript(({ fixture }) => {
      const nativeFetch = window.fetch.bind(window);
      let attempts = 0;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (new URL(raw, window.location.href).pathname.endsWith("/public.json")) {
          attempts += 1;
          (window as unknown as { __veraFeedAttempts: number }).__veraFeedAttempts = attempts;
          if (attempts === 1) {
            return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } });
          }
          if (attempts <= 3) return new Response("unavailable", { status: 503 });
          return new Response(fixture, { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return nativeFetch(input, init);
      };
    }, { fixture: VERA_FEED_FIXTURE });

    await page.goto("/vera/#/today", { waitUntil: "domcontentloaded" });
    const retry = page.getByRole("button", { name: /try again/i });
    await expect(retry).toBeVisible({ timeout: 8_000 });
    await expect(page.locator("[data-loading]")).toContainText(/after three tries/i);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __veraFeedAttempts?: number }).__veraFeedAttempts ?? 0)).toBe(3);
    await retry.click();
    await waitForVera(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __veraFeedAttempts?: number }).__veraFeedAttempts ?? 0)).toBe(4);
  },
);

test(
  "VERA resumes a publication boot safely after persisted navigation @vera-all-platforms",
  async ({ page }) => {
    const staleFixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    staleFixture.pool[0].title = "Stale publication that must not replace the current drop";
    const currentFixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    currentFixture.pool[0].title = "Current publication owns this session";
    await page.addInitScript(({ stale, current }) => {
      const nativeFetch = window.fetch.bind(window);
      let attempts = 0;
      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (new URL(raw, window.location.href).pathname.endsWith("/public.json")) {
          attempts += 1;
          (window as unknown as { __veraFeedAttempts: number }).__veraFeedAttempts = attempts;
          if (attempts === 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1_000));
            return new Response(stale, { status: 200, headers: { "Content-Type": "application/json" } });
          }
          return new Response(current, { status: 200, headers: { "Content-Type": "application/json" } });
        }
        return nativeFetch(input, init);
      };
    }, { stale: JSON.stringify(staleFixture), current: JSON.stringify(currentFixture) });

    await page.goto("/vera/#/today", { waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate(() => (window as unknown as { __veraFeedAttempts?: number }).__veraFeedAttempts ?? 0)).toBe(1);
    await page.evaluate(() => {
      const resume = new Event("pageshow");
      Object.defineProperty(resume, "persisted", { value: true });
      window.dispatchEvent(resume);
    });
    await waitForVera(page);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __veraFeedAttempts?: number }).__veraFeedAttempts ?? 0)).toBe(2);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __vera?: { pool: () => Array<{ title?: string }> } }).__vera?.pool()[0]?.title)).toBe("Current publication owns this session");
    await page.waitForTimeout(1_200);
    await expect.poll(() => page.evaluate(() => (window as unknown as { __vera?: { pool: () => Array<{ title?: string }> } }).__vera?.pool()[0]?.title)).toBe("Current publication owns this session");
  },
);

test(
  "VERA renders a route even when the View Transition DOM update times out @vera-desktop",
  async ({ page }) => {
    const transitionErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && message.text().includes("VERA route transition failed")) {
        transitionErrors.push(message.text());
      }
    });
    await page.addInitScript(() => {
      Object.defineProperty(document, "startViewTransition", {
        configurable: true,
        value: (update: () => void) => {
          update();
          const error = Object.assign(new Error("transition DOM update timed out"), { name: "TimeoutError" });
          const rejected = Promise.reject(error);
          return { ready: rejected, updateCallbackDone: rejected, finished: rejected };
        },
      });
    });
    await openVera(page, "atlas");
    await page.evaluate(() => { window.location.hash = "#/hunt"; });
    await expect(page.locator('.page[data-page="hunt"]')).toBeVisible();
    expect(transitionErrors).toEqual([]);
  },
);

test(
  "VERA archive rows are native buttons when a live listing can be opened @vera-desktop",
  async ({ page }) => {
    const fixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    const listing = fixture.pool[0];
    const archive = JSON.stringify([{
      date: "2026-08-13",
      listings: [{
        listing_uid: listing.listing_uid,
        address_normalized: listing.address_normalized,
        neighborhood: listing.neighborhood,
        rent: listing.rent,
        title: listing.title,
      }],
    }]);
    await mockVeraData(page, undefined, JSON.stringify(fixture), archive);
    await page.goto("/vera/#/archive", { waitUntil: "domcontentloaded" });
    await waitForVera(page);
    const row = page.locator(".arcrow[data-open]");
    await expect(row).toHaveCount(1);
    expect(await row.evaluate((element) => element.tagName)).toBe("BUTTON");
    await row.click();
    await expect(page.getByRole("dialog")).toBeVisible();
  },
);

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

async function expectFocused(control: Locator, message: string) {
  await expect
    .poll(
      () => control.evaluate((element) => document.activeElement === element),
      { message },
    )
    .toBe(true);
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

async function expectMinimumTouchTarget(target: Locator) {
  await expect(target).toBeVisible();
  const label =
    (await target.getAttribute("aria-label")) ?? (await target.innerText()) ?? "control";
  await expect
    .poll(() => target.evaluate((element) => element.getBoundingClientRect().height), {
      message: `${label}: touch target is shorter than the iOS minimum`,
    })
    .toBeGreaterThanOrEqual(43.99);
  await expect
    .poll(() => target.evaluate((element) => element.getBoundingClientRect().width), {
      message: `${label}: touch target is narrower than the iOS minimum`,
    })
    .toBeGreaterThanOrEqual(43.99);
  await expect
    .poll(() => target.evaluate((element) => getComputedStyle(element).touchAction), {
      message: `${label}: touch-action`,
    })
    .toContain("manipulation");
}

async function closeVisibleFilterSheet(page: Page) {
  const close = page.locator("[data-filter-close]:visible").first();
  if (await close.count()) {
    await close.click();
    return;
  }
  const disclosure = page.locator("[data-filter-toggle]:visible").first();
  if (
    (await disclosure.count()) &&
    (await disclosure.getAttribute("aria-expanded")) === "true"
  ) {
    await disclosure.click();
  }
}

async function expectOpenAtlasContract(page: Page, vectorMap: Locator) {
  await expect(vectorMap).toHaveAttribute("role", "region");
  await expect(vectorMap).toHaveAttribute("aria-label", /street and building map of listings/i);
  await expect(vectorMap).toHaveAttribute(
    "data-veramap-style",
    "vera-surveyor-liberty",
    { timeout: 15_000 },
  );
  await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "enabled");
  await expect(vectorMap).toHaveAttribute("data-veramap-points", "price-score");
  await expect(vectorMap).toHaveAttribute("data-veramap-streets", /^(?:detailed|vector)$/);
  await expect(vectorMap).toHaveAttribute("data-veramap-buildings", /^(?:3d|footprints)$/);
  await expect(vectorMap).toHaveAttribute("data-veramap-motion", /^(?:standard|reduced)$/);
  await expect(vectorMap.locator(".maplibregl-canvas")).toBeVisible();

  await expect
    .poll(
      async () => Number((await vectorMap.getAttribute("data-veramap-listings")) ?? "0"),
      {
        timeout: 15_000,
        message: "Atlas did not publish the count loaded into its listing source",
      },
    )
    .toBeGreaterThan(0);
  await expect
    .poll(async () => {
      const failure = page.locator("[data-map-errors]");
      if (await failure.count()) {
        return `failure: ${await failure.getAttribute("data-map-errors")}`;
      }
      return (await vectorMap.getAttribute("data-veramap-ready")) ?? "waiting";
    }, { timeout: 15_000, message: "Atlas did not reach its ready state" })
    .toBe("true");
  await expect(vectorMap).toHaveAttribute(
    "data-veramap-layer-contract",
    "clusters points price-score focus hit",
  );
  const pixelRatio = Number(await vectorMap.getAttribute("data-veramap-pixel-ratio"));
  expect(pixelRatio, "Atlas published no usable WebGL pixel ratio").toBeGreaterThan(0);
  expect(pixelRatio, "Atlas exceeds its mobile GPU pixel-ratio cap").toBeLessThanOrEqual(2);

  await expect(page.locator(".mp-key")).toContainText(
    /OpenFreeMap.*OpenMapTiles.*OpenStreetMap/s,
  );

  const attribution = vectorMap.locator(".maplibregl-ctrl-attrib");
  await expect(attribution).toBeVisible();
  const osmCredit = attribution.locator('a[href*="openstreetmap.org/copyright"]');
  await expect(osmCredit).toHaveCount(1);
  if (!(await osmCredit.isVisible())) {
    const disclosure = attribution.locator(".maplibregl-ctrl-attrib-button");
    await expect(disclosure).toBeVisible();
    await disclosure.click();
  }
  await expect(osmCredit).toBeVisible();
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

      const filterDock = page.locator(".filter-dock:visible");
      const [dockBox, mainBox] = await Promise.all([
        filterDock.boundingBox(),
        page.locator("[data-main]").boundingBox(),
      ]);
      expect(dockBox, "the phone filter control has no measurable surface").not.toBeNull();
      expect(mainBox, "the phone result surface has no measurable surface").not.toBeNull();
      expect(
        dockBox!.y + dockBox!.height,
        "the phone filter control overlays the scrolling result surface",
      ).toBeLessThanOrEqual(mainBox!.y + 1);
      const trustLine = page.locator("[data-browse-trust]:visible").first();
      await expect(trustLine).toBeVisible();
      await expect(trustLine).toContainText(/clears the bar|needs verification|scam signals/i);
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
    if (viewport!.width <= 760) {
      await expect(filterDeck).toHaveAttribute("role", "dialog");
      await expect(filterDeck).toHaveAttribute("aria-modal", "true");
      const done = filterDeck.getByRole("button", { name: /^done$/i });
      await expectFocused(done, "opening the mobile filter sheet did not move focus to Done");
      const backgroundLocked = await page.evaluate(() => {
        const main = document.querySelector<HTMLElement>("[data-main]");
        const masthead = document.querySelector<HTMLElement>(".masthead");
        const dock = document.querySelector<HTMLElement>(".filter-dock");
        return Boolean(
          document.documentElement.classList.contains("vera-filters-open") &&
          main?.inert && masthead?.inert && dock?.inert &&
          main.getAttribute("aria-hidden") === "true" &&
          masthead.getAttribute("aria-hidden") === "true"
        );
      });
      expect(backgroundLocked, "the mobile filter sheet left the workspace interactive").toBe(true);
    }
    if (viewport!.width >= 1180) {
      const overflowCue = page.locator("[data-filter-scroll]");
      await expect(overflowCue).toBeVisible();
      await overflowCue.click();
      await expect.poll(() => filterDeck.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
      await expect(overflowCue).toContainText("Earlier filters");
      await overflowCue.click();
      await expect.poll(() => filterDeck.evaluate((element) => element.scrollLeft)).toBe(0);
    }
    const underTwoThousand = bracket.getByRole("button", {
      name: /(?:≤|under|up to).*2[,.]?000/i,
    });
    await expect(underTwoThousand).toBeVisible();
    await underTwoThousand.click();
    await expectSelected(underTwoThousand);
    await expect(visibleListings(page).first()).toBeVisible();

    if (viewport!.width <= 760) {
      const done = filterDeck.getByRole("button", { name: /^done$/i });
      await done.click();
      await expect(filterDeck).toHaveAttribute("aria-hidden", "true");
      const dock = page.locator(".filter-dock:visible");
      await expectFocused(dock, "closing the mobile filter sheet did not return focus to Filters");
      await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("vera-filters-open"))).toBe(false);
    }

    await expectNoHorizontalOverflow(page);
  },
);

test(
  "VERA Browse progressively renders a large result set without hiding it from search @vera-desktop",
  async ({ page }) => {
    const total = 125;
    await mockVeraData(page, undefined, expandedVeraFixture(total));
    await page.goto("/vera/#/browse", { waitUntil: "domcontentloaded" });
    await waitForVera(page);

    const table = page.locator(".dt");
    const rows = table.locator("tbody tr[data-listing-row]");
    const openButtons = rows.locator(".t-title[data-open]");
    const more = page.locator("[data-browse-more]");
    await expect(rows).toHaveCount(50);
    await expect(openButtons).toHaveCount(50);
    await expect(rows.first()).not.toHaveAttribute("tabindex", /.+/);
    await expect(rows.first()).not.toHaveAttribute("data-open", /.+/);
    await expect(openButtons.first()).toHaveAccessibleName(/open ledger for/i);
    await expect(table).toHaveAttribute("aria-rowcount", String(total + 1));
    await expect(page.locator("[data-browse-progress]")).toHaveText(
      "50 of 125 matching listings loaded.",
    );
    await expect(more).toHaveText("Show next 50 listings");
    expect(await more.evaluate((button) => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(
      44,
    );
    expect(
      await page.evaluate(() => document.querySelectorAll("#main *").length),
      "Browse regressed toward mounting the entire large table at once",
    ).toBeLessThan(4_000);

    await more.click();
    await expect(rows).toHaveCount(100);
    await expectFocused(
      openButtons.nth(50),
      "Browse did not move focus to the first newly loaded ledger button",
    );
    await expect(more).toHaveText("Show next 25 listings");

    await more.click();
    await expect(rows).toHaveCount(total);
    await expectFocused(
      openButtons.nth(100),
      "Browse lost focus when it loaded the final ledger-button batch",
    );
    await expect(page.locator("[data-browse-progress]")).toHaveText(
      "All 125 matching listings loaded.",
    );
    await expect(more).toBeHidden();

    const search = page.getByRole("searchbox", { name: "Search listings" });
    await search.fill("Progressive listing 125");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Progressive listing 125");
    await expect(page.locator("[data-browse-count]")).toHaveText("1 matches · 1 loaded");
  },
);

test(
  "VERA Atlas has explicit map and list modes @vera-all-platforms",
  async ({ page }) => {
    const atlasStyleWarnings: string[] = [];
    const remoteMapRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin === "https://tiles.openfreemap.org") remoteMapRequests.push(url.href);
    });
    page.on("console", (message) => {
      if (
        message.type() === "warning" &&
        (
          message.text() === "Expected value to be of type number, but found null instead." ||
          message.text().includes('Image "road_" could not be loaded')
        )
      ) {
        atlasStyleWarnings.push(message.text());
      }
    });
    await openVera(page, "atlas", { atlasMode: "list" });
    await expect(page.locator('.page[data-page="atlas"]')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => Boolean((window as unknown as { __VERAG?: { ready: () => boolean } }).__VERAG?.ready())))
      .toBe(true);

    const mapMode = page.getByRole("button", { name: /^map(?: view)?$/i });
    const listMode = page.getByRole("button", { name: /^list(?: view)?$/i });
    await expect(mapMode).toBeVisible();
    await expect(listMode).toBeVisible();
    await expectSelected(listMode);
    await expect(page.locator(".atlas-layout")).toHaveClass(/atlas-layout--list/);
    await expect(page.locator("[data-veramap], .maplibregl-canvas")).toHaveCount(0);
    await expect(page.locator('script[src*="maplibre-gl"]')).toHaveCount(1);
    expect(
      remoteMapRequests,
      "idle prewarming may cache first-party style assets but must not request live tiles before Map view",
    ).toEqual([]);

    await expect(page.locator(".workspacehead--atlas")).toContainText(
      /four-borough.*Manhattan.*Brooklyn.*Queens.*Bronx/is,
    );
    const scope = await page.evaluate(() => {
      const allowed = new Set(["manhattan", "brooklyn", "queens", "bronx"]);
      const pool =
        (
          window as unknown as {
            __vera?: { pool: () => VeraListingScopeItem[] };
          }
        ).__vera?.pool() ?? [];
      const scoped = pool.filter((listing) =>
        allowed.has(String(listing.borough ?? "").trim().toLowerCase()),
      );
      const mapped = scoped.filter((listing) => {
        const coordinateNumber = (value: unknown) => {
          if (value == null) return null;
          if (typeof value !== "number" && typeof value !== "string") return null;
          if (typeof value === "string" && !value.trim()) return null;
          const number = Number(value);
          return Number.isFinite(number) ? number : null;
        };
        const latitude = coordinateNumber(listing.latitude);
        const longitude = coordinateNumber(listing.longitude);
        return (
          latitude != null &&
          longitude != null &&
          latitude >= -90 &&
          latitude <= 90 &&
          longitude >= -180 &&
          longitude <= 180
        );
      });
      const boroughByUid = new Map(
        pool.map((listing) => [listing.listing_uid ?? "", listing.borough ?? ""]),
      );
      const renderedIds = [
        ...document.querySelectorAll<HTMLElement>(".atlas-list-pane [data-open]"),
      ].map((element) => element.getAttribute("data-open") ?? "");
      return {
        mappedCount: mapped.length,
        outsideBoroughRows: renderedIds.filter(
          (uid) => !allowed.has(String(boroughByUid.get(uid) ?? "").trim().toLowerCase()),
        ),
        renderedListCount: renderedIds.length,
        scopedCount: scoped.length,
      };
    });
    expect(scope.mappedCount).toBeGreaterThan(0);
    expect(scope.renderedListCount).toBe(scope.mappedCount);
    expect(scope.outsideBoroughRows).toEqual([]);
    const workspaceCounts = (await page.locator(".workspace-count").innerText())
      .match(/\d+/g)
      ?.map(Number);
    expect(workspaceCounts?.slice(0, 2)).toEqual([scope.mappedCount, scope.scopedCount]);

    const atlasListResult = visibleListings(page).first();
    await expect(atlasListResult).toBeVisible();
    await atlasListResult.click();
    const inspector = page.getByRole("dialog", { name: /ledger|listing|rental/i });
    await expect(inspector).toBeVisible();
    await inspector.getByRole("button", { name: /close/i }).click();
    await expect(inspector).toBeHidden();
    await expect(page.locator('[data-nav="atlas"][aria-current="page"]')).toHaveCount(1);

    await mapMode.click();
    await expectSelected(mapMode);
    await expectFocused(mapMode, "Map mode lost keyboard focus when Atlas rerendered");
    await expect(page.locator(".atlas-layout")).toHaveClass(/atlas-layout--map/);
    const vectorMap = page.locator("[data-veramap]");
    await expect(vectorMap).toHaveCount(1, { timeout: 15_000 });
    await expect(vectorMap.locator(".maplibregl-canvas")).toHaveCount(1);
    await expectFocused(mapMode, "Map mode lost keyboard focus after the lazy map finished mounting");
    await expectOpenAtlasContract(page, vectorMap);
    await expect(vectorMap).toHaveAttribute("data-veramap-style-number-guards", /^\d+$/);
    expect(Number(await vectorMap.getAttribute("data-veramap-listings"))).toBe(
      scope.mappedCount,
    );

    const canvasHandle = await vectorMap.locator(".maplibregl-canvas").elementHandle();
    expect(canvasHandle, "Atlas mounted no persistent MapLibre canvas").not.toBeNull();
    const bracket = await revealBrowseFilters(page);
    const underTwoThousand = bracket.getByRole("button", {
      name: /(?:≤|under|up to).*2[,.]?000/i,
    });
    await underTwoThousand.click();
    await expectSelected(underTwoThousand);
    await expect(vectorMap).toHaveCount(1);
    await expect(vectorMap.locator(".maplibregl-canvas")).toHaveCount(1);
    expect(
      await canvasHandle!.evaluate((canvas) => canvas.isConnected),
      "a Map filter refresh replaced the WebGL canvas and discarded its camera",
    ).toBe(true);

    await closeVisibleFilterSheet(page);
    await listMode.click();
    await expectSelected(listMode);
    await expectFocused(listMode, "List mode lost keyboard focus when Atlas rerendered");
    await expect(page.locator(".atlas-layout")).toHaveClass(/atlas-layout--list/);
    await expect(page.locator("[data-veramap], .maplibregl-canvas")).toHaveCount(0);
    expect(await canvasHandle!.evaluate((canvas) => canvas.isConnected)).toBe(false);
    expect(
      atlasStyleWarnings,
      "Atlas accepted an invalid OpenMapTiles road-shield length",
    ).toEqual([]);
    await expectNoHorizontalOverflow(page);
  },
);

test(
  "VERA remounts populated Atlas layers after leaving the map workspace @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "atlas");
    const firstMap = page.locator("[data-veramap]");
    await expectOpenAtlasContract(page, firstMap);
    await expect
      .poll(async () => Number((await firstMap.getAttribute("data-veramap-features")) ?? "0"))
      .toBeGreaterThan(0);
    const firstCanvas = await firstMap.locator(".maplibregl-canvas").elementHandle();
    expect(firstCanvas, "Atlas mounted no initial WebGL canvas").not.toBeNull();

    await page.getByRole("link", { name: /^today$/i }).click();
    await expect(page.locator('.page[data-page="today"]')).toBeVisible();
    await page.getByRole("link", { name: /^atlas$/i }).click();

    const remountedMap = page.locator("[data-veramap]");
    await expectOpenAtlasContract(page, remountedMap);
    await expect
      .poll(async () => Number((await remountedMap.getAttribute("data-veramap-features")) ?? "0"), {
        timeout: 15_000,
        message: "Atlas returned with controls but no rendered listing features",
      })
      .toBeGreaterThan(0);
    expect(await firstCanvas!.evaluate((canvas) => canvas.isConnected)).toBe(false);
  },
);

test(
  "VERA Atlas uses NYC geometry instead of borough labels for four-borough scope @vera-all-platforms",
  async ({ page }) => {
    const fixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    const source = fixture.pool[0];
    const spoofedBrooklynOnStatenIsland = "spoofed-brooklyn-on-staten-island";
    const spoofedBronxInConnecticut = "spoofed-bronx-in-connecticut";
    fixture.pool.push(
      {
        ...source,
        address_normalized: "1 Spoofed Borough Street",
        borough: "Brooklyn",
        latitude: 40.520001,
        listing_uid: spoofedBrooklynOnStatenIsland,
        longitude: -74.209137,
        title: "Spoofed Brooklyn on Staten Island",
      },
      {
        ...source,
        address_normalized: "2 Spoofed Borough Street",
        borough: "Bronx",
        latitude: 41.466592,
        listing_uid: spoofedBronxInConnecticut,
        longitude: -73.546515,
        title: "Spoofed Bronx in Connecticut",
      },
    );
    await mockVeraData(page, { atlasMode: "list" }, JSON.stringify(fixture));
    await page.goto("/vera/#/atlas", { waitUntil: "domcontentloaded" });
    await waitForVera(page);
    await expect
      .poll(() => page.evaluate(() => Boolean((window as unknown as { __VERAG?: { ready: () => boolean } }).__VERAG?.ready())))
      .toBe(true);

    const scope = await page.evaluate((spoofed) => {
      const app = window as unknown as {
        __VERAG?: {
          placeRead: (listing: Record<string, unknown>) => { boro: string | null } | null;
          withinAtlasBoroughs: (listing: Record<string, unknown>) => boolean | null;
        };
        __vera?: { pool: () => Array<Record<string, unknown>> };
      };
      const pool = app.__vera?.pool() ?? [];
      const rendered = [...document.querySelectorAll<HTMLElement>(".atlas-list-pane [data-open]")]
        .map((element) => element.getAttribute("data-open") ?? "");
      const byUid = new Map(pool.map((listing) => [String(listing.listing_uid ?? ""), listing]));
      return {
        renderedSpoofs: spoofed.filter((uid) => rendered.includes(uid)),
        geometrySpoofs: spoofed.map((uid) => app.__VERAG?.withinAtlasBoroughs(byUid.get(uid) ?? {})),
        boroughNames: [
          app.__VERAG?.placeRead({ latitude: 40.6782, longitude: -73.9442 })?.boro,
          app.__VERAG?.placeRead({ latitude: 40.8448, longitude: -73.8648 })?.boro,
        ],
      };
    }, [spoofedBrooklynOnStatenIsland, spoofedBronxInConnecticut]);
    expect(scope.renderedSpoofs).toEqual([]);
    expect(scope.geometrySpoofs).toEqual([false, false]);
    expect(scope.boroughNames).toEqual(["Brooklyn", "Bronx"]);
  },
);

test(
  "VERA Atlas rejects absent and malformed coordinates without losing numeric strings @vera-all-platforms",
  async ({ page }) => {
    const fixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    const source = fixture.pool[0];
    const coordinateCases: Array<{
      uid: string;
      latitude: unknown;
      longitude: unknown;
    }> = [
      { uid: "coordinate-valid-number", latitude: 40.721767, longitude: -73.98225 },
      { uid: "coordinate-valid-string", latitude: " 40.721767 ", longitude: " -73.98225 " },
      { uid: "coordinate-null", latitude: null, longitude: null },
      { uid: "coordinate-empty", latitude: 40.721767, longitude: "" },
      { uid: "coordinate-whitespace", latitude: "   ", longitude: -73.98225 },
      { uid: "coordinate-nan", latitude: "NaN", longitude: -73.98225 },
      { uid: "coordinate-junk", latitude: "north", longitude: -73.98225 },
      { uid: "coordinate-latitude-range", latitude: 90.01, longitude: -73.98225 },
      { uid: "coordinate-longitude-range", latitude: 40.721767, longitude: -180.01 },
      { uid: "coordinate-boolean", latitude: false, longitude: -73.98225 },
    ];
    const validUids = ["coordinate-valid-number", "coordinate-valid-string"];
    const invalidUids = coordinateCases
      .map(({ uid }) => uid)
      .filter((uid) => !validUids.includes(uid));

    fixture.pool = coordinateCases.map(({ uid, latitude, longitude }, index) => ({
      ...source,
      address_normalized: `${index + 1} Coordinate Contract Street`,
      borough: "Manhattan",
      latitude,
      listing_uid: uid,
      longitude,
      title: `Coordinate case ${index + 1}`,
    }));

    await mockVeraData(
      page,
      { atlasMode: "list" },
      JSON.stringify(fixture),
    );
    await page.goto("/vera/#/atlas", { waitUntil: "domcontentloaded" });
    await waitForVera(page);
    await expect
      .poll(() => page.evaluate(() => Boolean((window as unknown as { __VERAG?: { ready: () => boolean } }).__VERAG?.ready())))
      .toBe(true);

    const renderedUids = await page
      .locator(".atlas-list-pane [data-open]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-open") ?? "").sort(),
      );
    expect(renderedUids).toEqual(validUids.slice().sort());
    await expect(page.locator(".workspace-count")).toHaveText("2 mapped · 10 in scope");

    const mapMode = page.getByRole("button", { name: /^map(?: view)?$/i });
    await mapMode.click();
    const vectorMap = page.locator("[data-veramap]");
    await expectOpenAtlasContract(page, vectorMap);
    await expect(vectorMap).toHaveAttribute("data-veramap-listings", "2");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Boolean(
              (window as unknown as { __VERAG?: { ready: () => boolean } }).__VERAG?.ready(),
            ),
        ),
      )
      .toBe(true);

    const validation = await page.evaluate(
      ({ invalid, valid }) => {
        const app = window as unknown as {
          __vera?: { pool: () => Array<Record<string, unknown>> };
          __VERAG?: {
            minimap: (listing: Record<string, unknown>, width: number, height: number) => string;
          };
          __VERAM?: {
            flyTo: (uid: string, options: { popup: boolean }) => boolean;
            update: (listings: Array<Record<string, unknown>>) => void;
          };
        };
        const pool = app.__vera?.pool() ?? [];
        app.__VERAM?.update(pool);
        return {
          invalidFlyTo: invalid.map((uid) => app.__VERAM?.flyTo(uid, { popup: false })),
          invalidMinimaps: pool
            .filter((listing) => invalid.includes(String(listing.listing_uid ?? "")))
            .map((listing) => Boolean(app.__VERAG?.minimap(listing, 300, 300))),
          validFlyTo: valid.map((uid) => app.__VERAM?.flyTo(uid, { popup: false })),
          validMinimaps: pool
            .filter((listing) => valid.includes(String(listing.listing_uid ?? "")))
            .map((listing) => Boolean(app.__VERAG?.minimap(listing, 300, 300))),
        };
      },
      { invalid: invalidUids, valid: validUids },
    );

    await expect(vectorMap).toHaveAttribute("data-veramap-listings", "2");
    expect(validation.invalidFlyTo).toEqual(invalidUids.map(() => false));
    expect(validation.invalidMinimaps).toEqual(invalidUids.map(() => false));
    expect(validation.validFlyTo).toEqual(validUids.map(() => true));
    expect(validation.validMinimaps).toEqual(validUids.map(() => true));
  },
);

test(
  "VERA Atlas removes camera motion when the platform requests it @vera-all-platforms",
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openVera(page, "atlas");

    await expect(page.locator("html")).toHaveClass(/vera-reduced-motion/);
    await expect(page.locator("[data-veramap], .mp").first()).toBeVisible({ timeout: 15_000 });
    const vectorMap = page.locator("[data-veramap]");
    if (await vectorMap.count()) {
      await expect(vectorMap).toHaveAttribute("data-veramap-motion", "reduced", {
        timeout: 15_000,
      });
      await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "enabled");
      await expect(vectorMap).toHaveAttribute("data-veramap-points", "price-score");
      await expectNoHorizontalOverflow(page);
    } else {
      await expect(page.locator(".mp-pin").first()).toBeVisible();
    }
  },
);

test(
  "VERA Atlas falls back cleanly when the open style is unavailable @vera-desktop",
  async ({ page }) => {
    await page.route("**/vera/assets/vendor/maplibre/style/liberty-local.json", (route) => route.abort());
    await openVera(page, "atlas");

    await expect(page.locator('.page[data-page="atlas"]')).toBeVisible();
    await expect(page.locator('.mp[role="img"][aria-label*="map" i]')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator(".mp-pin").first()).toBeVisible();
    await expect(page.locator("[data-veramap], .maplibregl-canvas")).toHaveCount(0);
  },
);

test(
  "VERA Atlas keeps MapLibre style assets first-party and opens an inspectable popup @vera-desktop",
  async ({ page }) => {
    const mapAssetRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.pathname.includes("/vera/assets/vendor/maplibre/style/") ||
        url.pathname.includes("/styles/liberty") ||
        /(?:sprite|glyph)/i.test(url.pathname)
      ) {
        mapAssetRequests.push(url.href);
      }
    });

    await openVera(page, "atlas");
    const vectorMap = page.locator("[data-veramap]");
    await expectOpenAtlasContract(page, vectorMap);
    await expect.poll(() =>
      mapAssetRequests.some((request) =>
        new URL(request).pathname.endsWith("/vera/assets/vendor/maplibre/style/liberty-local.json"),
      ),
    ).toBe(true);
    await expect.poll(() =>
      mapAssetRequests.some((request) =>
        /\/vera\/assets\/vendor\/maplibre\/style\/sprite\/ofm(?:@2x)?\.json$/.test(
          new URL(request).pathname,
        ),
      ),
    ).toBe(true);
    await expect.poll(() =>
      mapAssetRequests.some((request) =>
        new URL(request).pathname.includes("/vera/assets/vendor/maplibre/style/fonts/Noto%20Sans%20Bold/"),
      ),
    ).toBe(true);
    expect(
      mapAssetRequests.every((request) => {
        const url = new URL(request);
        return (
          url.origin === new URL(page.url()).origin &&
          url.pathname.startsWith("/vera/assets/vendor/maplibre/style/")
        );
      }),
      "MapLibre style, glyph, and sprite resources must stay under VERA's first-party vendor path",
    ).toBe(true);
    expect(
      mapAssetRequests.filter((request) => {
        const url = new URL(request);
        return url.origin !== new URL(page.url()).origin && /\/styles\/liberty/.test(url.pathname);
      }),
      "Atlas must not return to OpenFreeMap for its style document",
    ).toEqual([]);

    const canvas = vectorMap.locator(".maplibregl-canvas");
    await canvas.focus();
    await canvas.press("Enter");
    const popup = page.locator(".maplibregl-popup.vera-map-popup");
    await expect(popup).toBeVisible();
    const inspect = popup.getByRole("button", { name: "Inspect listing" });
    await expect(inspect).toBeVisible();
    await inspect.focus();
    await expect(inspect).toBeFocused();
    await inspect.press("Enter");
    await expect(page.getByRole("dialog", { name: /ledger|listing|rental/i })).toBeVisible();
  },
);

test(
  "VERA Atlas absorbs unfamiliar optional POI icons without console noise @vera-desktop",
  async ({ page }) => {
    const missingImageWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning" && /Image ".+" could not be loaded/.test(message.text())) {
        missingImageWarnings.push(message.text());
      }
    });

    await openVera(page, "atlas", { atlasMode: "list" });
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Boolean(
              (window as unknown as { __VERA_MAP_STYLE__?: { layers?: Array<unknown> } })
                .__VERA_MAP_STYLE__?.layers,
            ),
        ),
      )
      .toBe(true);
    await page.evaluate(() => {
      const style = (
        window as unknown as {
          __VERA_MAP_STYLE__: { layers: Array<Record<string, unknown>> };
        }
      ).__VERA_MAP_STYLE__;
      style.layers.push({
        id: "vera-test-missing-poi-icon",
        type: "symbol",
        source: "openmaptiles",
        "source-layer": "aerodrome_label",
        layout: { "icon-image": "vera-test-unfamiliar-poi" },
      });
    });

    await page.getByRole("button", { name: /^map(?: view)?$/i }).click();
    const vectorMap = page.locator("[data-veramap]");
    await expectOpenAtlasContract(page, vectorMap);
    await expect
      .poll(async () => Number(await vectorMap.getAttribute("data-veramap-image-fallbacks")))
      .toBeGreaterThan(0);
    expect(missingImageWarnings).toEqual([]);
  },
);

test(
  "VERA's listing minimap names walk and station context without a remote data request @vera-desktop",
  async ({ page }) => {
    const nonImageExternalRequests: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (request.resourceType() !== "image" && url.origin !== PREVIEW_ORIGIN) {
        nonImageExternalRequests.push(url.href);
      }
    });

    await openVera(page, "today");
    const minimap = page.locator(".dropcard__map .gm").first();
    await expect(minimap).toBeVisible();
    await expect(minimap).toHaveAttribute(
      "aria-label",
      /neighborhood map:.*nearest station.*minutes walk/i,
    );
    await expect(minimap).toContainText(/5 min radius.*10 min radius/i);
    await expect(minimap.locator("image, [href]")).toHaveCount(0);
    expect(
      nonImageExternalRequests,
      "the static minimap must not require a remote geocoder, route, or station request",
    ).toEqual([]);
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
  "VERA erases every local VERA workspace key only after confirmation @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "hunt");
    await page.evaluate(() => {
      localStorage.setItem("vera-cases", JSON.stringify({ one: { stage: "saved" } }));
      localStorage.setItem("vera-workspace", JSON.stringify({ atlasMode: "list" }));
      localStorage.setItem("vera-future-preference", "kept within VERA's namespace");
      localStorage.setItem("littlefight-consent", "must remain");
    });

    const begin = page.getByRole("button", { name: /erase my vera workspace/i });
    await expect(begin).toHaveAttribute("aria-expanded", "false");
    await begin.click();
    const confirm = page.getByRole("button", { name: /erase workspace now/i });
    await expect(confirm).toBeVisible();
    await expect(confirm).toBeFocused();
    expect(
      await page.evaluate(() => localStorage.getItem("vera-future-preference")),
      "the first step must never erase data",
    ).toBeTruthy();

    await confirm.click();
    await expect(page.locator("[data-erase-vera-status]")).toContainText(/workspace was erased/i);
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter((key) =>
            key?.startsWith("vera-"),
          ),
        ),
      )
      .toEqual([]);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("littlefight-consent")))
      .toBe("must remain");
  },
);

test(
  "VERA renders only allowlisted HTTPS feed URLs @vera-desktop",
  async ({ page }) => {
    const fixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    fixture.pool = fixture.pool.slice(0, 1).map((listing) => ({
      ...listing,
      source_url: "https://untrusted.example/listing",
      image_urls: ["https://images.craigslist.org/allowed.jpg", "https://untrusted.example/photo.jpg"],
    }));
    await mockVeraData(page, undefined, JSON.stringify(fixture));
    await page.goto("/vera/#/browse", { waitUntil: "domcontentloaded" });
    await waitForVera(page);

    await expect(page.locator('img[src*="untrusted.example"]')).toHaveCount(0);
    const opener = visibleListings(page).first();
    await expect(opener).toBeVisible();
    await opener.click();
    const inspector = page.getByRole("dialog", { name: /ledger|listing|rental/i });
    await expect(inspector).toBeVisible();
    await expect(inspector.getByRole("link", { name: /original/i })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const core = (window as unknown as {
            __VERAC?: { trustedURL: (value: string, kind: string) => string | null };
          }).__VERAC;
          return {
            script: core?.trustedURL("javascript:alert(1)", "listing"),
            credentials: core?.trustedURL("https://user:pass@newyork.craigslist.org/x", "listing"),
            port: core?.trustedURL("https://newyork.craigslist.org:8443/x", "listing"),
            approved: core?.trustedURL("https://newyork.craigslist.org/x", "listing"),
          };
        }),
      )
      .toEqual({
        script: null,
        credentials: null,
        port: null,
        approved: "https://newyork.craigslist.org/x",
      });
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
    await expect
      .poll(
        () =>
          page.evaluate(
            (listingUid) => document.activeElement?.getAttribute("data-open") === listingUid,
            uid,
          ),
        { message: "closing the inspector did not return focus to its ledger button" },
      )
      .toBe(true);
  },
);

test(
  "VERA gallery opens a keyboard-safe photo viewer @vera-desktop",
  async ({ page }) => {
    await openVera(page, "today");

    const gallery = page.locator("[data-gal]").first();
    const opener = gallery.getByRole("button", { name: /open photo 1 of \d+.*full screen/i });
    const count = Number(await gallery.getAttribute("data-gal-count"));
    expect(count, "the gallery needs multiple photos to verify viewer navigation").toBeGreaterThan(1);
    const backgroundBefore = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".shell > *")]
        .filter((element) => !element.matches("[data-lb]"))
        .map((element) => ({ ariaHidden: element.getAttribute("aria-hidden"), inert: element.inert })),
    );

    await opener.click();
    const viewer = page.getByRole("dialog", { name: "Photo viewer" });
    const status = viewer.locator("[data-lb-status]");
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveAttribute("aria-modal", "true");
    await expect(status).toHaveText(/photo 1 of \d+/i);
    await expect(viewer.getByRole("button", { name: /close the photo viewer/i })).toBeFocused();
    expect(
      await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>(".shell > *")]
          .filter((element) => !element.matches("[data-lb]"))
          .every((element) => element.inert && element.getAttribute("aria-hidden") === "true"),
      ),
      "the viewer must remove the product shell behind it from interaction and the accessibility tree",
    ).toBe(true);

    await viewer.getByRole("button", { name: /next photo/i }).click();
    await expect(status).toHaveText(/photo 2 of \d+/i);
    await page.keyboard.press("ArrowLeft");
    await expect(status).toHaveText(/photo 1 of \d+/i);
    await viewer.getByRole("button", { name: /previous photo/i }).click();
    await expect(status).toHaveText(new RegExp(`photo ${count} of ${count}`, "i"));
    await page.keyboard.press("ArrowRight");
    await expect(status).toHaveText(/photo 1 of \d+/i);

    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expectFocused(opener, "closing the viewer did not restore focus to its photo opener");
    expect(
      await page.evaluate((before) =>
        [...document.querySelectorAll<HTMLElement>(".shell > *")]
          .filter((element) => !element.matches("[data-lb]"))
          .every(
            (element, index) =>
              element.inert === before[index]?.inert &&
              element.getAttribute("aria-hidden") === before[index]?.ariaHidden,
          ),
      backgroundBefore),
      "closing the viewer did not restore the background state it found",
    ).toBe(true);
  },
);

test(
  "VERA photo viewer removes motion when the platform requests it @vera-desktop",
  async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openVera(page, "today");

    await page.locator("[data-gal]").first().getByRole("button", { name: /open photo 1 of \d+.*full screen/i }).click();
    const viewer = page.getByRole("dialog", { name: "Photo viewer" });
    await expect(viewer).toBeVisible();
    expect(
      await viewer.evaluate((element) => {
        const image = element.querySelector<HTMLElement>("[data-lb-img]");
        const viewerStyle = getComputedStyle(element);
        const imageStyle = image ? getComputedStyle(image) : null;
        return {
          imageAnimation: imageStyle?.animationName,
          imageTransition: imageStyle?.transitionDuration,
          viewerAnimation: viewerStyle.animationName,
          viewerTransition: viewerStyle.transitionDuration,
        };
      }),
    ).toEqual({
      imageAnimation: "none",
      imageTransition: "0s",
      viewerAnimation: "none",
      viewerTransition: "0s",
    });
  },
);

test(
  "VERA keeps the retired radar runtime absent and has no infinite decorative motion @vera-all-platforms",
  async ({ page }) => {
    await openVera(page, "today");

    await expect(page.locator('script[src*="vera-sweep.js"]')).toHaveCount(0);
    expect(await page.evaluate(() => "__VERAS" in window)).toBe(false);
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
      "status, background, and map decoration must settle instead of looping forever",
    ).toEqual([]);
  },
);

test(
  "VERA core workspaces pass automated WCAG 2.2 AA checks @vera-desktop",
  async ({ page }) => {
    await openVera(page, "today");

    const gallery = page.locator("[data-gal]").first();
    await expect(gallery).toBeVisible();
    await expect(gallery).toHaveAttribute("role", "region");
    await expect(gallery).toHaveAttribute("tabindex", "0");
    await expect(gallery).toHaveAttribute("aria-label", /left and right arrow keys.*previous and next buttons.*full screen/i);
    await expect(gallery).toHaveAttribute("data-gal-count", /[2-9]/);
    const galleryStatus = gallery.locator("xpath=following-sibling::*[@data-gal-status]");
    await expect(galleryStatus).toHaveText(/photo 1 of \d+.*arrow keys/i);
    await expect(gallery.getByRole("button", { name: /open photo 1 of \d+.*full screen/i }).first()).toBeVisible();
    await expect(gallery.locator("img").first()).toHaveAttribute("alt", "");
    expect(
      await gallery.evaluate((element) => element.closest("button") !== null),
      "the keyboard-focusable gallery must not be nested inside the ledger button",
    ).toBe(false);
    await gallery.focus();
    const initialScroll = await gallery.evaluate((element) => element.scrollLeft);
    await gallery.press("ArrowRight");
    await expect
      .poll(() => gallery.evaluate((element) => element.scrollLeft), {
        message: "ArrowRight did not move the listing gallery by one frame",
      })
      .toBeGreaterThan(initialScroll);
    await expect(galleryStatus).toHaveText(/photo 2 of \d+/i);

    const firstUid = await page.evaluate(
      () =>
        (
          window as unknown as {
            __vera?: { pool: () => Array<{ listing_uid?: string }> };
          }
        ).__vera?.pool()[0]?.listing_uid ?? null,
    );
    if (!firstUid) throw new Error("The VERA fixture has no listing for the Hunt contrast check");
    await page.evaluate((uid) => {
      (
        window as unknown as {
          __VERA_APP?: { setStage: (listingUid: string, stage: string) => void };
        }
      ).__VERA_APP?.setStage(uid, "saved");
    }, firstUid);

    const routes = ["today", "market", "browse", "atlas", "hunt", "manual", "archive", "system"];
    for (const route of routes) {
      await page.evaluate((nextRoute) => {
        window.location.hash = `#/${nextRoute}`;
      }, route);
      await expect(page.locator(`.page[data-page="${route}"]`)).toBeVisible();

      if (route === "browse") {
        const row = page.locator("tbody tr[data-listing-row]").first();
        await expect(row).not.toHaveAttribute("tabindex", /.+/);
        await expect(row).not.toHaveAttribute("data-open", /.+/);
        await expect(row).not.toHaveAttribute(
          "aria-expanded",
          /.+/,
        );
        await expect(row.getByRole("button", { name: /open ledger for/i })).toHaveCount(1);
      }
      if (route === "archive") await expect(page.locator("#main")).toHaveAttribute("tabindex", "0");
      if (route === "system") {
        await page.locator(".src").first().evaluate((element) => element.classList.add("is-off"));
      }

      const result = await new AxeBuilder({ page })
        .include("#main")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const violations = result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target),
      }));
      expect(violations, `${route} has automated WCAG 2.2 AA violations`).toEqual([]);
    }
  },
);

test(
  "VERA gallery does not present a numeric address fragment as a location @vera-desktop",
  async ({ page }) => {
    const fixture = JSON.parse(VERA_FEED_FIXTURE) as { pool: Array<Record<string, unknown>> };
    fixture.pool = fixture.pool.slice(0, 1).map((listing) => ({
      ...listing,
      address_normalized: "319",
      address_raw: "319",
    }));
    await mockVeraData(page, undefined, JSON.stringify(fixture));
    await page.goto("/vera/#/today", { waitUntil: "domcontentloaded" });
    await waitForVera(page);

    const gallery = page.locator("[data-gal]").first();
    await expect(gallery).toBeVisible();
    await expect(gallery).not.toHaveAttribute("aria-label", /\b319\b/);
    await expect(gallery.getByRole("button", { name: /open photo 1 of \d+/i }).first()).not.toHaveAccessibleName(/\b319\b/);
  },
);

test(
  "VERA public documents share one accessible identity and metadata contract @vera-desktop",
  async ({ page }) => {
    test.slow();
    const documents = [
      ["/vera/brand/", "VERA looks like the instrument it is."],
      ["/vera/privacy/", "Your hunt stays yours."],
      ["/vera/terms/", "An instrument, not an agent."],
      ["/vera/corrections/", "Corrections"],
      ["/vera/manual/", "Field manual"],
      ["/vera/archive/", "Receipts"],
    ] as const;

    for (const [path, heading] of documents) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.locator('.skip-link[href="#main"]')).toHaveCount(1);
      await expect(page.locator('.docbar__brand img[src*="vera-mark-96.png"]')).toHaveCount(1);
      await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute("href", /doc\.css\?v=2$/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://littlefightnyc.com${path}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        "content",
        `https://littlefightnyc.com${path}`,
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      await expect(page.locator("svg .sweep, [class*='radar']")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.getAnimations().filter((animation) => {
            if (animation.playState !== "running") return false;

            // The site-wide Little Fight credit is the sole approved animation;
            // every other running animation could reintroduce the retired radar.
            const target = animation.effect instanceof KeyframeEffect
              ? animation.effect.target
              : null;
            return !target?.closest(".lfc");
          }).length,
        ),
        `${path} must not revive the retired looping radar`,
      ).toBe(0);

      const result = await new AxeBuilder({ page })
        .include("body")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(
        result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          targets: violation.nodes.map((node) => node.target),
        })),
        `${path} has automated WCAG 2.2 AA violations`,
      ).toEqual([]);
      await expectNoHorizontalOverflow(page);
    }
  },
);

test(
  "VERA exact-address lookup times out safely and restores retry @vera-desktop",
  async ({ page }) => {
    await mockVeraData(page);
    await page.route("**/assets/js/vera-tests.js*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "window.__VERAT={run:function(){}};",
      });
    });
    await page.goto("/vera/?test=1#/today", { waitUntil: "domcontentloaded" });
    await waitForVera(page);

    await page.evaluate(() => {
      const nativeFetch = window.fetch.bind(window);
      document.documentElement.dataset.addressAbort = "false";
      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const raw =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : input.url;
        const url = new URL(raw, window.location.href);
        if (url.hostname === "geosearch.planninglabs.nyc") {
          return new Promise<Response>((_resolve, reject) => {
            const abort = () => {
              document.documentElement.dataset.addressAbort = "true";
              reject(new DOMException("The operation was aborted.", "AbortError"));
            };
            if (init?.signal?.aborted) abort();
            else init?.signal?.addEventListener("abort", abort, { once: true });
          });
        }
        return nativeFetch(input, init);
      };
    });

    const uid = await page.evaluate(() => {
      const vera = window as unknown as {
        __VERA_APP?: { POOL: () => Array<{ listing_uid?: string }> };
        __VERAC?: { needsVerify: (listing: unknown) => boolean };
      };
      const listing = vera.__VERA_APP?.POOL().find((item) => vera.__VERAC?.needsVerify(item));
      return listing?.listing_uid ?? null;
    });
    if (!uid) throw new Error("The VERA fixture has no unverified listing for the address check");
    await page.evaluate((listingUid) => {
      (
        window as unknown as {
          __VERAL?: { open: (openUid: string) => void };
        }
      ).__VERAL?.open(listingUid);
    }, uid);

    const inspector = page.locator("[data-inspector]");
    await expect(inspector).toBeVisible();
    await inspector.getByRole("tab", { name: "Verify" }).click();
    const form = inspector.locator("[data-address-check]");
    await expect(form).toBeVisible();
    await form.locator('input[name="vera-address"]').fill("120 Broadway, Manhattan");
    const submit = form.getByRole("button", { name: /check with nyc planning/i });
    await submit.click();

    const result = form.locator("[data-address-result]");
    await expect(result).toContainText("NYC Planning took too long to respond", { timeout: 3_000 });
    await expect(result).toContainText("No address was saved");
    await expect(result).toContainText("try again");
    await expect(page.locator("html")).toHaveAttribute("data-address-abort", "true");
    await expect(submit).toBeEnabled();
    await expect(submit).toHaveText("Check with NYC Planning");
  },
);

test(
  "VERA touch chrome respects safe areas and 44px targets @vera-touch",
  async ({ page }, testInfo) => {
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
    const filterTargets = [
      bracket.getByRole("button").first(),
      bracket.getByRole("button").last(),
    ];

    for (const target of filterTargets) await expectMinimumTouchTarget(target);

    await closeVisibleFilterSheet(page);

    const navTargets = [
      page
        .getByRole("navigation", { name: /sections/i })
        .getByRole("link", { name: /^browse$/i }),
      page
        .getByRole("navigation", { name: /sections/i })
        .getByRole("link", { name: /^my hunt/i }),
    ];
    for (const target of navTargets) await expectMinimumTouchTarget(target);

    const atlasLink = page
      .getByRole("navigation", { name: /sections/i })
      .getByRole("link", { name: /^atlas$/i });
    await atlasLink.click();
    await expect(page.locator('.page[data-page="atlas"]')).toBeVisible();

    const mapMode = page.getByRole("button", { name: /^map(?: view)?$/i });
    const listMode = page.getByRole("button", { name: /^list(?: view)?$/i });
    await expectMinimumTouchTarget(mapMode);
    await expectMinimumTouchTarget(listMode);

    await expect(page.locator("[data-veramap], .mp").first()).toBeVisible({ timeout: 15_000 });
    const vectorMap = page.locator("[data-veramap]");
    if (await vectorMap.count()) {
      await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "enabled", {
        timeout: 15_000,
      });
      await expect(vectorMap).toHaveAttribute("data-veramap-points", "price-score");
      await expectMinimumTouchTarget(vectorMap.locator(".maplibregl-ctrl-zoom-in"));
      await expectMinimumTouchTarget(vectorMap.locator(".maplibregl-ctrl-zoom-out"));
      const attributionButton = vectorMap.locator(".maplibregl-ctrl-attrib-button");
      if ((await attributionButton.count()) && (await attributionButton.isVisible())) {
        await expectMinimumTouchTarget(attributionButton);
      }

      if (testInfo.project.name === "webkit-mobile") {
        const attribution = vectorMap.locator(".maplibregl-ctrl-attrib");
        const attributionInner = attribution.locator(".maplibregl-ctrl-attrib-inner");
        await expect(attribution).toBeVisible();
        await expect(attributionButton).toBeVisible();
        if (!(await attributionInner.isVisible())) await attributionButton.click();
        await expect(attributionInner).toBeVisible();
        await expect
          .poll(
            () =>
              attribution.evaluate((control) => {
                const epsilon = 1;
                const controlRect = control.getBoundingClientRect();
                return [
                  ...document.querySelectorAll<HTMLElement>(
                    ".mastnav__zone, .filter-dock, .maplibregl-ctrl-top-right .maplibregl-ctrl-group",
                  ),
                ]
                  .filter((zone) => {
                    const style = getComputedStyle(zone);
                    const rect = zone.getBoundingClientRect();
                    return (
                      style.display !== "none" &&
                      style.visibility !== "hidden" &&
                      Number(style.opacity) > 0 &&
                      rect.width > 0 &&
                      rect.height > 0
                    );
                  })
                  .map((zone) => {
                    const zoneRect = zone.getBoundingClientRect();
                    return {
                      className: zone.className,
                      overlapHeight:
                        Math.min(controlRect.bottom, zoneRect.bottom) -
                        Math.max(controlRect.top, zoneRect.top),
                      overlapWidth:
                        Math.min(controlRect.right, zoneRect.right) -
                        Math.max(controlRect.left, zoneRect.left),
                    };
                  })
                  .filter(
                    ({ overlapHeight, overlapWidth }) =>
                      overlapHeight > epsilon && overlapWidth > epsilon,
                  );
              }),
            {
              message:
                "Open map attribution overlaps visible iPhone application or MapLibre navigation controls",
            },
          )
          .toEqual([]);
        await expect
          .poll(
            () =>
              attribution.evaluate((control) => {
                const epsilon = 1;
                const button = control.querySelector<HTMLElement>(
                  ".maplibregl-ctrl-attrib-button",
                );
                const inner = control.querySelector<HTMLElement>(
                  ".maplibregl-ctrl-attrib-inner",
                );
                if (!button || !inner) return [{ missingAttributionPart: true }];
                const buttonRect = button.getBoundingClientRect();
                const innerRect = inner.getBoundingClientRect();
                const overlapHeight =
                  Math.min(buttonRect.bottom, innerRect.bottom) -
                  Math.max(buttonRect.top, innerRect.top);
                const overlapWidth =
                  Math.min(buttonRect.right, innerRect.right) -
                  Math.max(buttonRect.left, innerRect.left);
                return overlapHeight > epsilon && overlapWidth > epsilon
                  ? [{ overlapHeight, overlapWidth }]
                  : [];
              }),
            {
              message:
                "Open map attribution disclosure button overlaps its visible credit text",
            },
          )
          .toEqual([]);
      }
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

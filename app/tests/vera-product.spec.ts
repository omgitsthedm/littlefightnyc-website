import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const VERA_FEED_FIXTURE = readFileSync(
  new URL("./fixtures/vera-feed.json", import.meta.url),
  "utf8",
);

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
  latitude?: number | null;
  listing_uid?: string;
  longitude?: number | null;
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
) {
  // Stub the first-party public feed before VERA or a newly claiming service
  // worker can request it. The product remains read-only throughout the flow.
  await page.addInitScript(({ fixture, workspace }) => {
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
        return new Response("[]", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return nativeFetch(input, init);
    };
  }, { fixture, workspace: workspaceSeed ?? null });
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
  await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "disabled");
  await expect(vectorMap).toHaveAttribute("data-veramap-points", "unclustered");
  await expect(vectorMap).toHaveAttribute("data-veramap-streets", /^(?:detailed|vector)$/);
  await expect(vectorMap).toHaveAttribute("data-veramap-buildings", /^(?:3d|footprints)$/);
  await expect(vectorMap).toHaveAttribute("data-veramap-motion", /^(?:standard|reduced)$/);
  await expect(vectorMap.locator(".maplibregl-canvas")).toBeVisible();

  await expect
    .poll(
      async () => Number((await vectorMap.getAttribute("data-veramap-listings")) ?? "0"),
      {
        timeout: 15_000,
        message: "Atlas did not publish the count loaded into its unclustered listing source",
      },
    )
    .toBeGreaterThan(0);
  await expect
    .poll(
      async () => Number((await vectorMap.getAttribute("data-veramap-features")) ?? "0"),
      {
        timeout: 15_000,
        message: "Atlas loaded its map shell but rendered no unclustered listing points",
      },
    )
    .toBeGreaterThan(0);
  await expect(vectorMap).toHaveAttribute("data-veramap-ready", "true", {
    timeout: 15_000,
  });
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

    const mapMode = page.getByRole("button", { name: /^map(?: view)?$/i });
    const listMode = page.getByRole("button", { name: /^list(?: view)?$/i });
    await expect(mapMode).toBeVisible();
    await expect(listMode).toBeVisible();
    await expectSelected(listMode);
    await expect(page.locator(".atlas-layout")).toHaveClass(/atlas-layout--list/);
    await expect(page.locator("[data-veramap], .maplibregl-canvas")).toHaveCount(0);
    await expect(page.locator('script[src*="maplibre-gl"]')).toHaveCount(0);

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
      const mapped = scoped.filter(
        (listing) => listing.latitude != null && listing.longitude != null,
      );
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
      await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "disabled");
      await expect(vectorMap).toHaveAttribute("data-veramap-points", "unclustered");
      await expectNoHorizontalOverflow(page);
    } else {
      await expect(page.locator(".mp-pin").first()).toBeVisible();
    }
  },
);

test(
  "VERA Atlas falls back cleanly when the open style is unavailable @vera-desktop",
  async ({ page }) => {
    await page.route("**/styles/liberty*", (route) => route.abort());
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
    await expect(gallery).toHaveAttribute("aria-label", /left and right arrow keys/i);
    await expect(gallery).toHaveAttribute("data-gal-count", /[2-9]/);
    const galleryStatus = gallery.locator("xpath=following-sibling::*[@data-gal-status]");
    await expect(galleryStatus).toHaveText(/photo 1 of \d+.*arrow keys/i);
    await expect(gallery.locator("img").first()).toHaveAttribute("alt", /photo 1 of \d+ for/i);
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
    await expect(gallery.locator("img").first()).not.toHaveAttribute("alt", /\b319\b/);
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
          () => document.getAnimations().filter((animation) => animation.playState === "running").length,
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

    for (const target of targets) await expectMinimumTouchTarget(target);

    await closeVisibleFilterSheet(page);

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
      await expect(vectorMap).toHaveAttribute("data-veramap-clusters", "disabled", {
        timeout: 15_000,
      });
      await expect(vectorMap).toHaveAttribute("data-veramap-points", "unclustered");
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

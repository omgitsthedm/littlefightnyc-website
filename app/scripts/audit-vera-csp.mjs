/**
 * audit-vera-csp — /vera/ gets its own CSP, and it must stay in step with the
 * site's.
 *
 * VERA is a public Little Fight product with one browser-side data contract:
 * /vera/data/. Netlify proxies those same-origin URLs to the engine's sanitized
 * cloud publication, so neither the publication host nor the retired standalone
 * dashboard belongs in browser code or connect-src.
 *
 * VERA renders MapLibre tiles, optionally queries the official NYC
 * Planning GeoSearch origin after a visitor submits an exact address, and uses
 * blob-backed images/workers for its map and offline runtime. Netlify replaces
 * headers per path rather than merging them, so the /vera/* block starts from
 * the "/*" policy but deliberately drops the analytics origins VERA does not
 * use. Copies rot: a directive tightened sitewide could silently not apply to
 * /vera/.
 *
 * So this asserts the two policies differ by exactly those named runtime
 * capabilities, in exactly their named directives, and nothing else.
 *
 * This also verifies the three exact same-origin data rewrites, the edge
 * response directive required because Netlify custom headers do not apply to
 * external proxies, and rejects an external feed URL in vera-app.js.
 * Production response and freshness checks remain part of the live release
 * gate.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const TILE_ORIGIN = "https://tiles.openfreemap.org";
const GEOSEARCH_ORIGIN = "https://geosearch.planninglabs.nyc";
const CLOUD_FEED_BASE =
  "https://raw.githubusercontent.com/omgitsthedm/vera-apartment-search/feed";
const EXTERNAL_BROWSER_FEED_ORIGINS = [
  "https://vera-pipeline.netlify.app",
  "https://raw.githubusercontent.com",
];
const VERA_ONLY_ADDITIONS = {
  "img-src": ["blob:"],
  "connect-src": [TILE_ORIGIN, GEOSEARCH_ORIGIN],
  "worker-src": ["'self'", "blob:"],
  "child-src": ["blob:"],
  "object-src": ["'none'"],
};
const VERA_ONLY_REMOVALS = {
  "script-src": [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ],
  "connect-src": [
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
  ],
};
const failures = [];

const toml = await readFile(path.join(repoRoot, "netlify.toml"), "utf8");
const redirects = await readFile(
  path.join(appRoot, "public", "_redirects"),
  "utf8",
);
const veraDataEdge = await readFile(
  path.join(repoRoot, "netlify", "edge-functions", "vera-data-robots.ts"),
  "utf8",
);

function policyFor(pathPattern) {
  const escaped = pathPattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = toml.match(
    new RegExp(`for = "${escaped}"[\\s\\S]*?Content-Security-Policy = "([^"]+)"`),
  );
  return block?.[1] ?? null;
}

const sitePolicy = policyFor("/*");
const veraPolicy = policyFor("/vera/*");

if (!sitePolicy) {
  failures.push('netlify.toml: no Content-Security-Policy found for "/*"');
}
if (!veraPolicy) {
  failures.push(
    'netlify.toml: /vera/* has no Content-Security-Policy block. Without it /vera/ ' +
      "inherits the site policy, which does not include VERA's map, address, blob, " +
      "and worker capabilities.",
  );
}

if (sitePolicy && veraPolicy) {
  const directives = (policy) =>
    Object.fromEntries(
      policy
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const [name, ...values] = part.split(/\s+/);
          return [name, values];
        }),
    );

  const site = directives(sitePolicy);
  const vera = directives(veraPolicy);

  const names = new Set([
    ...Object.keys(site),
    ...Object.keys(vera),
    ...Object.keys(VERA_ONLY_ADDITIONS),
    ...Object.keys(VERA_ONLY_REMOVALS),
  ]);
  for (const name of names) {
    const siteValues = new Set(site[name] ?? []);
    const veraValues = new Set(vera[name] ?? []);
    const added = [...veraValues].filter((v) => !siteValues.has(v));
    const dropped = [...siteValues].filter((v) => !veraValues.has(v));
    const expectedAdded = new Set(VERA_ONLY_ADDITIONS[name] ?? []);
    const expectedDropped = new Set(VERA_ONLY_REMOVALS[name] ?? []);
    const unexpected = added.filter((value) => !expectedAdded.has(value));
    const missing = [...expectedAdded].filter((value) => !veraValues.has(value));
    const unexpectedDropped = dropped.filter(
      (value) => !expectedDropped.has(value),
    );
    const retained = [...expectedDropped].filter((value) =>
      veraValues.has(value),
    );

    if (
      unexpected.length > 0 ||
      missing.length > 0 ||
      unexpectedDropped.length > 0 ||
      retained.length > 0
    ) {
      failures.push(
        `netlify.toml: /vera/* ${name} has drifted from the site policy` +
          (unexpected.length ? ` (unexpectedly adds ${unexpected.join(", ")})` : "") +
          (missing.length ? ` (must add ${missing.join(", ")})` : "") +
          (unexpectedDropped.length
            ? ` (unexpectedly drops ${unexpectedDropped.join(", ")})`
            : "") +
          (retained.length
            ? ` (must drop ${retained.join(", ")})`
            : ""),
      );
    }
  }
}

for (const name of ["public", "archive", "meta"]) {
  const endpoint = `/vera/data/${name}.json`;
  if (!veraDataEdge.includes(`"${endpoint}"`)) {
    failures.push(`vera-data-robots.ts: missing exact edge path ${endpoint}`);
  }
}
if (!/await\s+context\.next\(\s*\)/.test(veraDataEdge)) {
  failures.push(
    "vera-data-robots.ts must fetch a complete upstream feed rather than forwarding a bodyless conditional revalidation",
  );
}
if (
  !/response\.headers\.set\(\s*"X-Robots-Tag"\s*,\s*"noindex, nofollow"\s*\)/.test(
    veraDataEdge,
  )
) {
  failures.push(
    "vera-data-robots.ts must set X-Robots-Tag to noindex, nofollow",
  );
}
if (
  !/"Netlify-CDN-Cache-Control"\s*,\s*"public, max-age=300, stale-while-revalidate=129600"/.test(
    veraDataEdge,
  )
) {
  failures.push(
    "vera-data-robots.ts must keep a five-minute CDN freshness window and 36-hour stale-while-revalidate safety net",
  );
}
if (!/cache:\s*"manual"/.test(veraDataEdge)) {
  failures.push("vera-data-robots.ts must opt in to Netlify's manual edge response cache");
}

const normalizedRedirects = new Set(
  redirects
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/).join(" ")),
);
for (const name of ["public", "archive", "meta"]) {
  const rule =
    "/vera/data/" +
    name +
    ".json " +
    CLOUD_FEED_BASE +
    "/" +
    name +
    ".json 200!";
  if (!normalizedRedirects.has(rule)) {
    failures.push("app/public/_redirects: missing exact VERA data rewrite: " + rule);
  }
}
if (redirects.includes("vera-pipeline.netlify.app")) {
  failures.push(
    "app/public/_redirects still routes VERA through the retired Netlify project",
  );
}

// Browser feed, map, and address dependencies must match the policy.
const veraAppJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera-app.js"),
  "utf8",
);
const veraCoreJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera-core.js"),
  "utf8",
);
const veraMapStyleText = await readFile(
  path.join(
    appRoot,
    "public",
    "vera",
    "assets",
    "vendor",
    "maplibre",
    "style",
    "liberty-local.json",
  ),
  "utf8",
);
const veraPrerender = await readFile(
  path.join(appRoot, "scripts", "vera-prerender.mjs"),
  "utf8",
);
const veraIndex = await readFile(
  path.join(appRoot, "public", "vera", "index.html"),
  "utf8",
);
const veraCss = await readFile(
  path.join(appRoot, "public", "vera", "assets", "css", "vera.css"),
  "utf8",
);
const veraServiceWorker = await readFile(
  path.join(appRoot, "public", "vera", "sw.js"),
  "utf8",
);
const veraCssHref = veraIndex.match(
  /<link rel="stylesheet" href="\.\/assets\/css\/vera\.css\?v=(\d+)">/,
);
if (!/<a class="skip-link" href="#main">Skip to content<\/a>/.test(veraIndex)) {
  failures.push(
    "index.html must keep the root VERA skip link ahead of the application shell",
  );
}
if (
  !/\.skip-link\s*\{[^}]*position:\s*fixed[^}]*opacity:\s*0[^}]*\}/s.test(
    veraCss,
  ) ||
  !/\.skip-link:focus\s*\{[^}]*opacity:\s*1[^}]*\}/s.test(veraCss)
) {
  failures.push(
    "vera.css must keep the skip link in the viewport and reveal it on keyboard focus",
  );
}
if (
  !/e\.key === 'Tab' && !e\.shiftKey && document\.activeElement === document\.body[\s\S]{0,240}skip\.focus\(\)/.test(
    veraAppJs,
  )
) {
  failures.push(
    "vera-app.js must preserve the explicit first-Tab handoff to the root skip link",
  );
}
if (
  !veraCssHref ||
  !veraServiceWorker.includes(
    `/vera/assets/css/vera.css?v=${veraCssHref[1]}`,
  )
) {
  failures.push(
    "VERA's service-worker shell list must cache the same versioned CSS that index.html loads",
  );
}
if (!veraAppJs.includes("{ url: './data/public.json', label: 'site' }")) {
  failures.push(
    "vera-app.js must declare the one first-party ./data/public.json feed",
  );
}
if (
  !veraCoreJs.includes("function trustedURL") ||
  !veraCoreJs.includes("TRUSTED_URL_HOSTS") ||
  !veraAppJs.includes("trustedURL(urls[i], 'image')")
) {
  failures.push(
    "VERA public feed URL handling must parse HTTPS URLs through the narrow trusted host allowlist before rendering external images or links",
  );
}
if (
  !veraPrerender.includes("VERA_FEED_REVISION") ||
  !veraPrerender.includes("resolveFeedRevision") ||
  veraPrerender.includes("vera-apartment-search/feed/archive.json")
) {
  failures.push(
    "vera-prerender.mjs must resolve and use one immutable VERA feed revision per build, with VERA_FEED_REVISION as the explicit replay override",
  );
}
for (const origin of EXTERNAL_BROWSER_FEED_ORIGINS) {
  if (veraAppJs.includes(origin)) {
    failures.push("vera-app.js must not reference external feed origin " + origin);
  }
}
if (!veraAppJs.includes(GEOSEARCH_ORIGIN)) {
  failures.push(
    `vera-app.js no longer references ${GEOSEARCH_ORIGIN} — if exact-address lookup changed, ` +
      "update the exact /vera/* connect-src exception with it",
  );
}
const exactMapStyleDeclaration =
  /mapStyleURL\s*=\s*["']\.\/assets\/vendor\/maplibre\/style\/liberty-local\.json["']/;
const exactMapPreconnectDeclaration =
  /origin\.href\s*=\s*["']https:\/\/tiles\.openfreemap\.org["']/;
if (
  !exactMapStyleDeclaration.test(veraAppJs) ||
  !exactMapPreconnectDeclaration.test(veraAppJs)
) {
  failures.push(
    `vera-app.js must load the exact first-party Liberty style and preconnect only to ${TILE_ORIGIN} — ` +
      "update the exact /vera/* connect-src exception if the tile source changes",
  );
}

let veraMapStyle;
try {
  veraMapStyle = JSON.parse(veraMapStyleText);
} catch {
  failures.push("liberty-local.json must remain valid JSON");
}
if (veraMapStyle) {
  const expectedSprite = "/vera/assets/vendor/maplibre/style/sprite/ofm";
  const expectedGlyphs =
    "/vera/assets/vendor/maplibre/style/fonts/{fontstack}/{range}.pbf";
  if (veraMapStyle.sprite !== expectedSprite) {
    failures.push("liberty-local.json must serve its sprite from the first-party VERA path");
  }
  if (veraMapStyle.glyphs !== expectedGlyphs) {
    failures.push("liberty-local.json must serve its glyphs from the first-party VERA path");
  }
  const remoteStyleUrls = [];
  const collectUrls = (value) => {
    if (typeof value === "string" && /^https:\/\//.test(value)) {
      remoteStyleUrls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(collectUrls);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(collectUrls);
    }
  };
  collectUrls(veraMapStyle.sources);
  if (remoteStyleUrls.length === 0) {
    failures.push("liberty-local.json must declare its explicit remote tile source");
  }
  for (const url of remoteStyleUrls) {
    if (new URL(url).origin !== TILE_ORIGIN) {
      failures.push(
        `liberty-local.json references unapproved remote source ${url}`,
      );
    }
  }
}

const veraMapJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera-map.js"),
  "utf8",
);
const trustedMapHostGuard =
  /parsed\.hostname\s*!==\s*["']tiles\.openfreemap\.org["']/;
if (!trustedMapHostGuard.test(veraMapJs)) {
  failures.push(
    "vera-map.js no longer validates tiles.openfreemap.org as its exact trusted map host — if the map " +
      "source changed, update its runtime URL guard with the CSP exception",
  );
}

if (failures.length > 0) {
  console.error("VERA CSP audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "VERA CSP audit passed: one first-party feed contract, exact data rewrites, edge-enforced data noindex, and only the map, address, blob, and worker capabilities VERA uses.",
);

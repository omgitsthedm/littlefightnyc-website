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
 * headers per path rather than merging them, so the /vera/* block is a full
 * copy of the "/*" policy. Copies
 * rot: a directive tightened sitewide could silently not apply to /vera/.
 *
 * So this asserts the two policies differ by exactly those named runtime
 * capabilities, in exactly their named directives, and nothing else.
 *
 * This also verifies the three exact same-origin data rewrites and rejects an
 * external feed URL in vera-app.js. Production response and freshness checks
 * remain part of the live release gate.
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
};
const failures = [];

const toml = await readFile(path.join(repoRoot, "netlify.toml"), "utf8");
const redirects = await readFile(
  path.join(appRoot, "public", "_redirects"),
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
  ]);
  for (const name of names) {
    const siteValues = new Set(site[name] ?? []);
    const veraValues = new Set(vera[name] ?? []);
    const added = [...veraValues].filter((v) => !siteValues.has(v));
    const dropped = [...siteValues].filter((v) => !veraValues.has(v));
    const expectedAdded = new Set(VERA_ONLY_ADDITIONS[name] ?? []);
    const unexpected = added.filter((value) => !expectedAdded.has(value));
    const missing = [...expectedAdded].filter((value) => !added.includes(value));

    if (unexpected.length > 0 || missing.length > 0 || dropped.length > 0) {
      failures.push(
        `netlify.toml: /vera/* ${name} has drifted from the site policy` +
          (unexpected.length ? ` (unexpectedly adds ${unexpected.join(", ")})` : "") +
          (missing.length ? ` (must add ${missing.join(", ")})` : "") +
          (dropped.length ? ` (drops ${dropped.join(", ")})` : ""),
      );
    }
  }
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
if (!veraAppJs.includes("{ url: './data/public.json', label: 'site' }")) {
  failures.push(
    "vera-app.js must declare the one first-party ./data/public.json feed",
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

const veraMapJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera-map.js"),
  "utf8",
);
if (!veraMapJs.includes(TILE_ORIGIN)) {
  failures.push(
    `vera-map.js no longer references ${TILE_ORIGIN} — if the map source changed, update ` +
      "the exact /vera/* connect-src exception with it",
  );
}

if (failures.length > 0) {
  console.error("VERA CSP audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "VERA CSP audit passed: one first-party feed contract, exact data rewrites, and only the map, address, blob, and worker capabilities VERA uses.",
);

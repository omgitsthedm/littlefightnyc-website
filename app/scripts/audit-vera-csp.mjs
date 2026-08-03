/**
 * audit-vera-csp — /vera/ gets its own CSP, and it must stay in step with the
 * site's.
 *
 * VERA falls back to fetching its feed straight from the pipeline origin when
 * the _redirects proxy hop fails. That is the single failure the redundancy
 * exists for, and connect-src did not allow the origin, so the fallback was
 * refused by CSP every time — the app had one path to its data while appearing
 * to have two. Nothing failed, because nothing exercises the fallback until the
 * proxy is already broken, which is exactly when nobody is reading logs.
 *
 * VERA also renders MapLibre tiles and uses blob-backed images/workers for its
 * map and offline runtime. Netlify replaces headers per path rather than
 * merging them, so the /vera/* block is a full copy of the "/*" policy. Copies
 * rot: a directive tightened sitewide could silently not apply to /vera/.
 *
 * So this asserts the two policies differ by exactly those named runtime
 * capabilities, in exactly their named directives, and nothing else.
 *
 * Scope, stated plainly: this proves the CSP permits the fallback. It does NOT
 * prove the fallback works. As of 2026-07-30 it still does not — the pipeline
 * origin sends no Access-Control-Allow-Origin header, so the browser blocks the
 * response after CSP allows the request. That half is logged as VERA-CORS-001
 * and has to be fixed on the other site.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const PIPELINE_ORIGIN = "https://vera-pipeline.netlify.app";
const TILE_ORIGIN = "https://tiles.openfreemap.org";
const VERA_ONLY_ADDITIONS = {
  "img-src": ["blob:"],
  "connect-src": [PIPELINE_ORIGIN, TILE_ORIGIN],
  "worker-src": ["'self'", "blob:"],
  "child-src": ["blob:"],
};
const failures = [];

const toml = await readFile(path.join(repoRoot, "netlify.toml"), "utf8");

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
      "inherits the site policy, whose connect-src does not allow the pipeline origin, " +
      "and the feed fallback is refused every time it is needed.",
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

// The feed and map origins must still be the things the policy is allowing.
const veraAppJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera-app.js"),
  "utf8",
);
if (!veraAppJs.includes(PIPELINE_ORIGIN)) {
  failures.push(
    `vera-app.js no longer references ${PIPELINE_ORIGIN} — if the fallback is gone, drop the ` +
      "/vera/* CSP exception with it rather than leaving the origin allowed for nothing",
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
  "VERA CSP audit passed: /vera/* has only the exact feed, map, blob, and worker capabilities its runtime uses.",
);

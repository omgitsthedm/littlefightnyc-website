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
 * Netlify replaces headers per path rather than merging them, so the /vera/*
 * block is a full copy of the "/*" policy. Copies rot: a directive tightened
 * sitewide would silently not apply to /vera/, which is the part of the site
 * that renders third-party listing photos and talks to an external origin.
 *
 * So this asserts the two policies differ by exactly the pipeline origin, in
 * exactly connect-src, and nothing else.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const PIPELINE_ORIGIN = "https://vera-pipeline.netlify.app";
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

  const names = new Set([...Object.keys(site), ...Object.keys(vera)]);
  for (const name of names) {
    const siteValues = new Set(site[name] ?? []);
    const veraValues = new Set(vera[name] ?? []);
    const added = [...veraValues].filter((v) => !siteValues.has(v));
    const dropped = [...siteValues].filter((v) => !veraValues.has(v));

    if (name === "connect-src") {
      if (!veraValues.has(PIPELINE_ORIGIN)) {
        failures.push(
          `netlify.toml: /vera/* connect-src is missing ${PIPELINE_ORIGIN}, so the feed ` +
            "fallback cannot fire",
        );
      }
      const unexpected = added.filter((v) => v !== PIPELINE_ORIGIN);
      if (unexpected.length > 0) {
        failures.push(
          `netlify.toml: /vera/* connect-src adds ${unexpected.join(", ")} beyond the ` +
            "pipeline origin — widen the site policy instead, or say why here",
        );
      }
    } else if (added.length > 0 || dropped.length > 0) {
      failures.push(
        `netlify.toml: /vera/* ${name} has drifted from the site policy` +
          (added.length ? ` (adds ${added.join(", ")})` : "") +
          (dropped.length ? ` (drops ${dropped.join(", ")})` : ""),
      );
    }
  }
}

// The fallback must still be the thing the policy is allowing.
const veraJs = await readFile(
  path.join(appRoot, "public", "vera", "assets", "js", "vera.js"),
  "utf8",
);
if (!veraJs.includes(PIPELINE_ORIGIN)) {
  failures.push(
    `vera.js no longer references ${PIPELINE_ORIGIN} — if the fallback is gone, drop the ` +
      "/vera/* CSP exception with it rather than leaving the origin allowed for nothing",
  );
}

if (failures.length > 0) {
  console.error("VERA CSP audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "VERA CSP audit passed: /vera/* matches the site policy except for the pipeline origin in connect-src.",
);

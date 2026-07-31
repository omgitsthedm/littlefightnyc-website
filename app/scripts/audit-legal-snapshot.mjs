#!/usr/bin/env node
/**
 * The legal snapshot must keep saying what the legal page says.
 *
 * src/pages/Legal.tsx renders the privacy policy and terms; prerender-seo.mjs
 * carries a hand-mirrored copy so the text exists before React hydrates. Two
 * copies of the same policy drift, and this pair drifts silently: adding a
 * section to Legal.tsx changes what visitors read while the crawler-visible
 * HTML keeps serving the older, shorter policy. Nothing fails, and the version
 * search engines index is quietly not the version being agreed to.
 *
 * So this compares the section headings rather than trusting anyone to remember.
 * It reads source, not dist, so it holds whether or not a build has run.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const read = (rel) =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const legalPage = read("../src/pages/Legal.tsx");
const prerender = read("./prerender-seo.mjs");

// <h2> or <h2 id="...">, taking the text and collapsing whitespace so that JSX
// line wrapping does not read as a different heading.
function headings(source) {
  return [...source.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
    .map((m) => m[1].replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const pageHeadings = headings(legalPage);

const block = prerender.match(/function legalBlock\(page\)\s*\{[\s\S]*?\n\}/);
if (!block) {
  console.error("FAIL legal-snapshot — legalBlock() is missing from prerender-seo.mjs.");
  console.error("The privacy policy and terms would serve no policy text at all.");
  process.exit(1);
}
const snapshotHeadings = headings(block[0]);

const missing = pageHeadings.filter((h) => !snapshotHeadings.includes(h));
const extra = snapshotHeadings.filter((h) => !pageHeadings.includes(h));

if (missing.length || extra.length) {
  console.error("FAIL legal-snapshot — Legal.tsx and the prerender snapshot disagree:\n");
  for (const h of missing) {
    console.error(`  in Legal.tsx but NOT served to crawlers:  "${h}"`);
  }
  for (const h of extra) {
    console.error(`  served to crawlers but NOT on the page:   "${h}"`);
  }
  console.error("\nUpdate legalBlock() in app/scripts/prerender-seo.mjs to match.");
  process.exit(1);
}

if (pageHeadings.length === 0) {
  console.error("FAIL legal-snapshot — no <h2> sections found in Legal.tsx.");
  process.exit(1);
}

console.log(
  `PASS legal-snapshot — ${pageHeadings.length} policy sections present in both the page and the crawler-visible HTML.`,
);

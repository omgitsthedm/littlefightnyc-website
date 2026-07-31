#!/usr/bin/env node
/**
 * A promise that depends on being nearby must not appear on the page for people
 * who are not.
 *
 * /nationwide/ exists to explain remote work. Its own copy is careful about it:
 * a website does not care about zip codes, run it yourself or keep us on call
 * like our New York clients do. But the shared "What you can count on" block was
 * appended to every snapshot including that one, so the crawler-visible HTML
 * told a prospect in Phoenix that when something urgent breaks we are usually
 * on-site within 24 hours.
 *
 * Nothing failed, because nothing was false in general — it was false for the
 * one audience that page is written for. That is the kind of over-promise that
 * only surfaces when someone holds you to it.
 *
 * Checks the built HTML rather than the source, because the failure was
 * assembly: every individual string was fine and the composition was not.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

// Phrases that only make sense if the reader is within travelling distance.
const PROXIMITY_CLAIMS = [
  "on-site within 24 hours",
  "we show up in person",
  "same-day visit",
  "we come to you",
];

// Pages written for readers who are explicitly not local.
const REMOTE_PAGES = ["nationwide/"];

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/\s+/g, " ");
}

const problems = [];
let checked = 0;

for (const page of REMOTE_PAGES) {
  const file = `${DIST}${page}index.html`;
  if (!existsSync(file)) continue;
  checked += 1;
  const text = visibleText(readFileSync(file, "utf8"));
  for (const claim of PROXIMITY_CLAIMS) {
    if (text.toLowerCase().includes(claim.toLowerCase())) {
      problems.push({ page: `/${page}`, claim });
    }
  }
}

if (!checked) {
  console.log("PASS claim-scope — no built remote pages to check yet.");
  process.exit(0);
}

if (problems.length) {
  console.error("FAIL claim-scope — a proximity promise reached a remote-audience page:\n");
  for (const p of problems) {
    console.error(`  ${p.page} contains "${p.claim}"`);
  }
  console.error(
    "\nThat page is written for readers who are not local. Scope the claim in",
  );
  console.error("promisesBlock(page) rather than removing it everywhere.");
  process.exit(1);
}

console.log(
  `PASS claim-scope — ${checked} remote-audience page(s) free of ${PROXIMITY_CLAIMS.length} proximity promises.`,
);

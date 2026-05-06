#!/usr/bin/env node
/**
 * Convert Fit Check gating CTAs to the 4-channel contact pattern.
 *
 * Pattern matched (with optional sibling btn-ghost link):
 *   <a class="btn-fit" href="/fit-check/">...Fit Check...</a>
 *
 * Replacement: 4-channel grid (Call/Text/Email/Form).
 *
 * SKIPS:
 *  - /fit-check/index.html (the actual Fit Check page)
 *  - dist/, backup/, tmp/, .netlify/, .git/, node_modules/
 *  - Any link explicitly inside a <nav> (handled separately)
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP_DIRS = new Set(["dist", "backup", "tmp", "node_modules", ".netlify", ".git"]);
const SKIP_FILES = new Set(["fit-check/index.html", "fit-check/thanks/index.html"]);

const FOUR_CHANNEL = `<div class="hero-contact-row" style="display:grid; grid-template-columns:repeat(2,1fr); gap:10px; margin:1.2em 0; max-width:560px;">
        <a href="tel:+16463600318" class="btn btn-orange" style="text-align:center;">📞 Call (646) 360-0318</a>
        <a href="sms:+16463600318" class="btn btn-outline" style="text-align:center;">💬 Text us</a>
        <a href="mailto:hello@littlefightnyc.com" class="btn btn-outline" style="text-align:center;">✉️ Email us</a>
        <a href="/contact/" class="btn btn-outline" style="text-align:center;">📝 Contact form</a>
      </div>`;

// Match an .overhaul-actions block that contains a btn-fit link to /fit-check/
// — possibly with siblings — and replace with our 4-channel block.
//
// Examples it should catch:
//   <div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">...</a></div>
//   <div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">...</a><a class="btn-ghost" href="...">...</a></div>
//   <div class="overhaul-actions"><a class="btn-fit" href="/fit-check/">...</a><a class="btn-ghost" href="...">...</a><a class="btn-ghost" href="...">...</a></div>
const OVERHAUL_ACTIONS = /<div class="overhaul-actions">\s*<a class="btn-fit" href="\/fit-check\/[^"]*"[^>]*>[\s\S]*?<\/a>(?:\s*<a class="btn-ghost"[^>]*>[\s\S]*?<\/a>)*\s*<\/div>/g;

async function* walk(dir, rel = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walk(join(dir, e.name), rel ? `${rel}/${e.name}` : e.name);
    } else if (e.isFile() && e.name.endsWith(".html")) {
      yield { abs: join(dir, e.name), rel: rel ? `${rel}/${e.name}` : e.name };
    }
  }
}

let updated = 0,
  skipped = 0,
  noMatch = 0;

for await (const { abs, rel } of walk(ROOT)) {
  if (SKIP_FILES.has(rel)) {
    skipped++;
    continue;
  }
  let html = await readFile(abs, "utf8");
  if (!OVERHAUL_ACTIONS.test(html)) {
    noMatch++;
    continue;
  }
  // reset regex lastIndex (since we used .test which leaves global state on /g flag)
  OVERHAUL_ACTIONS.lastIndex = 0;
  const next = html.replace(OVERHAUL_ACTIONS, FOUR_CHANNEL);
  if (next !== html) {
    await writeFile(abs, next, "utf8");
    updated++;
    console.log("✓", rel);
  }
}

console.log(`\nDone — updated: ${updated}, no-fitcheck-pattern: ${noMatch}, skipped: ${skipped}`);

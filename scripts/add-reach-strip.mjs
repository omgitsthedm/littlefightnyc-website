#!/usr/bin/env node
/**
 * Add the .reach-strip iconography (NYC + Nationwide + International)
 * to every page that has a hero-contact-row and an "Eastern: a real human"
 * tagline — but doesn't already have a reach-strip.
 *
 * Inserted right after the Eastern-hours <p>.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP_DIRS = new Set(["dist", "backup", "tmp", "node_modules", ".netlify", ".git"]);

const STRIP = `
  <div class="reach-strip" aria-label="Where Little Fight works">
    <span class="reach-pill"><span class="reach-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V10l4-3 5 4 5-2v12M9 14h2M9 18h2M14 14h2M14 18h2"/></svg></span><strong>NYC</strong><span class="reach-tag">on-site</span></span>
    <span class="reach-pill"><span class="reach-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 8h18M3 8c0-1 1-3 4-3h14M3 8v8c0 2 2 3 4 3h10c2 0 4-1 4-3V8M9 14h6"/></svg></span><strong>Nationwide</strong><span class="reach-tag">remote</span></span>
    <span class="reach-pill"><span class="reach-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></svg></span><strong>International</strong><span class="reach-tag">remote</span></span>
  </div>`;

// Match the "Eastern: a real human picks up" line — that's the marker for "this hero
// uses our standard pattern." Insert reach-strip right after it.
const ANCHOR = /(<p[^>]*><strong>9am&ndash;9pm Eastern: a real human picks up\.<\/strong> After hours, AI takes the message and David calls back\.<\/p>)/;

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
  noAnchor = 0;
for await (const { abs, rel } of walk(ROOT)) {
  let html = await readFile(abs, "utf8");
  if (!ANCHOR.test(html)) {
    noAnchor++;
    continue;
  }
  if (html.includes('class="reach-strip"')) {
    skipped++;
    continue;
  }
  html = html.replace(ANCHOR, (m) => `${m}${STRIP}`);
  await writeFile(abs, html, "utf8");
  updated++;
  console.log("✓", rel);
}

console.log(`\nDone — updated: ${updated}, already had: ${skipped}, no Eastern-anchor: ${noAnchor}`);

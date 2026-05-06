#!/usr/bin/env node
/**
 * Swap the "Send a message" → /fit-check/ button in hero contact rows
 * to "Contact form" → /contact/ to keep the 4-channel pattern consistent.
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SKIP_DIRS = new Set(["dist", "backup", "tmp", "node_modules", ".netlify", ".git"]);

const FROM = '<a href="/fit-check/" class="btn btn-outline" style="text-align:center;">📝 Send a message</a>';
const TO = '<a href="/contact/" class="btn btn-outline" style="text-align:center;">📝 Contact form</a>';

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

let updated = 0;
for await (const { abs, rel } of walk(ROOT)) {
  let html = await readFile(abs, "utf8");
  if (!html.includes(FROM)) continue;
  await writeFile(abs, html.split(FROM).join(TO), "utf8");
  updated++;
  console.log("✓", rel);
}
console.log(`\nDone — updated: ${updated}`);

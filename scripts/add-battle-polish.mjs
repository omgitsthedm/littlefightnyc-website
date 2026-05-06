#!/usr/bin/env node
import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const POLISH_LINK = '<link rel="stylesheet" href="/css/lifi-battle.css?v=20260506a">';
const ANCHOR = /<link[^>]+href="\/css\/lifi-overhaul(?:\.min)?\.css[^"]*"[^>]*>/;
const SKIP_DIRS = new Set(["dist", "backup", "tmp", "node_modules", ".netlify", ".git"]);

async function* walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walkHtml(join(dir, e.name));
    } else if (e.isFile() && e.name.endsWith(".html")) {
      yield join(dir, e.name);
    }
  }
}

let updated = 0, alreadyOk = 0, nonOverhaul = 0;
for await (const file of walkHtml(ROOT)) {
  let html = await readFile(file, "utf8");
  if (!ANCHOR.test(html)) { nonOverhaul++; continue; }
  if (html.includes("lifi-battle.css")) { alreadyOk++; continue; }
  html = html.replace(ANCHOR, (m) => `${m}\n  ${POLISH_LINK}`);
  await writeFile(file, html, "utf8");
  updated++;
  console.log("✓", file.replace(ROOT, ""));
}

console.log(`\nDone — updated: ${updated}, already had: ${alreadyOk}, no-overhaul-css: ${nonOverhaul}`);

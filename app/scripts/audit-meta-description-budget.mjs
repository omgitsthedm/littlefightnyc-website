#!/usr/bin/env node
/**
 * Keep indexable descriptions within our 160-character editorial budget.
 * Search engines choose and truncate snippets dynamically; this budget is
 * a copy check, not a guarantee of the text or length shown in search.
 *
 * Measured on the RENDERED text, not the attribute: "&amp;" is five characters
 * in the HTML and one on the page, and counting the raw attribute overstates
 * every description containing an ampersand.
 *
 * noindex pages are exempt — nothing is competing for their snippet.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const LIMIT = 160;

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&mdash;/g, "—")
    .replace(/&nbsp;/g, " ");
}

async function htmlFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, out);
    else if (entry.name === "index.html") out.push(full);
  }
  return out;
}

let files;
try {
  files = await htmlFiles(DIST);
} catch {
  console.log("PASS meta-description-budget — no dist/ yet, nothing to measure.");
  process.exit(0);
}

const over = [];
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  if (/name="robots" content="noindex/.test(html)) continue;
  const match = html.match(/<meta name="description" content="([^"]*)"/);
  if (!match) continue;
  checked += 1;
  const text = decode(match[1]);
  if (text.length > LIMIT) {
    const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
    over.push({ route, length: text.length, cut: text.slice(LIMIT) });
  }
}

if (over.length) {
  console.error(
    `FAIL meta-description-budget — ${over.length} indexable description(s) over ${LIMIT} characters:\n`,
  );
  for (const item of over.sort((a, b) => b.length - a.length)) {
    console.error(`  ${item.route}  (${item.length})`);
    console.error(`    beyond editorial budget: "…${item.cut}"`);
  }
  console.error("\nUpdate the page's authored meta description in preview-content/; retained legacy routes use src/data/.");
  process.exit(1);
}

console.log(
  `PASS meta-description-budget — ${checked} indexable descriptions all within ${LIMIT} characters.`,
);

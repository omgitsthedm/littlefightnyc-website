#!/usr/bin/env node
/**
 * Keep indexable <title>s within a 70-character budget. Bing Webmaster's
 * Site Scan flags longer titles, and search results cut them off mid-thought.
 * Like the description budget, this is a copy check, not a guarantee of what
 * a search engine will show.
 *
 * Measured on the RENDERED text: "&amp;" and "&#x27;" are one character on
 * the page. noindex pages are exempt — they do not appear in results.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const distArg = process.argv.indexOf("--dist");
const DIST = distArg >= 0
  ? resolve(process.cwd(), process.argv[distArg + 1])
  : fileURLToPath(new URL("../dist/", import.meta.url));
const LIMIT = 70;

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", nbsp: " " };

function decode(value) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body) => {
    if (body[0] === "#") {
      const hex = body[1].toLowerCase() === "x";
      return String.fromCodePoint(Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10));
    }
    return NAMED[body.toLowerCase()] ?? entity;
  });
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
  console.log("PASS title-budget — no dist/ yet, nothing to measure.");
  process.exit(0);
}

const over = [];
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  if (/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html)) continue;
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!match) continue;
  checked += 1;
  const text = decode(match[1].trim().replace(/\s+/g, " "));
  if (text.length > LIMIT) {
    const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
    over.push({ route, length: text.length, text });
  }
}

if (over.length) {
  console.error(`FAIL title-budget — ${over.length} indexable title(s) over ${LIMIT} characters:\n`);
  for (const item of over.sort((a, b) => b.length - a.length)) {
    console.error(`  ${item.route}  (${item.length})`);
    console.error(`    "${item.text}"`);
  }
  console.error("\nShorten the page's authored title in preview-content/ (market pages: market-pages.json). Keep the H1 as is; the title only needs the place, the topic and \"| Little Fight NYC\".");
  process.exit(1);
}

console.log(`PASS title-budget — ${checked} indexable titles all within ${LIMIT} characters.`);

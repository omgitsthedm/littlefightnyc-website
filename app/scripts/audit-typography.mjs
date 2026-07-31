#!/usr/bin/env node
/**
 * One apostrophe, sitewide.
 *
 * Fifteen pages mixed straight and curly apostrophes inside the same body copy
 * — "It's Not Keywords Anymore" three lines above "you don’t pay". Nobody
 * reports this and everybody feels it: it is the difference between copy that
 * was typeset and copy that was pasted.
 *
 * The mix came from two directions at once. Authored content in the data files
 * used curly; the generated blocks in prerender-seo.mjs and several components
 * used straight, so every page carrying a shared block inherited both.
 *
 * Checks built HTML, since that is where the two sources finally meet. Only
 * intra-word apostrophes count — a quote delimiter never has a letter on both
 * sides, which is also why the fix could be applied safely.
 *
 * /myspace-demo/ is exempt on purpose: it is a 2005 MySpace pastiche, and
 * straight quotes are correct for what it is imitating.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const EXEMPT = [/^myspace-demo\//];

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
  console.log("PASS typography — no dist/ yet, nothing to check.");
  process.exit(0);
}

const offenders = [];
let checked = 0;

for (const file of files) {
  const rel = relative(DIST, file);
  if (EXEMPT.some((re) => re.test(rel))) continue;

  const html = readFileSync(file, "utf8");
  const main = html.match(/<main[\s\S]*?<\/main>/);
  if (!main) continue;
  checked += 1;

  const text = main[0]
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’");

  const straight = text.match(/\w'\w/g) ?? [];
  if (straight.length) {
    const samples = [...new Set(text.match(/\S*\w'\w\S*/g) ?? [])].slice(0, 4);
    offenders.push({ route: `/${rel.replace(/index\.html$/, "")}`, samples });
  }
}

if (offenders.length) {
  console.error(
    `FAIL typography — ${offenders.length} page(s) use a straight apostrophe in body copy:\n`,
  );
  for (const o of offenders) {
    console.error(`  ${o.route}`);
    console.error(`    ${o.samples.join("  ")}`);
  }
  console.error("\nUse ’ (U+2019) in prose. Fix at the source — data files and");
  console.error("component literals — so React and the prerender agree.");
  process.exit(1);
}

console.log(`PASS typography — ${checked} pages use one apostrophe throughout.`);

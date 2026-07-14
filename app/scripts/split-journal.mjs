/**
 * Derive a lightweight metadata index from journal.json so the journal LIST
 * page, the publishing heatmap, and the read-time stats don't have to ship the
 * ~250KB of post HTML bodies (that payload belongs only on the single-post
 * chunk). journal.json stays the single source of truth; this file is
 * generated — run automatically at build (see package.json) and committed so
 * `npm run dev` works without a prebuild step.
 *
 * Word count is precomputed here with the SAME logic journalStats.ts used to
 * run at runtime, so reading times are byte-for-byte identical — no fabricated
 * numbers, no behavior change.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "src", "data");

const posts = JSON.parse(readFileSync(join(dataDir, "journal.json"), "utf8"));

function countWords(html) {
  if (typeof html !== "string") return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

const index = posts.map((p) => ({
  slug: p.slug,
  category: p.category,
  title: p.title,
  description: p.description,
  published: p.published,
  updated: p.updated,
  wordCount: countWords(p.html),
}));

writeFileSync(
  join(dataDir, "journal-index.json"),
  JSON.stringify(index, null, 2) + "\n",
);

console.log(`journal-index.json: ${index.length} posts (meta only, bodies stripped)`);

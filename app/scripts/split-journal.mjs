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
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { journalDates } from "./metadata-source.mjs";

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

const index = posts.map((p) => {
  const dates = journalDates(p);
  return {
    slug: p.slug,
    category: p.category,
    title: p.title,
    description: p.description,
    published: dates.published,
    updated: dates.updated,
    wordCount: countWords(p.html),
  };
});

writeFileSync(
  join(dataDir, "journal-index.json"),
  JSON.stringify(index, null, 2) + "\n",
);

console.log(`journal-index.json: ${index.length} posts (meta only, bodies stripped)`);

/* Per-slug body files → each post's ~4-9KB of HTML becomes its OWN chunk, so the
 * JournalPost route lazy-loads only the body of the post being read instead of
 * bundling all 37 (~250KB / 84KB gz). JournalPost.tsx pulls these via
 * import.meta.glob keyed by slug. Regenerated at build/predev; committed so
 * `npm run dev` and Vite's glob both see the files. */
const bodiesDir = join(dataDir, "journal-bodies");
mkdirSync(bodiesDir, { recursive: true });

const wanted = new Set(posts.map((p) => `${p.slug}.json`));
// Prune stale bodies (a renamed/removed post must not linger as a dead chunk).
for (const file of readdirSync(bodiesDir)) {
  if (file.endsWith(".json") && !wanted.has(file)) {
    rmSync(join(bodiesDir, file));
  }
}

for (const p of posts) {
  writeFileSync(
    join(bodiesDir, `${p.slug}.json`),
    JSON.stringify({ html: typeof p.html === "string" ? p.html : "" }) + "\n",
  );
}

console.log(`journal-bodies/: ${posts.length} per-slug body files`);

// Sweep the footer brand tagline across every HTML page to reflect the
// updated mission. Idempotent.
//
// Run: node scripts/footer-tagline-sweep.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const REPLACEMENTS = [
  // Footer brand block — the two-line tagline under "Little Fight NYC" h3.
  // Old: "Better tech. Fewer bills. More customers." + "Built for New York
  //      businesses that cannot waste time or money."
  // New: states the mission directly.
  {
    name: "footer-brand-tagline",
    old: "<p>Better tech. Fewer bills. More customers.</p><p>Built for New York businesses that cannot waste time or money.</p>",
    new: "<p>Tools the chains use, sized for the corner shop.</p><p>Helping NYC small businesses shrink bills, grow business, and stay staples of the neighborhood.</p>",
  },
];

function findHtmlFiles() {
  const out = execSync(
    `find . -name "*.html" -not -path "./dist/*" -not -path "./tmp/*" -not -path "./backup/*" -not -path "./node_modules/*" -not -path "./vendor/*" -not -path "./.git/*" -not -path "./dist-corrupt-*"`,
    { cwd: root, encoding: "utf8" }
  );
  return out.split("\n").filter(Boolean).map((p) => path.resolve(root, p));
}

async function processFile(filePath) {
  let content = await readFile(filePath, "utf8");
  let original = content;
  const hits = [];

  for (const r of REPLACEMENTS) {
    if (content.includes(r.old)) {
      const before = content;
      content = content.split(r.old).join(r.new);
      const count = before.split(r.old).length - 1;
      hits.push(`${r.name}×${count}`);
    }
  }

  if (content !== original) {
    await writeFile(filePath, content, "utf8");
    return { changed: true, hits };
  }
  return { changed: false, hits: [] };
}

async function main() {
  const files = findHtmlFiles();
  console.log(`Scanning ${files.length} HTML files for footer tagline...`);
  console.log("");

  let changed = 0;

  for (const file of files) {
    const rel = path.relative(root, file);
    const result = await processFile(file);
    if (result.changed) {
      changed++;
      console.log(`✓ ${rel}: ${result.hits.join(", ")}`);
    }
  }

  console.log("");
  console.log(`Done. ${changed}/${files.length} files updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// AI-tell scrub. Per May 2026 conversion research:
//   - "leverage" / "synergize" / "optimize your experience" cost ~8% conversion
//   - "amazing" / "innovative" / "cutting-edge" cost ~4%
//   - Vague CTAs cost ~6%
// Plus generic SaaS-speak that erodes Little Fight's NYC-tradesman voice.
//
// Idempotent. Run with: node scripts/ai-tell-scrub.mjs

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ───────────────────────────────────────────────────────────────────────
// Replacements. Word-boundary aware. Case-preserving where it matters.
// Each entry is { pattern: regex, replacement: string, label: string }

const SCRUBS = [
  // High-cost AI-tells (research-backed)
  { pattern: /\bleverage\b/gi, replacement: "use", label: "leverage" },
  { pattern: /\bsynergize\b/gi, replacement: "connect", label: "synergize" },
  { pattern: /\bsynergy\b/gi, replacement: "fit", label: "synergy" },
  { pattern: /\boptimize your experience\b/gi, replacement: "make it work better", label: "optimize-experience" },
  { pattern: /\bcutting-edge\b/gi, replacement: "current", label: "cutting-edge" },
  { pattern: /\bcutting edge\b/gi, replacement: "current", label: "cutting edge" },
  { pattern: /\bbleeding-edge\b/gi, replacement: "newest", label: "bleeding-edge" },
  { pattern: /\bstate-of-the-art\b/gi, replacement: "current", label: "state-of-the-art" },
  { pattern: /\bworld-class\b/gi, replacement: "real", label: "world-class" },
  { pattern: /\bbest-in-class\b/gi, replacement: "the right one", label: "best-in-class" },
  { pattern: /\bbest in class\b/gi, replacement: "the right one", label: "best in class" },
  { pattern: /\bindustry-leading\b/gi, replacement: "real", label: "industry-leading" },
  { pattern: /\bindustry leading\b/gi, replacement: "real", label: "industry leading" },
  { pattern: /\binnovative\b/gi, replacement: "useful", label: "innovative" },
  { pattern: /\binnovation\b/gi, replacement: "real work", label: "innovation" },
  { pattern: /\brevolutionary\b/gi, replacement: "different", label: "revolutionary" },
  { pattern: /\bgame-changing\b/gi, replacement: "useful", label: "game-changing" },
  { pattern: /\bgame changing\b/gi, replacement: "useful", label: "game changing" },
  { pattern: /\bnext-generation\b/gi, replacement: "newer", label: "next-gen" },
  { pattern: /\bunlock the power\b/gi, replacement: "use", label: "unlock-power" },
  { pattern: /\bsupercharge\b/gi, replacement: "improve", label: "supercharge" },
  { pattern: /\bturbocharge\b/gi, replacement: "improve", label: "turbocharge" },
  { pattern: /\bseamless(ly)?\b/gi, replacement: (m) => m.endsWith("ly") ? "smoothly" : "smooth", label: "seamless" },
  { pattern: /\bholistic\b/gi, replacement: "complete", label: "holistic" },
  { pattern: /\bcomprehensive\b/gi, replacement: "full", label: "comprehensive" },
  { pattern: /\brobust\b/gi, replacement: "solid", label: "robust" },
  { pattern: /\bscalable\b/gi, replacement: "able to grow", label: "scalable" },
  { pattern: /\bdelve\b/gi, replacement: "look", label: "delve" },
  { pattern: /\btapestry\b/gi, replacement: "mix", label: "tapestry" },
  { pattern: /\bjourney\b/gi, replacement: "path", label: "journey" },
  { pattern: /\bnavigate\b/gi, replacement: "work through", label: "navigate" },
  { pattern: /\bempower(s|ed|ing)?\b/gi, replacement: (m) => "help" + (m.length > 7 ? m.slice(7) : ""), label: "empower" },
  { pattern: /\bfacilitate\b/gi, replacement: "help with", label: "facilitate" },
  { pattern: /\butilize\b/gi, replacement: "use", label: "utilize" },
  { pattern: /\butilization\b/gi, replacement: "use", label: "utilization" },

  // Marketing fluff
  { pattern: /\bunparalleled\b/gi, replacement: "real", label: "unparalleled" },
  { pattern: /\bunmatched\b/gi, replacement: "real", label: "unmatched" },
  { pattern: /\btransform your business\b/gi, replacement: "fix what's broken", label: "transform-biz" },
  { pattern: /\btransformation\b/gi, replacement: "real change", label: "transformation" },
  { pattern: /\baward-winning\b/gi, replacement: "real", label: "award-winning" },
  { pattern: /\bdelight(ed|ing)?\b/gi, replacement: (m) => "help" + (m.length > 7 ? m.slice(7) : "ed"), label: "delight" },
];

const SKIP_DIRS = new Set([
  ".git",
  ".github",
  ".claude",
  "backup",
  "dist",
  "node_modules",
  "scripts",
  "tmp",
  "vendor",
]);

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

  for (const scrub of SCRUBS) {
    const matches = content.match(scrub.pattern);
    if (matches) {
      content = content.replace(scrub.pattern, scrub.replacement);
      hits.push(`${scrub.label}×${matches.length}`);
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
  console.log(`Scanning ${files.length} HTML files for AI-tells…`);
  console.log("");

  let changed = 0;
  const stats = new Map();

  for (const file of files) {
    const rel = path.relative(root, file);
    const result = await processFile(file);
    if (result.changed) {
      changed++;
      console.log(`✓ ${rel}: ${result.hits.join(", ")}`);
      for (const h of result.hits) {
        const [name] = h.split("×");
        stats.set(name, (stats.get(name) || 0) + 1);
      }
    }
  }

  console.log("");
  console.log(`Done. ${changed}/${files.length} files scrubbed.`);
  console.log("");
  if (stats.size > 0) {
    console.log("AI-tells removed by type:");
    const sorted = [...stats.entries()].sort((a, b) => b[1] - a[1]);
    for (const [name, count] of sorted) {
      console.log(`  ${name}: ${count} files`);
    }
  } else {
    console.log("No AI-tells found. Voice is clean.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

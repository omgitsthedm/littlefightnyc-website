#!/usr/bin/env node
/**
 * Retired integrations must stay retired.
 *
 * A third-party alert integration was removed from the audit pipeline on
 * 2026-07-30. It had never been configured in production, so it had never run
 * once — but it was still named on the visitor-facing privacy page as a
 * processor receiving the submitted website and email address. A privacy
 * disclosure naming a recipient that receives nothing is as wrong as one
 * omitting a recipient that does, and it is the kind of wrong that survives for
 * months because nothing fails while it is untrue.
 *
 * Deleting code does not stop it being pasted back from an older branch, a
 * snapshot, or an agent working from a stale audit finding. Reintroducing a
 * data recipient is a privacy decision, so it should take a deliberate edit
 * here rather than a quiet import.
 *
 * The names below are assembled from fragments on purpose. A gate that spelled
 * them out would itself be the last copy of the thing the owner asked to have
 * removed, and a repo-wide search for the name would keep finding this file.
 * The check is unaffected; only the stored literal is.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not .pathname: this repo lives under a path containing spaces,
// and .pathname returns "LiFi%20NYC", which the fs calls cannot open.
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const RETIRED = [
  {
    name: ["tele", "gram"].join(""),
    retired: "2026-07-30",
    why: "Removed from the audit pipeline and the privacy disclosure; never configured in production.",
  },
];

// Dated evidence baselines record what was true on their date. Rewriting
// history to satisfy a linter would defeat the point of keeping them.
const EXEMPT = [
  /^\.lifi\/evidence\/baselines\//,
  /^app\/scripts\/audit-retired-integrations\.mjs$/,
];

const TEXT = /\.(m?[jt]sx?|html|css|md|ya?ml|json|txt)$/i;

// git ls-files, not a directory walk: only tracked files are ours. An untracked
// Chrome profile under tmp/ ships an English wordlist that contains the name,
// and a walker flagged it as a reintroduced integration.
const tracked = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const hits = [];
for (const rel of tracked) {
  if (!TEXT.test(rel)) continue;
  if (EXEMPT.some((re) => re.test(rel))) continue;

  let lines;
  try {
    lines = readFileSync(join(ROOT, rel), "utf8").split("\n");
  } catch {
    continue; // deleted-but-tracked during a rebase
  }

  lines.forEach((line, i) => {
    for (const item of RETIRED) {
      if (line.toLowerCase().includes(item.name)) {
        hits.push({ rel, line: i + 1, item, text: line.trim().slice(0, 110) });
      }
    }
  });
}

if (hits.length) {
  console.error("FAIL retired-integrations — a retired integration is referenced again:\n");
  for (const h of hits) {
    console.error(`  ${h.rel}:${h.line}`);
    console.error(`    ${h.text}`);
    console.error(`    Retired ${h.item.retired}. ${h.item.why}`);
    console.error("");
  }
  console.error("If reintroducing it is deliberate, remove it from RETIRED in this");
  console.error("file and update the privacy disclosure in the same commit.");
  process.exit(1);
}

console.log(
  `PASS retired-integrations — ${RETIRED.length} retired integration(s) absent from ${tracked.length} tracked files.`,
);

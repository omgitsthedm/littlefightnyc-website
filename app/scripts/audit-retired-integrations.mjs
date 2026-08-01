#!/usr/bin/env node
/**
 * Retired integrations must stay retired.
 *
 * Retired providers, credentials, and agent automation must not return from an
 * older branch or local handoff. The active Audit stack is Netlify Database,
 * Netlify AI Gateway, Google PageSpeed, and Google Workspace Gmail OAuth.
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
  {
    name: ["SMTP", "APP", "PASSWORD"].join("_"),
    retired: "2026-07-31",
    why: "Mailbox-password delivery was replaced by Gmail OAuth.",
  },
  {
    name: ["NOTION", "API", "KEY"].join("_"),
    retired: "2026-07-31",
    why: "Audit follow-up moved to Netlify Database.",
  },
  {
    name: ["NOTION", "CRM", "DATABASE", "ID"].join("_"),
    retired: "2026-07-31",
    why: "Audit follow-up moved to Netlify Database.",
  },
  {
    name: ["GMAIL", "USER"].join("_"),
    retired: "2026-07-31",
    why: "The fixed Workspace sender now uses Gmail OAuth credentials.",
  },
  {
    name: ["TWILIO", "ACCOUNT", "SID"].join("_"),
    retired: "2026-06-30",
    why: "The AI phone intake is not a current service.",
  },
  {
    name: ["TWILIO", "AUTH", "TOKEN"].join("_"),
    retired: "2026-06-30",
    why: "The AI phone intake is not a current service.",
  },
  {
    name: ["TWILIO", "PHONE", "NUMBER"].join("_"),
    retired: "2026-06-30",
    why: "The AI phone intake is not a current service.",
  },
  {
    name: ["SUPABASE", "URL"].join("_"),
    retired: "2026-08-01",
    why: "The obsolete intake schema was removed; durable leads use Netlify Database.",
  },
  {
    name: ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_"),
    retired: "2026-08-01",
    why: "The obsolete intake schema was removed; durable leads use Netlify Database.",
  },
  {
    name: ["RESEND", "API", "KEY"].join("_"),
    retired: "2026-08-01",
    why: "Audit email is delivered by Google Workspace Gmail API.",
  },
  {
    name: ["OPENAI", "API", "KEY"].join("_"),
    retired: "2026-08-01",
    why: "The Audit uses Netlify AI Gateway and has no direct OpenAI integration.",
  },
  {
    name: ["api", "anthropic", "com"].join("."),
    retired: "2026-07-31",
    why: "Anthropic calls must go through Netlify AI Gateway.",
  },
  {
    name: ["claude", "code", "action"].join("-"),
    retired: "2026-08-01",
    why: "Repository-triggered Claude automation and its billed GitHub secret were removed.",
  },
  {
    name: ["audits", "littlefightnyc"].join("-"),
    retired: "2026-08-01",
    why: "The standalone Audit site is deleted; the current Audit lives in this app.",
  },
  {
    name: ["audits", "littlefightnyc", "com"].join("."),
    retired: "2026-08-01",
    why: "The standalone Audit hostname has no DNS and must not return.",
  },
];

// Dated evidence baselines record what was true on their date. Rewriting
// history to satisfy a linter would defeat the point of keeping them.
const EXEMPT = [
  /^\.lifi\/evidence\/baselines\//,
  /^app\/scripts\/audit-retired-integrations\.mjs$/,
  /^app\/scripts\/audit-audit-integrations\.mjs$/,
];

const TEXT = /\.(?:[cm]?[jt]sx?|html|css|md|ya?ml|json|txt|toml|sql|sh)$/i;

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
      if (line.toLowerCase().includes(item.name.toLowerCase())) {
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

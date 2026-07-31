#!/usr/bin/env node
/**
 * The site speaks as Little Fight NYC. Never as a person.
 *
 * This is the owner's standing rule and the oldest constraint on the project:
 * "the whole website should never reference me as a person, it's an agency, a
 * business, not a person." The site currently obeys it — author and publisher
 * are Organization everywhere, and the owner's name appears zero times in
 * rendered copy.
 *
 * Nothing enforced it. A Person-schema byline could be reintroduced on every
 * article and the full gate suite plus the browser tests would still pass,
 * because no check has ever looked. A rule that survives on habit is one edit
 * from being broken by someone who never heard it — including a future agent
 * reading a generic "add author markup for E-E-A-T" recommendation.
 *
 * Two things are checked, because the rule can break in two ways:
 *   - structured data claiming a Person wrote or published anything
 *   - the owner's name in copy a visitor reads
 *
 * The name check covers rendered text, not the whole file: it must not trip on
 * the code comments and commit trailers that legitimately name the author of
 * the work. The rule is about what the site says, not who wrote it.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));

// Names that must never appear in copy the site renders.
const PERSONAL_NAMES = [/\bDavid\s+Marsh\b/i, /\bDavid\b(?!\s*(?:Bowie|Byrne))/i];

async function htmlFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

let files;
try {
  files = await htmlFiles(DIST);
} catch {
  console.log("PASS agency-voice — no dist/ yet, nothing to check.");
  process.exit(0);
}

const problems = [];
let checked = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
  checked += 1;

  // 1. Structured data. Covers author, publisher, and any bare Person node.
  for (const m of html.matchAll(
    /<script[^>]*(?:application\/ld\+json|data-seo)[^>]*>([\s\S]*?)<\/script>/g,
  )) {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      problems.push({ route, what: "structured data block is not valid JSON" });
      continue;
    }
    const seen = JSON.stringify(parsed);
    if (/"@type"\s*:\s*"Person"/.test(seen)) {
      problems.push({ route, what: 'structured data declares "@type": "Person"' });
    }
  }

  // 2. Rendered copy. Strip markup and scripts first so a comment explaining
  //    the rule does not read as a violation of it.
  const body = html.match(/<body[\s\S]*<\/body>/);
  if (!body) continue;
  const text = body[0]
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

  for (const name of PERSONAL_NAMES) {
    const hit = text.match(name);
    if (hit) {
      const at = text.indexOf(hit[0]);
      problems.push({
        route,
        what: `copy names a person: "…${text.slice(Math.max(0, at - 45), at + 45).trim()}…"`,
      });
      break;
    }
  }
}

if (problems.length) {
  console.error("FAIL agency-voice — the site is speaking as a person:\n");
  for (const p of problems) {
    console.error(`  ${p.route}`);
    console.error(`    ${p.what}`);
  }
  console.error("\nLittle Fight NYC is an agency, not a person. Author and");
  console.error("publisher are Organization; copy uses the brand, not a name.");
  process.exit(1);
}

console.log(
  `PASS agency-voice — ${checked} pages speak as the agency, no Person schema, no personal name.`,
);

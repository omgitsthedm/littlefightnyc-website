#!/usr/bin/env node
/**
 * Little Fight NYC publishes as the agency; David Marsh is its one named person.
 *
 * Owner decision, 2026-10-19 (replacing the earlier "never reference me as a
 * person" rule): "if I have to be the face that's fine, David Marsh or just
 * David." The site names David as founder, as the author of its articles and as
 * the person who answers. Everything is still published by Little Fight NYC.
 *
 * What this checks, on every generated page:
 *   - every Person in structured data is David Marsh (#david-marsh), so no other
 *     person can be presented as staff, author or reviewer by accident;
 *   - any publisher is the Little Fight NYC Organization, never a person;
 *   - any Article names David Marsh as author;
 *   - the About page shows David by name and carries his Person record.
 */
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const ORIGIN = "https://littlefightnyc.com";
const DAVID = `${ORIGIN}/#david-marsh`;
const ORGANIZATION = `${ORIGIN}/#organization`;

async function htmlFiles(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await htmlFiles(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function nodes(value, out = []) {
  if (Array.isArray(value)) value.forEach((item) => nodes(item, out));
  else if (value && typeof value === "object") {
    out.push(value);
    Object.values(value).forEach((item) => nodes(item, out));
  }
  return out;
}

const types = (node) => [].concat(node["@type"] || []);
const ref = (value) => (value && typeof value === "object" ? value["@id"] : value);

let files;
try {
  files = await htmlFiles(DIST);
} catch {
  console.log("PASS agency-voice — no dist/ yet, nothing to check.");
  process.exit(0);
}

const problems = [];
let checked = 0;
let articles = 0;

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const route = `/${relative(DIST, file).replace(/index\.html$/, "")}`;
  checked += 1;
  for (const m of html.matchAll(/<script[^>]*(?:application\/ld\+json|data-seo)[^>]*>([\s\S]*?)<\/script>/g)) {
    let parsed;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      problems.push({ route, what: "structured data block is not valid JSON" });
      continue;
    }
    for (const node of nodes(parsed)) {
      if (types(node).includes("Person") && node["@id"] !== DAVID) {
        problems.push({ route, what: `a Person other than David Marsh: ${JSON.stringify(node).slice(0, 120)}` });
      }
      const publisher = node.publisher;
      const agency = publisher && (ref(publisher) === ORGANIZATION
        || (typeof publisher === "object" && [].concat(publisher["@type"] || []).includes("Organization") && /^Little Fight NYC$/i.test(publisher.name || "")));
      if (publisher && !agency) {
        problems.push({ route, what: "publisher is not the Little Fight NYC Organization" });
      }
      if (types(node).includes("Article")) {
        articles += 1;
        if (ref(node.author) !== DAVID) problems.push({ route, what: "Article author is not David Marsh" });
      }
    }
  }
}

const about = readFileSync(join(DIST, "about/index.html"), "utf8");
if (!about.includes("David Marsh")) problems.push({ route: "/about/", what: "About does not name David Marsh" });
if (!about.includes(`"@id": "${DAVID}"`) && !about.includes(`"@id":"${DAVID}"`)) {
  problems.push({ route: "/about/", what: "About is missing David's Person record" });
}

if (problems.length) {
  console.error("FAIL agency-voice:\n");
  for (const p of problems.slice(0, 40)) console.error(`  ${p.route}\n    ${p.what}`);
  process.exit(1);
}

console.log(`PASS agency-voice — ${checked} pages: Little Fight NYC publishes, David Marsh is the only named person, ${articles} articles credit him.`);

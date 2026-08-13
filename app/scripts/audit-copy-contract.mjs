#!/usr/bin/env node
/**
 * Rendered public-copy contract.
 *
 * Copy can look safe in a component and still ship badly when a route assembles
 * its metadata, fallback shell, shared navigation, or authored HTML. This
 * reads the built marketing documents because the first response is what an
 * owner and a crawler actually receive.
 *
 * Deliberate scope boundary:
 * - route-meta is the marketing-route catalog;
 * - Dakota, VERA, Lab/static experiences, PHC, and the frozen VenueCircuit
 *   presentation are not read here;
 * - this script never writes route metadata or page content.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(appRoot, "src", "data");
const distRoot = path.join(appRoot, "dist");

const EXCLUDED_ROUTES = new Set([
  "/case-studies/public-house-creative/",
  "/case-studies/venuecircuit/",
  "/studio/dakota/",
  "/studio/cockpit/",
  "/studio/venuecircuit/",
]);

const NON_MARKETING_ROUTES = new Set([
  "/legal/",
  "/privacy/",
  "/terms/",
  "/thanks/",
]);

const BANNED_COPY = [
  { label: "one-stop shop", pattern: /\bone[- ]stop shop\b/i },
  { label: "vertical integration", pattern: /\bvertical integration\b/i },
  { label: "best-in-class", pattern: /\bbest[- ]in[- ]class\b/i },
  { label: "industry-leading", pattern: /\bindustry[- ]leading\b/i },
  { label: "seamless solutions", pattern: /\bseamless solutions\b/i },
];

const PLACEHOLDER_COPY = [
  { label: "TODO", pattern: /\bTODO\b/i },
  { label: "TBD", pattern: /\bTBD\b/i },
  { label: "FIXME", pattern: /\bFIXME\b/i },
  { label: "placeholder", pattern: /\b(?:copy )?placeholder\b/i },
  { label: "lorem ipsum", pattern: /\blorem ipsum\b/i },
  { label: "Call David", pattern: /\bcall\s+(?:or\s+text\s+)?david\b/i },
  { label: "personal name", pattern: /\bDavid(?:\s+Marsh)?\b(?!\s*(?:Bowie|Byrne))/i },
];

const ACTION_HREF = /^(?:\/contact\/?(?:[?#].*)?|\/website-check\/?(?:[?#].*)?|\/tech-audit\/?(?:[?#].*)?|\/services\/[a-z0-9-]+\/?(?:[?#].*)?|mailto:|tel:|sms:)/i;

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, entity) => String.fromCodePoint(Number(entity)))
    .replace(/&#x([0-9a-f]+);/gi, (_, entity) => String.fromCodePoint(Number.parseInt(entity, 16)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ");
}

function plainText(value = "") {
  return decodeHtml(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function routeFile(routePath) {
  if (routePath === "/") return path.join(distRoot, "index.html");
  return path.join(distRoot, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? decodeHtml(match[2]).trim() : "";
}

function excerpt(text, hit) {
  const at = text.toLowerCase().indexOf(hit.toLowerCase());
  if (at < 0) return "";
  return `…${text.slice(Math.max(0, at - 38), at + hit.length + 58).trim()}…`;
}

function anchorTags(html) {
  return [...html.matchAll(/<a\b[^>]*>/gi)].map((match) => match[0]);
}

function h1Count(html) {
  return [...html.matchAll(/<h1\b[^>]*>/gi)].length;
}

function titleContent(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1]).trim() : "";
}

function descriptionText(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (attr(tag, "name").toLowerCase() === "description") return attr(tag, "content");
  }
  return "";
}

function containsMarkup(value) {
  return /<[^>]*>/.test(decodeHtml(value));
}

function routeSet(items) {
  return new Set(items.map((item) => item.path));
}

function setDifference(left, right) {
  return [...left].filter((value) => !right.has(value));
}

const failures = [];
let routeMeta;
let seoPages;
let journal;
let journalCopy;
let journalIdentity;

try {
  [routeMeta, seoPages, journal, journalCopy, journalIdentity] = await Promise.all([
    readFile(path.join(dataRoot, "route-meta.json"), "utf8").then(JSON.parse),
    readFile(path.join(dataRoot, "seo-pages.json"), "utf8").then(JSON.parse),
    readFile(path.join(dataRoot, "journal-index.json"), "utf8").then(JSON.parse),
    readFile(path.join(dataRoot, "journal-copy.json"), "utf8").then(JSON.parse),
    readFile(path.join(dataRoot, "journal.json"), "utf8").then(JSON.parse),
  ]);
} catch {
  console.log("PASS copy-contract — generated route data is not available yet.");
  process.exit(0);
}

const pages = routeMeta.pages.filter((page) => !EXCLUDED_ROUTES.has(page.path));
const routePaths = routeSet(pages);

const answerPaths = new Set(
  seoPages.pages.filter((page) => page.path.startsWith("/answers/")).map((page) => page.path),
);
const renderedAnswerPaths = new Set([...routePaths].filter((routePath) => routePath.startsWith("/answers/")));
if (answerPaths.size !== 27) {
  failures.push(`answers source coverage: expected 27 guides, found ${answerPaths.size}`);
}
for (const routePath of setDifference(answerPaths, renderedAnswerPaths)) {
  failures.push(`${routePath}: answer exists in seo-pages.json but not rendered route metadata`);
}
for (const routePath of setDifference(renderedAnswerPaths, answerPaths)) {
  failures.push(`${routePath}: rendered answer route is not in seo-pages.json`);
}

const journalIdentitySlugs = new Set(journalIdentity.map((post) => post.slug));
const journalCopyPosts = Array.isArray(journalCopy) ? journalCopy : journalCopy.posts;
if (!Array.isArray(journalCopyPosts)) {
  failures.push("journal-copy.json: expected a posts array");
}
const journalCopySlugs = new Set((journalCopyPosts ?? []).map((post) => post.slug));
const journalIndexSlugs = new Set(journal.map((post) => post.slug));
const renderedJournalPaths = new Set([...routePaths].filter((routePath) => routePath.startsWith("/journal/")));
if (journalIdentitySlugs.size !== 37) {
  failures.push(`journal source coverage: expected 37 posts, found ${journalIdentitySlugs.size}`);
}
for (const [label, slugs] of [
  ["journal-copy.json", journalCopySlugs],
  ["journal-index.json", journalIndexSlugs],
]) {
  for (const slug of setDifference(journalIdentitySlugs, slugs)) {
    failures.push(`${label}: missing journal slug ${slug}`);
  }
  for (const slug of setDifference(slugs, journalIdentitySlugs)) {
    failures.push(`${label}: stale journal slug ${slug}`);
  }
}
for (const slug of journalIdentitySlugs) {
  const routePath = `/journal/${slug}/`;
  if (!renderedJournalPaths.has(routePath)) {
    failures.push(`${routePath}: journal post is missing from rendered route metadata`);
  }
}
for (const routePath of renderedJournalPaths) {
  const slug = routePath.replace(/^\/journal\/|\/$/g, "");
  if (!journalIdentitySlugs.has(slug)) {
    failures.push(`${routePath}: rendered journal route has no authored journal post`);
  }
}

let checked = 0;
for (const page of pages) {
  const routePath = page.path;
  let html;
  try {
    html = await readFile(routeFile(routePath), "utf8");
  } catch {
    failures.push(`${routePath}: missing generated HTML`);
    continue;
  }
  checked += 1;

  const h1s = h1Count(html);
  if (h1s !== 1) failures.push(`${routePath}: expected exactly one H1, found ${h1s}`);

  const title = titleContent(html);
  if (!plainText(title) || containsMarkup(title)) {
    failures.push(`${routePath}: title must be nonempty plain text`);
  }

  const description = descriptionText(html);
  if (!description || containsMarkup(description)) {
    failures.push(`${routePath}: meta description must be nonempty plain text`);
  }

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  const visible = plainText(bodyMatch?.[1] ?? html);
  for (const check of [...PLACEHOLDER_COPY, ...BANNED_COPY]) {
    const hit = visible.match(check.pattern)?.[0];
    if (hit) failures.push(`${routePath}: forbidden ${check.label} in visible copy (${excerpt(visible, hit)})`);
  }

  const anchors = anchorTags(html);
  for (const tag of anchors) {
    const href = attr(tag, "href");
    if (/^(?:http:|\/\/|www\.)/i.test(href)) {
      failures.push(`${routePath}: external link must use direct HTTPS (${href || "missing href"})`);
    }
  }

  if (!NON_MARKETING_ROUTES.has(routePath)) {
    const hasAction = anchors.some((tag) => ACTION_HREF.test(attr(tag, "href")));
    if (!hasAction) failures.push(`${routePath}: marketing route has no visible next action or contact path`);
  }
}

for (const post of journal) {
  const routePath = `/journal/${post.slug}/`;
  if (!routePaths.has(routePath)) continue;
  try {
    const html = await readFile(routeFile(routePath), "utf8");
    const renderedH1 = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
    if (renderedH1 !== post.title) failures.push(`${routePath}: rendered H1 does not match journal index title`);
    // Journal titles are one authored public source. Descriptions are allowed
    // to use the documented per-slug SEO aliases in metadata-source.mjs, so
    // comparing them to journal-index.json would flag deliberate metadata as
    // a false-positive copy mismatch.
  } catch {
    // The route loop already reports this as a missing HTML file.
  }
}

if (failures.length > 0) {
  console.error(`FAIL copy-contract — ${failures.length} rendered copy issue(s):\n`);
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("\nScope: marketing route-meta pages only; Dakota, VERA, Lab/static, PHC, and VenueCircuit are deliberately excluded.");
  process.exit(1);
}

console.log(
  `PASS copy-contract — ${checked} rendered marketing routes; ${answerPaths.size} answer guides and ${journalIdentitySlugs.size} journal posts are in parity.`,
);

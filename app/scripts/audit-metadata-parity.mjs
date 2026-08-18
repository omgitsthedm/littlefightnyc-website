/**
 * Fail the build when first-response and hydrated route metadata diverge.
 *
 * Run after prerender-seo.mjs. This intentionally checks generated artifacts:
 * authored sources can look correct while the browser still receives a stale
 * route-meta.json entry or a stale prerendered <head>.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authoredIsoDate } from "./metadata-source.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const dataRoot = path.join(appRoot, "src", "data");
const distRoot = path.join(appRoot, "dist");
const routeMeta = JSON.parse(await readFile(path.join(dataRoot, "route-meta.json"), "utf8"));
const journal = JSON.parse(await readFile(path.join(dataRoot, "journal-index.json"), "utf8"));
const failures = [];

function decodeHtml(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function cleanText(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function tagAttributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [
      match[1].toLowerCase(),
      decodeHtml(match[3]),
    ]),
  );
}

function metaContent(html, attribute, value) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = tagAttributes(match[0]);
    if (attrs[attribute] === value) return attrs.content ?? "";
  }
  return "";
}

function firstTagText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? cleanText(match[1]) : "";
}

function routeFile(routePath) {
  if (routePath === "/") return path.join(distRoot, "index.html");
  return path.join(distRoot, routePath.replace(/^\/|\/$/g, ""), "index.html");
}

// Shared with the prerenderer on purpose: if the gate normalized dates
// differently than the generator, it would pass while the two disagreed.
const normalizedDate = authoredIsoDate;

function expectEqual(label, actual, expected) {
  if (actual !== expected) {
    failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function absoluteAsset(asset) {
  if (/^https?:\/\//i.test(asset)) return asset;
  return `${routeMeta.site.url.replace(/\/$/, "")}${asset.startsWith("/") ? asset : `/${asset}`}`;
}

function expectSocialMeta(label, html, page) {
  const share = page.share;
  if (!share) {
    failures.push(`${label}: generated route metadata is missing its share record`);
    return;
  }

  const image = absoluteAsset(share.image);
  expectEqual(`${label} og:site_name`, metaContent(html, "property", "og:site_name"), routeMeta.site.name);
  expectEqual(`${label} og:image`, metaContent(html, "property", "og:image"), image);
  expectEqual(`${label} og:image:type`, metaContent(html, "property", "og:image:type"), share.type);
  expectEqual(
    `${label} og:image:width`,
    metaContent(html, "property", "og:image:width"),
    share.width ? String(share.width) : "",
  );
  expectEqual(
    `${label} og:image:height`,
    metaContent(html, "property", "og:image:height"),
    share.height ? String(share.height) : "",
  );
  expectEqual(`${label} og:image:alt`, metaContent(html, "property", "og:image:alt"), share.alt);
  expectEqual(`${label} twitter:image`, metaContent(html, "name", "twitter:image"), image);
  expectEqual(
    `${label} twitter:image:alt`,
    metaContent(html, "name", "twitter:image:alt"),
    share.alt,
  );
}

const paths = routeMeta.pages.map((page) => page.path);
const duplicatePaths = paths.filter((routePath, index) => paths.indexOf(routePath) !== index);
if (duplicatePaths.length > 0) {
  failures.push(`route-meta duplicate paths: ${[...new Set(duplicatePaths)].join(", ")}`);
}

for (const page of routeMeta.pages) {
  let html;
  try {
    html = await readFile(routeFile(page.path), "utf8");
  } catch {
    failures.push(`${page.path}: missing prerendered index.html`);
    continue;
  }
  expectEqual(`${page.path} title`, firstTagText(html, "title"), page.title);
  expectEqual(
    `${page.path} description`,
    metaContent(html, "name", "description"),
    page.description,
  );
  expectEqual(
    `${page.path} robots`,
    metaContent(html, "name", "robots"),
    page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large",
  );
  expectSocialMeta(page.path, html, page);
  if (!page.locale) {
    const navCta = html.match(
      /<a\b([^>]*)class="[^"]*\blf-seo__nav-cta\b[^"]*"([^>]*)>([\s\S]*?)<\/a>/i,
    );
    if (!navCta) {
      failures.push(`${page.path}: missing prerendered primary navigation CTA`);
    } else {
      const attrs = tagAttributes(`<a ${navCta[1]} ${navCta[2]}>`);
      expectEqual(`${page.path} nav CTA label`, cleanText(navCta[3]), "Check my website");
      // The primary CTA lands in the URL field, focused (RouteScrollManager
      // focuses a form control named by the hash) — one tap fewer than the
      // top of the page. The hydrated nav uses the same href.
      expectEqual(
        `${page.path} nav CTA destination`,
        attrs.href,
        "/website-check/#website-check-url",
      );
    }
  }
}

const journalRoutes = routeMeta.pages.filter((page) => page.path.startsWith("/journal/"));
expectEqual("journal route count", journalRoutes.length, journal.length);

for (const post of journal) {
  const routePath = `/journal/${post.slug}/`;
  const page = journalRoutes.find((candidate) => candidate.path === routePath);
  if (!page) {
    failures.push(`${routePath}: missing from route-meta.json`);
    continue;
  }

  const html = await readFile(routeFile(routePath), "utf8");
  expectEqual(`${routePath} H1`, firstTagText(html, "h1"), post.title);
  if (
    page.title === "Little Fight Journal Article | Little Fight NYC" ||
    page.description.startsWith("A Little Fight NYC journal article")
  ) {
    failures.push(`${routePath}: generic fallback metadata shipped`);
  }

  const published = normalizedDate(post.published);
  const updated = normalizedDate(post.updated);
  const expectedModified = updated || published;
  expectEqual(
    `${routePath} article:published_time`,
    metaContent(html, "property", "article:published_time"),
    published,
  );
  expectEqual(
    `${routePath} article:modified_time`,
    metaContent(html, "property", "article:modified_time"),
    expectedModified,
  );

  const publishedTimeInBody = /<time\b[^>]*itemprop="datePublished"/i.test(html);
  const modifiedTimeInBody = /<time\b[^>]*itemprop="dateModified"/i.test(html);
  expectEqual(`${routePath} visible published claim`, publishedTimeInBody, Boolean(published));
  expectEqual(
    `${routePath} visible updated claim`,
    modifiedTimeInBody,
    Boolean(updated && updated !== published),
  );
}

const notFoundHtml = await readFile(path.join(distRoot, "404.html"), "utf8");
expectEqual("404 title", firstTagText(notFoundHtml, "title"), routeMeta.notFound.title);
expectEqual(
  "404 description",
  metaContent(notFoundHtml, "name", "description"),
  routeMeta.notFound.description,
);
expectEqual("404 H1", firstTagText(notFoundHtml, "h1"), routeMeta.notFound.h1);
expectEqual("404 robots", metaContent(notFoundHtml, "name", "robots"), "noindex, follow");
expectSocialMeta("404", notFoundHtml, routeMeta.notFound);

const techAuditHtml = await readFile(routeFile("/tech-audit/"), "utf8");
const techAuditImagePreloads = [...techAuditHtml.matchAll(/<link\b[^>]*rel="preload"[^>]*>/gi)]
  .map((match) => match[0])
  .filter((tag) => /case-(?:after-hours-agenda|hair-by-rachel-charles)/.test(tag));
if (techAuditImagePreloads.length > 0) {
  failures.push(
    "/tech-audit/: static case-image preload conflicts with the query-selected intake hero",
  );
}

if (failures.length > 0) {
  console.error(`Metadata parity audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Metadata parity: ${routeMeta.pages.length} routes, ${journal.length} journal posts, 404, and Tech Audit preload passed.`,
  );
}

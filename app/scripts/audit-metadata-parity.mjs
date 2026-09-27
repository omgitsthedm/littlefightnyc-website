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
const legacyFallbackSocialImage = "/assets/og-tugboat.jpg";

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

function structuredDataNodes(label, html) {
  const nodes = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\btype=["']application\/ld\+json["']/i.test(match[1])) continue;
    try {
      const parsed = JSON.parse(match[2]);
      nodes.push(...(Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed]));
    } catch {
      failures.push(`${label}: ld+json block does not parse`);
    }
  }
  return nodes;
}

function stableJson(value) {
  return JSON.stringify(value);
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

for (const page of [routeMeta.notFound, ...routeMeta.pages]) {
  if (page.share?.image === legacyFallbackSocialImage) {
    failures.push(`${page.path}: metadata still points at the immutable legacy fallback image`);
  }
}

// These routes render their actual React tree before the browser leaf commits.
// Each uses current component markup rather than the legacy SEO header, so
// assert the real buyer path instead of requiring that retired header class.
const componentRouteCtas = {
  "/": [["/tech-audit/?intent=website&source=home", "Get a free first look", true]],
  "/services/": [["/tech-audit/?source=page_hero", "Free consult Free first look", true]],
  "/website-check/": [
    ["#website-check-url", "Check my website"],
    ["/tech-audit/?intent=website&source=no_website_check", "Start a free first look"],
  ],
  "/services/custom-local-websites/": [
    ["/tech-audit/?intent=website&source=page_hero", "Free first look Get a free first look", true],
  ],
  "/nationwide/": [
    ["/tech-audit/?intent=website&source=page_hero", "Free first look Get a free first look", true],
  ],
  "/case-studies/hair-by-rachel-charles/": [
    ["/tech-audit/?intent=website&source=case_hair-by-rachel-charles_hero", "Free first look Get a free first look", true],
  ],
  // The direct form link belongs to the audit contact rail. Checking its
  // component-specific label keeps a generic nav/header link from satisfying
  // the buyer-path assertion.
  "/tech-audit/": [["#fit-step-title", "Form", false, { "data-lf-label": "audit_intro_form" }]],
};

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
  const detailRouteCta = /^\/(?:areas|industries)\/[^/]+\/$/.test(page.path)
    ? page.path === "/industries/salons-wellness/"
      ? [["/tech-audit/?intent=website&source=page_hero", "Free first look Get a free first look", true]]
      : [["/tech-audit/?source=page_hero", "Free consult Free first look", true]]
    : undefined;
  const componentRouteCta = componentRouteCtas[page.path] ?? detailRouteCta;
  if (componentRouteCta) {
    const links = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
      ...tagAttributes(`<a ${match[1]}>`),
      label: cleanText(match[2]),
    }));
    for (const [href, label, primary = false, requiredAttributes = {}] of componentRouteCta) {
      if (!links.some((link) => link.href === href && link.label === label &&
        (!primary || link["data-lf-primary-action"] === "true") &&
        Object.entries(requiredAttributes).every(([name, value]) => link[name] === value))) {
        failures.push(`${page.path}: missing rendered starting path ${label}`);
      }
    }
  } else if (!page.locale) {
    const navCta = html.match(
      /<a\b([^>]*)class="[^"]*\blf-seo__nav-cta\b[^"]*"([^>]*)>([\s\S]*?)<\/a>/i,
    );
    if (!navCta) {
      failures.push(`${page.path}: missing prerendered primary navigation CTA`);
    } else {
      const attrs = tagAttributes(`<a ${navCta[1]} ${navCta[2]}>`);
      expectEqual(`${page.path} nav CTA label`, cleanText(navCta[3]), "Get a free first look");
      // The primary CTA includes owners without a website. Legacy URL-field
      // deep links remain available for visitors checking an existing site.
      expectEqual(
        `${page.path} nav CTA destination`,
        attrs.href,
        "/tech-audit/?intent=website&source=nav",
      );
    }
  }
}

// The public entity is a New York service-area business on every route. A
// nationwide remote-website offer belongs to its own Service node; it must not
// silently widen the Organization that also represents local IT support.
const organizationId = `${routeMeta.site.url.replace(/\/$/, "")}/#organization`;
const localBusinessId = `${routeMeta.site.url.replace(/\/$/, "")}/#localbusiness`;
let businessAreaSignature;
for (const page of routeMeta.pages) {
  let html;
  try {
    html = await readFile(routeFile(page.path), "utf8");
  } catch {
    continue;
  }
  const nodes = structuredDataNodes(page.path, html);
  const organization = nodes.find((node) => node["@id"] === organizationId);
  const localBusiness = nodes.find((node) => node["@id"] === localBusinessId);
  if (!organization || !localBusiness) {
    failures.push(`${page.path}: missing Organization or ProfessionalService ld+json node`);
    continue;
  }
  const organizationArea = stableJson(organization.areaServed);
  const localBusinessArea = stableJson(localBusiness.areaServed);
  const localAreas = Array.isArray(localBusiness.areaServed) ? localBusiness.areaServed : [];
  if (!localAreas.some((area) => area["@type"] === "City" && area.name === "New York")
    || localAreas.some((area) => area["@type"] === "Country")) {
    failures.push(`${page.path}: business areaServed must retain its New York service area`);
  }
  expectEqual(`${page.path} Organization areaServed`, organizationArea, localBusinessArea);
  if (page.path === "/services/it-support/") {
    const support = nodes.find((node) => node["@id"] === `${routeMeta.site.url}/services/it-support/#service`);
    expectEqual("IT Support service area", stableJson(support?.areaServed), localBusinessArea);
  }
  if (businessAreaSignature === undefined) {
    businessAreaSignature = localBusinessArea;
  } else {
    expectEqual(`${page.path} business areaServed consistency`, localBusinessArea, businessAreaSignature);
  }
}

const nationwideHtml = await readFile(routeFile("/nationwide/"), "utf8");
const nationwideNodes = structuredDataNodes("/nationwide/", nationwideHtml);
const nationwideUrl = `${routeMeta.site.url.replace(/\/$/, "")}/nationwide/`;
const nationwideService = nationwideNodes.find((node) => node["@id"] === `${nationwideUrl}#service`);
if (!nationwideService) {
  failures.push("/nationwide/: missing distinct remote-website Service ld+json node");
} else {
  expectEqual("/nationwide/ Service type", nationwideService["@type"], "Service");
  expectEqual("/nationwide/ Service name", nationwideService.name, "Remote small business websites");
  expectEqual(
    "/nationwide/ Service areaServed",
    stableJson(nationwideService.areaServed),
    stableJson([{ "@type": "Country", name: "United States" }]),
  );
  expectEqual("/nationwide/ Service provider", nationwideService.provider?.["@id"], localBusinessId);
  expectEqual("/nationwide/ Service URL", nationwideService.offers?.url, nationwideUrl);
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

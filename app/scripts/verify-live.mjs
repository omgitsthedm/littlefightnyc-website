import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const baseUrl = (process.env.LIVE_URL || "https://littlefightnyc.com").replace(/\/$/, "");
const canonicalBaseUrl = (process.env.CANONICAL_URL || baseUrl).replace(/\/$/, "");
const failures = [];

function gitHead() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

function tagContent(html, attribute, name) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries(
      [...match[0].matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((item) => [
        item[1].toLowerCase(),
        item[3],
      ]),
    );
    if (attrs[attribute] === name) return attrs.content || "";
  }
  return "";
}

function canonicalHref(html) {
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = Object.fromEntries(
      [...match[0].matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((item) => [
        item[1].toLowerCase(),
        item[3],
      ]),
    );
    if (attrs.rel === "canonical") return attrs.href || "";
  }
  return "";
}

async function get(pathname, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "follow",
    headers: { "user-agent": "LFNYC-Quality-Spine/1.0" },
  });
  if (response.status !== expectedStatus) {
    failures.push(`${pathname}: expected ${expectedStatus}, got ${response.status}`);
  }
  return response;
}

async function head(pathname, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "HEAD",
    redirect: "follow",
    headers: { "user-agent": "LFNYC-Quality-Spine/1.0" },
  });
  if (response.status !== expectedStatus) {
    failures.push(`${pathname}: expected ${expectedStatus}, got ${response.status}`);
  }
  return response;
}

const expectedRevision = process.env.EXPECTED_REVISION?.trim() || gitHead();
const releaseResponse = await get("/release.json");
if (releaseResponse.ok) {
  const release = await releaseResponse.json();
  if (expectedRevision && release.revision !== expectedRevision) {
    failures.push(
      `/release.json: live ${release.revision || "unknown"} does not match expected ${expectedRevision}`,
    );
  }
  if (release.branch !== "main") failures.push(`/release.json: expected branch main, got ${release.branch}`);
  if (release.source_dirty) failures.push("/release.json: production artifact reports dirty source");
}

const htmlRoutes = [
  "/",
  "/services/",
  "/services/custom-local-websites/",
  "/services/new-business-launch/",
  "/services/ongoing-care/",
  "/website-check/",
  "/clients/",
  "/tech-audit/?intent=website",
  "/examples/",
  "/examples/lab/",
  "/examples/lab/concepts/pool-room/",
  "/case-studies/hair-by-rachel-charles/",
  "/library/",
  "/about/",
  "/contact/",
];

for (const pathname of htmlRoutes) {
  const response = await get(pathname);
  const html = await response.text();
  const routePath = pathname.split("?")[0];
  if (!/<title>[^<]+<\/title>/i.test(html)) failures.push(`${pathname}: missing title`);
  if (!/<main\b/i.test(html)) failures.push(`${pathname}: missing prerendered main`);
  if (tagContent(html, "name", "robots").includes("noindex")) {
    failures.push(`${pathname}: unexpectedly noindex`);
  }
  const canonical = canonicalHref(html);
  const expectedCanonical = `${canonicalBaseUrl}${routePath}`;
  if (canonical !== expectedCanonical) {
    failures.push(`${pathname}: canonical ${canonical || "missing"} != ${expectedCanonical}`);
  }
  for (const [attribute, name] of [
    ["property", "og:image"],
    ["property", "og:image:alt"],
    ["name", "twitter:image"],
    ["name", "twitter:image:alt"],
  ]) {
    if (!tagContent(html, attribute, name)) failures.push(`${pathname}: missing ${name}`);
  }
}

const homeResponse = await get("/");
for (const header of [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
]) {
  if (!homeResponse.headers.get(header)) failures.push(`/: missing ${header} header`);
}

for (const [pathname, contentType] of [
  ["/robots.txt", "text/plain"],
  ["/sitemap.xml", "application/xml"],
  ["/sitemap-index.xml", "application/xml"],
  ["/image-sitemap.xml", "application/xml"],
  ["/site.webmanifest", "application/manifest+json"],
  ["/favicon.svg", "image/svg+xml"],
  ["/apple-touch-icon.png", "image/png"],
]) {
  const response = await get(pathname);
  const actual = response.headers.get("content-type") || "";
  if (!actual.includes(contentType)) {
    failures.push(`${pathname}: expected ${contentType}, got ${actual || "missing"}`);
  }
}

for (const name of ["public", "archive", "meta"]) {
  const pathname = `/vera/data/${name}.json`;
  const response = await get(pathname);
  const robots = response.headers.get("x-robots-tag") || "";
  const contentType = response.headers.get("content-type") || "";
  const cacheControl = response.headers.get("cache-control") || "";
  const etag = response.headers.get("etag") || "";
  if (robots !== "noindex, nofollow") {
    failures.push(
      `${pathname}: expected X-Robots-Tag noindex, nofollow, got ${robots || "missing"}`,
    );
  }
  if (!contentType.includes("application/json")) {
    failures.push(
      `${pathname}: expected application/json, got ${contentType || "missing"}`,
    );
  }
  if (!cacheControl.includes("max-age=300")) {
    failures.push(
      `${pathname}: expected cache policy containing max-age=300, got ${cacheControl || "missing"}`,
    );
  }
  if (!etag) failures.push(`${pathname}: missing ETag validator`);

  const headResponse = await head(pathname);
  for (const header of ["x-robots-tag", "content-type", "cache-control", "etag"]) {
    if (headResponse.headers.get(header) !== response.headers.get(header)) {
      failures.push(`${pathname}: HEAD ${header} does not match GET`);
    }
  }

  if (etag) {
    const conditionalResponse = await fetch(`${baseUrl}${pathname}`, {
      redirect: "follow",
      headers: {
        "if-none-match": etag,
        "user-agent": "LFNYC-Quality-Spine/1.0",
      },
    });
    if (conditionalResponse.status !== 304) {
      failures.push(
        `${pathname}: conditional GET expected 304, got ${conditionalResponse.status}`,
      );
    }
    if (conditionalResponse.headers.get("x-robots-tag") !== "noindex, nofollow") {
      failures.push(`${pathname}: conditional GET lost X-Robots-Tag`);
    }
  }
}

const poolPath = "/examples/lab/concepts/pool-room/";
const poolResponse = await get(poolPath);
const poolHtml = await poolResponse.text();
for (const header of [
  "content-security-policy",
  "strict-transport-security",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
]) {
  if (!poolResponse.headers.get(header)) failures.push(`${poolPath}: missing ${header} header`);
}
const poolCsp = poolResponse.headers.get("content-security-policy") || "";
for (const forbidden of ["cdnjs.cloudflare.com", "unpkg.com", "esm.sh"]) {
  if (poolCsp.includes(forbidden)) {
    failures.push(`${poolPath}: Pool Room CSP still permits ${forbidden}`);
  }
}
if (!poolCsp.includes("script-src 'self'")) {
  failures.push(`${poolPath}: Pool Room CSP is not same-origin for scripts`);
}
for (const [attribute, name, expected] of [
  ["property", "og:url", `${canonicalBaseUrl}${poolPath}`],
  [
    "property",
    "og:image",
    `${canonicalBaseUrl}${poolPath}img/opening/12-room-hero.webp`,
  ],
  ["name", "twitter:card", "summary_large_image"],
]) {
  const actual = tagContent(poolHtml, attribute, name);
  if (actual !== expected) failures.push(`${poolPath}: ${name} ${actual || "missing"} != ${expected}`);
}
if (!poolHtml.includes('kind="captions"') || !poolHtml.includes('kind="descriptions"')) {
  failures.push(`${poolPath}: caption or visual-description track is missing`);
}
if (!poolHtml.includes('href="break-film-audio-described.mp4"')) {
  failures.push(`${poolPath}: audio-described film alternative is missing`);
}
try {
  const jsonLd = JSON.parse(
    poolHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1] || "{}",
  );
  if (jsonLd["@type"] !== "VideoObject" || jsonLd.duration !== "PT30S") {
    failures.push(`${poolPath}: VideoObject data is missing or incomplete`);
  }
} catch {
  failures.push(`${poolPath}: VideoObject JSON-LD does not parse`);
}

for (const [pathname, contentType, cacheToken] of [
  [`${poolPath}break-film.webm`, "video/webm", "max-age=86400"],
  [`${poolPath}break-film.mp4`, "video/mp4", "max-age=86400"],
  [`${poolPath}break-film-audio-described.mp4`, "video/mp4", "max-age=86400"],
  [`${poolPath}img/break-film-poster.webp`, "image/webp", "max-age=86400"],
  [`${poolPath}break-film-captions.vtt`, "text/vtt", null],
  [`${poolPath}break-film-descriptions.vtt`, "text/vtt", null],
]) {
  const response = await head(pathname);
  const actualType = response.headers.get("content-type") || "";
  if (!actualType.includes(contentType)) {
    failures.push(`${pathname}: expected ${contentType}, got ${actualType || "missing"}`);
  }
  if (cacheToken && !(response.headers.get("cache-control") || "").includes(cacheToken)) {
    failures.push(`${pathname}: expected cache policy containing ${cacheToken}`);
  }
}

const sitemapResponse = await get("/sitemap.xml");
const sitemapBody = await sitemapResponse.text();
for (const route of ["/examples/lab/", poolPath]) {
  if (!sitemapBody.includes(`${canonicalBaseUrl}${route}`)) failures.push(`/sitemap.xml: missing ${route}`);
}

const missingResponse = await get("/quality-spine-definitely-missing/", 404);
const missingHtml = await missingResponse.text();
if (!tagContent(missingHtml, "name", "robots").includes("noindex")) {
  failures.push("404 response is missing noindex");
}

if (failures.length) {
  console.error(`Live verification failed (${failures.length}) against ${baseUrl}:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Live verification passed for ${baseUrl} at ${expectedRevision.slice(0, 12)}: revision, core routes, metadata, headers, VERA feed directives, public assets, Pool Room media and accessibility tracks, Lab, and 404.`,
  );
  console.log("This command does not submit the Tech Audit or assert provider/inbox delivery.");
}

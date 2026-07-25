import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const baseUrl = (process.env.LIVE_URL || "https://littlefightnyc.com").replace(/\/$/, "");
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
  "/tech-audit/?intent=website",
  "/examples/",
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
  const expectedCanonical = `${baseUrl}${routePath}`;
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

await get("/examples/lab/");
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
    `Live verification passed for ${baseUrl} at ${expectedRevision.slice(0, 12)}: revision, core routes, metadata, headers, public assets, Lab, and 404.`,
  );
  console.log("This command does not submit the Tech Audit or assert provider/inbox delivery.");
}

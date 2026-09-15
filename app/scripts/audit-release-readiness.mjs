import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "..");
const distRoot = path.join(appRoot, "dist");
const failures = [];
const expectedRouteCount = 218;

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const dirty = git(["status", "--porcelain"]);
if (dirty && process.env.ALLOW_DIRTY_RELEASE !== "1") {
  failures.push("working tree is not clean; commit the exact release candidate first");
}

const revision = git(["rev-parse", "HEAD"], "unknown");
const releasePath = path.join(distRoot, "release.json");
if (!(await exists(releasePath))) {
  failures.push("dist/release.json is missing; run npm run build");
} else {
  const release = JSON.parse(await readFile(releasePath, "utf8"));
  if (release.revision !== revision) {
    failures.push(
      `release metadata revision ${release.revision} does not match HEAD ${revision}`,
    );
  }
  if (release.source_dirty && process.env.ALLOW_DIRTY_RELEASE !== "1") {
    failures.push("release metadata records a dirty source build");
  }
}

for (const relative of [
  "index.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "image-sitemap.xml",
  "sitemap-index.xml",
  "llms.txt",
  "site.webmanifest",
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "assets/og-tugboat.jpg",
]) {
  if (!(await exists(path.join(distRoot, relative)))) failures.push(`dist/${relative} is missing`);
}

const routeMeta = JSON.parse(
  await readFile(path.join(appRoot, "src", "data", "route-meta.json"), "utf8"),
);
if (routeMeta.pages.length !== expectedRouteCount) {
  failures.push(
    `expected ${expectedRouteCount} generated routes, found ${routeMeta.pages.length}`,
  );
}

const home = await readFile(path.join(distRoot, "index.html"), "utf8");
for (const needle of [
  'property="og:site_name"',
  'property="og:image:alt"',
  'name="twitter:image:alt"',
]) {
  if (!home.includes(needle)) failures.push(`home metadata is missing ${needle}`);
}

const prerenderSource = await readFile(path.join(here, "prerender-seo.mjs"), "utf8");
if (/AEO money node/i.test(prerenderSource)) {
  failures.push("prerender source still describes schema as an AEO money node");
}

if (failures.length) {
  console.error(`Release-readiness audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Release artifact verified at ${revision.slice(0, 12)}: ${expectedRouteCount} routes, identity edges, sitemaps, and public recovery files are present.`,
  );
  console.log(
    "External form delivery, authenticated analytics/search, social debugger, and owner-evidence checks remain manual evidence gates outside this audit.",
  );
}

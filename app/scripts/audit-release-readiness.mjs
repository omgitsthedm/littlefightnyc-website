import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "..");
const distRoot = path.join(appRoot, "dist");
const failures = [];
const expectedTileCount = 133;
const expectedOriginalTileCount = 110;
const expectedRouteCount = 405;

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

async function artifactFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await artifactFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

async function artifactHash() {
  const markerNames = new Set(["tile-release.json", "preview-release.json", "release.json"]);
  const byPathParts = (left, right) => {
    const a = path.relative(distRoot, left).split(path.sep);
    const b = path.relative(distRoot, right).split(path.sep);
    for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
      if (a[index] < b[index]) return -1;
      if (a[index] > b[index]) return 1;
    }
    return a.length - b.length;
  };
  const files = (await artifactFiles(distRoot))
    .filter((file) => !markerNames.has(path.basename(file)))
    // Match pathlib.Path ordering in finalize-tile-artifact.py: compare path
    // segments, not a locale-sorted whole filename.
    .sort(byPathParts);
  const digest = createHash("sha256");
  for (const file of files) {
    digest.update(path.relative(distRoot, file).split(path.sep).join("/"));
    digest.update("\0");
    digest.update(await readFile(file));
  }
  return { value: digest.digest("hex"), files: files.length };
}

// Netlify discovers top-level source files as deployable functions. A colocated
// *.test.ts file becomes an invalid function name even when app tests pass.
for (const entry of await readdir(path.join(repoRoot, "netlify", "functions"), { withFileTypes: true })) {
  if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
  if (!entry.isDirectory() && !/\.(?:[cm]?[jt]s)$/u.test(entry.name)) continue;
  const name = entry.isDirectory() ? entry.name : entry.name.replace(/\.[^.]+$/u, "");
  if (!/^[A-Za-z0-9_-]+$/u.test(name)) {
    failures.push(`invalid deployable function name: ${entry.name}; keep tests in _shared`);
  }
}

const dirty = git(["status", "--porcelain"]);
if (dirty && process.env.ALLOW_DIRTY_RELEASE !== "1") {
  failures.push("working tree is not clean; commit the exact release candidate first");
}

const revision = git(["rev-parse", "HEAD"], "unknown");
const releasePath = path.join(distRoot, "release.json");
const tileReleasePath = path.join(distRoot, "tile-release.json");
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

if (!(await exists(tileReleasePath))) {
  failures.push("dist/tile-release.json is missing; run npm run build");
} else {
  const tileRelease = JSON.parse(await readFile(tileReleasePath, "utf8"));
  if (tileRelease.kind !== "static-production-candidate") {
    failures.push("tile release marker is not a static production candidate");
  }
  if (tileRelease.routes !== expectedRouteCount) {
    failures.push(`expected ${expectedRouteCount} static routes, found ${tileRelease.routes}`);
  }
  if (tileRelease.tiles !== expectedTileCount || tileRelease.originalTilesPreserved !== expectedOriginalTileCount) {
    failures.push(`expected ${expectedTileCount} tiles with ${expectedOriginalTileCount} originals preserved`);
  }
  if (tileRelease.hashScope !== "All final artifact files except release markers") {
    failures.push("tile release hash scope is not the final artifact marker exclusion contract");
  }
  const actual = await artifactHash();
  if (tileRelease.artifactSha256 !== actual.value) {
    failures.push("tile release artifact SHA256 does not match the final deploy artifact");
  }
  if (tileRelease.artifactFiles !== actual.files) {
    failures.push(`tile release file count ${tileRelease.artifactFiles} does not match ${actual.files}`);
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
  "assets/social/og-tiles.jpg",
]) {
  if (!(await exists(path.join(distRoot, relative)))) failures.push(`dist/${relative} is missing`);
}

const home = await readFile(path.join(distRoot, "index.html"), "utf8");
for (const needle of [
  'property="og:site_name"',
  'property="og:image:alt"',
  'name="twitter:image:alt"',
]) {
  if (!home.includes(needle)) failures.push(`home metadata is missing ${needle}`);
}

if (failures.length) {
  console.error(`Release-readiness audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Release artifact verified at ${revision.slice(0, 12)}: ${expectedRouteCount} static routes, ${expectedTileCount} tiles, final artifact hash, sitemaps, and public recovery files are present.`,
  );
  console.log(
    "External form delivery, authenticated analytics/search, social debugger, and owner-evidence checks remain manual evidence gates outside this audit.",
  );
}

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
const expectedTotalTileInventory = 129;
const expectedOriginalTileCount = 106;
const expectedConsolidatedGroups = 19;
const expectedRouteCount = 399;

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

function outputFile(route) {
  const clean = route.replace(/^\/+/, "");
  if (!clean) return path.join(distRoot, "index.html");
  if (route.endsWith("/") || !path.basename(clean).includes(".")) return path.join(distRoot, clean, "index.html");
  return path.join(distRoot, clean);
}

async function readHomepageInventory() {
  const file = path.join(distRoot, "homepage-inventory.json");
  if (!(await exists(file))) {
    failures.push("dist/homepage-inventory.json is missing");
    return null;
  }
  let inventory;
  try {
    inventory = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    failures.push(`homepage inventory is not valid JSON: ${error.message}`);
    return null;
  }
  if (!inventory || typeof inventory !== "object") {
    failures.push("homepage inventory must be an object");
    return null;
  }
  for (const field of ["visibleTiles", "retainedRoutes", "groups", "hiddenHomeIds"]) {
    if (!Array.isArray(inventory[field])) failures.push(`homepage inventory ${field} must be an array`);
  }
  if (!Array.isArray(inventory.visibleTiles) || !Array.isArray(inventory.retainedRoutes)
    || !Array.isArray(inventory.groups) || !Array.isArray(inventory.hiddenHomeIds)) return null;
  if (inventory.sourceTileCount !== expectedOriginalTileCount) failures.push(`homepage inventory source count must be ${expectedOriginalTileCount}`);
  if (inventory.totalTileInventory !== expectedTotalTileInventory) failures.push(`homepage inventory total count must be ${expectedTotalTileInventory}`);
  if (inventory.groups.length !== expectedConsolidatedGroups) failures.push(`homepage inventory must contain ${expectedConsolidatedGroups} consolidated groups`);
  const visibleIds = inventory.visibleTiles.map(item => item?.id);
  const retainedIds = inventory.retainedRoutes.map(item => item?.id);
  const members = inventory.groups.flatMap(group => Array.isArray(group?.members) ? group.members : []);
  const hidden = new Set([...members, ...inventory.hiddenHomeIds]);
  if (visibleIds.some(id => typeof id !== "string" || !id) || new Set(visibleIds).size !== visibleIds.length) {
    failures.push("homepage inventory visible tiles need unique ids");
  }
  if (retainedIds.some(id => typeof id !== "string" || !id) || new Set(retainedIds).size !== retainedIds.length
    || retainedIds.length !== expectedTotalTileInventory) {
    failures.push(`homepage inventory must retain ${expectedTotalTileInventory} unique tile routes`);
  }
  if (inventory.visibleTiles.length !== expectedTotalTileInventory - hidden.size) {
    failures.push("homepage inventory visible count must equal total inventory minus unique absorbed/hidden ids");
  }
  if (visibleIds.some(id => hidden.has(id))) failures.push("homepage inventory exposes an absorbed or hidden tile");
  if (new Set(retainedIds).size === retainedIds.length
    && (retainedIds.some(id => !visibleIds.includes(id) && !hidden.has(id))
      || [...visibleIds, ...hidden].some(id => !retainedIds.includes(id)))) {
    failures.push("homepage inventory routes do not account for every visible or absorbed/hidden tile");
  }
  for (const item of inventory.retainedRoutes) {
    if (!item || typeof item.path !== "string" || !item.path || typeof item.title !== "string" || !item.title
      || typeof item.homePath !== "string" || !item.homePath) {
      failures.push(`homepage inventory retained route ${item?.id || "?"} needs path, title, and homePath`);
    }
  }
  return inventory;
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
  if (tileRelease.originalTilesPreserved !== expectedOriginalTileCount) failures.push(`expected ${expectedOriginalTileCount} original tiles preserved`);
  if (tileRelease.totalTileInventory !== expectedTotalTileInventory) failures.push(`expected ${expectedTotalTileInventory} total tile inventory`);
  if (tileRelease.consolidatedGroups !== expectedConsolidatedGroups) failures.push(`expected ${expectedConsolidatedGroups} consolidated groups`);
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

const homepageInventory = await readHomepageInventory();
if (homepageInventory && (await exists(tileReleasePath))) {
  const tileRelease = JSON.parse(await readFile(tileReleasePath, "utf8"));
  if (tileRelease.tiles !== homepageInventory.visibleTiles.length) {
    failures.push(`release marker visible tiles ${tileRelease.tiles} do not match homepage inventory ${homepageInventory.visibleTiles.length}`);
  }
  const searchFile = path.join(distRoot, "search-index.json");
  if (!(await exists(searchFile))) {
    failures.push("dist/search-index.json is missing");
  } else {
    const search = JSON.parse(await readFile(searchFile, "utf8"));
    const searchPaths = new Set(search.filter(row => row && typeof row === "object").map(row => row.path));
    for (const item of homepageInventory.retainedRoutes) {
      if (!item?.path?.startsWith("/")) continue;
      const pathname = new URL(item.path, "https://littlefightnyc.com").pathname;
      const target = outputFile(pathname);
      if (!(await exists(target)) || !(await readFile(target, "utf8")).trim()) failures.push(`retained route is missing or empty: ${item.path}`);
      if (pathname !== "/" && !searchPaths.has(pathname)) failures.push(`retained route is missing from search index: ${item.path}`);
    }
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
    `Release artifact verified at ${revision.slice(0, 12)}: ${expectedRouteCount} static routes, ${expectedTotalTileInventory} retained tile routes, final artifact hash, sitemaps, and public recovery files are present.`,
  );
  console.log(
    "External form delivery, authenticated analytics/search, social debugger, and owner-evidence checks remain manual evidence gates outside this audit.",
  );
}

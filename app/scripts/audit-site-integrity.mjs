/**
 * Post-build site integrity gate.
 *
 * Walks every generated HTML document, verifies local links and assets resolve,
 * catches duplicate IDs, and confirms every cataloged application route exists.
 * This intentionally uses no browser or third-party parser so it can run in
 * every deploy environment after `npm run build`.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(appRoot, "dist");
const routeMetaPath = path.join(appRoot, "src", "data", "route-meta.json");
const navIndexPath = path.join(appRoot, "src", "data", "nav-index.json");
const seoPagesPath = path.join(appRoot, "src", "data", "seo-pages.json");
const redirectsPath = path.join(appRoot, "public", "_redirects");
const siteOrigin = "https://littlefightnyc.com";
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(filePath) : [filePath];
    }),
  );
  return nested.flat();
}

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function stripMarkup(value) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|quot|#39);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function references(html) {
  const direct = [...html.matchAll(/\b(?:href|src|poster)=["']([^"']+)["']/gi)]
    .map((match) => match[1]);
  const srcsets = [...html.matchAll(/\bsrcset=["']([^"']+)["']/gi)]
    .flatMap((match) => match[1].split(","))
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
  return [...direct, ...srcsets];
}

function localPath(reference, documentPath) {
  const trimmed = reference.trim();
  if (
    !trimmed ||
    /^(?:#|mailto:|tel:|sms:|data:|blob:|javascript:)/i.test(trimmed)
  ) {
    return null;
  }

  let url;
  try {
    url = new URL(trimmed, `${siteOrigin}/${documentPath.replaceAll(path.sep, "/")}`);
  } catch {
    return null;
  }
  if (url.origin !== siteOrigin) return null;
  return decodeURIComponent(url.pathname);
}

async function resolves(pathname) {
  const clean = pathname.replace(/^\/+/, "");
  const target = path.join(distRoot, clean);
  const candidates = path.extname(clean)
    ? [target]
    : [
        target,
        path.join(target, "index.html"),
        `${target}.html`,
      ];
  for (const candidate of candidates) {
    if (await isFile(candidate)) return true;
  }
  return false;
}

const redirectsSource = await readFile(redirectsPath, "utf8");
const redirectRules = redirectsSource
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+#.*$/, "").trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/))
  .filter(([source, , status]) => source && status && status !== "404")
  .map(([source, destination, status]) => ({ source, destination, status }));

function redirected(pathname) {
  return redirectRules.some(({ source }) => {
    if (source.endsWith("/*")) {
      return pathname.startsWith(source.slice(0, -1));
    }
    return pathname === source;
  });
}

const files = await walk(distRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
if (htmlFiles.length < 220) {
  failures.push(`generated HTML count is unexpectedly low: ${htmlFiles.length}`);
}

const missingReferences = new Map();
for (const file of htmlFiles) {
  const relative = path.relative(distRoot, file);
  const html = await readFile(file, "utf8");
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  for (const id of duplicateIds) {
    failures.push(`${relative}: duplicate id="${id}"`);
  }

  const title = stripMarkup(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  if (!title) failures.push(`${relative}: missing document title`);

  for (const reference of references(html)) {
    const pathname = localPath(reference, relative);
    if (!pathname || pathname === "/") continue;
    if (await resolves(pathname) || redirected(pathname)) continue;
    const key = `${relative} -> ${reference}`;
    missingReferences.set(key, true);
  }
}

for (const missing of missingReferences.keys()) {
  failures.push(`missing local target: ${missing}`);
}

const routeMeta = JSON.parse(await readFile(routeMetaPath, "utf8"));
const navIndex = JSON.parse(await readFile(navIndexPath, "utf8"));
const seoData = JSON.parse(await readFile(seoPagesPath, "utf8"));
const catalogedRoutes = new Map(
  (routeMeta.pages ?? []).map((route) => [route.path, route]),
);

// Service detail pages build their neighborhood links client-side from
// `areaPages`, which also feeds the generated Neighborhoods nav index. Cross
// that client-authored area catalog with the canonical service matrix so a
// neighborhood can never ship links to service-area pages the build omitted.
const clientAreaSlugs = navIndex
  .filter((item) => item.group === "Neighborhoods")
  .map((item) => item.to.match(/^\/areas\/([^/]+)\/$/)?.[1])
  .filter(Boolean);
const matrixServiceSlugs = (seoData.matrix?.services ?? [])
  .map((service) => service.slug)
  .filter(Boolean);

if (clientAreaSlugs.length === 0) {
  failures.push("client neighborhood catalog is empty");
}
if (matrixServiceSlugs.length === 0) {
  failures.push("service-area matrix is empty");
}

for (const areaSlug of clientAreaSlugs) {
  for (const serviceSlug of matrixServiceSlugs) {
    const expectedPath = `/areas/${areaSlug}/${serviceSlug}/`;
    const catalogedRoute = catalogedRoutes.get(expectedPath);
    if (!catalogedRoute) {
      failures.push(`client service-area route was not cataloged: ${expectedPath}`);
    } else if (catalogedRoute.noindex !== true) {
      failures.push(`client service-area route must remain noindex: ${expectedPath}`);
    }
  }
}

for (const route of routeMeta.pages ?? []) {
  if (!(await resolves(route.path))) {
    failures.push(`cataloged route was not generated: ${route.path}`);
  }
}

for (const { source, destination, status } of redirectRules) {
  if (!/^30[1278]$/.test(status) || /^(?:https?:)?\/\//i.test(destination)) continue;
  const pathname = destination.split("#", 1)[0].split("?", 1)[0];
  if (!pathname || pathname.includes(":splat")) continue;
  if (!(await resolves(pathname)) && !redirected(pathname)) {
    failures.push(`${source}: redirect destination does not resolve: ${destination}`);
  }
}

const brandKit = await readFile(path.join(distRoot, "brand-kit", "index.html"), "utf8");
if (!/<main(?:\s|>)/i.test(brandKit) || !/<\/main>/i.test(brandKit)) {
  failures.push("brand-kit/index.html is missing its main landmark");
}

const homeDocument = await readFile(path.join(distRoot, "index.html"), "utf8");
const homeHero = "/images/brand-scenes/storefronts-dawn";
if (
  !homeDocument.includes(`rel="preload" href="${homeHero}-1200.webp"`) ||
  !homeDocument.includes(`${homeHero}.webp 1672w`)
) {
  failures.push("home image preload does not match the current QuietHero scene");
}
if (/data-route-preload[^>]+hero-soho-crosswalk/i.test(homeDocument)) {
  failures.push("home still preloads the retired SoHo hero image");
}

if (failures.length > 0) {
  console.error(`Site integrity audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site integrity: ${htmlFiles.length} HTML documents, ${routeMeta.pages.length} cataloged routes, local links, assets, titles, and IDs passed.`,
);

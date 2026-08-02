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

// Every rule in file order, including the 404 catch-all that redirectRules
// deliberately drops. Shadowing is only detectable with the catch-all present,
// and the catch-all is exactly what silently swallowed three retirement
// redirects that were appended below it — they served 404s for a day while
// this audit still passed, because the existing check only asks whether a
// destination resolves, and /examples/lab/ resolves fine.
const orderedRedirectRules = redirectsSource
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+#.*$/, "").trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/))
  .filter(([source, destination]) => source && destination)
  .map(([source, destination, status]) => ({ source, destination, status }));

function patternMatches(pattern, pathname) {
  if (pattern.endsWith("/*")) return pathname.startsWith(pattern.slice(0, -1));
  if (pattern === "/*") return true;
  return pattern === pathname;
}

// Resolve what an earlier rule would actually serve for a given path, so that
// a redundant rule producing an identical result is not reported. /labs/* ->
// /examples/lab/:splat already covers /labs/ with the same destination and
// status; that pairing is deliberate and harmless. What matters is shadowing
// that CHANGES the outcome — a 404 catch-all swallowing a 301, for instance.
function resolveDestination(rule, pathname) {
  if (!rule.destination.includes(":splat")) return rule.destination;
  const prefix = rule.source.endsWith("/*") ? rule.source.slice(0, -1) : rule.source;
  const splat = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "";
  return rule.destination.replace(":splat", splat);
}

for (let i = 0; i < orderedRedirectRules.length; i += 1) {
  const rule = orderedRedirectRules[i];
  // Probe with the most specific path the rule can serve.
  const probe = rule.source.endsWith("/*") ? rule.source.slice(0, -1) : rule.source;
  for (let j = 0; j < i; j += 1) {
    const earlier = orderedRedirectRules[j];
    if (earlier.source === rule.source) continue;
    if (!patternMatches(earlier.source, probe)) continue;

    const earlierServes = resolveDestination(earlier, probe);
    const ruleServes = resolveDestination(rule, probe);
    if (earlierServes === ruleServes && earlier.status === rule.status) break;

    failures.push(
      `_redirects: "${rule.source}" can never fire — "${earlier.source}" appears earlier and serves ` +
        `${earlierServes} (${earlier.status}) instead of ${ruleServes} (${rule.status})`,
    );
    break;
  }
}

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

  // The prerendered skip link is visually hidden until focused, so if it ever
  // stops being emitted nobody looking at the page would notice — only a
  // keyboard user on a slow connection, who has no way to report it. Assert it
  // exists and that its target id is actually on the page.
  if (html.includes('class="lf-seo"')) {
    const skipHref = html.match(/class="lf-seo__skip"\s+href="#([^"]+)"/)?.[1];
    if (!skipHref) {
      failures.push(`${relative}: prerendered body has no skip link`);
    } else if (!ids.includes(skipHref)) {
      failures.push(`${relative}: skip link points at #${skipHref}, which no element carries`);
    }
  }

  // FAQPage markup must describe Q&A the reader can actually find. The JSON-LD
  // emitter and the body builders used to read different sources, so 8 pages
  // published 16 pairs that appeared nowhere on the page. Google's structured
  // data policy treats markup describing invisible content as spam, and nothing
  // here would have caught it — the JSON was valid, the page rendered fine.
  if (html.includes('"FAQPage"')) {
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "");
    const visible = stripMarkup(stripped).replace(/\s+/g, " ");
    for (const block of html.matchAll(
      /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi,
    )) {
      let parsed;
      try {
        parsed = JSON.parse(block[1]);
      } catch {
        failures.push(`${relative}: ld+json block does not parse`);
        continue;
      }
      const stack = [parsed];
      while (stack.length > 0) {
        const node = stack.pop();
        if (Array.isArray(node)) {
          stack.push(...node);
          continue;
        }
        if (!node || typeof node !== "object") continue;
        if (node["@type"] === "FAQPage") {
          for (const entry of node.mainEntity ?? []) {
            const question = stripMarkup(String(entry?.name ?? "")).replace(/\s+/g, " ").trim();
            if (question && !visible.includes(question.slice(0, 45))) {
              failures.push(
                `${relative}: FAQPage declares a question the page does not show — "${question.slice(0, 60)}"`,
              );
            }
          }
        }
        stack.push(...Object.values(node).filter((v) => v && typeof v === "object"));
      }
    }
  }

  // The site makes no third-party request until a visitor opts in — except that
  // five sample audit reports pulled a Google Fonts stylesheet, handing Google
  // every reader's IP and User-Agent before any consent interaction, for two
  // faces the pages never rendered (flagship.css overrode --font-heading and
  // --font-body, so document.fonts listed Libre Baskerville and Lato as
  // "unloaded"). Removing them changed zero pixels.
  //
  // The Lab concept pages are exempt for now, and the reason is specific: all
  // eight request Barlow Condensed, which is genuinely load-bearing — every one
  // of their stylesheets uses it, and unlike Barlow, Oswald and JetBrains Mono
  // it is not self-hosted. growth-street and studio-engine also render
  // Fraunces. Removing the link there would change the typography on eight
  // builds, so it waits on self-hosting those two families. Logged as
  // FONTS-001; the exemption is a list rather than a pattern so a new page
  // cannot inherit it silently.
  const THIRD_PARTY_FONT_EXEMPT = new Set([
    "examples/lab/concepts/aha-laser/index.html",
    "examples/lab/concepts/goliath/index.html",
    "examples/lab/concepts/growth-street/index.html",
    "examples/lab/concepts/micro-animations/index.html",
    "examples/lab/concepts/pill-scroll/index.html",
    "examples/lab/concepts/studio-engine/index.html",
    "examples/lab/concepts/terminal-3d/index.html",
    "examples/lab/concepts/walkup-3d/index.html",
  ]);
  if (!THIRD_PARTY_FONT_EXEMPT.has(relative.replaceAll(path.sep, "/"))) {
    for (const [, host] of html.matchAll(
      /<link\b[^>]*href="https?:\/\/([^/"]+)[^"]*"[^>]*>/gi,
    )) {
      if (/(?:^|\.)littlefightnyc\.com$/.test(host)) continue;
      failures.push(
        `${relative}: links a stylesheet or preconnect to ${host} — a third-party ` +
          "request before consent. Self-host it, or add it to " +
          "THIRD_PARTY_FONT_EXEMPT with the reason.",
      );
    }
  }

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

// Every indexable page must be reachable by following links in the prerendered
// HTML, not only after React mounts. 23 pages — case studies, industries,
// studio projects, glossary terms — were in the sitemap but had no inbound link
// anywhere in the static markup, so nothing pointed crawl value at them on a
// site whose entire model is prerender-first. The sitemap hid it: they were
// found, just never recommended by anything.
const inboundTargets = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const match of body.matchAll(/href="(\/[^"#?]*)"/g)) {
    inboundTargets.add(match[1].replace(/\/$/, "") + "/");
  }
}
// A page that canonicalises elsewhere is an alias, not a destination —
// /privacy/ and /terms/ both render the Legal page and point at /legal/.
// Requiring inbound links to an alias would push the site back toward linking
// one document under three URLs, which is what the canonical fixed.
const canonicalAlias = new Set();
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) continue;
  const ownPath = "/" + path.relative(distRoot, file).replace(/index\.html$/, "");
  const canonicalPath = canonical.replace(siteOrigin, "");
  if (canonicalPath !== ownPath) canonicalAlias.add(ownPath);
}

for (const route of routeMeta.pages ?? []) {
  const routePath = route.path;
  if (!routePath || routePath === "/" || route.noindex) continue;
  if (canonicalAlias.has(routePath)) continue;
  if (!inboundTargets.has(routePath)) {
    failures.push(
      `${routePath} is indexable but nothing links to it in any prerendered body — ` +
        `it is discoverable only via the sitemap or after hydration`,
    );
  }
}

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
// The acquisition hero is intentionally type + form led. Its first real image
// sits in the proof rail below the fold, so an eager route image competes with
// the heading fonts and form CSS without improving LCP.
if (/rel="preload"[^>]+as="image"[^>]+data-route-preload/i.test(homeDocument)) {
  failures.push("home preloads an image even though the current hero is type and form led");
}
if (/data-route-preload[^>]+(?:hero-soho-crosswalk|storefronts-dawn)/i.test(homeDocument)) {
  failures.push("home still preloads a retired image-led hero");
}

if (failures.length > 0) {
  console.error(`Site integrity audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Site integrity: ${htmlFiles.length} HTML documents, ${routeMeta.pages.length} cataloged routes, local links, assets, titles, and IDs passed.`,
);

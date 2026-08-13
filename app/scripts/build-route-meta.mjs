/**
 * Emit the lightweight route metadata used after client-side navigation.
 *
 * The first response gets the same fields from prerender-seo.mjs. Both scripts
 * share metadata-source.mjs, while authored routes come from seo-pages.json,
 * journal-index.json, and industries.json. This keeps first-response and
 * hydrated metadata in lockstep without shipping the full SEO/schema payload
 * to every visitor.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { build as esbuildBundle } from "esbuild";
import {
  NOT_FOUND_PAGE,
  enrichAuthoredRoutePages,
  glossaryPages,
  industryPage,
  journalPage,
  localePages,
  serviceAreaPages,
  shareForPage,
} from "./metadata-source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const dataDir = join(appDir, "src", "data");
const assetsDir = join(appDir, "public", "assets");
const seoData = JSON.parse(readFileSync(join(dataDir, "seo-pages.json"), "utf8"));
const journal = JSON.parse(readFileSync(join(dataDir, "journal-index.json"), "utf8"));
const industries = JSON.parse(readFileSync(join(dataDir, "industries.json"), "utf8"));

// Dynamic routes render from typed app data, not seo-pages.json. Bundle the
// same module the app imports so client-side metadata has the current H1,
// short answer, and FAQ from that one authored source.
const siteDataOut = join(appDir, "node_modules", ".prerender", "site-data-route-meta.mjs");
mkdirSync(dirname(siteDataOut), { recursive: true });
await esbuildBundle({
  entryPoints: [join(dataDir, "site.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: siteDataOut,
  logLevel: "silent",
});
const siteContent = await import(pathToFileURL(siteDataOut).href);
const authoredPages = enrichAuthoredRoutePages(seoData.pages, siteContent, seoData.site.name);

// Bundle the app's answer-art map so hydrated navigation and first-response
// metadata resolve the same authored artwork from one source of truth.
const prerenderDir = join(appDir, "node_modules", ".prerender");
const answersArtOut = join(prerenderDir, "answers-art-route-meta.mjs");
mkdirSync(prerenderDir, { recursive: true });
await esbuildBundle({
  entryPoints: [join(dataDir, "answersArt.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: answersArtOut,
  logLevel: "silent",
});
const { answerArt } = await import(pathToFileURL(answersArtOut).href);

function hasDedicatedJournalImage(slug) {
  return existsSync(join(assetsDir, `journal-${slug}.webp`));
}

function withRenderedAnswerArt(page) {
  const answerMatch = page.path.match(/^\/answers\/([^/]+)\/$/);
  if (!answerMatch) return page;

  const image = answerArt(answerMatch[1]);
  return existsSync(join(appDir, "public", image)) ? { ...page, image } : page;
}

function clientMeta(page) {
  return {
    path: page.path,
    title: page.title,
    description: page.description,
    // Keep this browser payload to the fields RouteMeta actually uses. The
    // complete H1, short answer, FAQ, and visible body remain auditable in the
    // generated route HTML; duplicating them here made every visit download
    // more than 100 KB of copy that no client-side code reads.
    image: page.image,
    share: shareForPage(page, seoData.site.name),
    type: page.type,
    noindex: page.noindex === true || undefined,
    locale: page.locale,
    published: page.published || undefined,
    updated: page.updated || undefined,
  };
}

const pages = [
  ...authoredPages,
  ...serviceAreaPages(seoData),
  ...glossaryPages(seoData, siteContent.glossaryTerms),
  ...journal.map((post) => journalPage(post, hasDedicatedJournalImage)),
  ...industries.map(industryPage),
  ...localePages(),
].map(withRenderedAnswerArt).map(clientMeta);

const duplicatePaths = pages
  .map((page) => page.path)
  .filter((path, index, paths) => paths.indexOf(path) !== index);
if (duplicatePaths.length > 0) {
  throw new Error(`route-meta.json has duplicate paths: ${[...new Set(duplicatePaths)].join(", ")}`);
}

const out = {
  site: {
    name: seoData.site.name,
    url: seoData.site.url,
    latitude: seoData.site.latitude,
    longitude: seoData.site.longitude,
  },
  notFound: {
    ...clientMeta(NOT_FOUND_PAGE),
    h1: NOT_FOUND_PAGE.h1,
    headingLead: NOT_FOUND_PAGE.headingLead,
    headingEmphasis: NOT_FOUND_PAGE.headingEmphasis,
    dek: NOT_FOUND_PAGE.dek,
  },
  pages,
};

writeFileSync(join(dataDir, "route-meta.json"), JSON.stringify(out) + "\n");
console.log(
  `route-meta.json: ${pages.length} routes (${journal.length} journal posts; shared with prerender metadata)`,
);

// CoverageMatrix only needs the {slug,label} service columns — emit them alone
// so it does not pull the full seo-pages.json payload into its chunk.
const matrixServices = (seoData.matrix?.services ?? []).map((service) => ({
  slug: service.slug,
  label: service.label,
}));
writeFileSync(join(dataDir, "matrix-services.json"), JSON.stringify(matrixServices) + "\n");
console.log(`matrix-services.json: ${matrixServices.length} service columns`);

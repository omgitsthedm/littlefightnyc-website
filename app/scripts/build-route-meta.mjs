/**
 * Emit the lightweight route metadata used after client-side navigation.
 *
 * The first response gets the same fields from prerender-seo.mjs. Both scripts
 * share metadata-source.mjs, while authored routes come from seo-pages.json,
 * journal-index.json, and industries.json. This keeps first-response and
 * hydrated metadata in lockstep without shipping the full SEO/schema payload
 * to every visitor.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  NOT_FOUND_PAGE,
  glossaryPages,
  industryPage,
  journalPage,
  localePages,
  serviceAreaPages,
} from "./metadata-source.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const dataDir = join(appDir, "src", "data");
const assetsDir = join(appDir, "public", "assets");
const seoData = JSON.parse(readFileSync(join(dataDir, "seo-pages.json"), "utf8"));
const journal = JSON.parse(readFileSync(join(dataDir, "journal-index.json"), "utf8"));
const industries = JSON.parse(readFileSync(join(dataDir, "industries.json"), "utf8"));

function hasDedicatedJournalImage(slug) {
  return existsSync(join(assetsDir, `journal-${slug}.webp`));
}

function clientMeta(page) {
  return {
    path: page.path,
    title: page.title,
    description: page.description,
    image: page.image,
    type: page.type,
    noindex: page.noindex === true || undefined,
    locale: page.locale,
    published: page.published || undefined,
    updated: page.updated || undefined,
  };
}

const pages = [
  ...seoData.pages,
  ...serviceAreaPages(seoData),
  ...glossaryPages(seoData),
  ...journal.map((post) => journalPage(post, hasDedicatedJournalImage)),
  ...industries.map(industryPage),
  ...localePages(),
].map(clientMeta);

const duplicatePaths = pages
  .map((page) => page.path)
  .filter((path, index, paths) => paths.indexOf(path) !== index);
if (duplicatePaths.length > 0) {
  throw new Error(`route-meta.json has duplicate paths: ${[...new Set(duplicatePaths)].join(", ")}`);
}

const out = {
  site: {
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

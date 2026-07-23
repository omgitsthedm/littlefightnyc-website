/**
 * Generate nav-index.json — the slim {label,to,group} destination list the
 * CommandPalette needs. The palette used to import the whole 200KB+ site.ts
 * (case studies, answer guides, area pages, glossary, services) just for these
 * labels, and because the palette renders on EVERY page that pulled the entire
 * site data chunk into the universal path.
 *
 * site.ts couples data with lucide React icon components, so it can't be
 * required from a plain node script. Bundle it with esbuild (icons tree-shaken,
 * react/lucide left external + resolved from the project node_modules), import
 * the result, and read the plain string fields. Runs at build (see package.json).
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, "..");
const cacheDir = join(appDir, "node_modules", ".cache");
mkdirSync(cacheDir, { recursive: true });
const bundlePath = join(cacheDir, "site-nav-bundle.mjs");

await esbuild.build({
  entryPoints: [join(appDir, "src", "data", "site.ts")],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: bundlePath,
  external: ["react", "react-dom", "lucide-react"],
  logLevel: "silent",
});

const site = await import(pathToFileURL(bundlePath).href + "?t=" + Date.now());

const nav = [
  ...site.services.map((s) => ({ label: s.eyebrow, to: `/services/${s.slug}/`, group: "Services" })),
  ...site.caseStudies.map((c) => ({ label: c.showcase?.label ?? c.client, to: `/case-studies/${c.slug}/`, group: "Case studies" })),
  ...site.answerGuides.map((a) => ({ label: a.question, to: `/answers/${a.slug}/`, group: "Answers" })),
  ...site.glossaryTerms.map((t) => ({ label: t.term, to: `/glossary/${t.slug}/`, group: "Glossary" })),
  ...site.areaPages.map((a) => ({ label: a.name, to: `/areas/${a.slug}/`, group: "Neighborhoods" })),
];

writeFileSync(join(appDir, "src", "data", "nav-index.json"), JSON.stringify(nav) + "\n");
rmSync(bundlePath, { force: true });
console.log(`nav-index.json: ${nav.length} destinations (site.ts off the command-palette path)`);

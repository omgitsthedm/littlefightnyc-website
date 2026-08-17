/**
 * Keep VERA's renter-law guidance specific, sourced, and consistent between
 * the app and the crawlable Field Manual. This is a copy guard, not legal
 * advice and not a substitute for checking the cited primary sources.
 */
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const corePath = path.join(appRoot, "public", "vera", "assets", "js", "vera-core.js");
const appPath = path.join(appRoot, "public", "vera", "assets", "js", "vera-app.js");
const ledgerPath = path.join(appRoot, "public", "vera", "assets", "js", "vera-ledger.js");
const prerenderPath = path.join(appRoot, "scripts", "vera-prerender.mjs");
const indexPath = path.join(appRoot, "public", "vera", "index.html");
const serviceWorkerPath = path.join(appRoot, "public", "vera", "sw.js");
const mapStylePath = path.join(appRoot, "public", "vera", "assets", "vendor", "maplibre", "style", "liberty-local.json");
const mapStyleRoot = path.dirname(mapStylePath);
const openFreeMapLicensePath = path.join(mapStyleRoot, "LICENSE-OPENFREEMAP.md");
const notoLicensePath = path.join(mapStyleRoot, "LICENSE-NOTO.txt");
const mapSourcePath = path.join(mapStyleRoot, "SOURCE.md");
const glyphRoot = path.join(mapStyleRoot, "fonts");
const glyphFonts = ["Noto Sans Regular", "Noto Sans Bold", "Noto Sans Italic"];
const manualPath = path.join(appRoot, "dist", "vera", "manual", "index.html");

const sources = [
  "https://www.nysenate.gov/legislation/laws/RPP/238-A",
  "https://www.nyc.gov/site/dca/about/FAQ-Broker-Fees.page",
  "https://hcr.ny.gov/most-common-rent-regulation-issues-tenants",
  "https://hcr.ny.gov/fact-sheet-2",
  "https://www.nyc.gov/pl/main/services/rent-increase-guide",
];
const failures = [];

function mustContain(label, text, expected) {
  if (!text.includes(expected)) failures.push(`${label}: missing ${JSON.stringify(expected)}`);
}

function mustNotContain(label, text, unexpected) {
  if (text.includes(unexpected)) failures.push(`${label}: retains superseded copy ${JSON.stringify(unexpected)}`);
}

const [
  core,
  app,
  ledger,
  prerender,
  index,
  serviceWorker,
  mapStyle,
  openFreeMapLicense,
  notoLicense,
  mapSource,
  glyphFiles,
] = await Promise.all([
  readFile(corePath, "utf8"),
  readFile(appPath, "utf8"),
  readFile(ledgerPath, "utf8"),
  readFile(prerenderPath, "utf8"),
  readFile(indexPath, "utf8"),
  readFile(serviceWorkerPath, "utf8"),
  readFile(mapStylePath, "utf8"),
  readFile(openFreeMapLicensePath, "utf8"),
  readFile(notoLicensePath, "utf8"),
  readFile(mapSourcePath, "utf8"),
  Promise.all(glyphFonts.map((font) => readdir(path.join(glyphRoot, font)))),
]);

for (const source of sources) mustContain("vera-core.js LAW_SOURCES", core, source);
mustContain("vera-core.js", core, "actual cost or $20, whichever is less");
mustContain("vera-core.js", core, "legal tenant, owner, or an authorized representative");
mustContain("vera-core.js", core, "Fewer than six units makes ordinary stabilization less likely, not impossible");
mustContain("vera-core.js", core, "before or at the beginning of the tenancy");
mustContain("vera-core.js", core, "Lawful rent and up to one month of security may still be due under the lease");
mustNotContain("vera-core.js", core, "upheld on appeal July 2026");
mustNotContain("vera-core.js", core, "in about a week");
mustNotContain("vera-core.js", core, "Nothing should leave your hand until");

mustContain("vera-app.js", app, "data-legal-sources");
mustContain("vera-app.js", app, "a broker representing the landlord, or publishing their listing with permission, cannot charge you");
mustContain("vera-app.js", app, "actual cost or $20, whichever is less");
mustContain("vera-app.js", app, "before or at the beginning of the tenancy");
mustContain("vera-app.js", app, "Lawful rent and up to one month of security may still be due under the lease");
mustNotContain("vera-app.js", app, "upheld on appeal July 2026");

mustContain("vera-ledger.js", ledger, "actual cost or $20, whichever is less");
mustContain("vera-ledger.js", ledger, "before or at the beginning of the tenancy");
mustNotContain("vera-ledger.js", ledger, "any money before lease signing");
mustNotContain("vera-ledger.js", ledger, "before the lease is executed");

mustContain("vera-prerender.mjs", prerender, "C.LAW_SOURCES.map");
mustContain("vera-prerender.mjs", prerender, "before or at the beginning of the tenancy");
mustContain("vera-prerender.mjs", prerender, "Lawful rent and up to one month of security may still be due under the lease");
mustContain("vera-prerender.mjs", prerender, "a broker representing the landlord, or publishing their listing with permission, cannot charge you");

for (const asset of [
  "./assets/css/vera.css?v=61",
  "./assets/js/vera-core.js?v=51",
  "./assets/js/vera-geo.js?v=60",
  "./assets/js/vera-map.js?v=60",
  "./assets/js/vera-ledger.js?v=58",
  "./assets/js/vera-app.js?v=61",
]) {
  mustContain("vera/index.html cache contract", index, asset);
  mustContain("vera/sw.js cache contract", serviceWorker, asset.replace("./", "/vera/"));
}
mustContain("vera-app.js Atlas style contract", app, "./assets/vendor/maplibre/style/liberty-local.json");
mustContain("vera-app.js acceptance harness contract", app, "./assets/js/vera-tests.js?v=57");
mustContain("liberty-local.json Atlas style contract", mapStyle, "\"sprite\":\"/vera/assets/vendor/maplibre/style/sprite/ofm\"");
mustContain("liberty-local.json Atlas style contract", mapStyle, "\"glyphs\":\"/vera/assets/vendor/maplibre/style/fonts/{fontstack}/{range}.pbf\"");
mustContain("OpenFreeMap vendor notice", openFreeMapLicense, "Copyright (c) 2023 Zsolt Ero");
mustContain("Noto vendor notice", notoLicense, "SIL OPEN FONT LICENSE Version 1.1");
mustContain("Atlas vendor provenance", mapSource, "72e1480dfc92858d334647037988bd2591fdb021");
mustContain("Atlas vendor provenance", mapSource, "104,594,877");
glyphFiles.forEach((files, fontIndex) => {
  const publishedRanges = new Set(files.filter((file) => file.endsWith(".pbf")));
  for (let start = 0; start <= 65280; start += 256) {
    const expected = `${start}-${start + 255}.pbf`;
    if (!publishedRanges.has(expected)) {
      failures.push(`${glyphFonts[fontIndex]} Atlas glyph contract: missing ${expected}`);
    }
  }
});
const glyphStats = await Promise.all(glyphFonts.flatMap((font, fontIndex) =>
  glyphFiles[fontIndex].filter((file) => file.endsWith(".pbf")).map((file) =>
    stat(path.join(glyphRoot, font, file)),
  ),
));
const glyphBytes = glyphStats.reduce((total, entry) => total + entry.size, 0);
if (glyphBytes > 105_000_000) {
  failures.push(`Atlas glyph bundle exceeds its 105,000,000-byte release cap (${glyphBytes})`);
}
mustContain("vera/sw.js cache contract", serviceWorker, "vera-shell-v14");
mustNotContain("vera-core.js", core, "before the lease is executed");
mustNotContain("vera-app.js", app, "before the lease is executed");
mustNotContain("vera-prerender.mjs", prerender, "before the lease is executed");

try {
  await access(manualPath);
  const manual = await readFile(manualPath, "utf8");
  for (const source of sources) mustContain("dist/vera/manual/index.html", manual, source);
  mustContain("dist/vera/manual/index.html", manual, "actual cost or $20, whichever is less");
  mustContain("dist/vera/manual/index.html", manual, "before or at the beginning of the tenancy");
  mustContain("dist/vera/manual/index.html", manual, "Lawful rent and up to one month of security may still be due under the lease");
  mustNotContain("dist/vera/manual/index.html", manual, "upheld on appeal July 2026");
} catch {
  // Source-only use is useful before a build. The normal quality lane runs this
  // after `npm run build`, where the rendered document is asserted too.
}

if (failures.length) {
  console.error("VERA legal-content audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("VERA legal-content audit passed: exact current renter-law copy and primary-source links are present.");

#!/usr/bin/env node
/**
 * Visual proof coverage ratchet.
 *
 * This checks the small, visible contracts that keep owner-facing explanations
 * from quietly reverting to text-only pages. It checks authored render
 * contracts plus the compiled public runtime (the static prerender is an SEO
 * shell), and uses the authored JSON contract for journal bodies, which load
 * after a reader opens the post.
 *
 * Dakota, VERA, PHC, and the frozen VenueCircuit presentation are explicitly
 * excluded from coverage targets. The final boundary check only makes sure the
 * reusable marker is not introduced into those protected sources.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = path.join(appRoot, "src");
const dataRoot = path.join(sourceRoot, "data");
const distRoot = path.join(appRoot, "dist");
const failures = [];

function fail(message) {
  failures.push(message);
}

async function text(relativePath) {
  return readFile(path.join(appRoot, relativePath), "utf8");
}

async function renderedRuntimeMarkers(markers) {
  const assetsRoot = path.join(distRoot, "assets");
  if (!existsSync(assetsRoot)) {
    fail("rendered visual-proof audit needs dist/assets; run it after the production build");
    return;
  }
  const chunks = (await readdir(assetsRoot))
    .filter((file) => file.endsWith(".js"))
    .map((file) => readFile(path.join(assetsRoot, file), "utf8"));
  const runtime = (await Promise.all(chunks)).join("\n");
  for (const marker of markers) {
    if (!runtime.includes("data-lf-visual-proof") || !runtime.includes(marker)) {
      fail(`rendered runtime: visual marker ${marker} is missing from the built public application`);
    }
  }
}

function nonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function nonemptyStrings(value) {
  return Array.isArray(value) && value.length > 0 && value.every(nonemptyString);
}

function directHttps(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

const routeMeta = JSON.parse(await text("src/data/route-meta.json"));
const routes = routeMeta.pages;

const answerRoutes = routes.filter((page) => page.path.startsWith("/answers/"));
if (answerRoutes.length !== 27) {
  fail(`answer route coverage: expected 27 routes, found ${answerRoutes.length}`);
}
const answerGuideSource = await text("src/pages/AnswerGuide.tsx");
if (!/data-lf-visual-proof="answer"/u.test(answerGuideSource)) {
  fail("AnswerGuide must render data-lf-visual-proof=answer for every answer route");
}
if (!/answerVisualKind\(guide\.slug\)/u.test(answerGuideSource)) {
  fail("AnswerGuide must choose a visual kind from the authored answer slug");
}

const serviceAreaRoutes = routes.filter((page) => /^\/areas\/[^/]+\/[^/]+\/$/u.test(page.path));
if (serviceAreaRoutes.length !== 72) {
  fail(`service-area route coverage: expected 72 routes, found ${serviceAreaRoutes.length}`);
}
for (const page of serviceAreaRoutes) {
  if (page.noindex !== true) fail(`${page.path}: service-area route must remain noindex`);
}
const serviceAreaSource = await text("src/pages/ServiceAreaDetail.tsx");
if (!/data-lf-visual-proof="area-service"/u.test(serviceAreaSource)) {
  fail("ServiceAreaDetail must render data-lf-visual-proof=area-service");
}
if (!/<ServiceDiagram\s+slug=\{service\.slug\}/u.test(serviceAreaSource)) {
  fail("ServiceAreaDetail visual marker must contain the service-specific diagram");
}

for (const [sourcePath, marker] of [
  ["src/pages/NewBusinessLaunch.tsx", "new-business-launch"],
  ["src/pages/OngoingCare.tsx", "ongoing-care"],
  ["src/pages/Nationwide.tsx", "nationwide"],
]) {
  const source = await text(sourcePath);
  if (!source.includes("ConnectedPathDiagram") || !source.includes(`proof="${marker}"`)) {
    fail(`${sourcePath}: must render ConnectedPathDiagram proof=${marker}`);
  }
}

const journalPostSource = await text("src/pages/JournalPost.tsx");
const journalInsightSource = await text("src/components/dataviz/JournalInsight.tsx");
if (!/JournalInsight\s+category=\{post\.category\}[\s\S]{0,180}insight=\{ready\.insight\}/u.test(journalPostSource)) {
  fail("JournalPost must render each loaded journal insight before its long-form body");
}
if (!/data-lf-visual-proof="journal"/u.test(journalInsightSource)) {
  fail("JournalInsight must retain data-lf-visual-proof=journal");
}
if (!/Source check:[\s\S]{0,160}Scope:[\s\S]{0,160}Limit:/u.test(journalInsightSource)) {
  fail("JournalInsight must show a source-check date, scope, and limit beside its links");
}

const journalBodyRoot = path.join(dataRoot, "journal-bodies");
const journalBodies = (await readdir(journalBodyRoot)).filter((file) => file.endsWith(".json"));
if (journalBodies.length !== 37) {
  fail(`journal insight coverage: expected 37 body files, found ${journalBodies.length}`);
}
for (const filename of journalBodies) {
  const payload = JSON.parse(await readFile(path.join(journalBodyRoot, filename), "utf8"));
  const insight = payload.insight;
  if (!insight || !nonemptyString(insight.answer)) fail(`${filename}: insight.answer must be nonempty`);
  if (!insight || !nonemptyStrings(insight.watch)) fail(`${filename}: insight.watch must be a nonempty text list`);
  if (!insight || !nonemptyStrings(insight.next)) fail(`${filename}: insight.next must be a nonempty text list`);
  if (!insight || !Array.isArray(insight.sources)) {
    fail(`${filename}: insight.sources must be an array`);
    continue;
  }
  for (const [index, source] of insight.sources.entries()) {
    if (!nonemptyString(source?.label) || !directHttps(source?.href)) {
      fail(`${filename}: insight.sources[${index}] must have a label and direct HTTPS href`);
    }
  }
}

const calculatorFiles = [
  "src/components/dataviz/EvidenceFoundation.tsx",
  "src/components/dataviz/OwnerCalculators.tsx",
  "src/components/dataviz/ownerMath.ts",
  "src/components/dataviz/currency.ts",
  "src/components/dataviz/MoneyLeakMeter.tsx",
  "src/components/dataviz/WebsiteNightShift.tsx",
  "scripts/test-owner-math.mjs",
];
for (const relativePath of calculatorFiles) {
  if (!existsSync(path.join(appRoot, relativePath))) {
    fail(`calculator foundation: required file is missing: ${relativePath}`);
  }
}

const packageJson = JSON.parse(await text("package.json"));
if (packageJson.scripts?.["test:owner-math"] !== "node scripts/test-owner-math.mjs") {
  fail("calculator foundation: test:owner-math must run scripts/test-owner-math.mjs");
}

const calculatorSource = await text("src/components/dataviz/OwnerCalculators.tsx");
for (const match of calculatorSource.matchAll(/https?:\/\/[^\s"'`<>]+/gu)) {
  if (!directHttps(match[0])) fail(`calculator foundation: public source must use HTTPS (${match[0]})`);
}

const ownerMathSource = await text("src/components/dataviz/ownerMath.ts");
for (const contract of [
  "people",
  "hoursPerWeek",
  "affectedSharePercent",
  "contributionPerCustomer",
  "checkoutExposure",
]) {
  if (!ownerMathSource.includes(contract)) fail(`calculator foundation: ownerMath is missing ${contract}`);
}

for (const contract of [
  "CurrencySelect",
  "Estimated annual staff cost",
  "Possible gross revenue exposure",
  "Known annual subscription total",
  "Contribution from one confirmed customer",
  "Four-week gross revenue-at-risk scenario",
  "Gross value attached to unfinished checkouts",
  'kind={metrics.length ? "measured" : "not-measured"}',
]) {
  if (!calculatorSource.includes(contract)) fail(`calculator UI contract is missing: ${contract}`);
}

const moneyLeakSource = await text("src/components/dataviz/MoneyLeakMeter.tsx");
if (
  !/Estimated gross revenue at risk/u.test(moneyLeakSource) ||
  !/<th scope="row">Weekly<\/th>/u.test(moneyLeakSource) ||
  !/<th scope="row">Four weeks<\/th>/u.test(moneyLeakSource) ||
  !/<th scope="row">Annual<\/th>/u.test(moneyLeakSource) ||
  !/weeks:\s*52/u.test(moneyLeakSource)
) {
  fail("MoneyLeakMeter must show weekly, four-week, and annual gross-revenue-at-risk scenarios");
}

const serviceDetailSource = await text("src/pages/ServiceDetail.tsx");
for (const component of ["CopyPasteTax", "DowntimeClock", "MissedCallMeter", "SubscriptionStack", "MoneyLeakMeter", "WebsiteNightShift", "OwnerPath"]) {
  if (!serviceDetailSource.includes(component)) fail(`service visual placement is missing ${component}`);
}

const industryDetailSource = await text("src/pages/IndustryDetail.tsx");
for (const component of ["CheckoutLeak", "DowntimeClock", "MissedCallMeter", "RecoveryReadiness", "WebsiteNightShift"]) {
  if (!industryDetailSource.includes(component)) fail(`industry visual placement is missing ${component}`);
}

const flowSource = await text("src/components/dataviz/FlowDiagram.tsx");
const flowCss = await text("src/components/dataviz/FlowDiagram.css");
if (/repeatCount="indefinite"/u.test(flowSource) || /\binfinite\b/u.test(flowCss)) {
  fail("FlowDiagram must not run perpetual pulse motion");
}

if (failures.length === 0) {
  try {
    execFileSync(process.execPath, [path.join(appRoot, "scripts/test-owner-math.mjs")], {
      cwd: appRoot,
      stdio: "pipe",
    });
  } catch {
    fail("calculator foundation: owner-math formula regression test failed");
  }
}

const protectedSourcePaths = [
  "src/pages/CaseStudyDetail.tsx",
  "src/pages/StudioDetail.tsx",
  "src/components/editorial/WorkShowcase.tsx",
  "src/components/editorial/ProjectReviewGrid.tsx",
];
for (const relativePath of protectedSourcePaths) {
  const source = await text(relativePath);
  if (/data-lf-visual-proof|ConnectedPathDiagram/u.test(source)) {
    fail(`${relativePath}: generic visual-proof markers cannot enter protected Venue/Dakota/VERA presentation paths`);
  }
}

for (const protectedDirectory of ["src/dakota", "public/vera"]) {
  const fullDirectory = path.join(appRoot, protectedDirectory);
  const entries = await readdir(fullDirectory, { recursive: true });
  for (const entry of entries) {
    const file = path.join(fullDirectory, entry);
    if (!existsSync(file) || !/\.(?:[cm]?[jt]sx?|html|css)$/u.test(entry)) continue;
    if (/data-lf-visual-proof|ConnectedPathDiagram/u.test(await readFile(file, "utf8"))) {
      fail(`${protectedDirectory}/${entry}: generic visual-proof marker is not allowed in a protected surface`);
    }
  }
}

await renderedRuntimeMarkers([
  "answer",
  "journal",
  "area-service",
  "new-business-launch",
  "ongoing-care",
  "nationwide",
  "owner-calculator",
  "customer-path",
  "website-night-shift",
  "measurement-path",
  "glossary",
  "language",
]);

if (failures.length > 0) {
  console.error(`Visual-proof coverage audit failed (${failures.length}):`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(
  "Visual-proof coverage audit passed: 27 answers, 37 journal insights, 72 noindex service-area routes, revenue paths, owner calculators, motion limits, citations, and protected boundaries.",
);

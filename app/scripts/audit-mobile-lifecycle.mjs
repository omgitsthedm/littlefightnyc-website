import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const registerSource = await readFile(new URL("../public/register-sw.js", import.meta.url), "utf8");
const workerSource = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");
const boundarySource = await readFile(new URL("../src/components/ErrorBoundary.tsx", import.meta.url), "utf8");
const noticeSource = await readFile(new URL("../src/components/SiteNotices.tsx", import.meta.url), "utf8");
const forceFieldSource = await readFile(new URL("../src/kernel/ForceField.tsx", import.meta.url), "utf8");
const parallaxSource = await readFile(new URL("../src/lib/heroParallax.ts", import.meta.url), "utf8");
const platformSource = await readFile(new URL("../src/styles/editorial/platform.css", import.meta.url), "utf8");
const appSource = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const languageSwitcherSource = await readFile(
  new URL("../src/components/LanguageSwitcher.tsx", import.meta.url),
  "utf8",
);
const shellSource = await readFile(
  new URL("../src/components/editorial/EditorialShell.tsx", import.meta.url),
  "utf8",
);
const examplesSource = await readFile(new URL("../src/pages/FieldGuide.tsx", import.meta.url), "utf8");
const homePathsSource = await readFile(
  new URL("../src/components/editorial/TheFour.tsx", import.meta.url),
  "utf8",
);

for (const [label, source, forbidden] of [
  ["service-worker registration", registerSource, ["controllerchange", "visibilitychange", "location.reload", "postMessage", "lf:sw-update-ready"]],
  ["service worker", workerSource, ["clients.claim", "skipWaiting", "ACTIVATE_UPDATE"]],
  ["site notices", noticeSource, ["Site update ready", "Refresh now", "lf:sw-update-ready"]],
]) {
  for (const token of forbidden) {
    assert.equal(
      source.includes(token),
      false,
      `${label} must not force mobile tabs to update or reload via ${token}`,
    );
  }
}

assert.match(registerSource, /\.register\("\/sw\.js"\)/, "service worker must remain registered");
assert.match(
  noticeSource,
  /const \[visible, setVisible\] = useState\(false\)/,
  "analytics preferences must stay closed until the visitor opens them from the footer",
);
assert.doesNotMatch(
  noticeSource,
  /getAnalyticsConsent\(\) === null/,
  "a first visit must not trigger an analytics overlay",
);

assert.match(
  boundarySource,
  /Importing a module script failed/i,
  "ErrorBoundary must recognize WebKit's dynamic-import error",
);
assert.match(
  boundarySource,
  /storageAvailable &&/,
  "ErrorBoundary must require a durable reload guard before refreshing",
);

assert.match(
  forceFieldSource,
  /\(hover: hover\) and \(pointer: fine\)/,
  "the root force-field ticker must stay off on touch-first devices",
);
assert.match(
  parallaxSource,
  /\(pointer: coarse\), \(hover: none\)/,
  "the JavaScript parallax fallback must stay off on touch-first devices",
);
assert.match(
  platformSource,
  /@media \(pointer: coarse\), \(hover: none\)/,
  "touch-device rendering must keep a dedicated performance guard",
);
for (const selector of [
  ".lf-nav[data-scrolled=\"true\"]",
  ".lf-owner-story__media img",
  ".lf-fight__steps::before",
]) {
  assert.equal(
    platformSource.includes(selector),
    true,
    `touch-device performance guard must cover ${selector}`,
  );
}

assert.match(
  appSource,
  /lazy\(\(\) => importWithRetry\(importer\)\)/,
  "route chunks must retry once before a guarded full-page recovery",
);
const eagerPageImports = [...appSource.matchAll(/import \w+ from "@\/pages\/([^"]+)"/g)].map(
  (match) => match[1],
);
assert.deepEqual(
  eagerPageImports,
  ["Home"],
  "Home must be the only eager page; route code must not inflate every mobile visit",
);
for (const [label, source] of [
  ["application routes", appSource],
  ["language switcher", languageSwitcherSource],
  ["editorial shell metadata", shellSource],
]) {
  assert.doesNotMatch(
    source,
    /lazy\(\(\) => import\(/,
    `${label} must not bypass the transient chunk retry`,
  );
}

assert.match(
  examplesSource,
  /\/images\/lab-showcase\//,
  "Examples must use bounded showcase thumbnails instead of full-resolution Lab source images",
);
assert.match(
  examplesSource,
  /srcSet=\{`\$\{build\.poster\}-480\.webp 480w, \$\{build\.poster\}-800\.webp 800w`\}/,
  "Examples Lab thumbnails must retain responsive 480px and 800px candidates",
);
assert.doesNotMatch(
  examplesSource,
  /image: "\/examples\/lab\//,
  "Examples must not decode full-resolution Lab source images while scrolling",
);
assert.doesNotMatch(
  homePathsSource,
  /\$\{image\}-1200\.webp|\$\{image\}\.webp 1672w/,
  "mobile service cards must not offer source images larger than their rendered card",
);
for (const slug of [
  "brownstone-walkup",
  "cinematic-3d",
  "scroll-motion",
  "micro-animations",
  "studio-engine",
  "growth-street",
  "goliath",
  "hero-prototype",
  "tech-support",
]) {
  for (const width of [480, 800]) {
    const thumbnail = await stat(
      new URL(`../public/images/lab-showcase/${slug}-${width}.webp`, import.meta.url),
    );
    assert.ok(
      thumbnail.size > 0 && thumbnail.size <= 120_000,
      `${slug}-${width}.webp must remain a bounded showcase thumbnail`,
    );
  }
}

console.log(
  "mobile lifecycle ratchet OK — updates wait for tab close; route chunks retry; touch scrolling avoids continuous root writes, parallax, live blur, and full-resolution Lab thumbnails.",
);

#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(appRoot, "..");
const tracked = execFileSync("git", ["ls-files"], {
  cwd: repoRoot,
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean)
  .filter((file) => existsSync(join(repoRoot, file)));

// The public Farm House presentation has one reviewed, reproducible HTML
// fixture outside the published tree. Keep this allowance exact and verify
// its manifest fingerprint; no other HTML tree is permitted here.
const farmFixtureHtml = ".lifi/design-source/farm-house-public-v1/index.html";
const farmFixture = JSON.parse(readFileSync(join(appRoot, "scripts/property-explorer/farm-house-public.json"), "utf8")).publicFixture;
assert.equal(farmFixture?.root, ".lifi/design-source/farm-house-public-v1");
assert.equal(farmFixture?.version, "farm-house-public-v1");
assert.equal(tracked.includes(farmFixtureHtml), true, "The reviewed public Farm House fixture must be committed");
assert.equal(createHash("sha256").update(readFileSync(join(repoRoot, farmFixtureHtml))).digest("hex"),
  farmFixture.htmlSha256, "The reviewed public Farm House fixture changed without its provenance");
const legacyHtml = tracked.filter((file) => file.endsWith(".html") && !file.startsWith("app/") && file !== farmFixtureHtml);
const legacyGenerators = tracked.filter((file) => file.startsWith("scripts/"));
const legacyRuntime = tracked.filter((file) =>
  ["css/", "js/", "vendor/"].some((prefix) => file.startsWith(prefix)) ||
  [
    "fonts/fonts.css",
    "icon-monochrome.svg",
    "llms.txt",
    "robots.txt",
    "safari-pinned-tab.svg",
    "site.webmanifest",
    "sitemap.xml",
  ].includes(file),
);

// These paths were retired because they duplicated the canonical app, carried
// stale provider instructions, or injected obsolete agent context. Check the
// working tree as well as tracked files: several of them were ignored, which
// let local agents keep rediscovering them even though Netlify could not deploy
// them.
const retiredPaths = [
  ".claude",
  ".superpowers",
  "_audit",
  "_qa",
  "assets",
  "backup",
  "docs",
  "fonts",
  "images",
  "skills-lock.json",
  "squirrel.toml",
  "tools/site-lab",
  "work",
  ".github/workflows/claude.yml",
  ".github/workflows/claude-review.yml",
  "app/public/examples/audit/archive.json",
];
const returnedRetiredPaths = retiredPaths.filter((file) =>
  existsSync(join(repoRoot, file)),
);
// The owner's tile-rewrite runbook explicitly introduces one shared context
// file. Keep the exception exact; it is authoring input, never a public asset.
if (existsSync(join(repoRoot, ".agents"))) {
  assert.deepEqual(readdirSync(join(repoRoot, ".agents")), ["product-marketing-context.md"],
    "Only the requested product-marketing context belongs in .agents/");
}
assert.equal(existsSync(join(appRoot, "public/.agents")), false,
  "Private authoring context must never be copied into public/");
const retiredRootArtifacts = readdirSync(repoRoot)
  .filter((name) =>
    /^dist-corrupt-/.test(name) ||
    /^deploy-.*\.zip$/i.test(name) ||
    /\.(?:bak|png)$/i.test(name) ||
    name === "firebase-debug.log",
  )
  .map((name) => `root:${name}`);

assert.deepEqual(
  legacyHtml,
  [],
  `legacy HTML returned outside app/:\n${legacyHtml.join("\n")}`,
);
assert.deepEqual(
  legacyGenerators,
  [],
  `retired static-site generators returned at repo root:\n${legacyGenerators.join("\n")}`,
);
assert.deepEqual(
  legacyRuntime,
  [],
  `retired static-site runtime returned at repo root:\n${legacyRuntime.join("\n")}`,
);
assert.deepEqual(
  [...returnedRetiredPaths, ...retiredRootArtifacts],
  [],
  "retired local, agent, provider, or duplicate-site artifacts returned:\n" +
    [...returnedRetiredPaths, ...retiredRootArtifacts].join("\n"),
);


// Netlify builds from git, so an asset that is not committed does not exist in
// production — it works locally and 404s live, which is the worst shape of
// failure because the person who added it sees it working.
//
// .gitignore blanket-ignores *.png. The negation used to be
// `!app/public/*.png`, which covers only the top level while its own comment
// claimed directory-level coverage. Probes rather than a string match: what
// matters is what git actually decides, not how the rule is written.
const PNG_PROBES = [
  "app/public/probe.png",
  "app/public/assets/probe.png",
  "app/public/assets/social/probe.png",
  "app/public/examples/audit/probe.png",
];
for (const probe of PNG_PROBES) {
  const ignored = (() => {
    try {
      execFileSync("git", ["check-ignore", "-q", probe], { cwd: repoRoot });
      return true;
    } catch {
      return false;
    }
  })();
  assert.equal(
    ignored,
    false,
    `.gitignore would drop ${probe}. A PNG added there never reaches the deploy — ` +
      "widen the negation under app/public/ rather than committing it with -f.",
  );
}

// The inverse: strays outside app/public must stay ignored, or the widening
// went too far and the repo starts collecting screenshots.
for (const stray of ["_qa/probe.png", "probe-at-root.png"]) {
  const ignored = (() => {
    try {
      execFileSync("git", ["check-ignore", "-q", stray], { cwd: repoRoot });
      return true;
    } catch {
      return false;
    }
  })();
  assert.equal(ignored, true, `${stray} is no longer ignored — the PNG negation is too broad.`);
}

console.log(
  "repo boundary ratchet OK — app/ is the only published website tree; the exact reviewed Farm House fixture and requested authoring context remain outside it.",
);

#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
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

const legacyHtml = tracked.filter((file) => file.endsWith(".html") && !file.startsWith("app/"));
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

console.log("repo boundary ratchet OK — app/ is the only tracked website tree.");

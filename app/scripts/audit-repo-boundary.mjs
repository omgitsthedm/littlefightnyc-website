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

console.log("repo boundary ratchet OK — app/ is the only tracked website tree.");

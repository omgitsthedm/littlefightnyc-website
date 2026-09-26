import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(new URL("./write-release-metadata.mjs", import.meta.url));
const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "lfnyc-release-metadata-"));
const unverifiedRoot = await mkdtemp(path.join(os.tmpdir(), "lfnyc-release-metadata-unverified-"));
const fixtureApp = path.join(fixtureRoot, "app");
const fixtureScript = path.join(fixtureApp, "scripts", "write-release-metadata.mjs");
const generatedSource = path.join(fixtureApp, "src", "data", "route-meta.json");
const unverifiedScript = path.join(unverifiedRoot, "app", "scripts", "write-release-metadata.mjs");

function git(args) {
  execFileSync("git", args, { cwd: fixtureRoot, stdio: "pipe" });
}

await mkdir(path.dirname(fixtureScript), { recursive: true });
await mkdir(path.dirname(generatedSource), { recursive: true });
await writeFile(fixtureScript, await readFile(scriptPath, "utf8"));
await writeFile(generatedSource, '{"pages":[]}\n');
git(["init", "--quiet"]);
git(["config", "user.name", "Release metadata fixture"]);
git(["config", "user.email", "release-metadata-fixture@example.invalid"]);
git(["add", "app"]);
git(["commit", "--quiet", "-m", "fixture"]);

const cleanProduction = spawnSync(process.execPath, [fixtureScript], {
  cwd: fixtureRoot,
  encoding: "utf8",
  env: { ...process.env, CONTEXT: "production" },
});
assert.equal(cleanProduction.status, 0, cleanProduction.stderr);
const cleanRelease = JSON.parse(
  await readFile(path.join(fixtureApp, "dist", "release.json"), "utf8"),
);
assert.equal(cleanRelease.context, "production");
assert.equal(cleanRelease.source_dirty, false);

// Simulate a post-generator route catalog write that is still uncommitted.
await writeFile(generatedSource, '{"pages":["generated"]}\n');

const local = spawnSync(process.execPath, [fixtureScript], {
  cwd: fixtureRoot,
  encoding: "utf8",
  env: { ...process.env, CONTEXT: "local" },
});
assert.equal(local.status, 0, local.stderr);
const localRelease = JSON.parse(
  await readFile(path.join(fixtureApp, "dist", "release.json"), "utf8"),
);
assert.equal(localRelease.context, "local");
assert.equal(localRelease.source_dirty, true);

const production = spawnSync(process.execPath, [fixtureScript], {
  cwd: fixtureRoot,
  encoding: "utf8",
  env: { ...process.env, CONTEXT: "production" },
});
assert.equal(production.status, 1, production.stderr);
assert.match(
  production.stderr,
  /Production build refused: tracked source files changed after the build generators ran/,
);
assert.match(production.stderr, /app\/src\/data\/route-meta\.json/);

await mkdir(path.dirname(unverifiedScript), { recursive: true });
await writeFile(unverifiedScript, await readFile(scriptPath, "utf8"));
const unverifiedLocal = spawnSync(process.execPath, [unverifiedScript], {
  cwd: unverifiedRoot,
  encoding: "utf8",
  env: { ...process.env, CONTEXT: "local" },
});
assert.equal(unverifiedLocal.status, 0, unverifiedLocal.stderr);
const unverifiedLocalRelease = JSON.parse(
  await readFile(path.join(unverifiedRoot, "app", "dist", "release.json"), "utf8"),
);
assert.equal(unverifiedLocalRelease.source_dirty, true);

const unverifiedProduction = spawnSync(process.execPath, [unverifiedScript], {
  cwd: unverifiedRoot,
  encoding: "utf8",
  env: { ...process.env, CONTEXT: "production" },
});
assert.equal(unverifiedProduction.status, 1, unverifiedProduction.stderr);
assert.match(
  unverifiedProduction.stderr,
  /Production build refused: could not verify tracked source files after the build generators ran/,
);

console.log("Release metadata correctly blocks dirty tracked generator output in production.");

#!/usr/bin/env node

/**
 * Quality lanes for the static tile marketing artifact. Functional checks use
 * a short-lived, isolated local server and installed Google Chrome only.
 */
import { execFileSync, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";

const release = process.argv.includes("--release");
const functional = release || process.argv.includes("--functional");
const distIndex = process.argv.indexOf("--dist");
const dist = distIndex >= 0 ? process.argv[distIndex + 1] : "dist";
if (distIndex >= 0 && !dist) {
  console.error("--dist requires a directory");
  process.exit(2);
}

function run(command, args, environment = process.env) {
  console.log(`\n› ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit", cwd: process.cwd(), env: environment });
}

async function waitForServer(port, child) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`tile server on ${port} exited before becoming ready`);
    const ready = await new Promise((resolve) => {
      const socket = net.connect({ host: "127.0.0.1", port });
      const finish = (value) => { socket.destroy(); resolve(value); };
      socket.once("connect", () => finish(true));
      socket.once("error", () => finish(false));
    });
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`tile server on ${port} did not become ready within 15 seconds`);
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);
  if (child.exitCode === null) child.kill("SIGKILL");
}

async function withProductionServer(verify) {
  // Dedicated port: never touch a developer or review server already on 4393/4394.
  const port = Number(process.env.TILE_QUALITY_PORT || 4396);
  const env = { ...process.env, TILE_DIST: "production", TILE_PORT: String(port) };
  const child = spawn(process.execPath, ["scripts/serve-tile-preview.mjs"], {
    cwd: process.cwd(), env, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (data) => { output += data; process.stdout.write(data); });
  child.stderr.on("data", (data) => { output += data; process.stderr.write(data); });
  try {
    await waitForServer(port, child);
    await verify(`http://127.0.0.1:${port}`);
  } catch (error) {
    if (output) console.error(`tile quality server output:\n${output}`);
    throw error;
  } finally {
    await stopServer(child);
  }
}

async function requireArtifact(relative) {
  try {
    await access(path.resolve(process.cwd(), relative));
  } catch {
    throw new Error(`${relative} is missing; run npm run build before this lane`);
  }
}

async function browserLanes() {
  await requireArtifact("dist/index.html");
  await withProductionServer(async (url) => {
    const env = { ...process.env, TILE_DIST: "production", PREVIEW_URL: url, TILE_PRODUCTION_URL: url, VERA_PREVIEW_URL: url, CASE_EDITORIAL_URL: url, INQUIRY_ENHANCEMENT_URL: url, TOPIC_MOSAIC_URL: url };
    run("node", ["scripts/verify-tile-preview.cjs"], env);
    run("node", ["scripts/verify-topic-mosaic.cjs"], env);
    run("node", ["scripts/verify-tile-production.cjs"], env);
    run("node", ["scripts/verify-vera-freshness.cjs"], env);
    run("node", ["scripts/verify-case-editorial.cjs"], env);
    run("node", ["scripts/verify-inquiry-enhancement.cjs"], env);
  });
}

run("python3", ["scripts/audit-tile-content.py", "--dist", dist, ...(release ? ["--release"] : [])]);

if (functional) {
  // Preserve real contracts: native inquiry delivery, consent/privacy,
  // acquisition measurement, VERA, functions, and protected/retired product boundaries.
  for (const script of [
    "test:owner-math",
    "test:vera-service-worker",
    "test:vera-data-edge",
    "test:release-contract",
    "audit:audit-integrations",
    "audit:repo-boundary",
    "audit:retired-integrations",
    "audit:retired-product",
    "audit:conversion",
    "audit:booking",
    "audit:vera-csp",
    "audit:vera-legal",
    "audit:legal-snapshot",
    "audit:meta-budget",
    "audit:claim-scope",
  ]) run("npm", ["run", script]);

  run("npx", ["tsc", "-b"]);
  run("npx", ["eslint", "src/tile-bridge", "scripts/quality-tiles.mjs", "scripts/verify-tile-production.cjs"]);
  await browserLanes();
}

if (release) {
  // Only the release lane evaluates clean-tree/revision readiness.
  run("npm", ["run", "audit:release"]);
  console.log("\nPASS tile release gate.");
} else if (functional) {
  console.log("\nPASS tile functional gate (local Chrome and an isolated local server).");
} else {
  console.log("\nPASS tile artifact gate.");
}

import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const repoRoot = path.resolve(appRoot, "..");
const distRoot = path.join(appRoot, "dist");

function git(args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return fallback;
  }
}

function trackedSourceStatus() {
  try {
    return {
      verified: true,
      porcelain: execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim(),
    };
  } catch {
    return { verified: false, porcelain: "" };
  }
}

const revision = process.env.COMMIT_REF?.trim() || git(["rev-parse", "HEAD"], "unknown");
const branch =
  process.env.BRANCH?.trim() ||
  process.env.HEAD?.trim() ||
  git(["branch", "--show-current"], "unknown");
// This script is deliberately the final build step after every source generator.
// A production artifact cannot truthfully identify a committed revision when those
// generators have changed a tracked file beneath it. Local builds still write the
// flag so developers can inspect the artifact while working.
const sourceStatus = trackedSourceStatus();
const dirtyTrackedFiles = sourceStatus.porcelain;
// An unavailable Git status cannot prove a clean source tree. Keep local
// artifacts usable, but report that uncertainty as dirty rather than minting
// a false-clean release record.
const sourceDirty = !sourceStatus.verified || Boolean(dirtyTrackedFiles);
const context = process.env.CONTEXT?.trim() || "local";

if (context.toLowerCase() === "production" && !sourceStatus.verified) {
  console.error(
    "Production build refused: could not verify tracked source files after the build generators ran.",
  );
  process.exitCode = 1;
} else if (context.toLowerCase() === "production" && sourceDirty) {
  console.error(
    "Production build refused: tracked source files changed after the build generators ran. Regenerate and commit the exact release candidate before publishing.",
  );
  console.error(dirtyTrackedFiles);
  process.exitCode = 1;
} else {
  const release = {
    schema_version: 1,
    project: "Little Fight NYC",
    revision,
    branch,
    context,
    built_at: new Date().toISOString(),
    source_dirty: sourceDirty,
  };

  await mkdir(distRoot, { recursive: true });
  await writeFile(
    path.join(distRoot, "release.json"),
    `${JSON.stringify(release, null, 2)}\n`,
    "utf8",
  );

  console.log(`Release metadata: ${revision.slice(0, 12)} (${branch}, ${release.context}).`);
}

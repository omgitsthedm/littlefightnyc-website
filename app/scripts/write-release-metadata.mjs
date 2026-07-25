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

const revision = process.env.COMMIT_REF?.trim() || git(["rev-parse", "HEAD"], "unknown");
const branch =
  process.env.BRANCH?.trim() ||
  process.env.HEAD?.trim() ||
  git(["branch", "--show-current"], "unknown");
const sourceDirty = Boolean(git(["status", "--porcelain", "--untracked-files=no"]));

const release = {
  schema_version: 1,
  project: "Little Fight NYC",
  revision,
  branch,
  context: process.env.CONTEXT?.trim() || "local",
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

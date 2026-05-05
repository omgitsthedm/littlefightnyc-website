import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const publishDirName = process.env.LIFI_PUBLISH_DIR || "dist";
const outDir = path.join(root, publishDirName);

const skipRootDirs = new Set([
  ".git",
  ".github",
  ".claude",
  ".playwright-mcp",
  ".superpowers",
  ".netlify",
  "backup",
  "dist",
  "docs",
  "netlify",
  "node_modules",
  "scripts",
  "tmp",
]);

const skipRootFiles = new Set([
  ".gitignore",
  ".impeccable.md",
  ".netlifyignore",
  "AGENTS.md",
  "CLAUDE.md",
  "HANDOFF.md",
  "canva_brand_kit_little_fight_nyc.md",
  "firebase-debug.log",
  "index.html.bak",
  "netlify.toml",
  "package-lock.json",
  "package.json",
  "squirrel.toml",
]);

function isRootScreenshot(name) {
  return (
    /^deploy-.*\.zip$/.test(name) ||
    /^mobile-.*\.png$/.test(name) ||
    /^hero-.*\.png$/.test(name) ||
    /^blog-post.*\.png$/.test(name) ||
    /^blog-visuals-.*\.png$/.test(name) ||
    /^work-page-.*\.png$/.test(name) ||
    name === "card-layout-options.png" ||
    name === "home-carousel-desktop.png"
  );
}

function shouldCopy(source) {
  const relative = path.relative(root, source);
  const parts = relative.split(path.sep);
  const rootName = parts[0];

  if (!relative) return true;
  if (parts.at(-1) === ".DS_Store") return false;
  if (parts.length === 1 && /^dist(?:-.+)?$/.test(rootName)) return false;
  if (parts.length === 1 && skipRootFiles.has(rootName)) return false;
  if (parts.length === 1 && isRootScreenshot(rootName)) return false;
  if (skipRootDirs.has(rootName)) return false;
  if (relative === path.join("work", "ai-change-log.txt")) return false;

  return true;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  const source = path.join(root, entry.name);
  if (!shouldCopy(source)) continue;

  await cp(source, path.join(outDir, entry.name), {
    recursive: true,
    dereference: false,
    filter: shouldCopy,
  });
}

if (!existsSync(path.join(outDir, "index.html"))) {
  throw new Error("Netlify publish build did not copy index.html.");
}

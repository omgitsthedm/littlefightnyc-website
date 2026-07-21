import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(appRoot, "public");
const labRoot = path.join(publicRoot, "examples", "lab");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function existsAsRoute(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  return fs.existsSync(path.join(target, "index.html"));
}

function localTarget(reference, sourceFile) {
  const clean = reference.split("#", 1)[0].split("?", 1)[0];
  if (!clean || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(clean)) {
    return null;
  }
  if (clean.startsWith("/")) return path.join(publicRoot, clean);
  return path.resolve(path.dirname(sourceFile), clean);
}

const failures = [];
const files = walk(labRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const textFiles = files.filter((file) => /\.(?:css|html|js|json|txt|xml)$/i.test(file));

if (files.length !== 165) failures.push(`expected 165 hosted files, found ${files.length}`);
if (htmlFiles.length !== 47) failures.push(`expected 47 HTML pages, found ${htmlFiles.length}`);

const hubPath = path.join(labRoot, "index.html");
const hub = fs.readFileSync(hubPath, "utf8");
const conceptLinks = [...hub.matchAll(/class="concept-row[^"]*"[^>]*href="([^"]+)"/g)].map(
  (match) => match[1],
);

if (conceptLinks.length !== 11) {
  failures.push(`expected 11 concept links, found ${conceptLinks.length}`);
}

for (const reference of conceptLinks) {
  const target = localTarget(reference, hubPath);
  if (!target || !existsAsRoute(target)) failures.push(`missing concept route: ${reference}`);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const references = [...source.matchAll(/(?:href|src|poster)=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  for (const reference of references) {
    const target = localTarget(reference, file);
    if (target && !existsAsRoute(target)) {
      failures.push(`${path.relative(labRoot, file)} -> ${reference}`);
    }
  }
}

for (const file of files.filter((entry) => entry.endsWith(".css"))) {
  const source = fs.readFileSync(file, "utf8");
  const references = [...source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)].map(
    (match) => match[1],
  );
  for (const reference of references) {
    const target = localTarget(reference, file);
    if (target && !existsAsRoute(target)) {
      failures.push(`${path.relative(labRoot, file)} -> ${reference}`);
    }
  }
}

const combinedText = textFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
if (combinedText.includes("lab.littlefightnyc.com")) failures.push("old Lab hostname remains");

const mainSiteText = [path.join(appRoot, "src"), publicRoot]
  .flatMap(walk)
  .filter((file) => /\.(?:css|html|js|json|tsx?|txt|xml)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
if (mainSiteText.includes("lab.littlefightnyc.com")) {
  failures.push("old Lab hostname remains in the main site");
}

const returnScript = fs.readFileSync(path.join(labRoot, "assets", "lab-return.js"), "utf8");
if (!returnScript.includes("'/examples/lab/'") || !returnScript.includes("lab-concept-shell__back")) {
  failures.push("concept return chip does not point to the in-site Lab hub");
}

const terminalBundle = fs.readFileSync(
  path.join(labRoot, "concepts", "terminal-3d", "assets", "index-DvF386rg.js"),
  "utf8",
);
if (!terminalBundle.includes("/examples/lab/concepts/terminal-3d/data/building.json")) {
  failures.push("Terminal 3D data path is not scoped to the archive");
}

const fieldGuide = fs.readFileSync(path.join(appRoot, "src", "pages", "FieldGuide.tsx"), "utf8");
if (
  !fieldGuide.includes('href="/examples/lab/" data-no-vt') ||
  fieldGuide.includes("lab.littlefightnyc.com")
) {
  failures.push("main Examples page is not linked to the in-site Lab hub");
}

if (failures.length > 0) {
  console.error(`Lab archive audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Lab archive audit OK — ${conceptLinks.length} concepts, ${htmlFiles.length} HTML pages, ${files.length} files.`,
);

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const publicRoot = path.join(appRoot, "public");
const auditRoot = path.join(publicRoot, "examples", "audit");
const functionsRoot = path.join(repoRoot, "netlify", "functions");

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
const files = walk(auditRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const textFiles = files.filter((file) => /\.(?:css|html|js|json|txt|xml)$/i.test(file));
const functionFiles = walk(functionsRoot).filter((file) => file.endsWith(".mts"));

if (files.length !== 18) failures.push(`expected 18 archived files, found ${files.length}`);
if (htmlFiles.length !== 10) failures.push(`expected 10 HTML pages, found ${htmlFiles.length}`);
if (functionFiles.length !== 9) failures.push(`expected 9 function files, found ${functionFiles.length}`);

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const references = [...source.matchAll(/(?:href|src|poster)=["']([^"']+)["']/gi)].map(
    (match) => match[1],
  );
  for (const reference of references) {
    const target = localTarget(reference, file);
    if (target && !existsAsRoute(target)) {
      failures.push(`${path.relative(auditRoot, file)} -> ${reference}`);
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
      failures.push(`${path.relative(auditRoot, file)} -> ${reference}`);
    }
  }
}

const combinedAuditText = [...textFiles, ...functionFiles]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
if (combinedAuditText.includes("audits.littlefightnyc.com")) {
  failures.push("old Audit hostname remains");
}

const expectedFunctionPaths = [
  "/examples/audit/api/status",
  "/examples/audit/api/run-audit",
  "/examples/audit/api/og",
  "/examples/audit/api/record-engagement",
  "/examples/audit/api/report-views",
  "/examples/audit/report/*",
];
for (const functionPath of expectedFunctionPaths) {
  if (!combinedAuditText.includes(`path: "${functionPath}"`)) {
    failures.push(`missing function path: ${functionPath}`);
  }
}

const index = fs.readFileSync(path.join(auditRoot, "index.html"), "utf8");
for (const endpoint of ["status", "run-audit"]) {
  if (!index.includes(`/examples/audit/api/${endpoint}`)) {
    failures.push(`Audit form is missing scoped ${endpoint} endpoint`);
  }
}

const fieldGuide = fs.readFileSync(path.join(appRoot, "src", "pages", "FieldGuide.tsx"), "utf8");
const footer = fs.readFileSync(
  path.join(appRoot, "src", "components", "editorial", "QuietFooter.tsx"),
  "utf8",
);
if (!fieldGuide.includes('href="/examples/audit/" data-no-vt')) {
  failures.push("main Examples page is not linked to the in-site Audit");
}
if (!footer.includes('to: "/examples/audit/", external: true')) {
  failures.push("main footer is not linked to the in-site Audit");
}

const netlifyConfig = fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8");
if (!netlifyConfig.includes('for = "/examples/audit/*"')) {
  failures.push("scoped Audit headers are missing from netlify.toml");
}

const archive = JSON.parse(fs.readFileSync(path.join(auditRoot, "archive.json"), "utf8"));
if (archive.sourceAuthoredFiles !== 33 || archive.unpublishedSourceFiles?.[0] !== "netlify.toml") {
  failures.push("archive manifest does not preserve source and unpublished-file provenance");
}

if (failures.length > 0) {
  console.error(`Audit archive audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Audit archive audit OK — ${htmlFiles.length} HTML pages, ${files.length} static files, ${functionFiles.length} function files.`,
);

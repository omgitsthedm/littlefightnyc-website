import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const publicRoot = path.join(appRoot, "public");
const auditRoot = path.join(publicRoot, "examples", "audit");
const functionsRoot = path.join(repoRoot, "netlify", "functions");
const netlifyConfig = fs.readFileSync(path.join(repoRoot, "netlify.toml"), "utf8");
const appRoutes = new Set(
  JSON.parse(
    fs.readFileSync(path.join(appRoot, "src", "data", "seo-pages.json"), "utf8"),
  ).pages.map((page) => page.path),
);

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function existsAsRoute(target) {
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(path.join(target, "index.html"))) return true;

  const publicRelative = path.relative(publicRoot, target);
  if (publicRelative.startsWith("..") || path.isAbsolute(publicRelative)) return false;
  const route = `/${publicRelative.split(path.sep).join("/")}`.replace(/\/?$/, "/");
  return appRoutes.has(route);
}

function localTarget(reference, sourceFile) {
  const clean = reference.split("#", 1)[0].split("?", 1)[0];
  if (!clean || /^(?:https?:|mailto:|tel:|sms:|data:|javascript:|#)/i.test(clean)) {
    return null;
  }
  if (clean.startsWith("/")) return path.join(publicRoot, clean);
  return path.resolve(path.dirname(sourceFile), clean);
}

const failures = [];
const files = walk(auditRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const textFiles = files.filter((file) => /\.(?:css|html|js|json|txt|xml)$/i.test(file));
const functionFiles = fs
  .readdirSync(functionsRoot, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".mts"))
  .map((entry) => path.join(functionsRoot, entry.name));
const expectedAuditHandlerNames = [
  "check-status.mts",
  "cleanup-expired.mts",
  "og-image.mts",
  "record-engagement.mts",
  "report-views.mts",
  "run-audit-background.mts",
  "run-audit.mts",
  "serve-audit.mts",
];
const helperFiles = walk(path.join(functionsRoot, "lib")).filter((file) =>
  file.endsWith(".mts"),
);
const netlifySourceFiles = [...functionFiles, ...helperFiles];

if (files.length !== 21) failures.push(`expected 21 archived files, found ${files.length}`);
if (htmlFiles.length !== 10) failures.push(`expected 10 HTML pages, found ${htmlFiles.length}`);
const functionNames = new Set(functionFiles.map((file) => path.basename(file)));
for (const handlerName of expectedAuditHandlerNames) {
  if (!functionNames.has(handlerName)) {
    failures.push(`missing Audit function handler: ${handlerName}`);
  }
}
if (helperFiles.length !== 2) {
  failures.push(`expected 2 function helpers, found ${helperFiles.length}`);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(file, "utf8");
  const relative = path.relative(auditRoot, file);
  if (!source.includes('name="littlefight:content-status"')) {
    failures.push(`${relative} is missing its public Audit experience-status disclosure`);
  }
  if (
    /^(?:ivy-infusions|marcus-medical|premier-plastic-surgery|skinsmart-dermatology|the-cosmetic-clinic)\/index\.html$/.test(
      relative.split(path.sep).join("/"),
    ) &&
    (!source.includes('class="lf-audit-reconstruction"') ||
      !source.includes("developer.chrome.com/docs/lighthouse/overview") ||
      !source.includes("www.w3.org/WAI/WCAG22/quickref"))
  ) {
    failures.push(`${relative} is missing its visible reconstructed-report evidence notice`);
  }
  if (
    /^(?:ivy-infusions|marcus-medical|premier-plastic-surgery|skinsmart-dermatology|the-cosmetic-clinic)\/index\.html$/.test(
      relative.split(path.sep).join("/"),
    ) &&
    /Missing Local Business Schema|schema markup|Complex JavaScript Bundles|Google Business Profile Integration|Appointment Schema Markup/i.test(
      source,
    )
  ) {
    failures.push(`${relative} brings developer-facing finding language back into a client example`);
  }
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

const combinedAuditText = [...textFiles, ...netlifySourceFiles]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
if (combinedAuditText.includes(["audits", "littlefightnyc", "com"].join("."))) {
  failures.push("old Audit hostname remains");
}
if (combinedAuditText.includes("AUDIT_INTERNAL_SECRET")) {
  failures.push("Audit still depends on the retired site's internal secret");
}
if (!combinedAuditText.includes('name: "audit-jobs"')) {
  failures.push("one-time background job authorization is missing");
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
if (!index.includes('/examples/audit/analytics.js')) {
  failures.push("Audit form is missing the consent-aware analytics bridge");
}
if (/href=["']\/examples\/audit\/(?:ivy-infusions|marcus-medical|premier-plastic-surgery|skinsmart-dermatology|the-cosmetic-clinic)\//i.test(index)) {
  failures.push("Audit form still links to a retired named-business audit mockup");
}
if (!index.includes("No score substituted")) {
  failures.push("Audit form is missing the unavailable-measurement truth state");
}
for (const eventName of [
  "audit_scan_started",
  "audit_scan_accepted",
  "generate_lead",
  "audit_report_ready",
  "audit_scan_failed",
]) {
  if (!index.includes(eventName)) {
    failures.push(`Audit form is missing analytics event: ${eventName}`);
  }
}

const auditHeaderStart = netlifyConfig.indexOf('for = "/examples/audit/*"');
const auditHeaderEnd = netlifyConfig.indexOf("[[headers]]", auditHeaderStart + 1);
const auditHeader = auditHeaderStart >= 0
  ? netlifyConfig.slice(
      auditHeaderStart,
      auditHeaderEnd >= 0 ? auditHeaderEnd : netlifyConfig.length,
    )
  : "";
const auditCsp = auditHeader.match(/Content-Security-Policy = "([^"]+)"/)?.[1] ?? "";
const auditCspDirectives = new Map(
  auditCsp.split(";").map((directive) => {
    const [name = "", ...values] = directive.trim().split(/\s+/);
    return [name, new Set(values)];
  }),
);
const requiredAnalyticsOrigins = {
  "script-src": ["https://www.googletagmanager.com"],
  "connect-src": [
    "https://www.googletagmanager.com",
    "https://www.google.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
  ],
  "img-src": [
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://region1.google-analytics.com",
  ],
};
for (const [directive, origins] of Object.entries(requiredAnalyticsOrigins)) {
  for (const origin of origins) {
    if (!auditCspDirectives.get(directive)?.has(origin)) {
      failures.push(`Audit CSP ${directive} is missing ${origin}`);
    }
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
if (!/\{\s*label:\s*"[^"]+",\s*to:\s*"\/examples\/audit\/"\s*\}/.test(footer)) {
  failures.push("main footer is not linked to the in-site Audit");
}
if (footer.includes('to: "/examples/audit/", external: true')) {
  failures.push("main footer incorrectly marks the in-site Audit as external");
}

if (!netlifyConfig.includes('for = "/examples/audit/*"')) {
  failures.push("scoped Audit headers are missing from netlify.toml");
}

if (failures.length > 0) {
  console.error(`Audit archive audit failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(
  `Audit archive audit OK — ${htmlFiles.length} HTML pages, ${files.length} static files, ${expectedAuditHandlerNames.length} Audit function handlers (${functionFiles.length} total), ${helperFiles.length} helpers.`,
);

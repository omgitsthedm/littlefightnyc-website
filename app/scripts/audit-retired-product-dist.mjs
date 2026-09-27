import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const distRoot = new URL("../dist/", import.meta.url);
const marketingEntry = new URL("index.html", distRoot);
const retirementEntry = new URL("product-retired.html", distRoot);
const redirectsSource = new URL("../public/_redirects", import.meta.url);
const headersSource = new URL("../../netlify.toml", import.meta.url);
const functionsRoot = new URL("../../netlify/functions/", import.meta.url);
const workflowsRoot = new URL("../../.github/workflows/", import.meta.url);
const distPath = fileURLToPath(distRoot);
const forbiddenFiles = new Set([
  "current.csv",
  "current.md",
  "current.signals.json",
  "dakota2.sqlite3",
  "run-status.json",
  "dakota.html",
  "identity-callback-bridge.js",
]);
const forbiddenText = [
  "dakota",
  "dakota_publish_token",
  "send velocity",
  "auto_send",
  ".env.v40",
  "openclaw",
  "@netlify/identity",
  "identity-callback-bridge.js",
  "dakota_auth_return",
  "www.dakota.littlefightnyc.com",
];
const findings = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await walk(path);
      continue;
    }

    const localPath = relative(distPath, path);
    if (forbiddenFiles.has(entry.name)) findings.push(`forbidden retired-product file: ${localPath}`);
    if (localPath !== "_redirects" && localPath.toLowerCase().includes("dakota")) {
      findings.push(`retired-product artifact name: ${localPath}`);
    }
    if (extname(entry.name) === ".map") findings.push(`source map: ${localPath}`);
    if (!new Set([".html", ".js", ".css"]).has(extname(entry.name))) continue;

    const contents = (await readFile(path, "utf8")).toLowerCase();
    for (const marker of forbiddenText) {
      if (contents.includes(marker)) findings.push(`forbidden marker ${JSON.stringify(marker)} in ${localPath}`);
    }
  }
}

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await sourceFiles(path));
    } else {
      files.push(path);
    }
  }
  return files;
}

try {
  if (!(await stat(distRoot)).isDirectory()) throw new Error("dist is not a directory");
  const marketingHtml = await readFile(marketingEntry, "utf8");
  if (marketingHtml.includes("identity-callback-bridge.js")) {
    findings.push("marketing entry still loads the retired Identity callback bridge");
  }

  const retirementHtml = await readFile(retirementEntry, "utf8");
  for (const marker of ["noindex, nofollow, noarchive, nosnippet", "permanently retired"]) {
    if (!retirementHtml.includes(marker)) findings.push(`retirement response is missing ${JSON.stringify(marker)}`);
  }
  if (/<script\b|<link\b/i.test(retirementHtml)) {
    findings.push("retirement response loads a script or external asset");
  }

  const redirects = await readFile(redirectsSource, "utf8");
  for (const route of ["/app", "/app/*", "/dakota.html", "/studio/dakota", "/studio/dakota/"]) {
    const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`^${escaped}\\s+/product-retired\\.html\\s+410!$`, "m").test(redirects)) {
      findings.push(`retirement response is missing forced 410 for ${route}`);
    }
  }
  for (const host of ["https://dakota.littlefightnyc.com/*", "https://www.dakota.littlefightnyc.com/*"]) {
    const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`^${escaped}\\s+/product-retired\\.html\\s+410!$`, "m").test(redirects)) {
      findings.push(`retirement response is missing forced 410 for ${host}`);
    }
  }

  const headers = await readFile(headersSource, "utf8");
  const headerBlocks = headers.split("[[headers]]").slice(1);
  for (const route of ["/product-retired.html", "/app", "/app/*", "/dakota.html", "/studio/dakota", "/studio/dakota/*"]) {
    const block = headerBlocks.find((candidate) => new RegExp(`^\\s*for = "${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "m").test(candidate));
    if (!block?.includes('Cache-Control = "no-store, max-age=0"')) {
      findings.push(`retirement response is missing no-store policy for ${route}`);
    }
    if (!block?.includes('X-Robots-Tag = "noindex, nofollow, noarchive, nosnippet"')) {
      findings.push(`retirement response is missing noindex policy for ${route}`);
    }
  }

  for (const root of [functionsRoot, workflowsRoot]) {
    const directory = fileURLToPath(root);
    for (const file of await sourceFiles(directory)) {
      const localPath = relative(fileURLToPath(new URL("../../", import.meta.url)), file);
      const source = (await readFile(file, "utf8")).toLowerCase();
      if (localPath.toLowerCase().includes("dakota") || source.includes("dakota")) {
        findings.push(`retired function or workflow source remains: ${localPath}`);
      }
    }
  }
  await walk(distPath);
} catch (error) {
  console.error(`Retired-product distribution audit could not run: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
}

if (findings.length) {
  console.error(["Retired-product distribution audit failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
  process.exit(1);
}

console.log("Retired-product distribution audit passed: no private entry, callback, product chunks, runtime data, secrets, or source maps shipped.");

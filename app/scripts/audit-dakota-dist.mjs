import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const distRoot = new URL("../dist/", import.meta.url);
const dakotaEntry = new URL("dakota.html", distRoot);
const marketingEntry = new URL("index.html", distRoot);
const identityCallbackBridge = new URL("identity-callback-bridge.js", distRoot);
const redirectsSource = new URL("../public/_redirects", import.meta.url);
const distPath = fileURLToPath(distRoot);
const forbiddenFiles = new Set([
  "current.csv",
  "current.md",
  "current.signals.json",
  "dakota2.sqlite3",
  "run-status.json",
]);
const forbiddenText = [
  "DAKOTA_PUBLISH_TOKEN",
  "Send Velocity",
  "auto_send",
  ".env.v40",
  "OpenClaw",
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
    if (forbiddenFiles.has(entry.name)) findings.push(`forbidden Dakota runtime file: ${localPath}`);
    if (extname(entry.name) === ".map") findings.push(`source map: ${localPath}`);
    if (!new Set([".html", ".js", ".css"]).has(extname(entry.name))) continue;

    const contents = await readFile(path, "utf8");
    for (const marker of forbiddenText) {
      if (contents.includes(marker)) findings.push(`forbidden marker ${JSON.stringify(marker)} in ${localPath}`);
    }
  }
}

try {
  if (!(await stat(distRoot)).isDirectory()) throw new Error("dist is not a directory");
  const html = await readFile(dakotaEntry, "utf8");
  if (!html.includes("Dakota — Private Revenue Desk")) findings.push("Dakota entry title is missing");
  if (!/name="robots" content="noindex, nofollow, noarchive, nosnippet"/.test(html)) {
    findings.push("Dakota entry is missing the strict robots directive");
  }
  if (!/<script[^>]+type="module"[^>]+src="\/assets\/[^"]+\.js"/.test(html)) {
    findings.push("Dakota entry is not bound to a hashed module asset");
  }
  const marketingHtml = await readFile(marketingEntry, "utf8");
  if (!marketingHtml.includes('<script src="/identity-callback-bridge.js"></script>')) {
    findings.push("marketing entry is missing the Identity-to-Dakota callback bridge");
  }
  const bridge = await readFile(identityCallbackBridge, "utf8");
  for (const marker of ["/app/", "access_token", "confirmation_token", "invite_token", "recovery_token", "dakota_auth_return", "www.dakota.littlefightnyc.com"]) {
    if (!bridge.includes(marker)) findings.push(`Identity callback bridge is missing ${JSON.stringify(marker)}`);
  }
  if (!bridge.includes('window.location.pathname !== "/"')) {
    findings.push("Identity callback bridge is not limited to the project root");
  }
  const redirects = await readFile(redirectsSource, "utf8");
  if (!/^\/app\s+\/dakota\.html\s+200!/mu.test(redirects)) {
    findings.push("Dakota /app rewrite is missing");
  }
  if (!/^\/app\/\*\s+\/dakota\.html\s+200!/mu.test(redirects)) {
    findings.push("Dakota /app/* rewrite is missing");
  }
  if (/^\/app\s+\/app\/\s+30[1278]/mu.test(redirects)) {
    findings.push("Dakota /app redirect can loop after Netlify slash normalization");
  }
  for (const marketingMarker of ["googletagmanager", "site.webmanifest", "sw.js", "canonical", "react-router"]) {
    if (html.includes(marketingMarker)) findings.push(`marketing marker ${JSON.stringify(marketingMarker)} leaked into Dakota entry`);
  }
  await walk(distPath);
} catch (error) {
  console.error(`Dakota distribution audit could not run: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
}

if (findings.length) {
  console.error(["Dakota distribution audit failed:", ...findings.map((finding) => `- ${finding}`)].join("\n"));
  process.exit(1);
}

console.log("Dakota distribution audit passed: private shell isolated; no runtime data, secrets, source maps, or outreach artifacts shipped.");

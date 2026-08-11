import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const manifestPath = path.join(repoRoot, ".lifi", "quality.yml");
const failures = [];
const warnings = [];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

if (!(await exists(manifestPath))) {
  failures.push(".lifi/quality.yml is missing");
}

const manifest = failures.length ? "" : await readFile(manifestPath, "utf8");

const requiredPatterns = [
  ["schema version", /^schema_version:\s*1\s*$/m],
  ["service-enabled surface", /^surface:\s*service-enabled\s*$/m],
  ["moderate risk tier", /^risk_tier:\s*moderate\s*$/m],
  ["canonical repository", /^canonical_repo:\s*".+"\s*$/m],
  ["remote", /^remote:\s*"https:\/\/github\.com\/.+\.git"\s*$/m],
  ["production target", /^production_target:\s*"https:\/\/littlefightnyc\.com"\s*$/m],
  [
    "agency doctrine",
    /^\s+source:\s*"\/Users\/davidmarsh\/Code\/LiFi NYC\/agency-ops\/doctrine\/UNIVERSAL-WEBSITE-LAUNCH-AUDIT-AND-REMEDIATION-STANDARD\.md"\s*$/m,
  ],
  ["agency doctrine version", /^\s+version:\s*"2026-08-10"\s*$/m],
  ["agency doctrine status", /^\s+status:\s*"PRESENT_VERIFIED_2026-08-10"\s*$/m],
  ["fast command", /^\s+quality_fast:\s*"npm run quality:fast"\s*$/m],
  ["full command", /^\s+quality_full:\s*"npm run quality:full"\s*$/m],
  ["release command", /^\s+quality_release:\s*"npm run quality:release"\s*$/m],
  ["live command", /^\s+quality_live:\s*"npm run quality:live"\s*$/m],
  ["maintenance command", /^\s+quality_maintenance:\s*"npm run quality:maintenance"\s*$/m],
];

for (const [label, pattern] of requiredPatterns) {
  if (manifest && !pattern.test(manifest)) failures.push(`quality manifest: missing ${label}`);
}

for (const relative of [
  ".lifi/dead-code-candidates.yml",
  ".lifi/debt-and-exceptions.yml",
]) {
  if (!(await exists(path.join(repoRoot, relative)))) failures.push(`${relative} is missing`);
}

if (/(?:api[_-]?key|access[_-]?token|secret|password):\s*["']?[^"'{}\s][^\n]*/i.test(manifest)) {
  failures.push("quality manifest appears to contain a credential-like value");
}

const agencyDoctrine = path.resolve(
  repoRoot,
  "..",
  "..",
  "..",
  "agency-ops",
  "doctrine",
  "UNIVERSAL-WEBSITE-LAUNCH-AUDIT-AND-REMEDIATION-STANDARD.md",
);
if (!(await exists(agencyDoctrine))) {
  const message =
    "agency website standard is unavailable at agency-ops/doctrine/UNIVERSAL-WEBSITE-LAUNCH-AUDIT-AND-REMEDIATION-STANDARD.md";
  if (process.env.REQUIRE_QUALITY_CHARTER === "1") failures.push(message);
  else warnings.push(message);
}

if (failures.length) {
  console.error(`Quality manifest audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Quality manifest audit passed: service-enabled/moderate profile and durable ledgers are present.");
}

for (const warning of warnings) console.warn(`Quality manifest warning: ${warning}.`);

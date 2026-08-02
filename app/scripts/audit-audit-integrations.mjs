#!/usr/bin/env node
/**
 * Keep the Website Audit on the provider contracts the owner approved.
 *
 * Executable pure-policy assertions are paired with source-level wiring checks.
 * Together they catch the expensive kind of drift before a deploy: bypassing
 * Netlify AI Gateway, restoring the retired Notion write, falling back to a
 * Gmail app password, leaking database query values into logs, logging success
 * for an integration that skipped, or changing the public processor disclosure
 * without changing the code beside it.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  safeDatabaseErrorLabel,
  scoreBand,
  shouldPersistAuditLead,
} from "../../netlify/functions/lib/audit-leads.mts";
import {
  safeEmailDeliveryErrorLabel,
} from "../../netlify/functions/run-audit-background.mts";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const failures = [];

const read = (relativePath) =>
  readFileSync(join(ROOT, relativePath), "utf8");

const backgroundPath = "netlify/functions/run-audit-background.mts";
const leadsPath = "netlify/functions/lib/audit-leads.mts";
const cleanupPath = "netlify/functions/cleanup-expired.mts";
const migrationPath =
  "netlify/database/migrations/20260731183000_create_audit_leads.sql";
const nullableScoresMigrationPath =
  "netlify/database/migrations/20260802120000_allow_unmeasured_audit_scores.sql";
const privacyPath = "app/public/examples/audit/privacy/index.html";

const background = read(backgroundPath);

// These are executable policy checks, not source-text assertions. They keep a
// deploy preview from writing durable CRM data and prove that a Waddler-style
// error cannot copy SQL parameters into the label written to provider logs.
assert.equal(shouldPersistAuditLead("production"), true);
for (const context of [undefined, "", "deploy-preview", "branch-deploy", "dev"]) {
  assert.equal(
    shouldPersistAuditLead(context),
    false,
    `durable lead storage unexpectedly enabled for ${context ?? "undefined"}`,
  );
}

const privateDatabaseError = Object.assign(
  new Error(
    "Failed query: INSERT INTO audit_leads; params: private@example.com,Example LLC",
  ),
  {
    query: "INSERT INTO audit_leads VALUES ($1, $2)",
    params: ["private@example.com", "Example LLC"],
    cause: Object.assign(new Error("connection refused"), {
      code: "ECONNREFUSED",
    }),
  },
);
const safeDatabaseLabel = safeDatabaseErrorLabel(privateDatabaseError);
assert.equal(safeDatabaseLabel, "connection_error");
assert.doesNotMatch(
  safeDatabaseLabel,
  /private@example\.com|Example LLC|INSERT INTO|params/i,
  "safe database error label exposed query data",
);
assert.equal(
  safeDatabaseErrorLabel(
    Object.assign(new Error("missing connection"), {
      name: "MissingDatabaseConnectionError",
    }),
  ),
  "configuration_error",
);
assert.equal(scoreBand(null), null);
assert.equal(scoreBand(40), "cold");
assert.equal(scoreBand(70), "warm");
assert.equal(scoreBand(90), "hot");
assert.equal(
  safeDatabaseErrorLabel(
    Object.assign(new Error("timed out"), { code: "ETIMEDOUT" }),
  ),
  "timeout_error",
);
assert.equal(
  safeDatabaseErrorLabel(
    Object.assign(new Error("private@example.com"), {
      code: "private@example.com",
    }),
  ),
  "database_error",
);

// ── 1. Anthropic traffic must go through Netlify AI Gateway ──────────────────
const callStart = background.indexOf("async function callHaiku(");
const callEnd = background.indexOf("function coerceHaikuResult", callStart);
if (callStart < 0 || callEnd < 0) {
  failures.push(`${backgroundPath}: cannot isolate callHaiku()`);
} else {
  const callHaiku = background.slice(callStart, callEnd);
  const baseDeclaration = callHaiku.match(
    /const\s+([A-Za-z_$][\w$]*)\s*=\s*getEnv\(\s*["']ANTHROPIC_BASE_URL["']\s*\)/,
  );

  if (!baseDeclaration) {
    failures.push(
      `${backgroundPath}: callHaiku() must read Netlify's ANTHROPIC_BASE_URL`,
    );
  } else {
    const baseName = baseDeclaration[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const missingBaseGuard = new RegExp(
      `if\\s*\\([\\s\\S]{0,180}!\\s*${baseName}\\b`,
    );
    if (!missingBaseGuard.test(callHaiku)) {
      failures.push(
        `${backgroundPath}: callHaiku() reads ANTHROPIC_BASE_URL but does not require it`,
      );
    }

    const references = callHaiku.match(new RegExp(`\\b${baseName}\\b`, "g")) ?? [];
    if (references.length < 3) {
      failures.push(
        `${backgroundPath}: ANTHROPIC_BASE_URL must govern the request endpoint, not just be read`,
      );
    }
  }

  const models = [...callHaiku.matchAll(/\bmodel\s*:\s*["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  if (
    models.length !== 1 ||
    models[0] !== "claude-haiku-4-5-20251001"
  ) {
    failures.push(
      `${backgroundPath}: expected only claude-haiku-4-5-20251001, found ${
        models.length ? models.join(", ") : "no model"
      }`,
    );
  }
}

if (/api\.anthropic\.com/i.test(background)) {
  failures.push(
    `${backgroundPath}: hard-codes api.anthropic.com instead of Netlify AI Gateway`,
  );
}

// ── 2. Notion is retired from the active audit pipeline ─────────────────────
const retiredNotionPatterns = [
  [/NOTION_[A-Z0-9_]+/, "a NOTION_* environment variable"],
  [/api\.notion\.com/i, "the Notion API hostname"],
  [/addToNotionCRM/, "the retired addToNotionCRM helper"],
];
for (const [pattern, label] of retiredNotionPatterns) {
  if (pattern.test(background)) {
    failures.push(`${backgroundPath}: still contains ${label}`);
  }
}

// ── 3. Gmail delivery must use OAuth, never a mailbox password ───────────────
if (/SMTP_APP_PASSWORD/.test(background)) {
  failures.push(`${backgroundPath}: still depends on SMTP_APP_PASSWORD`);
}

const oauthContract = [
  [/GMAIL_OAUTH_CLIENT_ID/, "GMAIL_OAUTH_CLIENT_ID"],
  [/GMAIL_OAUTH_CLIENT_SECRET/, "GMAIL_OAUTH_CLIENT_SECRET"],
  [/GMAIL_OAUTH_REFRESH_TOKEN/, "GMAIL_OAUTH_REFRESH_TOKEN"],
];
for (const [pattern, label] of oauthContract) {
  if (!pattern.test(background)) {
    failures.push(`${backgroundPath}: Gmail delivery is missing ${label}`);
  }
}

const usesGmailApiOAuth =
  /oauth2\.googleapis\.com\/token/.test(background) &&
  /gmail\.googleapis\.com\/gmail\/v1\/users\//.test(background);
const usesNodemailerOAuth =
  /type\s*:\s*["']OAuth2["']/.test(background) &&
  /clientId\s*:/.test(background) &&
  /clientSecret\s*:/.test(background) &&
  /refreshToken\s*:/.test(background);
if (!usesGmailApiOAuth && !usesNodemailerOAuth) {
  failures.push(
    `${backgroundPath}: Gmail delivery uses OAuth variables but no Gmail API or Nodemailer OAuth flow`,
  );
}

assert.equal(
  safeEmailDeliveryErrorLabel(
    new Error("Gmail send failed (HTTP 429, code=rateLimitExceeded)"),
  ),
  "google_http_429_rateLimitExceeded",
);
assert.equal(
  safeEmailDeliveryErrorLabel(
    new Error("Gmail OAuth token exchange failed (HTTP 503)"),
  ),
  "google_http_503",
);
assert.equal(
  safeEmailDeliveryErrorLabel(
    new Error("Gmail send failed (transport code=AbortError)"),
  ),
  "google_transport_AbortError",
);
for (const unsafeEmailError of [
  new Error("Nodemailer failed for private@example.com"),
  new Error(
    "Gmail send failed (HTTP 429, code=rateLimitExceeded private@example.com)",
  ),
  "Gmail send failed (HTTP 429, code=rateLimitExceeded)",
]) {
  const label = safeEmailDeliveryErrorLabel(unsafeEmailError);
  assert.equal(label, "email_delivery_error");
  assert.doesNotMatch(
    label,
    /private@example\.com|Nodemailer|rateLimitExceeded/,
  );
}

const gmailDeliveryStart = background.indexOf(
  "function normalizedGoogleErrorCode",
);
const gmailDeliveryEnd = background.indexOf(
  "function escHtml",
  gmailDeliveryStart,
);
if (gmailDeliveryStart < 0 || gmailDeliveryEnd < 0) {
  failures.push(`${backgroundPath}: cannot isolate Gmail delivery safeguards`);
} else {
  const gmailDelivery = background.slice(gmailDeliveryStart, gmailDeliveryEnd);
  const gmailRetryContract = [
    [
      /const\s+GOOGLE_FETCH_MAX_ATTEMPTS\s*=\s*3\s*;/,
      "a three-attempt Google request limit",
    ],
    [
      /const\s+GOOGLE_RETRY_BASE_DELAY_MS\s*=\s*1_000\s*;/,
      "a one-second retry base delay",
    ],
    [/Math\.random\(\)/, "retry jitter"],
    [/headers\.get\(\s*["']retry-after["']\s*\)/, "Retry-After support"],
    [/normalizedTransportErrorCode/, "normalized transport errors"],
    [/async function fetchGoogleWithRetry/, "shared Google fetch retry handling"],
    [/rateLimitExceeded/, "rateLimitExceeded retry handling"],
    [/userRateLimitExceeded/, "userRateLimitExceeded retry handling"],
  ];
  for (const [pattern, label] of gmailRetryContract) {
    if (!pattern.test(background)) {
      failures.push(`${backgroundPath}: Gmail delivery is missing ${label}`);
    }
  }

  if (
    /(?:response|tokenResponse|gmailResponse)\s*\.\s*(?:text|arrayBuffer|blob)\s*\(/.test(
      gmailDelivery,
    )
  ) {
    failures.push(
      `${backgroundPath}: Gmail delivery reads a raw Google response body for an error path`,
    );
  }
}

const emailPipelineStart = background.indexOf("// Email (best-effort)");
const emailPipelineEnd = background.indexOf(
  "if (leadPersisted)",
  emailPipelineStart,
);
if (emailPipelineStart < 0 || emailPipelineEnd < 0) {
  failures.push(`${backgroundPath}: cannot isolate the email delivery catch`);
} else {
  const emailPipeline = background.slice(emailPipelineStart, emailPipelineEnd);
  if (!/safeEmailDeliveryErrorLabel\(\s*err\s*\)/.test(emailPipeline)) {
    failures.push(
      `${backgroundPath}: email failures are not reduced to a safe label`,
    );
  }
  if (/console\.error\([\s\S]{0,160},\s*err\s*\)/.test(emailPipeline)) {
    failures.push(
      `${backgroundPath}: email catch still logs the raw error object`,
    );
  }
}

// These were unconditional: both printed after helpers that silently returned
// when configuration was absent, and the Notion helper also swallowed non-2xx.
for (const staleLog of ["Email sent to ${email}", "Added to Notion CRM"]) {
  if (background.includes(staleLog)) {
    failures.push(`${backgroundPath}: retains false-success log "${staleLog}"`);
  }
}

// ── 4. Durable lead data belongs in the private Netlify database helper ──────
const leadsAbsolutePath = join(ROOT, leadsPath);
if (!existsSync(leadsAbsolutePath)) {
  failures.push(`${leadsPath}: required Netlify Database helper is missing`);
} else {
  const leads = read(leadsPath);
  const leadsContract = [
    [/from\s+["']@netlify\/database["']/, "an @netlify/database import"],
    [/\bgetDatabase\s*\(/, "getDatabase()"],
    [/\bsql(?:\s*<[^>]+>)?\s*`/, "a parameterized sql tagged template"],
    [/\baudit_leads\b/i, "the audit_leads table"],
  ];
  for (const [pattern, label] of leadsContract) {
    if (!pattern.test(leads)) {
      failures.push(`${leadsPath}: missing ${label}`);
    }
  }

  if (!background.includes("./lib/audit-leads.mts")) {
    failures.push(`${backgroundPath}: does not import ${leadsPath}`);
  }
}

const persistenceGate = background.match(
  /const\s+([A-Za-z_$][\w$]*)\s*=\s*shouldPersistAuditLead\(\s*context\.deploy\.context\s*\)\s*;/,
);
if (!persistenceGate) {
  failures.push(
    `${backgroundPath}: durable lead writes must require the production deploy context`,
  );
} else {
  const gateName = persistenceGate[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const gatedUpsert = new RegExp(
    `if\\s*\\(\\s*${gateName}\\s*\\)\\s*\\{[\\s\\S]{0,2400}?await\\s+upsertAuditLead\\s*\\(`,
  );
  if (!gatedUpsert.test(background)) {
    failures.push(
      `${backgroundPath}: upsertAuditLead() is not guarded by the production context check`,
    );
  }
}

const safeDatabaseLoggingContracts = [
  [
    background,
    "Netlify Database lead write failed",
    `${backgroundPath}: lead-write failures must use a non-PII database label`,
  ],
  [
    background,
    "Email delivery status update failed",
    `${backgroundPath}: delivery-status failures must use a non-PII database label`,
  ],
  [
    read(cleanupPath),
    "Audit lead retention cleanup failed",
    `${cleanupPath}: retention failures must use a non-PII database label`,
  ],
];
for (const [source, message, failure] of safeDatabaseLoggingContracts) {
  const messageIndex = source.indexOf(message);
  const nearbySource =
    messageIndex >= 0 ? source.slice(messageIndex, messageIndex + 260) : "";
  if (
    messageIndex < 0 ||
    !/safeDatabaseErrorLabel\(err\)/.test(nearbySource) ||
    /,\s*err\s*\)/.test(nearbySource)
  ) {
    failures.push(failure);
  }
}

// ── 5. Retention must be bounded and attempted before Blob scans ─────────────
const migration = read(migrationPath);
if (
  !/CHECK\s*\(\s*retention_until\s*>\s*submitted_at\s+AND\s+retention_until\s*<=\s*submitted_at\s*\+\s*INTERVAL\s*["']12 months["']\s*\)/i.test(
    migration,
  )
) {
  failures.push(
    `${migrationPath}: retention_until must be after submitted_at and no later than 12 months`,
  );
}

const nullableScoresMigration = read(nullableScoresMigrationPath);
for (const column of ["overall_score", "grade", "score_band"]) {
  if (
    !new RegExp(
      `ALTER\\s+COLUMN\\s+${column}\\s+DROP\\s+NOT\\s+NULL`,
      "i",
    ).test(nullableScoresMigration)
  ) {
    failures.push(
      `${nullableScoresMigrationPath}: ${column} must allow null when Lighthouse is unavailable`,
    );
  }
}
if (!/pagespeed_source\s+IN\s*\([^)]*['"]unavailable['"]/i.test(nullableScoresMigration)) {
  failures.push(
    `${nullableScoresMigrationPath}: pagespeed_source does not accept the unavailable state`,
  );
}

const cleanup = read(cleanupPath);
const databasePurgeIndex = cleanup.indexOf("await purgeExpiredAuditLeads(now)");
const firstBlobListIndex = cleanup.indexOf(".list()");
if (databasePurgeIndex < 0) {
  failures.push(`${cleanupPath}: expired audit leads are never purged`);
} else if (
  firstBlobListIndex >= 0 &&
  databasePurgeIndex > firstBlobListIndex
) {
  failures.push(
    `${cleanupPath}: database retention purge must run before Blob listings`,
  );
}
if (
  !/try\s*\{[\s\S]{0,500}await\s+purgeExpiredAuditLeads\(now\)[\s\S]{0,500}\}\s*catch\s*\(/.test(
    cleanup,
  )
) {
  failures.push(
    `${cleanupPath}: database retention purge must stay best-effort and isolated`,
  );
}

// ── 6. The public processor disclosure must match the implementation ─────────
const privacyHtml = read(privacyPath);
const privacyText = privacyHtml
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const privacyContract = [
  [/\bNetlify\b/i, "Netlify"],
  [/\bAI Gateway\b/i, "Netlify AI Gateway"],
  [/\bAnthropic\b/i, "Anthropic"],
  [/\b(?:Google )?PageSpeed\b/i, "Google PageSpeed"],
  [/\b(?:Google Workspace|Gmail)\b/i, "Google Workspace/Gmail"],
];
for (const [pattern, label] of privacyContract) {
  if (!pattern.test(privacyText)) {
    failures.push(`${privacyPath}: visible disclosure does not name ${label}`);
  }
}
if (/\bNotion\b/i.test(privacyText)) {
  failures.push(`${privacyPath}: visible disclosure still names retired Notion`);
}

const retentionDisclosure = [
  [
    /generated report and its related viewing data are scheduled for deletion after 30 days/i,
    "the report and viewing-data 30-day deletion schedule",
  ],
  [
    /active follow-up record is scheduled for deletion 12 months after submission/i,
    "the active-row 12-month deletion schedule",
  ],
  [
    /scheduled backups are retained for 30 days/i,
    "Netlify Pro scheduled-backup retention",
  ],
  [
    /on-publish backups retain the last 10 production publishes/i,
    "Netlify Pro on-publish backup retention",
  ],
  [
    /approves a non-production deploy[\s\S]{0,180}isolated database copy[\s\S]{0,220}removed with the branch/i,
    "isolated non-production database copies and branch removal",
  ],
];
for (const [pattern, label] of retentionDisclosure) {
  if (!pattern.test(privacyText)) {
    failures.push(`${privacyPath}: visible disclosure is missing ${label}`);
  }
}

if (failures.length) {
  console.error("Audit integration contract failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Audit integration contract passed: production-only Netlify Database writes, bounded retention cleanup, Netlify AI Gateway, Google OAuth delivery, accurate logs, and matching disclosure.",
);

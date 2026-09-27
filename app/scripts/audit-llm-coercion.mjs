/**
 * audit-llm-coercion — every model field and every measured score must remain
 * truthful before it reaches report HTML.
 *
 * The audit pipeline asks a language model for JSON and renders it into a
 * document served from the apex origin and emailed to prospects. Anyone can
 * submit a hostile page to the public form and influence what the model
 * returns, so that JSON is untrusted input.
 *
 * coerceHaikuResult() sanitises it, but it does so with a `...src` spread
 * followed by per-field overrides, and closes with `as unknown as HaikuResult`.
 * That shape fails open: a field nobody overrides passes through raw, and the
 * double cast stops the compiler from ever mentioning it. revenueImpact.low
 * shipped that way — a string reached formatCurrency, whose `n: number`
 * annotation is unenforced at runtime because String.prototype.toLocaleString
 * returns the string verbatim. Stored XSS.
 *
 * This gate checks both invariants: model fields fail closed, and unavailable
 * unavailable Lighthouse data renders as a recovery state without a fabricated
 * score, grade, finding, roadmap, benchmark, or commercial-impact claim.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  coerceHaikuResult,
  deriveOverallScore,
  measuredMetric,
  unavailablePageSpeedResult,
} from "../../netlify/functions/run-audit-background.mts";
import {
  calculateGrade,
  generateAuditHTML,
} from "../../netlify/functions/lib/templates.mts";
import { currentIncompleteReportData } from "../../netlify/functions/lib/stored-audit-report.mts";
import { requestPageSpeed } from "../../netlify/functions/lib/pagespeed-request.mts";
import { generateOGSvg } from "../../netlify/functions/og-image.mts";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const failures = [];

const background = await readFile(
  path.join(repoRoot, "netlify", "functions", "run-audit-background.mts"),
  "utf8",
);
const templates = await readFile(
  path.join(repoRoot, "netlify", "functions", "lib", "templates.mts"),
  "utf8",
);

// Google documents API keys in query strings as URL-scan exposure. This keeps
// the provider request key out of the URL without making a provider call.
const pageSpeedTestKey = "test-only-pagespeed-key";
const originalFetch = globalThis.fetch;
let pageSpeedRequest;
globalThis.fetch = async (input, init) => {
  pageSpeedRequest = { input, init };
  return new Response("{}", { status: 200 });
};
try {
  await requestPageSpeed("https://example.com", pageSpeedTestKey);
} finally {
  globalThis.fetch = originalFetch;
}
assert.ok(pageSpeedRequest, "PageSpeed request was not captured");
const pageSpeedUrl = new URL(String(pageSpeedRequest.input));
const pageSpeedHeaders = new Headers(pageSpeedRequest.init?.headers);
assert.equal(pageSpeedUrl.searchParams.has("key"), false);
assert.equal(pageSpeedUrl.toString().includes(pageSpeedTestKey), false);
assert.deepEqual(
  [...pageSpeedHeaders].filter(([, value]) => value.includes(pageSpeedTestKey)),
  [["x-goog-api-key", pageSpeedTestKey]],
);

// ── 1. Every HaikuResult field is explicitly coerced ──────────────────────────
const iface = background.match(/interface HaikuResult \{([\s\S]*?)\n\}/)?.[1];
if (!iface) {
  failures.push("run-audit-background.mts: cannot find the HaikuResult interface");
} else {
  const declared = [...iface.matchAll(/^\s*(\w+)\s*[?:]/gm)].map((m) => m[1]);
  if (declared.length < 5) {
    failures.push(
      `HaikuResult parsed as only ${declared.length} fields — the regex has drifted from the source`,
    );
  }

  const body = background.match(
    /function coerceHaikuResult\(raw: unknown\): HaikuResult \{([\s\S]*?)\n\}/,
  )?.[1];
  if (!body) {
    failures.push("run-audit-background.mts: cannot find coerceHaikuResult");
  } else {
    const returned = body.slice(body.lastIndexOf("return {"));
    for (const field of declared) {
      // Either overridden in the return, or bound to a coerced local above it.
      const named = new RegExp(`(^|[\\s{,])${field}\\s*[,:]`, "m").test(returned);
      if (!named) {
        failures.push(
          `coerceHaikuResult does not explicitly coerce "${field}" — it rides the ...src ` +
            `spread straight from the model into the report`,
        );
      }
    }
  }
}

// ── 2. Missing provider data stays unavailable end to end ────────────────────
const observedAt = "2026-08-02T12:00:00.000Z";
assert.deepEqual(measuredMetric(0, observedAt), {
  value: 0,
  source: "google_pagespeed_lighthouse",
  observedAt,
  availability: "measured",
});
assert.equal(measuredMetric(1, observedAt).value, 100);
assert.equal(measuredMetric(2, observedAt).value, null);
assert.equal(measuredMetric(Number.NaN, observedAt).value, null);

const unavailable = unavailablePageSpeedResult("example.com", observedAt);
for (const metric of Object.values(unavailable.metrics)) {
  assert.equal(metric.value, null);
  assert.equal(metric.availability, "unavailable");
  assert.equal(metric.source, "google_pagespeed_lighthouse");
  assert.equal(metric.observedAt, observedAt);
}
assert.equal(deriveOverallScore(unavailable.metrics), null);

const partialMetrics = structuredClone(unavailable.metrics);
partialMetrics.performance = {
  value: 0,
  availability: "measured",
  source: "google_pagespeed_lighthouse",
  observedAt,
};
partialMetrics.seo = {
  value: 80,
  availability: "measured",
  source: "google_pagespeed_lighthouse",
  observedAt,
};
assert.equal(deriveOverallScore(partialMetrics), null);

const completeMetrics = structuredClone(partialMetrics);
completeMetrics.accessibility = {
  value: 40,
  availability: "measured",
  source: "google_pagespeed_lighthouse",
  observedAt,
};
completeMetrics.bestPractices = {
  value: 40,
  availability: "measured",
  source: "google_pagespeed_lighthouse",
  observedAt,
};
assert.equal(deriveOverallScore(completeMetrics), 40);
assert.equal(calculateGrade(deriveOverallScore(completeMetrics)), "D");

const storedUnavailable = currentIncompleteReportData({
  companyName: "Stored Bakery",
  domain: "stored.example",
  measurementStatus: "unavailable",
  createdAt: observedAt,
  expiresAt: "2026-09-01T12:00:00.000Z",
}, "stored-unavailable-abc123");
assert.ok(storedUnavailable);
assert.equal(storedUnavailable.overallScore, null);
assert.equal(storedUnavailable.grade, null);
assert.ok(Object.values(storedUnavailable.metrics).every((metric) => metric.availability === "unavailable"));
assert.match(generateAuditHTML(storedUnavailable), /We couldn&rsquo;t complete this check\./);

const storedPartial = currentIncompleteReportData({
  companyName: "Stored Partial Bakery",
  domain: "stored-partial.example",
  measurementStatus: "partial",
  metrics: partialMetrics,
  createdAt: observedAt,
}, "stored-partial-abc123");
assert.ok(storedPartial);
assert.equal(storedPartial.overallScore, null);
assert.equal(storedPartial.metrics.performance.value, 0);
assert.equal(storedPartial.metrics.seo.value, 80);
assert.equal(storedPartial.metrics.accessibility.availability, "unavailable");
assert.match(generateAuditHTML(storedPartial), /An overall score needs all four\./);

assert.equal(currentIncompleteReportData({
  domain: "stored-complete.example",
  measurementStatus: "complete",
  createdAt: observedAt,
}, "stored-complete-abc123"), null);
assert.equal(currentIncompleteReportData({
  domain: "stored-partial-without-metrics.example",
  measurementStatus: "partial",
  createdAt: observedAt,
}, "stored-partial-without-metrics-abc123"), null);

const coerced = coerceHaikuResult({
  companyName: "Example",
  niche: "Bakery",
  city: "New York",
  state: "NY",
  ctaText: "Review the evidence",
  executiveSummary: "This will increase revenue by 30%.",
  benchmarkPercentile: 92,
  revenueImpact: { low: 8_000, high: 32_000 },
  findings: [
    {
      severity: "warning",
      title: "Measured performance signal",
      description: "Lighthouse returned a measured Performance score of 63/100.",
    },
    {
      severity: "critical",
      title: "Unsupported promise",
      description: "This costs $10,000 in revenue and puts the site behind competitors.",
    },
  ],
  roadmap: [
    { phase: "First", title: "Repair", items: ["Address the measured audit"] },
  ],
});
assert.equal(coerced.executiveSummary, "");
assert.equal(coerced.findings.length, 1);
assert.equal("revenueImpact" in coerced, false);
assert.equal("benchmarkPercentile" in coerced, false);

const unavailableReport = generateAuditHTML({
  companyName: "Example Bakery",
  domain: "example.com",
  city: "",
  state: "",
  niche: "Bakery",
  email: "owner@example.com",
  slug: "example-bakery-abc123",
  overallScore: null,
  grade: null,
  metrics: unavailable.metrics,
  brandColors: {
    primary: "#F97316",
    accent: "#f7c948",
    background: "#0f0f0f",
  },
  findings: [
    {
      severity: "info",
      title: "Lighthouse measurement unavailable",
      description: "No score was substituted.",
    },
  ],
  ctaText: "Review the evidence",
  auditDate: "August 2, 2026",
});
assert.match(unavailableReport, /We couldn&rsquo;t complete this check\./);
assert.match(unavailableReport, /This doesn’t mean anything is wrong with your website/);
assert.match(unavailableReport, /https:\/\/pagespeed\.web\.dev\/analysis\?url=https%3A%2F%2Fexample\.com/);
assert.match(unavailableReport, /Get a free human first look/);
assert.doesNotMatch(unavailableReport, />N\/A</);
assert.doesNotMatch(unavailableReport, /Not measured|Overall signal|Turn the report into a repair/);
assert.doesNotMatch(unavailableReport, /instrument-score|instrument-findings|instrument-roadmap/);
assert.doesNotMatch(unavailableReport, /Save PDF/);
assert.doesNotMatch(
  unavailableReport,
  /estimated annual|revenue impact|benchmark|ahead of|mobile score|security score/i,
);

const partialReport = generateAuditHTML({
  companyName: "Partial Bakery",
  domain: "partial.example",
  city: "",
  state: "",
  niche: "Bakery",
  email: "owner@example.com",
  slug: "partial-bakery-abc123",
  overallScore: null,
  grade: null,
  metrics: partialMetrics,
  brandColors: {
    primary: "#F97316",
    accent: "#f7c948",
    background: "#0f0f0f",
  },
  findings: [{ severity: "warning", title: "Do not render", description: "Partial data is not a finding." }],
  ctaText: "Do not render",
  auditDate: "August 2, 2026",
  roadmap: [{ phase: "Do not render", title: "Do not render", items: ["Do not render"] }],
});
assert.match(partialReport, /2 of 4 checks finished\. An overall score needs all four\./);
assert.match(partialReport, /<dt>Performance<\/dt>[\s\S]*?<dd>0<\/dd>/);
assert.match(partialReport, /<dt>SEO<\/dt>[\s\S]*?<dd>80<\/dd>/);
assert.doesNotMatch(partialReport, />N\/A</);
assert.doesNotMatch(partialReport, /Overall signal|Not measured|What deserves attention|Repair order|Turn the report into a repair/);
assert.doesNotMatch(partialReport, /Accessibility|Best Practices|Do not render/);

const sameIdentityReport = generateAuditHTML({
  companyName: "Example.com",
  domain: "https://www.example.com/",
  city: "",
  state: "",
  niche: "Bakery",
  email: "owner@example.com",
  slug: "same-identity-abc123",
  overallScore: null,
  grade: null,
  metrics: unavailable.metrics,
  brandColors: { primary: "#F97316", accent: "#f7c948", background: "#0f0f0f" },
  findings: [],
  ctaText: "",
  auditDate: "August 2, 2026",
});
assert.doesNotMatch(sameIdentityReport, /class="instrument-domain/);

const completeReport = generateAuditHTML({
  companyName: "Measured Bakery",
  domain: "measured.example",
  city: "",
  state: "",
  niche: "Bakery",
  email: "owner@example.com",
  slug: "measured-bakery-abc123",
  overallScore: 40,
  grade: "D",
  metrics: completeMetrics,
  brandColors: {
    primary: "#F97316",
    accent: "#f7c948",
    background: "#0f0f0f",
  },
  findings: [
    {
      severity: "warning",
      title: "Measured performance signal",
      description: "Lighthouse returned a measured category score.",
    },
  ],
  ctaText: "Review the evidence",
  auditDate: "August 2, 2026",
});
assert.match(completeReport, />40</);
assert.match(completeReport, /Grade D/);
assert.match(completeReport, /4 of 4 Lighthouse categories were measured/);
assert.doesNotMatch(completeReport, /estimated annual|revenue impact|benchmark/i);

const unavailableOg = generateOGSvg({
  companyName: "Example Bakery",
  domain: "example.com",
  grade: null,
  overallScore: null,
  createdAt: observedAt,
  expiresAt: "2026-09-01T12:00:00.000Z",
});
assert.match(unavailableOg, /CHECK INCOMPLETE/);
assert.match(unavailableOg, /The automated check didn’t finish\./);
assert.match(unavailableOg, /No score, findings, or repair plan\./);
assert.doesNotMatch(unavailableOg, /N\/A|<circle|Performance · SEO|NaN|Grade null|Mobile · SEO · Security/);

const partialOg = generateOGSvg({
  companyName: "Partial Bakery",
  domain: "partial.example",
  grade: null,
  overallScore: null,
  measurementStatus: "partial",
  createdAt: observedAt,
  expiresAt: "2026-09-01T12:00:00.000Z",
});
assert.match(partialOg, /PARTIAL CHECK/);
assert.match(partialOg, /Some categories returned\./);
assert.match(partialOg, /Only completed categories are shown\./);
assert.doesNotMatch(partialOg, /N\/A|<circle|No score substituted/);

const measuredOg = generateOGSvg({
  companyName: "Measured Bakery",
  domain: "measured.example",
  grade: "D",
  overallScore: 40,
  createdAt: observedAt,
  expiresAt: "2026-09-01T12:00:00.000Z",
});
assert.match(measuredOg, />40</);
assert.match(measuredOg, /Grade D/);
assert.match(measuredOg, /stroke-dasharray="302 754"/);
assert.doesNotMatch(measuredOg, />N\/A</);

if (/otherwise New York|otherwise NY/.test(background)) {
  failures.push(
    "run-audit-background.mts: the model prompt still assigns an unverified New York location",
  );
}
if (/using fallback scores|performanceScore:\s*52|benchmarkPercentile/.test(background)) {
  failures.push(
    "run-audit-background.mts: fabricated fallback-score or benchmark logic remains active",
  );
}

// ── 3. Report HTML interpolates model prose only through the escaper ──────────
const unescaped = [...templates.matchAll(/\$\{data\.(\w+(?:\.\w+)*)\}/g)]
  .map((m) => m[1])
  .filter((expr) => /explanation|summary|title|description|name|text|niche|city|state/i.test(expr));
for (const expr of new Set(unescaped)) {
  failures.push(
    `templates.mts: \${data.${expr}} is interpolated without esc() — model prose must be escaped`,
  );
}

// ── 4. Every blob store is purged by something ────────────────────────────────
// Two stores accumulated forever because nothing listed them: rate-limits held
// a per-visitor record for a check that stopped mattering after 24h, and
// audit-engagement kept a reading profile of each recipient after the report
// itself was deleted and its URL started returning 410. Neither failed
// anything. A store nobody purges is invisible until it is a disclosure.
const fnDir = path.join(repoRoot, "netlify", "functions");
const fnFiles = (await readdir(fnDir, { withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.endsWith(".mts"))
  .map((e) => path.join(fnDir, e.name));

const written = new Set();
for (const file of fnFiles) {
  const source = await readFile(file, "utf8");
  for (const m of source.matchAll(/getStore\(\s*(?:\{\s*name:\s*)?"([a-z-]+)"/g)) {
    written.add(m[1]);
  }
}

const cleanup = await readFile(path.join(fnDir, "cleanup-expired.mts"), "utf8");
for (const store of [...written].sort()) {
  if (!cleanup.includes(`"${store}"`)) {
    failures.push(
      `netlify/functions/cleanup-expired.mts never purges the "${store}" blob store — ` +
        `data written there is retained indefinitely`,
    );
  }
}

// ── 5. No function answers every origin ───────────────────────────────────────
// record-engagement returned Access-Control-Allow-Origin: * on an endpoint that
// writes a permanently-retained blob at a caller-chosen key, with no auth and
// no rate limit. Its only real caller is the report page, same-origin, so the
// wildcard bought nothing and let any page on the internet write to the store.
for (const file of fnFiles) {
  const source = await readFile(file, "utf8");
  if (/"Access-Control-Allow-Origin":\s*"\*"/.test(source)) {
    failures.push(
      `${path.relative(repoRoot, file)}: returns Access-Control-Allow-Origin: * — ` +
        "echo the site origin instead, or say here why any origin may call this",
    );
  }
}

if (failures.length > 0) {
  console.error("LLM coercion audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Function-safety audit passed: unavailable Lighthouse data renders as recovery, partial reports stay partial, Haiku output fails closed, report claims stay evidence-bound, every blob store is purged, and no function answers every origin.",
);

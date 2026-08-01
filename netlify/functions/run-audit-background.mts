// run-audit-background.mts — Background audit pipeline
// Runs the full audit: PageSpeed → Haiku → Template → Blob → Database → Email
// Background functions return 202 immediately; this code runs for up to 15 minutes.

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { Buffer } from "node:buffer";
import { createTransport } from "nodemailer";
import {
  safeDatabaseErrorLabel,
  shouldPersistAuditLead,
  upsertAuditLead,
  updateAuditLeadEmailDelivery,
  type AuditAnalysisSource,
  type AuditEmailDeliveryStatus,
  type AuditPageSpeedSource,
} from "./lib/audit-leads.mts";
import {
  generateAuditHTML,
  calculateGrade,
  type AuditData,
} from "./lib/templates.mts";

const GMAIL_FROM = "hello@littlefightnyc.com";
const GOOGLE_FETCH_MAX_ATTEMPTS = 3;
const GOOGLE_RETRY_BASE_DELAY_MS = 1_000;
const GOOGLE_RETRY_MAX_DELAY_MS = 60_000;
const GMAIL_RETRYABLE_FORBIDDEN_CODES = new Set([
  "rateLimitExceeded",
  "userRateLimitExceeded",
]);
const PRIVACY_NOTICE_VERSION = "2026-07-31";

declare const Netlify: {
  env: { get(key: string): string | undefined };
};

// Resilient env reader — Netlify global may not exist in all contexts
function getEnv(key: string): string | undefined {
  try {
    const val =
      typeof Netlify !== "undefined" ? Netlify.env.get(key) : undefined;
    if (val) return val;
  } catch {
    /* Netlify global unavailable */
  }
  return process.env[key];
}

function secretsMatch(expected: string, received: string): boolean {
  if (!expected || expected.length !== received.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return mismatch === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// ═══════════════════════════════════════════════════════════════
// Status helper — updates the polling blob
// ═══════════════════════════════════════════════════════════════

async function setStatus(
  slug: string,
  status: string,
  step: string,
  url: string | null = null,
  message: string | null = null,
) {
  const store = getStore({ name: "audit-status", consistency: "strong" });
  await store.setJSON(slug, { status, step, url, message });
}

// ═══════════════════════════════════════════════════════════════
// PageSpeed Insights API
// ═══════════════════════════════════════════════════════════════

interface PageSpeedResult {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  pageTitle: string;
  failingAudits: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
}

async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiKey = getEnv("PAGESPEED_API_KEY");

  const params = new URLSearchParams({ url, strategy: "mobile" });
  params.append("category", "performance");
  params.append("category", "seo");
  params.append("category", "best-practices");
  params.append("category", "accessibility");
  if (apiKey) params.set("key", apiKey);

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;
  console.log(`[audit] PageSpeed request for: ${url.slice(0, 100)}`);
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60_000) });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PageSpeed API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const lr = data.lighthouseResult;

  // Scores come back 0–1, convert to 0–100
  const performanceScore = Math.round(
    (lr.categories?.performance?.score ?? 0) * 100,
  );
  const seoScore = Math.round((lr.categories?.seo?.score ?? 0) * 100);
  const accessibilityScore = Math.round(
    (lr.categories?.accessibility?.score ?? 0) * 100,
  );
  const bestPracticesScore = Math.round(
    (lr.categories?.["best-practices"]?.score ?? 0) * 100,
  );

  // Page title
  const titleAudit = lr.audits?.["document-title"];
  const pageTitle: string =
    titleAudit?.details?.items?.[0]?.text ||
    titleAudit?.title ||
    "";

  // Failing audits (score < 0.9, skip informational)
  const failingAudits: PageSpeedResult["failingAudits"] = [];
  for (const [id, raw] of Object.entries(lr.audits ?? {})) {
    const audit = raw as Record<string, any>;
    if (
      audit.score !== null &&
      audit.score < 0.9 &&
      audit.title &&
      audit.scoreDisplayMode !== "informative" &&
      audit.scoreDisplayMode !== "notApplicable" &&
      audit.scoreDisplayMode !== "manual"
    ) {
      failingAudits.push({
        id,
        title: audit.title,
        description: (audit.description || "").slice(0, 300),
        score: audit.score,
      });
    }
  }

  failingAudits.sort((a, b) => a.score - b.score);

  return {
    performanceScore,
    seoScore,
    accessibilityScore,
    bestPracticesScore,
    pageTitle,
    failingAudits,
  };
}

// ═══════════════════════════════════════════════════════════════
// Site scrape — brand colors + text content (one fetch, two uses)
// ═══════════════════════════════════════════════════════════════

interface BrandColors {
  primary: string;
  accent: string;
  background: string;
}

interface SiteScrape {
  brandColors: BrandColors;
  textSnippet: string; // plain-text summary for Haiku context
}

/**
 * Hosts that must never be fetched on a visitor's behalf.
 *
 * run-audit.mts screens the SUBMITTED hostname, but that check happens once,
 * on a string, in a different function. The scrape below used
 * `redirect: "follow"`, so a public host could answer 302 with
 * http://169.254.169.254/ and the platform would follow it into cloud
 * metadata — the submitted hostname having passed inspection minutes earlier.
 */
const BLOCKED_SCRAPE_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
]);

function isBlockedScrapeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (BLOCKED_SCRAPE_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".internal")) return true;
  return /^(?:127\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|::1$|fc|fd|fe80:)/i.test(
    host,
  );
}

/** Fetch that re-screens the host at every redirect hop instead of once. */
async function fetchScreened(
  startUrl: string,
  init: RequestInit,
  maxHops = 4,
): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop <= maxHops; hop += 1) {
    const parsed = new URL(current);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(`blocked scheme: ${parsed.protocol}`);
    }
    if (isBlockedScrapeHost(parsed.hostname)) {
      throw new Error(`blocked host: ${parsed.hostname}`);
    }
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status < 300 || res.status >= 400) return res;
    const location = res.headers.get("location");
    if (!location) return res;
    current = new URL(location, current).toString();
  }
  throw new Error("too many redirects");
}

async function scrapeSite(url: string): Promise<SiteScrape> {
  const defaultColors: BrandColors = {
    primary: "#F97316",
    accent: "#f7c948",
    background: "#0f0f0f",
  };

  try {
    const res = await fetchScreened(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LiFiAuditBot/1.0; +https://littlefightnyc.com)",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return { brandColors: defaultColors, textSnippet: "" };

    const html = await res.text();

    // ── Brand colors ──────────────────────────────────────────
    let brandColors = { ...defaultColors };

    const themeMatch = html.match(
      /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
    );
    if (themeMatch?.[1]) {
      brandColors.primary = themeMatch[1];
    } else {
      const cssMatch = html.match(
        /--(?:primary|brand|main|accent)(?:-color)?:\s*([#\w(),.% ]+)/i,
      );
      if (cssMatch?.[1]) {
        const color = cssMatch[1].trim().replace(/;.*/, "");
        if (color.startsWith("#") || color.startsWith("rgb")) {
          brandColors.primary = color;
        }
      }
    }

    // ── Text content for Haiku ────────────────────────────────
    // Strip scripts, styles, and tags — keep visible text
    const textOnly = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
      .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Take the first ~800 chars — enough for Haiku to understand the business
    const textSnippet = textOnly.slice(0, 800);

    return { brandColors, textSnippet };
  } catch {
    return { brandColors: defaultColors, textSnippet: "" };
  }
}

// ═══════════════════════════════════════════════════════════════
// Haiku 4.5 — personalized findings + revenue impact
// ═══════════════════════════════════════════════════════════════

interface HaikuResult {
  companyName: string;
  niche: string;
  city: string;
  state: string;
  findings: AuditData["findings"];
  revenueImpact: AuditData["revenueImpact"];
  ctaText: string;
  executiveSummary: string;
  benchmarkPercentile: number;
  roadmap: Array<{ phase: string; title: string; items: string[] }>;
}

async function callHaiku(
  domain: string,
  pageTitle: string,
  scores: {
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
  },
  failingAudits: PageSpeedResult["failingAudits"],
  siteTextSnippet: string,
): Promise<HaikuResult> {
  const apiKey = getEnv("ANTHROPIC_API_KEY");
  const baseUrl = getEnv("ANTHROPIC_BASE_URL");
  if (!apiKey || !baseUrl) {
    throw new Error("Netlify AI Gateway is not configured");
  }

  const gatewayUrl = new URL(baseUrl);
  if (gatewayUrl.protocol !== "https:") {
    throw new Error("Netlify AI Gateway URL must use HTTPS");
  }

  const topFailing = failingAudits
    .slice(0, 12)
    .map(
      (a) =>
        `- ${a.title} (score: ${Math.round(a.score * 100)}/100): ${a.description.slice(0, 120)}`,
    )
    .join("\n");

  const siteContext = siteTextSnippet
    ? `\nActual text content from the homepage:\n"${siteTextSnippet}"\n`
    : "";

  const prompt = `You are a website audit expert working for a premium NYC IT consultancy. Analyze this website and return a JSON object.

Website: ${domain}
Page title: ${pageTitle}
${siteContext}
Lighthouse scores (mobile):
- Performance: ${scores.performanceScore}/100
- SEO: ${scores.seoScore}/100
- Accessibility: ${scores.accessibilityScore}/100
- Best Practices: ${scores.bestPracticesScore}/100

Top failing audits:
${topFailing || "None significant"}

IMPORTANT: Use the actual homepage text content above to determine the company name and business category. Do NOT guess from the domain name alone.

Return ONLY valid JSON (no markdown fences, no commentary) with this structure:
{
  "companyName": "Best guess at company name from page title / domain",
  "niche": "Business category (Medical Aesthetics, Restaurant, Law Firm, etc.)",
  "city": "City if detectable, otherwise New York",
  "state": "State abbreviation if detectable, otherwise NY",
  "executiveSummary": "2-3 sentences. High-level overview of the site's health, the most impactful issue, and what fixing it would unlock. Write like a consultant briefing a CEO.",
  "benchmarkPercentile": 72,
  "findings": [
    {
      "severity": "critical",
      "title": "Short finding title (5-8 words)",
      "description": "2-3 sentences. Be specific about the issue, cite the actual score, and explain the business cost in plain language."
    }
  ],
  "revenueImpact": {
    "low": 8000,
    "high": 35000,
    "explanation": "1-2 sentences tying the fixes to realistic revenue gains for a small business."
  },
  "roadmap": [
    { "phase": "Week 1", "title": "Critical Fixes", "items": ["Fix X", "Fix Y"] },
    { "phase": "Week 2", "title": "SEO Foundation", "items": ["Add Z", "Optimize W"] },
    { "phase": "Week 3", "title": "Polish & Performance", "items": ["Improve A", "Enhance B"] }
  ],
  "ctaText": "Compelling 6-10 word call-to-action"
}

Rules:
- Generate exactly 5-7 findings, ordered critical → warning → info.
- Reference the ACTUAL scores, don't invent numbers.
- Revenue estimates should be plausible for a local SMB.
- ctaText should feel helpful, not salesy.
- executiveSummary should sound like a senior consultant, not a tool.
- benchmarkPercentile: estimate what percentile this site is in compared to similar businesses (0-100). Base on the overall score average — 70+ is better than ~65% of SMB sites.
- roadmap: exactly 3 phases. Map the actual findings to a realistic fix timeline. Items should be specific and actionable.`;

  console.log("[audit] Calling Haiku through Netlify AI Gateway");

  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Haiku API ${res.status}: ${text.slice(0, 300)}`);
  }

  const result = await res.json();
  const content: string = result.content?.[0]?.text ?? "";
  if (!content) throw new Error("Empty Haiku response");

  // Strip code fences if Haiku wraps the JSON
  const cleaned = content
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  return coerceHaikuResult(JSON.parse(cleaned));
}

/**
 * Coerce a model reply into the shape the templates assume.
 *
 * The parse result used to be cast straight to HaikuResult with no schema
 * check. This directory is outside the TypeScript build, so the declared types
 * enforce nothing at runtime, and the submitted site's own homepage text goes
 * into the prompt verbatim — meaning a hostile page can influence these fields.
 * The rendered report is served from the apex origin under
 * `script-src 'unsafe-inline'`, so a wrong type here is a scripting vector,
 * not a cosmetic bug. Anything unexpected is dropped rather than trusted.
 */
function coerceHaikuResult(raw: unknown): HaikuResult {
  const src = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown, fallback = ""): string =>
    typeof v === "string" ? v : v == null ? fallback : String(v);

  const SEVERITIES = new Set(["critical", "warning", "info"]);
  const findings = Array.isArray(src.findings)
    ? (src.findings as unknown[]).filter((f) => f && typeof f === "object").map((f) => {
        const item = f as Record<string, unknown>;
        const severity = str(item.severity).toLowerCase();
        return {
          ...item,
          title: str(item.title),
          description: str(item.description),
          severity: SEVERITIES.has(severity) ? severity : "info",
        };
      })
    : [];

  const roadmap = Array.isArray(src.roadmap)
    ? (src.roadmap as unknown[]).filter((r) => r && typeof r === "object").map((r) => {
        const step = r as Record<string, unknown>;
        return {
          phase: str(step.phase),
          title: str(step.title),
          items: Array.isArray(step.items) ? step.items.map((i) => str(i)) : [],
        };
      })
    : [];

  const percentile = Number(src.benchmarkPercentile);
  const benchmarkPercentile =
    Number.isFinite(percentile) && percentile > 0 && percentile <= 100
      ? Math.round(percentile)
      : undefined;

  // revenueImpact.low/high reach the report through formatCurrency, which is
  // typed (n: number) but only ever calls n.toLocaleString(). String has that
  // method too and returns the string verbatim, so a model-supplied string was
  // interpolated into the report HTML unescaped — stored XSS on the apex
  // origin, in a document the agency emails to prospects. The `...src` spread
  // below carried it: every other field is overridden with a coerced value,
  // this one was not, and the `as unknown as` cast stopped the compiler from
  // ever pointing that out.
  // Finite is not the same as plausible: "9e99" coerces cleanly and would print
  // as a $9 nonillion revenue estimate in a report going to a small-business
  // owner. Cap at a figure no honest estimate for this audience will reach.
  const MAX_REVENUE_ESTIMATE = 10_000_000;
  const money = (v: unknown, fallback: number): number => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return Math.min(Math.round(n), MAX_REVENUE_ESTIMATE);
  };
  const rawImpact = (src.revenueImpact ?? {}) as Record<string, unknown>;
  const revenueImpact = {
    low: money(rawImpact.low, 0),
    high: money(rawImpact.high, 0),
    explanation: str(rawImpact.explanation),
  };

  return {
    ...src,
    companyName: str(src.companyName),
    niche: str(src.niche),
    city: str(src.city),
    state: str(src.state),
    ctaText: str(src.ctaText),
    executiveSummary: str(src.executiveSummary),
    findings,
    roadmap,
    revenueImpact,
    benchmarkPercentile,
  } as unknown as HaikuResult;
}

/** Fallback when Haiku is unavailable */
function fallbackFindings(
  domain: string,
  pageTitle: string,
  scores: {
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
  },
): HaikuResult {
  // Guess company name from page title or domain
  const name =
    pageTitle?.split(/[|\-–—]/)[0]?.trim() ||
    domain
      .split(".")[0]
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    companyName: name,
    niche: "Business",
    city: "New York",
    state: "NY",
    findings: [
      {
        severity: "critical",
        title: "Page Load Speed Needs Improvement",
        description: `Your site scored ${scores.performanceScore}/100 on mobile performance. Research shows every additional second of load time costs roughly 7% in conversions — mobile visitors on slower connections may leave before your page loads.`,
      },
      {
        severity: "critical",
        title: "Mobile Experience Gaps Detected",
        description: `With a ${scores.accessibilityScore}/100 accessibility score, mobile visitors may struggle with your site. Over 60% of web traffic is now mobile — a poor experience here directly translates to lost customers.`,
      },
      {
        severity: "warning",
        title: "SEO Visibility Could Be Stronger",
        description: `Your SEO score of ${scores.seoScore}/100 suggests missing or incomplete meta tags, heading structure issues, or other factors limiting your search engine visibility and organic traffic.`,
      },
      {
        severity: "warning",
        title: "Security & Best Practices Gaps",
        description: `Scoring ${scores.bestPracticesScore}/100 on best practices indicates potential issues with security headers, HTTPS configuration, or outdated patterns that can erode visitor trust.`,
      },
      {
        severity: "info",
        title: "Competitive Opportunity Window",
        description:
          "Most businesses in your area haven't invested in web performance optimization. Fixing these issues now puts you ahead of local competitors still running unoptimized sites.",
      },
    ],
    revenueImpact: {
      low: 8000,
      high: 32000,
      explanation:
        "Based on industry benchmarks, addressing performance and mobile issues typically improves conversion rates by 15–30%, translating to meaningful monthly revenue gains for local businesses.",
    },
    ctaText: "Let's fix this — free strategy call",
    executiveSummary: `Your website scores an average of ${Math.round((scores.performanceScore + scores.seoScore + scores.accessibilityScore + scores.bestPracticesScore) / 4)}/100 across key metrics. The most pressing issues are mobile experience and page speed — two factors that directly impact whether visitors stay or bounce. Addressing the critical findings below could meaningfully improve your online visibility and conversion rate.`,
    benchmarkPercentile: Math.min(95, Math.max(10, Math.round((scores.performanceScore + scores.seoScore + scores.accessibilityScore + scores.bestPracticesScore) / 4 * 0.8))),
    roadmap: [
      { phase: "Week 1", title: "Critical Fixes", items: ["Optimize page load speed", "Fix mobile experience issues"] },
      { phase: "Week 2", title: "SEO Foundation", items: ["Add missing meta tags", "Fix heading structure"] },
      { phase: "Week 3", title: "Polish & Harden", items: ["Security headers & HTTPS", "Accessibility improvements"] },
    ],
  };
}

// ═══════════════════════════════════════════════════════════════
// Email — soft-pitch delivery of the audit report
// ═══════════════════════════════════════════════════════════════

function normalizedGoogleErrorCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const code = value.trim();
  return /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(code) ? code : undefined;
}

export function safeEmailDeliveryErrorLabel(error: unknown): string {
  if (!(error instanceof Error)) return "email_delivery_error";

  const httpFailure =
    /^(?:Gmail OAuth token exchange|Gmail send) failed \(HTTP ([1-5]\d{2})(?:, code=([A-Za-z][A-Za-z0-9_.-]{0,79}))?\)$/.exec(
      error.message,
    );
  if (httpFailure) {
    const codeSuffix = httpFailure[2] ? `_${httpFailure[2]}` : "";
    return `google_http_${httpFailure[1]}${codeSuffix}`;
  }

  const transportFailure =
    /^(?:Gmail OAuth token exchange|Gmail send) failed \(transport code=([A-Za-z][A-Za-z0-9_.-]{0,79})\)$/.exec(
      error.message,
    );
  if (transportFailure) return `google_transport_${transportFailure[1]}`;

  return "email_delivery_error";
}

async function readGoogleErrorCode(
  response: Response,
): Promise<string | undefined> {
  try {
    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object") return undefined;

    const providerError = (payload as { error?: unknown }).error;
    const directCode = normalizedGoogleErrorCode(providerError);
    if (directCode) return directCode;
    if (!providerError || typeof providerError !== "object") return undefined;

    const details = providerError as {
      errors?: unknown;
      status?: unknown;
    };
    if (Array.isArray(details.errors)) {
      for (const entry of details.errors) {
        if (!entry || typeof entry !== "object") continue;
        const reason = normalizedGoogleErrorCode(
          (entry as { reason?: unknown }).reason,
        );
        if (reason) return reason;
      }
    }

    return normalizedGoogleErrorCode(details.status);
  } catch {
    return undefined;
  }
}

function normalizedTransportErrorCode(error: unknown): string {
  if (!error || typeof error !== "object") return "transport_error";

  const cause = (error as { cause?: unknown }).cause;
  if (cause && typeof cause === "object") {
    const causeCode = normalizedGoogleErrorCode(
      (cause as { code?: unknown }).code,
    );
    if (causeCode) return causeCode;
  }

  return (
    normalizedGoogleErrorCode((error as { name?: unknown }).name) ||
    "transport_error"
  );
}

function retryAfterDelayMs(value: string | null): number | undefined {
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds * 1_000);
  }

  const retryAt = Date.parse(value);
  if (Number.isNaN(retryAt)) return undefined;
  return Math.max(0, retryAt - Date.now());
}

function googleRetryDelayMs(attempt: number, retryAfter: string | null): number {
  const exponentialDelay = GOOGLE_RETRY_BASE_DELAY_MS * 2 ** attempt;
  const jitter = Math.floor(Math.random() * GOOGLE_RETRY_BASE_DELAY_MS);
  const requestedDelay = retryAfterDelayMs(retryAfter) || 0;
  return Math.min(
    GOOGLE_RETRY_MAX_DELAY_MS,
    Math.max(exponentialDelay + jitter, requestedDelay),
  );
}

function isRetryableGoogleHttpFailure(
  status: number,
  code: string | undefined,
): boolean {
  return (
    status === 429 ||
    status >= 500 ||
    (status === 403 &&
      code !== undefined &&
      GMAIL_RETRYABLE_FORBIDDEN_CODES.has(code))
  );
}

async function fetchGoogleWithRetry(
  label: "Gmail OAuth token exchange" | "Gmail send",
  request: () => Promise<Response>,
  isRetryableHttp: (status: number, code: string | undefined) => boolean,
): Promise<Response> {
  let finalFailure:
    | { kind: "http"; status: number; code?: string }
    | { kind: "transport"; code: string }
    | undefined;

  for (let attempt = 0; attempt < GOOGLE_FETCH_MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await request();
    } catch (error) {
      finalFailure = {
        kind: "transport",
        code: normalizedTransportErrorCode(error),
      };
      if (attempt === GOOGLE_FETCH_MAX_ATTEMPTS - 1) break;
      await new Promise((resolve) =>
        setTimeout(resolve, googleRetryDelayMs(attempt, null)),
      );
      continue;
    }

    if (response.ok) return response;

    const code = await readGoogleErrorCode(response);
    finalFailure = { kind: "http", status: response.status, code };
    if (
      attempt === GOOGLE_FETCH_MAX_ATTEMPTS - 1 ||
      !isRetryableHttp(response.status, code)
    ) {
      break;
    }

    await new Promise((resolve) =>
      setTimeout(
        resolve,
        googleRetryDelayMs(attempt, response.headers.get("retry-after")),
      ),
    );
  }

  if (finalFailure?.kind === "http") {
    const codeSuffix = finalFailure.code ? `, code=${finalFailure.code}` : "";
    throw new Error(
      `${label} failed (HTTP ${finalFailure.status}${codeSuffix})`,
    );
  }

  throw new Error(
    `${label} failed (transport code=${finalFailure?.code || "transport_error"})`,
  );
}

async function sendAuditEmail(
  email: string,
  companyName: string,
  domain: string,
  grade: string,
  overallScore: number,
  auditUrl: string,
): Promise<{ status: "sent" } | { status: "not_configured" }> {
  const clientId = getEnv("GMAIL_OAUTH_CLIENT_ID");
  const clientSecret = getEnv("GMAIL_OAUTH_CLIENT_SECRET");
  const refreshToken = getEnv("GMAIL_OAUTH_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    console.log("[audit] Gmail OAuth not configured — skipping email");
    return { status: "not_configured" };
  }

  // Sanitize against email header injection
  const safeEmail = email.replace(/[\r\n]/g, '').slice(0, 254);
  const safeCompanyName = companyName.replace(/[\r\n]/g, '').slice(0, 100);

  const subject = `Your Website Audit Is Ready — ${safeCompanyName}`;
  const safeSubject = subject.replace(/[\r\n]/g, '').slice(0, 200);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050507;font-family:Inter,'Segoe UI',system-ui,-apple-system,sans-serif">
  <div style="max-width:580px;margin:0 auto;padding:48px 24px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:36px">
      <p style="color:#F97316;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px">Website Audit Report</p>
      <h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:0;line-height:1.3">${escHtml(safeCompanyName)}</h1>
      <p style="color:#8A8A94;font-size:13px;margin:6px 0 0">${escHtml(domain)}</p>
    </div>

    <!-- Grade card -->
    <div style="background:#1A1C23;border-radius:32px;padding:36px;text-align:center;margin-bottom:28px;border:1px solid #27272A">
      <div style="font-size:72px;font-weight:700;color:#F97316;line-height:1;margin-bottom:6px">${grade}</div>
      <p style="color:#A1A1AA;font-size:13px;margin:0;letter-spacing:0.04em">Overall Grade · ${overallScore}/100</p>
    </div>

    <!-- Body copy -->
    <p style="color:#A1A1AA;font-size:15px;line-height:1.7;margin:0 0 20px">
      Hi there — we just finished a full audit of <strong style="color:#FFFFFF">${escHtml(domain)}</strong> covering performance, mobile experience, SEO, and security.
    </p>

    <p style="color:#A1A1AA;font-size:15px;line-height:1.7;margin:0 0 32px">
      Your personalized report includes specific findings, estimated revenue impact, and clear next steps — all tailored to your site.
    </p>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:36px">
      <a href="${auditUrl}" style="display:inline-block;background:#F97316;color:#FFFFFF;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:15px;font-weight:700;letter-spacing:0.01em">View Your Full Report →</a>
    </div>

    <!-- Soft close -->
    <p style="color:#A1A1AA;font-size:14px;line-height:1.7;margin:0 0 28px">
      Questions about your results? Reply to this email — happy to walk you through everything, no strings attached.
    </p>

    <!-- Footer -->
    <div style="border-top:1px solid #27272A;padding-top:24px;text-align:center">
      <p style="color:#8A8A94;font-size:12px;margin:0;line-height:1.6">
        Little Fight NYC — Helping small businesses punch above their weight.<br>
        <a href="https://littlefightnyc.com" style="color:#F97316;text-decoration:none">littlefightnyc.com</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  const mimeBuilder = createTransport({
    streamTransport: true,
    buffer: true,
  });
  const compiled = await mimeBuilder.sendMail({
    from: { name: "Little Fight NYC", address: GMAIL_FROM },
    replyTo: GMAIL_FROM,
    to: safeEmail,
    subject: safeSubject,
    html,
  });

  const tokenResponse = await fetchGoogleWithRetry(
    "Gmail OAuth token exchange",
    () =>
      fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
        signal: AbortSignal.timeout(15_000),
      }),
    (status) => status === 429 || status >= 500,
  );

  const tokenBody = (await tokenResponse.json()) as {
    access_token?: unknown;
  };
  if (typeof tokenBody.access_token !== "string" || !tokenBody.access_token) {
    throw new Error("Gmail OAuth token exchange returned no access token");
  }

  const message = (compiled as { message?: unknown }).message;
  if (!message) throw new Error("Gmail MIME builder returned no message");
  const raw = Buffer.from(message as Uint8Array).toString("base64url");

  await fetchGoogleWithRetry(
    "Gmail send",
    () =>
      fetch(
        `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(GMAIL_FROM)}/messages/send`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${tokenBody.access_token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ raw }),
          signal: AbortSignal.timeout(15_000),
        },
      ),
    isRetryableGoogleHttpFailure,
  );

  return { status: "sent" };
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════════════════════════
// Main pipeline
// ═══════════════════════════════════════════════════════════════

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    console.warn("[audit] Rejected non-POST background invocation");
    return;
  }

  let body: { url: string; email: string; slug: string; domain: string };

  try {
    body = await req.json();
  } catch {
    console.error("[audit] Background function received invalid body");
    return;
  }

  const { url, email, slug, domain } = body;
  if (
    typeof url !== "string" ||
    typeof email !== "string" ||
    typeof domain !== "string" ||
    typeof slug !== "string" ||
    !/^[a-z0-9-]+$/.test(slug)
  ) {
    console.warn("[audit] Rejected malformed background invocation");
    return;
  }

  const receivedToken = req.headers.get("x-audit-job-token") || "";
  const jobStore = getStore({ name: "audit-jobs", consistency: "strong" });
  const job = (await jobStore.get(slug, { type: "json" })) as {
    tokenHash?: string;
    expiresAt?: string;
  } | null;
  const receivedHash = receivedToken ? await sha256Hex(receivedToken) : "";
  const expired = !job?.expiresAt || new Date(job.expiresAt) <= new Date();

  if (
    expired ||
    !job?.tokenHash ||
    !secretsMatch(job.tokenHash, receivedHash)
  ) {
    console.warn("[audit] Rejected unauthorized background invocation");
    return;
  }

  // Consume before starting expensive work so the token cannot be replayed.
  await jobStore.delete(slug);
  console.log(`[audit] ▶ Pipeline start: ${domain} → ${slug}`);

  try {
    // ── Step 1: PageSpeed Insights ────────────────────────────
    await setStatus(slug, "running", "analyzing");
    console.log(`[audit] Calling PageSpeed for ${url}`);

    let psi: PageSpeedResult;
    let pagespeedSource: AuditPageSpeedSource = "google_pagespeed";
    try {
      psi = await fetchPageSpeed(url);
    } catch (err) {
      console.error("[audit] PageSpeed failed, using fallback scores:", err);
      pagespeedSource = "fallback";
      psi = {
        performanceScore: 52,
        seoScore: 58,
        accessibilityScore: 61,
        bestPracticesScore: 67,
        pageTitle: domain,
        failingAudits: [],
      };
    }

    console.log(
      `[audit] Scores: perf=${psi.performanceScore} seo=${psi.seoScore} ` +
        `a11y=${psi.accessibilityScore} bp=${psi.bestPracticesScore}`,
    );

    // ── Step 2: Scrape site (brand colors + text for Haiku) ──
    const { brandColors, textSnippet } = await scrapeSite(url);
    console.log(
      `[audit] Site scrape: ${textSnippet.length} chars of text, primary=${brandColors.primary}`,
    );

    // ── Step 3: Haiku — personalized findings ────────────────
    await setStatus(slug, "running", "generating");
    console.log("[audit] Calling Haiku for findings");

    let haiku: HaikuResult;
    let analysisSource: AuditAnalysisSource = "netlify_ai_gateway";
    try {
      haiku = await callHaiku(
        domain,
        psi.pageTitle,
        psi,
        psi.failingAudits,
        textSnippet,
      );
    } catch (err) {
      console.error("[audit] Haiku failed, using fallback findings:", err);
      analysisSource = "fallback";
      haiku = fallbackFindings(domain, psi.pageTitle, psi);
    }

    // ── Step 4: Generate HTML ────────────────────────────────
    const overallScore = Math.round(
      (psi.performanceScore +
        psi.seoScore +
        psi.accessibilityScore +
        psi.bestPracticesScore) /
        4,
    );
    const grade = calculateGrade(overallScore);

    // Compute 30-day expiration date
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);

    const auditData: AuditData = {
      companyName: haiku.companyName,
      domain,
      city: haiku.city,
      state: haiku.state,
      niche: haiku.niche,
      email,
      slug,
      overallScore,
      grade,
      performanceScore: psi.performanceScore,
      mobileScore: psi.accessibilityScore,
      seoScore: psi.seoScore,
      securityScore: psi.bestPracticesScore,
      brandColors,
      findings: haiku.findings,
      revenueImpact: haiku.revenueImpact,
      ctaText: haiku.ctaText,
      auditDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      executiveSummary: haiku.executiveSummary || undefined,
      benchmarkPercentile: haiku.benchmarkPercentile || undefined,
      roadmap: haiku.roadmap?.length ? haiku.roadmap : undefined,
      expiresAt: expiresDate.toISOString(),
    };

    console.log(
      `[audit] Generating HTML: ${haiku.companyName} (${grade}) — variant ${slug.length % 3}`,
    );
    const html = generateAuditHTML(auditData);

    // ── Step 5: Store in blobs ───────────────────────────────
    const pageStore = getStore("audit-pages");
    await pageStore.set(slug, html);
    console.log(`[audit] HTML stored: ${slug} (${html.length} bytes)`);

    // Store expiration metadata for cleanup
    const metaStore = getStore("audit-meta");
    await metaStore.setJSON(slug, {
      domain,
      email,
      companyName: haiku.companyName,
      grade,
      overallScore,
      createdAt: new Date().toISOString(),
      expiresAt: expiresDate.toISOString(),
    });

    const siteOrigin = new URL(req.url).origin;
    const auditUrl = `${siteOrigin}/examples/audit/report/${slug}`;

    // ── Step 6: Finishing touches ─────────────────────────────
    await setStatus(slug, "running", "finishing");

    // Netlify Database is the durable, authenticated follow-up record. Keep
    // this best-effort so a database outage cannot take away the visitor's
    // generated browser report or its email delivery. Deploy previews and
    // branch deploys use isolated database branches only; they never add a
    // durable lead record.
    const persistAuditLead = shouldPersistAuditLead(context.deploy.context);
    let leadPersisted = false;
    if (persistAuditLead) {
      try {
        await upsertAuditLead({
          auditSlug: slug,
          email,
          domain,
          companyName: haiku.companyName,
          niche: haiku.niche,
          city: haiku.city,
          state: haiku.state,
          overallScore,
          grade,
          reportUrl: auditUrl,
          reportExpiresAt: expiresDate,
          analysisSource,
          pagespeedSource,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        });
        leadPersisted = true;
        console.log("[audit] Lead stored in Netlify Database");
      } catch (err) {
        console.error(
          `[audit] Netlify Database lead write failed (${safeDatabaseErrorLabel(err)})`,
        );
      }
    } else {
      console.log("[audit] Skipping durable lead storage outside production");
    }

    // Email (best-effort)
    let emailDeliveryStatus: Exclude<AuditEmailDeliveryStatus, "pending"> =
      "failed";
    try {
      const delivery = await sendAuditEmail(
        email,
        haiku.companyName,
        domain,
        grade,
        overallScore,
        auditUrl,
      );
      emailDeliveryStatus = delivery.status;
      if (delivery.status === "sent") {
        console.log("[audit] Email accepted by Gmail API");
      }
    } catch (err) {
      console.error(
        `[audit] Email failed (${safeEmailDeliveryErrorLabel(err)})`,
      );
    }

    if (leadPersisted) {
      try {
        await updateAuditLeadEmailDelivery(slug, emailDeliveryStatus);
      } catch (err) {
        console.error(
          `[audit] Email delivery status update failed (${safeDatabaseErrorLabel(err)})`,
        );
      }
    }

    // ── Done ─────────────────────────────────────────────────
    await setStatus(
      slug,
      "done",
      "complete",
      `/examples/audit/report/${slug}`,
    );
    console.log(`[audit] ✅ Pipeline complete: ${auditUrl}`);
  } catch (err) {
    console.error("[audit] ❌ Pipeline error:", err);
    await setStatus(
      slug,
      "error",
      "failed",
      null,
      "Something went wrong generating your audit. Please try again.",
    );
  }
};

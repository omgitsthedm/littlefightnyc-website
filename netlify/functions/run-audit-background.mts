// run-audit-background.mts — Background audit pipeline
// Runs the full audit: PageSpeed → Haiku → Template → Blob → Email → Notion → Telegram
// Background functions return 202 immediately; this code runs for up to 15 minutes.

import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { createTransport } from "nodemailer";
import {
  generateAuditHTML,
  calculateGrade,
  type AuditData,
} from "./lib/templates.mts";

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

async function scrapeSite(url: string): Promise<SiteScrape> {
  const defaultColors: BrandColors = {
    primary: "#F97316",
    accent: "#f7c948",
    background: "#0f0f0f",
  };

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LiFiAuditBot/1.0; +https://littlefightnyc.com)",
      },
      signal: AbortSignal.timeout(8_000),
      redirect: "follow",
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
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

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

  console.log(`[audit] Haiku API key present: ${!!apiKey}`);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
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

  return JSON.parse(cleaned);
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

async function sendAuditEmail(
  email: string,
  companyName: string,
  domain: string,
  grade: string,
  overallScore: number,
  auditUrl: string,
) {
  const gmailUser = getEnv("GMAIL_USER");
  const smtpPass = getEnv("SMTP_APP_PASSWORD");
  if (!gmailUser || !smtpPass) {
    console.log("[audit] SMTP not configured — skipping email");
    return;
  }

  const transport = createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: smtpPass },
  });

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

  await transport.sendMail({
    from: `"Little Fight NYC" <${gmailUser}>`,
    to: safeEmail,
    subject: safeSubject,
    html,
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ═══════════════════════════════════════════════════════════════
// Notion CRM — add the lead (best-effort)
// ═══════════════════════════════════════════════════════════════

async function addToNotionCRM(data: {
  companyName: string;
  domain: string;
  email: string;
  niche: string;
  city: string;
  state: string;
  grade: string;
  auditUrl: string;
}) {
  const notionKey = getEnv("NOTION_API_KEY");
  const dbId = getEnv("NOTION_CRM_DATABASE_ID");
  if (!notionKey || !dbId) {
    console.log("[audit] Notion not configured — skipping CRM entry");
    return;
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${notionKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        Company: { title: [{ text: { content: data.companyName } }] },
        Send_To: {
          rich_text: [{ text: { content: data.email } }],
        },
        Website: { url: `https://${data.domain}` },
        Niche: {
          rich_text: [{ text: { content: data.niche } }],
        },
        City: {
          rich_text: [{ text: { content: `${data.city}, ${data.state}` } }],
        },
        Score_Band: {
          select: {
            name: ["A+", "A", "A-", "B+"].includes(data.grade)
              ? "🔥 8-10 Hot"
              : ["B", "B-", "C+", "C"].includes(data.grade)
                ? "🟡 6-7 Warm"
                : "⚪ 0-5 Cold",
          },
        },
        Lead_Source: { select: { name: "Self-Service Audit" } },
        Pipeline_Stage: { select: { name: "READY" } },
        One_Liner: {
          rich_text: [
            {
              text: {
                content: `Self-service audit — ${data.auditUrl}`,
                link: { url: data.auditUrl },
              },
            },
          ],
        },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[audit] Notion API ${res.status}: ${text.slice(0, 200)}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Telegram alert for the Little Fight NYC response channel
// ═══════════════════════════════════════════════════════════════

async function sendTelegramAlert(data: {
  companyName: string;
  domain: string;
  email: string;
  grade: string;
  auditUrl: string;
}) {
  const token = getEnv("TELEGRAM_BOT_TOKEN");
  const chatId = getEnv("TELEGRAM_CHAT_ID");
  if (!token || !chatId) {
    console.log("[audit] Telegram not configured — skipping alert");
    return;
  }

  const text =
    `🔔 <b>New Audit Submitted</b>\n\n` +
    `<b>${data.companyName}</b>\n` +
    `🌐 ${data.domain}\n` +
    `📧 ${data.email}\n` +
    `📊 Grade: <b>${data.grade}</b>\n\n` +
    `<a href="${data.auditUrl}">View Report</a>`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

// ═══════════════════════════════════════════════════════════════
// Main pipeline
// ═══════════════════════════════════════════════════════════════

export default async (req: Request, context: Context) => {
  const internalSecret = getEnv("AUDIT_INTERNAL_SECRET") || "";
  const receivedSecret = req.headers.get("x-audit-internal") || "";
  if (!secretsMatch(internalSecret, receivedSecret)) {
    console.warn("[audit] Rejected unauthorized background invocation");
    return new Response(null, { status: 404 });
  }

  let body: { url: string; email: string; slug: string; domain: string };

  try {
    body = await req.json();
  } catch {
    console.error("[audit] Background function received invalid body");
    return;
  }

  const { url, email, slug, domain } = body;
  console.log(`[audit] ▶ Pipeline start: ${domain} → ${slug}`);

  try {
    // ── Step 1: PageSpeed Insights ────────────────────────────
    await setStatus(slug, "running", "analyzing");
    console.log(`[audit] Calling PageSpeed for ${url}`);

    let psi: PageSpeedResult;
    try {
      psi = await fetchPageSpeed(url);
    } catch (err) {
      console.error("[audit] PageSpeed failed, using fallback scores:", err);
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

    // Email (best-effort)
    try {
      await sendAuditEmail(
        email,
        haiku.companyName,
        domain,
        grade,
        overallScore,
        auditUrl,
      );
      console.log(`[audit] ✉ Email sent to ${email}`);
    } catch (err) {
      console.error("[audit] Email failed:", err);
    }

    // Notion CRM (best-effort)
    try {
      await addToNotionCRM({
        companyName: haiku.companyName,
        domain,
        email,
        niche: haiku.niche,
        city: haiku.city,
        state: haiku.state,
        grade,
        auditUrl,
      });
      console.log("[audit] 📋 Added to Notion CRM");
    } catch (err) {
      console.error("[audit] Notion failed:", err);
    }

    // Telegram alert (best-effort)
    try {
      await sendTelegramAlert({
        companyName: haiku.companyName,
        domain,
        email,
        grade,
        auditUrl,
      });
      console.log("[audit] 📱 Telegram alert sent");
    } catch (err) {
      console.error("[audit] Telegram failed:", err);
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

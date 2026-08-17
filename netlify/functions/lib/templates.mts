// templates.mts — Audit page HTML generator
// Produces the self-contained Living Instrument audit report.

import { BOOKING_HREF } from "../../../app/src/data/contact.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditMetricAvailability = "measured" | "unavailable";
export type AuditMetricSource = "google_pagespeed_lighthouse";

export interface AuditMetric {
  value: number | null;
  source: AuditMetricSource;
  observedAt: string;
  availability: AuditMetricAvailability;
}

export interface AuditData {
  companyName: string;
  domain: string;
  city: string;
  state: string;
  niche: string;
  email: string;
  slug: string;
  overallScore: number | null;
  grade: string | null;
  metrics: {
    performance: AuditMetric;
    seo: AuditMetric;
    accessibility: AuditMetric;
    bestPractices: AuditMetric;
  };
  brandColors: {
    primary: string;
    accent: string;
    background: string;
  };
  findings: Array<{
    severity: "critical" | "warning" | "info";
    title: string;
    description: string;
  }>;
  ctaText: string;
  auditDate: string;
  executiveSummary?: string;
  roadmap?: Array<{
    phase: string;
    title: string;
    items: string[];
  }>;
  expiresAt?: string;
}

// ---------------------------------------------------------------------------
// Grade calculator
// ---------------------------------------------------------------------------

export function calculateGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D+";
  return "D";
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Strip comments, collapse whitespace, trim around selectors/properties */
function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")        // remove block comments
    .replace(/\s+/g, " ")                     // collapse whitespace
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")     // trim around operators
    .replace(/;}/g, "}")                       // drop trailing semicolons
    .trim();
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function availableMetrics(data: AuditData): AuditMetric[] {
  return Object.values(data.metrics).filter(
    (metric) => metric.availability === "measured" && metric.value !== null,
  );
}

function measurementObservedLabel(data: AuditData): string {
  const observedAt = Object.values(data.metrics).find(
    (metric) => metric.observedAt,
  )?.observedAt;
  if (!observedAt) return "this report was generated";
  const parsed = new Date(observedAt);
  if (Number.isNaN(parsed.getTime())) return "this report was generated";
  return parsed.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function severityLabel(severity: string): string {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Info";
}

function techAuditHref(data: AuditData): string {
  const params = new URLSearchParams({
    intent: "website",
    source: "audit-lab",
    url: data.domain,
    report: data.slug,
  });
  return `https://littlefightnyc.com/tech-audit/?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Premium shared helpers
// ---------------------------------------------------------------------------

/** Animated score counter script — counts from 0 to target */
function scoreCounterScript(targetScore: number): string {
  return `
<script>
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var el=document.querySelector('[data-score-counter]');
  if(!el) return;
  var target=${targetScore},started=false;
  function count(){
    started=true;
    var start=0,duration=1400,startTime=null;
    function step(ts){
      if(!startTime)startTime=ts;
      var progress=Math.min((ts-startTime)/duration,1);
      var eased=1-Math.pow(1-progress,3);
      el.textContent=Math.round(eased*target);
      if(progress<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(entries,obs){
      if(entries[0].isIntersecting&&!started){count();obs.disconnect();}
    },{threshold:0.3}).observe(el);
  } else { el.textContent=target; }
})();
</script>`;
}

/** Expiration notice — subtle footer text */
function expiryNoticeHTML(data: AuditData): string {
  const expiry = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  return `<p class="expiry-notice">This report reflects your site as of ${esc(data.auditDate)}.${expiry ? ` The report link is scheduled to expire ${expiry}; the site may change before then.` : " The site may change after this measurement."}</p>`;
}

/** Shared meta tags block */
function metaBlock(data: AuditData): string {
  const title = `${esc(data.companyName)} Website Audit | ${esc(data.auditDate)}`;
  const desc = `Website audit for ${esc(data.companyName)} (${esc(data.domain)}) covering Lighthouse Performance, SEO, Accessibility, and Best Practices.`;
  return `<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="https://littlefightnyc.com/examples/audit/api/og?slug=${encodeURIComponent(data.slug)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="https://littlefightnyc.com/examples/audit/api/og?slug=${encodeURIComponent(data.slug)}">
    <meta name="robots" content="noindex, nofollow">
    <link rel="icon" href="/examples/audit/favicon.svg" type="image/svg+xml">`;
}

// ---------------------------------------------------------------------------
// Living Instrument: the flagship report system
// ---------------------------------------------------------------------------

function generateLivingInstrument(data: AuditData): string {
  const circumference = 2 * Math.PI * 76;
  const scoreOffset = data.overallScore === null
    ? circumference
    : circumference - (data.overallScore / 100) * circumference;
  const categories = [
    { label: "Performance", metric: data.metrics.performance },
    { label: "SEO", metric: data.metrics.seo },
    { label: "Accessibility", metric: data.metrics.accessibility },
    { label: "Best Practices", metric: data.metrics.bestPractices },
  ];

  const categoryHTML = categories.map((category) => {
    const measured = category.metric.availability === "measured" && category.metric.value !== null;
    const value = measured ? category.metric.value : null;
    return `
          <div class="fade-up">
            <dt>${category.label}</dt>
            <dd${value === null ? ' style="font-size:clamp(1.35rem,2.2vw,2rem);line-height:1"' : ""}>${value === null ? "Not measured" : value}</dd>
            ${value === null ? "" : `<span class="instrument-scores__track" aria-hidden="true"><i class="instrument-scores__fill" style="--score:${value}%"></i></span>`}
          </div>`;
  }).join("");

  const findingsHTML = data.findings.map((finding, index) => `
        <li class="instrument-finding fade-up" data-severity="${esc(String(finding.severity ?? ""))}">
          <span class="instrument-finding__index">${String(index + 1).padStart(2, "0")}</span>
          <h3>${esc(finding.title)}</h3>
          <p>${esc(finding.description)}</p>
          <span class="instrument-finding__severity">${severityLabel(finding.severity)}</span>
        </li>`).join("");

  const roadmapHTML = data.roadmap && data.roadmap.length > 0 ? `
      <section class="instrument-section" aria-labelledby="instrument-roadmap-title">
        <header class="instrument-section__head fade-up">
          <p class="instrument-section__kicker">Repair order</p>
          <h2 id="instrument-roadmap-title">What to do next.</h2>
          <p>The sequence matters. Fix the highest-leverage problems first, then build on a cleaner foundation.</p>
        </header>
        <div class="instrument-roadmap">
          ${data.roadmap.map((item) => `
          <article class="instrument-roadmap__item fade-up">
            <p class="instrument-roadmap__phase">${esc(item.phase)}</p>
            <h3>${esc(item.title)}</h3>
            <ul>${item.items.map((entry) => `<li>${esc(entry)}</li>`).join("")}</ul>
          </article>`).join("")}
        </div>
      </section>` : "";

  const summary = data.executiveSummary
    ? `<p class="instrument-summary fade-up">${esc(data.executiveSummary)}</p>`
    : "";

  const measuredCount = availableMetrics(data).length;
  const measurementNote = measuredCount === 0
    ? "Google PageSpeed Insights did not return a usable Lighthouse measurement for this run. We left every score blank rather than guessing. The observations below are limited to evidence the audit could actually retrieve."
    : `${measuredCount} of 4 Lighthouse categories were measured on a mobile run through Google PageSpeed Insights at ${measurementObservedLabel(data)}. These are point-in-time technical signals, not estimates of traffic, conversions, revenue, security, or competitive position.`;

  const scoreAria = data.overallScore === null
    ? measuredCount > 0
      ? "Overall website score not calculated because the Lighthouse measurement set is incomplete"
      : "Overall website score not measured"
    : `Overall website score ${data.overallScore} out of 100${data.grade ? `, grade ${data.grade}` : ""}`;
  const gradeLabel = data.grade
    ? `Grade ${esc(data.grade)}`
    : measuredCount > 0
      ? "Partial measurement"
      : "Measurement unavailable";
  const location = [data.city, data.state].filter(Boolean).join(", ");
  const reportContext = [location, data.niche].filter(Boolean).join(" / ");

  return `<!doctype html>
<html lang="en">
<head>
  ${metaBlock(data)}
  <link rel="preload" href="/assets/fonts/oswald-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/assets/lf-fonts.css">
  <link rel="stylesheet" href="/examples/audit/brand.css">
  <link rel="stylesheet" href="/examples/audit/report.css">
  <script src="/examples/audit/analytics.js" defer></script>
</head>
<body class="lf-audit-report lf-report-instrument">
  ${noscriptBlock()}
  ${logoBarHTML(data)}

  <header class="instrument-hero">
    <div>
      <p class="instrument-kicker fade-up">Website Audit / ${esc(data.auditDate)}</p>
      <h1 class="instrument-title fade-up">${esc(data.companyName)}</h1>
      <p class="instrument-domain fade-up">${esc(data.domain)}</p>
      ${reportContext ? `<p class="instrument-location fade-up">${esc(reportContext)}</p>` : ""}
    </div>
    <div class="instrument-score fade-up" role="img" aria-label="${esc(scoreAria)}" style="--score-offset:${scoreOffset.toFixed(2)}">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="76"></circle>
        <circle class="instrument-score__ring" cx="100" cy="100" r="76"></circle>
      </svg>
      <div class="instrument-score__center">
        <span class="instrument-score__label">Overall signal</span>
        <strong class="instrument-score__number"${data.overallScore === null ? "" : " data-score-counter"}>${data.overallScore ?? "N/A"}</strong>
        <span class="instrument-score__grade">${gradeLabel}</span>
      </div>
    </div>
  </header>

  <main class="instrument-main">
    <section class="instrument-section" aria-labelledby="instrument-signal-title">
      <header class="instrument-section__head fade-up">
        <p class="instrument-section__kicker">Signal readout</p>
        <h2 id="instrument-signal-title">The front door, measured.</h2>
        <p>Four Lighthouse category scores show what the automated mobile run could verify.</p>
      </header>
      ${summary}
      <dl class="instrument-scores" aria-label="Audit category scores">${categoryHTML}</dl>
    </section>

    <section class="instrument-section" aria-labelledby="instrument-findings-title">
      <header class="instrument-section__head fade-up">
        <p class="instrument-section__kicker">Evidence</p>
        <h2 id="instrument-findings-title">What deserves attention.</h2>
        <p>These are the specific signals returned by this run, ordered to make the next decision easier.</p>
      </header>
      <ol class="instrument-findings">${findingsHTML}</ol>
    </section>

    <section class="instrument-impact" aria-labelledby="instrument-impact-title">
      <div class="fade-up">
        <p class="instrument-impact__label">Measurement note</p>
        <h2 id="instrument-impact-title">What this run can say.</h2>
      </div>
      <p class="instrument-impact__explanation fade-up">${esc(measurementNote)}</p>
    </section>

    ${roadmapHTML}

    <section class="instrument-cta fade-up" aria-labelledby="instrument-cta-title">
      <p class="instrument-section__kicker">Next move</p>
      <h2 id="instrument-cta-title">Turn the report into a repair.</h2>
      <p>Bring the evidence to a free Tech Audit. We will sort out what to keep, connect, replace, or build first.</p>
      <div class="instrument-cta__actions">
        <a class="instrument-cta__button" href="${esc(techAuditHref(data))}">${esc(data.ctaText || "Review this report with Little Fight NYC")}</a>
        <a class="instrument-cta__booking-link" href="${esc(BOOKING_HREF)}" target="_blank" rel="noopener noreferrer" data-audit-event="booking_started">Book a free 30-minute second opinion</a>
      </div>
      <p class="instrument-cta__booking-note">Prefer a set time? Choose a Monday–Friday appointment between 9am and 5pm Eastern. We’ll meet on Google Meet, review the report with you, and name the clearest next move. No prep or commitment.</p>
      <!-- Someone reading their own report is the warmest reader we get. The
           block used to offer a form and a calendar and no way to just talk. -->
      <p class="instrument-cta__reach">
        <a href="tel:+16463600318">Call (646) 360-0318</a>
        <span aria-hidden="true">·</span>
        <a href="sms:+16463600318">Text</a>
        <span aria-hidden="true">·</span>
        <a href="mailto:hello@littlefightnyc.com">Email</a>
      </p>
      <p class="instrument-cta__reach-hours">9am&ndash;9pm Eastern: a human answers. After hours: leave a message.</p>
    </section>
  </main>

  <footer>
    ${expiryNoticeHTML(data)}
    <p class="footer-prepared">Prepared by Little Fight NYC / ${esc(data.auditDate)}</p>
    <p class="footer-brand">Designed, Hosted and Cared For by <a href="https://littlefightnyc.com" target="_blank" rel="noopener">LittleFightNYC.com</a></p>
  </footer>
  ${fullAnimationScript(data.overallScore)}
  <script>
  window.addEventListener('DOMContentLoaded', function(){
    var analytics=window.LittleFightAuditAnalytics;
    if(!analytics)return;
    analytics.track('report_opened',{funnel_stage:'engaged',placement:'audit_report'});
    document.querySelectorAll('.instrument-cta__button,.instrument-cta__booking-link,.lf-report-link--primary').forEach(function(link){
      link.addEventListener('click',function(){
        analytics.track(link.getAttribute('data-audit-event')||'human_review_requested',{funnel_stage:'contact',placement:'audit_report'});
      });
    });
  });
  </script>
</body>
</html>`;
}

/** Shared IntersectionObserver script for fade-up */
function animationScript(): string {
  return `<script>
(function(){
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els=document.querySelectorAll('.fade-up');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.style.opacity='1';e.style.transform='none';});return;}
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target);}
    });
  },{threshold:0.12});
  els.forEach(function(e){obs.observe(e);});
})();
</script>`;
}

/** noscript fallback */
function noscriptBlock(): string {
  return `<noscript><style>.fade-up{opacity:1!important;transform:none!important;}</style></noscript>`;
}

/** Logo bar for top of page */
function logoBarHTML(data: AuditData): string {
  return `<nav class="logo-bar lf-report-nav" aria-label="Audit report navigation">
      <a class="lf-report-brand" href="https://littlefightnyc.com" target="_blank" rel="noopener">Little Fight NYC <span>Website Audit</span></a>
      <div class="lf-report-actions">
        <a class="lf-report-link" href="/examples/audit/">Audit Lab</a>
        <button type="button" class="pdf-btn" onclick="window.print()" aria-label="Save this audit as a PDF">Save PDF</button>
        <a class="lf-report-link lf-report-link--primary" href="${esc(techAuditHref(data))}">Free Tech Audit</a>
      </div>
    </nav>`;
}

/** Combined animation script: fade-up + score counter */
function fullAnimationScript(targetScore: number | null): string {
  return `${animationScript()}${targetScore === null ? "" : scoreCounterScript(targetScore)}`;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function generateAuditHTML(data: AuditData): string {
  let html = generateLivingInstrument(data);

  // Inject scroll-depth + time-on-page tracker before </body>
  const engagementScript = `
<script>
(function(){
  var slug = location.pathname.replace(/^\\/examples\\/audit\\/report\\//,'').replace(/\\/$/,'');
  if (!slug) return;
  var maxScroll = 0, startTime = Date.now(), sections = new Set();
  var endpoint = '/examples/audit/api/record-engagement';

  // Track scroll depth
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        maxScroll = Math.max(maxScroll, Math.round((scrollTop / docHeight) * 100));
      }
      // Track which sections are in view
      document.querySelectorAll('section[aria-label]').forEach(function(el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          sections.add(el.getAttribute('aria-label'));
        }
      });
      ticking = false;
    });
  });

  // Beacon engagement data on page unload + every 30 seconds
  function sendBeacon() {
    var timeOnPage = Math.round((Date.now() - startTime) / 1000);
    var payload = JSON.stringify({
      slug: slug,
      scrollDepth: maxScroll,
      timeOnPage: timeOnPage,
      sectionsViewed: Array.from(sections)
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], {type: 'application/json'}));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, false);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payload);
    }
  }

  // Send on unload (catches tab close, navigation away)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') sendBeacon();
  });
  window.addEventListener('pagehide', sendBeacon);

  // Also send every 30 seconds for long sessions
  setInterval(sendBeacon, 30000);
})();
</script>`;

  html = html.replace('</body>', engagementScript + '\n</body>');

  // Post-process: minify inline CSS for ~4KB savings per page
  return html.replace(/<style>([\s\S]*?)<\/style>/g, (_match, css) => {
    return `<style>${minifyCSS(css)}</style>`;
  });
}

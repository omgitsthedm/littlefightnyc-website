// templates.mts — Audit page HTML generator
// Produces three visually distinct, self-contained HTML audit pages.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuditData {
  companyName: string;
  domain: string;
  city: string;
  state: string;
  niche: string;
  email: string;
  slug: string;
  overallScore: number;
  grade: string;
  performanceScore: number;
  mobileScore: number;
  seoScore: number;
  securityScore: number;
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
  revenueImpact: {
    low: number;
    high: number;
    explanation: string;
  };
  ctaText: string;
  auditDate: string;
  executiveSummary?: string;
  benchmarkPercentile?: number;
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

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function severityColor(severity: string, primary: string): string {
  if (severity === "critical") return "#e53e3e";
  if (severity === "warning") return "#d69e2e";
  return primary;
}

function severityLabel(severity: string): string {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Info";
}

function scoreColor(score: number, primary: string): string {
  if (score >= 80) return "#48bb78";
  if (score >= 60) return "#d69e2e";
  if (score >= 40) return "#ed8936";
  return "#e53e3e";
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

/** Executive summary section HTML */
function executiveSummaryHTML(data: AuditData, cssClass: string = ""): string {
  if (!data.executiveSummary) return "";
  return `
      <section class="exec-summary ${cssClass} fade-up" aria-label="Executive summary">
        <h2 class="exec-summary__heading">Executive Summary</h2>
        <p class="exec-summary__text">${esc(data.executiveSummary)}</p>
      </section>`;
}

/** Benchmark badge — "Better than X% of [niche] websites" */
function benchmarkBadge(data: AuditData): string {
  if (!data.benchmarkPercentile) return "";
  return `<span class="benchmark-badge">Better than ${data.benchmarkPercentile}% of ${esc(data.niche.toLowerCase())} websites</span>`;
}

/** Priority roadmap section HTML */
function roadmapHTML(data: AuditData, cssClass: string = ""): string {
  if (!data.roadmap || data.roadmap.length === 0) return "";
  const phases = data.roadmap.map((r, i) => `
        <div class="roadmap-phase fade-up">
          <div class="roadmap-phase__marker">${i + 1}</div>
          <div class="roadmap-phase__content">
            <p class="roadmap-phase__label">${esc(r.phase)}</p>
            <h3 class="roadmap-phase__title">${esc(r.title)}</h3>
            <ul class="roadmap-phase__items">
              ${r.items.map(item => `<li>${esc(item)}</li>`).join("\n              ")}
            </ul>
          </div>
        </div>`).join("\n");
  return `
      <section class="roadmap-section ${cssClass}" aria-label="Recommended fix roadmap">
        <h2 class="roadmap-section__heading fade-up">Priority Roadmap</h2>
        <div class="roadmap-timeline">
          ${phases}
        </div>
      </section>`;
}

/** Expiration notice — subtle footer text */
function expiryNoticeHTML(data: AuditData): string {
  const expiry = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  return `<p class="expiry-notice">This report reflects your site as of ${esc(data.auditDate)}.${expiry ? ` Results valid through ${expiry}.` : " Results may change as your site evolves."}</p>`;
}

/** Shared CSS for premium sections (injected into each variant) */
function premiumSharedCSS(p: string): string {
  return `
      /* ---------- EXECUTIVE SUMMARY ---------- */
      .exec-summary {
        max-width: 700px;
        margin: 0 auto;
        padding: 3rem 1.5rem;
        text-align: center;
      }
      .exec-summary__heading {
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: ${p};
        margin-bottom: 1.25rem;
      }
      .exec-summary__text {
        font-size: 1.1rem;
        line-height: 1.8;
        color: var(--text-muted);
      }

      /* ---------- BENCHMARK BADGE ---------- */
      .benchmark-badge {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #48bb78;
        background: rgba(72,187,120,0.1);
        border: 1px solid rgba(72,187,120,0.2);
        padding: 0.3em 0.8em;
        border-radius: 100px;
        margin-top: 1rem;
      }

      /* ---------- PRIORITY ROADMAP ---------- */
      .roadmap-section {
        max-width: 700px;
        margin: 0 auto;
        padding: 4rem 1.5rem;
      }
      .roadmap-section__heading {
        font-family: var(--heading, var(--serif, Georgia));
        font-size: clamp(1.5rem, 3vw, 2rem);
        text-align: center;
        margin-bottom: 3rem;
      }
      .roadmap-timeline {
        position: relative;
        padding-left: 2.5rem;
      }
      .roadmap-timeline::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, ${p}, transparent);
      }
      .roadmap-phase {
        position: relative;
        margin-bottom: 2rem;
      }
      .roadmap-phase__marker {
        position: absolute;
        left: -2.5rem;
        top: 0;
        width: 32px;
        height: 32px;
        background: ${p};
        color: #000;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.8rem;
      }
      .roadmap-phase__label {
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: ${p};
        margin-bottom: 0.3rem;
      }
      .roadmap-phase__title {
        font-size: 1.1rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .roadmap-phase__items {
        list-style: none;
        padding: 0;
      }
      .roadmap-phase__items li {
        color: var(--text-muted);
        font-size: 0.88rem;
        line-height: 1.6;
        padding-left: 1.2em;
        position: relative;
      }
      .roadmap-phase__items li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: ${p};
      }

      /* ---------- EXPIRY NOTICE ---------- */
      .expiry-notice {
        font-size: 0.72rem;
        color: var(--text-subtle, #777);
        text-align: center;
        padding: 0.75rem 1.5rem;
      }

      /* ---------- PDF DOWNLOAD ---------- */
      .pdf-btn {
        display: inline-block;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--text-muted, #888);
        border: 1px solid var(--text-muted, #888);
        padding: 0.6em 1.6em;
        border-radius: 4px;
        text-decoration: none;
        cursor: pointer;
        background: none;
        transition: color 0.2s, border-color 0.2s;
        margin-right: 1rem;
      }
      .pdf-btn:hover {
        color: var(--text, #e0e0e0);
        border-color: var(--text, #e0e0e0);
      }

      /* ---------- LOGO HEADER ---------- */
      .logo-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 1.5rem 0;
        max-width: 960px;
        margin: 0 auto;
      }

      /* ---------- PRINT STYLES ---------- */
      @media print {
        body { background: #fff !important; color: #222 !important; }
        .fade-up { opacity: 1 !important; transform: none !important; }
        .pdf-btn, .cta-btn, .cta-section, .lux-cta { display: none !important; }
        .logo-bar { padding-top: 0.5rem; }
        * { color-adjust: exact; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .noir-hero { min-height: auto; padding: 2rem 0; }
        .lux-hero { padding: 2rem 0; }
        footer { page-break-inside: avoid; }
      }`;
}

/** Shared meta tags block */
function metaBlock(data: AuditData): string {
  const title = `${esc(data.companyName)} Website Audit — ${esc(data.auditDate)}`;
  const desc = `Comprehensive website audit for ${esc(data.companyName)} (${esc(data.domain)}) covering performance, mobile, SEO, and security.`;
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

/** Footer text with expiry notice */
function footerHTML(data: AuditData): string {
  return `<footer>
      ${expiryNoticeHTML(data)}
      <p class="footer-prepared">Prepared by Little Fight NYC &mdash; ${esc(data.auditDate)}</p>
      <p class="footer-brand">Designed, Hosted and Cared For by <a href="https://littlefightnyc.com" target="_blank" rel="noopener">LittleFightNYC.com</a></p>
    </footer>`;
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
function fullAnimationScript(targetScore: number): string {
  return `${animationScript()}${scoreCounterScript(targetScore)}`;
}

// ---------------------------------------------------------------------------
// Variant 0 — Noir Editorial
// ---------------------------------------------------------------------------

function generateNoirEditorial(data: AuditData): string {
  const p = data.brandColors.primary;
  const categories = [
    { label: "Performance", score: data.performanceScore },
    { label: "Mobile", score: data.mobileScore },
    { label: "SEO", score: data.seoScore },
    { label: "Security", score: data.securityScore },
  ];

  const gaugeRadius = 80;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (data.overallScore / 100) * gaugeCircumference;

  const findingsHTML = data.findings
    .map(
      (f, i) => `
      <article class="finding fade-up ${i % 2 === 0 ? "finding--left" : "finding--right"}">
        <span class="finding__severity" style="background:${severityColor(f.severity, p)}">${severityLabel(f.severity)}</span>
        <h3 class="finding__title">${esc(f.title)}</h3>
        <p class="finding__desc">${esc(f.description)}</p>
      </article>`
    )
    .join("\n");

  const categoryCardsHTML = categories
    .map(
      (c) => `
        <div class="cat-card fade-up">
          <span class="cat-card__label">${c.label}</span>
          <div class="cat-card__bar-track">
            <div class="cat-card__bar-fill" style="width:${c.score}%;background:${scoreColor(c.score, p)}"></div>
          </div>
          <span class="cat-card__score">${c.score}</span>
        </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${metaBlock(data)}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Source+Sans+3:wght@300;400;600;700&display=swap"></noscript>
    <style>
      :root {
        --brand-primary: ${p};
        --brand-accent: ${data.brandColors.accent};
        --brand-bg: ${data.brandColors.background};
        --base: #0f0f0f;
        --surface: #181818;
        --surface-alt: #1f1f1f;
        --text: #e8e8e8;
        --text-muted: #999;
        --serif: 'Playfair Display', Georgia, serif;
        --sans: 'Source Sans 3', system-ui, sans-serif;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { font-size: 16px; scroll-behavior: smooth; }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .fade-up { opacity: 1 !important; transform: none !important; transition: none !important; }
      }

      body {
        font-family: var(--sans);
        background: var(--base);
        color: var(--text);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      .fade-up {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
      }
      .fade-up.visible {
        opacity: 1;
        transform: translateY(0);
      }

      /* ---------- HEADER ---------- */
      .noir-hero {
        min-height: 92vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 3rem 1.5rem;
        position: relative;
        overflow: hidden;
      }
      .noir-hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--brand-primary) 8%, transparent) 0%, transparent 70%);
        pointer-events: none;
      }
      .noir-hero__kicker {
        font-family: var(--sans);
        font-weight: 600;
        font-size: 0.75rem;
        letter-spacing: 0.25em;
        text-transform: uppercase;
        color: var(--brand-primary);
        margin-bottom: 1.25rem;
      }
      .noir-hero__title {
        font-family: var(--serif);
        font-weight: 900;
        font-size: clamp(2.4rem, 6vw, 5rem);
        line-height: 1.08;
        max-width: 14ch;
        margin-bottom: 1rem;
      }
      .noir-hero__subtitle {
        font-size: 1.15rem;
        color: var(--text-muted);
        max-width: 38ch;
        margin-bottom: 2.5rem;
      }

      /* ---------- GAUGE ---------- */
      .gauge-wrap {
        position: relative;
        width: 200px;
        height: 200px;
        margin: 0 auto 1rem;
      }
      .gauge-svg {
        transform: rotate(-90deg);
        width: 100%;
        height: 100%;
      }
      .gauge-bg {
        fill: none;
        stroke: var(--surface-alt);
        stroke-width: 10;
      }
      .gauge-fill {
        fill: none;
        stroke: var(--brand-primary);
        stroke-width: 10;
        stroke-linecap: round;
        stroke-dasharray: ${gaugeCircumference.toFixed(2)};
        stroke-dashoffset: ${gaugeOffset.toFixed(2)};
        transition: stroke-dashoffset 1.2s ease-out;
      }
      .gauge-score {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .gauge-score__number {
        font-family: var(--serif);
        font-size: 3.2rem;
        font-weight: 900;
        line-height: 1;
      }
      .gauge-score__grade {
        font-size: 1rem;
        font-weight: 600;
        color: var(--brand-primary);
        margin-top: 0.2rem;
      }

      /* ---------- CATEGORIES ---------- */
      .categories {
        max-width: 900px;
        margin: 0 auto;
        padding: 4rem 1.5rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }
      @media (min-width: 768px) {
        .categories { grid-template-columns: 1fr 1fr; gap: 1.5rem; }
      }
      .cat-card {
        background: var(--surface);
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
      }
      .cat-card__label {
        font-weight: 600;
        font-size: 0.95rem;
        flex: 1 0 auto;
      }
      .cat-card__score {
        font-family: var(--serif);
        font-weight: 700;
        font-size: 1.5rem;
        min-width: 2.5ch;
        text-align: right;
      }
      .cat-card__bar-track {
        width: 100%;
        height: 6px;
        background: var(--surface-alt);
        border-radius: 3px;
        overflow: hidden;
      }
      .cat-card__bar-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.8s ease-out;
      }

      /* ---------- FINDINGS ---------- */
      .findings-section {
        max-width: 760px;
        margin: 0 auto;
        padding: 4rem 1.5rem;
      }
      .findings-section__title {
        font-family: var(--serif);
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        font-weight: 700;
        text-align: center;
        margin-bottom: 3rem;
      }
      .finding {
        background: var(--surface);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 1.5rem;
      }
      @media (min-width: 768px) {
        .finding--left { margin-right: 18%; }
        .finding--right { margin-left: 18%; }
      }
      .finding__severity {
        display: inline-block;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #fff;
        padding: 0.25em 0.75em;
        border-radius: 100px;
        margin-bottom: 0.75rem;
      }
      .finding__title {
        font-family: var(--serif);
        font-size: 1.2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }
      .finding__desc {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.65;
      }

      /* ---------- REVENUE ---------- */
      .revenue {
        max-width: 700px;
        margin: 0 auto;
        padding: 4rem 1.5rem;
      }
      .revenue__box {
        background: linear-gradient(135deg, var(--surface) 0%, color-mix(in srgb, var(--brand-primary) 6%, var(--surface)) 100%);
        border: 1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent);
        border-radius: 16px;
        padding: 2.5rem;
        text-align: center;
      }
      .revenue__label {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--brand-primary);
        margin-bottom: 0.75rem;
      }
      .revenue__range {
        font-family: var(--serif);
        font-size: clamp(1.8rem, 4vw, 2.8rem);
        font-weight: 900;
        margin-bottom: 1rem;
      }
      .revenue__explanation {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.65;
        max-width: 50ch;
        margin: 0 auto;
      }

      /* ---------- CTA ---------- */
      .cta-section {
        text-align: center;
        padding: 4rem 1.5rem 5rem;
      }
      .cta-btn {
        display: inline-block;
        font-family: var(--sans);
        font-weight: 700;
        font-size: 1rem;
        color: var(--base);
        background: var(--brand-primary);
        padding: 1rem 2.5rem;
        border-radius: 100px;
        text-decoration: none;
        letter-spacing: 0.02em;
        transition: opacity 0.25s, transform 0.25s;
      }
      .cta-btn:hover { opacity: 0.88; transform: translateY(-2px); }
      @media (prefers-reduced-motion: reduce) {
        .cta-btn { transition: none; }
      }

      /* ---------- FOOTER ---------- */
      footer {
        text-align: center;
        padding: 3rem 1.5rem 2.5rem;
        border-top: 1px solid var(--surface-alt);
      }
      .footer-prepared {
        font-size: 0.85rem;
        color: var(--text-muted);
        margin-bottom: 0.5rem;
      }
      .footer-brand {
        font-size: 0.8rem;
        color: #e87a2e;
      }
      .footer-brand a {
        color: #e87a2e;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      ${premiumSharedCSS(p)}
    </style>
    <link rel="stylesheet" href="/examples/audit/brand.css">
</head>
<body class="lf-audit-report">
    ${noscriptBlock()}
    ${logoBarHTML(data)}

    <header class="noir-hero">
      <p class="noir-hero__kicker fade-up">Website Audit &mdash; ${esc(data.auditDate)}</p>
      <h1 class="noir-hero__title fade-up">${esc(data.companyName)}</h1>
      <p class="noir-hero__subtitle fade-up">${esc(data.domain)} &middot; ${esc(data.city)}, ${esc(data.state)}</p>

      <div class="gauge-wrap fade-up" role="img" aria-label="Overall score ${data.overallScore} out of 100, grade ${esc(data.grade)}">
        <svg class="gauge-svg" viewBox="0 0 200 200">
          <circle class="gauge-bg" cx="100" cy="100" r="${gaugeRadius}" />
          <circle class="gauge-fill" cx="100" cy="100" r="${gaugeRadius}" />
        </svg>
        <div class="gauge-score">
          <span class="gauge-score__number" data-score-counter>0</span>
          <span class="gauge-score__grade">${esc(data.grade)}</span>
        </div>
      </div>
      ${benchmarkBadge(data)}
    </header>

    <main>
      ${executiveSummaryHTML(data)}

      <section class="categories" aria-label="Category scores">
        ${categoryCardsHTML}
      </section>

      <section class="findings-section" aria-label="Findings">
        <h2 class="findings-section__title fade-up">Key Findings</h2>
        ${findingsHTML}
      </section>

      <section class="revenue" aria-label="Revenue impact">
        <div class="revenue__box fade-up">
          <p class="revenue__label">Estimated Revenue Impact</p>
          <p class="revenue__range">${formatCurrency(data.revenueImpact.low)} &ndash; ${formatCurrency(data.revenueImpact.high)}<span style="font-size:0.5em;font-weight:400;color:var(--text-muted)"> / yr</span></p>
          <p class="revenue__explanation">${esc(data.revenueImpact.explanation)}</p>
        </div>
      </section>

      ${roadmapHTML(data)}

      <section class="cta-section" aria-label="Next steps">
        <a class="cta-btn fade-up" href="${esc(techAuditHref(data))}">Review this report with Little Fight NYC, free</a>
      </section>
    </main>

    ${footerHTML(data)}
    ${fullAnimationScript(data.overallScore)}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Variant 1 — Clinical Precision
// ---------------------------------------------------------------------------

function generateClinicalPrecision(data: AuditData): string {
  const p = data.brandColors.primary;
  const categories = [
    { label: "Performance", score: data.performanceScore },
    { label: "Mobile", score: data.mobileScore },
    { label: "SEO", score: data.seoScore },
    { label: "Security", score: data.securityScore },
  ];

  const categoryBarsHTML = categories
    .map(
      (c) => `
        <div class="bar-row fade-up">
          <span class="bar-row__label">${c.label}</span>
          <div class="bar-row__track">
            <div class="bar-row__fill" style="width:${c.score}%;background:${scoreColor(c.score, p)}"></div>
          </div>
          <span class="bar-row__val">${c.score}<span class="bar-row__of">/100</span></span>
        </div>`
    )
    .join("\n");

  const findingsHTML = data.findings
    .map(
      (f, i) => `
      <li class="clin-finding fade-up">
        <span class="clin-finding__num">${String(i + 1).padStart(2, "0")}</span>
        <div class="clin-finding__body">
          <div class="clin-finding__head">
            <h3 class="clin-finding__title">${esc(f.title)}</h3>
            <span class="clin-finding__badge" style="background:${severityColor(f.severity, p)}">${severityLabel(f.severity)}</span>
          </div>
          <p class="clin-finding__desc">${esc(f.description)}</p>
        </div>
      </li>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${metaBlock(data)}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Serif+Display&display=swap"></noscript>
    <style>
      :root {
        --brand-primary: ${p};
        --brand-accent: ${data.brandColors.accent};
        --brand-bg: ${data.brandColors.background};
        --base: #0a0e1a;
        --surface: #111628;
        --surface-alt: #181e34;
        --border: #232a44;
        --text: #dfe3ef;
        --text-muted: #8e94ad;
        --heading: 'DM Serif Display', Georgia, serif;
        --body: 'DM Sans', system-ui, sans-serif;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { font-size: 16px; scroll-behavior: smooth; }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .fade-up { opacity: 1 !important; transform: none !important; transition: none !important; }
      }

      body {
        font-family: var(--body);
        background: var(--base);
        color: var(--text);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }

      .fade-up {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1);
      }
      .fade-up.visible { opacity: 1; transform: translateY(0); }

      .container { max-width: 960px; margin: 0 auto; padding: 0 1.5rem; }

      /* ---------- HEADER ---------- */
      .clin-header {
        padding: 4rem 0 3rem;
        border-bottom: 1px solid var(--border);
      }
      .clin-header__row {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      @media (min-width: 768px) {
        .clin-header__row {
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-end;
        }
      }
      .clin-header__meta {
        font-size: 0.78rem;
        font-weight: 500;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .clin-header__company {
        font-family: var(--heading);
        font-size: clamp(2rem, 5vw, 3.2rem);
        line-height: 1.15;
      }
      .clin-header__domain {
        color: var(--brand-primary);
        font-size: 0.95rem;
        font-weight: 500;
        margin-top: 0.25rem;
      }

      /* ---------- BIG SCORE ---------- */
      .big-score-section {
        padding: 4.5rem 0 3rem;
        text-align: center;
      }
      .big-score__number {
        font-family: var(--heading);
        font-size: clamp(6rem, 14vw, 10rem);
        line-height: 1;
        color: var(--brand-primary);
      }
      .big-score__label {
        font-size: 0.8rem;
        font-weight: 500;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-top: 0.5rem;
      }
      .big-score__grade {
        display: inline-block;
        font-family: var(--heading);
        font-size: 1.3rem;
        background: var(--surface);
        border: 1px solid var(--border);
        padding: 0.35em 0.85em;
        border-radius: 8px;
        margin-top: 1rem;
        color: var(--brand-primary);
      }

      /* ---------- CATEGORY BARS ---------- */
      .bars-section {
        padding: 2rem 0 4rem;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 110px 1fr 80px;
        align-items: center;
        gap: 1rem;
        padding: 1rem 0;
        border-bottom: 1px solid var(--border);
      }
      @media (max-width: 480px) {
        .bar-row { grid-template-columns: 80px 1fr 56px; gap: 0.5rem; }
      }
      .bar-row__label {
        font-weight: 500;
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      .bar-row__track {
        height: 8px;
        background: var(--surface-alt);
        border-radius: 4px;
        overflow: hidden;
      }
      .bar-row__fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.9s cubic-bezier(0.22,1,0.36,1);
      }
      .bar-row__val {
        font-family: var(--heading);
        font-size: 1.35rem;
        text-align: right;
      }
      .bar-row__of {
        font-family: var(--body);
        font-size: 0.7rem;
        color: var(--text-muted);
        margin-left: 1px;
      }

      /* ---------- FINDINGS ---------- */
      .findings-section {
        padding: 4rem 0;
      }
      .findings-section__heading {
        font-family: var(--heading);
        font-size: clamp(1.6rem, 3.5vw, 2.2rem);
        margin-bottom: 2.5rem;
      }
      .findings-list {
        list-style: none;
      }
      .clin-finding {
        display: flex;
        gap: 1.25rem;
        padding: 1.5rem 0;
        border-bottom: 1px solid var(--border);
      }
      .clin-finding__num {
        font-family: var(--heading);
        font-size: 1.5rem;
        color: var(--border);
        flex-shrink: 0;
        min-width: 2.2ch;
      }
      .clin-finding__body { flex: 1; }
      .clin-finding__head {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin-bottom: 0.4rem;
      }
      .clin-finding__title {
        font-size: 1.05rem;
        font-weight: 700;
      }
      .clin-finding__badge {
        font-size: 0.65rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #fff;
        padding: 0.2em 0.65em;
        border-radius: 100px;
      }
      .clin-finding__desc {
        color: var(--text-muted);
        font-size: 0.92rem;
        line-height: 1.7;
      }

      /* ---------- REVENUE ---------- */
      .revenue-section {
        padding: 4rem 0;
        text-align: center;
      }
      .revenue-statement {
        font-family: var(--heading);
        font-size: clamp(1.5rem, 3.5vw, 2.4rem);
        line-height: 1.3;
        max-width: 26ch;
        margin: 0 auto 1.25rem;
      }
      .revenue-statement__range {
        color: var(--brand-primary);
      }
      .revenue-explanation {
        color: var(--text-muted);
        font-size: 0.92rem;
        max-width: 48ch;
        margin: 0 auto;
        line-height: 1.7;
      }

      /* ---------- CTA ---------- */
      .cta-section {
        text-align: center;
        padding: 3rem 0 5rem;
      }
      .cta-btn {
        display: inline-block;
        font-family: var(--body);
        font-weight: 700;
        font-size: 0.95rem;
        color: #fff;
        background: var(--brand-primary);
        padding: 0.95rem 2.8rem;
        border: none;
        border-radius: 6px;
        text-decoration: none;
        letter-spacing: 0.03em;
        transition: opacity 0.2s, transform 0.2s;
      }
      .cta-btn:hover { opacity: 0.9; transform: translateY(-2px); }
      @media (prefers-reduced-motion: reduce) { .cta-btn { transition: none; } }

      /* ---------- FOOTER ---------- */
      footer {
        text-align: center;
        padding: 2.5rem 1.5rem 2rem;
        border-top: 1px solid var(--border);
      }
      .footer-prepared {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-bottom: 0.4rem;
      }
      .footer-brand {
        font-size: 0.78rem;
        color: #e87a2e;
      }
      .footer-brand a {
        color: #e87a2e;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      ${premiumSharedCSS(p)}
    </style>
    <link rel="stylesheet" href="/examples/audit/brand.css">
</head>
<body class="lf-audit-report">
    ${noscriptBlock()}
    ${logoBarHTML(data)}

    <header class="clin-header container">
      <div class="clin-header__row fade-up">
        <div>
          <p class="clin-header__meta">${esc(data.niche)} &middot; ${esc(data.city)}, ${esc(data.state)}</p>
          <h1 class="clin-header__company">${esc(data.companyName)}</h1>
          <p class="clin-header__domain">${esc(data.domain)}</p>
        </div>
        <div>
          <p class="clin-header__meta">${esc(data.auditDate)}</p>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="big-score-section fade-up" aria-label="Overall score">
        <p class="big-score__number" role="img" aria-label="Score ${data.overallScore}" data-score-counter>0</p>
        <p class="big-score__label">Overall Score</p>
        <p class="big-score__grade">Grade: ${esc(data.grade)}</p>
        ${benchmarkBadge(data)}
      </section>

      ${executiveSummaryHTML(data)}

      <section class="bars-section" aria-label="Category scores">
        ${categoryBarsHTML}
      </section>

      <section class="findings-section" aria-label="Findings">
        <h2 class="findings-section__heading fade-up">Detailed Findings</h2>
        <ol class="findings-list">
          ${findingsHTML}
        </ol>
      </section>

      <section class="revenue-section fade-up" aria-label="Revenue impact">
        <p class="revenue-statement">Your site may be leaving <span class="revenue-statement__range">${formatCurrency(data.revenueImpact.low)}&ndash;${formatCurrency(data.revenueImpact.high)}</span> on the table each year.</p>
        <p class="revenue-explanation">${esc(data.revenueImpact.explanation)}</p>
      </section>

      ${roadmapHTML(data)}

      <section class="cta-section" aria-label="Next steps">
        <a class="cta-btn fade-up" href="${esc(techAuditHref(data))}">Review this report with Little Fight NYC, free</a>
      </section>
    </main>

    ${footerHTML(data)}
    ${fullAnimationScript(data.overallScore)}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Variant 2 — Minimal Luxe
// ---------------------------------------------------------------------------

function generateMinimalLuxe(data: AuditData): string {
  const p = data.brandColors.primary;
  const categories = [
    { label: "Performance", score: data.performanceScore },
    { label: "Mobile", score: data.mobileScore },
    { label: "SEO", score: data.seoScore },
    { label: "Security", score: data.securityScore },
  ];

  const categoryHTML = categories
    .map(
      (c) => `
        <div class="lux-cat fade-up">
          <span class="lux-cat__score">${c.score}</span>
          <span class="lux-cat__label">${c.label}</span>
        </div>`
    )
    .join("\n");

  const findingsHTML = data.findings
    .map(
      (f) => `
      <article class="lux-card fade-up">
        <div class="lux-card__accent" style="background:${severityColor(f.severity, p)}"></div>
        <div class="lux-card__inner">
          <p class="lux-card__sev">${severityLabel(f.severity)}</p>
          <h3 class="lux-card__title">${esc(f.title)}</h3>
          <p class="lux-card__desc">${esc(f.description)}</p>
        </div>
      </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    ${metaBlock(data)}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,800;9..144,900&family=Manrope:wght@300;400;500;600;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,800;9..144,900&family=Manrope:wght@300;400;500;600;700&display=swap"></noscript>
    <style>
      :root {
        --brand-primary: ${p};
        --brand-accent: ${data.brandColors.accent};
        --brand-bg: ${data.brandColors.background};
        --base: #0b0b0b;
        --surface: #141414;
        --surface-alt: #1a1a1a;
        --line: #252525;
        --text: #e2e2e2;
        --text-muted: #888;
        --heading: 'Fraunces', Georgia, serif;
        --body: 'Manrope', system-ui, sans-serif;
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      html { font-size: 16px; scroll-behavior: smooth; }

      @media (prefers-reduced-motion: reduce) {
        html { scroll-behavior: auto; }
        .fade-up { opacity: 1 !important; transform: none !important; transition: none !important; }
      }

      body {
        font-family: var(--body);
        background: var(--base);
        color: var(--text);
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
      }

      .fade-up {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
      }
      .fade-up.visible { opacity: 1; transform: translateY(0); }

      .lux-wrap {
        max-width: 720px;
        margin: 0 auto;
        padding: 0 2rem;
      }
      @media (min-width: 1200px) {
        .lux-wrap { max-width: 780px; }
      }

      /* ---------- THIN ACCENT LINE ---------- */
      .accent-line {
        width: 48px;
        height: 1px;
        background: var(--brand-primary);
        margin: 0 auto;
      }

      /* ---------- HEADER ---------- */
      .lux-hero {
        padding: 8rem 0 4rem;
        text-align: center;
      }
      @media (max-width: 480px) {
        .lux-hero { padding: 5rem 0 3rem; }
      }
      .lux-hero__date {
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.28em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 2rem;
      }
      .lux-hero__title {
        font-family: var(--heading);
        font-weight: 300;
        font-size: clamp(2.2rem, 5.5vw, 3.8rem);
        line-height: 1.15;
        margin-bottom: 0.75rem;
      }
      .lux-hero__domain {
        font-size: 0.88rem;
        font-weight: 400;
        color: var(--text-muted);
        letter-spacing: 0.04em;
      }

      /* ---------- GIANT SCORE ---------- */
      .lux-score-section {
        padding: 5rem 0 2rem;
        text-align: center;
      }
      .lux-score__number {
        font-family: var(--heading);
        font-weight: 900;
        font-size: clamp(8rem, 20vw, 14rem);
        line-height: 0.85;
        color: var(--text);
        letter-spacing: -0.04em;
      }
      .lux-score__grade-line {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }
      .lux-score__line {
        width: 40px;
        height: 1px;
        background: var(--brand-primary);
      }
      .lux-score__grade {
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: var(--brand-primary);
      }

      /* ---------- CATEGORY MINIMAL ---------- */
      .lux-cats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0;
        border-top: 1px solid var(--line);
        margin: 4rem 0;
      }
      @media (min-width: 768px) {
        .lux-cats { grid-template-columns: repeat(4, 1fr); }
      }
      .lux-cat {
        padding: 2.5rem 1rem;
        text-align: center;
        border-bottom: 1px solid var(--line);
        border-right: 1px solid var(--line);
      }
      .lux-cat:nth-child(2n) { border-right: none; }
      @media (min-width: 768px) {
        .lux-cat { border-bottom: none; border-right: 1px solid var(--line); }
        .lux-cat:last-child { border-right: none; }
      }
      .lux-cat__score {
        display: block;
        font-family: var(--heading);
        font-weight: 800;
        font-size: 2.2rem;
        line-height: 1;
        margin-bottom: 0.4rem;
      }
      .lux-cat__label {
        font-size: 0.72rem;
        font-weight: 500;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-muted);
      }

      /* ---------- FINDINGS ---------- */
      .lux-findings {
        padding: 3rem 0 4rem;
      }
      .lux-findings__heading {
        font-family: var(--heading);
        font-weight: 300;
        font-size: clamp(1.5rem, 3vw, 2rem);
        text-align: center;
        margin-bottom: 3.5rem;
      }
      .lux-card {
        display: flex;
        gap: 0;
        background: var(--surface);
        border-radius: 10px;
        overflow: hidden;
        margin-bottom: 1.25rem;
      }
      .lux-card__accent {
        width: 4px;
        flex-shrink: 0;
      }
      .lux-card__inner {
        padding: 2rem 2rem 2rem 1.75rem;
        flex: 1;
      }
      .lux-card__sev {
        font-size: 0.65rem;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 0.6rem;
      }
      .lux-card__title {
        font-family: var(--heading);
        font-weight: 500;
        font-size: 1.1rem;
        margin-bottom: 0.5rem;
      }
      .lux-card__desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        line-height: 1.7;
      }

      /* ---------- REVENUE ---------- */
      .lux-revenue {
        padding: 4rem 0;
        text-align: center;
      }
      .lux-revenue__line {
        font-size: 0.95rem;
        font-weight: 400;
        color: var(--text-muted);
        line-height: 1.8;
        max-width: 42ch;
        margin: 0 auto;
      }
      .lux-revenue__range {
        display: block;
        font-family: var(--heading);
        font-weight: 800;
        font-size: clamp(1.6rem, 3.5vw, 2.2rem);
        color: var(--text);
        margin: 1rem 0;
      }

      /* ---------- CTA ---------- */
      .lux-cta {
        text-align: center;
        padding: 2rem 0 6rem;
      }
      .lux-cta__btn {
        display: inline-block;
        font-family: var(--body);
        font-weight: 600;
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--brand-primary);
        border: 1px solid var(--brand-primary);
        padding: 1rem 2.8rem;
        border-radius: 0;
        text-decoration: none;
        transition: background 0.3s, color 0.3s;
      }
      .lux-cta__btn:hover {
        background: var(--brand-primary);
        color: var(--base);
      }
      @media (prefers-reduced-motion: reduce) {
        .lux-cta__btn { transition: none; }
      }

      /* ---------- FOOTER ---------- */
      footer {
        text-align: center;
        padding: 3rem 2rem 2.5rem;
        border-top: 1px solid var(--line);
      }
      .footer-prepared {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-bottom: 0.4rem;
      }
      .footer-brand {
        font-size: 0.75rem;
        color: #e87a2e;
      }
      .footer-brand a {
        color: #e87a2e;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      ${premiumSharedCSS(p)}
    </style>
    <link rel="stylesheet" href="/examples/audit/brand.css">
</head>
<body class="lf-audit-report">
    ${noscriptBlock()}
    ${logoBarHTML(data)}

    <header class="lux-hero lux-wrap">
      <p class="lux-hero__date fade-up">${esc(data.auditDate)}</p>
      <div class="accent-line fade-up" style="margin-bottom:2.5rem"></div>
      <h1 class="lux-hero__title fade-up">${esc(data.companyName)}</h1>
      <p class="lux-hero__domain fade-up">${esc(data.domain)} &mdash; ${esc(data.city)}, ${esc(data.state)}</p>
    </header>

    <main>
      <section class="lux-score-section lux-wrap fade-up" aria-label="Overall score">
        <p class="lux-score__number" role="img" aria-label="Score ${data.overallScore} out of 100" data-score-counter>0</p>
        <div class="lux-score__grade-line">
          <span class="lux-score__line"></span>
          <span class="lux-score__grade">${esc(data.grade)}</span>
          <span class="lux-score__line"></span>
        </div>
        ${benchmarkBadge(data)}
      </section>

      ${executiveSummaryHTML(data, "lux-wrap")}

      <section class="lux-cats lux-wrap" aria-label="Category scores">
        ${categoryHTML}
      </section>

      <section class="lux-findings lux-wrap" aria-label="Findings">
        <h2 class="lux-findings__heading fade-up">What We Found</h2>
        ${findingsHTML}
      </section>

      <section class="lux-revenue lux-wrap fade-up" aria-label="Revenue impact">
        <div class="accent-line" style="margin-bottom:2rem"></div>
        <p class="lux-revenue__line">
          Estimated annual revenue at risk
          <span class="lux-revenue__range">${formatCurrency(data.revenueImpact.low)} &ndash; ${formatCurrency(data.revenueImpact.high)}</span>
          ${esc(data.revenueImpact.explanation)}
        </p>
        <div class="accent-line" style="margin-top:2rem"></div>
      </section>

      ${roadmapHTML(data, "lux-wrap")}

      <section class="lux-cta lux-wrap" aria-label="Next steps">
        <a class="lux-cta__btn fade-up" href="${esc(techAuditHref(data))}">Review this report with Little Fight NYC, free</a>
      </section>
    </main>

    ${footerHTML(data)}
    ${fullAnimationScript(data.overallScore)}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function generateAuditHTML(data: AuditData): string {
  const variant = data.slug.length % 3;

  let html: string;
  switch (variant) {
    case 0:
      html = generateNoirEditorial(data);
      break;
    case 1:
      html = generateClinicalPrecision(data);
      break;
    case 2:
      html = generateMinimalLuxe(data);
      break;
    default:
      html = generateNoirEditorial(data);
  }

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

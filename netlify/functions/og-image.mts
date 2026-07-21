// og-image.mts — Dynamic SVG OG image for audit report social sharing
// Returns a branded 1200×630 SVG with company name, score, and grade.
// Used by og:image meta tags on audit report pages.
//
// Endpoint: /examples/audit/api/og?slug=company-domain-abc123

import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

interface AuditMeta {
  domain: string;
  companyName: string;
  grade: string;
  overallScore: number;
  createdAt: string;
  expiresAt: string;
}

function escSvg(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#eab308";
  if (grade.startsWith("C")) return "#f97316";
  return "#ef4444";
}

function generateOGSvg(meta: AuditMeta): string {
  const gc = gradeColor(meta.grade);
  const company = escSvg(
    meta.companyName.length > 32
      ? meta.companyName.slice(0, 30) + "…"
      : meta.companyName,
  );
  const domain = escSvg(meta.domain);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050507"/>
      <stop offset="100%" stop-color="#12141A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FB8B3C"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Top accent bar -->
  <rect width="1200" height="4" fill="url(#accent)"/>

  <!-- Score circle -->
  <circle cx="900" cy="280" r="120" fill="none" stroke="#27272A" stroke-width="8"/>
  <circle cx="900" cy="280" r="120" fill="none" stroke="${gc}" stroke-width="8"
    stroke-dasharray="${Math.round((meta.overallScore / 100) * 754)} 754"
    stroke-linecap="round" transform="rotate(-90 900 280)"/>
  <text x="900" y="265" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
    font-size="72" font-weight="200" fill="${gc}">${meta.overallScore}</text>
  <text x="900" y="305" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
    font-size="18" font-weight="500" fill="#A1A1AA" letter-spacing="0.1em">/100</text>

  <!-- Grade badge -->
  <rect x="855" y="420" width="90" height="40" rx="8" fill="${gc}" opacity="0.15"/>
  <text x="900" y="447" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif"
    font-size="22" font-weight="700" fill="${gc}">Grade ${escSvg(meta.grade)}</text>

  <!-- Company name -->
  <text x="80" y="240" font-family="Inter,system-ui,-apple-system,sans-serif" font-size="48" font-weight="700"
    fill="#FFFFFF">${company}</text>

  <!-- Domain -->
  <text x="80" y="290" font-family="system-ui,-apple-system,sans-serif" font-size="22"
    font-weight="500" fill="#F97316">${domain}</text>

  <!-- Label -->
  <text x="80" y="180" font-family="system-ui,-apple-system,sans-serif" font-size="14"
    font-weight="700" fill="#A1A1AA" letter-spacing="0.18em">WEBSITE AUDIT REPORT</text>

  <!-- Divider -->
  <line x1="80" y1="330" x2="660" y2="330" stroke="#27272A" stroke-width="1"/>

  <!-- Subtitle -->
  <text x="80" y="380" font-family="system-ui,-apple-system,sans-serif" font-size="18"
    fill="#A1A1AA">Performance · Mobile · SEO · Security</text>

  <!-- LiFi branding -->
  <text x="80" y="560" font-family="system-ui,-apple-system,sans-serif" font-size="14"
    font-weight="800" fill="#F97316" letter-spacing="0.06em">LITTLE FIGHT <tspan font-weight="500">NYC</tspan></text>
  <text x="80" y="585" font-family="system-ui,-apple-system,sans-serif" font-size="12"
    fill="#8A8A94">littlefightnyc.com</text>
</svg>`;
}

export default async (req: Request, _context: Context) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Missing or invalid slug", { status: 400 });
  }

  const metaStore = getStore("audit-meta");
  const meta = (await metaStore.get(slug, { type: "json" })) as AuditMeta | null;

  if (!meta) {
    return new Response("Audit not found", { status: 404 });
  }

  const svg = generateOGSvg(meta);

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

export const config: Config = {
  path: "/examples/audit/api/og",
};

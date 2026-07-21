import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Privacy-safe hash: we never store raw IPs, just a daily-rotating fingerprint
function hashVisitor(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10); // rotate daily
  const raw = `${ip}:${ua}:${day}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

interface ViewEntry {
  ts: string;
  visitor: string;
}

interface ViewData {
  views: ViewEntry[];
  total: number;
  unique_today: number;
  first_view: string | null;
  last_view: string | null;
}

/** Bring reports generated before the local-font migration onto the current shell. */
function normalizeStoredReport(html: string): string {
  let normalized = html
    .replace(/<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*href=["']https:\/\/fonts\.gstatic\.com[^"']*["'][^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*href=["']https:\/\/fonts\.googleapis\.com["'][^>]*>\s*/gi, "")
    .replace(/<link\b[^>]*href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>\s*/gi, "")
    .replace(/<noscript>\s*<\/noscript>\s*/gi, "");

  if (!normalized.includes('/assets/lf-fonts.css')) {
    normalized = normalized.replace(
      "</head>",
      '  <link rel="stylesheet" href="/assets/lf-fonts.css">\n</head>'
    );
  }

  return normalized;
}

/** Branded expired-report page */
function expiredPage(name: string): string {
  const safe = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Report Expired — ${safe}</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="icon" href="/examples/audit/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/examples/audit/brand.css">
  <style>
    body{min-height:100vh;display:grid;place-items:center;text-align:center;padding:2rem}
    .wrap{max-width:620px}
    h1{font-size:clamp(2.75rem,7vw,5.5rem);font-weight:750;margin-bottom:1.25rem;line-height:.96;letter-spacing:-.055em}
    .accent{color:#F97316}
    p{color:#A1A1AA;line-height:1.7;margin:0 auto 1.5rem;font-size:1.05rem;max-width:54ch}
    .request-link{display:inline-flex;align-items:center;justify-content:center;background:#F97316;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:700;font-size:.95rem;transition:background .18s ease,transform .18s ease}
    .request-link:hover{background:#FB8B3C;transform:translateY(-2px)}
  </style>
</head>
<body class="lf-audit-shell-page">
  <div class="wrap">
    <h1>This report has <span class="accent">expired</span></h1>
    <p>The website audit for <strong>${safe}</strong> is no longer available. Reports are valid for 30 days from the date they're generated.</p>
    <p>Want a fresh audit? We'd be happy to run one for you.</p>
    <a class="request-link" href="/examples/audit/?fresh=1">Run a Fresh Audit</a>
  </div>
</body>
</html>`;
}

// Security headers that netlify.toml can't inject into function responses
const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; img-src 'self' data: https://littlefightnyc.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:",
};

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const slug = url.pathname
    .replace(/^\/examples\/audit\/report\//, "")
    .replace(/\/$/, "");

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  // Check expiration before serving
  const metaStore = getStore("audit-meta");
  const meta = (await metaStore.get(slug, { type: "json" })) as {
    expiresAt?: string;
    companyName?: string;
    domain?: string;
  } | null;

  if (meta?.expiresAt && new Date(meta.expiresAt) < new Date()) {
    return new Response(expiredPage(meta.companyName || meta.domain || slug), {
      status: 410,
      headers: {
        ...SECURITY_HEADERS,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }

  const store = getStore("audit-pages");
  const html = await store.get(slug);

  if (!html) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/examples/audit/404.html" },
    });
  }

  // ── Track the view ────────────────────────────────────────
  // Runs before response — adds ~20ms but guarantees the write completes.
  // Netlify kills the execution context on Response, so fire-and-forget won't work.
  const viewStore = getStore({ name: "audit-views", consistency: "eventual" });
  const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
  const ua = req.headers.get("user-agent") || "unknown";
  const visitor = hashVisitor(ip, ua);

  try {
    const existing = (await viewStore.get(slug, { type: "json" })) as ViewData | null;
    const data: ViewData = existing || {
      views: [],
      total: 0,
      unique_today: 0,
      first_view: null,
      last_view: null,
    };

    const now = new Date().toISOString();
    data.views.push({ ts: now, visitor });
    // Cap stored views at 500 to prevent unbounded growth
    if (data.views.length > 500) {
      data.views = data.views.slice(-500);
    }
    data.total = (data.total || 0) + 1;
    data.first_view = data.first_view || now;
    data.last_view = now;

    // Count unique visitors today
    const today = now.slice(0, 10);
    const todayVisitors = new Set(
      data.views
        .filter((v) => v.ts.startsWith(today))
        .map((v) => v.visitor)
    );
    data.unique_today = todayVisitors.size;

    await viewStore.setJSON(slug, data);
  } catch (err) {
    console.error("[views] tracking error:", err);
  }

  return new Response(normalizeStoredReport(html), {
    status: 200,
    headers: {
      ...SECURITY_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};

export const config: Config = {
  path: "/examples/audit/report/*",
};

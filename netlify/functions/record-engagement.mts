// record-engagement.mts — Receives scroll depth + time-on-page data from audit reports
// POST /examples/audit/api/record-engagement { slug, scrollDepth, timeOnPage, sectionsViewed }

import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-store.ts";
import { isConfidentWebsiteAuditEngagement } from "./_shared/dakota/website-audit-bridge.ts";
import {
  attemptDakotaWebsiteAuditOutboxEntry,
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
  enqueueDakotaWebsiteAuditOutboxPatch,
} from "./_shared/dakota/website-audit-outbox.ts";

interface EngagementEntry {
  ts: string;
  visitor: string;
  scrollDepth: number;     // 0-100 percentage
  timeOnPage: number;      // seconds
  sectionsViewed: string[]; // IDs of sections scrolled into view
}

interface EngagementData {
  entries: EngagementEntry[];
  maxScrollDepth: number;   // highest scroll depth seen across all visits
  maxTimeOnPage: number;    // longest visit in seconds
  avgScrollDepth: number;   // running average
  avgTimeOnPage: number;    // running average
  totalEngagements: number;
}

interface AuditViewData {
  total?: number;
  first_view?: string | null;
  last_view?: string | null;
}

function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function websiteAuditOutboxDependencies() {
  return {
    getOutboxStore: () => getStore({
      name: DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
      consistency: "strong" as const,
    }),
    getRevenueBridgeStore: () => getStore({
      name: DAKOTA_REVENUE_BRIDGE_STORE,
      consistency: "strong" as const,
    }),
  };
}

async function persistAndQueueEngagementRevenueBridgeWrite(
  context: Context,
  input: {
    slug: string;
    domain: string;
    observedAt: string;
    firstViewAt: string;
    lastViewAt: string;
    totalViews: number;
    maxScrollDepth: number;
    maxTimeOnPageSeconds: number;
  },
): Promise<void> {
  if (context.deploy.context !== "production") return;
  try {
    const queued = await enqueueDakotaWebsiteAuditOutboxPatch({
      patch_type: "engagement",
      report_id: input.slug,
      domain: input.domain,
      observed_at: input.observedAt,
      first_view_at: input.firstViewAt,
      last_view_at: input.lastViewAt,
      total_views: input.totalViews,
      max_scroll_depth: Math.round(input.maxScrollDepth),
      max_time_on_page_seconds: Math.round(input.maxTimeOnPageSeconds),
    }, websiteAuditOutboxDependencies());
    if (queued.outcome !== "enqueued") return;
    context.waitUntil(
      attemptDakotaWebsiteAuditOutboxEntry(
        queued.entry.entry_id,
        websiteAuditOutboxDependencies(),
        true,
      )
        .catch(() => {
          console.error("[engagement] Dakota engagement outbox delivery failed");
        }),
    );
  } catch {
    console.error("[engagement] Dakota engagement outbox persistence failed");
  }
}

// Privacy-safe hash (same as serve-audit.mts)
function hashVisitor(ip: string, ua: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${ip}:${ua}:${day}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

// The only caller is the report page itself (templates.mts posts to this from
// the same origin), so "*" bought nothing and let any page on the internet
// write to this store. Echo the site origin when it asks, and no
// Access-Control-Allow-Origin at all otherwise — a browser will then refuse to
// hand the response to a foreign page.
const ALLOWED_ORIGINS = new Set([
  "https://littlefightnyc.com",
  "https://www.littlefightnyc.com",
]);

function corsHeaders(req?: Request): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  const origin = req?.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: corsHeaders(req),
    });
  }

  // Engagement is evidence, not an authenticated conversion fact. Accept it
  // only from the production report pages so a foreign browser cannot inflate
  // depth or duration with a cross-origin beacon. Non-browser clients can
  // still forge Origin, so Dakota continues to label this as observed
  // engagement rather than verified human intent.
  const origin = req.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: corsHeaders(req),
    });
  }

  try {
    const body = await req.json();
    const { slug, scrollDepth, timeOnPage, sectionsViewed } = body;

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: "Invalid slug" }), {
        status: 400,
        headers: corsHeaders(req),
      });
    }

    // The shape check said the key looked plausible, not that it named a real
    // report. Any string matching [a-z0-9-]+ created a new permanently-retained
    // blob, so the store could be filled with keys that correspond to nothing.
    // A report has to exist before its reading can be recorded.
    const metaStore = getStore("audit-meta");
    const meta = (await metaStore.get(slug, { type: "json" })) as {
      domain?: string;
    } | null;
    if (!meta) {
      return new Response(JSON.stringify({ error: "Unknown report" }), {
        status: 404,
        headers: corsHeaders(req),
      });
    }

    const sd = Math.min(Math.max(Number(scrollDepth) || 0, 0), 100);
    const top = Math.min(Math.max(Number(timeOnPage) || 0, 0), 3600); // cap at 1 hour
    const sections = Array.isArray(sectionsViewed)
      ? sectionsViewed.filter((s: unknown) => typeof s === "string").slice(0, 20)
      : [];

    const ip = context.ip || req.headers.get("x-forwarded-for") || "unknown";
    const ua = req.headers.get("user-agent") || "unknown";
    const visitor = hashVisitor(ip, ua);

    const store = getStore({ name: "audit-engagement", consistency: "eventual" });
    const existing = (await store.get(slug, { type: "json" })) as EngagementData | null;

    const data: EngagementData = existing || {
      entries: [],
      maxScrollDepth: 0,
      maxTimeOnPage: 0,
      avgScrollDepth: 0,
      avgTimeOnPage: 0,
      totalEngagements: 0,
    };

    // Dedupe: update existing entry for same visitor (same day) rather than creating new
    const existingIdx = data.entries.findIndex((e) => e.visitor === visitor);
    const entry: EngagementEntry = {
      ts: new Date().toISOString(),
      visitor,
      scrollDepth: sd,
      timeOnPage: top,
      sectionsViewed: sections,
    };

    if (existingIdx >= 0) {
      // Keep the higher values (visitor may send multiple beacons as they scroll)
      const prev = data.entries[existingIdx];
      entry.scrollDepth = Math.max(prev.scrollDepth, sd);
      entry.timeOnPage = Math.max(prev.timeOnPage, top);
      entry.sectionsViewed = [...new Set([...prev.sectionsViewed, ...sections])];
      data.entries[existingIdx] = entry;
    } else {
      data.entries.push(entry);
      data.totalEngagements++;
    }

    // Cap at 200 entries
    if (data.entries.length > 200) {
      data.entries = data.entries.slice(-200);
    }

    // Recalculate aggregates
    data.maxScrollDepth = Math.max(...data.entries.map((e) => e.scrollDepth));
    data.maxTimeOnPage = Math.max(...data.entries.map((e) => e.timeOnPage));
    data.avgScrollDepth = Math.round(
      data.entries.reduce((sum, e) => sum + e.scrollDepth, 0) / data.entries.length
    );
    data.avgTimeOnPage = Math.round(
      data.entries.reduce((sum, e) => sum + e.timeOnPage, 0) / data.entries.length
    );

    await store.setJSON(slug, data);

    // URL fetches are unverified operational observations. Only a same-origin
    // beacon that sustains both time and scroll thresholds may cross into
    // Dakota as observed engagement; it still does not verify identity or intent.
    const confidenceThresholdMet = isConfidentWebsiteAuditEngagement({
      maxScrollDepth: entry.scrollDepth,
      maxTimeOnPageSeconds: entry.timeOnPage,
    });
    if (
      context.deploy.context === "production" &&
      typeof meta.domain === "string" &&
      confidenceThresholdMet
    ) {
      try {
        const viewStore = getStore({ name: "audit-views", consistency: "eventual" });
        const views = (await viewStore.get(slug, { type: "json" })) as AuditViewData | null;
        if (
          views &&
          Number.isInteger(views.total) &&
          (views.total ?? 0) > 0 &&
          isTimestamp(views.first_view) &&
          isTimestamp(views.last_view)
        ) {
          const observedAt = new Date(Math.max(
            Date.parse(entry.ts),
            Date.parse(views.last_view),
          )).toISOString();
          await persistAndQueueEngagementRevenueBridgeWrite(context, {
            slug,
            domain: meta.domain,
            observedAt,
            firstViewAt: views.first_view,
            lastViewAt: views.last_view,
            totalViews: views.total as number,
            maxScrollDepth: data.maxScrollDepth,
            maxTimeOnPageSeconds: data.maxTimeOnPage,
          });
        }
      } catch {
        console.error("[engagement] Audit view reconciliation read failed");
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(req),
    });
  } catch (err) {
    console.error("[engagement] error:", err);
    return new Response(JSON.stringify({ error: "Failed to record" }), {
      status: 500,
      headers: corsHeaders(req),
    });
  }
};

export const config: Config = {
  path: "/examples/audit/api/record-engagement",
};

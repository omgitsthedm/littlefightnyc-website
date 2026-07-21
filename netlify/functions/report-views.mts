// report-views.mts — Returns view analytics for an audit report
// GET /examples/audit/api/report-views?id=SLUG  → single report views
// GET /examples/audit/api/report-views?all=true  → all reports with views (for Dakota polling)

import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

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

// ── CORS helper ───────────────────────────────────────────────
function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://littlefightnyc.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default async (req: Request, context: Context) => {
  // ── CORS preflight ───────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("id");
  const all = url.searchParams.get("all") === "true";
  const since = url.searchParams.get("since"); // ISO timestamp filter

  const viewStore = getStore({ name: "audit-views", consistency: "eventual" });

  // ── Single report query ──────────────────────────────────
  if (slug) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: "Invalid slug" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const data = (await viewStore.get(slug, { type: "json" })) as ViewData | null;
    if (!data) {
      return new Response(
        JSON.stringify({ slug, total: 0, unique_today: 0, views: [] }),
        { status: 200, headers: corsHeaders() }
      );
    }

    return new Response(
      JSON.stringify({
        slug,
        total: data.total,
        unique_today: data.unique_today,
        first_view: data.first_view,
        last_view: data.last_view,
        // Only return last 20 views to keep response small
        recent_views: data.views.slice(-20).map((v) => ({
          ts: v.ts,
          visitor: v.visitor,
        })),
      }),
      { status: 200, headers: corsHeaders() }
    );
  }

  // ── Bulk query: all reports with views ────────────────────
  if (all) {
    try {
      const { blobs } = await viewStore.list();
      const engagementStore = getStore({ name: "audit-engagement", consistency: "eventual" });
      const results: Array<{
        slug: string;
        total: number;
        unique_today: number;
        first_view: string | null;
        last_view: string | null;
        engagement?: {
          maxScrollDepth: number;
          maxTimeOnPage: number;
          avgScrollDepth: number;
          avgTimeOnPage: number;
        };
      }> = [];

      for (const blob of blobs) {
        const data = (await viewStore.get(blob.key, {
          type: "json",
        })) as ViewData | null;
        if (!data || data.total === 0) continue;

        // If "since" filter provided, skip reports with no views after that time
        if (since && data.last_view && data.last_view < since) continue;

        // Fetch engagement data if available
        let engagement: { maxScrollDepth: number; maxTimeOnPage: number; avgScrollDepth: number; avgTimeOnPage: number } | undefined;
        try {
          const eng = await engagementStore.get(blob.key, { type: "json" }) as {
            maxScrollDepth?: number; maxTimeOnPage?: number; avgScrollDepth?: number; avgTimeOnPage?: number;
          } | null;
          if (eng && eng.maxScrollDepth !== undefined) {
            engagement = {
              maxScrollDepth: eng.maxScrollDepth || 0,
              maxTimeOnPage: eng.maxTimeOnPage || 0,
              avgScrollDepth: eng.avgScrollDepth || 0,
              avgTimeOnPage: eng.avgTimeOnPage || 0,
            };
          }
        } catch { /* engagement data optional */ }

        results.push({
          slug: blob.key,
          total: data.total,
          unique_today: data.unique_today,
          first_view: data.first_view,
          last_view: data.last_view,
          engagement,
        });
      }

      // Sort by last_view descending (most recently viewed first)
      results.sort((a, b) =>
        (b.last_view || "").localeCompare(a.last_view || "")
      );

      return new Response(JSON.stringify({ reports: results }), {
        status: 200,
        headers: corsHeaders(),
      });
    } catch (err) {
      console.error("[report-views] bulk query error:", err);
      return new Response(
        JSON.stringify({ error: "Failed to fetch view data" }),
        { status: 500, headers: corsHeaders() }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Provide ?id=SLUG or ?all=true" }),
    { status: 400, headers: corsHeaders() }
  );
};

export const config: Config = {
  path: "/examples/audit/api/report-views",
};

// record-engagement.mts — Receives scroll depth + time-on-page data from audit reports
// POST /examples/audit/api/record-engagement { slug, scrollDepth, timeOnPage, sectionsViewed }

import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

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

function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: corsHeaders(),
    });
  }

  try {
    const body = await req.json();
    const { slug, scrollDepth, timeOnPage, sectionsViewed } = body;

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return new Response(JSON.stringify({ error: "Invalid slug" }), {
        status: 400,
        headers: corsHeaders(),
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

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error("[engagement] error:", err);
    return new Response(JSON.stringify({ error: "Failed to record" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
};

export const config: Config = {
  path: "/examples/audit/api/record-engagement",
};

// run-audit.mts — Synchronous trigger endpoint
// Receives form POST, validates input, generates audit ID, kicks off
// the background pipeline, and returns the ID to the client for polling.

import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// ── Rate limit config ─────────────────────────────────────────
const RATE_LIMIT_WINDOW_HOURS = 24;
const RATE_LIMIT_MAX_PUBLIC = 3; // public form: 3 audits per IP per 24h
const RATE_LIMIT_MAX_API = 500; // API key: 500 audits per 24h (Dakota)
const JOB_TOKEN_TTL_MS = 30 * 60 * 1000;

function createJobToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
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

// ── CORS helper ───────────────────────────────────────────────
function corsHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://littlefightnyc.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// ── Private IP / SSRF blocklist ───────────────────────────────
const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google.com",
]);
function isPrivateIP(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  // Block 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, [::1]
  if (/^(127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.|0\.|::1|\[::1\])/.test(hostname)) return true;
  return false;
}

export default async (req: Request, context: Context) => {
  // ── CORS preflight ───────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders(),
    });
  }

  // ── Parse body (cap at 10KB to prevent payload abuse) ─────
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > 10_240) {
    return new Response(JSON.stringify({ error: "Payload too large" }), {
      status: 413,
      headers: corsHeaders(),
    });
  }

  let body: { url?: string; email?: string; honeypot?: string; api_key?: string };
  try {
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).byteLength > 10_240) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: corsHeaders(),
      });
    }

    const parsed = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Body must be an object");
    }
    body = parsed;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  const { url, email, honeypot, api_key } = body;

  // ── API key authentication (Dakota / programmatic access) ──
  const SERVER_API_KEY = process.env.AUDIT_API_KEY || "";
  const isAuthenticated = !!(api_key && SERVER_API_KEY && api_key === SERVER_API_KEY);

  // ── Honeypot — bots fill hidden fields ──────────────────────
  if (honeypot) {
    const fakeId = "audit-" + crypto.randomUUID().slice(0, 8);
    return new Response(JSON.stringify({ id: fakeId }), {
      status: 200,
      headers: corsHeaders(),
    });
  }

  // ── Validate URL (max 2048 chars) ─────────────────────────
  if (!url || typeof url !== "string" || url.length > 2048) {
    return new Response(JSON.stringify({ error: "URL is required (max 2048 chars)" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  // ── Validate email (max 254 chars, RFC 5321) ──────────────
  if (
    !email ||
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email)
  ) {
    return new Response(JSON.stringify({ error: "Valid email is required" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  // ── Extract & validate domain ─────────────────────────────
  let domain: string;
  let fullUrl: string;
  try {
    const cleaned = url.trim().replace(/\/+$/, "").slice(0, 2048);
    fullUrl = cleaned.startsWith("http") ? cleaned : `https://${cleaned}`;
    const parsed = new URL(fullUrl);
    domain = parsed.hostname.replace(/^www\./, "");

    // Block private/internal IPs (SSRF protection)
    if (isPrivateIP(parsed.hostname)) {
      return new Response(JSON.stringify({ error: "URL must be a public website" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Block non-http(s) protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return new Response(JSON.stringify({ error: "Only HTTP/HTTPS URLs are supported" }), {
        status: 400,
        headers: corsHeaders(),
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: "Invalid URL format" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  // ── Rate limiting (IP-based for public, key-based for API) ─
  const rateLimitStore = getStore({ name: "rate-limits", consistency: "strong" });
  const ip = context.ip || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateLimitKey = isAuthenticated ? `apikey:${SERVER_API_KEY.slice(-8)}` : `ip:${ip}`;
  const maxRequests = isAuthenticated ? RATE_LIMIT_MAX_API : RATE_LIMIT_MAX_PUBLIC;

  try {
    const existing = (await rateLimitStore.get(rateLimitKey, { type: "json" })) as {
      count: number;
      window_start: string;
    } | null;

    const now = new Date();
    const windowStart = existing?.window_start ? new Date(existing.window_start) : now;
    const hoursSinceWindow = (now.getTime() - windowStart.getTime()) / (1000 * 60 * 60);

    if (existing && hoursSinceWindow < RATE_LIMIT_WINDOW_HOURS) {
      if (existing.count >= maxRequests) {
        const retryAfterHours = Math.ceil(RATE_LIMIT_WINDOW_HOURS - hoursSinceWindow);
        return new Response(
          JSON.stringify({
            error: `Rate limit exceeded. Try again in ${retryAfterHours} hour${retryAfterHours > 1 ? "s" : ""}.`,
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders(),
              "Retry-After": String(retryAfterHours * 3600),
            },
          }
        );
      }
      // Increment counter
      await rateLimitStore.setJSON(rateLimitKey, {
        count: existing.count + 1,
        window_start: existing.window_start,
      });
    } else {
      // New window
      await rateLimitStore.setJSON(rateLimitKey, {
        count: 1,
        window_start: now.toISOString(),
      });
    }
  } catch (err) {
    // Rate limit failure shouldn't block the audit — log and continue
    console.error("[rate-limit] error:", err);
  }

  // ── Generate unique slug (crypto-safe random) ─────────────
  const suffix = crypto.randomUUID().slice(0, 8);
  const slug =
    domain
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    suffix;

  // ── Write initial status to blobs ───────────────────────────
  const statusStore = getStore({ name: "audit-status", consistency: "strong" });
  await statusStore.setJSON(slug, {
    status: "running",
    step: "queued",
    url: null,
    message: null,
  });

  // One-time authorization for the public background-function endpoint. The
  // raw token only travels in this request; its SHA-256 hash is stored in a
  // private Blob store and removed as soon as the background job accepts it.
  const jobToken = createJobToken();
  const jobStore = getStore({ name: "audit-jobs", consistency: "strong" });
  await jobStore.setJSON(slug, {
    tokenHash: await sha256Hex(jobToken),
    expiresAt: new Date(Date.now() + JOB_TOKEN_TTL_MS).toISOString(),
  });

  // ── Trigger background function ─────────────────────────────
  const origin = new URL(req.url).origin;
  const bgUrl = `${origin}/.netlify/functions/run-audit-background`;

  try {
    const bgRes = await fetch(bgUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Audit-Job-Token": jobToken,
      },
      body: JSON.stringify({ url: fullUrl, email, slug, domain }),
    });

    if (!bgRes.ok && bgRes.status !== 202) {
      console.error(`Background trigger failed: ${bgRes.status}`);
      await jobStore.delete(slug);
      await statusStore.setJSON(slug, {
        status: "error",
        step: "queued",
        url: null,
        message: "Failed to start the audit. Please try again.",
      });
    }
  } catch (err) {
    console.error("Background trigger error:", err);
    await jobStore.delete(slug);
    await statusStore.setJSON(slug, {
      status: "error",
      step: "queued",
      url: null,
      message: "Failed to start the audit. Please try again.",
    });
  }

  // ── Return audit ID for client polling ──────────────────────
  return new Response(JSON.stringify({ id: slug }), {
    status: 200,
    headers: corsHeaders(),
  });
};

export const config: Config = {
  path: "/examples/audit/api/run-audit",
};

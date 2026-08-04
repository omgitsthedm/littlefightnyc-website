import type { Context } from "@netlify/functions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));
vi.mock("./website-audit-outbox.ts", () => ({
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE: "dakota-website-audit-outbox",
  enqueueDakotaWebsiteAuditOutboxPatch: vi.fn(async () => ({
    outcome: "enqueued",
    entry: { entry_id: "11111111111111111111111111111111" },
  })),
  attemptDakotaWebsiteAuditOutboxEntry: vi.fn(async () => ({
    outcome: "delivered",
  })),
}));

import { getStore } from "@netlify/blobs";

import recordEngagement from "../../record-engagement.mts";
import serveAudit from "../../serve-audit.mts";
import {
  attemptDakotaWebsiteAuditOutboxEntry,
  enqueueDakotaWebsiteAuditOutboxPatch,
} from "./website-audit-outbox.ts";

class MemoryBlobStore {
  entries = new Map<string, unknown>();

  async get(key: string): Promise<unknown | null> {
    return this.entries.has(key) ? structuredClone(this.entries.get(key)) : null;
  }

  async setJSON(key: string, value: unknown): Promise<void> {
    this.entries.set(key, structuredClone(value));
  }
}

const stores = new Map<string, MemoryBlobStore>();
const waitUntilWork: Promise<unknown>[] = [];

function storeFor(name: string): MemoryBlobStore {
  const existing = stores.get(name);
  if (existing) return existing;
  const store = new MemoryBlobStore();
  stores.set(name, store);
  return store;
}

function context(deployContext = "production"): Context {
  return {
    ip: "203.0.113.10",
    deploy: { context: deployContext },
    waitUntil(promise: Promise<unknown>) {
      waitUntilWork.push(promise);
    },
  } as unknown as Context;
}

beforeEach(() => {
  stores.clear();
  waitUntilWork.length = 0;
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-03T12:00:00.000Z"));
  vi.mocked(getStore).mockImplementation((options: unknown) => {
    const name = typeof options === "string"
      ? options
      : (options as { name: string }).name;
    return storeFor(name) as never;
  });
  vi.mocked(enqueueDakotaWebsiteAuditOutboxPatch).mockClear();
  vi.mocked(attemptDakotaWebsiteAuditOutboxEntry).mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(getStore).mockReset();
});

describe("Website Audit Revenue Bridge entrypoints", () => {
  it("records a raw report GET as an unverified URL fetch without projecting engagement", async () => {
    const slug = "example-com-12345678";
    storeFor("audit-meta").entries.set(slug, {
      domain: "example.com",
      expiresAt: "2026-09-02T12:00:00.000Z",
    });
    storeFor("audit-pages").entries.set(slug, "<!doctype html><html><head></head><body>Report</body></html>");

    const response = await serveAudit(new Request(
      `https://littlefightnyc.com/examples/audit/report/${slug}`,
      { headers: { "user-agent": "test-browser" } },
    ), context());
    await Promise.all(waitUntilWork);

    expect(response.status).toBe(200);
    expect(enqueueDakotaWebsiteAuditOutboxPatch).not.toHaveBeenCalled();
    expect(attemptDakotaWebsiteAuditOutboxEntry).not.toHaveBeenCalled();
    const observation = storeFor("audit-views").entries.get(slug);
    expect(observation).toMatchObject({
      classification: "unverified_url_fetch",
      total: 1,
      views: [{ signal: "unverified_url_fetch" }],
    });
    expect(JSON.stringify(observation)).not.toContain("203.0.113.10");
  });

  it("does not project report views outside production", async () => {
    const slug = "example-com-12345678";
    storeFor("audit-meta").entries.set(slug, {
      domain: "example.com",
      expiresAt: "2026-09-02T12:00:00.000Z",
    });
    storeFor("audit-pages").entries.set(slug, "<!doctype html><html><head></head><body>Report</body></html>");

    await serveAudit(new Request(
      `https://preview.example.net/examples/audit/report/${slug}`,
    ), context("deploy-preview"));
    await Promise.all(waitUntilWork);

    expect(enqueueDakotaWebsiteAuditOutboxPatch).not.toHaveBeenCalled();
    expect(attemptDakotaWebsiteAuditOutboxEntry).not.toHaveBeenCalled();
  });

  it("uses persisted audit-view facts when projecting production engagement", async () => {
    const slug = "example-com-12345678";
    storeFor("audit-meta").entries.set(slug, { domain: "example.com" });
    storeFor("audit-views").entries.set(slug, {
      total: 3,
      first_view: "2026-08-03T11:00:00.000Z",
      last_view: "2026-08-03T11:55:00.000Z",
    });

    const response = await recordEngagement(new Request(
      "https://littlefightnyc.com/examples/audit/api/record-engagement",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://littlefightnyc.com",
          "user-agent": "test-browser",
        },
        body: JSON.stringify({
          slug,
          scrollDepth: 72,
          timeOnPage: 91,
          sectionsViewed: ["findings", "roadmap"],
        }),
      },
    ), context());
    await Promise.all(waitUntilWork);

    expect(response.status).toBe(200);
    expect(vi.mocked(enqueueDakotaWebsiteAuditOutboxPatch).mock.calls[0]?.[0]).toEqual({
      patch_type: "engagement",
      report_id: slug,
      domain: "example.com",
      observed_at: "2026-08-03T12:00:00.000Z",
      first_view_at: "2026-08-03T11:00:00.000Z",
      last_view_at: "2026-08-03T11:55:00.000Z",
      total_views: 3,
      max_scroll_depth: 72,
      max_time_on_page_seconds: 91,
    });
  });

  it("does not project a same-origin browser beacon below the confidence threshold", async () => {
    const slug = "example-com-12345678";
    storeFor("audit-meta").entries.set(slug, { domain: "example.com" });
    storeFor("audit-views").entries.set(slug, {
      classification: "unverified_url_fetch",
      total: 1,
      first_view: "2026-08-03T11:55:00.000Z",
      last_view: "2026-08-03T11:55:00.000Z",
    });

    const response = await recordEngagement(new Request(
      "https://littlefightnyc.com/examples/audit/api/record-engagement",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://littlefightnyc.com",
          "user-agent": "test-browser",
        },
        body: JSON.stringify({
          slug,
          scrollDepth: 24,
          timeOnPage: 19,
          sectionsViewed: ["summary"],
        }),
      },
    ), context());
    await Promise.all(waitUntilWork);

    expect(response.status).toBe(200);
    expect(enqueueDakotaWebsiteAuditOutboxPatch).not.toHaveBeenCalled();
    expect(attemptDakotaWebsiteAuditOutboxEntry).not.toHaveBeenCalled();
  });

  it.each([undefined, "https://example.net"])(
    "rejects engagement writes from a missing or foreign origin (%s)",
    async (origin) => {
      const slug = "example-com-12345678";
      storeFor("audit-meta").entries.set(slug, { domain: "example.com" });
      const headers = new Headers({
        "content-type": "application/json",
        "user-agent": "test-browser",
      });
      if (origin) headers.set("origin", origin);

      const response = await recordEngagement(new Request(
        "https://littlefightnyc.com/examples/audit/api/record-engagement",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            slug,
            scrollDepth: 100,
            timeOnPage: 3600,
            sectionsViewed: ["findings"],
          }),
        },
      ), context());

      expect(response.status).toBe(403);
      expect(storeFor("audit-engagement").entries.size).toBe(0);
      expect(enqueueDakotaWebsiteAuditOutboxPatch).not.toHaveBeenCalled();
    },
  );
});

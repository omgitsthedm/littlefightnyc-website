import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));
vi.mock("./lib/audit-leads.mts", () => ({
  purgeExpiredAuditLeads: vi.fn(async () => 0),
  safeDatabaseErrorLabel: vi.fn(() => "database_error"),
}));

import { getStore } from "@netlify/blobs";
import cleanupExpired from "./cleanup-expired.mts";

class MemoryStore {
  entries = new Map<string, unknown>();
  failuresRemaining = 0;

  async get(key: string) {
    return this.entries.get(key) ?? null;
  }

  async list() {
    return { blobs: [...this.entries.keys()].map((key) => ({ key })) };
  }

  async delete(key: string) {
    if (this.failuresRemaining > 0) {
      this.failuresRemaining -= 1;
      throw new Error("simulated transient Blob failure");
    }
    this.entries.delete(key);
  }
}

const stores = new Map<string, MemoryStore>();

function store(name: string) {
  const current = stores.get(name);
  if (current) return current;
  const created = new MemoryStore();
  stores.set(name, created);
  return created;
}

beforeEach(() => {
  stores.clear();
  vi.mocked(getStore).mockImplementation((options: unknown) => store(
    typeof options === "string" ? options : (options as { name: string }).name,
  ) as never);
  vi.spyOn(console, "log").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("expired audit report cleanup", () => {
  it("keeps metadata and retries until every sibling Blob has been deleted", async () => {
    const slug = "expired-report";
    const reportStores = [
      "audit-meta",
      "audit-pages",
      "audit-views",
      "audit-status",
      "audit-engagement",
    ];

    store("audit-meta").entries.set(slug, {
      expiresAt: "2000-01-01T00:00:00.000Z",
      domain: "example.test",
    });
    for (const name of reportStores.slice(1)) {
      store(name).entries.set(slug, { saved: true });
    }
    store("audit-pages").failuresRemaining = 1;

    await cleanupExpired();

    expect(store("audit-meta").entries.has(slug)).toBe(true);
    expect(store("audit-pages").entries.has(slug)).toBe(true);
    expect(console.error).toHaveBeenCalledWith(
      `[cleanup] Incomplete report cleanup; will retry: ${slug}`,
    );
    expect(console.log).toHaveBeenCalledWith("[cleanup] Done: checked 1, deleted 0");

    await cleanupExpired();

    for (const name of reportStores) {
      expect(store(name).entries.has(slug)).toBe(false);
    }
    expect(console.log).toHaveBeenCalledWith("[cleanup] Done: checked 1, deleted 1");
  });

  it("counts a report only after the final metadata delete succeeds", async () => {
    const slug = "metadata-retry";
    const reportStores = [
      "audit-meta",
      "audit-pages",
      "audit-views",
      "audit-status",
      "audit-engagement",
    ];

    store("audit-meta").entries.set(slug, {
      expiresAt: "2000-01-01T00:00:00.000Z",
      domain: "example.test",
    });
    for (const name of reportStores.slice(1)) {
      store(name).entries.set(slug, { saved: true });
    }
    store("audit-meta").failuresRemaining = 1;

    await cleanupExpired();

    expect(store("audit-meta").entries.has(slug)).toBe(true);
    expect(console.log).toHaveBeenCalledWith("[cleanup] Done: checked 1, deleted 0");

    await cleanupExpired();

    expect(store("audit-meta").entries.has(slug)).toBe(false);
    expect(console.log).toHaveBeenCalledWith("[cleanup] Done: checked 1, deleted 1");
  });
});

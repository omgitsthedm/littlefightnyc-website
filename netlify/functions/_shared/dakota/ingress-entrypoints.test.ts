import type { Context } from "@netlify/functions";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));

import { getStore } from "@netlify/blobs";

import inboundFunction from "../../dakota-inbound.mts";
import runAudit from "../../run-audit.mts";
import { DAKOTA_INGRESS_RECEIPT_PREFIX, DAKOTA_INGRESS_RECEIPT_STORE } from "./ingress-receipts";
import { DAKOTA_OPERATOR_ALERT_STORE } from "./operator-alert";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./operator-state-constants";

const stores = new Map<string, MemoryBlobStore>();
const events: string[] = [];
const waitUntilWork: Promise<unknown>[] = [];

class MemoryBlobStore {
  readonly name: string;
  entries = new Map<string, { value: unknown; etag: string }>();
  failCreate = false;
  failMetadataRead = false;
  writes = 0;
  metadataReads = 0;

  constructor(name: string) {
    this.name = name;
  }

  async get(key: string): Promise<unknown | null> {
    events.push(`${this.name}:get`);
    const entry = this.entries.get(key);
    return entry ? structuredClone(entry.value) : null;
  }

  async getWithMetadata(key: string): Promise<{
    data: unknown;
    etag?: string;
    metadata: Record<string, unknown>;
  } | null> {
    events.push(`${this.name}:getWithMetadata`);
    this.metadataReads += 1;
    if (this.failMetadataRead) throw new Error("synthetic metadata read failure");
    const entry = this.entries.get(key);
    return entry
      ? { data: structuredClone(entry.value), etag: entry.etag, metadata: {} }
      : null;
  }

  async setJSON(
    key: string,
    value: unknown,
    options: Record<string, unknown> = {},
  ): Promise<{ modified: boolean; etag?: string }> {
    events.push(`${this.name}:setJSON`);
    if (this.failCreate && options.onlyIfNew === true) {
      throw new Error("synthetic receipt create failure");
    }
    const current = this.entries.get(key);
    if (options.onlyIfNew === true && current) return { modified: false };
    if (
      typeof options.onlyIfMatch === "string" &&
      options.onlyIfMatch !== current?.etag
    ) {
      return { modified: false };
    }
    this.writes += 1;
    const etag = `${this.name}-${this.writes}`;
    this.entries.set(key, { value: structuredClone(value), etag });
    return { modified: true, etag };
  }

  async delete(key: string): Promise<void> {
    events.push(`${this.name}:delete`);
    this.entries.delete(key);
  }
}

function storeFor(name: string): MemoryBlobStore {
  const existing = stores.get(name);
  if (existing) return existing;
  const store = new MemoryBlobStore(name);
  stores.set(name, store);
  return store;
}

function productionContext(): Context {
  return {
    ip: "203.0.113.10",
    deploy: { context: "production" },
    waitUntil(promise: Promise<unknown>) {
      waitUntilWork.push(promise);
    },
  } as unknown as Context;
}

function websiteAuditRequest(): Request {
  return new Request("https://littlefightnyc.com/examples/audit/api/run-audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://example.com",
      email: "owner@example.com",
    }),
  });
}

function techAuditData(): Record<string, unknown> {
  return {
    "form-name": "tech-audit-scratch",
    name: "Avery Owner",
    business: "Corner Market",
    contact: "avery@example.com",
    follow_up: "email",
    message: "Customers cannot tell what we sell, and mobile checkout is difficult.",
    intent: "website",
    dakota_capture_id: "11111111-2222-4333-a444-555555555555",
    dakota_submitted_at: "2026-08-03T12:00:00.000Z",
    "bot-field": "",
  };
}

beforeEach(() => {
  stores.clear();
  events.length = 0;
  waitUntilWork.length = 0;
  vi.mocked(getStore).mockImplementation((options: unknown) => {
    const name = typeof options === "string"
      ? options
      : (options as { name: string }).name;
    return storeFor(name) as never;
  });
  vi.stubGlobal("Netlify", { env: { get: () => undefined } });
});

afterEach(() => {
  vi.mocked(getStore).mockReset();
  vi.unstubAllGlobals();
});

describe("Dakota durable ingress entrypoints", () => {
  it("accepts a Tech Audit form event once its receipt exists, even if active state is down", async () => {
    storeFor(DAKOTA_OPERATOR_BLOB_STORE).failMetadataRead = true;

    await expect(inboundFunction.formSubmitted({
      data: techAuditData(),
    })).resolves.toBeUndefined();

    expect([...storeFor(DAKOTA_INGRESS_RECEIPT_STORE).entries.keys()].filter((key) => key.startsWith(DAKOTA_INGRESS_RECEIPT_PREFIX))).toHaveLength(1);
    expect([...storeFor(DAKOTA_OPERATOR_ALERT_STORE).entries.values()].filter(({ value }) => (
      value as { schema_version?: string }
    ).schema_version === "dakota.operator-alert.v1")).toHaveLength(1);
  });

  it("rejects a Tech Audit form event only when its durable receipt cannot be created", async () => {
    storeFor(DAKOTA_INGRESS_RECEIPT_STORE).failCreate = true;

    await expect(inboundFunction.formSubmitted({
      data: techAuditData(),
    })).rejects.toThrow("synthetic receipt create failure");

    expect(storeFor(DAKOTA_OPERATOR_BLOB_STORE).metadataReads).toBe(0);
  });

  it("persists a production Website Audit receipt before invoking the background audit", async () => {
    const fetcher = vi.fn(async (): Promise<Response> => {
      events.push("background:fetch");
      return new Response(null, { status: 202 });
    });
    vi.stubGlobal("fetch", fetcher);

    const response = await runAudit(websiteAuditRequest(), productionContext());
    await Promise.allSettled(waitUntilWork);

    expect(response.status).toBe(200);
    expect(storeFor(DAKOTA_INGRESS_RECEIPT_STORE).entries).toHaveLength(1);
    expect(events.indexOf(`${DAKOTA_INGRESS_RECEIPT_STORE}:setJSON`)).toBeLessThan(
      events.indexOf("background:fetch"),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not launch a production Website Audit when receipt persistence fails", async () => {
    storeFor(DAKOTA_INGRESS_RECEIPT_STORE).failCreate = true;
    const fetcher = vi.fn(async (): Promise<Response> => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetcher);

    const response = await runAudit(websiteAuditRequest(), productionContext());

    expect(response.status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
    expect(storeFor("audit-status").entries).toHaveLength(0);
    expect(storeFor(DAKOTA_OPERATOR_BLOB_STORE).metadataReads).toBe(0);
  });
});

import { Buffer } from "node:buffer";

import { describe, expect, it, vi } from "vitest";

import {
  DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY,
  retryPendingDakotaOperatorAlerts,
  sendDakotaIngressOperatorAlert,
  summarizeDakotaOperatorAlerts,
  type DakotaOperatorAlertStore,
} from "./operator-alert";

class AlertStore {
  entries = new Map<string, { value: unknown; etag: string }>();
  writes = 0;
  readKeys: string[] = [];

  async setJSON(
    key: string,
    value: unknown,
    options: Record<string, unknown> = {},
  ): Promise<{ modified: boolean; etag?: string }> {
    const current = this.entries.get(key);
    if (options.onlyIfNew === true && current) return { modified: false };
    if (
      typeof options.onlyIfMatch === "string" &&
      options.onlyIfMatch !== current?.etag
    ) {
      return { modified: false };
    }
    this.writes += 1;
    const etag = `alert-${this.writes}`;
    this.entries.set(key, { value: structuredClone(value), etag });
    return { modified: true, etag };
  }

  async getWithMetadata(key: string): Promise<{ data: unknown; etag: string } | null> {
    this.readKeys.push(key);
    const entry = this.entries.get(key);
    return entry ? { data: structuredClone(entry.value), etag: entry.etag } : null;
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }

  list({ prefix }: { prefix: string; paginate: true }) {
    const blobs = [...this.entries.keys()]
      .filter((key) => key.startsWith(prefix))
      .map((key) => ({ key }));
    return (async function* pages() {
      yield { blobs, directories: [] };
    })();
  }
}

function decodeRawMessage(raw: string): string {
  const normalized = raw.replace(/-/gu, "+").replace(/_/gu, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

describe("Dakota operator-only ingress alerts", () => {
  it("sends once to the fixed operator mailbox and deduplicates repeat delivery", async () => {
    const store = new AlertStore();
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (
      input: string | URL | Request,
      init?: RequestInit,
    ): Promise<Response> => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("oauth2.googleapis.com")) {
        return new Response(JSON.stringify({ access_token: "operator-token" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ id: "gmail-message-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    const dependencies = {
      getStore: () => store as unknown as DakotaOperatorAlertStore,
      getEnv: () => "configured",
      fetch: fetcher as unknown as typeof globalThis.fetch,
      wait: async () => undefined,
      now: () => new Date("2026-08-03T12:00:00.000Z"),
    };
    const alert = {
      kind: "received" as const,
      receiptId: "0123456789abcdef0123456789abcdef",
      source: "inbound:tech-audit",
    };

    await expect(sendDakotaIngressOperatorAlert(alert, dependencies)).resolves.toEqual({
      status: "sent",
      providerRef: "gmail-message-1",
    });
    await expect(sendDakotaIngressOperatorAlert(alert, dependencies)).resolves.toEqual({
      status: "deduplicated",
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(store.entries).toHaveLength(1);
    const gmailCall = calls.find(({ url }) => url.includes("gmail.googleapis.com"));
    const requestBody = JSON.parse(String(gmailCall?.init?.body)) as { raw: string };
    const message = decodeRawMessage(requestBody.raw);
    expect(message).toContain("From: Little Fight NYC <hello@littlefightnyc.com>");
    expect(message).toContain("To: hello@littlefightnyc.com");
    expect(message).not.toContain("avery@example.com");
    expect(message).toContain("No prospect outreach was sent.");
  });

  it("reserves distinct pending and terminal-failure alerts without prospect data", async () => {
    const store = new AlertStore();
    const dependencies = {
      getStore: () => store as unknown as DakotaOperatorAlertStore,
      getEnv: () => undefined,
      now: () => new Date("2026-08-03T12:00:00.000Z"),
    };
    const base = {
      receiptId: "fedcba9876543210fedcba9876543210",
      source: "inbound:website-audit",
    };

    await expect(sendDakotaIngressOperatorAlert({
      ...base,
      kind: "pending",
    }, dependencies)).resolves.toEqual({ status: "not_configured" });
    await expect(sendDakotaIngressOperatorAlert({
      ...base,
      kind: "failed",
    }, dependencies)).resolves.toEqual({ status: "not_configured" });

    expect([...store.entries.values()].filter(({ value }) => (
      value as { schema_version?: string }
    ).schema_version === "dakota.operator-alert.v1")).toHaveLength(2);
    expect(JSON.stringify([...store.entries.values()])).not.toContain("owner@example.com");
  });

  it("retries an unsent durable marker and exposes truthful operator-safe health", async () => {
    const store = new AlertStore();
    let now = new Date("2026-08-03T12:00:00.000Z");
    let configured = false;
    const fetcher = vi.fn(async (input: string | URL | Request): Promise<Response> => (
      String(input).includes("oauth2.googleapis.com")
        ? new Response(JSON.stringify({ access_token: "operator-token" }), { status: 200 })
        : new Response(JSON.stringify({ id: "gmail-retry-1" }), { status: 200 })
    ));
    const dependencies = {
      getStore: () => store as unknown as DakotaOperatorAlertStore,
      getEnv: () => configured ? "configured" : undefined,
      fetch: fetcher as unknown as typeof globalThis.fetch,
      wait: async () => undefined,
      now: () => now,
    };
    const alert = {
      kind: "received" as const,
      receiptId: "abcdefabcdefabcdefabcdefabcdefab",
      source: "inbound:tech-audit",
    };

    await expect(sendDakotaIngressOperatorAlert(alert, dependencies)).resolves.toEqual({ status: "not_configured" });
    expect(await summarizeDakotaOperatorAlerts(store as unknown as DakotaOperatorAlertStore, now)).toMatchObject({
      total: 1,
      sent: 0,
      pending: 1,
      not_configured: 1,
      failed: 0,
      invalid: 0,
    });

    configured = true;
    now = new Date("2026-08-03T12:05:00.000Z");
    await expect(retryPendingDakotaOperatorAlerts(dependencies)).resolves.toMatchObject({
      scanned: 1,
      due: 1,
      sent: 1,
      failed: 0,
      notConfigured: 0,
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await summarizeDakotaOperatorAlerts(store as unknown as DakotaOperatorAlertStore, now)).toMatchObject({
      total: 1,
      sent: 1,
      pending: 0,
      not_configured: 0,
      failed: 0,
      invalid: 0,
    });
  });

  it("does not strong-read sent alerts after the bounded index migration is complete", async () => {
    const store = new AlertStore();
    const dependencies = {
      getStore: () => store as unknown as DakotaOperatorAlertStore,
      getEnv: () => "configured",
      fetch: vi.fn(async (input: string | URL | Request): Promise<Response> => (
        String(input).includes("oauth2.googleapis.com")
          ? new Response(JSON.stringify({ access_token: "operator-token" }), { status: 200 })
          : new Response(JSON.stringify({ id: "gmail-message-2" }), { status: 200 })
      )) as unknown as typeof globalThis.fetch,
      wait: async () => undefined,
      now: () => new Date("2026-08-03T12:00:00.000Z"),
    };
    await sendDakotaIngressOperatorAlert({
      kind: "received",
      receiptId: "11111111111111111111111111111111",
      source: "inbound:tech-audit",
    }, dependencies);
    store.entries.set(DAKOTA_OPERATOR_ALERT_INDEX_MIGRATION_KEY, {
      etag: "migration-complete",
      value: {
        schema_version: "dakota.operator-alert-index-migration.v1",
        next_shard: 256,
        completed_at: "2026-08-03T18:00:00.000Z",
        updated_at: "2026-08-03T18:00:00.000Z",
      },
    });
    store.readKeys = [];

    await retryPendingDakotaOperatorAlerts({
      ...dependencies,
      now: () => new Date("2026-08-04T12:00:00.000Z"),
    });

    expect(store.readKeys.some((key) => key.startsWith("alerts/v1/"))).toBe(false);
  });
});

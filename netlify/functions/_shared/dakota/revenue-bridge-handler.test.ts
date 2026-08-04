import type { User } from "@netlify/identity";
import { describe, expect, it } from "vitest";

import type { DakotaAuthorization } from "./auth";
import {
  handleDakotaRevenueBridgeRequest,
  type DakotaRevenueBridgeHandlerDependencies,
} from "./revenue-bridge-handler";
import { DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES, type DakotaRevenueBridgeEnvelope } from "./revenue-bridge-schema";
import type { DakotaRevenueBridgeStore } from "./revenue-bridge-store";

const ENDPOINT = "https://www.dakota.littlefightnyc.com/api/dakota/revenue-bridge";
const CANDIDATE_KEY = "website_audit:report-12345678";
const NOW = new Date("2026-08-03T12:00:00.000Z");

class FakeStore {
  data: DakotaRevenueBridgeEnvelope | unknown | null = null;
  etag: string | null = null;

  async getWithMetadata(): Promise<{ data: unknown; etag?: string; metadata: {} } | null> {
    if (this.data === null) return null;
    return { data: structuredClone(this.data), etag: this.etag ?? undefined, metadata: {} };
  }

  async setJSON(
    _key: string,
    value: unknown,
    options: { onlyIfNew?: boolean; onlyIfMatch?: string },
  ): Promise<{ modified: boolean }> {
    if (options.onlyIfNew && this.data !== null) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) return { modified: false };
    this.data = structuredClone(value);
    this.etag = "etag-next";
    return { modified: true };
  }
}

function operatorUser(): User {
  return { id: "operator", email: "hello@littlefightnyc.com", roles: ["dakota_operator"] };
}

function dependencies(
  store: FakeStore,
  authorization: DakotaAuthorization = { allowed: true, user: operatorUser() },
): DakotaRevenueBridgeHandlerDependencies {
  return {
    authorize: async () => authorization,
    getStore: () => store as unknown as DakotaRevenueBridgeStore,
    now: () => NOW,
  };
}

function put(body: unknown, origin = new URL(ENDPOINT).origin): Request {
  return new Request(ENDPOINT, {
    method: "PUT",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify(body),
  });
}

function researchPayload(expectedUpdatedAt: string | null = null): Record<string, unknown> {
  return {
    candidate_key: CANDIDATE_KEY,
    expected_updated_at: expectedUpdatedAt,
    mutation: {
      type: "review_research",
      disposition: "needs_evidence",
      reason: "Verify the public evidence before any outreach.",
    },
  };
}

describe("Dakota Revenue Bridge handler", () => {
  it("requires shared authorization and allows only GET and PUT", async () => {
    const anonymous = await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT),
      dependencies(new FakeStore(), { allowed: false, status: 401 }),
    );
    const forbidden = await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT),
      dependencies(new FakeStore(), { allowed: false, status: 403 }),
    );
    const wrongMethod = await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT, { method: "POST" }),
      dependencies(new FakeStore()),
    );
    expect(anonymous.status).toBe(401);
    expect(forbidden.status).toBe(403);
    expect(wrongMethod.status).toBe(405);
    expect(wrongMethod.headers.get("allow")).toBe("GET, PUT");
  });

  it("returns a private empty snapshot and rejects query parameters", async () => {
    const response = await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT),
      dependencies(new FakeStore()),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      schema_version: "dakota.revenue-bridge.v1",
      updated_at: null,
      records: {},
      providers: {},
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect((await handleDakotaRevenueBridgeRequest(
      new Request(`${ENDPOINT}?candidate_key=${CANDIDATE_KEY}`),
      dependencies(new FakeStore()),
    )).status).toBe(400);
  });

  it("requires same-origin JSON and bounded UTF-8 bodies", async () => {
    expect((await handleDakotaRevenueBridgeRequest(
      put(researchPayload(), "https://attacker.example"),
      dependencies(new FakeStore()),
    )).status).toBe(403);
    expect((await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT, { method: "PUT", headers: { origin: new URL(ENDPOINT).origin, "content-type": "text/plain" }, body: "{}" }),
      dependencies(new FakeStore()),
    )).status).toBe(415);
    expect((await handleDakotaRevenueBridgeRequest(
      new Request(ENDPOINT, {
        method: "PUT",
        headers: { origin: new URL(ENDPOINT).origin, "content-type": "application/json" },
        body: "x".repeat(DAKOTA_REVENUE_BRIDGE_REQUEST_MAX_BYTES + 1),
      }),
      dependencies(new FakeStore()),
    )).status).toBe(413);
  });

  it("accepts bounded human reviews with candidate-level optimistic concurrency", async () => {
    const store = new FakeStore();
    const created = await handleDakotaRevenueBridgeRequest(put(researchPayload()), dependencies(store));
    expect(created.status).toBe(200);
    const body = await created.json() as { updated_at: string; record: { research_review: { disposition: string } } };
    expect(body.record.research_review.disposition).toBe("needs_evidence");

    const stale = await handleDakotaRevenueBridgeRequest(put(researchPayload(null)), dependencies(store));
    expect(stale.status).toBe(409);
    const replay = await handleDakotaRevenueBridgeRequest(put(researchPayload(body.updated_at)), dependencies(store));
    expect(replay.status).toBe(200);
    expect((await replay.json() as { outcome: string }).outcome).toBe("unchanged");
  });

  it("does not let the browser forge provider facts, archive, or restore", async () => {
    for (const mutation of [
      { type: "append_external_event", event: {} },
      { type: "reconcile_website_audit", patch: {} },
      { type: "append_alert", alert: {} },
      { type: "update_provider", provider_state: {} },
      { type: "archive_candidate", reason: "forged", retention_until: null },
      { type: "restore_candidate" },
    ]) {
      const response = await handleDakotaRevenueBridgeRequest(put({
        candidate_key: CANDIDATE_KEY,
        expected_updated_at: null,
        mutation,
      }), dependencies(new FakeStore()));
      expect(response.status, mutation.type).toBe(422);
    }
  });

  it("fails closed on malformed stored state", async () => {
    const store = new FakeStore();
    store.data = { records: "corrupt" };
    store.etag = "etag-corrupt";
    const response = await handleDakotaRevenueBridgeRequest(new Request(ENDPOINT), dependencies(store));
    expect(response.status).toBe(503);
  });
});

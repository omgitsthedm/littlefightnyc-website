import type { Context } from "@netlify/functions";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn(() => ({})) }));
vi.mock("./auth.ts", () => ({ getDakotaAuthorization: vi.fn() }));
vi.mock("./website-audit-outbox.ts", () => ({
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE: "dakota-website-audit-outbox",
  redriveFailedDakotaWebsiteAuditOutboxEntry: vi.fn(),
  acknowledgeFailedDakotaWebsiteAuditOutboxEntry: vi.fn(),
}));

import dakotaWebsiteAuditOutbox from "../../dakota-website-audit-outbox.mts";
import { getDakotaAuthorization } from "./auth.ts";
import {
  acknowledgeFailedDakotaWebsiteAuditOutboxEntry,
  redriveFailedDakotaWebsiteAuditOutboxEntry,
} from "./website-audit-outbox.ts";

const ENTRY_ID = "a".repeat(32);

function request(action = "redrive", origin = "https://www.dakota.littlefightnyc.com") {
  return new Request("https://www.dakota.littlefightnyc.com/api/dakota/website-audit-outbox", {
    method: "POST",
    headers: { "content-type": "application/json", origin },
    body: JSON.stringify({ action, entry_id: ENTRY_ID }),
  });
}

beforeEach(() => {
  vi.mocked(getDakotaAuthorization).mockReset();
  vi.mocked(redriveFailedDakotaWebsiteAuditOutboxEntry).mockReset();
  vi.mocked(acknowledgeFailedDakotaWebsiteAuditOutboxEntry).mockReset();
});

describe("Website Audit operator recovery endpoint", () => {
  it("requires the authenticated Dakota operator", async () => {
    vi.mocked(getDakotaAuthorization).mockResolvedValue({ allowed: false, status: 401 });
    const response = await dakotaWebsiteAuditOutbox(request(), {} as Context);
    expect(response.status).toBe(401);
    expect(redriveFailedDakotaWebsiteAuditOutboxEntry).not.toHaveBeenCalled();
  });

  it("rejects cross-origin mutation requests after authorization", async () => {
    vi.mocked(getDakotaAuthorization).mockResolvedValue({
      allowed: true,
      status: 200,
      email: "hello@littlefightnyc.com",
      roles: ["dakota_operator"],
    });
    const response = await dakotaWebsiteAuditOutbox(
      request("redrive", "https://example.net"),
      {} as Context,
    );
    expect(response.status).toBe(403);
    expect(redriveFailedDakotaWebsiteAuditOutboxEntry).not.toHaveBeenCalled();
  });

  it("allows redrive and surfaced-failure acknowledgement without exposing the patch", async () => {
    vi.mocked(getDakotaAuthorization).mockResolvedValue({
      allowed: true,
      status: 200,
      email: "hello@littlefightnyc.com",
      roles: ["dakota_operator"],
    });
    vi.mocked(redriveFailedDakotaWebsiteAuditOutboxEntry).mockResolvedValue({
      outcome: "redriven",
      entry_id: ENTRY_ID,
      delivery: {
        outcome: "delivered",
        entry_id: ENTRY_ID,
        attempts: 0,
        next_retry_at: null,
        last_error_code: null,
      },
    });
    vi.mocked(acknowledgeFailedDakotaWebsiteAuditOutboxEntry).mockResolvedValue({
      outcome: "acknowledged",
      entry_id: ENTRY_ID,
    });

    const redrive = await dakotaWebsiteAuditOutbox(request("redrive"), {} as Context);
    const acknowledge = await dakotaWebsiteAuditOutbox(request("acknowledge"), {} as Context);
    expect(redrive.status).toBe(200);
    expect(acknowledge.status).toBe(200);
    expect(await redrive.json()).toMatchObject({ result: { outcome: "redriven" } });
    expect(await acknowledge.json()).toMatchObject({ result: { outcome: "acknowledged" } });
  });
});

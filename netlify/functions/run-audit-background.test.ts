import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@netlify/blobs", () => ({ getStore: vi.fn() }));
vi.mock("./_shared/dakota/operator-alert.ts", () => ({
  DAKOTA_OPERATOR_ALERT_STORE: "dakota-operator-alerts",
  sendDakotaWebsiteAuditOperatorAlert: vi.fn(),
}));

import { getStore } from "@netlify/blobs";
import {
  notifyWebsiteAuditFailure,
  shouldReconcileWebsiteAuditRevenueBridge,
} from "./run-audit-background.mts";
import { sendDakotaWebsiteAuditOperatorAlert } from "./_shared/dakota/operator-alert.ts";

beforeEach(() => {
  vi.mocked(getStore).mockReset();
  vi.mocked(sendDakotaWebsiteAuditOperatorAlert).mockReset();
  vi.mocked(sendDakotaWebsiteAuditOperatorAlert).mockImplementation(async (_alert, dependencies) => {
    dependencies.getStore();
    return { status: "sent", providerRef: null };
  });
});

describe("Website Audit failure wake-ups", () => {
  it.each([
    ["deploy-preview", "website_audit"],
    ["production", "programmatic"],
  ] as const)("keeps %s/%s failures out of Dakota alerts and Gmail", async (deployContext, requestSource) => {
    const reconcile = shouldReconcileWebsiteAuditRevenueBridge(deployContext, requestSource);
    expect(reconcile).toBe(false);

    await notifyWebsiteAuditFailure(reconcile, "corner-market-12345678", "pipeline_failed");

    expect(getStore).not.toHaveBeenCalled();
    expect(sendDakotaWebsiteAuditOperatorAlert).not.toHaveBeenCalled();
  });

  it("creates the durable fixed-mailbox wake-up only for a production public audit failure", async () => {
    const reconcile = shouldReconcileWebsiteAuditRevenueBridge("production", "website_audit");
    expect(reconcile).toBe(true);

    await notifyWebsiteAuditFailure(reconcile, "corner-market-12345678", "email_delivery_failed");

    expect(getStore).toHaveBeenCalledWith({
      name: "dakota-operator-alerts",
      consistency: "strong",
    });
    expect(sendDakotaWebsiteAuditOperatorAlert).toHaveBeenCalledWith({
      reportId: "corner-market-12345678",
      kind: "email_delivery_failed",
    }, expect.objectContaining({
      maxAttempts: 1,
      requestTimeoutMs: 5_000,
    }));
  });
});

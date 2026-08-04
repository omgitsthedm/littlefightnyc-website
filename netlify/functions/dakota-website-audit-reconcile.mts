import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-store.ts";
import {
  DAKOTA_WEBSITE_AUDIT_OUTBOX_RETRY_BATCH_LIMIT,
  DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
  retryPendingDakotaWebsiteAuditOutbox,
} from "./_shared/dakota/website-audit-outbox.ts";

export default async function reconcileDakotaWebsiteAuditOutbox(): Promise<void> {
  const result = await retryPendingDakotaWebsiteAuditOutbox({
    getOutboxStore: () => getStore({
      name: DAKOTA_WEBSITE_AUDIT_OUTBOX_STORE,
      consistency: "strong",
    }),
    getRevenueBridgeStore: () => getStore({
      name: DAKOTA_REVENUE_BRIDGE_STORE,
      consistency: "strong",
    }),
  }, DAKOTA_WEBSITE_AUDIT_OUTBOX_RETRY_BATCH_LIMIT);

  console.log("[dakota-website-audit-reconcile] Completed", {
    scanned: result.scanned,
    due: result.due,
    attempted: result.attempted,
    delivered: result.delivered,
    pending: result.pending,
    failed: result.failed,
    superseded: result.superseded,
  });
}

export const config: Config = {
  schedule: "*/5 * * * *",
};

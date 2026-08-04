import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import {
  DAKOTA_INGRESS_RECEIPT_STORE,
  DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
  retryPendingDakotaIngress,
} from "./_shared/dakota/ingress-receipts.ts";
import {
  DAKOTA_OPERATOR_ALERT_STORE,
  retryPendingDakotaOperatorAlerts,
  sendDakotaIngressOperatorAlert,
} from "./_shared/dakota/operator-alert.ts";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./_shared/dakota/operator-state-constants.ts";

export default async function retryDakotaIngress(): Promise<void> {
  const alertDependencies = {
    getStore: () => getStore({
      name: DAKOTA_OPERATOR_ALERT_STORE,
      consistency: "strong" as const,
    }),
    maxAttempts: 1,
    requestTimeoutMs: 5_000,
  };
  const result = await retryPendingDakotaIngress({
    getOperatorStore: () => getStore({
      name: DAKOTA_OPERATOR_BLOB_STORE,
      consistency: "strong",
    }),
    getReceiptStore: () => getStore({
      name: DAKOTA_INGRESS_RECEIPT_STORE,
      consistency: "strong",
    }),
  }, DAKOTA_INGRESS_RETRY_BATCH_LIMIT);

  const alertResults = await Promise.allSettled(
    result.alerts.slice(0, DAKOTA_INGRESS_RETRY_BATCH_LIMIT).map((alert) =>
      sendDakotaIngressOperatorAlert(alert, alertDependencies)
    ),
  );
  const alertFailures = alertResults.filter((result) => result.status === "rejected").length;
  const alertRetry = await retryPendingDakotaOperatorAlerts(
    alertDependencies,
    DAKOTA_INGRESS_RETRY_BATCH_LIMIT,
  );

  console.log("[dakota-ingress-retry] Completed", {
    scanned: result.scanned,
    due: result.due,
    retried: result.retried,
    stored: result.stored,
    pending: result.pending,
    failed: result.failed,
    alertFailures,
    operatorAlertsDue: alertRetry.due,
    operatorAlertsSent: alertRetry.sent,
    operatorAlertsPending: alertRetry.pending + alertRetry.failed + alertRetry.notConfigured,
  });
}

export const config: Config = {
  schedule: "*/5 * * * *",
};

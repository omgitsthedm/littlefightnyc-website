import { getStore } from "@netlify/blobs";
import type { FormSubmittedEvent, NetlifyFunction } from "@netlify/functions";

import {
  captureTechAuditInboundReliably,
  DAKOTA_INGRESS_RECEIPT_STORE,
} from "./_shared/dakota/ingress-receipts.ts";
import {
  DAKOTA_OPERATOR_ALERT_STORE,
  sendDakotaIngressOperatorAlert,
} from "./_shared/dakota/operator-alert.ts";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./_shared/dakota/operator-state-constants.ts";

const inboundFunction = {
  async formSubmitted(event: FormSubmittedEvent): Promise<void> {
    const result = await captureTechAuditInboundReliably(event.data, {
      getOperatorStore: () => getStore({
        name: DAKOTA_OPERATOR_BLOB_STORE,
        consistency: "strong",
      }),
      getReceiptStore: () => getStore({
        name: DAKOTA_INGRESS_RECEIPT_STORE,
        consistency: "strong",
      }),
    });

    if (!result?.alertKind) return;
    try {
      await sendDakotaIngressOperatorAlert({
        kind: result.alertKind,
        receiptId: result.receiptId,
        source: result.source,
      }, {
        getStore: () => getStore({
          name: DAKOTA_OPERATOR_ALERT_STORE,
          consistency: "strong",
        }),
      });
    } catch {
      // The receipt already exists. Operator-only alert delivery is useful but
      // cannot turn a durable inquiry into a failed form event.
      console.error("[dakota-inbound] Operator alert delivery failed");
    }
  },
} satisfies NetlifyFunction;

export default inboundFunction;

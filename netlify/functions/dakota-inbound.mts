import { getStore } from "@netlify/blobs";
import type { FormSubmittedEvent, NetlifyFunction } from "@netlify/functions";

import {
  captureTechAuditInbound,
  DAKOTA_OPERATOR_BLOB_STORE,
  isSuccessfulInboundResult,
} from "./_shared/dakota/inbound.ts";

const inboundFunction = {
  async formSubmitted(event: FormSubmittedEvent): Promise<void> {
    const result = await captureTechAuditInbound(event.data, {
      getStore: () => getStore({
        name: DAKOTA_OPERATOR_BLOB_STORE,
        consistency: "strong",
      }),
    });

    if (!isSuccessfulInboundResult(result)) {
      // A verified inquiry must not disappear silently when storage is full or
      // under sustained contention. Throw only a constant, non-sensitive error.
      throw new Error("Dakota consented-inbound storage is temporarily unavailable.");
    }
  },
} satisfies NetlifyFunction;

export default inboundFunction;

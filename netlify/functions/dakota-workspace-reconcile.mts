import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import { pollDakotaGoogleCalendar } from "./_shared/dakota/calendar-poller.ts";
import { pollDakotaGmail } from "./_shared/dakota/gmail-poller.ts";
import {
  DAKOTA_OPERATOR_BLOB_KEY,
  DAKOTA_OPERATOR_BLOB_STORE,
} from "./_shared/dakota/operator-state-constants.ts";
import {
  type DakotaOperatorStateEnvelope,
  validateDakotaOperatorStateEnvelope,
} from "./_shared/dakota/operator-state-schema.ts";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-schema.ts";
import {
  applyDakotaRevenueBridgeServerMutations,
  loadDakotaRevenueBridgeState,
} from "./_shared/dakota/revenue-bridge-store.ts";
import { reconcileDakotaWorkspaceProviders } from "./_shared/dakota/workspace-reconciler.ts";

declare const Netlify: {
  env: { get(name: string): string | undefined };
};

function configured(name: string): boolean {
  try {
    return Boolean(Netlify.env.get(name)?.trim());
  } catch {
    return Boolean(process.env[name]?.trim());
  }
}

async function loadOperatorState(): Promise<DakotaOperatorStateEnvelope> {
  const result = await getStore({
    name: DAKOTA_OPERATOR_BLOB_STORE,
    consistency: "strong",
  }).getWithMetadata(DAKOTA_OPERATOR_BLOB_KEY, { type: "json", consistency: "strong" });
  if (!result) {
    return {
      schema_version: "dakota.operator-state.v3",
      updated_at: new Date(0).toISOString(),
      records: {},
    };
  }
  const validation = validateDakotaOperatorStateEnvelope(result.data);
  if (!validation.valid) throw new Error("operator_state_invalid");
  return validation.value;
}

export default async function reconcileDakotaWorkspace(): Promise<void> {
  const bridgeStore = getStore({ name: DAKOTA_REVENUE_BRIDGE_STORE, consistency: "strong" });
  const [operator, bridge] = await Promise.all([
    loadOperatorState(),
    loadDakotaRevenueBridgeState(bridgeStore),
  ]);
  const summary = await reconcileDakotaWorkspaceProviders({
    records: operator.records,
    bridge: bridge.envelope,
  }, {
    configured,
    pollGmail: (input) => pollDakotaGmail(input, {
      maxAttempts: 1,
      requestTimeoutMs: 5_000,
      apiRequestTimeoutMs: 5_000,
    }),
    pollCalendar: (input) => pollDakotaGoogleCalendar(input, {
      maxAttempts: 1,
      requestTimeoutMs: 5_000,
      apiRequestTimeoutMs: 5_000,
    }),
    applyMutations: (mutations) => applyDakotaRevenueBridgeServerMutations(
      [...mutations],
      { getStore: () => bridgeStore },
    ),
  });

  console.log("[dakota-workspace-reconcile] Completed", summary);
}

export const config: Config = {
  schedule: "*/15 * * * *",
};

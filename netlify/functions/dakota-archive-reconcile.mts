import { getStore } from "@netlify/blobs";
import type { Config } from "@netlify/functions";

import {
  clearDakotaArchiveReconciliationRequest,
  DAKOTA_ARCHIVE_STORE,
  listDakotaArchiveReconciliationItems,
  reconcileDakotaArchiveTransaction,
  type DakotaArchiveOperatorStore,
  type DakotaArchiveStore,
} from "./_shared/dakota/archive.ts";
import {
  archiveDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_ARCHIVE_STORE,
  getDakotaRevenueBridgeArchiveReconciliation,
  markDakotaRevenueBridgeArchiveReconciled,
  restoreDakotaRevenueBridgeRecord,
} from "./_shared/dakota/revenue-bridge-archive.ts";
import { DAKOTA_REVENUE_BRIDGE_STORE } from "./_shared/dakota/revenue-bridge-schema.ts";
import { DAKOTA_OPERATOR_BLOB_STORE } from "./_shared/dakota/operator-state-constants.ts";
import type { DakotaRevenueBridgeStore } from "./_shared/dakota/revenue-bridge-store.ts";
import type { DakotaRevenueBridgeArchiveStore } from "./_shared/dakota/revenue-bridge-archive.ts";

const RECONCILIATION_LIMIT = 10;

export interface DakotaArchiveReconcileDependencies {
  coreStore: DakotaArchiveStore;
  operatorStore: DakotaArchiveOperatorStore;
  bridgeStore: DakotaRevenueBridgeStore;
  bridgeArchiveStore: DakotaRevenueBridgeArchiveStore;
  now?: () => Date;
  limit?: number;
}

export interface DakotaArchiveReconcileStats {
  scanned: number;
  completed: number;
  deferred: number;
  abandoned: number;
  failed: number;
}

export async function reconcileDakotaArchiveBatch(
  dependencies: DakotaArchiveReconcileDependencies,
): Promise<DakotaArchiveReconcileStats> {
  const limit = dependencies.limit ?? RECONCILIATION_LIMIT;
  const items = await listDakotaArchiveReconciliationItems(dependencies.coreStore, limit);
  let completed = 0;
  let deferred = 0;
  let abandoned = 0;
  let failed = 0;
  for (const queued of items) {
    try {
      const core = await reconcileDakotaArchiveTransaction(queued.archiveId, {
        getOperatorStore: () => dependencies.operatorStore,
        getArchiveStore: () => dependencies.coreStore,
        now: dependencies.now,
      });
      if (core.outcome === "in_flight") {
        deferred += 1;
        continue;
      }
      if (core.outcome === "abandoned") {
        await clearDakotaArchiveReconciliationRequest(queued.archiveId, dependencies.coreStore);
        abandoned += 1;
        continue;
      }
      if (core.outcome !== "ready") {
        failed += 1;
        continue;
      }
      const item = core.item;
      if (item.transactionStatus === "copied") {
        failed += 1;
        continue;
      }
      const marker = await getDakotaRevenueBridgeArchiveReconciliation(item.archiveId, dependencies.bridgeArchiveStore);
      if (
        marker &&
        marker.candidate_key === item.candidateKey &&
        marker.core_status === item.transactionStatus
      ) {
        await clearDakotaArchiveReconciliationRequest(item.archiveId, dependencies.coreStore);
        completed += 1;
        continue;
      }
      const bridgeDependencies = {
        getBridgeStore: () => dependencies.bridgeStore,
        getArchiveStore: () => dependencies.bridgeArchiveStore,
        now: dependencies.now,
      };
      const result = item.transactionStatus === "removed_from_active"
        ? await archiveDakotaRevenueBridgeRecord(item.candidateKey, item.archiveId, bridgeDependencies)
        : await restoreDakotaRevenueBridgeRecord(item.candidateKey, item.archiveId, bridgeDependencies);
      if (result.outcome !== "stored" && result.outcome !== "unchanged") {
        failed += 1;
        continue;
      }
      await markDakotaRevenueBridgeArchiveReconciled({
        archive_id: item.archiveId,
        candidate_key: item.candidateKey,
        core_status: item.transactionStatus,
      }, dependencies.bridgeArchiveStore, (dependencies.now ?? (() => new Date()))());
      await clearDakotaArchiveReconciliationRequest(item.archiveId, dependencies.coreStore);
      completed += 1;
    } catch {
      failed += 1;
    }
  }

  return { scanned: items.length, completed, deferred, abandoned, failed };
}

export default async function reconcileDakotaArchives(): Promise<void> {
  const stats = await reconcileDakotaArchiveBatch({
    coreStore: getStore({ name: DAKOTA_ARCHIVE_STORE, consistency: "strong" }),
    operatorStore: getStore({ name: DAKOTA_OPERATOR_BLOB_STORE, consistency: "strong" }),
    bridgeStore: getStore({ name: DAKOTA_REVENUE_BRIDGE_STORE, consistency: "strong" }),
    bridgeArchiveStore: getStore({ name: DAKOTA_REVENUE_BRIDGE_ARCHIVE_STORE, consistency: "strong" }),
  });

  console.log("[dakota-archive-reconcile] Completed", {
    ...stats,
  });
}

export const config: Config = {
  schedule: "*/10 * * * *",
};

import { describe, expect, it } from "vitest";

import { reconcileDakotaArchiveBatch } from "../../dakota-archive-reconcile.mts";
import {
  archiveDakotaRecord,
  listDakotaArchiveReconciliationItems,
} from "./archive";
import {
  getDakotaRevenueBridgeArchiveEntry,
  getDakotaRevenueBridgeArchiveReconciliation,
} from "./revenue-bridge-archive";
import {
  createDakotaRevenueBridgeEnvelope,
  createEmptyDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_KEY,
  type DakotaRevenueBridgeEnvelope,
} from "./revenue-bridge-schema";
import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  createEmptyDakotaCommercialClose,
  type DakotaOperatorStateEnvelope,
} from "./operator-state-schema";
import { DAKOTA_OPERATOR_BLOB_KEY } from "./operator-state-constants";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const CANDIDATE_KEY = "nys_dos:12345";

class MemoryStore {
  entries = new Map<string, { data: unknown; etag: string; metadata: Record<string, unknown> }>();
  writes = 0;

  async getWithMetadata(key: string) {
    const entry = this.entries.get(key);
    return entry ? { ...entry, data: structuredClone(entry.data) } : null;
  }

  async setJSON(key: string, value: unknown, options: Record<string, unknown> = {}) {
    const current = this.entries.get(key);
    if (options.onlyIfNew === true && current) return { modified: false };
    if (typeof options.onlyIfMatch === "string" && options.onlyIfMatch !== current?.etag) {
      return { modified: false };
    }
    this.writes += 1;
    const etag = `etag-${this.writes}`;
    this.entries.set(key, {
      data: structuredClone(value),
      etag,
      metadata: (options.metadata as Record<string, unknown>) ?? {},
    });
    return { modified: true, etag };
  }

  async delete(key: string) {
    this.entries.delete(key);
  }

  list({ prefix, paginate }: { prefix: string; paginate?: boolean }) {
    const page = {
      blobs: [...this.entries.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => ({ key, etag: value.etag })),
      directories: [],
    };
    return paginate
      ? (async function* pages() { yield page; })()
      : Promise.resolve(page);
  }
}

function setup(includeBridgeRecord: boolean) {
  const operatorStore = new MemoryStore();
  const coreStore = new MemoryStore();
  const bridgeStore = new MemoryStore();
  const bridgeArchiveStore = new MemoryStore();
  const operatorRecord = createDakotaOperatorRecord({
    identity: { businessName: "Corner Market", source: "nys_dos", sourceId: "12345" },
    status: "not_fit",
    notes: "Reviewed and closed.",
    verifiedPain: "",
    offerFit: "",
    nextAction: "",
    dueDate: "",
    estimatedValue: null,
    actualRevenue: null,
    winLossReason: "Not a fit.",
    proof: "",
    draft: "",
    contacts: [],
    activities: [],
    commercialClose: createEmptyDakotaCommercialClose(),
    selectedContactId: null,
    tasks: [],
  }, "2026-08-03T11:00:00.000Z");
  operatorStore.entries.set(DAKOTA_OPERATOR_BLOB_KEY, {
    data: createDakotaOperatorStateEnvelope({ [CANDIDATE_KEY]: operatorRecord }, NOW.toISOString()),
    etag: "operator-1",
    metadata: {},
  });
  const bridgeRecords = includeBridgeRecord
    ? { [CANDIDATE_KEY]: createEmptyDakotaRevenueBridgeRecord("2026-08-03T11:00:00.000Z") }
    : {};
  bridgeStore.entries.set(DAKOTA_REVENUE_BRIDGE_KEY, {
    data: createDakotaRevenueBridgeEnvelope(bridgeRecords, {}, "2026-08-03T11:00:00.000Z"),
    etag: "bridge-1",
    metadata: {},
  });
  return { operatorStore, coreStore, bridgeStore, bridgeArchiveStore, operatorRecord };
}

describe("Dakota archive reconciliation scheduler", () => {
  it.each([true, false])(
    "finishes a pending core archive idempotently when a bridge record exists=%s",
    async (includeBridgeRecord) => {
      const stores = setup(includeBridgeRecord);
      const coreArchive = await archiveDakotaRecord(CANDIDATE_KEY, stores.operatorRecord.updated_at, {
        getOperatorStore: () => stores.operatorStore,
        getArchiveStore: () => stores.coreStore,
        now: () => NOW,
      });

      await expect(reconcileDakotaArchiveBatch({
        coreStore: stores.coreStore,
        operatorStore: stores.operatorStore,
        bridgeStore: stores.bridgeStore,
        bridgeArchiveStore: stores.bridgeArchiveStore,
        now: () => NOW,
        limit: 1,
      })).resolves.toEqual({ scanned: 1, completed: 1, deferred: 0, abandoned: 0, failed: 0 });

      const bridgeEnvelope = stores.bridgeStore.entries.get(DAKOTA_REVENUE_BRIDGE_KEY)?.data as DakotaRevenueBridgeEnvelope;
      expect(bridgeEnvelope.records).toEqual({});
      const bridgeArchive = await getDakotaRevenueBridgeArchiveEntry(
        coreArchive.archive_id,
        stores.bridgeArchiveStore,
      );
      if (includeBridgeRecord) expect(bridgeArchive).toMatchObject({ status: "removed_from_active" });
      else expect(bridgeArchive).toBeNull();
      await expect(
        getDakotaRevenueBridgeArchiveReconciliation(coreArchive.archive_id, stores.bridgeArchiveStore),
      ).resolves.toMatchObject({ core_status: "removed_from_active" });
      await expect(listDakotaArchiveReconciliationItems(stores.coreStore, 1)).resolves.toEqual([]);
      await expect(reconcileDakotaArchiveBatch({
        coreStore: stores.coreStore,
        operatorStore: stores.operatorStore,
        bridgeStore: stores.bridgeStore,
        bridgeArchiveStore: stores.bridgeArchiveStore,
        now: () => NOW,
        limit: 1,
      })).resolves.toEqual({ scanned: 0, completed: 0, deferred: 0, abandoned: 0, failed: 0 });
    },
  );
});

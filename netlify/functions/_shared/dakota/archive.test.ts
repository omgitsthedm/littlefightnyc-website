import { describe, expect, it } from "vitest";

import {
  archiveDakotaRecord,
  clearDakotaArchiveReconciliationRequest,
  DAKOTA_ARCHIVE_PREFIX,
  DAKOTA_ARCHIVE_RECONCILIATION_PREFIX,
  DakotaArchiveConflictError,
  DakotaArchiveValidationError,
  listDakotaArchiveReconciliationItems,
  previewDakotaArchive,
  reconcileDakotaArchiveTransaction,
  restoreDakotaRecord,
  type DakotaArchiveDependencies,
} from "./archive";
import {
  createDakotaOperatorRecord,
  createDakotaOperatorStateEnvelope,
  createEmptyDakotaCommercialClose,
  type DakotaOperatorRecord,
  type DakotaOperatorStateEnvelope,
} from "./operator-state-schema";
import { DAKOTA_OPERATOR_BLOB_KEY } from "./operator-state-constants";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const CANDIDATE_KEY = "nys_dos:12345";

function terminalRecord(updatedAt = "2026-08-01T12:00:00.000Z"): DakotaOperatorRecord {
  return createDakotaOperatorRecord({
    identity: { businessName: "Corner Market", source: "nys_dos", sourceId: "12345" },
    status: "not_fit",
    notes: "Reviewed and closed.",
    verifiedPain: "",
    offerFit: "",
    nextAction: "",
    dueDate: "",
    estimatedValue: null,
    actualRevenue: null,
    winLossReason: "Not in the operating area.",
    proof: "",
    draft: "",
    contacts: [],
    activities: [],
    commercialClose: createEmptyDakotaCommercialClose(),
    selectedContactId: null,
    tasks: [],
  }, updatedAt);
}

class OperatorStore {
  data: DakotaOperatorStateEnvelope | null;
  etag: string | null;
  failWrites = 0;

  constructor(record: DakotaOperatorRecord | null) {
    this.data = createDakotaOperatorStateEnvelope(record ? { [CANDIDATE_KEY]: record } : {}, NOW.toISOString());
    this.etag = "operator-1";
  }

  async getWithMetadata(key: string) {
    expect(key).toBe(DAKOTA_OPERATOR_BLOB_KEY);
    return this.data ? { data: this.data, etag: this.etag ?? undefined, metadata: {} } : null;
  }

  async setJSON(_key: string, value: unknown, options: Record<string, unknown>) {
    if (this.failWrites > 0) {
      this.failWrites -= 1;
      return { modified: false };
    }
    if (options.onlyIfMatch && options.onlyIfMatch !== this.etag) return { modified: false };
    if (options.onlyIfNew && this.data) return { modified: false };
    this.data = value as DakotaOperatorStateEnvelope;
    this.etag = `operator-${Number(this.etag?.split("-")[1] ?? 1) + 1}`;
    return { modified: true, etag: this.etag };
  }
}

class ArchiveStore {
  entries = new Map<string, { data: unknown; etag: string; metadata: Record<string, unknown> }>();
  writes = 0;
  failRecordCasWrites = 0;

  async getWithMetadata(key: string) {
    return this.entries.get(key) ?? null;
  }

  async setJSON(key: string, value: unknown, options: Record<string, unknown>) {
    const current = this.entries.get(key);
    if (
      this.failRecordCasWrites > 0 &&
      key.startsWith(DAKOTA_ARCHIVE_PREFIX) &&
      typeof options.onlyIfMatch === "string"
    ) {
      this.failRecordCasWrites -= 1;
      return { modified: false };
    }
    if (options.onlyIfNew && current) return { modified: false };
    if (options.onlyIfMatch && options.onlyIfMatch !== current?.etag) return { modified: false };
    this.writes += 1;
    const etag = `archive-${this.writes}`;
    this.entries.set(key, { data: value, etag, metadata: (options.metadata as Record<string, unknown>) ?? {} });
    return { modified: true, etag };
  }

  async delete(key: string) {
    this.entries.delete(key);
  }

  list({ prefix, paginate }: { prefix: string; paginate?: boolean }) {
    const page = {
      blobs: [...this.entries.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, value]) => ({ key, etag: value.etag, metadata: value.metadata })),
    };
    return paginate
      ? (async function* pages() { yield page; })()
      : Promise.resolve(page);
  }
}

function dependencies(operator: OperatorStore, archive: ArchiveStore): DakotaArchiveDependencies {
  return {
    getOperatorStore: () => operator,
    getArchiveStore: () => archive,
    now: () => NOW,
  };
}

describe("Dakota recoverable archive", () => {
  it("copies and verifies a terminal record before removing it, then restores it", async () => {
    const record = terminalRecord();
    const operator = new OperatorStore(record);
    const archive = new ArchiveStore();
    const archived = await archiveDakotaRecord(CANDIDATE_KEY, record.updated_at, dependencies(operator, archive));

    expect(archived.transaction_status).toBe("removed_from_active");
    expect(archived.checksum).toMatch(/^[0-9a-f]{64}$/u);
    expect(operator.data?.records).toEqual({});
    expect([...archive.entries.keys()][0]).toBe(`${DAKOTA_ARCHIVE_PREFIX}${archived.archive_id}`);

    const archivedPreview = await previewDakotaArchive(dependencies(operator, archive));
    expect(archivedPreview.recoverable).toEqual([
      expect.objectContaining({
        archiveId: archived.archive_id,
        candidateKey: CANDIDATE_KEY,
        businessName: "Corner Market",
        transactionStatus: "removed_from_active",
      }),
    ]);

    const restored = await restoreDakotaRecord(archived.archive_id, dependencies(operator, archive));
    expect(restored.transaction_status).toBe("restored");
    expect(operator.data?.records[CANDIDATE_KEY]).toEqual(record);
    const restoredPreview = await previewDakotaArchive(dependencies(operator, archive));
    expect(restoredPreview.recoverable).toEqual([]);
  });

  it("leaves the verified copy intact through active-state conflicts", async () => {
    const record = terminalRecord();
    const operator = new OperatorStore(record);
    operator.failWrites = 4;
    const archive = new ArchiveStore();
    await expect(
      archiveDakotaRecord(CANDIDATE_KEY, record.updated_at, dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveConflictError);
    expect(operator.data?.records[CANDIDATE_KEY]).toEqual(record);
    expect([...archive.entries.keys()].filter((key) => key.startsWith(DAKOTA_ARCHIVE_PREFIX))).toHaveLength(1);
    expect([...archive.entries.keys()].filter((key) => key.startsWith(DAKOTA_ARCHIVE_RECONCILIATION_PREFIX))).toHaveLength(1);
    expect(JSON.stringify([...archive.entries.entries()].find(([key]) => key.startsWith(DAKOTA_ARCHIVE_PREFIX))?.[1].data))
      .toContain('"transaction_status":"copied"');
    await expect(previewDakotaArchive(dependencies(operator, archive))).resolves.toMatchObject({
      archiveCount: 1,
      recoverable: [],
    });
  });

  it("repairs crashes between the core active-state CAS and archive marker writes", async () => {
    const record = terminalRecord();
    const operator = new OperatorStore(record);
    const archive = new ArchiveStore();
    archive.failRecordCasWrites = 4;

    await expect(
      archiveDakotaRecord(CANDIDATE_KEY, record.updated_at, dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveConflictError);
    expect(operator.data?.records).toEqual({});
    const [queued] = await listDakotaArchiveReconciliationItems(archive, 10);
    expect(queued?.transactionStatus).toBe("copied");

    await expect(
      reconcileDakotaArchiveTransaction(queued!.archiveId, dependencies(operator, archive)),
    ).resolves.toMatchObject({ outcome: "ready", item: { transactionStatus: "removed_from_active" } });

    archive.failRecordCasWrites = 4;
    await expect(
      restoreDakotaRecord(queued!.archiveId, dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveConflictError);
    expect(operator.data?.records[CANDIDATE_KEY]).toEqual(record);
    await expect(
      reconcileDakotaArchiveTransaction(queued!.archiveId, dependencies(operator, archive)),
    ).resolves.toMatchObject({ outcome: "ready", item: { transactionStatus: "restored" } });
    await expect(restoreDakotaRecord(queued!.archiveId, dependencies(operator, archive)))
      .resolves.toMatchObject({ transaction_status: "restored" });
  });

  it("bounds reconciliation work and abandons stale copies without offering them as restorable", async () => {
    const record = terminalRecord();
    const operator = new OperatorStore(record);
    operator.failWrites = 4;
    const archive = new ArchiveStore();
    await expect(
      archiveDakotaRecord(CANDIDATE_KEY, record.updated_at, dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveConflictError);
    const [queued] = await listDakotaArchiveReconciliationItems(archive, 1);
    expect(queued?.transactionStatus).toBe("copied");
    const laterDependencies: DakotaArchiveDependencies = {
      getOperatorStore: () => operator,
      getArchiveStore: () => archive,
      now: () => new Date(NOW.getTime() + 3 * 60 * 1000),
    };
    await expect(reconcileDakotaArchiveTransaction(queued!.archiveId, laterDependencies))
      .resolves.toMatchObject({ outcome: "abandoned" });
    await clearDakotaArchiveReconciliationRequest(queued!.archiveId, archive);
    await expect(listDakotaArchiveReconciliationItems(archive, 1)).resolves.toEqual([]);
    await expect(previewDakotaArchive(laterDependencies)).resolves.toMatchObject({ recoverable: [] });
  });

  it("sorts the full recoverable set before returning the newest fifty", async () => {
    const operator = new OperatorStore(null);
    const archive = new ArchiveStore();
    const archivedIds: string[] = [];
    for (let index = 0; index < 51; index += 1) {
      const archivedAt = new Date(NOW.getTime() + index * 60_000);
      const record = terminalRecord(`2026-08-01T12:${String(index).padStart(2, "0")}:00.000Z`);
      operator.data = createDakotaOperatorStateEnvelope({ [CANDIDATE_KEY]: record }, archivedAt.toISOString());
      operator.etag = `operator-seed-${index}`;
      const archived = await archiveDakotaRecord(CANDIDATE_KEY, record.updated_at, {
        getOperatorStore: () => operator,
        getArchiveStore: () => archive,
        now: () => archivedAt,
      });
      archivedIds.push(archived.archive_id);
    }
    const preview = await previewDakotaArchive(dependencies(operator, archive));
    expect(preview.archiveCount).toBe(51);
    expect(preview.recoverable).toHaveLength(50);
    expect(preview.recoverable[0]?.archiveId).toBe(archivedIds[50]);
    expect(preview.recoverable.some((item) => item.archiveId === archivedIds[0])).toBe(false);
  });

  it("rejects active or stale records and exposes an eligibility preview", async () => {
    const record = terminalRecord();
    const operator = new OperatorStore(record);
    const archive = new ArchiveStore();
    const preview = await previewDakotaArchive(dependencies(operator, archive));
    expect(preview).toMatchObject({ activeCount: 1, capacity: 500, archiveCount: 0, recoverable: [] });
    expect(preview.eligible).toEqual([expect.objectContaining({ candidateKey: CANDIDATE_KEY, status: "not_fit" })]);
    await expect(
      archiveDakotaRecord(CANDIDATE_KEY, "2026-07-01T00:00:00.000Z", dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveConflictError);

    const active = terminalRecord();
    active.status = "research_ready";
    operator.data = createDakotaOperatorStateEnvelope({ [CANDIDATE_KEY]: active }, NOW.toISOString());
    await expect(
      archiveDakotaRecord(CANDIDATE_KEY, active.updated_at, dependencies(operator, archive)),
    ).rejects.toBeInstanceOf(DakotaArchiveValidationError);
  });
});

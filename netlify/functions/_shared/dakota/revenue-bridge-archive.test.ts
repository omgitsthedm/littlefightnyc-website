import { describe, expect, it } from "vitest";

import {
  archiveDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_ARCHIVE_PREFIX,
  getDakotaRevenueBridgeArchiveEntry,
  restoreDakotaRevenueBridgeRecord,
  type DakotaRevenueBridgeArchiveDependencies,
} from "./revenue-bridge-archive";
import {
  createDakotaRevenueBridgeEnvelope,
  createEmptyDakotaRevenueBridgeRecord,
  DAKOTA_REVENUE_BRIDGE_KEY,
  type DakotaRevenueBridgeEnvelope,
} from "./revenue-bridge-schema";

const NOW = new Date("2026-08-03T12:00:00.000Z");
const CANDIDATE_KEY = "nys_dos:12345";
const ARCHIVE_ID = "a".repeat(40);

class MemoryStore {
  entries = new Map<string, { data: unknown; etag: string }>();
  writes = 0;
  failWrites = 0;

  async getWithMetadata(key: string) {
    const entry = this.entries.get(key);
    return entry ? { data: structuredClone(entry.data), etag: entry.etag, metadata: {} } : null;
  }

  async setJSON(key: string, value: unknown, options: Record<string, unknown> = {}) {
    const current = this.entries.get(key);
    if (this.failWrites > 0) {
      this.failWrites -= 1;
      return { modified: false };
    }
    if (options.onlyIfNew === true && current) return { modified: false };
    if (typeof options.onlyIfMatch === "string" && options.onlyIfMatch !== current?.etag) return { modified: false };
    this.writes += 1;
    const etag = `etag-${this.writes}`;
    this.entries.set(key, { data: structuredClone(value), etag });
    return { modified: true, etag };
  }
}

function envelope(): DakotaRevenueBridgeEnvelope {
  const record = createEmptyDakotaRevenueBridgeRecord("2026-08-03T11:00:00.000Z");
  record.research_review = {
    disposition: "not_fit",
    reason: "The public evidence did not show a useful fit.",
    reviewed_at: "2026-08-03T11:00:00.000Z",
  };
  return createDakotaRevenueBridgeEnvelope(
    { [CANDIDATE_KEY]: record },
    {},
    "2026-08-03T11:00:00.000Z",
  );
}

function setup() {
  const bridge = new MemoryStore();
  const archive = new MemoryStore();
  bridge.entries.set(DAKOTA_REVENUE_BRIDGE_KEY, { data: envelope(), etag: "bridge-1" });
  const dependencies: DakotaRevenueBridgeArchiveDependencies = {
    getBridgeStore: () => bridge,
    getArchiveStore: () => archive,
    now: () => NOW,
  };
  return { bridge, archive, dependencies };
}

describe("Dakota Revenue Bridge recoverable archive", () => {
  it("copies before removing active bridge capacity and restores the verified record", async () => {
    const { bridge, archive, dependencies } = setup();
    await expect(archiveDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "stored",
      status: "removed_from_active",
    });
    const archivedEnvelope = (bridge.entries.get(DAKOTA_REVENUE_BRIDGE_KEY)?.data as DakotaRevenueBridgeEnvelope);
    expect(archivedEnvelope.records).toEqual({});
    expect(archive.entries.has(`${DAKOTA_REVENUE_BRIDGE_ARCHIVE_PREFIX}${ARCHIVE_ID}`)).toBe(true);

    await expect(restoreDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "stored",
      status: "restored",
    });
    const restoredEnvelope = (bridge.entries.get(DAKOTA_REVENUE_BRIDGE_KEY)?.data as DakotaRevenueBridgeEnvelope);
    expect(restoredEnvelope.records[CANDIDATE_KEY]?.archive).toBeNull();
    expect(restoredEnvelope.records[CANDIDATE_KEY]?.research_review.disposition).toBe("not_fit");
    await expect(getDakotaRevenueBridgeArchiveEntry(ARCHIVE_ID, archive)).resolves.toMatchObject({ status: "restored" });
  });

  it("keeps the verified copy after bridge CAS conflicts and recovers on retry", async () => {
    const { bridge, archive, dependencies } = setup();
    bridge.failWrites = 5;
    await expect(archiveDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "conflict",
    });
    await expect(getDakotaRevenueBridgeArchiveEntry(ARCHIVE_ID, archive)).resolves.toMatchObject({ status: "copied" });

    await expect(archiveDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "stored",
      status: "removed_from_active",
    });
  });

  it("treats a core archive with no bridge record as an idempotent no-op", async () => {
    const { bridge, dependencies } = setup();
    const current = bridge.entries.get(DAKOTA_REVENUE_BRIDGE_KEY)!;
    current.data = createDakotaRevenueBridgeEnvelope({}, {}, "2026-08-03T11:00:00.000Z");
    await expect(archiveDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "unchanged",
      status: "removed_from_active",
    });
    await expect(restoreDakotaRevenueBridgeRecord(CANDIDATE_KEY, ARCHIVE_ID, dependencies)).resolves.toMatchObject({
      outcome: "unchanged",
      status: "restored",
    });
  });
});

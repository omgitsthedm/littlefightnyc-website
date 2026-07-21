// cleanup-expired.mts — Scheduled function to delete expired audit reports
// Runs daily at 3:00 AM UTC. Lists all audit-meta entries, finds reports
// past their 30-day expiration, and purges HTML + views + status + meta blobs.

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async () => {
  const metaStore = getStore("audit-meta");
  const pageStore = getStore("audit-pages");
  const viewStore = getStore("audit-views");
  const statusStore = getStore("audit-status");

  const now = new Date();
  let deleted = 0;

  // List all audit-meta entries
  const listing = await metaStore.list();
  console.log(`[cleanup] Found ${listing.blobs.length} audit(s) to check`);

  for (const entry of listing.blobs) {
    try {
      const meta = (await metaStore.get(entry.key, { type: "json" })) as {
        expiresAt?: string;
        domain?: string;
        companyName?: string;
      } | null;

      if (!meta?.expiresAt) continue;

      const expiresAt = new Date(meta.expiresAt);
      if (expiresAt > now) continue;

      // Report has expired — purge from all stores
      console.log(
        `[cleanup] Expiring: ${entry.key} (${meta.companyName || meta.domain || "unknown"}) — expired ${meta.expiresAt}`,
      );

      await Promise.allSettled([
        pageStore.delete(entry.key),
        viewStore.delete(entry.key),
        statusStore.delete(entry.key),
        metaStore.delete(entry.key),
      ]);

      deleted++;
    } catch (err) {
      console.error(`[cleanup] Error processing ${entry.key}:`, err);
    }
  }

  console.log(
    `[cleanup] Done: checked ${listing.blobs.length}, deleted ${deleted}`,
  );
};

export const config: Config = {
  schedule: "0 3 * * *", // Daily at 3:00 AM UTC
};

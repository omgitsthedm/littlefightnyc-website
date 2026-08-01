// cleanup-expired.mts — Scheduled function to delete expired audit reports
// Runs daily at 3:00 AM UTC. Lists all audit-meta entries, finds reports
// past their 30-day expiration, and purges HTML + views + status + meta blobs.
// It also removes orphaned one-time background-job tokens.

import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import {
  purgeExpiredAuditLeads,
  safeDatabaseErrorLabel,
} from "./lib/audit-leads.mts";

// One window's grace past the 24h rate-limit window in run-audit.mts, so a
// counter is never dropped while it is still governing a live limit.
const RATE_LIMIT_RETENTION_MS = 48 * 60 * 60 * 1000;

export default async () => {
  const now = new Date();

  // Scheduled functions have a short runtime ceiling, so run the bounded
  // database deletion before the potentially long Blob listings. Keep it
  // best-effort so a database outage cannot block the independent Blob work.
  try {
    const deletedLeads = await purgeExpiredAuditLeads(now);
    console.log(`[cleanup] Audit leads: deleted ${deletedLeads} expired record(s)`);
  } catch (err) {
    console.error(
      `[cleanup] Audit lead retention cleanup failed (${safeDatabaseErrorLabel(err)})`,
    );
  }

  const metaStore = getStore("audit-meta");
  const pageStore = getStore("audit-pages");
  const viewStore = getStore("audit-views");
  const statusStore = getStore("audit-status");
  const jobStore = getStore("audit-jobs");
  // audit-engagement records how far each recipient read their report. It is
  // keyed by the same slug, so it must die with the report — otherwise the
  // behavioural profile of the person who read it survives the deletion the
  // site advertises, and the URL returns 410 while the record lives on.
  const engagementStore = getStore("audit-engagement");

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
        engagementStore.delete(entry.key),
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

  const jobs = await jobStore.list();
  let deletedJobs = 0;
  for (const entry of jobs.blobs) {
    try {
      const job = (await jobStore.get(entry.key, { type: "json" })) as {
        expiresAt?: string;
      } | null;
      if (!job?.expiresAt || new Date(job.expiresAt) <= now) {
        await jobStore.delete(entry.key);
        deletedJobs++;
      }
    } catch (err) {
      console.error(`[cleanup] Error processing job ${entry.key}:`, err);
    }
  }
  console.log(
    `[cleanup] Job tokens: checked ${jobs.blobs.length}, deleted ${deletedJobs}`,
  );

  // Rate-limit counters govern a 24h window, so an entry older than that has no
  // remaining purpose. Nothing purged this store before, which meant a
  // per-visitor record accumulated forever for a check that stopped mattering
  // after a day. Keys are hashed now (run-audit.mts), but retaining them
  // indefinitely would still be keeping data with no reason to exist.
  const rateLimitStore = getStore({ name: "rate-limits", consistency: "strong" });
  const rateCutoff = new Date(now.getTime() - RATE_LIMIT_RETENTION_MS);
  const rateLimits = await rateLimitStore.list();
  let deletedRateLimits = 0;
  for (const entry of rateLimits.blobs) {
    try {
      const record = (await rateLimitStore.get(entry.key, { type: "json" })) as {
        window_start?: string;
      } | null;
      const started = record?.window_start ? new Date(record.window_start) : null;
      // Unparseable or missing window_start means we cannot prove it is still
      // in use, and the window is only 24h — drop it rather than keep it.
      if (!started || Number.isNaN(started.getTime()) || started <= rateCutoff) {
        await rateLimitStore.delete(entry.key);
        deletedRateLimits++;
      }
    } catch (err) {
      console.error(`[cleanup] Error processing rate limit ${entry.key}:`, err);
    }
  }
  console.log(
    `[cleanup] Rate limits: checked ${rateLimits.blobs.length}, deleted ${deletedRateLimits}`,
  );
};

export const config: Config = {
  schedule: "0 3 * * *", // Daily at 3:00 AM UTC
};

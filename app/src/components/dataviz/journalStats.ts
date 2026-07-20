/* Shared journal-derived stats — computed ONCE at module scope from the real
 * journal.json content. No fabricated numbers: reading time is words/200 of
 * the actual post html; dates come from the authored published/updated
 * strings and are parsed DEFENSIVELY (a malformed date yields null, never a
 * crash — there was a prior prod incident from naive date parsing). */
import journal from "@/data/journal-index.json";

type JournalEntry = {
  slug: string;
  published?: string;
  updated?: string;
  wordCount?: number;
};

const posts = journal as unknown as JournalEntry[];

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

/** Deterministic month labels — never toLocaleString (SSR/WebKit divergence). */
const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/**
 * Parse a prose date like "July 12, 2026". Returns null for anything that
 * doesn't resolve to a real calendar day — empty strings, non-strings,
 * unknown month names, overflow days ("February 31"), or garbage. The
 * Date.parse fallback is NaN-guarded and year-sanity-checked.
 */
function parseProseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;

  const match = /^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/.exec(text);
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    if (month === undefined) return null;
    const day = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month, day);
    // new Date rolls overflow forward (Feb 31 -> Mar 3) — reject that.
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
      ? date
      : null;
  }

  const time = Date.parse(text);
  if (Number.isNaN(time)) return null;
  const date = new Date(time);
  const year = date.getFullYear();
  return year >= 1990 && year <= 2100 ? date : null;
}

/** Real word count per post slug — precomputed from the post's own html by
 * scripts/split-journal.mjs (same logic, so reading times are unchanged) and
 * baked into journal-index.json to keep the ~250KB of bodies off this chunk. */
export const WORD_COUNT: Record<string, number> = {};

/** Honest reading time per post slug: max(1, round(words / 200)). */
export const READ_MINUTES: Record<string, number> = {};

for (const post of posts) {
  const words = typeof post.wordCount === "number" ? post.wordCount : 0;
  WORD_COUNT[post.slug] = words;
  READ_MINUTES[post.slug] = Math.max(1, Math.round(words / 200));
}

/* ============================================================
   Publishing-activity model (consumed by PublishingHeatmap —
   kept here so the component file only exports a component).
   ============================================================ */

type PulseEntry = { published?: string; updated?: string };

/* ============================================================
   Monthly publishing cadence — a per-day contribution grid reads
   as "dead" when posts are batch-published (this journal has real
   activity on only ~5 days), so the /journal band shows entries per
   month instead: honest counts, and the rhythm building to the
   relaunch actually reads as an active publication.
   ============================================================ */

type MonthBar = { key: string; label: string; count: number; peak: boolean };

type MonthlyModel = {
  year: number;
  totalDated: number;
  undated: number;
  months: MonthBar[];
  peakLabel: string;
};

export function buildMonthlyModel(entries: PulseEntry[]): MonthlyModel {
  // One bucket per entry, keyed by its published month (updated as fallback).
  const byMonth = new Map<number, number>();
  let undated = 0;
  let totalDated = 0;
  let minMonth = Infinity;
  let maxMonth = -Infinity;
  let year = 0;

  for (const entry of entries) {
    const date = parseProseDate(entry.published) ?? parseProseDate(entry.updated);
    if (!date) {
      undated += 1;
      continue;
    }
    totalDated += 1;
    const m = date.getMonth();
    byMonth.set(m, (byMonth.get(m) ?? 0) + 1);
    if (m < minMonth) minMonth = m;
    if (m > maxMonth) maxMonth = m;
    if (date.getFullYear() > year) year = date.getFullYear();
  }

  if (maxMonth < 0) {
    return { year: year || new Date(2026, 0, 1).getFullYear(), totalDated: 0, undated, months: [], peakLabel: "" };
  }

  // Show from the first active month through the last (the real window), so
  // the bars form a cadence instead of a mostly-empty 12-slot axis.
  const months: MonthBar[] = [];
  let peak = -1;
  let peakLabel = "";
  for (let m = minMonth; m <= maxMonth; m += 1) {
    const count = byMonth.get(m) ?? 0;
    if (count > peak) {
      peak = count;
      peakLabel = MONTH_ABBR[m];
    }
    months.push({ key: `${year}-${m}`, label: MONTH_ABBR[m], count, peak: false });
  }
  for (const bar of months) bar.peak = bar.label === peakLabel && bar.count === peak;

  return { year, totalDated, undated, months, peakLabel };
}

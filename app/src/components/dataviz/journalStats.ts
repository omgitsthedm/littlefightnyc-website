/* Shared journal-derived stats — computed ONCE at module scope from the real
 * journal.json content. No fabricated numbers: reading time is words/200 of
 * the actual post html; dates come from the authored published/updated
 * strings and are parsed DEFENSIVELY (a malformed date yields null, never a
 * crash — there was a prior prod incident from naive date parsing). */
import journal from "@/data/journal.json";

type JournalEntry = {
  slug: string;
  published?: string;
  updated?: string;
  html?: string;
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
export const MONTH_ABBR = [
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
export function parseProseDate(value: unknown): Date | null {
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

function countWords(html: unknown): number {
  if (typeof html !== "string") return 0;
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

/** Real word count per post slug, from the post's own html. */
export const WORD_COUNT: Record<string, number> = {};

/** Honest reading time per post slug: max(1, round(words / 200)). */
export const READ_MINUTES: Record<string, number> = {};

for (const post of posts) {
  const words = countWords(post.html);
  WORD_COUNT[post.slug] = words;
  READ_MINUTES[post.slug] = Math.max(1, Math.round(words / 200));
}

/* ============================================================
   Publishing-activity model (consumed by PublishingHeatmap —
   kept here so the component file only exports a component).
   ============================================================ */

type PulseEntry = { published?: string; updated?: string };

type DayActivity = { published: number; updated: number };

export type PulseCellLevel = 0 | 1 | 2 | 3 | 4;

export type PulseCell = {
  key: string;
  title?: string;
  level: PulseCellLevel;
  inYear: boolean;
};

export type PulseModel = {
  year: number;
  totalEntries: number;
  undated: number;
  activeDays: number;
  weeks: PulseCell[][];
  monthLabels: { label: string; week: number }[];
  lastActiveWeek: number;
};

const dayNum = (d: Date) =>
  d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();

const dateLabel = (d: Date) =>
  `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// Intensity buckets — the Jul-12 relaunch day (25 entries) must not wash out
// every other day, so buckets, not linear scaling.
function level(count: number): PulseCellLevel {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function buildPulseModel(entries: PulseEntry[]): PulseModel {
  const byDay = new Map<number, DayActivity>();
  let undated = 0;
  let latest: Date | null = null;

  for (const entry of entries) {
    const pub = parseProseDate(entry.published);
    const upd = parseProseDate(entry.updated);
    if (!pub && !upd) {
      undated += 1;
      continue;
    }
    const events: { date: Date; kind: keyof DayActivity }[] = [];
    if (pub) events.push({ date: pub, kind: "published" });
    // An update on the publish day is one event, not two.
    if (upd && (!pub || dayNum(upd) !== dayNum(pub))) {
      events.push({ date: upd, kind: "updated" });
    }
    for (const event of events) {
      const key = dayNum(event.date);
      const day = byDay.get(key) ?? { published: 0, updated: 0 };
      day[event.kind] += 1;
      byDay.set(key, day);
      if (!latest || event.date > latest) latest = event.date;
    }
  }

  const year = (latest ?? new Date()).getFullYear();

  // Sundays-start grid covering the whole year.
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(year, 11, 31);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const weeks: PulseCell[][] = [];
  const monthLabels: { label: string; week: number }[] = [];
  let activeDays = 0;
  let lastActiveWeek = 0;
  let seenMonth = -1;

  for (let cursor = new Date(start); cursor <= end; ) {
    const week: PulseCell[] = [];
    for (let i = 0; i < 7; i += 1) {
      const inYear = cursor.getFullYear() === year;
      const day = inYear ? byDay.get(dayNum(cursor)) : undefined;
      const count = day ? day.published + day.updated : 0;
      if (day) {
        activeDays += 1;
        lastActiveWeek = weeks.length;
      }
      if (inYear && cursor.getDate() === 1 && cursor.getMonth() !== seenMonth) {
        seenMonth = cursor.getMonth();
        monthLabels.push({ label: MONTH_ABBR[seenMonth], week: weeks.length });
      }
      let title: string | undefined;
      if (inYear) {
        if (day) {
          const parts: string[] = [];
          if (day.published) parts.push(`${day.published} published`);
          if (day.updated) parts.push(`${day.updated} updated`);
          title = `${dateLabel(cursor)} — ${parts.join(" · ")}`;
        } else {
          title = `${dateLabel(cursor)} — no entries`;
        }
      }
      week.push({
        key: `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`,
        title,
        level: level(count),
        inYear,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return {
    year,
    totalEntries: entries.length,
    undated,
    activeDays,
    weeks,
    monthLabels,
    lastActiveWeek,
  };
}

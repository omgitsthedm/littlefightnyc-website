/* Shared journal-derived stats — computed once at module scope from the real
 * journal index. No fabricated numbers: reading time is words/200 of the
 * authored post content. */
import journal from "@/data/journal-index.json";

type JournalEntry = {
  slug: string;
  wordCount?: number;
};

const posts = journal as unknown as JournalEntry[];

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

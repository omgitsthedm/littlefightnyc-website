export type AuthoredDate = {
  label: string;
  iso: string;
};

/**
 * Normalize an authored date without manufacturing a fallback.
 *
 * Missing or invalid values return null so UI and schema can omit the claim.
 * The original label remains visible while the machine-readable value is ISO.
 */
export function authoredDate(value: string | null | undefined): AuthoredDate | null {
  const label = value?.trim();
  if (!label) return null;

  const parsed = new Date(label);
  if (Number.isNaN(parsed.getTime())) return null;

  // A bare authored date ("March 4, 2026") parses as local midnight, and
  // toISOString() then converts to UTC — so a reader east of UTC saw every
  // post dated a day early in <time datetime> and JSON-LD. Re-anchor the
  // parsed Y/M/D to UTC so the ISO value is the date the author wrote, in
  // every timezone. Mirrored in scripts/metadata-source.mjs for the build.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(label)
    ? label
    : new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()))
        .toISOString()
        .slice(0, 10);

  return { label, iso };
}

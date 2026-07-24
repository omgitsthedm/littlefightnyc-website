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

  return {
    label,
    iso: parsed.toISOString().slice(0, 10),
  };
}

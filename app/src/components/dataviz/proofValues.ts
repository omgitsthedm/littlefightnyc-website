/**
 * proofValues — shared value parsing for the proof instruments.
 *
 * Pure helpers live here (not in the component files) so the dataviz
 * components stay fast-refresh clean.
 */

/** Splits a numeric display value into its leading text, number, and suffix; null when digit-free. */
export function splitLeadingNumber(text: string): [string, number, string] | null {
  const match = text.match(/^(\D*)(\d+)([\s\S]*)$/);
  if (!match) return null;
  return [match[1], Number.parseInt(match[2], 10), match[3]];
}

/**
 * True when a metric is a score on a real published scale — today that means
 * pure-digit values whose label names a Lighthouse audit (scale 0-100).
 */
export function isScoreValue(value: string, label: string) {
  return /^\d+$/.test(value) && /lighthouse/i.test(label);
}

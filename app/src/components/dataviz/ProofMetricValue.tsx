import { CountUp } from "./CountUp";
import { ScoreGauge } from "./ScoreGauge";
import { isScoreValue } from "./proofValues";

/**
 * ProofMetricValue — picks the honest rendering for a verified metric value.
 *
 * - Lighthouse scores (real 0-100 scale, see isScoreValue) → ScoreGauge ring.
 * - Every other value → CountUp, which itself stays still for digit-free
 *   strings ("Square", "Live") and for vanity-sized numbers.
 *
 * Values always come from the case-study record; nothing is re-authored here.
 */
export function ProofMetricValue({ value, label }: { value: string; label: string }) {
  if (isScoreValue(value, label)) return <ScoreGauge value={value} />;
  return <CountUp text={value} />;
}

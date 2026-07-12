import type { LucideIcon } from "lucide-react";
import { useCountUp } from "@/components/dataviz/useCountUp";
import { useScrollReveal } from "./useScrollReveal";
import "./StatBlock.css";

/**
 * StatBlock — a compact row of numbers (promises, outcomes, metrics) so a
 * text-heavy page has a scannable, quantified beat. Reused on About,
 * service, and case pages. Reveal via the global data-reveal rule.
 */

/** The counting leading number of a stat value ("14" of "14-day"). */
function LeadingCount({ value, delay }: { value: number; delay: number }) {
  const { ref, value: shown } = useCountUp<HTMLSpanElement>(value, {
    duration: 900,
    delay,
  });
  return <span ref={ref}>{shown}</span>;
}

/** Values that START with digits count up their leading number ("100",
 * "2 weeks" → the 2); word-shaped values ("Free", "Next.js 14") stay static. */
function StatValue({ value, delay }: { value: string; delay: number }) {
  const m = /^(\d+)([\s\S]*)$/.exec(value);
  if (!m) return <>{value}</>;
  return (
    <>
      <LeadingCount value={parseInt(m[1], 10)} delay={delay} />
      {m[2]}
    </>
  );
}
export default function StatBlock({
  eyebrow,
  icon: Icon,
  items,
}: {
  eyebrow?: string;
  icon?: LucideIcon;
  items: Array<{ value: string; label: string }>;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={ref}
      className="lf-stats"
      data-reveal
      data-revealed="false"
      aria-label={eyebrow ?? "By the numbers"}
    >
      {eyebrow && (
        <p className="lf-stats__eyebrow">
          {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
          {eyebrow}
        </p>
      )}
      <dl className="lf-stats__grid" data-count={items.length}>
        {items.map((s, i) => (
          <div key={s.label} className="lf-stats__item">
            <dt className="lf-stats__value" data-long={s.value.length > 7 || undefined}>
              <StatValue value={s.value} delay={i * 90} />
            </dt>
            <dd className="lf-stats__label">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

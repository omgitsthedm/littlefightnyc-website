import { useScrollReveal } from "./useScrollReveal";
import "./StatBlock.css";

/**
 * StatBlock — a compact row of numbers (promises, outcomes, metrics) so a
 * text-heavy page has a scannable, quantified beat. Reused on About,
 * service, and case pages. Reveal via the global data-reveal rule.
 */
export default function StatBlock({
  eyebrow,
  items,
}: {
  eyebrow?: string;
  items: Array<{ value: string; label: string }>;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  if (!items || items.length === 0) return null;

  return (
    <section ref={ref} className="lf-stats" data-reveal aria-label={eyebrow ?? "By the numbers"}>
      {eyebrow && <p className="lf-stats__eyebrow">{eyebrow}</p>}
      <dl className="lf-stats__grid" data-count={items.length}>
        {items.map((s) => (
          <div key={s.label} className="lf-stats__item">
            <dt className="lf-stats__value">{s.value}</dt>
            <dd className="lf-stats__label">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

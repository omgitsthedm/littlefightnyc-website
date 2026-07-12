import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./FunnelBars.css";

/**
 * FunnelBars — proportional horizontal bars with mono counts. Bars scale in
 * from zero on scroll, staggered. Optional mono chip row underneath for a
 * companion fact. Zero dependencies, tokens only. Reduced motion: final state.
 */

export type FunnelItem = {
  label: string;
  value: number;
  /** Override the printed count (defaults to value). */
  display?: string;
};

export default function FunnelBars({
  label,
  summary,
  eyebrow,
  caption,
  items,
  chip,
  className,
}: {
  /** Short accessible name for the figure. */
  label: string;
  /** Full text equivalent — visually hidden, same facts. */
  summary: string;
  eyebrow?: string;
  caption?: string;
  items: FunnelItem[];
  /** Companion fact rendered as a mono chip below the bars. */
  chip?: string;
  className?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1;

  return (
    <figure
      ref={ref}
      className={`lf-funnel${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      <p className="lf-viz-sr">{summary}</p>
      {eyebrow && <p className="lf-funnel__eyebrow">{eyebrow}</p>}
      <div className="lf-funnel__rows" aria-hidden="true">
        {items.map((item, i) => (
          <div key={item.label} className="lf-funnel__row" style={{ ["--lf-i" as string]: i }}>
            <span className="lf-funnel__label">{item.label}</span>
            <span className="lf-funnel__track">
              <span
                className="lf-funnel__bar"
                style={{ width: `${Math.max((item.value / max) * 100, 1.5)}%` }}
              />
            </span>
            <span className="lf-funnel__count">{item.display ?? item.value}</span>
          </div>
        ))}
      </div>
      {chip && <p className="lf-funnel__chip">{chip}</p>}
      {caption && <figcaption className="lf-funnel__caption">{caption}</figcaption>}
    </figure>
  );
}

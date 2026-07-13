import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { useCountUp } from "./useCountUp";
import "./ScoreRing.css";

/**
 * ScoreRing — SVG circle gauges. The stroke fills 0 → value on scroll via a
 * stroke-dashoffset transition; `value: null` renders an empty outline gauge
 * (for "your numbers get filled in" states). Mono caption under the cluster.
 * Zero dependencies, tokens only. Reduced motion: final state instantly.
 */

const R = 40;
const C = 2 * Math.PI * R;

/** Center numeral — counts 0 → value in step with the ring's stroke fill. */
function RingValue({ value, delay }: { value: number; delay: number }) {
  const { ref, value: shown } = useCountUp<HTMLSpanElement>(value, {
    duration: 1100,
    delay,
  });
  return <span ref={ref}>{shown}</span>;
}

export type Ring = {
  label: string;
  /** 0–max, or null for an empty outline gauge. */
  value: number | null;
  max?: number;
  /** Override the number shown in the center (defaults to value / em dash). */
  display?: string;
};

export default function ScoreRing({
  label,
  summary,
  caption,
  badge,
  items,
  className,
}: {
  /** Short accessible name for the figure. */
  label: string;
  /** Full text equivalent — visually hidden, same facts. */
  summary: string;
  caption?: string;
  /** Small mono flag above the cluster (e.g. "Sample" for illustrative data). */
  badge?: string;
  items: Ring[];
  className?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <figure
      ref={ref}
      className={`lf-rings${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
      data-revealed="false"
    >
      <p className="lf-viz-sr">{summary}</p>
      {badge && (
        // aria-hidden: the sample-ness is already stated in summary + caption.
        <span className="lf-rings__badge" aria-hidden="true">
          {badge}
        </span>
      )}
      <div className="lf-rings__cluster" aria-hidden="true">
        {items.map((ring, i) => {
          const empty = ring.value == null;
          const frac = empty ? 0 : Math.max(0, Math.min(1, (ring.value as number) / (ring.max ?? 100)));
          return (
            <div
              key={ring.label}
              className="lf-rings__item"
              data-empty={empty || undefined}
              style={{ ["--lf-i" as string]: i }}
            >
              <div className="lf-rings__dial">
                <svg viewBox="0 0 96 96" focusable="false">
                  <circle className="lf-rings__rail" cx="48" cy="48" r={R} />
                  {!empty && (
                    <circle
                      className="lf-rings__fill"
                      cx="48"
                      cy="48"
                      r={R}
                      strokeDasharray={C}
                      style={{ ["--lf-ring-off" as string]: C * (1 - frac) }}
                    />
                  )}
                </svg>
                <span className="lf-rings__value">
                  {empty ? (
                    ring.display ?? "—"
                  ) : (
                    ring.display ?? (
                      <RingValue
                        value={ring.value as number}
                        delay={180 + i * 110}
                      />
                    )
                  )}
                </span>
              </div>
              <span className="lf-rings__label">{ring.label}</span>
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="lf-rings__caption">{caption}</figcaption>}
    </figure>
  );
}

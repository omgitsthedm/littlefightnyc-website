import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./TimelineStrip.css";

/**
 * TimelineStrip — a horizontal beat strip (vertical below 640px, or forced
 * via `vertical`): a drawn track, ticks, labeled beats, one orange marker
 * beat, and an optional terminal badge. Zero dependencies, tokens only.
 * Reduced motion: final state instantly.
 */

export type TimelineBeat = {
  label: string;
  sub?: string;
  /** The orange marker beat — the promise. */
  marker?: boolean;
};

export default function TimelineStrip({
  label,
  summary,
  caption,
  beats,
  badge,
  vertical = false,
  className,
}: {
  /** Short accessible name for the figure. */
  label: string;
  /** Full text equivalent — visually hidden, same facts. */
  summary: string;
  caption?: string;
  beats: TimelineBeat[];
  /** Terminal badge pinned after the last beat. */
  badge?: string;
  /** Force vertical layout (e.g. inside a narrow aside). */
  vertical?: boolean;
  className?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <figure
      ref={ref}
      className={`lf-tls${vertical ? " lf-tls--vertical" : ""}${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      <p className="lf-viz-sr">{summary}</p>
      <div className="lf-tls__body" aria-hidden="true">
        <span className="lf-tls__track" />
        <ol className="lf-tls__beats">
          {beats.map((beat, i) => (
            <li
              key={beat.label}
              className="lf-tls__beat"
              data-marker={beat.marker || undefined}
              style={{ ["--lf-i" as string]: i }}
            >
              <span className="lf-tls__dot" />
              <span className="lf-tls__beat-label">{beat.label}</span>
              {beat.sub && <span className="lf-tls__beat-sub">{beat.sub}</span>}
            </li>
          ))}
          {badge && (
            <li className="lf-tls__beat lf-tls__beat--badge" style={{ ["--lf-i" as string]: beats.length }}>
              <span className="lf-tls__badge">{badge}</span>
            </li>
          )}
        </ol>
      </div>
      {caption && <figcaption className="lf-tls__caption">{caption}</figcaption>}
    </figure>
  );
}

import { useEffect, useRef } from "react";
import journal from "@/data/journal-index.json";
import { buildPulseModel, type PulseCellLevel } from "./journalStats";
import "./PublishingHeatmap.css";

/**
 * PublishingHeatmap — a GitHub-contribution-style weeks × days grid of the
 * journal's REAL publishing activity, computed at module scope from the
 * authored published/updated dates in journal.json (model logic lives in
 * journalStats.buildPulseModel). Malformed or missing dates render as
 * "undated" in the count line — they never crash the grid (parseProseDate
 * is the defensive gate). Decorative-informative: the band carries one
 * aria-label + a visually-hidden text summary; the ~370 cells are
 * presentational (title tooltips only, not focusable).
 */

// Real data, computed once at module scope.
const MODEL = buildPulseModel(
  journal as unknown as { published?: string; updated?: string }[],
);

const LEGEND_LEVELS: PulseCellLevel[] = [0, 1, 2, 3, 4];

export default function PublishingHeatmap() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // On narrow screens the grid overflows — land on the most recent activity.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    const cell = el.querySelector<HTMLElement>(".lf-pulse__week");
    const weekWidth = cell ? cell.offsetWidth + 3 : 11;
    el.scrollLeft = Math.max(0, (MODEL.lastActiveWeek + 2) * weekWidth - el.clientWidth);
  }, []);

  const summary =
    `Publishing activity ${MODEL.year}: ${MODEL.totalEntries} journal entries, ` +
    `with activity on ${MODEL.activeDays} days` +
    (MODEL.undated > 0 ? `; ${MODEL.undated} entries carry no date` : "") +
    ".";

  return (
    <section className="lf-pulse" aria-label={`Publishing activity ${MODEL.year}`}>
      <div className="lf-pulse__inner">
        <div className="lf-pulse__head">
          <p className="lf-pulse__label">
            Publishing activity · {MODEL.year}
          </p>
          <p className="lf-pulse__count">
            {MODEL.totalEntries} entries
            {MODEL.undated > 0 ? ` · ${MODEL.undated} undated` : ""}
          </p>
        </div>
        <p className="lf-viz-sr">{summary}</p>
        <div
          ref={scrollRef}
          className="lf-pulse__scroll"
          /* scrollable region must be keyboard-reachable (axe:
             scrollable-region-focusable) */
          tabIndex={0}
          role="region"
          aria-label="Publishing activity grid (scrollable)"
        >
          <div
            className="lf-pulse__chart"
            role="img"
            aria-label={summary}
            style={{ ["--pulse-weeks" as string]: MODEL.weeks.length }}
          >
            <div className="lf-pulse__months" aria-hidden="true">
              {MODEL.monthLabels.map((m) => (
                <span key={m.label} style={{ gridColumnStart: m.week + 1 }}>
                  {m.label}
                </span>
              ))}
            </div>
            <div className="lf-pulse__grid" aria-hidden="true">
              {MODEL.weeks.map((week, wi) => (
                <div key={wi} className="lf-pulse__week">
                  {week.map((cell) => (
                    <span
                      key={cell.key}
                      className="lf-pulse__cell"
                      data-level={cell.level}
                      data-out={!cell.inYear || undefined}
                      title={cell.title}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lf-pulse__legend" aria-hidden="true">
          <span>Less</span>
          {LEGEND_LEVELS.map((l) => (
            <span key={l} className="lf-pulse__cell" data-level={l} />
          ))}
          <span>More</span>
        </div>
      </div>
    </section>
  );
}

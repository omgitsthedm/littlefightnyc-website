import journal from "@/data/journal-index.json";
import { buildMonthlyModel } from "./journalStats";
import "./PublishingHeatmap.css";

/**
 * PublishingHeatmap — publishing cadence by month, computed at module scope
 * from the authored published/updated dates in journal-index.json. A per-day
 * GitHub grid read as "dead" here because posts are batch-published on only a
 * handful of days; per-month bars show the same real counts as an actual
 * rhythm building to the relaunch. Decorative-informative: one aria-label +
 * a visually-hidden summary; the bars are presentational.
 */
const MODEL = buildMonthlyModel(
  journal as unknown as { published?: string; updated?: string }[],
);

const MAX = Math.max(1, ...MODEL.months.map((m) => m.count));

export default function PublishingHeatmap() {
  const summary =
    `Publishing cadence ${MODEL.year}: ${MODEL.totalDated} dated journal entries` +
    (MODEL.peakLabel ? `, peaking in ${MODEL.peakLabel}` : "") +
    (MODEL.undated > 0 ? `; ${MODEL.undated} carry no date` : "") +
    ".";

  return (
    <section className="lf-pulse" aria-label={`Publishing activity ${MODEL.year}`}>
      <div className="lf-pulse__inner">
        <div className="lf-pulse__head">
          <p className="lf-pulse__label">Publishing activity · {MODEL.year}</p>
          <p className="lf-pulse__count">
            {MODEL.totalDated} entries
            {MODEL.undated > 0 ? ` · ${MODEL.undated} undated` : ""}
          </p>
        </div>
        <p className="lf-viz-sr">{summary}</p>
        <div className="lf-pulse__bars" role="img" aria-label={summary}>
          {MODEL.months.map((m) => (
            <span
              key={m.key}
              className="lf-pulse__bar-cell"
              data-peak={m.peak || undefined}
              title={`${m.label} ${MODEL.year} — ${m.count} ${m.count === 1 ? "entry" : "entries"}`}
            >
              <span className="lf-pulse__bar-count" aria-hidden="true">
                {m.count}
              </span>
              <span className="lf-pulse__bar-track" aria-hidden="true">
                <span
                  className="lf-pulse__bar"
                  style={{ ["--h" as string]: `${Math.round((m.count / MAX) * 100)}%` }}
                />
              </span>
              <span className="lf-pulse__bar-label" aria-hidden="true">
                {m.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

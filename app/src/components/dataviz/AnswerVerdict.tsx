import { Check, X } from "lucide-react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import type { AnswerVerdict as Verdict } from "@/data/answersArt";
import "./AnswerVerdict.css";

/**
 * AnswerVerdict — the comparison guides' two-road table. Renders the contrast
 * the guide's own copy already draws as a good-if / skip-if card pair. All
 * strings come from src/data/answersArt.ts, where each line is tightened from
 * the authored sections in site.ts — this component invents nothing and
 * declares no winner. Reveal-once via useScrollReveal; reduced motion renders
 * the final state.
 */
export default function AnswerVerdict({ verdict }: { verdict: Verdict }) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.12 });

  return (
    <section className="lf-verdict" ref={ref} aria-label="The verdict, side by side">
      <p className="lf-verdict__kicker">{verdict.kicker}</p>
      <div className="lf-verdict__grid">
        {verdict.columns.map((column, i) => (
          <article
            key={column.name}
            className="lf-verdict__card"
            style={{ ["--lf-i" as string]: i }}
          >
            <h3 className="lf-verdict__name">{column.name}</h3>

            <p className="lf-verdict__rule lf-verdict__rule--good">Good if</p>
            <ul className="lf-verdict__list">
              {column.goodIf.map((line) => (
                <li key={line} className="lf-verdict__line">
                  <span className="lf-verdict__mark lf-verdict__mark--good" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <p className="lf-verdict__rule lf-verdict__rule--skip">Skip if</p>
            <ul className="lf-verdict__list">
              {column.skipIf.map((line) => (
                <li key={line} className="lf-verdict__line lf-verdict__line--skip">
                  <span className="lf-verdict__mark lf-verdict__mark--skip" aria-hidden="true">
                    <X size={13} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      {verdict.note && <p className="lf-verdict__note">{verdict.note}</p>}
    </section>
  );
}

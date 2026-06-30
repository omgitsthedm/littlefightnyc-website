import { Link } from "react-router-dom";
import EditorialFigure from "./EditorialFigure";
import "./DispatchStory.css";

export default function DispatchStory() {
  return (
    <article className="lf-dispatch" aria-labelledby="lf-dispatch-heading">
      <div className="lf-container">
        <header className="lf-dispatch__head">
          <p className="lf-mono lf-dispatch__eyebrow">
            <span className="lf-dispatch__eyebrow-label">From the Field</span>
            <span className="lf-dispatch__eyebrow-divider" aria-hidden="true">·</span>
            <span className="lf-dispatch__eyebrow-no">Dispatch No. 03</span>
          </p>

          <h2 id="lf-dispatch-heading" className="lf-display lf-dispatch__title">
            The neighborhood pharmacy that was<br className="lf-dispatch__br" />
            <span className="lf-italic">losing to the chain across the street.</span>
          </h2>
        </header>

        <div className="lf-dispatch__layout">
          <EditorialFigure
            className="lf-dispatch__figure"
            src="/assets/local-business-base.webp"
            alt="A neighborhood pharmacy in New York City"
            width={1200}
            height={900}
            caption="An independent pharmacy on the Lower East Side. Family-owned. Forty years on the block."
          />

          <div className="lf-dispatch__body">
            <p className="lf-dispatch__paragraph">
              When the chain opened across the street, the pharmacy lost a
              quarter of its foot traffic in eight weeks. The website was
              eight years old. The booking link did not work. Google showed
              the chain first because the pharmacy's profile was incomplete.
            </p>

            <p className="lf-dispatch__paragraph">
              We kept the prescription system — it worked, the staff knew it,
              and switching would have cost two weeks of overlap. We rebuilt
              the website around what the chain could not match: same-day
              delivery, real human pharmacists, the neighborhood. We cleaned
              up the Google profile in an afternoon. We connected the call
              line to a follow-up workflow so missed calls became callbacks.
            </p>

            <p className="lf-dispatch__paragraph">
              Six months later, foot traffic was back, online refills had
              quadrupled, and three new local patients were arriving each
              week from "pharmacist near me" searches. The chain is still
              across the street. The pharmacy is still on the block.
            </p>

            <p className="lf-mono lf-dispatch__outcome">
              <span className="lf-dispatch__outcome-label">Outcome</span>
              <span className="lf-dispatch__outcome-text">
                Kept: prescription system. Connected: calls → follow-up.
                Replaced: website. Built: nothing extra.
              </span>
            </p>

            <Link to="/field-guide/#studies" className="lf-mono lf-dispatch__more">
              More dispatches <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

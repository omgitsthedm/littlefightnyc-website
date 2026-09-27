import { Link } from "react-router-dom";
import "./FirstLookScope.css";

const JOURNAL_PATH = "/journal/what-a-free-tech-audit-actually-looks-like/";

type FirstLookScopeProps = {
  compact?: boolean;
};

export default function FirstLookScope({ compact = false }: FirstLookScopeProps) {
  if (compact) {
    return (
      <details className="lf-first-look lf-first-look--compact" data-lf-first-look="compact" data-lf-disclosure="first-look:scope">
        <summary>Free, no obligation. What’s included?</summary>
        <div className="lf-first-look__compact-copy">
          <p>Send a public link and tell us what needs to work better. We agree what to review.</p>
          <p>You get a written next step: what to keep, fix, connect, replace, or investigate. Any paid scope stays separate.</p>
          <Link to={JOURNAL_PATH}>Read what a free first look does</Link>
        </div>
      </details>
    );
  }

  return (
    <section className="lf-first-look" aria-labelledby="lf-first-look-title" data-lf-first-look="full">
      <p className="lf-first-look__label">Free first look</p>
      <h2 id="lf-first-look-title">See the first useful move.</h2>
      <dl className="lf-first-look__steps">
        <div>
          <dt>Send</dt>
          <dd>A public website, social page, or non-secret facts about the business problem.</dd>
        </div>
        <div>
          <dt>Choose</dt>
          <dd>One decision the first look should help make.</dd>
        </div>
        <div>
          <dt>Receive</dt>
          <dd>A written next step: keep, fix, connect, replace, or investigate. Paid scope stays separate.</dd>
        </div>
      </dl>
      <Link
        className="lf-first-look__action"
        to="/tech-audit/?intent=website&source=website_first_look_scope"
        data-lf-event="website_plan_intent"
        data-lf-label="website_first_look_scope"
      >
        Start a free first look
      </Link>
    </section>
  );
}

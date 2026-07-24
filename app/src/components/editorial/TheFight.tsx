import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./TheFight.css";

const STEPS = [
  {
    verb: "Listen",
    detail: "You show us how the day actually works and where it gets stuck.",
  },
  {
    verb: "Keep",
    detail: "The trusted name, the phone number, the habits, and the tools that still work.",
  },
  {
    verb: "Change",
    detail: "Only the parts that make the business harder to find, run, or hand over.",
  },
  {
    verb: "Stay",
    detail: "We write it down, train the right people, and answer after launch.",
  },
] as const;

export default function TheFight() {
  return (
    <section className="lf-fight" aria-labelledby="lf-fight-title">
      <div className="lf-fight__inner">
        <header className="lf-fight__head">
          <p className="lf-fight__eyebrow">Change without losing the business</p>
          <h2 id="lf-fight-title" className="lf-fight__title">
            You already built the hard part.
          </h2>
          <p className="lf-fight__lede">
            The reputation, the regulars, the recipes, and the way your team
            takes care of people are not problems to replace. We make the
            technology catch up.
          </p>
        </header>

        <ol className="lf-fight__steps">
          {STEPS.map((step, index) => (
            <li key={step.verb}>
              <span className="lf-fight__step-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{step.verb}</h3>
              <p>{step.detail}</p>
            </li>
          ))}
        </ol>

        <div className="lf-fight__close">
          <div>
            <p className="lf-fight__close-label">No rip-and-replace speech</p>
            <p className="lf-fight__close-line">
              Show us what you have. We will tell you the next useful move, in
              plain English, before you agree to anything.
            </p>
          </div>
          <Link
            to="/tech-audit/"
            className="lf-fight__cta"
            data-lf-event="tech_audit_intent"
            data-lf-label="home_process"
          >
            Get a free second opinion
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./TheFour.css";

const SERVICES = [
  {
    number: "01",
    title: "Better website",
    service: "Websites",
    outcome: "Give the right person a clear reason to choose you, then make the next click easy.",
    to: "/services/custom-local-websites/",
  },
  {
    number: "02",
    title: "Fix something",
    service: "Tech support",
    outcome: "When the day stops working, get a straight answer and a useful next move.",
    to: "/services/it-support/",
  },
  {
    number: "03",
    title: "Software you own",
    service: "Software you own",
    outcome: "Use a focused tool that fits the work instead of paying monthly for five almost-right ones.",
    to: "/services/business-systems/",
  },
  {
    number: "04",
    title: "Free second opinion",
    service: "Free consult",
    outcome: "Bring the messy version. Leave knowing what to keep, fix, skip, or stop paying for.",
    to: "/services/tech-consulting/",
  },
] as const;

export default function TheFour() {
  return (
    <section className="lf-four" aria-labelledby="lf-four-title">
      <header className="lf-four__head">
        <div>
          <p className="lf-four__eyebrow">LF / 04 · Choose the right help</p>
          <h2 id="lf-four-title" className="lf-four__title">
            What needs to work better?
          </h2>
        </div>
        <div className="lf-four__head-side">
          <p className="lf-four__dek">
            Start with the thing customers or your team are feeling. We will help
            you find the useful fix—without making you learn a new vocabulary.
          </p>
          <Link className="lf-four__all" to="/services/">
            See all services <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </header>

      <ol className="lf-four__list">
        {SERVICES.map((service, index) => (
          <li
            className={`lf-four__item${index === 0 ? " lf-four__item--primary" : ""}`}
            key={service.title}
          >
            <Link className="lf-four__row" to={service.to}>
              <span className="lf-four__number">{service.number}</span>
              <div className="lf-four__body">
                <p className="lf-four__service">{service.service}</p>
                <h3 className="lf-four__name">{service.title}</h3>
                <p className="lf-four__outcome">{service.outcome}</p>
              </div>
              <span className="lf-four__arrow" aria-hidden="true">
                <ArrowRight size={25} strokeWidth={1.8} />
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <p className="lf-four__footnote">
        Not sure which one? Start with a free consult. We are good at translating
        “the thing is weird” into a real plan.
      </p>
    </section>
  );
}

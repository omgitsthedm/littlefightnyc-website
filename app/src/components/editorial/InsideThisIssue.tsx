import { Link } from "react-router-dom";
import "./InsideThisIssue.css";

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

const ENTRIES = [
  {
    label: "Work",
    summary: "Websites, IT support, local search, business systems.",
    page: "P. 02",
    to: "/services/",
  },
  {
    label: "Audit",
    summary: "A fast read on visibility, trust, speed, and conversion leaks.",
    page: "P. 04",
    to: "/audit/",
  },
  {
    label: "Field Guide",
    summary: "Case studies, industry maps, and plain answers in one place.",
    page: "P. 06",
    to: "/field-guide/",
  },
  {
    label: "Neighborhoods",
    summary: "Fourteen NYC areas — Lower East Side, Chelsea, Brooklyn, Queens, the Bronx.",
    page: "P. 18",
    to: "/areas/",
  },
  {
    label: "Fit Check",
    summary: "Three minutes. Tell us what's broken. Get routed to the right help.",
    page: "P. 24",
    to: "/fit-check/",
  },
] as const;

export default function InsideThisIssue() {
  return (
    <section className="lf-inside" aria-labelledby="lf-inside-heading">
      <div className="lf-container">
        <header className="lf-inside__head">
          <p className="lf-mono lf-inside__eyebrow">Inside This Issue</p>
          <h2 id="lf-inside-heading" className="lf-display lf-inside__title">
            The rest of <span className="lf-italic">the paper.</span>
          </h2>
        </header>

        <ol className="lf-inside__list">
          {ENTRIES.map((entry, i) => (
            <li key={entry.label} className="lf-inside__row">
              <Link to={entry.to} className="lf-inside__link">
                <span className="lf-mono lf-inside__numeral" aria-hidden="true">
                  {ROMAN[i]}.
                </span>
                <span className="lf-inside__body">
                  <span className="lf-mono lf-inside__label">{entry.label}</span>
                  <span className="lf-inside__summary">{entry.summary}</span>
                </span>
                <span className="lf-mono lf-inside__page">{entry.page}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

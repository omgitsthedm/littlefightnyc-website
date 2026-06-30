import { Link } from "react-router-dom";
import "./ServiceArchive.css";

const ROMAN = ["I.", "II.", "III.", "IV."] as const;

const ENTRIES = [
  {
    slug: "tech-consulting",
    eyebrow: "Tech Consulting · Inform",
    italic: "An honest read on your tech, before you spend another dollar.",
    body: "A clear-eyed audit of your tools, costs, website, Google presence, and workflow — translated into plain English so you can decide what to keep, fix, replace, or build.",
    note: "The consult is always free.",
  },
  {
    slug: "it-support",
    eyebrow: "IT Support · Repair",
    italic: "Fast help when the basics break.",
    body: "Email, domains, Wi-Fi, POS, booking, payments, accounts, and devices — fixed by someone local who knows your setup. Not a script in another timezone.",
    note: "Call first. We pick up.",
  },
  {
    slug: "custom-local-websites",
    eyebrow: "Custom Local Websites · Build",
    italic: "Built — not picked from a template menu.",
    body: "A custom site coded for your business, your block, and how Google reads local businesses in 2026. No templates, no themes, no Squarespace skins.",
    note: "14 days. Or you don't pay.",
  },
  {
    slug: "business-systems",
    eyebrow: "Business Systems · Support",
    italic: "Less spreadsheet. Less memory. Less waste.",
    body: "Lead intake, follow-up, dashboards, tool cleanup, and — when no SaaS fits — custom internal apps built around the work your business actually does.",
    note: "Keep, connect, replace, or build.",
  },
] as const;

export default function ServiceArchive() {
  return (
    <section className="lf-archive" aria-labelledby="lf-archive-heading">
      <div className="lf-container">
        <header className="lf-archive__head">
          <p className="lf-mono lf-archive__eyebrow">From the Archive</p>
          <h2 id="lf-archive-heading" className="lf-display lf-archive__title">
            Four services.<br />
            <span className="lf-italic">One agency.</span>
          </h2>
        </header>

        <ol className="lf-archive__list">
          {ENTRIES.map((entry, i) => (
            <li key={entry.slug} className="lf-archive__entry">
              <Link to={`/services/${entry.slug}/`} className="lf-archive__link">
                <span className="lf-archive__numeral lf-display" aria-hidden="true">
                  {ROMAN[i]}
                </span>

                <div className="lf-archive__body">
                  <p className="lf-mono lf-archive__eyebrow-line">
                    <span>{entry.eyebrow}</span>
                    <span className="lf-archive__understroke" aria-hidden="true" />
                  </p>

                  <p className="lf-italic lf-archive__italic">{entry.italic}</p>

                  <p className="lf-archive__copy">{entry.body}</p>

                  <p className="lf-mono lf-archive__note">{entry.note}</p>
                </div>

                <span className="lf-mono lf-archive__cta">
                  Read more <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

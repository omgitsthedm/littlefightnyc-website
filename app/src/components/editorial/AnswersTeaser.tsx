import { Link } from "react-router-dom";
import "./AnswersTeaser.css";

const QUESTIONS = [
  {
    slug: "small-business-website-cost-nyc",
    q: "What does a small business website actually cost in NYC?",
  },
  {
    slug: "business-not-showing-on-google-maps",
    q: "Why isn't my business showing on Google Maps?",
  },
  {
    slug: "website-designer-disappeared-what-now",
    q: "My web designer disappeared. What now?",
  },
  {
    slug: "pos-system-keeps-freezing",
    q: "Our POS keeps freezing. Who do we call?",
  },
  {
    slug: "reduce-monthly-software-costs-small-business",
    q: "How do we reduce monthly software costs?",
  },
  {
    slug: "urgent-it-support-small-business-nyc",
    q: "We need IT support today. What now?",
  },
] as const;

export default function AnswersTeaser() {
  return (
    <section className="lf-answers" aria-labelledby="lf-answers-heading">
      <div className="lf-container">
        <header className="lf-answers__head">
          <p className="lf-mono lf-answers__eyebrow">Common questions</p>
          <h2 id="lf-answers-heading" className="lf-display lf-answers__title">
            Plain answers.<br />
            <span className="lf-italic">No selling.</span>
          </h2>
        </header>

        <ol className="lf-answers__list">
          {QUESTIONS.map((item, i) => (
            <li key={item.slug} className="lf-answers__item">
              <Link to={`/answers/${item.slug}/`} className="lf-answers__link">
                <span className="lf-mono lf-answers__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="lf-answers__q">{item.q}</span>
                <span className="lf-mono lf-answers__arrow" aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>

        <Link to="/field-guide/#answers" className="lf-mono lf-answers__all">
          All answers <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

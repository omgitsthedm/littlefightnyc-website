import { Link } from "react-router-dom";
import TugMark from "@/components/editorial/TugMark";
import {
  HELLO_EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  SMS_HREF,
} from "@/data/contact";
import "./TriviaAnswer.css";

const HISTORY_SOURCE =
  "https://www.history.com/this-day-in-history/january-5/the-sugarhill-gangs-rappers-delight-becomes-hip-hops-first-top-40-hit";
const BILLBOARD_SOURCE = "https://www.billboard.com/charts/hot-100/1980-01-05/";
const WASHINGTON_POST_SOURCE =
  "https://www.washingtonpost.com/history/2023/08/08/rappers-delight-sugarhill-gang-hip-hop-history/";

const chartBeats = [
  {
    number: "01",
    label: "Released",
    value: "1979",
    detail: "Sugar Hill Records put the song on wax.",
  },
  {
    number: "02",
    label: "Top 40",
    value: "No. 37",
    detail: "January 5, 1980. The first rap single in Billboard’s Top 40.",
  },
  {
    number: "03",
    label: "Peak",
    value: "No. 36",
    detail: "It climbed once more the following week.",
  },
];

export default function TriviaAnswer() {
  return (
    <article className="lf-trivia-answer">
      <section className="lf-trivia-answer__hero" aria-labelledby="trivia-answer-title">
        <div className="lf-trivia-answer__wrap">
          <div className="lf-trivia-answer__edition" aria-label="Little Fight NYC table cut 01">
            <span>Little Fight NYC</span>
            <span>Table cut 01</span>
          </div>

          <div className="lf-trivia-answer__hero-grid">
            <div className="lf-trivia-answer__answer">
              <p className="lf-trivia-answer__label">The answer</p>
              <h1 id="trivia-answer-title">
                <span>“Rapper’s</span>{" "}
                <span>Delight.”</span>
              </h1>
              <p className="lf-trivia-answer__artist">The Sugarhill Gang</p>
              <p className="lf-trivia-answer__lede">
                It reached No. 37 on January 5, 1980—the first rap single to
                enter Billboard’s Top 40.
              </p>
            </div>

            <div
              className="lf-trivia-answer__record"
              role="img"
              aria-label="A Little Fight tugboat record label marked number 37 on the Hot 100"
            >
              <div className="lf-trivia-answer__grooves" aria-hidden="true" />
              <div className="lf-trivia-answer__record-label" aria-hidden="true">
                <span>Hot 100</span>
                <strong>37</strong>
                <TugMark className="lf-trivia-answer__tug" />
                <span>Jan 05 1980</span>
              </div>
              <span className="lf-trivia-answer__spindle" aria-hidden="true" />
              <span className="lf-trivia-answer__tonearm" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className="lf-trivia-answer__story" aria-labelledby="trivia-story-title">
        <div className="lf-trivia-answer__wrap">
          <header className="lf-trivia-answer__section-head">
            <p className="lf-trivia-answer__label">Three beats</p>
            <h2 id="trivia-story-title">The whole answer, without the lecture.</h2>
          </header>

          <ol className="lf-trivia-answer__beats">
            {chartBeats.map((beat) => (
              <li key={beat.number}>
                <span className="lf-trivia-answer__beat-number" aria-hidden="true">
                  {beat.number}
                </span>
                <div>
                  <span className="lf-trivia-answer__beat-label">{beat.label}</span>
                  <strong>{beat.value}</strong>
                  <p>{beat.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lf-trivia-answer__meaning" aria-labelledby="trivia-meaning-title">
        <div className="lf-trivia-answer__wrap lf-trivia-answer__meaning-grid">
          <p className="lf-trivia-answer__label">Why it matters</p>
          <div>
            <h2 id="trivia-meaning-title">It put recorded rap on America’s pop chart.</h2>
            <p>
              Hip-hop was already alive in New York’s parks, clubs, parties,
              and neighborhoods. “Rapper’s Delight” did not start the culture.
              It proved a rap record could become a national commercial hit.
            </p>
          </div>
        </div>
      </section>

      <section className="lf-trivia-answer__sources" aria-label="Sources">
        <div className="lf-trivia-answer__wrap">
          <p className="lf-trivia-answer__label">Check the record</p>
          <div className="lf-trivia-answer__source-links">
            <a href={HISTORY_SOURCE} target="_blank" rel="noreferrer">
              History.com: the January 5 milestone
            </a>
            <a href={BILLBOARD_SOURCE} target="_blank" rel="noreferrer">
              Billboard Hot 100: January 5, 1980
            </a>
            <a href={WASHINGTON_POST_SOURCE} target="_blank" rel="noreferrer">
              The Washington Post: the song’s chart history
            </a>
          </div>
        </div>
      </section>

      <section className="lf-trivia-answer__cta" aria-labelledby="trivia-cta-title">
        <div className="lf-trivia-answer__wrap">
          <header className="lf-trivia-answer__cta-head">
            <p className="lf-trivia-answer__label">Now that the table is settled</p>
            <h2 id="trivia-cta-title">We make tech work for small businesses.</h2>
          </header>

          <ul className="lf-trivia-answer__benefits" aria-label="How Little Fight helps">
            <li>Websites that work.</li>
            <li>Help when you need it.</li>
            <li>Systems that save time.</li>
          </ul>

          <nav className="lf-trivia-answer__contacts" aria-label="Contact Little Fight NYC">
            <a href={PHONE_HREF}>
              <span>Call</span>
              <strong>{PHONE_DISPLAY}</strong>
            </a>
            <a href={SMS_HREF}>
              <span>Text</span>
              <strong>{PHONE_DISPLAY}</strong>
            </a>
            <a href={`mailto:${HELLO_EMAIL}`}>
              <span>Email</span>
              <strong>{HELLO_EMAIL}</strong>
            </a>
            <Link to="/tech-audit/?source=table_trivia">
              <span>Form</span>
              <strong>Tell us what you need</strong>
            </Link>
          </nav>

          <p className="lf-trivia-answer__hours">
            9am–9pm Eastern: a human answers. After hours: leave a message.
          </p>
        </div>
      </section>
    </article>
  );
}

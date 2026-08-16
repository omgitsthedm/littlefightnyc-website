import { Link } from "react-router-dom";
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

export default function TriviaAnswer() {
  return (
    <main className="lf-trivia-answer">
      <section className="lf-trivia-answer__hero" aria-labelledby="trivia-answer-title">
        <div className="lf-trivia-answer__wrap">
          <p className="lf-trivia-answer__eyebrow">Table trivia / answer 01</p>
          <div className="lf-trivia-answer__reveal">
            <p className="lf-trivia-answer__forty" aria-hidden="true">40</p>
            <div className="lf-trivia-answer__answer-card">
              <p className="lf-trivia-answer__label">The answer</p>
              <h1 id="trivia-answer-title">
                <strong>“Rapper’s Delight”</strong><br />
                {" "}by The Sugarhill Gang.
              </h1>
              <p>
                Released in 1979. Top 40 in 1980. The record helped take hip-hop
                from New York parties to the national charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="lf-trivia-answer__story" aria-labelledby="trivia-story-title">
        <div className="lf-trivia-answer__wrap lf-trivia-answer__story-grid">
          <div>
            <p className="lf-trivia-answer__eyebrow lf-trivia-answer__eyebrow--dark">What happened</p>
            <h2 id="trivia-story-title">Hip-hop entered the Top 40.</h2>
            <p>
              “Rapper’s Delight” was released in 1979. On January 5, 1980, it
              reached No. 37 on the Billboard Hot 100. That made it the first
              hip-hop song to enter the chart’s Top 40.
            </p>
            <p>
              It climbed once more, peaking at No. 36. The song was not the
              beginning of hip-hop. It was the record that proved the music could
              become a national commercial hit.
            </p>
          </div>

          <dl className="lf-trivia-answer__facts" aria-label="Rapper’s Delight chart facts">
            <div>
              <dt>Released</dt>
              <dd>1979</dd>
            </div>
            <div>
              <dt>Top 40</dt>
              <dd>January 5, 1980</dd>
            </div>
            <div>
              <dt>Entered</dt>
              <dd>No. 37</dd>
            </div>
            <div>
              <dt>Peak</dt>
              <dd>No. 36</dd>
            </div>
          </dl>
        </div>

        <div className="lf-trivia-answer__wrap lf-trivia-answer__sources">
          <p>
            Sources: <a href={HISTORY_SOURCE} target="_blank" rel="noreferrer">History.com: hip-hop’s first Top 40 hit ↗</a>
            {" · "}
            <a href={BILLBOARD_SOURCE} target="_blank" rel="noreferrer">Billboard Hot 100, January 5, 1980 ↗</a>
          </p>
        </div>
      </section>

      <section className="lf-trivia-answer__cta" aria-labelledby="trivia-cta-title">
        <div className="lf-trivia-answer__wrap">
          <p className="lf-trivia-answer__eyebrow">You found it</p>
          <h2 id="trivia-cta-title">Now meet Little Fight.</h2>
          <p className="lf-trivia-answer__cta-copy">
            Websites, tech support, and business systems for small businesses.
            A real human picks up 9am–9pm Eastern.
          </p>
          <div className="lf-trivia-answer__actions">
            <Link to="/tech-audit/" className="lf-trivia-answer__button lf-trivia-answer__button--primary">
              Tell us what you need
            </Link>
            <a href={PHONE_HREF} className="lf-trivia-answer__button">
              Call {PHONE_DISPLAY}
            </a>
            <a href={SMS_HREF} className="lf-trivia-answer__button">
              Text {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${HELLO_EMAIL}`} className="lf-trivia-answer__button">
              Email us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

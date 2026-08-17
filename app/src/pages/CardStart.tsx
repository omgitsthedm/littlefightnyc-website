import { Link } from "react-router-dom";
import {
  HELLO_EMAIL,
  PHONE_DISPLAY,
  PHONE_HREF,
  SMS_HREF,
} from "@/data/contact";
import "./CardStart.css";

/**
 * /start/ — the business-card QR landing.
 *
 * Someone is holding the card and just scanned it. Lead with the answer
 * (what we do), repeat the three promises printed on the card back, then make
 * the next step one tap. QR-only route: no internal navigation links to it,
 * so it stays noindex like /trivia/1979/.
 */
export default function CardStart() {
  return (
    <main className="lf-card-start">
      <section className="lf-card-start__hero" aria-labelledby="card-start-title">
        <div className="lf-card-start__wrap">
          <p className="lf-card-start__eyebrow">You scanned the card</p>
          <h1 id="card-start-title">
            Websites &amp; tech support <span>from humans.</span>
          </h1>
          <p className="lf-card-start__lede">
            Little Fight NYC helps small businesses get a website that makes
            people choose them, fixes tech when it breaks, and sets up tools
            that save time. A real person answers.
          </p>
        </div>
      </section>

      <section className="lf-card-start__promises" aria-labelledby="card-start-promises-title">
        <div className="lf-card-start__wrap">
          <p className="lf-card-start__eyebrow">What the card promised</p>
          <h2 id="card-start-promises-title">Three things, done properly.</h2>
          <ol className="lf-card-start__list">
            <li>
              <span className="lf-card-start__num">01</span>
              <div>
                <h3>Websites that work</h3>
                <p>
                  Fast, clear, and built to turn a visit into a call, a booking,
                  or a sale. You own the domain, the code, and the data.
                </p>
              </div>
            </li>
            <li>
              <span className="lf-card-start__num">02</span>
              <div>
                <h3>Help when you need it</h3>
                <p>
                  Something broken, slow, or confusing? Call or text. We sort it
                  out in plain language and tell you what it will cost first.
                </p>
              </div>
            </li>
            <li>
              <span className="lf-card-start__num">03</span>
              <div>
                <h3>Tools that save time</h3>
                <p>
                  Booking, invoicing, email, and the small systems that keep a
                  business running — connected so you stop doing things twice.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="lf-card-start__cta" aria-labelledby="card-start-cta-title">
        <div className="lf-card-start__wrap">
          <p className="lf-card-start__eyebrow">Next step</p>
          <h2 id="card-start-cta-title">Tell us what is in your way.</h2>
          <p className="lf-card-start__cta-copy">
            The first conversation is free. No brief or tech words needed —
            describe what the business needs to do, or what stopped working.
            A real human picks up 9am–9pm Eastern.
          </p>
          <div className="lf-card-start__actions">
            <Link to="/tech-audit/" className="lf-card-start__button lf-card-start__button--primary">
              Tell us what you need
            </Link>
            <a href={SMS_HREF} className="lf-card-start__button">
              Text {PHONE_DISPLAY}
            </a>
            <a href={PHONE_HREF} className="lf-card-start__button">
              Call {PHONE_DISPLAY}
            </a>
            <a href={`mailto:${HELLO_EMAIL}`} className="lf-card-start__button">
              Email us
            </a>
          </div>
          <p className="lf-card-start__more">
            Want the long version? <Link to="/">See the whole site</Link> or{" "}
            <Link to="/services/">what we fix</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

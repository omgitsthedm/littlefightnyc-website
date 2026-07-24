import { Link } from "react-router-dom";
import { MessageSquare, UserRound } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import MiniMapNYC from "@/components/dataviz/MiniMapNYC";
import TheDirectLine from "@/components/dataviz/TheDirectLine";
import TimelineStrip from "@/components/dataviz/TimelineStrip";
import TimePromiseInstrument from "@/components/editorial/TimePromiseInstrument";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "@/styles/editorial/contact.css";

const CONTACT_FAQ = [
  {
    question: "How fast will you answer?",
    answer:
      "From 9am to 9pm New York time, a real person picks up. If you leave a message, we call back within 2 hours.",
  },
  {
    question: "Does the first talk cost money?",
    answer:
      "No. Consulting is always free. If you do not need us, we will say so and point you the right way.",
  },
  {
    question: "What happens after I write to you?",
    answer:
      "We read it the same day. Then we call, text, or email you back — whichever you asked for. No spam, no pressure, no long forms.",
  },
];

export default function Contact() {
  const windowRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const mapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <>
      <PageHero
        eyebrow="Contact"
        icon={MessageSquare}
        title={
          <>
            Tell us what's<br />
            {" "}
            <span className="lf-em">going on.</span>
          </>
        }
        dek="Broken today? Call. Messy but not urgent? Start a Tech Audit. You do not need the technical name for the problem. Tell us what the day looks like and we will help name the next move."
        image={{
          src: "/assets/hero-contact-door.webp",
          alt: "A warm-lit shop doorway glowing at dusk in New York — the door is open",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-contact-start" aria-labelledby="lf-contact-start-title">
        <div className="lf-contact-start__inner">
          <header>
            <p>Choose the fastest path</p>
            <h2 id="lf-contact-start-title">Start with what is happening now.</h2>
          </header>

          <nav className="lf-contact-start__routes" aria-label="Ways to contact Little Fight NYC">
            <a href="tel:+16463600318">
              <span>Broken today</span>
              <strong>Call (646) 360-0318</strong>
              <small>Best when work, sales, access, or customers are blocked.</small>
            </a>
            <Link to="/tech-audit/">
              <span>Messy, not urgent</span>
              <strong>Start a free Tech Audit</strong>
              <small>Best when the problem crosses the website, tools, bills, or workflow.</small>
            </Link>
            <a href="#contact">
              <span>Something else</span>
              <strong>Choose call, text, email, or form</strong>
              <small>Use the channel that is easiest from where you are.</small>
            </a>
          </nav>
        </div>
      </section>

      {/* The page's promise, drawn as a race: their phone maze vs our one
          straight orange line. */}
      <section className="lf-contact-line" aria-label="No phone tree — a real person answers">
        <div className="lf-contact-line__inner">
          <TheDirectLine />
        </div>
      </section>

      <section className="lf-contact-process" aria-labelledby="lf-contact-process-title">
        <header className="lf-contact-process__head">
          <p>Response promise</p>
          <h2 id="lf-contact-process-title">What happens after you reach out</h2>
        </header>
        <details>
          <summary>
            <strong>Open the response timeline and promises</strong>
            <i aria-hidden="true" />
          </summary>

          <div className="lf-contact-operations">
            <div className="lf-contact-operations__inner">
              {/* What happens when you reach out — the response window, drawn. */}
              <section className="lf-contact-window" aria-labelledby="lf-contact-window-title">
                <div ref={windowRef} className="lf-contact-window__inner" data-reveal>
                  <header className="lf-contact-window__head">
                    <p className="lf-contact-window__eyebrow">What happens next</p>
                    <h2 id="lf-contact-window-title" className="lf-contact-window__title">
                      You reach out. We set the next move.
                    </h2>
                  </header>

                  <TimelineStrip
                    label="What happens after you contact Little Fight NYC"
                    summary="You call, text, email, or send the form. From 9am to 9pm New York time, Little Fight NYC reviews the situation and follows up. If you leave a message, we return it within 2 hours. Consulting is always free."
                    beats={[
                      { label: "You reach out", sub: "Call, text, email, or form" },
                      { label: "Context reviewed", sub: "9am-9pm ET" },
                      { label: "Callback in 2 hours", sub: "If we miss you", marker: true },
                    ]}
                    badge="Consulting is free"
                    vertical
                  />

                  <p className="lf-contact-window__note">
                    <UserRound size={16} strokeWidth={2} aria-hidden="true" />
                    No phone tree. No ticket maze. Start with the problem and get a clear path forward.
                  </p>
                </div>
              </section>

              {/* The four promises against a live 24h NYC clock. */}
              <TimePromiseInstrument />
            </div>
          </div>
        </details>
      </section>

      {/* Where we work — the coverage map. */}
      <section className="lf-contact-map" aria-labelledby="lf-contact-map-title">
        <div ref={mapRef} className="lf-contact-map__inner" data-reveal>
          <header className="lf-contact-window__head">
            <p className="lf-contact-window__eyebrow">Where we work</p>
            <h2 id="lf-contact-map-title" className="lf-contact-window__title">
              Close enough to show up.
            </h2>
            <p className="lf-contact-map__dek">
              We are based in Manhattan and work across these neighborhoods.
              When something breaks, we can be on site within 24 hours.
            </p>
          </header>
          <details className="lf-contact-map__coverage">
            <summary>
              <span>Neighborhood coverage</span>
              <strong>Open the service map</strong>
              <i aria-hidden="true" />
            </summary>
            <div>
              <MiniMapNYC compact />
            </div>
          </details>

          <section className="lf-contact-faq" aria-labelledby="lf-contact-faq-title">
            <header>
              <p>Before you call</p>
              <h2 id="lf-contact-faq-title">Three quick answers</h2>
            </header>
            <div className="lf-contact-faq__list">
              {CONTACT_FAQ.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <i aria-hidden="true" />
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>

      <QuietContact />
    </>
  );
}

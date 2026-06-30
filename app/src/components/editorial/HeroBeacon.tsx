import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PhoneAction from "./PhoneAction";
import "./HeroBeacon.css";

const WORDMARK = "LITTLE FIGHT NYC";
const SESSION_KEY = "lf_hero_seen";

export default function HeroBeacon() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [variant, setVariant] = useState<"first" | "return" | "reduced">("first");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        setVariant("reduced");
        return;
      }

      const seen = sessionStorage.getItem(SESSION_KEY);
      if (seen) {
        setVariant("return");
      } else {
        sessionStorage.setItem(SESSION_KEY, "1");
        setVariant("first");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const words = WORDMARK.split(" ");

  return (
    <section
      ref={rootRef}
      className={`lf-hero lf-hero--${variant}`}
      aria-label="Little Fight NYC"
    >
      <div className="lf-hero__slam" aria-hidden="true" />

      <div className="lf-container lf-hero__inner">
        <header className="lf-hero__top">
          <h1 className="lf-display lf-hero__wordmark">
            {words.map((word, wi) => (
              <span className="lf-hero__word" key={wi}>
                {[...word].map((char, ci) => (
                  <span
                    className="lf-hero__char"
                    key={ci}
                    style={{ ["--lf-i" as string]: `${wi * 6 + ci}` }}
                  >
                    {char}
                  </span>
                ))}
                {wi < words.length - 1 && (
                  <span className="lf-hero__space" aria-hidden="true">
                    {" "}
                  </span>
                )}
              </span>
            ))}
            <span className="lf-hero__underline" aria-hidden="true" />
          </h1>

          <dl className="lf-hero__edition">
            <div className="lf-hero__edition-item">
              <dt className="lf-mono">Issue</dt>
              <dd className="lf-mono lf-hero__edition-issue">№01</dd>
            </div>
            <div className="lf-hero__edition-divider" aria-hidden="true" />
            <div className="lf-hero__edition-item">
              <dt className="lf-mono">Date</dt>
              <dd className="lf-mono">May 2026</dd>
            </div>
            <div className="lf-hero__edition-divider" aria-hidden="true" />
            <div className="lf-hero__edition-item">
              <dt className="lf-mono">Locale</dt>
              <dd className="lf-mono">New York City</dd>
            </div>
          </dl>
        </header>

        <h2 className="lf-display lf-hero__claim">
          Tech for the NYC shops<br className="lf-hero__br" />
          that have to win against<br className="lf-hero__br" />
          <span className="lf-italic lf-hero__claim-italic">
            billion-dollar competitors.
          </span>
        </h2>

        <p className="lf-italic lf-hero__dek">
          Websites, IT support, Google visibility, and business systems —
          sized for what a corner shop can afford. Founded 2012. Manhattan, New York.
        </p>

        <div className="lf-hero__actions">
          <PhoneAction className="lf-hero__primary" align="left">
            <span className="lf-mono lf-hero__primary-label">Call or text</span>
            <span className="lf-display lf-hero__primary-number">
              (646) 360-0318
            </span>
            <span className="lf-italic lf-hero__primary-note">
              9am–9pm Eastern. A human picks up.
            </span>
          </PhoneAction>

          <Link to="/fit-check/" className="lf-hero__secondary">
            <span className="lf-mono lf-hero__secondary-label">
              Or start a Fit Check
            </span>
            <span className="lf-italic lf-hero__secondary-note">
              Three minutes. Tell us what's broken. <span aria-hidden="true">→</span>
            </span>
          </Link>
        </div>

        <ul className="lf-hero__trust" aria-label="Why owners call">
          <li className="lf-hero__trust-item">
            <p className="lf-mono lf-hero__trust-label">Founded</p>
            <p className="lf-display lf-hero__trust-value">2012</p>
            <p className="lf-italic lf-hero__trust-detail">14 years in NYC</p>
          </li>
          <li className="lf-hero__trust-item">
            <p className="lf-mono lf-hero__trust-label">Promise</p>
            <p className="lf-display lf-hero__trust-value">14 days</p>
            <p className="lf-italic lf-hero__trust-detail">Or you don't pay</p>
          </li>
          <li className="lf-hero__trust-item">
            <p className="lf-mono lf-hero__trust-label">Answer</p>
            <p className="lf-display lf-hero__trust-value">Founder</p>
            <p className="lf-italic lf-hero__trust-detail">Picks up the phone</p>
          </li>
          <li className="lf-hero__trust-item">
            <p className="lf-mono lf-hero__trust-label">Hours</p>
            <p className="lf-display lf-hero__trust-value">9–9 ET</p>
            <p className="lf-italic lf-hero__trust-detail">AI after-hours</p>
          </li>
        </ul>
      </div>
    </section>
  );
}

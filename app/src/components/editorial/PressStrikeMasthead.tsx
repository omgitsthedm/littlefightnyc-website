import { useEffect, useRef, useState } from "react";
import "./PressStrikeMasthead.css";

const WORDMARK = "LITTLE FIGHT NYC";
const SESSION_KEY = "lf_masthead_seen";

type Props = {
  /** Optional issue metadata shown below the wordmark. */
  edition?: {
    vol: string;
    issue: string;
    date: string;
    locale: string;
  };
  /** Optional kicker line above the meta — "TECH FOR THE SHOPS THAT BUILT NEW YORK" */
  tagline?: string;
};

export default function PressStrikeMasthead({
  edition = {
    vol: "Vol. I",
    issue: "№01",
    date: "May 2026",
    locale: "New York City",
  },
  tagline = "Tech for the shops that built New York",
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
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

  const lines = WORDMARK.split(" ");

  return (
    <header
      ref={rootRef}
      className={`lf-masthead lf-masthead--${variant}`}
      aria-label="Little Fight NYC masthead"
    >
      <div className="lf-masthead__slam" aria-hidden="true" />

      <div className="lf-container lf-masthead__inner">
        <h1 className="lf-masthead__wordmark lf-display">
          <span className="lf-masthead__line">
            {lines.map((word, wi) => (
              <span className="lf-masthead__word" key={wi}>
                {[...word].map((char, ci) => (
                  <span
                    className="lf-masthead__char"
                    key={ci}
                    style={{ ["--lf-i" as string]: `${wi * 6 + ci}` }}
                  >
                    {char}
                  </span>
                ))}
                {wi < lines.length - 1 && (
                  <span className="lf-masthead__space" aria-hidden="true">
                    {" "}
                  </span>
                )}
              </span>
            ))}
          </span>
          <span className="lf-masthead__underline" aria-hidden="true" />
        </h1>

        <p className="lf-masthead__tagline lf-italic">{tagline}</p>

        <dl className="lf-masthead__edition">
          <div className="lf-masthead__edition-item">
            <dt className="lf-mono">Volume</dt>
            <dd className="lf-mono">{edition.vol}</dd>
          </div>
          <div className="lf-masthead__edition-divider" aria-hidden="true" />
          <div className="lf-masthead__edition-item">
            <dt className="lf-mono">Issue</dt>
            <dd className="lf-mono lf-masthead__edition-issue">{edition.issue}</dd>
          </div>
          <div className="lf-masthead__edition-divider" aria-hidden="true" />
          <div className="lf-masthead__edition-item">
            <dt className="lf-mono">Date</dt>
            <dd className="lf-mono">{edition.date}</dd>
          </div>
          <div className="lf-masthead__edition-divider" aria-hidden="true" />
          <div className="lf-masthead__edition-item">
            <dt className="lf-mono">Locale</dt>
            <dd className="lf-mono">{edition.locale}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

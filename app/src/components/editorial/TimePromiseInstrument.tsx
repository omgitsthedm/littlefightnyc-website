import { useScrollReveal } from "./useScrollReveal";
import { useNycClock } from "./useNycClock";
import { CLOSE_HOUR, OPEN_HOUR, useOpenNow } from "@/lib/openNow";
import "./TimePromiseInstrument.css";

/**
 * Time-promise instrument (/contact/) — the four real promises laid against
 * a 24-hour track of the New York day. The callback window (9am–9pm ET,
 * same OPEN_HOUR/CLOSE_HOUR the open-now dot uses) is shaded, and a live
 * "now" marker rides the same shared NYC clock as the footer strip.
 *
 * Honest by construction: the promises are standing doctrine, not metrics.
 * The only live reading on this instrument is the clock.
 */

const PROMISES = [
  { value: "Free", label: "Consulting", note: "Always" },
  { value: "14 days", label: "Website ship", note: "Typical build" },
  { value: "24 hrs", label: "Urgent on-site", note: "When it's critical" },
  { value: "2 hrs", label: "Callback", note: "9am–9pm ET" },
] as const;

/** Hour marks along the track. NOON anchors the middle of the day. */
const HOUR_MARKS = [
  { hour: 0, label: "12AM" },
  { hour: 6, label: "6AM" },
  { hour: 12, label: "NOON" },
  { hour: 18, label: "6PM" },
  { hour: 24, label: "12AM" },
] as const;

const WINDOW_LEFT_PCT = (OPEN_HOUR / 24) * 100;
const WINDOW_WIDTH_PCT = ((CLOSE_HOUR - OPEN_HOUR) / 24) * 100;

export default function TimePromiseInstrument() {
  const revealRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const clock = useNycClock();
  const openNow = useOpenNow();

  const nowPct = clock ? clock.dayFraction * 100 : null;
  const trackLabel = clock
    ? `24-hour New York day. The callback window runs 9am to 9pm Eastern and is ${
        openNow.open ? "open" : "closed"
      } right now. Local time ${clock.hms} ${clock.zone}.`
    : "24-hour New York day. The callback window runs 9am to 9pm Eastern.";

  return (
    <section className="lf-tpi" aria-labelledby="lf-tpi-title">
      <div ref={revealRef} className="lf-tpi__inner" data-reveal>
        <header className="lf-contact-window__head">
          <p className="lf-contact-window__eyebrow">The promises</p>
          <h2 id="lf-tpi-title" className="lf-contact-window__title">
            Four promises, one clock.
          </h2>
        </header>

        <ul className="lf-tpi__chips">
          {PROMISES.map((promise) => (
            <li key={promise.label} className="lf-tpi__chip">
              <span className="lf-tpi__chip-value">{promise.value}</span>
              <span className="lf-tpi__chip-label">{promise.label}</span>
              <span className="lf-tpi__chip-note">{promise.note}</span>
            </li>
          ))}
        </ul>

        <div
          className="lf-tpi__track"
          role="img"
          aria-label={trackLabel}
          data-open={openNow.open ? "true" : "false"}
        >
          <div className="lf-tpi__rail" aria-hidden="true">
            {HOUR_MARKS.map(({ hour, label }) => (
              <span
                key={`${hour}-${label}`}
                className="lf-tpi__mark"
                style={{ left: `${(hour / 24) * 100}%` }}
              >
                <i className="lf-tpi__mark-tick" />
                <span className="lf-tpi__mark-label">{label}</span>
              </span>
            ))}
            <span
              className="lf-tpi__window"
              style={{
                left: `${WINDOW_LEFT_PCT}%`,
                width: `${WINDOW_WIDTH_PCT}%`,
              }}
            >
              <span className="lf-tpi__window-label">
                Callback window · 9am–9pm
              </span>
            </span>
            {nowPct !== null && clock && (
              <>
                <span
                  className="lf-tpi__now"
                  style={{ left: `${nowPct}%` }}
                />
                <span
                  className="lf-tpi__now-label"
                  style={{
                    left: `clamp(3.5rem, ${nowPct}%, calc(100% - 3.5rem))`,
                  }}
                >
                  {`NOW ${clock.hms}`}
                </span>
              </>
            )}
          </div>
        </div>

        <p className="lf-tpi__note">
          The promises are standing policy — free consult, 14-day websites,
          24-hour urgent on-sites, 2-hour callbacks inside the window. The
          only live reading on this instrument is the clock.
        </p>
      </div>
    </section>
  );
}

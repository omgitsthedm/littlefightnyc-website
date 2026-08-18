import {
  ArrowRight,
  Mail,
  MessageSquare,
  Pause,
  Phone,
  Play,
  RotateCcw,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HELLO_EMAIL, PHONE_HREF, SMS_HREF } from "@/data/contact";
import { HOME_FEATURED_WORK } from "@/data/home-featured-work";
import "./QuietHero.css";

/**
 * The living customer path. Every beat is a real place on a real client
 * site: the phone scrolls the live capture to the moment where a new
 * customer finds, understands, trusts, and finally books. Offsets are
 * measured in source-image pixels against the 390×2400 capture, so the
 * frame can be any size and the beats still land.
 */
const CAPTURE = {
  src: "/assets/case-hair-by-rachel-charles-explore-mobile.webp",
  width: 390,
  height: 2400,
  domain: "hairbyrachelcharles.com",
} as const;

const PATH_BEATS = [
  {
    key: "found",
    step: "01",
    label: "Found",
    note: "They find you.",
    detail: "A real page to land on from search or a shared link — not a message thread.",
    offset: 0,
  },
  {
    key: "understood",
    step: "02",
    label: "Understood",
    note: "They get it.",
    detail: "Services and what to do next, answered before anyone has to ask.",
    offset: 1140,
  },
  {
    key: "trusted",
    step: "03",
    label: "Trusted",
    note: "They believe it.",
    detail: "Real work and real client words do the convincing.",
    offset: 830,
  },
  {
    key: "booked",
    step: "04",
    label: "Booked",
    note: "They act.",
    detail: "One clear button hands off to the booking tool the client already uses.",
    offset: 405,
  },
] as const;

/** Where the live "Book appointment" button sits once beat 04 is framed. */
const BOOK_TARGET = { top: 32.4, height: 6.7, left: 5.5, width: 88.3 } as const;

const FIRST_BEAT_DELAY_MS = 900;
const BEAT_HOLD_MS = 2600;
const FEATURED = HOME_FEATURED_WORK[0];
const CHECKED_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type PlayState = "idle" | "playing" | "paused" | "done" | "still";

export default function QuietHero() {
  const [beat, setBeat] = useState(0);
  const [play, setPlay] = useState<PlayState>("idle");
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setSystemReducedMotion(query.matches);
      if (query.matches) setPlay("still");
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Autoplay begins once the phone is actually on screen. On a phone the
  // stage sits under the promise, so a show that started on mount would
  // play to nobody.
  useEffect(() => {
    if (systemReducedMotion || startedRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    if (typeof IntersectionObserver === "undefined") {
      const fallback = window.setTimeout(() => {
        startedRef.current = true;
        setPlay((current) => (current === "idle" ? "playing" : current));
      }, FIRST_BEAT_DELAY_MS);
      return () => window.clearTimeout(fallback);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startedRef.current = true;
          setPlay((current) => (current === "idle" ? "playing" : current));
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, [systemReducedMotion]);

  useEffect(() => {
    clearTimer();
    if (play !== "playing") return;
    const hold = beat === 0 && startedRef.current ? FIRST_BEAT_DELAY_MS + BEAT_HOLD_MS : BEAT_HOLD_MS;
    timerRef.current = window.setTimeout(() => {
      if (beat >= PATH_BEATS.length - 1) {
        setPlay("done");
        return;
      }
      setBeat(beat + 1);
    }, hold);
    return clearTimer;
  }, [beat, play, clearTimer]);

  const jumpTo = (index: number) => {
    setBeat(index);
    if (play === "playing") setPlay("paused");
  };

  const onControl = () => {
    // Reduced motion turns off the autoplay, not the story. The path is
    // content — an owner still needs to walk it — so the control becomes a
    // stepper and the beats change instantly instead of animating.
    if (systemReducedMotion) {
      setBeat((current) => (current >= PATH_BEATS.length - 1 ? 0 : current + 1));
      return;
    }
    if (play === "playing") {
      setPlay("paused");
      return;
    }
    if (play === "done" || beat === PATH_BEATS.length - 1) {
      setBeat(0);
      startedRef.current = true;
      setPlay("playing");
      return;
    }
    startedRef.current = true;
    setPlay("playing");
  };

  const active = PATH_BEATS[beat];
  const isBooked = beat === PATH_BEATS.length - 1;
  const controlLabel = systemReducedMotion
    ? (isBooked ? "Start the path over" : "Next step")
    : play === "playing" ? "Pause" : play === "done" || isBooked ? "Replay the path" : "Play the path";
  const ControlIcon = systemReducedMotion
    ? (isBooked ? RotateCcw : ArrowRight)
    : play === "playing" ? Pause : play === "done" || isBooked ? RotateCcw : Play;

  return (
    <section
      className={`lf-hero${systemReducedMotion ? " lf-hero--motion-reduced" : ""}`}
      aria-labelledby="lf-home-title"
      data-lf-owner-intro="true"
    >
      <div className="lf-hero__main">
        <div className="lf-hero__promise">
          <p className="lf-hero__eyebrow">
            <span aria-hidden="true">LF / 01</span>
            Websites · Tech · Software
          </p>

          <h1 id="lf-home-title" className="lf-hero__claim">
            Make it easier for{" "}<br />
            the next customer to{" "}<br />
            <span>choose you.</span>
          </h1>

          <p className="lf-hero__brief">
            We build the website. We make the tools fit. We stay when
            something breaks.
          </p>

          <div className="lf-hero__quick" aria-label="Start here">
            <Link
              className="lf-hero__quick-action lf-hero__quick-action--website"
              to="/website-check/"
              aria-label="Need a website? Get a better website"
              data-lf-event="website_check_started"
              data-lf-label="home_hero"
              data-lf-source="home"
            >
              <span>Need a website?</span>
              <strong>Get a better website</strong>
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
            <a
              className="lf-hero__quick-action lf-hero__quick-action--urgent"
              href={PHONE_HREF}
              aria-label="Something broke? Call now"
              data-lf-label="home_mobile_urgent_phone"
            >
              <span>Something broke?</span>
              <strong>Call now</strong>
              <Phone size={18} strokeWidth={2} aria-hidden="true" />
            </a>
          </div>

          <div
            className="lf-hero__quick-reach"
            aria-label="More ways to reach Little Fight NYC"
            data-lf-contact-rail="true"
          >
            <div className="lf-hero__quick-channels">
              <a href={SMS_HREF} data-lf-label="home_mobile_hero_sms">
                <MessageSquare size={14} strokeWidth={2} aria-hidden="true" />
                Text
              </a>
              <a href={`mailto:${HELLO_EMAIL}`} data-lf-label="home_mobile_hero_email">
                <Mail size={14} strokeWidth={2} aria-hidden="true" />
                Email
              </a>
              <Link to="/tech-audit/" data-lf-label="home_hero_form">
                <Send size={14} strokeWidth={2} aria-hidden="true" />
                Form
              </Link>
            </div>
            <div className="lf-hero__quick-hours">
              <span>9am–9pm Eastern: a human answers. After hours: leave a message.</span>
            </div>
          </div>
        </div>

        <figure
          className="lf-hero__scene"
          aria-labelledby="lf-hero-scene-title"
          data-lf-beat={active.key}
          data-lf-play={play}
        >
          <p id="lf-hero-scene-title" className="lf-hero__scene-title">
            <span aria-hidden="true">The path</span>
            One customer, start to finish — on a real client site.
          </p>

          <div className="lf-hero__phone" aria-hidden="true" ref={stageRef}>
            <div className="lf-hero__phone-bar">
              <span className="lf-hero__phone-notch" />
              <span className="lf-hero__phone-url">{CAPTURE.domain}</span>
            </div>
            <div className="lf-hero__phone-screen">
              <img
                src={CAPTURE.src}
                width={CAPTURE.width}
                height={CAPTURE.height}
                alt=""
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  transform: `translate3d(0, ${-((active.offset / CAPTURE.height) * 100).toFixed(3)}%, 0)`,
                }}
              />
              <span
                className="lf-hero__phone-target"
                style={{
                  top: `${BOOK_TARGET.top}%`,
                  height: `${BOOK_TARGET.height}%`,
                  left: `${BOOK_TARGET.left}%`,
                  width: `${BOOK_TARGET.width}%`,
                }}
              />
            </div>
          </div>

          <ol className="lf-hero__path" aria-label="The customer path">
            {PATH_BEATS.map((step, index) => (
              <li
                key={step.key}
                className={`lf-hero__path-step${index === beat ? " lf-hero__path-step--active" : ""}${index < beat ? " lf-hero__path-step--passed" : ""}`}
              >
                <button
                  type="button"
                  aria-current={index === beat ? "step" : undefined}
                  onClick={() => jumpTo(index)}
                >
                  <span className="lf-hero__path-num" aria-hidden="true">{step.step}</span>
                  <strong>{step.label}</strong>
                  <span className="lf-hero__path-note">{step.note}</span>
                </button>
              </li>
            ))}
          </ol>

          <p className="lf-hero__path-detail" aria-live="polite">
            <strong>{active.label}.</strong> {active.detail}
          </p>

          <div className="lf-hero__path-controls">
            <button
              type="button"
              onClick={onControl}
              aria-pressed={systemReducedMotion ? undefined : play === "playing"}
            >
              <ControlIcon size={16} strokeWidth={2} aria-hidden="true" />
              {controlLabel}
            </button>
          </div>
          <figcaption className="lf-hero__caption">
            Live client site · {FEATURED.sourceLabel} · checked{" "}
            {CHECKED_DATE.format(new Date(`${FEATURED.verifiedAt}T12:00:00Z`))}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

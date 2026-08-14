import {
  ArrowRight,
  EyeOff,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HELLO_EMAIL,
  PHONE_HREF,
  SMS_HREF,
} from "@/data/contact";
import "./QuietHero.css";

const CONNECTED_PATH = [
  { label: "Search", note: "They find you" },
  { label: "Website", note: "They get it" },
  { label: "Booking", note: "They take action" },
  { label: "Support", note: "It keeps working" },
] as const;

/**
 * Homepage acquisition surface: one promise, one real business scene, and two
 * obvious decisions. The full Website Check owns its form and scan state; the
 * homepage gets a faster, privacy-safe handoff instead of asking an owner to
 * type before they understand the offer.
 */
export default function QuietHero() {
  const [replay, setReplay] = useState(0);
  const [manualReducedMotion, setManualReducedMotion] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const motionReduced = systemReducedMotion || manualReducedMotion;

  return (
    <section
      className={`lf-hero${motionReduced ? " lf-hero--motion-reduced" : ""}`}
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
            We plan the website, connect the useful parts, and stay when
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

        <figure className="lf-hero__scene" aria-labelledby="lf-counter-caption">
          <picture>
            <source
              media="(width < 48rem)"
              srcSet="/images/home/connected-counter-hero-mobile-v1.webp"
              type="image/webp"
            />
            <img
              src="/images/home/connected-counter-hero-desktop-v1.webp"
              width="1672"
              height="941"
              alt="Illustrative small-business counter with keys, a website tablet, booking terminal, router, phone, receipt printer, and support notebook joined by an orange cable"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </picture>

          <ol
            key={`${replay}-${motionReduced ? "still" : "motion"}`}
            className={`lf-hero__path${replay > 0 && !motionReduced ? " lf-hero__path--replaying" : ""}`}
            aria-label="One connected customer path"
          >
            {CONNECTED_PATH.map((step, index) => (
              <li
                key={step.label}
                className={`lf-hero__path-step lf-hero__path-step--${index + 1}`}
                style={{ "--lf-path-order": index } as React.CSSProperties}
              >
                <strong>{step.label}</strong>
                <span>{step.note}</span>
              </li>
            ))}
          </ol>

          <div className="lf-hero__path-controls" aria-label="Connected path motion controls">
            <button
              type="button"
              onClick={() => setReplay((current) => current + 1)}
              disabled={motionReduced}
            >
              <RotateCcw size={16} strokeWidth={2} aria-hidden="true" />
              Replay the path
            </button>
            <button
              type="button"
              aria-pressed={motionReduced}
              disabled={systemReducedMotion}
              onClick={() => setManualReducedMotion((current) => !current)}
            >
              <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              {motionReduced ? "Motion reduced" : "Reduce motion"}
            </button>
          </div>

          <figcaption id="lf-counter-caption">
            Illustrative Little Fight scene — no client data
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

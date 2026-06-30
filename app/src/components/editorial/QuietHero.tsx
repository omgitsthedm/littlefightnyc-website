import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import "./QuietHero.css";

// Plain-text split helper: each char becomes a <span> with --lf-i index
// so the CSS can stagger the cascade reveal.
function cascade(text: string, startIdx: number, prefix: string) {
  return [...text].map((c, i) => (
    <span
      key={`${prefix}-${i}`}
      className="lf-hero__char"
      style={{ ["--lf-i" as string]: `${startIdx + i}` }}
    >
      {c === " " ? " " : c}
    </span>
  ));
}

// Each marquee item links to the page that addresses the problem.
// Common NYC small-business issues → relevant answer / journal / service.
const MARQUEE_ITEMS: { label: string; to: string }[] = [
  { label: "Broken POS", to: "/services/it-support/" },
  { label: "Domain dispute", to: "/services/it-support/" },
  { label: "Email going to spam", to: "/services/it-support/" },
  { label: "Google Maps wrong", to: "/answers/business-not-showing-on-google-maps/" },
  { label: "Contact form silent", to: "/answers/website-form-not-working-small-business/" },
  { label: "Squarespace migration", to: "/journal/migrate-off-squarespace-without-breaking-booking/" },
  { label: "Failed payment processor", to: "/services/it-support/" },
  { label: "Unverified listing", to: "/answers/business-not-showing-on-google-maps/" },
  { label: "Duplicate software tools", to: "/journal/keep-connect-replace-build-framework/" },
  { label: "Missed callbacks", to: "/fit-check/" },
  { label: "Booking link dead", to: "/answers/website-form-not-working-small-business/" },
  { label: "Website timing out", to: "/fit-check/" },
  { label: "WiFi down at the counter", to: "/services/it-support/" },
  { label: "Printer offline", to: "/services/it-support/" },
  { label: "Lead form sending to nobody", to: "/answers/website-form-not-working-small-business/" },
  { label: "Monthly bill creep", to: "/journal/read-your-monthly-software-bill/" },
];

const CONTACT_CHANNELS = [
  {
    label: "Call",
    detail: "(646) 360-0318",
    note: "If something is broken",
    href: "tel:+16463600318",
  },
  {
    label: "Text",
    detail: "(646) 360-0318",
    note: "Quick at the counter",
    action: "text",
  },
  {
    label: "Email",
    detail: "hello@littlefightnyc.com",
    note: "For the longer version",
    href: "mailto:hello@littlefightnyc.com",
  },
  {
    label: "Form",
    detail: "Fit Check",
    note: "When it has parts",
    to: "/fit-check/",
  },
] as const;

const SMS_URL = `${String.fromCharCode(115, 109, 115, 58)}+16463600318`;

function openTextMessage() {
  window.location.href = SMS_URL;
}

export default function QuietHero() {
  const claimRef = useScrollReveal<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section className="lf-hero" aria-label="Little Fight NYC">
      <div className="lf-hero__image" aria-hidden="true">
        <picture>
          <source
            media="(max-width: 767px)"
            srcSet="/assets/hero-soho-crosswalk-480.webp 480w, /assets/hero-soho-crosswalk-640.webp 640w"
            sizes="100vw"
            type="image/webp"
          />
          <source
            media="(max-width: 1279px)"
            srcSet="/assets/hero-soho-crosswalk-640.webp 640w, /assets/hero-soho-crosswalk-900.webp 900w, /assets/hero-soho-crosswalk-1200.webp 1200w"
            sizes="100vw"
            type="image/webp"
          />
          <source
            srcSet="/assets/hero-soho-crosswalk-900.webp 900w, /assets/hero-soho-crosswalk-1200.webp 1200w, /assets/hero-soho-crosswalk-1600.webp 1600w"
            sizes="100vw"
            type="image/webp"
          />
          <img
            src="/assets/hero-soho-crosswalk-480.webp"
            srcSet="/assets/hero-soho-crosswalk-480.webp 480w, /assets/hero-soho-crosswalk-640.webp 640w, /assets/hero-soho-crosswalk-900.webp 900w, /assets/hero-soho-crosswalk-1200.webp 1200w, /assets/hero-soho-crosswalk-1600.webp 1600w"
            sizes="100vw"
            width="1600"
            height="1200"
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </div>

      <div ref={claimRef} className="lf-hero__content">
        <h1 className="lf-hero__claim">
          <span className="lf-hero__line">{cascade("Tech for the shops", 0, "a")}</span>
          {" "}
          <span className="lf-hero__line">{cascade("that built", 20, "b")}</span>
          {" "}
          <span className="lf-hero__line lf-hero__claim-em">
            {cascade("New York.", 32, "c")}
          </span>
        </h1>

        <div className="lf-hero__brief">
          <p>
            Websites, IT help, Google visibility, software cleanup, and
            cleaner systems for NYC shops, salons, bars, clinics, restaurants,
            and owner-run teams.
          </p>
          <p className="lf-hero__promise">
            Tell us what's broken. We'll fix it or tell you who can. No ticket maze.
          </p>
        </div>

        <ul className="lf-hero__channels" aria-label="Contact Little Fight NYC">
          {CONTACT_CHANNELS.map((channel) => (
            <li key={channel.label}>
              {"to" in channel ? (
                <Link className="lf-hero__channel" to={channel.to}>
                  <span className="lf-hero__channel-label">{channel.label}</span>
                  <span className="lf-hero__channel-detail">{channel.detail}</span>
                  <span className="lf-hero__channel-note">{channel.note}</span>
                </Link>
              ) : "action" in channel ? (
                <button className="lf-hero__channel" type="button" onClick={openTextMessage}>
                  <span className="lf-hero__channel-label">{channel.label}</span>
                  <span className="lf-hero__channel-detail">{channel.detail}</span>
                  <span className="lf-hero__channel-note">{channel.note}</span>
                </button>
              ) : (
                <a className="lf-hero__channel" href={channel.href}>
                  <span className="lf-hero__channel-label">{channel.label}</span>
                  <span className="lf-hero__channel-detail">{channel.detail}</span>
                  <span className="lf-hero__channel-note">{channel.note}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="lf-hero__marquee" aria-label="A sample of what we fix">
        <div className="lf-hero__marquee-track">
          {[0, 1].map((dup) => (
            <ul key={dup} className="lf-hero__marquee-list" aria-hidden={dup === 1}>
              <li className="lf-hero__marquee-label">Today we're fixing</li>
              {MARQUEE_ITEMS.map((item) => (
                <li key={`${dup}-${item.label}`} className="lf-hero__marquee-item">
                  <Link
                    to={item.to}
                    className="lf-hero__marquee-link"
                    tabIndex={dup === 1 ? -1 : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

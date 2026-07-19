import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2, MapPin, Phone, ShieldCheck, Clock } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import "./QuietHero.css";

// Plain-text split helper: each char becomes a <span> with a --lf-i index so
// the CSS can stagger the cascade reveal. Chars are grouped into per-word
// wrappers (inline-block, nowrap) so the headline breaks only BETWEEN words —
// never mid-word — while the character animation is preserved.
function cascade(text: string, startIdx: number, prefix: string) {
  const out: ReactNode[] = [];
  const words = text.split(" ");
  let idx = startIdx;
  words.forEach((word, wi) => {
    const chars = [...word].map((c) => {
      const el = (
        <span
          key={`${prefix}-${idx}`}
          className="lf-hero__char"
          style={{ ["--lf-i" as string]: `${idx}` }}
        >
          {c}
        </span>
      );
      idx += 1;
      return el;
    });
    out.push(
      <span key={`${prefix}-w-${wi}`} className="lf-hero__word">
        {chars}
      </span>
    );
    if (wi < words.length - 1) {
      out.push(
        <span
          key={`${prefix}-sp-${idx}`}
          className="lf-hero__char lf-hero__space"
          style={{ ["--lf-i" as string]: `${idx}` }}
        >
          {" "}
        </span>
      );
      idx += 1;
    }
  });
  return out;
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
  { label: "Missed callbacks", to: "/tech-audit/" },
  { label: "Booking link dead", to: "/answers/website-form-not-working-small-business/" },
  { label: "Website timing out", to: "/tech-audit/" },
  { label: "Wi-Fi down at the counter", to: "/services/it-support/" },
  { label: "Printer offline", to: "/services/it-support/" },
  { label: "Lead form sending to nobody", to: "/answers/website-form-not-working-small-business/" },
  { label: "Monthly bill creep", to: "/journal/read-your-monthly-software-bill/" },
];

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
        {/* The letter-split spans garble screen-reader output ("T e c h f o r…"),
            so the real sentence lives on the h1 and the visual letters are hidden. */}
        <h1 className="lf-hero__claim" aria-label="Websites bring business. We keep it running.">
          <span aria-hidden="true">
            <span className="lf-hero__line">{cascade("Websites bring business.", 0, "a")}</span>
            {" "}
            <span className="lf-hero__line lf-hero__claim-em">
              {cascade("We keep it running.", 26, "b")}
            </span>
          </span>
        </h1>

        <div className="lf-hero__brief">
          <p>
            We build local websites, fix urgent tech, and replace bloated software
            with tools your business owns.
          </p>
        </div>

        <div className="lf-hero__actions" aria-label="Choose how to start">
          <Link
            className="lf-hero__action lf-hero__action--website"
            to="/tech-audit/?intent=website"
            data-lf-event="website_plan_intent"
            data-lf-label="home_hero"
          >
            <Globe2 size={22} strokeWidth={1.75} aria-hidden="true" />
            <span className="lf-hero__action-copy">
              <strong>Plan my website</strong>
              <span>Free consult, then a clear scope</span>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <a className="lf-hero__action lf-hero__action--support" href="tel:+16463600318">
            <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
            <span className="lf-hero__action-copy">
              <strong>Get urgent tech help</strong>
              <span>Call (646) 360-0318</span>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>

        <ul className="lf-hero__trust" aria-label="Why owners choose us">
          <li>
            <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>NYC-based, on-site when needed</span>
          </li>
          <li>
            <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>2-hour callback window</span>
          </li>
          <li>
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" />
            <span>Own your code and data</span>
          </li>
        </ul>
      </div>

      <div className="lf-hero__marquee" aria-label="A sample of what we fix">
        <div className="lf-hero__marquee-track">
          {[0, 1].map((dup) => (
            <ul key={dup} className="lf-hero__marquee-list" aria-hidden={dup === 1}>
              <li className="lf-hero__marquee-label">The kind of thing we fix</li>
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

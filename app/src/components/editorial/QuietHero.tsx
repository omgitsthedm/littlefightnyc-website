import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Phone, MessageSquare, Mail, ClipboardCheck, ArrowUpRight } from "lucide-react";
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

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    label: "Call",
    detail: "(646) 360-0318",
    shortDetail: "Call us",
    note: "If something is broken",
    href: "tel:+16463600318",
  },
  {
    icon: MessageSquare,
    label: "Text",
    detail: "(646) 360-0318",
    note: "Quick at the counter",
    action: "text",
  },
  {
    icon: Mail,
    label: "Email",
    detail: "hello@littlefightnyc.com",
    note: "For the longer version",
    href: "mailto:hello@littlefightnyc.com",
  },
  {
    icon: ClipboardCheck,
    label: "Form",
    detail: "Tech Audit",
    note: "When it has parts",
    to: "/tech-audit/",
    primary: true,
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
        {/* The letter-split spans garble screen-reader output ("T e c h f o r…"),
            so the real sentence lives on the h1 and the visual letters are hidden. */}
        <h1 className="lf-hero__claim" aria-label="Tech for the shops that built New York.">
          <span aria-hidden="true">
            <span className="lf-hero__line">{cascade("Tech for the shops", 0, "a")}</span>
            {" "}
            <span className="lf-hero__line">{cascade("that built", 20, "b")}</span>
            {" "}
            <span className="lf-hero__line lf-hero__claim-em">
              {cascade("New York.", 32, "c")}
            </span>
          </span>
        </h1>

        <div className="lf-hero__brief">
          <p>
            Websites, IT help, Google visibility, software cleanup, and cleaner
            systems for NYC bars, salons, law firms, clinics, restaurants,
            clothing brands, and every owner-run shop.
          </p>
          <p className="lf-hero__promise">
            Tell us what's broken. We'll fix it or tell you who can. No ticket maze.
          </p>
        </div>

        <ul className="lf-hero__channels" aria-label="Contact Little Fight NYC">
          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isPrimary = "primary" in channel && channel.primary;
            const inner = (
              <>
                <span className="lf-hero__channel-top">
                  <span className="lf-hero__channel-icon" aria-hidden="true">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="lf-hero__channel-label">{channel.label}</span>
                  <ArrowUpRight className="lf-hero__channel-go" size={15} strokeWidth={2} aria-hidden="true" />
                </span>
                <span
                  className={`lf-hero__channel-detail${
                    "shortDetail" in channel ? " lf-hero__channel-detail--full" : ""
                  }`}
                >
                  {channel.detail}
                </span>
                {"shortDetail" in channel && (
                  <span className="lf-hero__channel-detail lf-hero__channel-detail--short">
                    {channel.shortDetail}
                  </span>
                )}
                <span className="lf-hero__channel-note">{channel.note}</span>
              </>
            );
            const cls = `lf-hero__channel${isPrimary ? " lf-hero__channel--primary" : ""}`;
            return (
              <li key={channel.label}>
                {"to" in channel ? (
                  <Link className={cls} to={channel.to}>{inner}</Link>
                ) : "action" in channel ? (
                  <button className={cls} type="button" onClick={openTextMessage}>{inner}</button>
                ) : (
                  <a className={cls} href={channel.href}>{inner}</a>
                )}
              </li>
            );
          })}
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

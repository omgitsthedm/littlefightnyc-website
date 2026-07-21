import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2, Phone } from "lucide-react";
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
            We build websites that bring in customers, fix broken tech, and
            replace expensive software. You own everything.
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
              <span>Free talk. Then a real plan.</span>
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

      </div>
    </section>
  );
}

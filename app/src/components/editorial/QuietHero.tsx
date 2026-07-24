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
          <img
            src="/images/brand-scenes/storefronts-dawn.webp"
            srcSet="/images/brand-scenes/storefronts-dawn-480.webp 480w, /images/brand-scenes/storefronts-dawn-900.webp 900w, /images/brand-scenes/storefronts-dawn-1200.webp 1200w, /images/brand-scenes/storefronts-dawn.webp 1672w"
            sizes="100vw"
            width="1672"
            height="941"
            alt=""
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </div>

      <div ref={claimRef} className="lf-hero__content">
        {/* The letter-split spans garble screen-reader output ("T e c h f o r…"),
            so the real sentence lives on the h1 and the visual letters are hidden. */}
        <h1 className="lf-hero__claim" aria-label="Your business is custom. Your website should be too.">
          <span aria-hidden="true">
            <span className="lf-hero__line">{cascade("Your business is custom.", 0, "a")}</span>
            {" "}
            <span className="lf-hero__line lf-hero__claim-em">
              {cascade("Your website should be too.", 25, "b")}
            </span>
          </span>
        </h1>

        <div className="lf-hero__brief">
          <p>
            Websites customers can find. Help when technology breaks. Focused
            tools you own. We keep what works and explain every step in plain
            English.
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
              <strong>Get my website plan</strong>
              <span>Show us what you have. The first look is free.</span>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
          <a className="lf-hero__action lf-hero__action--support" href="tel:+16463600318">
            <Phone size={22} strokeWidth={1.75} aria-hidden="true" />
            <span className="lf-hero__action-copy">
              <strong>Call about broken tech</strong>
              <span>(646) 360-0318 · A person answers.</span>
            </span>
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>

      </div>
    </section>
  );
}

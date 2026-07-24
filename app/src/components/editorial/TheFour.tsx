import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./TheFour.css";

const PATHS = [
  {
    name: "A website that earns trust",
    situation: "People hear your name, search for you, and need a reason to call.",
    outcome: "A fast custom site that sounds like the business, works on every phone, and is easy to find.",
    to: "/services/custom-local-websites/",
    cta: "See how websites work",
    image: "storefronts-dawn",
    alt: "New York storefronts opening at dawn",
  },
  {
    name: "Help when tech breaks",
    situation: "The register, Wi-Fi, email, booking, or printer stops the day.",
    outcome: "We find the real problem, fix it, and leave clear instructions.",
    to: "/services/it-support/",
    cta: "Get tech help",
    image: "restaurant-counter",
    alt: "A restaurant counter set up for service",
  },
  {
    name: "A free second opinion",
    situation: "A vendor says you need more software, but the answer does not feel right.",
    outcome: "We look at the whole setup and tell you what to keep, fix, or skip.",
    to: "/services/tech-consulting/",
    cta: "Get a second opinion",
    image: "shop-back-office",
    alt: "A neighborhood shop back office with everyday business tools",
  },
  {
    name: "Software that fits the work",
    situation: "The monthly tool costs too much and still acts like a difficult spreadsheet.",
    outcome: "We build the focused tool your team needs, and you own it.",
    to: "/services/business-systems/",
    cta: "See software you own",
    image: "salon-systems",
    alt: "A salon work area with booking and payment tools",
  },
] as const;

function PathImage({ image, alt }: { image: string; alt: string }) {
  return (
    <picture>
      <source
        srcSet={`/images/brand-scenes/${image}-480.webp 480w, /images/brand-scenes/${image}-640.webp 640w, /images/brand-scenes/${image}-900.webp 900w, /images/brand-scenes/${image}-1200.webp 1200w, /images/brand-scenes/${image}.webp 1672w`}
        sizes="(min-width: 960px) 38vw, 100vw"
        type="image/webp"
      />
      <img
        src={`/images/brand-scenes/${image}-900.webp`}
        width="900"
        height="507"
        loading="lazy"
        decoding="async"
        alt={alt}
      />
    </picture>
  );
}

export default function TheFour() {
  return (
    <section className="lf-four" aria-labelledby="lf-four-title">
      <header className="lf-four__head">
        <p className="lf-four__eyebrow">Start with the problem</p>
        <h2 id="lf-four-title" className="lf-four__title">
          You do not need to know the tech word.
        </h2>
        <p className="lf-four__dek">
          Tell us what is getting in the way. We will show you the useful next
          move, the cost, and what can stay exactly as it is.
        </p>
      </header>

      <div className="lf-four__grid">
        {PATHS.map((path, index) => (
          <article
            className={`lf-four__path${index === 0 ? " lf-four__path--lead" : ""}`}
            key={path.name}
          >
            <div className="lf-four__image">
              <PathImage image={path.image} alt={path.alt} />
              <span className="lf-four__number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="lf-four__copy">
              <h3 className="lf-four__name">{path.name}</h3>
              <p className="lf-four__situation">{path.situation}</p>
              <p className="lf-four__outcome">{path.outcome}</p>
              <Link className="lf-four__cta" to={path.to}>
                {path.cta}
                <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

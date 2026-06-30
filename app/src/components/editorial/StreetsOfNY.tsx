import { useScrollReveal } from "./useScrollReveal";
import "./StreetsOfNY.css";

const FRAMES = [
  {
    src: "/assets/local-business-base.webp",
    alt: "A neighborhood storefront in New York",
    caption: "Storefront",
    locale: "Lower East Side",
  },
  {
    src: "/assets/typing.webp",
    alt: "An owner working late on a small business laptop",
    caption: "After hours",
    locale: "Brooklyn",
  },
  {
    src: "/assets/nyc-street.webp",
    alt: "A New York street at dusk",
    caption: "The block",
    locale: "Manhattan",
  },
  {
    src: "/assets/pos.webp",
    alt: "A point-of-sale system on a counter",
    caption: "Point of sale",
    locale: "Midtown",
  },
  {
    src: "/assets/hero-laptop.webp",
    alt: "A laptop screen open in a small office",
    caption: "Open browser",
    locale: "Soho",
  },
] as const;

export default function StreetsOfNY() {
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const stripRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="lf-streets" aria-labelledby="lf-streets-heading">
      <div ref={headRef} className="lf-container lf-streets__head">
        <p className="lf-mono lf-streets__eyebrow">
          <span className="lf-streets__eyebrow-num">II.</span>
          <span className="lf-streets__eyebrow-divider" aria-hidden="true">·</span>
          Photo Essay
        </p>
        <h2 id="lf-streets-heading" className="lf-display lf-streets__title">
          Streets <span className="lf-italic">of</span><br />
          New York.
        </h2>
        <p className="lf-streets__lede">
          The work happens behind these doors — between the lunch rush and the
          register close, the missed call and the booking, the broken POS and
          the next customer through the door.
        </p>
      </div>

      <div ref={stripRef} className="lf-streets__strip" role="list">
        {FRAMES.map((frame, i) => (
          <figure key={i} className="lf-streets__frame" role="listitem">
            <div className="lf-streets__frame-image">
              <img
                src={frame.src}
                alt={frame.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className="lf-streets__frame-cap">
              <span className="lf-mono lf-streets__frame-num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="lf-streets__frame-meta">
                <span className="lf-italic lf-streets__frame-name">{frame.caption}</span>
                <span className="lf-mono lf-streets__frame-locale">{frame.locale}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

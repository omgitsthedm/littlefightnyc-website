import { useScrollReveal } from "./useScrollReveal";
import "./TheFight.css";

const SHOPS = [
  { vs: "Chain pharmacy", shop: "Bodega" },
  { vs: "Sephora", shop: "Salon" },
  { vs: "Starbucks", shop: "Café" },
  { vs: "Amazon", shop: "Cobbler" },
  { vs: "Resy's chain rollout", shop: "Bar" },
  { vs: "Lab Corp", shop: "Family clinic" },
] as const;

export default function TheFight() {
  const figRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="lf-fight" aria-labelledby="lf-fight-heading">
      <div ref={headRef} className="lf-container lf-fight__head-wrap">
        <p className="lf-mono lf-fight__eyebrow">
          <span className="lf-fight__eyebrow-num">I.</span>
          <span className="lf-fight__eyebrow-divider" aria-hidden="true">·</span>
          The Fight
        </p>

        <h2 id="lf-fight-heading" className="lf-display lf-fight__title">
          Your shop.<br />
          Your block.<br />
          <span className="lf-italic">Your customers.</span>
        </h2>
      </div>

      {/* Full-bleed photograph */}
      <div ref={figRef} className="lf-fight__cover">
        <div className="lf-fight__cover-frame">
          <img
            src="/assets/nyc-street.webp"
            alt="A New York City street at dusk"
            width={2400}
            height={1350}
            loading="lazy"
            decoding="async"
          />
        </div>
        <figcaption className="lf-fight__cover-caption">
          <span className="lf-mono lf-fight__cover-tag">Photograph</span>
          <span className="lf-italic lf-fight__cover-text">
            A block in Manhattan, after the lunch rush. Different shops. Same fight.
          </span>
        </figcaption>
      </div>

      <div className="lf-container lf-fight__grid">
        <div className="lf-fight__col-text">
          <p className="lf-fight__lede">
            The bodega across from a chain pharmacy. The salon next to
            Sephora. The café watching Starbucks open down the block.
            Different shops. Same fight.
          </p>

          <p className="lf-fight__body">
            Rent goes up. Software bills go up. The math gets harder every
            year. Little Fight NYC gives small NYC shops the same tools the
            chains use — sized for what a corner shop can actually afford.
            Three jobs: shrink the bills, grow the business, keep the shop
            a staple of the neighborhood.
          </p>
        </div>

        <ol className="lf-fight__matchups" aria-label="Examples of the fight">
          {SHOPS.map((m, i) => (
            <li key={i} className="lf-fight__matchup">
              <span className="lf-mono lf-fight__num">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="lf-display lf-fight__shop">{m.shop}</span>
              <span className="lf-mono lf-fight__vs">vs.</span>
              <span className="lf-fight__opponent">{m.vs}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

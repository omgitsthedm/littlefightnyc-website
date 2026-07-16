/**
 * Main Street — the human faces the brand is for. Authentic small-business
 * photography (Unsplash), loaded smoothly: fixed-aspect cells (zero CLS),
 * lazy + responsive srcset, gentle fade-in on load. Reduced-motion safe.
 */
import { skelImg } from "@/lib/imgSkeleton";
import "./MainStreetBand.css";

const SHOTS = [
  { src: "mainstreet-cafe-owner", cap: "The corner store" },
  { src: "mainstreet-shopkeeper", cap: "The maker" },
  { src: "mainstreet-salon", cap: "The salon chair" },
  { src: "mainstreet-service", cap: "The hand-off" },
  { src: "mainstreet-shop-women", cap: "The regulars" },
  { src: "mainstreet-coffee", cap: "The morning rush" },
  { src: "mainstreet-market", cap: "Main street" },
  { src: "mainstreet-florist", cap: "The florist" },
  { src: "mainstreet-counter", cap: "The front desk" },
];

export default function MainStreetBand() {
  return (
    <section className="lf-mainstreet" aria-labelledby="lf-mainstreet-title">
      <div className="lf-mainstreet__inner">
        <p className="lf-mainstreet__eyebrow">Main Street</p>
        <h2 className="lf-mainstreet__title" id="lf-mainstreet-title">
          The people we <span>build for</span>.
        </h2>
        <p className="lf-mainstreet__lead">
          Not Amazon. Not Walmart. The shop with the hand-lettered sign, the owner who knows your
          order, the fix that has to work by Saturday.
        </p>
        <div className="lf-mainstreet__grid">
          {SHOTS.map((s) => (
            <figure className="lf-mainstreet__cell" key={s.src}>
              <img
                {...skelImg}
                className="lf-mainstreet__img"
                src={`/assets/${s.src}.webp`}
                srcSet={`/assets/${s.src}-480.webp 480w, /assets/${s.src}-640.webp 640w, /assets/${s.src}-900.webp 900w, /assets/${s.src}.webp 1400w`}
                sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 22vw"
                alt=""
                loading="lazy"
                decoding="async"
              />
              <figcaption>{s.cap}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

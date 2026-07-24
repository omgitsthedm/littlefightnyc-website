import { Phone } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { useScrollReveal } from "./useScrollReveal";
import "./FounderCard.css";

/**
 * The small-firm operating standard, shown through an illustrative business
 * environment instead of a personality portrait.
 */
export default function FounderCard({
  sceneSrc = "/images/brand-scenes/restaurant-counter.webp",
}: {
  sceneSrc?: string;
}) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.2 });
  const sceneResponsive = responsiveImageProps(
    sceneSrc,
    "(max-width: 640px) 100vw, 42vw",
    [480, 900, 1200],
  );
  const sceneSrcSet = "srcSet" in sceneResponsive && sceneResponsive.srcSet
    ? `${sceneResponsive.srcSet}, ${sceneSrc} 1672w`
    : undefined;

  return (
    <aside ref={ref} className="lf-founder" aria-label="How Little Fight NYC works">
      <div className="lf-founder__panel">
        <img
          className="lf-founder__photo"
          src={sceneSrc}
          srcSet={sceneSrcSet}
          sizes={sceneResponsive.sizes}
          alt="A point-of-sale counter inside a neighborhood restaurant"
          width="1672"
          height="941"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="lf-founder__body">
        <p className="lf-founder__eyebrow">Small on purpose</p>
        <p className="lf-founder__name">
          One accountable firm
        </p>
        <p className="lf-founder__line">
          The person who learns the business stays close to the work. Fewer
          handoffs, clear responsibility, a two-hour callback window, and
          on-site help within a day when it is urgent.
        </p>
        <p className="lf-founder__meta">
          <a className="lf-founder__tel" href="tel:+16463600318">
            <Phone size={15} strokeWidth={2} aria-hidden="true" />
            (646) 360-0318
          </a>
          <span className="lf-founder__since">Since 2021</span>
        </p>
      </div>
    </aside>
  );
}

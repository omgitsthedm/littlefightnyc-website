import { useScrollReveal } from "./useScrollReveal";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./BrandLine.css";

/**
 * One photograph. One short statement. Nothing else.
 */
export default function BrandLine() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="lf-line" aria-label="Brand statement">
      <div className="lf-line__image" aria-hidden="true">
        <img
          src="/assets/nyc-chinatown-night.webp"
          {...responsiveImageProps(
            "/assets/nyc-chinatown-night.webp",
            "100vw",
            [640, 900],
          )}
          alt=""
          width={1800}
          height={2700}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div ref={ref} className="lf-line__content">
        <p className="lf-line__text">
          Small shops compete every day.
          <br />
          <span className="lf-line__em">We hand them the tools the chains use.</span>
        </p>
      </div>
    </section>
  );
}

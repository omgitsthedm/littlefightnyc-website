import type { LucideIcon } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./PageHero.css";

type Props = {
  eyebrow?: string;
  icon?: LucideIcon;
  title: React.ReactNode;
  dek?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
};

/**
 * Reusable hero for every inner page. Eyebrow (small mono, with an optional
 * content-type wayfinding icon chip), big serif title, optional italic dek,
 * optional image. One purpose: tell the visitor what kind of page they're on.
 */
export default function PageHero({ eyebrow, icon: Icon, title, dek, image }: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ revealOnMount: true });

  return (
    <section className={`lf-pagehero ${image ? "lf-pagehero--with-image" : ""}`}>
      <div ref={ref} className="lf-pagehero__inner">
        <div className="lf-pagehero__text">
          {(eyebrow || Icon) && (
            <p className="lf-pagehero__eyebrow">
              {Icon && (
                <span className="lf-pagehero__eyebrow-icon" aria-hidden="true">
                  <Icon size={15} strokeWidth={2} />
                </span>
              )}
              {eyebrow}
            </p>
          )}
          <h1 className="lf-pagehero__title">{title}</h1>
          {dek && <p className="lf-pagehero__dek">{dek}</p>}
        </div>

        {image && (
          <div className="lf-pagehero__image">
            <img
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              {...responsiveImageProps(
                image.src,
                "(min-width: 1440px) 36vw, (min-width: 1024px) 42vw, 100vw",
                [480, 640, 900],
              )}
              fetchPriority="high"
              decoding="async"
            />
          </div>
        )}
      </div>
    </section>
  );
}

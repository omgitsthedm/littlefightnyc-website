import { useScrollReveal } from "./useScrollReveal";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./PageHero.css";

type Props = {
  eyebrow?: string;
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
 * Reusable hero for every inner page. Eyebrow (small mono), big serif title,
 * optional italic dek, optional image. No icons, no buttons, no underlines.
 * One purpose: tell the visitor what page they're on, quietly.
 */
export default function PageHero({ eyebrow, title, dek, image }: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ revealOnMount: true });

  return (
    <section className={`lf-pagehero ${image ? "lf-pagehero--with-image" : ""}`}>
      <div ref={ref} className="lf-pagehero__inner">
        <div className="lf-pagehero__text">
          {eyebrow && <p className="lf-pagehero__eyebrow">{eyebrow}</p>}
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

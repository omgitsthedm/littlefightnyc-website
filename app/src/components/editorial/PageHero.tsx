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
  /**
   * Case-study archetype: the project screenshot runs full-bleed BEHIND the
   * title under a dark scrim. The work IS the hero.
   */
  backdrop?: {
    src: string;
    alt: string;
  };
  /**
   * Answer archetype: an orange "quick answer" card sits right in the hero.
   * No photo — the page should look like an answer, not a brochure.
   */
  quickAnswer?: React.ReactNode;
  /**
   * Area archetype: the neighborhood name at display scale above the h1.
   * Decorative (the eyebrow already names it for screen readers).
   */
  displayName?: string;
  /** Area archetype: small mono chips (e.g. ZIP codes) under the dek. */
  chips?: string[];
};

/**
 * Reusable hero for every inner page — now with archetypes so no two page
 * types feel stamped from one template:
 * - default: eyebrow + big title + dek (+ optional side image)
 * - case (`backdrop`): full-bleed project screenshot behind the title
 * - answer (`quickAnswer`): pure type + an orange quick-answer card
 * - area (`displayName` + `chips`): giant neighborhood name + ZIP chips
 */
export default function PageHero({
  eyebrow,
  icon: Icon,
  title,
  dek,
  image,
  backdrop,
  quickAnswer,
  displayName,
  chips,
}: Props) {
  const ref = useScrollReveal<HTMLDivElement>({ revealOnMount: true });

  // Full-bleed backdrop: responsive variants ship at 480/640/900 — include the
  // original full-size asset so big screens still get a sharp image.
  const backdropImg = backdrop
    ? (() => {
        const p = responsiveImageProps(backdrop.src, "100vw", [640, 900]);
        return "srcSet" in p && p.srcSet
          ? { sizes: p.sizes, srcSet: `${p.srcSet}, ${backdrop.src} 1800w` }
          : p;
      })()
    : undefined;

  const variantClass = [
    image ? "lf-pagehero--with-image" : "",
    backdrop ? "lf-pagehero--case" : "",
    quickAnswer ? "lf-pagehero--answer" : "",
    displayName ? "lf-pagehero--area" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={`lf-pagehero ${variantClass}`}>
      {backdrop && (
        <div className="lf-pagehero__backdrop" aria-hidden="true">
          <img
            src={backdrop.src}
            alt=""
            {...backdropImg}
            fetchPriority="high"
            decoding="async"
          />
          <span className="lf-pagehero__scrim" />
        </div>
      )}

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
          {displayName && (
            <p className="lf-pagehero__display" aria-hidden="true">
              <em>{displayName}</em>
            </p>
          )}
          <h1 className="lf-pagehero__title">{title}</h1>
          {dek && <p className="lf-pagehero__dek">{dek}</p>}
          {quickAnswer && (
            <aside className="lf-pagehero__quick" aria-label="Quick answer">
              <span className="lf-pagehero__quick-label">Quick answer</span>
              <p className="lf-pagehero__quick-body">{quickAnswer}</p>
            </aside>
          )}
          {chips && chips.length > 0 && (
            <ul className="lf-pagehero__chips" aria-label="ZIP codes we cover here">
              {chips.map((chip) => (
                <li key={chip} className="lf-pagehero__chip">
                  {chip}
                </li>
              ))}
            </ul>
          )}
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

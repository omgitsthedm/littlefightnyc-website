import { Link } from "react-router-dom";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "./WorkGrid.css";

const TILES = [
  {
    slug: "tech-consulting",
    label: "Tech Consulting",
    verb: "Audit",
    line: "Tools, costs, Google, and workflow. Free first read.",
    image: "/assets/nyc-hair-salon-street.webp",
    imageSmall: "/assets/nyc-hair-salon-street-900.webp",
  },
  {
    slug: "it-support",
    label: "IT Support",
    verb: "Fix",
    line: "Fast help when email, Wi-Fi, POS, or devices break.",
    image: "/assets/typing.webp",
    imageSmall: "/assets/typing.webp",
  },
  {
    slug: "custom-local-websites",
    label: "Custom Local Websites",
    verb: "Build",
    line: "Hand-built pages that make calls, bookings, and trust land.",
    image: "/assets/storefront-blue-gift-shop.webp",
    imageSmall: "/assets/storefront-blue-gift-shop-900.webp",
  },
  {
    slug: "business-systems",
    label: "Business Systems",
    verb: "Clean up",
    line: "Right-sized intake, follow-up, reporting, and tool cleanup.",
    image: "/assets/coworking-laptops.webp",
    imageSmall: "/assets/coworking-laptops-900.webp",
  },
] as const;

/**
 * The work, shown as four photographs. No copy. The label is the only word.
 * The whole photograph is the link.
 */
export default function WorkGrid() {
  return (
    <section className="lf-work" aria-label="What Little Fight does">
      <div className="lf-work__grid">
        {TILES.map((tile, index) => (
          <Link key={tile.slug} to={`/services/${tile.slug}/`} className="lf-work__tile">
            <div className="lf-work__tile-image" aria-hidden="true">
              <img
                src={tile.image}
                {...responsiveImageProps(
                  tile.image,
                  "(min-width: 768px) 42vw, 100vw",
                  [480, 640, 900],
                )}
                alt=""
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
            <div className="lf-work__tile-text">
              <span className="lf-work__tile-verb">{tile.verb}</span>
              <span className="lf-work__tile-label">{tile.label}</span>
              <span className="lf-work__tile-line">{tile.line}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

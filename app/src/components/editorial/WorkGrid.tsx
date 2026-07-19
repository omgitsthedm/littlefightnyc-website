import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2, Headphones, Search, Workflow } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { useScrollReveal } from "./useScrollReveal";
import "./WorkGrid.css";

const TILES = [
  {
    slug: "custom-local-websites",
    label: "Websites that bring in business",
    verb: "Build",
    line: "Calls, bookings, payments, and local search, built around the next customer.",
    image: "/assets/nyc-street.webp",
    icon: Globe2,
    priority: "primary",
  },
  {
    slug: "it-support",
    label: "Help when tech stops the day",
    verb: "Fix",
    line: "Remote or on-site help for email, Wi-Fi, POS, payments, and devices.",
    image: "/assets/typing.webp",
    icon: Headphones,
    priority: "support",
  },
  {
    slug: "tech-consulting",
    label: "A clear answer before you spend",
    verb: "Consult",
    line: "Consulting is always free. Keep what works, fix what matters, and skip what you do not need.",
    image: "/assets/nyc-hair-salon-street.webp",
    icon: Search,
    priority: "consulting",
  },
  {
    slug: "business-systems",
    label: "Software your business owns",
    verb: "Own",
    line: "Drop the pile of monthly subscriptions for one tool built around how you actually work. The code, data, and docs are yours.",
    image: "/assets/case-public-house-cockpit.webp",
    icon: Workflow,
    priority: "software",
  },
] as const;

/**
 * The commercial ladder, shown through real NYC and shipped-work imagery.
 * Tile size communicates priority: websites lead, support stays close, free
 * consulting removes risk, and owned software is the premium destination.
 */
export default function WorkGrid() {
  const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section className="lf-work" aria-labelledby="lf-work-title">
      <div className="lf-work__inner">
        <header className="lf-work__head">
          <h2 id="lf-work-title">Start with the website. Grow into the system.</h2>
          <p>
            Most clients meet us through a website. We stay useful when the register breaks,
            the software bill grows, or the business needs a tool of its own.
          </p>
        </header>
        <div ref={gridRef} className="lf-work__grid">
        {TILES.map((tile, index) => (
          <Link
            key={tile.slug}
            to={`/services/${tile.slug}/`}
            className={`lf-work__tile lf-work__tile--${tile.priority}`}
            style={{ ["--lf-i" as string]: index }}
          >
            <div className="lf-work__tile-image" aria-hidden="true">
              <img
                {...skelImg}
                src={tile.image}
                {...responsiveImageProps(
                  tile.image,
                  tile.priority === "primary"
                    ? "(min-width: 1080px) 58vw, 100vw"
                    : tile.priority === "software"
                      ? "100vw"
                      : "(min-width: 1080px) 42vw, (min-width: 760px) 50vw, 100vw",
                  [480, 640, 900],
                )}
                alt=""
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="lf-work__tile-text">
              <span className="lf-work__tile-icon" aria-hidden="true">
                <tile.icon size={34} strokeWidth={1.5} />
              </span>
              <span className="lf-work__tile-verb">{tile.verb}</span>
              <span className="lf-work__tile-label">{tile.label}</span>
              <span className="lf-work__tile-line">{tile.line}</span>
              <span className="lf-work__tile-go" aria-hidden="true">
                <ArrowUpRight size={19} strokeWidth={2} />
              </span>
            </div>
          </Link>
        ))}
        </div>
      </div>
    </section>
  );
}

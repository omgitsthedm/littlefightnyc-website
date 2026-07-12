import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { useScrollReveal } from "./useScrollReveal";
import { caseStudies } from "@/data/site";
import "./RecentClients.css";

/**
 * Recent work — real project screenshots, not a text list. Each card shows the
 * shipped work and links to its case study. First card runs wide as the featured
 * proof; the rest form a grid. Staggered reveal, hover lift + image zoom.
 */
const FEATURED_SLUGS = [
  "grand-funding-llc",
  "hair-by-rachel-charles",
  "cc-films",
  "public-house-creative",
  "deckspace",
] as const;

export default function RecentClients() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });

  const featured = FEATURED_SLUGS
    .map((slug) => caseStudies.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="lf-clients" aria-label="Recent work">
      <div className="lf-clients__inner">
        <div className="lf-clients__head">
          <p className="lf-mono lf-clients__label">Recent work</p>
          <Link to="/case-studies/" viewTransition className="lf-clients__all">
            All case studies <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div ref={ref} className="lf-clients__grid">
          {featured.map((study, i) => (
            <Link
              key={study.slug}
              to={`/case-studies/${study.slug}/`}
              viewTransition
              className={`lf-clients__card${i === 0 ? " lf-clients__card--feature" : ""}`}
              style={{ ["--lf-i" as string]: i }}
            >
              <span className="lf-clients__shot" aria-hidden="true">
                <img
                  src={study.image}
                  {...responsiveImageProps(study.image, "(min-width: 1024px) 42vw, 100vw", [480, 640, 900])}
                  alt=""
                  width={1600}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </span>
              <span className="lf-clients__meta">
                <span className="lf-mono lf-clients__type">{study.type}</span>
                <span className="lf-clients__client">{study.client}</span>
                <span className="lf-clients__title">{study.title}</span>
              </span>
              <ArrowUpRight className="lf-clients__go" size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

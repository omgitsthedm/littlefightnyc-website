import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { useScrollReveal } from "./useScrollReveal";
import { caseStudies } from "@/data/site";
import "./RecentClients.css";

/**
 * Recent work — real project screenshots, not a text list. Each card shows the
 * shipped work and links to its case study. First card runs wide as the featured
 * proof; the rest form a grid. Staggered reveal, hover lift + image zoom.
 */
const FEATURED_SLUGS = [
  "hair-by-rachel-charles",
  "public-house-creative",
  "venuecircuit",
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
          <div>
            <p className="lf-mono lf-clients__label">Shipped proof</p>
            <h2 className="lf-clients__heading">See the work before the pitch.</h2>
            <p className="lf-clients__lede">
              A booking site, a production cockpit, and an owned software product. Open every one.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div ref={ref} className="lf-clients__grid">
          {featured.map((study, i) => (
            <Link
              key={study.slug}
              to={`/case-studies/${study.slug}/`}
              className={`lf-clients__card${i === 0 ? " lf-clients__card--feature" : ""}`}
              style={{ ["--lf-i" as string]: i }}
            >
              <span className="lf-clients__shot" aria-hidden="true">
                <picture>
                  <source
                    media="(max-width: 767px)"
                    {...responsiveImageProps(study.image, "100vw", [480, 640])}
                  />
                  <img {...skelImg}
                    src={study.image}
                    {...responsiveImageProps(study.image, "(min-width: 1024px) 42vw, 100vw", [480, 640, 900])}
                    alt=""
                    width={1600}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </span>
              <span className="lf-clients__meta">
                <span className="lf-mono lf-clients__type">{study.type}</span>
                <span className="lf-clients__client">{study.client}</span>
                <span className="lf-clients__title">{study.title}</span>
                {study.metrics && (
                  <span className="lf-clients__facts" aria-label={`${study.client} project results`}>
                    {study.metrics.slice(0, 3).map((metric) => (
                      <span className="lf-clients__fact" key={metric.label}>
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
              <ArrowUpRight className="lf-clients__go" size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          ))}
        </div>

        <aside className="lf-clients__scan" aria-label="Free website scan">
          <span className="lf-clients__scan-icon" aria-hidden="true">
            <ScanSearch size={24} strokeWidth={1.75} />
          </span>
          <div className="lf-clients__scan-copy">
            <p className="lf-mono lf-clients__scan-label">Start with the free read</p>
            <h3>Get a practical website plan before you spend.</h3>
            <p>Send the current site and the goal. A real person reviews it and replies with the clearest next move. No meeting required.</p>
          </div>
          <a
            className="lf-clients__scan-cta"
            href="/tech-audit/?intent=website&source=home_proof_band"
            data-lf-event="tech_audit_started"
            data-lf-label="home_proof_band"
          >
            Plan my website
            <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}

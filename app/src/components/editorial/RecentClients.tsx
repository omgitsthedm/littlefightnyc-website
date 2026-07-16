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
  "grand-funding-llc",
  "hair-by-rachel-charles",
  "cc-films",
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
            <p className="lf-mono lf-clients__label">Recent work</p>
            <h2 className="lf-clients__heading">Websites already doing the work.</h2>
            <p className="lf-clients__lede">
              Real businesses, real launches — sites that turn a first visit into a phone call.
            </p>
          </div>
          <Link to="/case-studies/" viewTransition className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
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
                <img {...skelImg}
                  src={study.image}
                  {...responsiveImageProps(study.image, "(min-width: 1024px) 42vw, 100vw", [480, 640, 900])}
                  alt=""
                  width={1600}
                  height={1200}
                  loading="lazy"
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

        <aside className="lf-clients__scan" aria-label="Free website scan">
          <span className="lf-clients__scan-icon" aria-hidden="true">
            <ScanSearch size={24} strokeWidth={1.75} />
          </span>
          <div className="lf-clients__scan-copy">
            <p className="lf-mono lf-clients__scan-label">Not ready to talk?</p>
            <h3>See what your current website is costing you.</h3>
            <p>Run a free public-page scan for speed, mobile, search, and where you're losing customers. No account or access needed.</p>
          </div>
          <a
            className="lf-clients__scan-cta"
            href="https://audit.littlefightnyc.com/?source=homepage"
            data-lf-event="audit_scan_started"
            data-lf-label="home_proof_band"
          >
            Scan my website
            <ArrowUpRight size={17} strokeWidth={2} aria-hidden="true" />
          </a>
        </aside>
      </div>
    </section>
  );
}

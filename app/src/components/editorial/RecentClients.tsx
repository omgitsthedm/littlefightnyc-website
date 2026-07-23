import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import { caseStudies } from "@/data/site";
import "./RecentClients.css";

/**
 * Recent work — outcome-led project maps. Each card shows how the work moves
 * instead of asking a visitor to decode a homepage screenshot.
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
              A booking flow, private estimating software, and a venue financial product.
              Follow the working path for each one.
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
              <span
                className="lf-clients__flow"
                aria-label={`${study.showcase.label} project flow`}
                style={
                  { "--lf-client-stage-count": study.showcase.stages.length } as React.CSSProperties
                }
              >
                {study.showcase.stages.map((stage) => (
                  <span className="lf-clients__flow-stage" key={stage.label}>
                    <span className="lf-clients__flow-dot" aria-hidden="true" />
                    <span>{stage.label}</span>
                  </span>
                ))}
              </span>
              <span className="lf-clients__meta">
                <span className="lf-mono lf-clients__type">{study.showcase.context}</span>
                <span className="lf-clients__client">{study.showcase.label}</span>
                <span className="lf-clients__title">{study.title}</span>
                {study.metrics && (
                  <span className="lf-clients__facts" aria-label={`${study.showcase.label} project results`}>
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

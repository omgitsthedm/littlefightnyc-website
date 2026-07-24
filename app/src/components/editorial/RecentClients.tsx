import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { caseStudies } from "@/data/site";
import ProjectReviewGrid from "./ProjectReviewGrid";
import ProjectMomentum from "./ProjectMomentum";
import "./RecentClients.css";

/**
 * Recent work - public, checkable proof before any sales claim.
 */
const FEATURED_SLUGS = [
  "hair-by-rachel-charles",
  "after-hours-agenda",
  "grand-funding-llc",
] as const;

export default function RecentClients() {
  const featured = FEATURED_SLUGS
    .map((slug) => caseStudies.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="lf-clients" aria-label="Recent work">
      <div className="lf-clients__inner">
        <div className="lf-clients__head">
          <div>
            <p className="lf-mono lf-clients__label">Shipped work</p>
            <h2 className="lf-clients__heading">Real work, one clear view.</h2>
            <p className="lf-clients__lede">
              See the business problem, the build, and the result. Private
              systems stay closed; approved results are shown.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ProjectReviewGrid studies={featured} variant="home" />

        <ProjectMomentum variant="embedded" />

        <aside className="lf-clients__scan" aria-label="Free website scan">
          <span className="lf-clients__scan-icon" aria-hidden="true">
            <ScanSearch size={24} strokeWidth={1.75} />
          </span>
          <div className="lf-clients__scan-copy">
            <p className="lf-mono lf-clients__scan-label">Start with the free review</p>
            <h3>Show us the site you have now.</h3>
            <p>We will tell you what to keep, what to fix, and whether a custom build is worth it. Consulting is free.</p>
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

import { Link } from "react-router-dom";
import { ArrowUpRight, ScanSearch } from "lucide-react";
import { caseStudies } from "@/data/site";
import ProjectReviewGrid from "./ProjectReviewGrid";
import "./RecentClients.css";

/**
 * Recent work - public, checkable proof before any sales claim.
 */
const FEATURED_SLUGS = [
  "hair-by-rachel-charles",
  "cc-films",
  "venuecircuit",
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
            <p className="lf-mono lf-clients__label">Live work</p>
            <h2 className="lf-clients__heading">Current projects, one clear view.</h2>
            <p className="lf-clients__lede">
              Review each project the same way: what shipped, what changed, and
              where the work is live.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ProjectReviewGrid studies={featured} variant="home" />

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

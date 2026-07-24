import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
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
            <h2 className="lf-clients__heading">See what changed.</h2>
            <p className="lf-clients__lede">
              The business, what was getting in the way, what we built, and
              where it stands now. One clear format for every project.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every result <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <ProjectReviewGrid studies={featured} variant="home" />
        <ProjectMomentum variant="embedded" />
      </div>
    </section>
  );
}

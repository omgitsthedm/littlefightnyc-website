import { caseStudies } from "@/data/site-cases";
import ProjectReviewGrid from "./ProjectReviewGrid";
import "./WorkShowcase.css";

export const FEATURED_LIVE_CASE_SLUGS = [
  "hair-by-rachel-charles",
  "cc-films",
  "logan-loans",
  "chromatic-painting-design",
  "clearhelp",
  "grand-funding-llc",
  "the-break-room",
  "easy-tiger",
  "the-tarot-hotline",
] as const;

const OWNED_LIVE_CASE_SLUGS = ["after-hours-agenda"] as const;

export const FLEET_PROJECT_CASE_SLUGS = [
  ...FEATURED_LIVE_CASE_SLUGS,
  ...OWNED_LIVE_CASE_SLUGS,
] as const;

const featuredStudies = FEATURED_LIVE_CASE_SLUGS
  .map((slug) => caseStudies.find((study) => study.slug === slug))
  .filter((study): study is NonNullable<typeof study> => Boolean(study));

const ownedStudies = OWNED_LIVE_CASE_SLUGS.map(slug => caseStudies.find(study => study.slug === slug)).filter((study): study is NonNullable<typeof study> => Boolean(study));

export default function WorkShowcase() {

  return (
    <section
      className="lf-work-showcase"
      aria-labelledby="lf-work-showcase-featured-title"
    >
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id="lf-work-showcase-featured-title">
            {`${featuredStudies.length} live sites. ${featuredStudies.length} real customer paths.`}
          </h2>
          <p>
            Every card names a real business and its live site. Visit any of them yourself.
          </p>
        </header>
        <ProjectReviewGrid studies={featuredStudies} />
        <div className="lf-work-showcase__owned"><header className="lf-work-showcase__head"><h2>Built for our own business.</h2><p>An owned project, separate from outside client work.</p></header><ProjectReviewGrid studies={ownedStudies} /></div>
      </div>
    </section>
  );
}

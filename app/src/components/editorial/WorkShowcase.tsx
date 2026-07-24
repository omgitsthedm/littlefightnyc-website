import { caseStudies } from "@/data/site";
import ProjectReviewGrid from "./ProjectReviewGrid";
import "./WorkShowcase.css";

const SHOWCASE_ORDER = [
  "hair-by-rachel-charles",
  "cc-films",
  "grand-funding-llc",
  "clearhelp",
  "deckspace",
  "after-hours-agenda",
  "venuecircuit",
  "public-house-creative",
  "army-navy-bags",
  "brothers-pizzeria",
] as const;

const orderedStudies = SHOWCASE_ORDER
  .map((slug) => caseStudies.find((study) => study.slug === slug))
  .filter((study): study is NonNullable<typeof study> => Boolean(study));

export default function WorkShowcase() {
  return (
    <section className="lf-work-showcase" aria-labelledby="lf-work-showcase-title">
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id="lf-work-showcase-title">Review every current project.</h2>
          <p>
            Every project follows the same clear format. See what shipped, what
            changed, the evidence behind it, and whether the work is public.
          </p>
        </header>
        <ProjectReviewGrid studies={orderedStudies} />
      </div>
    </section>
  );
}

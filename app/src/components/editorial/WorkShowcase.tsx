import { caseStudies } from "@/data/site";
import ProjectMomentum from "./ProjectMomentum";
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
          <h2 id="lf-work-showcase-title">See the work. Skip the pitch.</h2>
          <p>
            Every project uses the same format: the problem, what changed, the
            result, and what you can open.
          </p>
        </header>
        <ProjectReviewGrid studies={orderedStudies} />
        <ProjectMomentum variant="embedded" />
      </div>
    </section>
  );
}

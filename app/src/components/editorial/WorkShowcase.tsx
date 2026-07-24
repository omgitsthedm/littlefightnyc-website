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

export default function WorkShowcase({
  mode = "featured",
}: {
  mode?: "featured" | "archive";
}) {
  const studies = mode === "featured"
    ? orderedStudies.slice(0, 3)
    : orderedStudies.slice(3);

  return (
    <section
      className="lf-work-showcase"
      aria-labelledby={`lf-work-showcase-${mode}-title`}
    >
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id={`lf-work-showcase-${mode}-title`}>
            {mode === "featured"
              ? "See the work. Skip the pitch."
              : "More work. Same clear read."}
          </h2>
          <p>
            {mode === "featured"
              ? "Start with three public results, then step into the Lab and try what we are exploring next."
              : "Every remaining project uses the same format: the problem, what changed, the result, and what you can open."}
          </p>
        </header>
        <ProjectReviewGrid studies={studies} />
        {mode === "archive" && <ProjectMomentum variant="embedded" />}
      </div>
    </section>
  );
}

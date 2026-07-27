import { caseStudies } from "@/data/site";
import ProjectMomentum from "./ProjectMomentum";
import ProjectReviewGrid from "./ProjectReviewGrid";
import "./WorkShowcase.css";

const SHOWCASE_ORDER = [
  "hair-by-rachel-charles",
  "cc-films",
  "grand-funding-llc",
  "logan-loans",
  "legacy-music-group",
  "army-navy-bags",
  "brothers-pizzeria",
  "chromatic-painting-design",
  "clearhelp",
  "deckspace",
  "after-hours-agenda",
  "venuecircuit",
  "public-house-creative",
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
    ? orderedStudies.slice(0, 4)
    : orderedStudies.slice(4);

  return (
    <section
      className="lf-work-showcase"
      aria-labelledby={`lf-work-showcase-${mode}-title`}
    >
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id={`lf-work-showcase-${mode}-title`}>
            {mode === "featured"
              ? "Four current sites. Four real domains."
              : "More work. Same clear read."}
          </h2>
          <p>
            {mode === "featured"
              ? "Each site below opens on the client's own custom domain. The case study shows the real desktop, iPad, and phone build before you leave."
              : "Private concepts and earlier shipped work stay in the case-study library. An external link appears only when the work is live on its own domain."}
          </p>
        </header>
        <ProjectReviewGrid studies={studies} />
        {mode === "archive" && <ProjectMomentum variant="embedded" />}
      </div>
    </section>
  );
}

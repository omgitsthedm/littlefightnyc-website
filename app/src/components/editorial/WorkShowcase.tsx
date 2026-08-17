import { caseStudies } from "@/data/site-cases";
import ProjectMomentum from "./ProjectMomentum";
import ProjectReviewGrid from "./ProjectReviewGrid";
import "./WorkShowcase.css";

export const FEATURED_LIVE_CASE_SLUGS = [
  "hair-by-rachel-charles",
  "cc-films",
  "grand-funding-llc",
  "logan-loans",
  "chromatic-painting-design",
  "clearhelp",
  "after-hours-agenda",
] as const;

const INTERNAL_CASE_SLUGS = [
  "legacy-music-group",
  "army-navy-bags",
  "brothers-pizzeria",
  // Frozen in place as a separate recovery item, not current client proof.
  "venuecircuit",
  "the-break-room",
  "surviving-game",
  "pole-position-it",
  "all-pets-animal-hospital",
] as const;

// PHC is not part of the fleet reconciliation. Its established approved case
// presentation remains where it already lived; this prevents fleet work from
// silently removing or rewriting the protected surface.
const PROTECTED_EXISTING_CASE_SLUGS = ["public-house-creative"] as const;

export const FLEET_PROJECT_CASE_SLUGS = [
  ...FEATURED_LIVE_CASE_SLUGS,
  ...INTERNAL_CASE_SLUGS,
] as const;

const featuredStudies = FEATURED_LIVE_CASE_SLUGS
  .map((slug) => caseStudies.find((study) => study.slug === slug))
  .filter((study): study is NonNullable<typeof study> => Boolean(study));

const internalStudies = INTERNAL_CASE_SLUGS
  .map((slug) => caseStudies.find((study) => study.slug === slug))
  .filter((study): study is NonNullable<typeof study> => Boolean(study));

const protectedExistingStudies = PROTECTED_EXISTING_CASE_SLUGS
  .map((slug) => caseStudies.find((study) => study.slug === slug))
  .filter((study): study is NonNullable<typeof study> => Boolean(study));

export default function WorkShowcase({
  mode = "featured",
}: {
  mode?: "featured" | "archive";
}) {
  const studies = mode === "featured"
    ? featuredStudies
    : [...internalStudies, ...protectedExistingStudies];

  return (
    <section
      className="lf-work-showcase"
      aria-labelledby={`lf-work-showcase-${mode}-title`}
    >
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id={`lf-work-showcase-${mode}-title`}>
            {mode === "featured"
              ? "Seven live sites. Seven real customer paths."
              : "More work. No pretend launches."}
          </h2>
          <p>
            {mode === "featured"
              ? "Every card names a real business and its live site. Visit any of them yourself. Each card shows when we last checked it."
              : "These projects stay useful inside Little Fight. We show the work and how it works, without sending anyone to a temporary host or private system."}
          </p>
        </header>
        <ProjectReviewGrid studies={studies} />
        {mode === "archive" && <ProjectMomentum variant="embedded" />}
      </div>
    </section>
  );
}

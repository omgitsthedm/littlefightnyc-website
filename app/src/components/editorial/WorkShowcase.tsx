import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";
import { caseStudies } from "@/data/site";
import LiveSiteExplorer from "./LiveSiteExplorer";
import ProofPassport, { ProofStatus } from "./ProofPassport";
import ProjectWalkthrough from "./ProjectWalkthrough";
import { hasPublicCapture } from "./caseProof";
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
  const [activeSlug, setActiveSlug] = useState(orderedStudies[0]?.slug ?? "");

  const active = useMemo(
    () => orderedStudies.find((study) => study.slug === activeSlug) ?? orderedStudies[0],
    [activeSlug],
  );

  if (!active) return null;

  function chooseStudy(slug: string) {
    if (slug === active.slug) return;
    setActiveSlug(slug);
  }

  return (
    <section className="lf-work-showcase" aria-labelledby="lf-work-showcase-title">
      <div className="lf-work-showcase__inner">
        <header className="lf-work-showcase__head">
          <h2 id="lf-work-showcase-title">What changed. How it works.</h2>
          <p>
            Choose a build. Public work includes real desktop and phone captures;
            every case names what was built, what was delivered, and what remains private.
          </p>
        </header>

        <div className="lf-work-showcase__layout">
          <section
            className="lf-work-showcase__index"
            aria-labelledby="lf-work-showcase-index-title"
          >
            <h3 id="lf-work-showcase-index-title">Choose a project</h3>
            <ul>
              {orderedStudies.map((study) => (
                <li key={study.slug}>
                  <button
                    type="button"
                    className="lf-work-showcase__project"
                    aria-pressed={study.slug === active.slug}
                    aria-controls="lf-work-showcase-active"
                    onClick={() => chooseStudy(study.slug)}
                  >
                    <span className="lf-work-showcase__project-copy">
                      <strong>{study.showcase.label}</strong>
                      <small>{study.showcase.context}</small>
                      <ProofStatus
                        study={study}
                        className="lf-work-showcase__project-status"
                      />
                    </span>
                    <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <article
            id="lf-work-showcase-active"
            className="lf-work-showcase__specimen"
            aria-labelledby="lf-work-active-title"
          >
            <p className="lf-work-showcase__announcement" aria-live="polite">
              Showing {active.client}
            </p>

            <div className="lf-work-showcase__proof-stack">
              {hasPublicCapture(active) && (
                <LiveSiteExplorer
                  key={`explorer-${active.slug}`}
                  client={active.client}
                  slug={active.slug}
                  url={active.url}
                  captureDate={active.showcase.proof.captureDate!}
                />
              )}
              <ProjectWalkthrough key={`walkthrough-${active.slug}`} study={active} />
              <ProofPassport key={`passport-${active.slug}`} study={active} />
            </div>

            <footer className="lf-work-showcase__result">
              <div>
                <p>{active.showcase.context}</p>
                <h3 id="lf-work-active-title">The working result</h3>
                <span>{active.result}</span>
              </div>
              <span className="lf-work-showcase__actions">
                <Link to={`/case-studies/${active.slug}/`}>
                  Read the case
                  <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
                </Link>
                {active.showcase.availability === "public" && active.url ? (
                  <a href={active.url} target="_blank" rel="noopener noreferrer">
                    Open live
                    <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="lf-work-showcase__private">
                    <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
                    {active.showcase.privacyLabel ?? "Private system"}
                  </span>
                )}
              </span>
            </footer>
          </article>
        </div>
      </div>
    </section>
  );
}

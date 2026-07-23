import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";
import { caseStudies } from "@/data/site";
import ProjectWalkthrough from "./ProjectWalkthrough";
import "./WorkShowcase.css";

export default function WorkShowcase() {
  const [activeSlug, setActiveSlug] = useState(caseStudies[0]?.slug ?? "");

  const active = useMemo(
    () => caseStudies.find((study) => study.slug === activeSlug) ?? caseStudies[0],
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
            Pick the job, not the client. Follow the working path from the first input
            to the result the business uses.
          </p>
        </header>

        <div className="lf-work-showcase__layout">
          <nav className="lf-work-showcase__index" aria-label="Choose a project outcome">
            <ul>
              {caseStudies.map((study) => (
                <li key={study.slug}>
                  <button
                    type="button"
                    className="lf-work-showcase__project"
                    aria-pressed={study.slug === active.slug}
                    onClick={() => chooseStudy(study.slug)}
                  >
                    <span>
                      <strong>{study.showcase.label}</strong>
                      <small>{study.showcase.context}</small>
                    </span>
                    <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <article className="lf-work-showcase__specimen" aria-labelledby="lf-work-active-title">
            <ProjectWalkthrough key={active.slug} study={active} />

            {active.metrics && active.metrics.length > 0 && (
              <dl className="lf-work-showcase__metrics" aria-label={`${active.showcase.label} results`}>
                {active.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.value}</dt>
                    <dd>{metric.label}</dd>
                  </div>
                ))}
              </dl>
            )}

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
                {active.showcase.availability === "public" ? (
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

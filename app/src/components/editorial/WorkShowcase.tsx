import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/data/site";
import LiveSiteExplorer from "./LiveSiteExplorer";
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
          <h2 id="lf-work-showcase-title">Work you can open.</h2>
          <p>
            Eight live businesses and products. Pick one, move through the current site,
            then open the real thing.
          </p>
        </header>

        <div className="lf-work-showcase__layout">
          <nav className="lf-work-showcase__index" aria-label="Choose a client project">
            <ol>
              {caseStudies.map((study, index) => (
                <li key={study.slug}>
                  <button
                    type="button"
                    className="lf-work-showcase__project"
                    aria-pressed={study.slug === active.slug}
                    onClick={() => chooseStudy(study.slug)}
                  >
                    <span className="lf-work-showcase__number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <strong>{study.client}</strong>
                      <small>{study.type}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <article className="lf-work-showcase__browser" aria-labelledby="lf-work-active-title">
            <LiveSiteExplorer
              key={active.slug}
              client={active.client}
              slug={active.slug}
              url={active.url}
            />

            <footer className="lf-work-showcase__result">
              <div>
                <p>{active.type}</p>
                <h3 id="lf-work-active-title">{active.client}</h3>
                <span>{active.result}</span>
              </div>
              <Link to={`/case-studies/${active.slug}/`}>
                Read the story
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </Link>
            </footer>
          </article>
        </div>

        <p className="lf-work-showcase__capture-note">
          Captured from each live production site on July 21, 2026. Scroll inside the frame.
        </p>
      </div>
    </section>
  );
}

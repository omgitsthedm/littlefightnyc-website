import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_FEATURED_WORK } from "@/data/home-featured-work";
import "./RecentClients.css";

const ProjectMomentum = lazy(() => import("./ProjectMomentum"));

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Three immediate, checkable examples. The complete verified fleet stays on /examples/. */
export default function RecentClients() {
  const momentumSentinelRef = useRef<HTMLDivElement>(null);
  const [showMomentum, setShowMomentum] = useState(false);

  useEffect(() => {
    if (showMomentum) return;

    const sentinel = momentumSentinelRef.current;
    if (!sentinel) return;

    const desktop = window.matchMedia("(min-width: 48rem)");
    let observer: IntersectionObserver | null = null;

    const armObserver = () => {
      observer?.disconnect();
      observer = null;
      if (!desktop.matches) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          setShowMomentum(true);
          observer?.disconnect();
        },
        { rootMargin: "500px 0px" },
      );
      observer.observe(sentinel);
    };

    armObserver();
    desktop.addEventListener("change", armObserver);
    return () => {
      desktop.removeEventListener("change", armObserver);
      observer?.disconnect();
    };
  }, [showMomentum]);

  return (
    <section className="lf-clients" aria-labelledby="lf-home-work-title">
      <div className="lf-clients__inner">
        <div className="lf-clients__head">
          <div>
            <p className="lf-mono lf-clients__label">LF / 02 · Verified work</p>
            <h2 id="lf-home-work-title" className="lf-clients__heading">
              Real work. Real next steps.
            </h2>
            <p className="lf-clients__lede">
              Open the story. Inspect what changed. See where the customer can
              go next.
            </p>
          </div>
          <Link to="/examples/" className="lf-clients__all">
            See every project <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>

        <div className="lf-home-work" role="group" aria-label="Featured live work">
          {HOME_FEATURED_WORK.map((project, index) => (
            <article
              className={`lf-home-work__card${index === 0 ? " lf-home-work__card--feature" : " lf-home-work__card--support"}`}
              key={project.slug}
            >
              <Link
                className="lf-home-work__media"
                to={`/case-studies/${project.slug}/`}
                aria-label={`Read the ${project.name} case study`}
              >
                <span className="lf-home-work__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <picture>
                  <source
                    srcSet={`/assets/case-${project.slug}-480.webp 480w, /assets/case-${project.slug}-640.webp 640w, /assets/case-${project.slug}-900.webp 900w, ${project.image} ${project.imageWidth}w`}
                    sizes={index === 0
                      ? "(min-width: 1120px) 46vw, (min-width: 720px) 100vw, 100vw"
                      : "(min-width: 1120px) 12vw, (min-width: 720px) 48vw, 8rem"}
                    type="image/webp"
                  />
                  <img
                    src={project.image}
                    width={project.imageWidth}
                    height={project.imageHeight}
                    alt={`${project.name} website shown across responsive screens`}
                    loading="lazy"
                    fetchPriority="low"
                    decoding="async"
                  />
                </picture>
              </Link>

              <div className="lf-home-work__body">
                <div className="lf-home-work__meta">
                  <span><CircleCheck size={14} strokeWidth={2} aria-hidden="true" /> Verified live</span>
                  <time dateTime={project.verifiedAt}>
                    {DATE_FORMATTER.format(new Date(`${project.verifiedAt}T12:00:00Z`))}
                  </time>
                </div>
                <h3>{project.name}</h3>
                <p className="lf-home-work__label">{project.label}</p>
                <p className="lf-home-work__outcome">{project.outcome}</p>
                <p className="lf-home-work__source">
                  Live site checked: <span>{project.sourceLabel}</span>
                </p>
              </div>

              <footer className="lf-home-work__actions">
                <Link to={`/case-studies/${project.slug}/`}>
                  Open project story <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
                </Link>
              </footer>
            </article>
          ))}
        </div>

        <div className="lf-home-proof-strip" role="group" aria-label="What the work examples prove">
          <article>
            <span>01</span>
            <div><strong>Clearer next step</strong><p>Customers can tell where to go without decoding the business.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><strong>Responsive proof</strong><p>The real sites can be inspected across screen sizes.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><strong>Owner-controlled handoff</strong><p>Access, tools, and guidance do not disappear after launch.</p></div>
          </article>
          <p>Project facts, not performance promises.</p>
        </div>

        <div ref={momentumSentinelRef} className="lf-momentum-sentinel" aria-hidden="true" />
        {showMomentum && (
          <Suspense fallback={null}>
            <ProjectMomentum variant="embedded" />
          </Suspense>
        )}
      </div>
    </section>
  );
}

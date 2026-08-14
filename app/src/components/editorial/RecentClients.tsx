import { ArrowRight, ArrowUpRight, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { HOME_FEATURED_WORK } from "@/data/home-featured-work";
import "./RecentClients.css";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** One flagship result on the homepage. The full verified fleet stays on /examples/. */
export default function RecentClients() {
  const project = HOME_FEATURED_WORK[0];
  const caseStudyPath = `/case-studies/${project.slug}/`;

  return (
    <section className="lf-clients" aria-labelledby="lf-home-work-title">
      <div className="lf-clients__inner">
        <header className="lf-clients__head">
          <div>
            <p className="lf-mono lf-clients__label">LF / 02 · Verified work</p>
            <h2 id="lf-home-work-title" className="lf-clients__heading">
              <span className="lf-clients__heading-line">Hair By</span>
              <span className="lf-clients__heading-line">Rachel</span>
              <span className="lf-clients__heading-line">
                Charles<span className="lf-clients__heading-mark" aria-hidden="true">.</span>
              </span>
            </h2>
          </div>
        </header>

        <article className="lf-home-flagship">
          <div className="lf-home-flagship__story">
            <p className="lf-home-flagship__label">{project.label}</p>
            <p className="lf-home-flagship__lead">
              A clear place to choose a service, then book.
            </p>
            <p className="lf-home-flagship__outcome">{project.outcome}</p>

            <Link className="lf-home-flagship__action" to={caseStudyPath}>
              Open the project story
              <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>

            <Link to="/examples/" className="lf-clients__all">
              View more results <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>

            <div className="lf-home-flagship__meta">
              <span>
                <CircleCheck size={15} strokeWidth={2} aria-hidden="true" />
                Verified live
              </span>
              <time dateTime={project.verifiedAt}>
                Checked {DATE_FORMATTER.format(new Date(`${project.verifiedAt}T12:00:00Z`))}
              </time>
            </div>
          </div>

          <Link
            className="lf-home-flagship__media"
            to={caseStudyPath}
            aria-label={`Read the ${project.name} project story`}
          >
            <picture>
              <source
                srcSet={`/assets/case-${project.slug}-480.webp 480w, /assets/case-${project.slug}-640.webp 640w, /assets/case-${project.slug}-900.webp 900w, ${project.image} ${project.imageWidth}w`}
                sizes="(min-width: 1120px) 50vw, (min-width: 720px) 62vw, 100vw"
                type="image/webp"
              />
              <img
                src={project.image}
                width={project.imageWidth}
                height={project.imageHeight}
                alt={`${project.name} website shown across desktop, tablet, and mobile screens`}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            </picture>
          </Link>
        </article>
      </div>
    </section>
  );
}

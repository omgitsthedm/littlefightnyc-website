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

const LEAD = HOME_FEATURED_WORK[0];
const SUPPORTING = HOME_FEATURED_WORK.slice(1);

const STORY_BEATS = [
  { number: "01", label: "In the way", text: LEAD.story.problem },
  { number: "02", label: "Kept", text: LEAD.story.kept },
  { number: "03", label: "Changed", text: LEAD.story.changed },
] as const;

/**
 * Proof chapter: the same client the hero just walked through, told in three
 * honest beats — what was in the way, what we kept, what we changed — with
 * the outcome and two more verified builds behind it. Every sentence is the
 * case study's own copy; the audit keeps it that way.
 */
export default function RecentClients() {
  const leadPath = `/case-studies/${LEAD.slug}/`;

  return (
    <section className="lf-clients" aria-labelledby="lf-home-work-title">
      <div className="lf-clients__inner">
        <header className="lf-clients__head">
          <p className="lf-mono lf-clients__label">LF / 02 · Verified work</p>
          <h2 id="lf-home-work-title" className="lf-clients__heading">
            One client,
            <br />
            start to finish<span className="lf-clients__heading-mark" aria-hidden="true">.</span>
          </h2>
          <p className="lf-clients__dek">{LEAD.story.title}</p>
        </header>

        <article className="lf-home-flagship" aria-label={`${LEAD.name} project story`}>
          <Link
            className="lf-home-flagship__media"
            to={leadPath}
            aria-label={`Read the ${LEAD.name} project story`}
          >
            <picture>
              <source
                srcSet={`/assets/case-${LEAD.slug}-480.webp 480w, /assets/case-${LEAD.slug}-640.webp 640w, /assets/case-${LEAD.slug}-900.webp 900w, ${LEAD.image} ${LEAD.imageWidth}w`}
                sizes="(min-width: 1120px) 52vw, (min-width: 720px) 70vw, 100vw"
                type="image/webp"
              />
              <img
                src={LEAD.image}
                width={LEAD.imageWidth}
                height={LEAD.imageHeight}
                alt={`${LEAD.name} website shown across desktop, tablet, and mobile screens`}
                loading="lazy"
                fetchPriority="low"
                decoding="async"
              />
            </picture>
            <span className="lf-home-flagship__media-tag">
              <span>{LEAD.type}</span>
              <strong>{LEAD.name}</strong>
            </span>
          </Link>

          <div className="lf-home-flagship__story">
            <ol className="lf-home-flagship__beats" aria-label="How the project went">
              {STORY_BEATS.map((beat) => (
                <li key={beat.number} className="lf-home-flagship__beat">
                  <span className="lf-home-flagship__beat-num" aria-hidden="true">{beat.number}</span>
                  <h3>{beat.label}</h3>
                  <p>{beat.text}</p>
                </li>
              ))}
            </ol>

            <div className="lf-home-flagship__now">
              <p className="lf-home-flagship__now-label">
                <CircleCheck size={16} strokeWidth={2} aria-hidden="true" />
                What works now
              </p>
              <p className="lf-home-flagship__outcome">{LEAD.outcome}</p>
              <div className="lf-home-flagship__actions">
                <Link className="lf-home-flagship__action" to={leadPath}>
                  Open the project story
                  <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
                </Link>
                <span className="lf-home-flagship__meta">
                  Verified live · checked{" "}
                  <time dateTime={LEAD.verifiedAt}>
                    {DATE_FORMATTER.format(new Date(`${LEAD.verifiedAt}T12:00:00Z`))}
                  </time>
                </span>
              </div>
            </div>
          </div>
        </article>

        <div className="lf-clients__more">
          <p className="lf-clients__more-label">Same idea, two more</p>
          <ul className="lf-clients__more-list">
            {SUPPORTING.map((project) => (
              <li key={project.slug}>
                <Link
                  className="lf-clients__more-card"
                  to={`/case-studies/${project.slug}/`}
                  aria-label={`Read the ${project.name} project story`}
                >
                  <span className="lf-clients__more-media" aria-hidden="true">
                    <img
                      src={`/assets/case-${project.slug}-480.webp`}
                      srcSet={`/assets/case-${project.slug}-480.webp 480w, /assets/case-${project.slug}-640.webp 640w`}
                      sizes="(min-width: 48rem) 12rem, 30vw"
                      width={480}
                      height={360}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="lf-clients__more-copy">
                    <span className="lf-clients__more-type">{project.type}</span>
                    <strong>{project.name}</strong>
                    <span className="lf-clients__more-outcome">{project.outcome}</span>
                  </span>
                  <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/examples/" className="lf-clients__all">
            See every verified result <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { caseStudies } from "@/data/site-cases";
import "./WorkWall.css";

/**
 * The work, instead of a stock photo.
 *
 * Inner-page heroes used to float a generic street or storefront photo in a
 * box — the same picture energy on every route, and none of it ours. This
 * shows real shipped client sites in a device frame and slowly drifts through
 * them, so the page that asks for trust is showing the reason for it.
 *
 * Every entry is a real capture of a live, client-owned site. Nothing is
 * illustrative and nothing is invented: the slugs come from the canonical case
 * catalog, so a case that goes private disappears from here too.
 */
const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

type Props = {
  /** Case slugs, in the order they should appear. */
  slugs: string[];
  /** Screen-reader label for the whole wall. */
  label?: string;
};

export default function WorkWall({ slugs, label = "Recent shipped work" }: Props) {
  const picks = slugs
    .map((slug) => caseStudies.find((entry) => entry.slug === slug))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter((entry) => entry.showcase?.availability === "public");

  if (picks.length === 0) return null;

  const captured = picks[0]?.showcase?.proof?.captureDate;

  return (
    <figure className="lf-workwall" aria-label={label}>
      <div className="lf-workwall__stack">
        {picks.slice(0, 3).map((study, index) => (
          <Link
            key={study.slug}
            className={`lf-workwall__plate lf-workwall__plate--${index + 1}`}
            to={`/case-studies/${study.slug}/`}
            style={{ "--lf-plate-order": index } as React.CSSProperties}
            aria-label={`${study.client}: read the project story`}
          >
            <span className="lf-workwall__screen">
              <img
                src={`/assets/case-${study.slug}-explore.webp`}
                alt={`The ${study.client} website as it shipped`}
                width={1200}
                height={2000}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </span>
            <span className="lf-workwall__tag">
              <span>{study.type}</span>
              <strong>{study.client}</strong>
            </span>
          </Link>
        ))}
      </div>

      <figcaption className="lf-workwall__caption">
        Live client sites
        {captured ? ` · captured ${DATE.format(new Date(`${captured}T12:00:00Z`))}` : ""}
      </figcaption>
    </figure>
  );
}

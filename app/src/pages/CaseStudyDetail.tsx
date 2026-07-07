import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Award } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { caseStudies, services } from "@/data/site";
import "@/styles/editorial/case-studies.css";

function serviceLabel(slug: string): string | undefined {
  return services.find((s) => s.slug === slug)?.eyebrow;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function displayDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00`));
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const study = caseStudies.find((s) => s.slug === slug);

  const figureRef = useScrollReveal<HTMLElement>({ threshold: 0.2 });
  const arcRef = useScrollReveal<HTMLOListElement>({ threshold: 0.15 });

  if (!study) return <Navigate to="/examples/#studies" replace />;

  const related = caseStudies.filter((s) => s.slug !== study.slug).slice(0, 3);
  const published = study.published ?? "2026-05-07";
  const updated = study.updated ?? "2026-05-12";

  // The four-beat arc — setup → tension → resolution, argued not listed.
  const arc = [
    { label: "The problem", body: study.problem },
    { label: "What we kept", body: study.kept },
    { label: "What we changed", body: study.changed },
    { label: "What they got back", body: study.result },
  ].filter((beat) => beat.body);

  const serviceLinks = study.services
    .map((s) => ({ slug: s, label: serviceLabel(s) }))
    .filter((s): s is { slug: string; label: string } => Boolean(s.label));

  return (
    <>
      <PageHero
        eyebrow={`Case Study · ${study.type}`}
        icon={Award}
        title={<>{study.client}</>}
        dek={study.title}
      />

      <article className="lf-case">
        {/* Full-bleed moment — the work, given room to land. */}
        <figure ref={figureRef} className="lf-case__cover" data-reveal>
          <div className="lf-case__cover-frame">
            <img
              src={study.image}
              alt={`${study.client} — ${study.title}`}
              width={1800}
              height={1200}
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <figcaption className="lf-case__cover-cap">
            <span className="lf-mono">{study.client}</span>
            <span className="lf-case__cover-dot" aria-hidden="true">·</span>
            <span>{study.type}</span>
            {study.url && (
              <a
                className="lf-case__cover-live"
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit site <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            )}
          </figcaption>
        </figure>

        <div className="lf-case__inner">
          {/* Meta rail — the credits block of the feature. */}
          <aside className="lf-case__meta" aria-label="Project details">
            <div className="lf-case__meta-item">
              <p className="lf-case__meta-label">Client</p>
              <p className="lf-case__meta-value">{study.client}</p>
            </div>
            <div className="lf-case__meta-item">
              <p className="lf-case__meta-label">Type</p>
              <p className="lf-case__meta-value">{study.type}</p>
            </div>
            {serviceLinks.length > 0 && (
              <div className="lf-case__meta-item">
                <p className="lf-case__meta-label">Services</p>
                <p className="lf-case__meta-value lf-case__meta-services">
                  {serviceLinks.map((s) => (
                    <Link key={s.slug} to={`/services/${s.slug}/`} viewTransition className="lf-case__service-link">
                      {s.label}
                    </Link>
                  ))}
                </p>
              </div>
            )}
            <div className="lf-case__meta-item">
              <p className="lf-case__meta-label">Published</p>
              <p className="lf-case__meta-value">
                <time dateTime={published}>{displayDate(published)}</time>
                <span className="lf-case__meta-updated">
                  Updated <time dateTime={updated}>{displayDate(updated)}</time>
                </span>
              </p>
            </div>
          </aside>

          {/* The story. */}
          <div className="lf-case__story">
            <EditorialBody dropcap>
              {study.body?.map((p, i) => <p key={i}>{p}</p>)}
            </EditorialBody>
          </div>
        </div>

        {/* The arc — the argument, sequenced. */}
        {arc.length > 0 && (
          <section className="lf-case__arc" aria-label="The shape of the work">
            <div className="lf-case__arc-inner">
              <p className="lf-mono lf-case__arc-kicker">The shape of the work</p>
              <ol ref={arcRef} className="lf-case__arc-list">
                {arc.map((beat, i) => (
                  <li
                    key={beat.label}
                    className="lf-case__beat"
                    style={{ ["--lf-i" as string]: i }}
                  >
                    <span className="lf-mono lf-case__beat-num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="lf-case__beat-body">
                      <h2 className="lf-case__beat-label">{beat.label}</h2>
                      <p className="lf-case__beat-text">{beat.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="lf-case-detail-related">
          <div className="lf-case-detail-related__inner">
            <p className="lf-case-detail-related__label">More case studies</p>
            <ol className="lf-case-detail-related__list">
              {related.map((r, i) => (
                <li key={r.slug}>
                  <Link to={`/case-studies/${r.slug}/`} viewTransition className="lf-case-detail-related__link">
                    <span className="lf-case-detail-related__num">{String(i + 1).padStart(2, "0")}</span>
                    <span className="lf-case-detail-related__body">
                      <span className="lf-case-detail-related__type">{r.type}</span>
                      <span className="lf-case-detail-related__client">{r.client}</span>
                      <span className="lf-case-detail-related__title">{r.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <QuietContact />
    </>
  );
}

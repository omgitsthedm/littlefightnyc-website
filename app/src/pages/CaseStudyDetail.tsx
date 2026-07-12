import { useLayoutEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Award, Gauge } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import StatBlock from "@/components/editorial/StatBlock";
import QuietContact from "@/components/editorial/QuietContact";
import CaseDiagram from "@/components/dataviz/CaseDiagram";
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

  const arcRef = useScrollReveal<HTMLOListElement>({ threshold: 0.15 });

  // Shared-element morph: pair this hero's backdrop image with the hub card
  // image (`case-${slug}` — see CaseStudies.tsx + lib/viewTransition.ts).
  // PageHero owns the img, so the name is stamped here, synchronously in the
  // commit, which is early enough for the view transition's new snapshot.
  // No-op styling for browsers without the View Transitions API.
  useLayoutEffect(() => {
    if (!study) return undefined;
    const img = document.querySelector<HTMLElement>(
      ".lf-pagehero--case .lf-pagehero__backdrop img",
    );
    if (!img) return undefined;
    img.style.viewTransitionName = `case-${study.slug}`;
    return () => {
      img.style.viewTransitionName = "";
    };
  }, [study]);

  if (!study) return <Navigate to="/examples/#studies" replace />;

  const related = caseStudies.filter((s) => s.slug !== study.slug).slice(0, 3);
  const published = study.published;
  const updated = study.updated;

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
        title={<span className="lf-em">{study.client}</span>}
        dek={study.title}
        backdrop={{ src: study.image, alt: "" }}
      />

      <article className="lf-case">
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
            {study.url && (
              <div className="lf-case__meta-item">
                <p className="lf-case__meta-label">Live</p>
                <p className="lf-case__meta-value">
                  <a
                    className="lf-case__service-link"
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit site <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
                  </a>
                </p>
              </div>
            )}
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
            {published && (
              <div className="lf-case__meta-item">
                <p className="lf-case__meta-label">Published</p>
                <p className="lf-case__meta-value">
                  <time dateTime={published}>{displayDate(published)}</time>
                  {updated && (
                    <span className="lf-case__meta-updated">
                      Updated <time dateTime={updated}>{displayDate(updated)}</time>
                    </span>
                  )}
                </p>
              </div>
            )}
          </aside>

          {/* The story. */}
          <div className="lf-case__story">
            <EditorialBody dropcap>
              {study.body?.map((p, i) => <p key={i}>{p}</p>)}
            </EditorialBody>

            {study.metrics && study.metrics.length > 0 && (
              <StatBlock eyebrow="Project at a glance" icon={Gauge} items={study.metrics} />
            )}

            <CaseDiagram slug={study.slug} />
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

      <QuietContact
        heading="Want a build like this?"
        lede="Tell us about your shop. We will tell you what a build like this looks like for you. The first talk is free."
      />
    </>
  );
}

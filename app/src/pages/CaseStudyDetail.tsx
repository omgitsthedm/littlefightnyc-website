import { Link, Navigate, useParams } from "react-router-dom";
import PageHero from "@/components/editorial/PageHero";
import EditorialBody from "@/components/editorial/EditorialBody";
import QuietContact from "@/components/editorial/QuietContact";
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

  if (!study) return <Navigate to="/field-guide/#studies" replace />;

  const related = caseStudies.filter((s) => s.slug !== study.slug).slice(0, 3);
  const published = study.published ?? "2026-05-07";
  const updated = study.updated ?? "2026-05-12";

  return (
    <>
      <PageHero
        eyebrow={`Case Study · ${study.type}`}
        title={<>{study.client}</>}
        dek={study.title}
        image={{
          // Decorative: the adjacent H1 already announces the client name,
          // so an alt repeating it would be redundant for screen readers.
          src: study.image,
          alt: "",
          width: 1800,
          height: 1200,
        }}
      />

      <article className="lf-case-detail">
        <div className="lf-case-detail__inner">
          <aside className="lf-case-detail__meta">
            <div className="lf-case-detail__meta-item">
              <p className="lf-case-detail__meta-label">Client</p>
              <p className="lf-case-detail__meta-value">{study.client}</p>
            </div>
            <div className="lf-case-detail__meta-item">
              <p className="lf-case-detail__meta-label">Type</p>
              <p className="lf-case-detail__meta-value">{study.type}</p>
            </div>
            <div className="lf-case-detail__meta-item">
              <p className="lf-case-detail__meta-label">Services</p>
              <p className="lf-case-detail__meta-value">
                {study.services.map((s, i) => {
                  const label = serviceLabel(s);
                  if (!label) return null;
                  return (
                    <span key={s}>
                      <Link to={`/services/${s}/`} className="lf-case-detail__service-link">
                        {label}
                      </Link>
                      {i < study.services.length - 1 && <span aria-hidden="true">{" · "}</span>}
                    </span>
                  );
                })}
              </p>
            </div>
            <div className="lf-case-detail__meta-item">
              <p className="lf-case-detail__meta-label">Live site</p>
              <p className="lf-case-detail__meta-value">
                <a
                  className="lf-case-detail__live"
                  href={study.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit ↗
                </a>
              </p>
            </div>
          </aside>

          <div className="lf-case-detail__body">
            <p className="lf-case-detail__byline">
              <span>Little Fight NYC</span>
              <span aria-hidden="true"> · </span>
              <span>Published </span>
              <time dateTime={published}>{displayDate(published)}</time>
              <span aria-hidden="true"> · </span>
              <span>Updated </span>
              <time dateTime={updated}>{displayDate(updated)}</time>
            </p>

            <EditorialBody dropcap>
              {study.body?.map((p, i) => <p key={i}>{p}</p>)}
            </EditorialBody>

            <section className="lf-case-detail__summary">
              <h2 className="lf-case-detail__summary-title">The shape of the work</h2>
              <dl className="lf-cases__dl">
                <div>
                  <dt>Problem</dt>
                  <dd>{study.problem}</dd>
                </div>
                <div>
                  <dt>Kept</dt>
                  <dd>{study.kept}</dd>
                </div>
                <div>
                  <dt>Changed</dt>
                  <dd>{study.changed}</dd>
                </div>
                <div>
                  <dt>Result</dt>
                  <dd>{study.result}</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="lf-case-detail-related">
          <div className="lf-case-detail-related__inner">
            <p className="lf-case-detail-related__label">More case studies</p>
            <ol className="lf-case-detail-related__list">
              {related.map((r, i) => (
                <li key={r.slug}>
                  <Link to={`/case-studies/${r.slug}/`} className="lf-case-detail-related__link">
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

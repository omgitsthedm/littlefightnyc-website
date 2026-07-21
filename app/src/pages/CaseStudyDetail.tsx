import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { ArrowUpRight, Award } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import LiveSiteExplorer from "@/components/editorial/LiveSiteExplorer";
import ShareButton from "@/components/ShareButton";
import { caseStudies, services } from "@/data/site";
import "@/styles/editorial/case-studies.css";

function serviceLabel(slug: string): string | undefined {
  return services.find((service) => service.slug === slug)?.eyebrow;
}

function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function CaseStudyDetail() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const study = caseStudies.find((entry) => entry.slug === slug);

  if (!study) return <Navigate to="/examples/" replace />;

  const related = caseStudies.filter((entry) => entry.slug !== study.slug).slice(0, 3);
  const serviceLinks = study.services
    .map((service) => ({ slug: service, label: serviceLabel(service) }))
    .filter((service): service is { slug: string; label: string } => Boolean(service.label));

  const beats = [
    { label: "Before", body: study.problem },
    { label: "Kept", body: study.kept },
    { label: "Changed", body: study.changed },
    { label: "After", body: study.result },
  ];

  return (
    <>
      <PageHero
        eyebrow={`Case study: ${study.type}`}
        icon={Award}
        title={<span className="lf-accent">{study.client}</span>}
        dek={study.title}
        backdrop={{ src: study.image, alt: "" }}
      />

      <div className="lf-case__hero-band">
        <div className="lf-case__hero-band-inner">
          <span className="lf-case__hero-badge">Shipped and live</span>
          <span className="lf-case__hero-actions">
            <a
              className="lf-case__hero-live"
              href={study.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {displayDomain(study.url)}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
            <ShareButton
              title={`${study.client}: ${study.title}`}
              text={study.title}
              url={`https://littlefightnyc.com${pathname}`}
              label="Share"
            />
          </span>
        </div>
      </div>

      <article className="lf-case-detail">
        <section className="lf-case-next__overview" aria-labelledby="lf-case-overview-title">
          <div className="lf-case-next__overview-inner">
            <header>
              <h2 id="lf-case-overview-title">The result, first.</h2>
              <p>{study.result}</p>
            </header>

            {study.metrics && study.metrics.length > 0 && (
              <dl className="lf-case-next__metrics" aria-label={`${study.client} project results`}>
                {study.metrics.map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.value}</dt>
                    <dd>{metric.label}</dd>
                  </div>
                ))}
              </dl>
            )}

            <aside className="lf-case-next__details" aria-label="Project details">
              <div>
                <span>Client</span>
                <strong>{study.client}</strong>
              </div>
              <div>
                <span>Work</span>
                <strong>{study.type}</strong>
              </div>
              <div>
                <span>Services</span>
                <strong>
                  {serviceLinks.map((service, index) => (
                    <span key={service.slug}>
                      {index > 0 && ", "}
                      <Link to={`/services/${service.slug}/`}>{service.label}</Link>
                    </span>
                  ))}
                </strong>
              </div>
              <div>
                <span>Current capture</span>
                <strong>July 21, 2026</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="lf-case-next__live" aria-labelledby="lf-case-live-title">
          <div className="lf-case-next__live-inner">
            <header>
              <h2 id="lf-case-live-title">See the live work.</h2>
              <p>Switch views and scroll inside the frame. The button opens the production site.</p>
            </header>
            <div className="lf-case-next__explorer">
              <LiveSiteExplorer key={study.slug} client={study.client} slug={study.slug} url={study.url} />
            </div>
          </div>
        </section>

        <section className="lf-case-next__story" aria-labelledby="lf-case-story-title">
          <div className="lf-case-next__story-inner">
            <header>
              <h2 id="lf-case-story-title">The whole story, quickly.</h2>
            </header>
            <ol>
              {beats.map((beat) => (
                <li key={beat.label}>
                  <h3>{beat.label}</h3>
                  <p>{beat.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </article>

      {related.length > 0 && (
        <section className="lf-case-next__related" aria-labelledby="lf-case-related-title">
          <div className="lf-case-next__related-inner">
            <h2 id="lf-case-related-title">More live work.</h2>
            <ul>
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link to={`/case-studies/${entry.slug}/`}>
                    <span className="lf-case-next__related-image">
                      <img
                        src={entry.image}
                        alt=""
                        width="900"
                        height="675"
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span className="lf-case-next__related-copy">
                      <small>{entry.type}</small>
                      <strong>{entry.client}</strong>
                      <span>{entry.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <QuietContact
        heading="Want a build like this?"
        lede="Tell us what your business needs. We will explain the best next step in plain English. Consulting is free."
      />
    </>
  );
}

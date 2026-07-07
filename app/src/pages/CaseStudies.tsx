import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import { caseStudies, services } from "@/data/site";
import { responsiveImageProps } from "@/lib/responsiveImages";
import "@/styles/editorial/case-studies.css";

function serviceLabel(slug: string): string | undefined {
  return services.find((s) => s.slug === slug)?.eyebrow;
}

export default function CaseStudies() {
  return (
    <>
      <PageHero
        eyebrow="Case Studies"
        icon={Award}
        title={
          <>
            Real shops.<br />
            <span className="lf-em">Real work.</span>
          </>
        }
        dek="Seven engagements, named with permission. Each one shows the pattern: what we kept, what we changed, and what shipped."
        image={{
          src: "/assets/storefront-shop-deli.webp",
          alt: "New York shopfront at street level",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-cases">
        <div className="lf-cases__inner">
          {caseStudies.map((study, i) => (
            <article key={study.slug} className="lf-cases__item">
              <Link to={`/case-studies/${study.slug}/`} className="lf-cases__image lf-cases__image-link" aria-label={`Read the ${study.client} case study`}>
                <img
                  src={study.image}
                  {...responsiveImageProps(study.image, "(max-width: 720px) 100vw, 50vw")}
                  alt=""
                  width={1600}
                  height={1200}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                />
              </Link>
              <div className="lf-cases__copy">
                <p className="lf-cases__type">{study.type}</p>
                <h2 className="lf-cases__title">
                  <Link to={`/case-studies/${study.slug}/`} className="lf-cases__title-link">{study.client}</Link>
                </h2>
                <p className="lf-cases__deck">{study.title}</p>

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

                <div className="lf-cases__foot">
                  <div className="lf-cases__services">
                    <span className="lf-cases__foot-label">Services</span>
                    <span className="lf-cases__services-list">
                      {study.services.map((slug, j) => {
                        const label = serviceLabel(slug);
                        if (!label) return null;
                        return (
                          <span key={slug}>
                            <Link to={`/services/${slug}/`} className="lf-cases__service-link">
                              {label}
                            </Link>
                            {j < study.services.length - 1 && (
                              <span aria-hidden="true">{" · "}</span>
                            )}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  <div className="lf-cases__actions">
                    <Link to={`/case-studies/${study.slug}/`} className="lf-cases__read">
                      Read the case
                      <span aria-hidden="true"> →</span>
                    </Link>
                    <a
                      className="lf-cases__live"
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit site
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <QuietContact />
    </>
  );
}

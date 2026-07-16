import { Fragment } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import DeviceFrame from "@/components/editorial/DeviceFrame";
import { caseStudies, services } from "@/data/site";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { useViewTransitionNav } from "@/lib/viewTransition";
import "@/styles/editorial/case-studies.css";

// Warm the detail chunk before the morph so the new snapshot is the real page.
const preloadDetail = () => import("@/pages/CaseStudyDetail");

function serviceLabel(slug: string): string | undefined {
  return services.find((s) => s.slug === slug)?.eyebrow;
}

/** "https://www.ccfilms.net" → "ccfilms.net" for the drawn URL bar. */
function displayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];

/* Rhythm breaks: after every ~3rd card, a slim dark band lifts one study's
 * existing metric trio (site.ts data only — no new claims) and points forward
 * into that study. Keys are the card index the band follows. */
const INTERLUDE_AFTER: Record<number, string> = {
  2: "public-house-creative",
  5: "venuecircuit",
};

export default function CaseStudies() {
  const countWord = COUNT_WORDS[caseStudies.length] ?? String(caseStudies.length);
  const vtNav = useViewTransitionNav();
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
        dek={`${countWord} projects, named with permission. Each one shows the pattern: what we kept, what we changed, and what shipped.`}
        image={{
          src: "/assets/nyc-street.webp",
          alt: "A New York street corner at dusk with local storefronts",
          width: 1600,
          height: 1200,
        }}
      />

      <section className="lf-cases">
        <div className="lf-cases__inner">
          {caseStudies.map((study, i) => {
            const interludeSlug = INTERLUDE_AFTER[i];
            const interlude = interludeSlug
              ? caseStudies.find((s) => s.slug === interludeSlug)
              : undefined;
            return (
            <Fragment key={study.slug}>
            <article className="lf-cases__item">
              <Link
                to={`/case-studies/${study.slug}/`}
                className="lf-cases__image lf-cases__image-link"
                aria-label={`Read the ${study.client} case study`}
                onClick={vtNav(`/case-studies/${study.slug}/`, preloadDetail)}
              >
                <DeviceFrame domain={displayDomain(study.url)}>
                  <img {...skelImg}
                    src={study.image}
                    {...responsiveImageProps(study.image, "(max-width: 720px) 100vw, 50vw")}
                    alt=""
                    width={1600}
                    height={1200}
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    style={{ viewTransitionName: `case-${study.slug}` }}
                  />
                </DeviceFrame>
              </Link>
              <div className="lf-cases__copy">
                <div className="lf-cases__copy-head">
                  <p className="lf-cases__type">{study.type}</p>
                  <span className="lf-cases__index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="lf-cases__title">
                  <Link
                    to={`/case-studies/${study.slug}/`}
                    className="lf-cases__title-link"
                    onClick={vtNav(`/case-studies/${study.slug}/`, preloadDetail)}
                  >
                    {study.client}
                  </Link>
                </h2>
                <p className="lf-cases__deck">{study.title}</p>
                <span className="lf-cases__result-flag">Shipped</span>

                {/* Outcome-led: the result headline + honest metric chips.
                    The full Problem/Kept/Changed/Result arc lives on the
                    detail page — the hub's job is to make you click. */}
                <dl className="lf-cases__dl">
                  <div>
                    <dt>Problem</dt>
                    <dd>{study.problem}</dd>
                  </div>
                  <div>
                    <dt>Result</dt>
                    <dd>{study.result}</dd>
                  </div>
                </dl>

                {study.metrics && study.metrics.length > 0 && (
                  <ul className="lf-cases__chips" aria-label="Project facts">
                    {study.metrics.map((m) => (
                      <li key={m.label} className="lf-cases__chip">
                        <span className="lf-cases__chip-value">{m.value}</span>
                        <span className="lf-cases__chip-label">{m.label}</span>
                      </li>
                    ))}
                  </ul>
                )}

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
                    <Link
                      to={`/case-studies/${study.slug}/`}
                      className="lf-cases__read"
                      onClick={vtNav(`/case-studies/${study.slug}/`, preloadDetail)}
                    >
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

            {/* Metric interlude — one study's proof trio, straight from site.ts. */}
            {interlude?.metrics && interlude.metrics.length > 0 && (
              <aside
                className="lf-cases__interlude"
                aria-label={`From the record: ${interlude.client}`}
              >
                <Link
                  to={`/case-studies/${interlude.slug}/`}
                  className="lf-cases__interlude-link"
                  onClick={vtNav(`/case-studies/${interlude.slug}/`, preloadDetail)}
                >
                  <span className="lf-cases__interlude-head">
                    <span className="lf-cases__interlude-kicker">From the record</span>
                    <span className="lf-cases__interlude-client">{interlude.client}</span>
                  </span>
                  <span className="lf-cases__interlude-chips">
                    {interlude.metrics.map((m) => (
                      <span key={m.label} className="lf-cases__interlude-chip">
                        <span className="lf-cases__interlude-value">{m.value}</span>
                        <span className="lf-cases__interlude-label">{m.label}</span>
                      </span>
                    ))}
                  </span>
                  <span className="lf-cases__interlude-cta">
                    Read the case
                    <span aria-hidden="true"> →</span>
                  </span>
                </Link>
              </aside>
            )}
            </Fragment>
            );
          })}
        </div>
      </section>

      <QuietContact />
    </>
  );
}

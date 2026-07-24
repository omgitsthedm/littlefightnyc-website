import { Fragment } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowUpRight, Award, LockKeyhole } from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import LiveSiteExplorer from "@/components/editorial/LiveSiteExplorer";
import ProofPassport, { ProofStatus } from "@/components/editorial/ProofPassport";
import ProjectWalkthrough from "@/components/editorial/ProjectWalkthrough";
import ProjectMomentum from "@/components/editorial/ProjectMomentum";
import {
  caseProofLabel,
  caseProofPriority,
  hasPublicCapture,
} from "@/components/editorial/caseProof";
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
  const study = caseStudies.find((entry) => entry.slug === slug);

  if (!study) return <Navigate to="/examples/" replace />;

  const related = caseStudies
    .filter(
      (entry) =>
        entry.slug !== study.slug
        && entry.showcase.availability === "public"
        && Boolean(entry.url),
    )
    .sort((first, second) => {
      const firstSharedServices = first.services.filter((service) =>
        study.services.includes(service)
      ).length;
      const secondSharedServices = second.services.filter((service) =>
        study.services.includes(service)
      ).length;

      return (
        secondSharedServices - firstSharedServices
        || caseProofPriority(first) - caseProofPriority(second)
      );
    })
    .slice(0, 3);
  const includesLiveCapture = hasPublicCapture(study);
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
        eyebrow={`Case study: ${study.showcase.kind}`}
        icon={Award}
        title={<span className="lf-accent">{study.showcase.label}</span>}
        dek={study.title}
        backdrop={{
          src: study.image,
          alt: "",
          position: study.showcase.heroPosition,
          mobilePosition: study.showcase.heroPositionMobile,
        }}
      />

      <div className="lf-case__hero-band">
        <div className="lf-case__hero-band-inner">
          <span className="lf-case__hero-badge">
            {caseProofLabel(study)}
          </span>
          <span className="lf-case__hero-actions">
            {study.showcase.availability === "public" && study.url ? (
              <a
                className="lf-case__hero-live"
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {displayDomain(study.url)}
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <span className="lf-case__hero-private">
                <LockKeyhole size={14} strokeWidth={1.8} aria-hidden="true" />
                Client access only
              </span>
            )}
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

            <div className="lf-case-next__passport">
              <ProofPassport study={study} />
            </div>

            <aside className="lf-case-next__details" aria-label="Project details">
              <div>
                <span>Client</span>
                <strong>{study.client}</strong>
              </div>
              <div>
                <span>Work</span>
                <strong>{study.showcase.kind}</strong>
              </div>
              <div>
                <span>Services</span>
                <strong>
                  {serviceLinks.map((service, index) => (
                    <Fragment key={service.slug}>
                      {index > 0 && ", "}
                      <Link to={`/services/${service.slug}/`}>{service.label}</Link>
                    </Fragment>
                  ))}
                </strong>
              </div>
              <div>
                <span>Availability</span>
                <strong>{caseProofLabel(study)}</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="lf-case-next__live" aria-labelledby="lf-case-live-title">
          <div className="lf-case-next__live-inner">
            <header>
              <h2 id="lf-case-live-title">
                {includesLiveCapture ? "Open the live build." : "Walk through the build."}
              </h2>
              <p>
                {includesLiveCapture
                  ? "Switch between desktop and phone captures, then follow the working path from input to result."
                  : "Every stage is shown below, from the first customer need to the result the business uses."}
              </p>
            </header>
            <div className="lf-case-next__explorer">
              {includesLiveCapture && (
                <LiveSiteExplorer
                  client={study.client}
                  slug={study.slug}
                  url={study.url}
                  captureDate={study.showcase.proof.captureDate!}
                />
              )}
              <ProjectWalkthrough key={study.slug} study={study} />
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

      <ProjectMomentum slug={study.slug} variant="detail" />

      {related.length > 0 && (
        <section className="lf-case-next__related" aria-labelledby="lf-case-related-title">
          <div className="lf-case-next__related-inner">
            <h2 id="lf-case-related-title">More public work.</h2>
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
                        style={{
                          objectPosition: entry.showcase.heroPosition ?? "center center",
                        }}
                      />
                    </span>
                    <span className="lf-case-next__related-copy">
                      <ProofStatus
                        study={entry}
                        className="lf-case-next__related-status"
                      />
                      <small>{entry.showcase.context}</small>
                      <strong>{entry.showcase.label}</strong>
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

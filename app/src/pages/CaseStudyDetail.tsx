import { Fragment } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  Award,
  LockKeyhole,
  MonitorCheck,
} from "lucide-react";
import PageHero from "@/components/editorial/PageHero";
import QuietContact from "@/components/editorial/QuietContact";
import LiveSiteExplorer from "@/components/editorial/LiveSiteExplorer";
import ProofPassport, { ProofStatus } from "@/components/editorial/ProofPassport";
import ProjectWalkthrough from "@/components/editorial/ProjectWalkthrough";
import ProjectMomentum from "@/components/editorial/ProjectMomentum";
import {
  caseProofLabel,
  caseProofPriority,
  hasCaseCapture,
} from "@/components/editorial/caseProof";
import { caseStudies, services } from "@/data/site";
import {
  acquisitionIntentForServiceSlug,
  techAuditHref,
  type AcquisitionIntent,
} from "@/lib/acquisitionIntent";
import "@/styles/editorial/case-studies.css";

const CASE_PLAN_COPY: Record<AcquisitionIntent, {
  eyebrow: string;
  heading: string;
  detail: string;
  action: string;
}> = {
  website: {
    eyebrow: "See your business in this?",
    heading: "Make your next customer’s step this clear.",
    detail: "Show us the site, booking path, or missing front door. We will tell you what to keep and what should change first.",
    action: "Plan a website like this",
  },
  systems: {
    eyebrow: "See your workflow in this?",
    heading: "Put the real work in one system you own.",
    detail: "Show us the spreadsheet, subscription, or hand-done process. We will map the smallest useful system before any paid build.",
    action: "Plan a system you own",
  },
  support: {
    eyebrow: "Something breaking today?",
    heading: "Fix the break before it costs another customer.",
    detail: "Tell us what stopped working and what the business needs next. A person will name the clearest first move.",
    action: "Get practical tech help",
  },
  consulting: {
    eyebrow: "Not sure what the problem is?",
    heading: "Get the honest next move before buying more tech.",
    detail: "We will read the setup, separate the useful parts from the drag, and say when the right answer is to leave it alone.",
    action: "Get a free second opinion",
  },
  clients: {
    eyebrow: "Already working with us?",
    heading: "Keep the next move with the project.",
    detail: "Use the client desk for project questions, content, access, care, and billing.",
    action: "Open the client desk",
  },
  general: {
    eyebrow: "See your business in this?",
    heading: "Start with one clear next move.",
    detail: "Tell us what feels slow, unclear, expensive, or broken. A person will read it and tell you what matters first.",
    action: "Get a free second opinion",
  },
};

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
  const includesCapture = hasCaseCapture(study);
  const isCaseOnly = study.showcase.proof.status === "case-only";
  const serviceLinks = study.services
    .map((service) => ({ slug: service, label: serviceLabel(service) }))
    .filter((service): service is { slug: string; label: string } => Boolean(service.label));
  const caseIntent = study.services
    .map(acquisitionIntentForServiceSlug)
    .find((intent) => intent !== "general") ?? "general";
  const casePlan = CASE_PLAN_COPY[caseIntent];

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
          video: study.video,
          fit: study.video ? "contain" : "cover",
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
            ) : isCaseOnly ? (
              <span className="lf-case__hero-private">
                <MonitorCheck size={14} strokeWidth={1.8} aria-hidden="true" />
                {study.showcase.privacyLabel ?? "Case study only"}
              </span>
            ) : (
              <span className="lf-case__hero-private">
                <LockKeyhole size={14} strokeWidth={1.8} aria-hidden="true" />
                {study.showcase.privacyLabel ?? "Client access only"}
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

        <section className="lf-case-next__plan" aria-labelledby="lf-case-plan-title">
          <div className="lf-case-next__plan-inner">
            <div>
              <p>{casePlan.eyebrow}</p>
              <h2 id="lf-case-plan-title">{casePlan.heading}</h2>
              <span>{casePlan.detail}</span>
            </div>
            <Link
              to={caseIntent === "clients"
                ? "/clients/"
                : techAuditHref(caseIntent, `case_${study.slug}`)}
              data-lf-event={
                caseIntent === "clients"
                  ? undefined
                  : caseIntent === "website"
                    ? "website_plan_intent"
                    : "human_review_requested"
              }
              data-lf-label="case_proof"
            >
              {casePlan.action}
              <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="lf-case-next__live" aria-labelledby="lf-case-live-title">
          <div className="lf-case-next__live-inner">
            <header>
              <h2 id="lf-case-live-title">
                {includesCapture
                  ? study.url
                    ? "Explore the responsive build."
                    : "Explore the responsive proof."
                  : "Walk through the build."}
              </h2>
              <p>
                {includesCapture
                  ? "See the available screens as one system, then scroll each real capture and follow the working path from need to result."
                  : "Every stage is shown below, from the first customer need to the result the business uses."}
              </p>
            </header>
            <div className="lf-case-next__explorer">
              {includesCapture && (
                <LiveSiteExplorer
                  key={`explorer-${study.slug}`}
                  client={study.client}
                  slug={study.slug}
                  url={study.url || undefined}
                  captureDate={study.showcase.proof.captureDate!}
                  devices={study.showcase.proof.captureDevices}
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
        intent={caseIntent}
      />
    </>
  );
}

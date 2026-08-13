import {
  ArrowRight,
  ArrowUpRight,
  LockKeyhole,
  MonitorCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { CaseStudy } from "@/data/site";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { ProofStatus } from "./ProofPassport";
import CinematicMedia from "./CinematicMedia";
import "./ProjectReviewGrid.css";

export default function ProjectReviewGrid({
  studies,
  variant = "all",
}: {
  studies: CaseStudy[];
  variant?: "home" | "all";
}) {
  return (
    <div className="lf-project-review-grid" data-variant={variant}>
      {studies.map((study) => {
        const liveClientSite = study.showcase.linkPolicy === "custom-domain"
          && Boolean(study.featureProof)
          && Boolean(study.url);
        // VenueCircuit is intentionally frozen while its separate recovery is underway.
        const preservedVenueLink = study.slug === "venuecircuit" && Boolean(study.url);
        const liveUrl = liveClientSite || preservedVenueLink ? study.url : "";

        return (
        <article className="lf-project-review" key={study.slug}>
          <div className="lf-project-review__media">
            {study.video ? (
              <CinematicMedia
                media={study.video}
                alt={`${study.client}: cabinetry plans becoming a finished kitchen`}
              />
            ) : study.image && !study.inventoryOnly ? (
              <img
                {...skelImg}
                src={study.image}
                {...responsiveImageProps(
                  study.image,
                  variant === "home"
                    ? "(min-width: 720px) 46vw, 100vw"
                    : "(min-width: 900px) 46vw, 100vw",
                  [480, 640, 900],
                )}
                alt={`${study.client}: ${study.showcase.label}`}
                width={1600}
                height={1200}
                loading="lazy"
                decoding="async"
                style={
                  variant === "all"
                    ? {
                        objectPosition:
                          study.showcase.heroPosition ?? "center center",
                      }
                    : undefined
                }
              />
            ) : (
              <div
                className="lf-project-review__inventory-media"
                role="img"
                aria-label={`${study.client}: public-safe internal project walkthrough`}
              >
                <span>Internal project</span>
                <strong>{study.client}</strong>
                <small>Public-safe walkthrough</small>
              </div>
            )}
          </div>

          <div className="lf-project-review__body">
            <div className="lf-project-review__meta">
              <ProofStatus study={study} className="lf-project-review__status" />
              <span>{study.showcase.context}</span>
            </div>
            <h3>
              {variant === "all" ? study.client : study.showcase.label}
            </h3>
            <p className="lf-project-review__title">
              {variant === "all" ? study.showcase.label : study.title}
            </p>
            <p className="lf-project-review__result">
              {study.featureProof?.ownerOutcome ?? study.result}
            </p>

            {liveClientSite && study.featureProof && (
              <p className="lf-project-review__source">
                Source: <a href={study.featureProof.sourceUrl} target="_blank" rel="noopener noreferrer">{study.featureProof.sourceLabel}</a>
                <span aria-hidden="true"> · </span>
                <time dateTime={study.featureProof.verifiedAt}>
                  Verified {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(`${study.featureProof.verifiedAt}T00:00:00Z`))}
                </time>
              </p>
            )}

            {study.metrics && study.metrics.length > 0 && (
              <dl className="lf-project-review__facts">
                {study.metrics.slice(0, 2).map((metric) => (
                  <div key={metric.label}>
                    <dt>{metric.value}</dt>
                    <dd>{metric.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <footer className="lf-project-review__actions">
            <Link to={`/case-studies/${study.slug}/`}>
              Read the case
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-lf-event={liveClientSite ? "portfolio_live_source" : undefined}
                data-lf-label={liveClientSite ? study.slug : undefined}
              >
                {liveClientSite && study.featureProof
                  ? `Visit ${study.featureProof.sourceLabel}`
                  : "Open live"}
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : study.showcase.proof.status === "case-only" ? (
              <span className="lf-project-review__private">
                <MonitorCheck size={15} strokeWidth={1.8} aria-hidden="true" />
                {study.showcase.privacyLabel ?? "Case study only"}
              </span>
            ) : (
              <span className="lf-project-review__private">
                <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
                {study.showcase.privacyLabel ?? "Private system"}
              </span>
            )}
          </footer>
        </article>
        );
      })}
    </div>
  );
}

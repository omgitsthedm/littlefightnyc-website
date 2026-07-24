import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import type { CaseStudy } from "@/data/site";
import { responsiveImageProps } from "@/lib/responsiveImages";
import { skelImg } from "@/lib/imgSkeleton";
import { ProofStatus } from "./ProofPassport";
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
      {studies.map((study) => (
        <article className="lf-project-review" key={study.slug}>
          <div className="lf-project-review__media">
            <img
              {...skelImg}
              src={study.image}
              {...responsiveImageProps(
                study.image,
                variant === "home"
                  ? "(min-width: 1120px) 30vw, (min-width: 720px) 46vw, 100vw"
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
            <p className="lf-project-review__result">{study.result}</p>

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
            {study.showcase.availability === "public" && study.url ? (
              <a href={study.url} target="_blank" rel="noopener noreferrer">
                Open live
                <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
              </a>
            ) : (
              <span className="lf-project-review__private">
                <LockKeyhole size={15} strokeWidth={1.8} aria-hidden="true" />
                {study.showcase.privacyLabel ?? "Private system"}
              </span>
            )}
          </footer>
        </article>
      ))}
    </div>
  );
}

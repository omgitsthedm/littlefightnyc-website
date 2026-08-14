import type { CaseStudy } from "@/data/site";
import { ArrowUpRight } from "lucide-react";
import { ProofMetricValue } from "@/components/dataviz/ProofMetricValue";
import { caseProofLabel, formatCaseProofDate } from "./caseProof";
import "./ProofPassport.css";

type ProofStatusProps = {
  study: CaseStudy;
  className?: string;
};

export function ProofStatus({ study, className = "" }: ProofStatusProps) {
  const modifier = study.showcase.proof.status;

  return (
    <span
      className={`lf-proof-status lf-proof-status--${modifier}${className ? ` ${className}` : ""}`}
    >
      {caseProofLabel(study)}
    </span>
  );
}

export default function ProofPassport({ study }: { study: CaseStudy }) {
  const buildFacts = study.metrics?.filter((metric) => metric.evidence === "build") ?? [];
  const releaseFacts =
    study.metrics?.filter((metric) => metric.evidence === "release") ?? [];
  const businessOutcomes =
    study.metrics?.filter((metric) => metric.evidence === "business-outcome") ?? [];
  const captureDate = study.showcase.proof.captureDate;

  return (
    <section
      className="lf-proof-passport"
      aria-label={`${study.showcase.label} proof passport`}
    >
      <header className="lf-proof-passport__head">
        <div>
          <p>Proof passport</p>
          <strong>{study.client}</strong>
        </div>
        <ProofStatus study={study} />
      </header>

      {study.featureProof && (
        <a
          className="lf-proof-passport__source"
          href={study.featureProof.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-lf-event="portfolio_live_source"
          data-lf-label={study.slug}
        >
          <span>Live source</span>
          <strong>{study.featureProof.sourceLabel}</strong>
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
        </a>
      )}

      <dl className="lf-proof-passport__dates" aria-label="Proof dates">
        {captureDate && (
          <div>
            <dt>Captured</dt>
            <dd>
              <time dateTime={captureDate}>{formatCaseProofDate(captureDate)}</time>
            </dd>
          </div>
        )}
        {study.updated && (
          <div>
            <dt>Case updated</dt>
            <dd>
              <time dateTime={study.updated}>{formatCaseProofDate(study.updated)}</time>
            </dd>
          </div>
        )}
        {study.featureProof && (
          <div>
            <dt>Verified live</dt>
            <dd>
              <time dateTime={study.featureProof.verifiedAt}>
                {formatCaseProofDate(study.featureProof.verifiedAt)}
              </time>
            </dd>
          </div>
        )}
      </dl>

      <div className="lf-proof-passport__evidence">
        <section aria-label="Build facts">
          <h3>What was made</h3>
          <p>These are build notes, not a promise about your business.</p>
          <dl>
            {buildFacts.map((metric) => (
              <div key={metric.label}>
                <dt>
                  <ProofMetricValue value={metric.value} label={metric.label} />
                </dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {study.featureProof && releaseFacts.length > 0 ? (
          <section aria-label="Dated build checks">
            <h3>Dated build checks</h3>
            <p>
              Measured for this project. See the live public site above; these are not
              sales, revenue, or conversion results.
            </p>
            <dl>
              {releaseFacts.map((metric) => (
                <div key={metric.label}>
                  <dt>
                    <ProofMetricValue value={metric.value} label={metric.label} />
                  </dt>
                  <dd>{metric.label}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : (
          <section aria-label="Proof boundary">
            <h3>What we will not claim</h3>
            <p>
              We do not publish unlinked speed, revenue, or client-result claims for
              this project.
            </p>
          </section>
        )}

        {businessOutcomes.length > 0 && (
          <section aria-label="Client-approved business outcomes">
            <h3>Client-approved business outcomes</h3>
            <dl>
              {businessOutcomes.map((metric) => (
                <div key={metric.label}>
                  <dt>
                  <ProofMetricValue value={metric.value} label={metric.label} />
                </dt>
                  <dd>{metric.label}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </section>
  );
}

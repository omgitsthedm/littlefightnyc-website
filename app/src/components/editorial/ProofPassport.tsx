import type { CaseStudy } from "@/data/site";
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
      </dl>

      <div className="lf-proof-passport__evidence">
        <section aria-label="Build facts">
          <h3>Build facts</h3>
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

        <section aria-label="Verified release facts">
          <h3>Verified release facts</h3>
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

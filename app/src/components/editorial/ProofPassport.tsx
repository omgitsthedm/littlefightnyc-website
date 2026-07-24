import type { CaseStudy } from "@/data/site";
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
  const deliveredResults =
    study.metrics?.filter((metric) => metric.evidence === "outcome") ?? [];
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
                <dt>{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Delivered results">
          <h3>Delivered results</h3>
          <dl>
            {deliveredResults.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.value}</dt>
                <dd>{metric.label}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}

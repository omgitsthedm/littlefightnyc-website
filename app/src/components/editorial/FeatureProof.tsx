import { useId, useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { CaseStudy } from "@/data/site-cases";
import { formatCaseProofDate } from "./caseProof";
import "./FeatureProof.css";

export default function FeatureProof({ study }: { study: CaseStudy }) {
  const proof = study.featureProof;
  const id = useId();
  const [activeStep, setActiveStep] = useState(0);
  // The first panel paints complete; only a real step change animates, so the
  // page never presents copy at partial opacity on first load.
  const [switched, setSwitched] = useState(false);

  if (!proof) return null;

  const steps = proof.steps;
  const active = steps[activeStep];

  function activateStep(index: number) {
    if (index !== activeStep) setSwitched(true);
    setActiveStep(index);
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (index + 1) % steps.length;
        break;
      case "ArrowLeft":
        nextIndex = (index - 1 + steps.length) % steps.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = steps.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    activateStep(nextIndex);
    event.currentTarget
      .closest<HTMLElement>("[role=tablist]")
      ?.querySelectorAll<HTMLButtonElement>("[role=tab]")[nextIndex]
      ?.focus();
  }

  return (
    <section
      className="lf-feature-proof"
      data-feature-proof={study.slug}
      aria-labelledby={`${id}-title`}
    >
      <header className="lf-feature-proof__head">
        <div>
          <p>Try what makes it work</p>
          <h3 id={`${id}-title`}>{proof.label}</h3>
        </div>
        <a
          href={proof.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-lf-event="portfolio_live_source"
          data-lf-label={study.slug}
        >
          Visit {proof.sourceLabel}
          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </a>
      </header>

      <div className="lf-feature-proof__context">
        <div>
          <span>What this does</span>
          <strong>{proof.ownerOutcome}</strong>
        </div>
        <div>
          <span>Why it matters</span>
          <p>{proof.whyItMatters}</p>
        </div>
      </div>

      <div className="lf-feature-proof__steps">
        <div
          className="lf-feature-proof__tabs"
          role="tablist"
          aria-label={`${study.client} feature proof steps`}
        >
          {steps.map((step, index) => {
            const selected = index === activeStep;

            return (
              <button
                key={step.label}
                type="button"
                role="tab"
                id={`${id}-tab-${index}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                data-feature-proof-step={index}
                onClick={() => activateStep(index)}
                // The static response keeps the complete first panel and a
                // text alternative; roving-tab keys become available once
                // this live component mounts.
                onKeyDown={(event) => handleTabKeyDown(event, index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.label}
              </button>
            );
          })}
        </div>

        <div
          key={activeStep}
          className={`lf-feature-proof__panel${switched ? " lf-feature-proof__panel--enter" : ""}`}
          id={`${id}-panel-${activeStep}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${activeStep}`}
          tabIndex={0}
        >
          <CheckCircle2 size={20} strokeWidth={1.8} aria-hidden="true" />
          <div>
            <span>{active.label}</span>
            <p>{active.detail}</p>
          </div>
        </div>
      </div>

      <footer className="lf-feature-proof__source">
        <span>
          Source: <a href={proof.sourceUrl} target="_blank" rel="noopener noreferrer">{proof.sourceLabel}</a>
        </span>
        <span>
          Verified live: <time dateTime={proof.verifiedAt}>{formatCaseProofDate(proof.verifiedAt)}</time>
        </span>
        <details data-lf-disclosure={`feature-proof:${study.slug}`}>
          <summary>Plain-English readout</summary>
          <p>{proof.textAlternative}</p>
        </details>
      </footer>
    </section>
  );
}

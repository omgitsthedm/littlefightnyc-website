import { useState } from "react";
import { Boxes, Globe2, LockKeyhole, Network, ShoppingBag } from "lucide-react";
import type { CaseStudy } from "@/data/site";
import { caseProofLabel } from "./caseProof";
import "./ProjectWalkthrough.css";

function ProjectIcon({ kind }: { kind: string }) {
  const normalized = kind.toLowerCase();
  const props = { size: 21, strokeWidth: 1.8, "aria-hidden": true as const };
  if (normalized.includes("private")) return <LockKeyhole {...props} />;
  if (normalized.includes("commerce")) return <ShoppingBag {...props} />;
  if (normalized.includes("connected")) return <Network {...props} />;
  if (normalized.includes("product")) return <Boxes {...props} />;
  return <Globe2 {...props} />;
}

export default function ProjectWalkthrough({ study }: { study: CaseStudy }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStage = study.showcase.stages[activeIndex] ?? study.showcase.stages[0];
  const tabPrefix = `lf-project-${study.slug}`;

  if (!activeStage) return null;

  function focusStage(index: number) {
    const nextIndex = (index + study.showcase.stages.length) % study.showcase.stages.length;
    setActiveIndex(nextIndex);
    document.getElementById(`${tabPrefix}-tab-${nextIndex}`)?.focus();
  }

  return (
    <section className="lf-project-walkthrough" aria-label={`${study.showcase.label} walkthrough`}>
      <header className="lf-project-walkthrough__head">
        <span className="lf-project-walkthrough__icon" aria-hidden="true">
          <ProjectIcon kind={study.showcase.kind} />
        </span>
        <div>
          <p>{study.showcase.kind}</p>
          <h3>{study.showcase.label}</h3>
        </div>
        <span
          className={`lf-project-walkthrough__availability lf-project-walkthrough__availability--${study.showcase.availability}`}
        >
          {caseProofLabel(study)}
        </span>
      </header>

      <div
        className="lf-project-walkthrough__stages"
        role="tablist"
        aria-label="Project flow"
        style={{ "--lf-stage-count": study.showcase.stages.length } as React.CSSProperties}
      >
        {study.showcase.stages.map((stage, index) => (
          <button
            key={stage.label}
            id={`${tabPrefix}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls={`${tabPrefix}-panel`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                focusStage(index + 1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                focusStage(index - 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                focusStage(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                focusStage(study.showcase.stages.length - 1);
              }
            }}
          >
            <span className="lf-project-walkthrough__marker" aria-hidden="true" />
            <span>{stage.label}</span>
          </button>
        ))}
      </div>

      <div
        key={activeStage.label}
        id={`${tabPrefix}-panel`}
        className="lf-project-walkthrough__detail"
        role="tabpanel"
        aria-labelledby={`${tabPrefix}-tab-${activeIndex}`}
      >
        <span aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")}</span>
        <div>
          <h4>{activeStage.label}</h4>
          <p>{activeStage.detail}</p>
        </div>
      </div>
    </section>
  );
}

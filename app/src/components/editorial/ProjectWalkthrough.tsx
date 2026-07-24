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
  if (study.showcase.stages.length === 0) return null;

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

      <ol
        className="lf-project-walkthrough__stages"
        aria-label="How the project works"
        style={{ "--lf-stage-count": study.showcase.stages.length } as React.CSSProperties}
      >
        {study.showcase.stages.map((stage) => (
          <li
            key={stage.label}
          >
            <span className="lf-project-walkthrough__marker" aria-hidden="true" />
            <div>
              <h4>{stage.label}</h4>
              <p>{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

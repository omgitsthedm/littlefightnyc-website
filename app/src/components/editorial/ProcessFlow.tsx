import { useScrollReveal } from "./useScrollReveal";
import { agencyProcess } from "@/data/site";
import "./ProcessFlow.css";

/**
 * Process-flow explainer — the agency method as a visual sequence.
 * Four beats on a connecting line that draws in on scroll (orange→blue),
 * steps stagger up. Grounded in the real `agencyProcess` data. Reduced-motion
 * safe (line + steps resolve to their end state instantly).
 */
export default function ProcessFlow() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });

  return (
    <section className="lf-process" aria-labelledby="lf-process-heading">
      <div className="lf-process__inner">
        <p className="lf-mono lf-process__kicker">How the work goes</p>
        <h2 id="lf-process-heading" className="lf-display lf-process__title">
          The order is always the same.
        </h2>

        <div ref={ref} className="lf-process__flow">
          <span className="lf-process__line" aria-hidden="true" />
          <ol className="lf-process__steps">
            {agencyProcess.map((step, i) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.label}
                  className="lf-process__step"
                  style={{ ["--lf-i" as string]: i }}
                >
                  <span className="lf-process__icon" aria-hidden="true">
                    <Icon size={22} strokeWidth={1.75} />
                  </span>
                  <p className="lf-process__step-head">
                    <span className="lf-mono lf-process__step-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="lf-process__step-label">{step.label}</span>
                  </p>
                  <p className="lf-process__step-copy">{step.copy}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

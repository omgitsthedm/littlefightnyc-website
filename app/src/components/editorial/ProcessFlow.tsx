import { useEffect } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { agencyProcess } from "@/data/site";
import "./ProcessFlow.css";

/**
 * Process-flow explainer — the agency method as a visual sequence.
 * Four beats on a connecting line that draws in on scroll (orange→blue),
 * steps stagger up. Grounded in the real `agencyProcess` data. Reduced-motion
 * safe (line + steps resolve to their end state instantly). After the draw-in,
 * two small orange packets travel the line on a slow loop — paused while the
 * section is off-viewport, absent under prefers-reduced-motion.
 */
export default function ProcessFlow() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.25 });

  // Keep `data-inview` fresh so the packet loop pauses off-viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-inview", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          el.setAttribute("data-inview", entry.isIntersecting ? "true" : "false");
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  return (
    <section className="lf-process" aria-labelledby="lf-process-heading">
      <div className="lf-process__inner">
        <p className="lf-mono lf-process__kicker">How the work goes</p>
        <h2 id="lf-process-heading" className="lf-display lf-process__title">
          The order is always the same.
        </h2>

        <div ref={ref} className="lf-process__flow">
          <span className="lf-process__line" aria-hidden="true" />
          <span className="lf-process__packets" aria-hidden="true">
            <span className="lf-process__packet" />
            <span className="lf-process__packet lf-process__packet--late" />
          </span>
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

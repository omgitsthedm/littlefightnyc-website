import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./AnswerStepper.css";

type Section = { heading: string; body: string };

/**
 * AnswerStepper — the urgent guides' triage rail. Renders the guide's
 * authored sections, in their authored order, as a numbered vertical stepper:
 * orange nodes on a hairline connector that draws in on scroll. Content is
 * passed straight through from site.ts — this component adds structure only.
 * Reduced motion renders the final state instantly (motion.css collapses the
 * transitions; the hook reveals immediately).
 */
export default function AnswerStepper({ sections }: { sections: Section[] }) {
  const ref = useScrollReveal<HTMLOListElement>({ threshold: 0.08 });

  return (
    <ol className="lf-triage" ref={ref} aria-label="Triage steps, in order">
      {sections.map((section, i) => (
        <li
          key={section.heading}
          className="lf-triage__step"
          style={{ ["--lf-i" as string]: i }}
        >
          <span className="lf-triage__node" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="lf-triage__body">
            <h2 className="lf-triage__heading">{section.heading}</h2>
            <p className="lf-triage__text">{section.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

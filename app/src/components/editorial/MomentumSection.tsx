import { Link } from "react-router-dom";
import { ArrowUpRight, BadgeDollarSign, FileText, ShieldCheck, Workflow } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import AmbientField from "./AmbientField";
import OneSystemDiagram from "@/components/dataviz/OneSystemDiagram";
import "./MomentumSection.css";

/**
 * Momentum — a bento feature section (Axiom "Momentum" system, product-OS soul).
 * Shows the four things Little Fight runs for a shop as one operating system.
 * 32px card language, mono labels, orange lead, blue as a real accent,
 * staggered scroll reveal. Reduced-motion safe via useScrollReveal.
 */

const CAPABILITIES = [
  {
    icon: Workflow,
    label: "Workflow",
    title: "Built around the work",
    line: "The tool follows the way your staff quotes, books, tracks, and follows up.",
  },
  {
    icon: BadgeDollarSign,
    label: "Cost",
    title: "Replace the monthly drag",
    line: "A focused build can beat years of paying for features your team never opens.",
  },
  {
    icon: ShieldCheck,
    label: "Ownership",
    title: "The keys stay with you",
    line: "Your code, data, hosting, domain, and documentation belong to the business.",
  },
  {
    icon: FileText,
    label: "Handoff",
    title: "Built to outlive the builder",
    line: "Standard technology and plain documentation let another good developer take over.",
  },
] as const;


export default function MomentumSection() {
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="lf-momentum" aria-labelledby="lf-momentum-heading">
      <AmbientField />
      <div ref={headRef} className="lf-container lf-momentum__head">
        <p className="lf-mono lf-momentum__eyebrow">
          Software you own
        </p>
        <h2 id="lf-momentum-heading" className="lf-display lf-momentum__title">
          Stop renting the wrong software.
        </h2>
        <p className="lf-momentum__lede">
          When a generic platform is too bloated or the workflow is too specific,
          we build the missing tool and hand over the keys.
        </p>
      </div>

      <div ref={gridRef} className="lf-container lf-momentum__grid">
        {/* Feature tile — the operating-system statement */}
        <article className="lf-momentum__card lf-momentum__card--feature" style={{ ["--i" as string]: 0 }}>
          <div className="lf-momentum__glow" aria-hidden="true" />
          <div className="lf-momentum__feature-cols">
            <div className="lf-momentum__feature-main">
              <div className="lf-momentum__feature-body">
                <span className="lf-mono lf-momentum__card-label">Ownership, not lock-in</span>
                <h3 className="lf-display lf-momentum__feature-title">
                  Software your business owns.
                </h3>
                <p className="lf-momentum__feature-line">
                  One focused build, paid across development. No hostage pricing,
                  and no endless rent for the same workflow.
                </p>
              </div>
            </div>
            <div className="lf-momentum__feature-viz">
              <OneSystemDiagram />
            </div>
          </div>
        </article>

        {/* Capability tiles */}
        {CAPABILITIES.map(({ icon: Icon, label, title, line }, index) => (
          <article
            key={label}
            className="lf-momentum__card lf-momentum__card--cap"
            style={{ ["--i" as string]: index + 1 }}
          >
            <span className="lf-momentum__icon" aria-hidden="true">
              <Icon size={30} strokeWidth={1.5} />
            </span>
            <span className="lf-mono lf-momentum__card-label">{label}</span>
            <h3 className="lf-momentum__card-title">{title}</h3>
            <p className="lf-momentum__card-line">{line}</p>
          </article>
        ))}

        {/* Accent CTA tile — blue as the second signal */}
        <article className="lf-momentum__card lf-momentum__card--cta" style={{ ["--i" as string]: 5 }}>
          <span className="lf-mono lf-momentum__card-label lf-momentum__card-label--blue">
            Free consulting
          </span>
          <h3 className="lf-display lf-momentum__cta-title">
            Do the math before you build.
          </h3>
          <p className="lf-momentum__card-line">
            We compare the software bill and the staff time around it at no cost.
          </p>
          <Link to="/tech-audit/" viewTransition className="lf-momentum__cta-button">
            Review my software
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
        </article>
      </div>
    </section>
  );
}

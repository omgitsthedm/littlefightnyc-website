import { Link } from "react-router-dom";
import { Globe, LifeBuoy, MapPin, Workflow, ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import AmbientField from "./AmbientField";
import "./MomentumSection.css";

/**
 * Momentum — a bento feature section (Axiom "Momentum" system, product-OS soul).
 * Shows the four things Little Fight runs for a shop as one operating system.
 * 32px card language, mono labels, orange lead, blue as a real accent,
 * staggered scroll reveal. Reduced-motion safe via useScrollReveal.
 */

const CAPABILITIES = [
  {
    icon: Globe,
    label: "Websites",
    title: "A site that earns its keep",
    line: "Fast, findable, built to convert — not a template you fight with.",
    to: "/services/custom-local-websites/",
  },
  {
    icon: LifeBuoy,
    label: "IT Support",
    title: "Someone who picks up",
    line: "When the register, Wi-Fi, or email goes down, you reach a human.",
    to: "/services/it-support/",
  },
  {
    icon: MapPin,
    label: "Local Visibility",
    title: "Found on your block",
    line: "Maps, reviews, and search dialed in for the neighborhood you serve.",
    to: "/services/tech-consulting/",
  },
  {
    icon: Workflow,
    label: "Business Systems",
    title: "The busywork, handled",
    line: "Connect the tools you keep, replace the ones that drag, automate the rest.",
    to: "/services/business-systems/",
  },
] as const;

const KEYCAPS = ["K", "E", "E", "P", "·", "F", "I", "T"] as const;

export default function MomentumSection() {
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="lf-momentum" aria-labelledby="lf-momentum-heading">
      <AmbientField />
      <div ref={headRef} className="lf-container lf-momentum__head">
        <p className="lf-mono lf-momentum__eyebrow">
          <span className="lf-momentum__eyebrow-num">II.</span>
          <span className="lf-momentum__eyebrow-divider" aria-hidden="true">·</span>
          The System
        </p>
        <h2 id="lf-momentum-heading" className="lf-display lf-momentum__title">
          Everything your shop runs on.
          <br />
          <span className="lf-momentum__title-em">One system.</span>
        </h2>
        <p className="lf-momentum__lede">
          Keep what works. Connect what matters. Replace what drags. Build what
          fits. Little Fight runs the tech so you can run the shop.
        </p>
      </div>

      <div ref={gridRef} className="lf-container lf-momentum__grid">
        {/* Feature tile — the operating-system statement */}
        <article className="lf-momentum__card lf-momentum__card--feature" style={{ ["--i" as string]: 0 }}>
          <div className="lf-momentum__glow" aria-hidden="true" />
          <div className="lf-momentum__feature-body">
            <span className="lf-mono lf-momentum__card-label">Operating system</span>
            <h3 className="lf-display lf-momentum__feature-title">
              Right-sized tech for the shops that built New York.
            </h3>
            <p className="lf-momentum__feature-line">
              No bloated stack. No monthly tool you never open. One team that
              knows your setup end to end.
            </p>
          </div>
          <div className="lf-momentum__keycaps" aria-hidden="true">
            {KEYCAPS.map((cap, i) => (
              <span key={i} className="lf-momentum__keycap">
                {cap}
              </span>
            ))}
          </div>
        </article>

        {/* Capability tiles */}
        {CAPABILITIES.map(({ icon: Icon, label, title, line, to }, index) => (
          <Link
            key={label}
            to={to}
            viewTransition
            className="lf-momentum__card lf-momentum__card--cap"
            style={{ ["--i" as string]: index + 1 }}
          >
            <span className="lf-momentum__icon" aria-hidden="true">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="lf-mono lf-momentum__card-label">{label}</span>
            <h3 className="lf-momentum__card-title">{title}</h3>
            <p className="lf-momentum__card-line">{line}</p>
            <span className="lf-momentum__card-go" aria-hidden="true">
              <ArrowUpRight size={16} strokeWidth={2} />
            </span>
          </Link>
        ))}

        {/* Accent CTA tile — blue as the second signal */}
        <article className="lf-momentum__card lf-momentum__card--cta" style={{ ["--i" as string]: 5 }}>
          <span className="lf-mono lf-momentum__card-label lf-momentum__card-label--blue">
            Start here
          </span>
          <h3 className="lf-display lf-momentum__cta-title">
            Not sure what you need?
          </h3>
          <p className="lf-momentum__card-line">
            Take the Fit Check. Two minutes, three useful outcomes, no pitch.
          </p>
          <Link to="/fit-check/" viewTransition className="lf-momentum__cta-button">
            Start the Fit Check
            <ArrowUpRight size={18} strokeWidth={2} />
          </Link>
        </article>
      </div>
    </section>
  );
}

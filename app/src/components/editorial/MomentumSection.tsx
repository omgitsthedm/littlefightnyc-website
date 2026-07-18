import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import AmbientField from "./AmbientField";
import MoneyLeaving from "@/components/dataviz/MoneyLeaving";
import "./MomentumSection.css";

/**
 * The "software you own" payoff — the close of the what-we-do sequence that
 * begins with WorkGrid's service ladder. WorkGrid already names the four
 * services (one of them "Software your business owns"); this beat shows what
 * owning the system actually looks like — the MoneyLeaving canvas: the balance
 * draining to monthly software bills, resolving to one owned build — and offers
 * the free before-you-build math. Deliberately compact: the four capability
 * details live on /services/business-systems/, not the home page, so the pitch
 * isn't made twice. Reduced-motion safe via useScrollReveal.
 */
export default function MomentumSection() {
  const gridRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section className="lf-momentum" aria-labelledby="lf-momentum-heading">
      <AmbientField />
      <div ref={gridRef} className="lf-container lf-momentum__grid">
        {/* Feature tile — the operating-system statement + diagram */}
        <article className="lf-momentum__card lf-momentum__card--feature" style={{ ["--i" as string]: 0 }}>
          <div className="lf-momentum__glow" aria-hidden="true" />
          <div className="lf-momentum__feature-cols">
            <div className="lf-momentum__feature-main">
              <div className="lf-momentum__feature-body">
                <span className="lf-mono lf-momentum__card-label">Ownership, not lock-in</span>
                <h2 id="lf-momentum-heading" className="lf-display lf-momentum__feature-title">
                  Software your business owns.
                </h2>
                <p className="lf-momentum__feature-line">
                  One focused build, paid across development. No hostage pricing,
                  and no endless rent for the same workflow.
                </p>
              </div>
            </div>
            <div className="lf-momentum__feature-viz">
              <MoneyLeaving />
            </div>
          </div>
        </article>

        {/* Accent CTA tile — blue as the second signal */}
        <article className="lf-momentum__card lf-momentum__card--cta" style={{ ["--i" as string]: 1 }}>
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

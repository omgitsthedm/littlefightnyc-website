import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import TaleOfTheTape from "@/components/dataviz/TaleOfTheTape";
import "./TheFight.css";

/**
 * TheFight — the mission as a FIGHT CARD (rebuilt 2026-07-18; David: the old
 * two-list version was "lame and boring and I don't even understand it").
 *
 * Boxing-poster structure any New Yorker reads in one look:
 *   THE CHAINS vs YOUR BLOCK — giant poster type —
 * then the TaleOfTheTape instrument punches the tape even, row by row, and
 * the closer CTA puts us in their corner. One idea, told once, with teeth.
 */
export default function TheFight() {
  const headRef = useScrollReveal<HTMLElement>({ threshold: 0.25 });
  const closeRef = useScrollReveal<HTMLDivElement>({ threshold: 0.4 });

  return (
    <section className="lf-fight" aria-labelledby="lf-fight-title">
      <header ref={headRef} className="lf-fight__head" data-reveal>
        <p className="lf-fight__eyebrow">Small businesses have enough to fight</p>
        <h2
          id="lf-fight-title"
          className="lf-fight__title"
          aria-label="The chains versus your block"
        >
          <span className="lf-fight__fighter">The chains</span>
          <span className="lf-fight__vs" aria-hidden="true">vs</span>
          <span className="lf-fight__fighter lf-fight__fighter--us">your block</span>
        </h2>
        <p className="lf-fight__lede">
          Big chains start with a tech team, a fast website, connected tools,
          and someone who answers. Your business should have that advantage too.
        </p>
      </header>

      <div className="lf-fight__tape">
        <TaleOfTheTape />
      </div>

      <div ref={closeRef} className="lf-fight__close" data-reveal>
        <p className="lf-fight__close-line">
          The bar, clinic, shop, and law office deserve technology that works
          without becoming another job.
        </p>
        <Link
          to="/tech-audit/"
          className="lf-fight__cta"
          data-lf-event="tech_audit_intent"
          data-lf-label="home_fight"
        >
          Start a free review
          <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

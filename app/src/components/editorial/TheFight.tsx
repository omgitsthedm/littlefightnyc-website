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
        <p className="lf-fight__eyebrow">The fight · every day in New York</p>
        <h2 id="lf-fight-title" className="lf-fight__title">
          <span className="lf-fight__fighter">The chains</span>
          <span className="lf-fight__vs" aria-hidden="true">vs</span>
          <span className="lf-fight__fighter lf-fight__fighter--us">your block</span>
        </h2>
        <p className="lf-fight__lede">
          Whole Foods didn't out-work your block — it out-tooled it. The
          delivery apps skim every order. The chains walked in with a tech
          team. So that's what we are: <strong>yours.</strong>
        </p>
      </header>

      <div className="lf-fight__tape">
        <TaleOfTheTape />
      </div>

      <div ref={closeRef} className="lf-fight__close" data-reveal>
        <p className="lf-fight__close-line">
          The bar. The clinic. The hardware store. The law firm. The places
          that make a block worth living on — with a tech team of their own.
        </p>
        <Link
          to="/tech-audit/"
          className="lf-fight__cta"
          data-lf-event="website_plan_intent"
          data-lf-label="home_fight"
        >
          Put us in your corner
          <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

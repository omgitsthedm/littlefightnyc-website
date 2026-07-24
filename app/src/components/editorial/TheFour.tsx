import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import SiteInFourteen from "@/components/dataviz/SiteInFourteen";
import WhoAnswers from "@/components/dataviz/WhoAnswers";
import TheFreeRead from "@/components/dataviz/TheFreeRead";
import MoneyLeaving from "@/components/dataviz/MoneyLeaving";
import "./TheFour.css";

/**
 * TheFour — the four things we do, each PROVEN by its living instrument.
 *
 * David's brief: the home page is four items of focus — Web Design, Tech
 * Support, Consulting, Personalized Software — organized so a first-time
 * visitor knows exactly who we are and what they get. Each pillar carries the
 * bespoke canvas instrument from its service page (same shared physics
 * harness — one consistent motion world across the whole site):
 *
 *   01 Web Design            → SiteInFourteen (a site assembles, ships day 14)
 *   02 Tech Support          → WhoAnswers (it breaks → a human answers, timed)
 *   03 Consulting            → TheFreeRead (findings sort into a ranked list)
 *   04 Personalized Software → MoneyLeaving (the monthly bills pile → owned)
 *
 * Alternating editorial layout (copy/instrument sides swap per row) on
 * desktop; stacked on phones. Every instrument pauses off-screen and plays a
 * settled frame under reduced motion — the harness handles all of it.
 */

const PILLARS = [
  {
    name: "Custom Websites",
    line: "Fast, clear, easy to find, and built around how your customers choose.",
    to: "/services/custom-local-websites/",
    cta: "See custom websites",
    Viz: SiteInFourteen,
  },
  {
    name: "Broken Tech",
    line: "When the register, Wi-Fi, booking, or email fails, we find the real problem.",
    to: "/services/it-support/",
    cta: "Get tech help",
    Viz: WhoAnswers,
  },
  {
    name: "Free Consulting",
    line: "We understand the setup, find what is slowing the business, and tell you what to fix first.",
    to: "/services/tech-consulting/",
    cta: "Get a free review",
    Viz: TheFreeRead,
  },
  {
    name: "Software You Own",
    line: "When monthly software makes the work harder, we build the focused tool that fits.",
    to: "/services/business-systems/",
    cta: "See owned software",
    Viz: MoneyLeaving,
  },
] as const;

function Pillar({
  pillar,
  flip,
  index,
}: {
  pillar: (typeof PILLARS)[number];
  flip: boolean;
  index: number;
}) {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const { Viz } = pillar;
  return (
    <div
      ref={ref}
      className={`lf-four__pillar${flip ? " lf-four__pillar--flip" : ""}${index === 0 ? " lf-four__pillar--primary" : ""}`}
      data-reveal
      style={{ ["--lf-i" as string]: index }}
    >
      <div className="lf-four__copy">
        <h3 className="lf-four__name">{pillar.name}</h3>
        <p className="lf-four__line">{pillar.line}</p>
        <Link to={pillar.to} className="lf-four__cta">
          {pillar.cta}
          <ArrowUpRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
      <div className="lf-four__viz">
        <Viz />
      </div>
    </div>
  );
}

export default function TheFour() {
  const headRef = useScrollReveal<HTMLElement>({ threshold: 0.3 });
  return (
    <section className="lf-four" aria-labelledby="lf-four-title">
      <header ref={headRef} className="lf-four__head" data-reveal>
        <p className="lf-four__eyebrow">What we do</p>
        <h2 id="lf-four-title" className="lf-four__title">
          One firm. <span className="lf-four__em">Four ways we help.</span>
        </h2>
        <p className="lf-four__dek">
          Start with the problem in front of you. We keep what works and change
          only what earns its place.
        </p>
      </header>
      <div className="lf-four__list">
        {PILLARS.map((p, i) => (
          <Pillar key={p.name} pillar={p} flip={i % 2 === 1} index={i} />
        ))}
      </div>
    </section>
  );
}

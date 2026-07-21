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
    num: "01",
    name: "Web Design",
    line: "A fast, clear website built to bring in calls, bookings, and sales.",
    to: "/services/custom-local-websites/",
    cta: "See website work",
    Viz: SiteInFourteen,
  },
  {
    num: "02",
    name: "Tech Support",
    line: "When the register, Wi-Fi, or computer breaks, a real person fixes it.",
    to: "/services/it-support/",
    cta: "See how support works",
    Viz: WhoAnswers,
  },
  {
    num: "03",
    name: "Consulting",
    line: "We find what is wasting time or money, then tell you what to fix first.",
    to: "/services/tech-consulting/",
    cta: "Get the free read",
    Viz: TheFreeRead,
  },
  {
    num: "04",
    name: "Personalized Software",
    line: "We replace awkward monthly software with a tool built for your business.",
    to: "/services/business-systems/",
    cta: "See software you own",
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
        <span className="lf-four__num" aria-hidden="true">{pillar.num}</span>
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
          Your website and tech. <span className="lf-four__em">Handled.</span>
        </h2>
        <p className="lf-four__dek">
          Tell us what is not working. We will explain the fix in plain English,
          build it, and keep it working.
        </p>
      </header>
      <div className="lf-four__list">
        {PILLARS.map((p, i) => (
          <Pillar key={p.num} pillar={p} flip={i % 2 === 1} index={i} />
        ))}
      </div>
    </section>
  );
}

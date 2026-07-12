import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import "./TheFight.css";

/**
 * The Fight — the mission. Why "Little Fight" exists: the chains and roll-ups
 * brought a tech team; the corner store never got one. This section connects
 * the threat → the stakes → the answer, so a small owner understands what the
 * investment is actually fighting.
 */
const THEM = [
  "Whole Foods",
  "Great Clips",
  "Uber Eats",
  "DoorDash",
  "Private-equity buyers",
];

const YOU = [
  "The neighborhood law firm",
  "The corner bar",
  "The local clothing brand",
  "The hardware store",
  "The family clinic",
];

export default function TheFight() {
  const headRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const vsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="lf-fight" aria-labelledby="lf-fight-heading">
      <div className="lf-fight__inner">
        <div ref={headRef} className="lf-fight__head" data-reveal>
          <p className="lf-mono lf-fight__eyebrow">
            <span className="lf-fight__eyebrow-num">I.</span>
            <span className="lf-fight__eyebrow-divider" aria-hidden="true">·</span>
            The fight
          </p>
          <h2 id="lf-fight-heading" className="lf-display lf-fight__title">
            The chains brought a tech team.
            <br />
            <span className="lf-fight__title-em">The corner store never got one.</span>
          </h2>
          <p className="lf-fight__lede">
            Whole Foods, Great Clips, the delivery apps skimming a cut off every
            order — they didn&rsquo;t out-work your block. They out-<em>tooled</em> it.
            Closing that gap is the whole reason we&rsquo;re called Little Fight.
          </p>
        </div>

        <div ref={vsRef} className="lf-fight__vs" data-revealed="false">
          <div className="lf-fight__side lf-fight__side--them">
            <p className="lf-mono lf-fight__side-label">What they brought</p>
            <ul className="lf-fight__list">
              {THEM.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="lf-fight__side-note">
              National chains and investor-owned groups with full tech teams and big budgets.
            </p>
          </div>

          <div className="lf-fight__divider" aria-hidden="true">
            <span className="lf-fight__divider-word">vs</span>
          </div>

          <div className="lf-fight__side lf-fight__side--you">
            <p className="lf-mono lf-fight__side-label">Who we&rsquo;re in the corner for</p>
            <ul className="lf-fight__list">
              {YOU.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
            <p className="lf-fight__side-note">
              The places that make a block worth living on — now with a tech team of their own.
            </p>
          </div>
        </div>

        <div className="lf-fight__answer">
          <p>
            We build the systems the big guys have — for a fraction of what a big
            firm charges. Keep what works, kill the pen-and-paper and the endless
            spreadsheets, and fit the tech to how you already run. New York is our
            home and our attitude. But the fight travels. Anyone worth
            fighting for can call.
          </p>
          <Link to="/tech-audit/" viewTransition className="lf-fight__cta">
            Put us in your corner
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

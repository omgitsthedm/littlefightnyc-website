import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "./useScrollReveal";
import EditorialFigure from "./EditorialFigure";
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
  const vsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="lf-fight" aria-labelledby="lf-fight-heading">
      <div className="lf-fight__inner">
        <div className="lf-fight__intro">
          <div className="lf-fight__head">
            <p className="lf-mono lf-fight__eyebrow">
              The fight
            </p>
            <h2 id="lf-fight-heading" className="lf-display lf-fight__title">
              The chains brought a tech team.
              <br />
              <span className="lf-fight__title-em">The corner store never got one.</span>
            </h2>
            <p className="lf-fight__lede">
              Whole Foods, Great Clips, the delivery apps skimming a cut off every
              order didn't out-work your block. They out-<em>tooled</em> it.
              Closing that gap is the whole reason we&rsquo;re called Little Fight.
            </p>
          </div>

          <EditorialFigure
            className="lf-fight__figure"
            src="/assets/mainstreet-cafe-owner.webp"
            alt="A small-shop owner working the counter of his store"
            caption="The corner store never got the tech team. That's the whole fight."
            width={1600}
            height={1067}
          />
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
              The places that make a block worth living on, now with a tech team of their own.
            </p>
          </div>
        </div>

        <div className="lf-fight__answer">
          <p>
            We start where small businesses get the best return: a website that
            brings in calls, bookings, and trust. Then we stay useful when tech
            breaks or software bills pile up. No corporate stack. Just the right
            tool, owned by the business when we build it.
          </p>
          <Link to="/services/custom-local-websites/" viewTransition className="lf-fight__cta">
            See the website service
            <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

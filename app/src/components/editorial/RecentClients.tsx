import { Link } from "react-router-dom";
import { useScrollReveal } from "./useScrollReveal";
import "./RecentClients.css";

/**
 * Recent work band. Each name links to its case study detail page.
 * Kept explicit so the homepage can feature the strongest proof set.
 */
const FEATURED = [
  { slug: "deckspace", client: "DeckSpace" },
  { slug: "cc-films", client: "CC Films" },
  { slug: "hair-by-rachel-charles", client: "Hair By Rachel Charles" },
  { slug: "grand-funding-llc", client: "Grand Funding LLC" },
  { slug: "public-house-creative", client: "Public House Creative" },
] as const;

export default function RecentClients() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.3 });

  return (
    <section ref={ref} className="lf-clients" aria-label="Recent work">
      <div className="lf-clients__inner">
        <div className="lf-clients__head">
          <p className="lf-clients__label">Recent work</p>
          <Link to="/field-guide/#studies" className="lf-clients__all">
            All case studies <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="lf-clients__list">
          {FEATURED.map((study) => (
            <li key={study.slug} className="lf-clients__name">
              <Link to={`/case-studies/${study.slug}/`} className="lf-clients__link">
                {study.client}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { glossaryTerms } from "@/data/site";
import "./TermMap.css";

/**
 * TermMap — a compact node-graph band for the glossary hub. Six term nodes,
 * edges drawn from each term's authored `related[]` in site.ts (deduped,
 * undirected). Orange node dots, hairline edges that draw in on scroll.
 * Every node is a real link to its term page; the plain list below the band
 * remains the accessible long-form index. Reduced motion = final state.
 */

/* Presentational geometry only — where each node sits in the band (%).
 * business-system carries the most authored relations, so it anchors the
 * center. Data (nodes + edges) comes entirely from site.ts. */
const POS: Record<string, { x: number; y: number }> = {
  "business-system": { x: 50, y: 42 },
  crm: { x: 15, y: 14 },
  "workflow-automation": { x: 83, y: 14 },
  "software-stack": { x: 81, y: 78 },
  "local-search": { x: 16, y: 80 },
  "google-business-profile": { x: 45, y: 90 },
};

/* Undirected, deduped edges from the authored related[] lists. */
const EDGES: Array<[string, string]> = (() => {
  const slugs = new Set(glossaryTerms.map((t) => t.slug));
  const seen = new Set<string>();
  const edges: Array<[string, string]> = [];
  for (const term of glossaryTerms) {
    for (const rel of term.related) {
      if (!slugs.has(rel)) continue;
      const key = [term.slug, rel].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([term.slug, rel]);
    }
  }
  return edges;
})();

export default function TermMap() {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.25 });

  return (
    <nav ref={ref} className="lf-termmap" aria-label="How the glossary terms connect">
      <p className="lf-termmap__kicker">
        Term map <span className="lf-termmap__hint">· each line is a “related term” — tap to open</span>
      </p>
      <div className="lf-termmap__canvas">
        <svg
          className="lf-termmap__edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {EDGES.map(([a, b], i) =>
            POS[a] && POS[b] ? (
              <line
                key={`${a}|${b}`}
                className="lf-termmap__edge"
                x1={POS[a].x}
                y1={POS[a].y}
                x2={POS[b].x}
                y2={POS[b].y}
                vectorEffect="non-scaling-stroke"
                style={{ ["--lf-i" as string]: i }}
              />
            ) : null,
          )}
        </svg>
        {glossaryTerms.map((term, i) =>
          POS[term.slug] ? (
            <Link
              key={term.slug}
              to={`/glossary/${term.slug}/`}
              className="lf-termmap__node"
              data-hub={term.slug === "business-system" || undefined}
              style={{
                left: `${POS[term.slug].x}%`,
                top: `${POS[term.slug].y}%`,
                ["--lf-i" as string]: i,
              }}
            >
              <span className="lf-termmap__dot" aria-hidden="true" />
              {term.term}
            </Link>
          ) : null,
        )}
      </div>
    </nav>
  );
}

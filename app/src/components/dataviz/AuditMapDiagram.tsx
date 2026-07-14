import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { AUDIT_MAP_PATHS as PATHS, GENERIC_AUDIT_PATH as GENERIC_PATH } from "@/data/auditMapPaths";
import "./AuditMapDiagram.css";

/**
 * AuditMapDiagram — the "Audit map" section on industry pages, rebuilt as a real
 * customer-path diagram: the industry page's own authored customer path drawn
 * as a subway-style line with orange station nodes and mono labels. The rail
 * draws in on scroll (stroke-dashoffset); stations stagger up; reduced motion
 * renders the final composed state. Horizontal on desktop, vertical on phones.
 *
 * Every station label quotes the industry's OWN page copy in industries.json —
 * the authored source is cited above each entry. Nothing is invented.
 */


type AuditLink = { href: string; label: string };
type Pt = { x: number; y: number };

type Props = {
  slug: string;
  heading: string;
  /** Inner HTML of the section's authored paragraphs, in order. */
  paragraphs: string[];
  links: AuditLink[];
};

export default function AuditMapDiagram({ slug, heading, paragraphs, links }: Props) {
  const ref = useScrollReveal<HTMLElement>({ threshold: 0.15 });
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pts, setPts] = useState<Pt[]>([]);
  const stations = PATHS[slug] ?? GENERIC_PATH;

  useLayoutEffect(() => {
    const el = mapRef.current;
    if (!el || typeof window === "undefined") return;

    const compute = () => {
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const next = Array.from(el.querySelectorAll<HTMLElement>("[data-fm-dot]")).map((d) => {
        const r = d.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      setSize({ w: box.width, h: box.height });
      setPts(next);
    };

    compute();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [stations.length]);

  const rail =
    pts.length > 1 ? "M " + pts.map((p) => `${p.x} ${p.y}`).join(" L ") : "";

  return (
    <section ref={ref} className="lf-auditmap" aria-labelledby="lf-auditmap-heading">
      <p className="lf-auditmap__kicker">Audit map</p>
      <h2
        id="lf-auditmap-heading"
        className="lf-auditmap__heading"
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      <div className="lf-auditmap__prose">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      <div ref={mapRef} className="lf-auditmap__map">
        <svg
          className="lf-auditmap__rail"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          aria-hidden="true"
          focusable="false"
        >
          {rail && <path className="lf-auditmap__rail-path" d={rail} pathLength={1} />}
        </svg>
        <ol className="lf-auditmap__stations">
          {stations.map((station, i) => (
            <li
              key={station}
              className="lf-auditmap__station"
              style={{ ["--lf-i" as string]: i }}
            >
              <span className="lf-auditmap__dot" data-fm-dot aria-hidden="true" />
              <span className="lf-auditmap__label">{station}</span>
            </li>
          ))}
        </ol>
      </div>

      {links.length > 0 && (
        <ul className="lf-auditmap__links">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link to={link.href} className="lf-auditmap__link">
                {link.label}
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

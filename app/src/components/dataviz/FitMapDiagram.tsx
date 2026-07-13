import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./FitMapDiagram.css";

/**
 * FitMapDiagram — the "Fit map" section on industry pages, rebuilt as a real
 * customer-path diagram: the industry page's own authored customer path drawn
 * as a subway-style line with orange station nodes and mono labels. The rail
 * draws in on scroll (stroke-dashoffset); stations stagger up; reduced motion
 * renders the final composed state. Horizontal on desktop, vertical on phones.
 *
 * Every station label quotes the industry's OWN page copy in industries.json —
 * the authored source is cited above each entry. Nothing is invented.
 */

const PATHS: Record<string, string[]> = {
  // "trace one real customer path: search, menu, booking or order, payment,
  //  reminder, review, and follow-up" — restaurants-bars fit-map copy.
  "restaurants-bars": ["Search", "Menu", "Book / order", "Payment", "Reminder", "Review", "Follow-up"],
  // "Trust-forward service pages", "Booking and intake that reduce phone tag",
  // "appointment interest, intake, reminders, staff handoffs, and follow-up
  //  with care" — medical-wellness-practices page copy.
  "medical-wellness-practices": ["Trust pages", "Booking", "Intake", "Reminder", "Staff handoff", "Follow-up"],
  // "Portfolio pages, inquiry types, visit requests, proposals, event
  //  interest, and collector or client follow-up" — galleries fit-map copy.
  "galleries-creative-studios": ["Portfolio", "Inquiry", "Visit request", "Proposal", "Follow-up"],
  // "the service page to intake to consultation to proposal path" +
  // "proposals, follow-up, and reporting" — professional-services page copy.
  "professional-services": ["Service page", "Intake", "Consultation", "Proposal", "Reporting"],
  // "Product data, pickup options, POS inventory, email capture, return
  //  questions, and reporting" — retail-ecommerce fit-map copy.
  "retail-ecommerce": ["Product pages", "Pickup / shipping", "POS inventory", "Email capture", "Reporting"],
  // "discovery, services, staff calendars, deposits, reminders, reviews, and
  //  rebooking" — salons-wellness fit-map copy.
  "salons-wellness": ["Discovery", "Services", "Booking", "Deposit", "Reminder", "Review", "Rebooking"],
};

/* The shared read every industry page ends on: search → visit → book or buy →
 * return. Used only if a future industry ships without an authored path. */
const GENERIC_PATH = ["Search", "Visit", "Book or buy", "Return"];

type FitLink = { href: string; label: string };
type Pt = { x: number; y: number };

type Props = {
  slug: string;
  heading: string;
  /** Inner HTML of the section's authored paragraphs, in order. */
  paragraphs: string[];
  links: FitLink[];
};

export default function FitMapDiagram({ slug, heading, paragraphs, links }: Props) {
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
    <section ref={ref} className="lf-fitmap" aria-labelledby="lf-fitmap-heading">
      <p className="lf-fitmap__kicker">Fit map</p>
      <h2
        id="lf-fitmap-heading"
        className="lf-fitmap__heading"
        dangerouslySetInnerHTML={{ __html: heading }}
      />
      <div className="lf-fitmap__prose">
        {paragraphs.map((p, i) => (
          <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
        ))}
      </div>

      <div ref={mapRef} className="lf-fitmap__map">
        <svg
          className="lf-fitmap__rail"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          aria-hidden="true"
          focusable="false"
        >
          {rail && <path className="lf-fitmap__rail-path" d={rail} pathLength={1} />}
        </svg>
        <ol className="lf-fitmap__stations">
          {stations.map((station, i) => (
            <li
              key={station}
              className="lf-fitmap__station"
              style={{ ["--lf-i" as string]: i }}
            >
              <span className="lf-fitmap__dot" data-fm-dot aria-hidden="true" />
              <span className="lf-fitmap__label">{station}</span>
            </li>
          ))}
        </ol>
      </div>

      {links.length > 0 && (
        <ul className="lf-fitmap__links">
          {links.map((link) => (
            <li key={link.href + link.label}>
              <Link to={link.href} className="lf-fitmap__link">
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

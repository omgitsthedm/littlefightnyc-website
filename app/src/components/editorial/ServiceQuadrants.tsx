import { ArrowRight, Phone } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import ServiceDiagram from "@/components/dataviz/ServiceDiagram";
import { PHONE_DISPLAY, PHONE_HREF } from "@/data/contact";
import "./ServiceQuadrants.css";

/**
 * The four services, each explained by a picture instead of a paragraph.
 *
 * Four quadrants sit on screen at once, so the whole offer is visible before
 * anything moves. Choosing one opens a panel built in three parts, top to
 * bottom: the OUTCOME as a single figure, the drawn instrument that proves it,
 * and the plain sentence a customer would actually say.
 *
 * Two rules the copy here obeys, both from the owner:
 *
 * 1. Lead with the solved state, never the problem. "Back to work in 24 hours",
 *    not "when your register dies". The reader is already living the problem.
 * 2. No delivery-time or trade language. The written 14-day launch promise is
 *    real and it stays on the service page where a buyer is reading terms; it
 *    is not what a shop owner is shopping for, so it is not the headline here.
 *
 * Every figure traces to the service's own copy in src/data/site.ts — the
 * 24-hour on-site window, the one owned place, the free first read. Nothing is
 * invented for the sake of a big number, and no count is drawn that the data
 * does not support.
 */

type Quadrant = {
  key: string;
  /** The service slug — also selects the drawn instrument. */
  slug: string;
  tab: string;
  chip: string;
  /** Which signal colour the chip dot carries. */
  tone: "live" | "urgent" | "own" | "free";
  kicker: string;
  figure: string;
  unit?: string;
  sub: string;
  headline: string;
  proof: string;
  action: { label: string; to: string } | { label: string; href: string; event: string };
  more: { label: string; to: string };
};

const QUADRANTS: readonly Quadrant[] = [
  {
    key: "websites",
    slug: "custom-local-websites",
    tab: "Websites",
    chip: "Open now",
    tone: "live",
    kicker: "Your front door is",
    figure: "24/7",
    unit: "open",
    sub: "Even at 2am. Even on a Sunday.",
    // A capability, not a promise. Saying customers WILL come is promising
    // traffic, which the copy contract forbids and which nobody can honour.
    // What is true: they can find you and finish without waiting for you.
    headline: "Customers can find you, and book without calling.",
    proof: "Hair By Rachel Charles — live today",
    action: { label: "How we build websites", to: "/services/custom-local-websites/" },
    more: { label: "How it went for Rachel", to: "/case-studies/hair-by-rachel-charles/" },
  },
  {
    key: "support",
    slug: "it-support",
    tab: "On-site tech support",
    chip: "Picking up",
    tone: "urgent",
    // Every approved version of this figure in the repo is hedged — "usually",
    // "we can be". An unhedged "back to work in 24 hours" is a repair guarantee
    // nobody wrote, so the hedge and the conditions ride with the number.
    kicker: "Urgent jobs, usually within",
    figure: "24",
    unit: "hours",
    sub: "On site in New York. A person answers 9am–9pm Eastern.",
    // "It works again" is an unconditional guarantee. The house form states the
    // boundary instead, and the boundary is the reassuring part.
    headline: "You call. We come. We fix it, or tell you who can.",
    proof: "No jargon, and no ticket number.",
    action: { label: `Call ${PHONE_DISPLAY}`, href: PHONE_HREF, event: "home_quadrant_phone" },
    more: { label: "How support works", to: "/services/it-support/" },
  },
  {
    key: "software",
    slug: "business-systems",
    tab: "Software you own",
    chip: "Yours",
    tone: "own",
    kicker: "Everything lives in",
    figure: "1",
    unit: "place",
    sub: "Built around how you already work.",
    headline: "Your clients, your files, your jobs — in one place.",
    proof: "You own it. The data and the accounts stay yours.",
    action: { label: "Software you own", to: "/services/business-systems/" },
    more: { label: "How it went for ClearHelp", to: "/case-studies/clearhelp/" },
  },
  {
    key: "consult",
    slug: "tech-consulting",
    tab: "Free second opinion",
    chip: "No charge",
    tone: "free",
    kicker: "The first read costs",
    figure: "Nothing",
    sub: "Whether you hire us or not.",
    headline: "You leave knowing what to fix first.",
    proof: "One call. A short list. No pitch.",
    action: { label: "What the free read covers", to: "/services/tech-consulting/" },
    more: { label: "See all services", to: "/services/" },
  },
] as const;

export default function ServiceQuadrants() {
  const [activeKey, setActiveKey] = useState(QUADRANTS[0].key);
  // The first panel paints complete. Only a real switch animates, so nothing
  // on the page ever arrives at partial opacity (which also kept the contrast
  // checker from sampling a mid-fade frame).
  const [switched, setSwitched] = useState(false);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = QUADRANTS.find((q) => q.key === activeKey) ?? QUADRANTS[0];

  const choose = (key: string) => {
    if (key === activeKey) return;
    setSwitched(true);
    setActiveKey(key);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % QUADRANTS.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + QUADRANTS.length) % QUADRANTS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = QUADRANTS.length - 1;
    else return;
    event.preventDefault();
    choose(QUADRANTS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      className="lf-quad"
      aria-labelledby="lf-quad-title"
      data-lf-quadrant={active.key}
    >
      <div className="lf-quad__inner">
        <header className="lf-quad__head">
          <p className="lf-quad__eyebrow">LF / 03 · What we do</p>
          <h2 id="lf-quad-title" className="lf-quad__title">
            Four ways to
            <br />
            <span>get unstuck.</span>
          </h2>
          <p className="lf-quad__dek">
            Pick the one you are in, or just call. One number answers for all four.
          </p>
        </header>

        <div className="lf-quad__grid" role="tablist" aria-label="What we do">
          {QUADRANTS.map((quadrant, index) => {
            const selected = quadrant.key === activeKey;
            return (
              <button
                key={quadrant.key}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${quadrant.key}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={`lf-quad__cell${selected ? " lf-quad__cell--selected" : ""}`}
                onClick={() => choose(quadrant.key)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                data-lf-label={`home_quadrant_${quadrant.key}`}
              >
                <span className="lf-quad__cell-num" aria-hidden="true">
                  0{index + 1}
                </span>
                <span className="lf-quad__cell-label">{quadrant.tab}</span>
              </button>
            );
          })}
        </div>

        <div
          key={active.key}
          className={`lf-quad__panel lf-quad__panel--${active.tone}${switched ? " lf-quad__panel--enter" : ""}`}
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active.key}`}
          tabIndex={0}
        >
          <div className="lf-quad__stage">
            <div className="lf-quad__figure">
              <p className="lf-quad__kicker">{active.kicker}</p>
              <p className="lf-quad__number">
                <span className={`lf-quad__value${active.unit ? "" : " lf-quad__value--word"}`}>
                  {active.figure}
                </span>
                {active.unit ? <span className="lf-quad__unit">{active.unit}</span> : null}
              </p>
              <p className="lf-quad__sub">{active.sub}</p>
            </div>

            <p className="lf-quad__chip">
              <span aria-hidden="true" />
              {active.chip}
            </p>

            <div className="lf-quad__object">
              <ServiceDiagram slug={active.slug} surface="home" />
            </div>

            <div className="lf-quad__say">
              <p className="lf-quad__headline">{active.headline}</p>
              <p className="lf-quad__proof">{active.proof}</p>
            </div>
          </div>

          <div className="lf-quad__actions">
            {"href" in active.action ? (
              <a
                className="lf-quad__action"
                href={active.action.href}
                data-lf-label={active.action.event}
              >
                <Phone size={18} strokeWidth={2} aria-hidden="true" />
                {active.action.label}
              </a>
            ) : (
              <Link className="lf-quad__action" to={active.action.to}>
                {active.action.label}
                <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
              </Link>
            )}
            <Link className="lf-quad__more" to={active.more.to}>
              {active.more.label}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* The three-rung ladder that used to sit here listed the same services
            as the four cells directly above it, and cost a screen and a half of
            scroll on a 320px phone to say it twice. The sequencing is the only
            part the cells do not carry, so that is all that is left. */}
        <p className="lf-quad__order">
          Most owners start with the website, keep us for support, and only build
          software when renting stops making sense. Not sure? The{" "}
          <Link to="/services/tech-consulting/">free second opinion</Link> comes before
          any paid work.
        </p>
      </div>
    </section>
  );
}

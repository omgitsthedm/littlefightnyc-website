import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./TheAssembly.css";

/**
 * TheAssembly — the homepage signature cinematic.
 *
 * The chaos every owner lives in (broken POS, dead contact form, wrong hours,
 * spreadsheet sprawl) opens physically scattered across a pinned stage; as you
 * scroll, the mess assembles itself into one clean running system and ends on
 * "Put us in your corner." The brand thesis, animated.
 *
 * Mechanics: a ~260vh runway (160vh on phones) holds a sticky 100svh stage.
 * One passive scroll listener + rAF throttle writes progress 0→1 as `--p` on
 * the stage; ALL motion derives from --p in CSS (transform/opacity/filter
 * only), so scrubbing backward reverses perfectly. CSS default is --p: 1, so
 * without JS the composed final frame renders — never the chaos.
 *
 * Accessibility: the animated stage is aria-hidden; a visually-hidden heading
 * + paragraph narrate the same story, and the CTA is a real link that stays
 * focusable at every scroll position. Under prefers-reduced-motion there is
 * no runway/pin/scrub — one static composed frame at normal section height.
 */

type CardDef = {
  id: string;
  label: string;
  verdict: "Keep" | "Connect" | "Replace" | "Fix";
  /** Start of this card's assembly segment on the 0→1 progress track. */
  seg: number;
  /** Connector path, desktop orbit coords (1000×640 space, hub at 500,320). */
  wire: string;
  /** Connector path, phone orbit coords. Absent = card hidden under 640px. */
  wireM?: string;
};

const CARDS: CardDef[] = [
  { id: "pos", label: "Broken POS", verdict: "Fix", seg: 0.25, wire: "M140 170 L500 320", wireM: "M500 125 L500 320" },
  { id: "form", label: "Contact form goes nowhere", verdict: "Connect", seg: 0.285, wire: "M860 170 L500 320", wireM: "M400 225 L500 320" },
  { id: "hours", label: "Google shows the wrong hours", verdict: "Fix", seg: 0.32, wire: "M70 380 L500 320", wireM: "M600 225 L500 320" },
  { id: "sheets", label: "Three spreadsheets, one truth", verdict: "Replace", seg: 0.355, wire: "M930 380 L500 320", wireM: "M400 470 L500 320" },
  { id: "dms", label: "DMs piling up", verdict: "Connect", seg: 0.39, wire: "M250 550 L500 320", wireM: "M600 470 L500 320" },
  { id: "spam", label: "Email lands in spam", verdict: "Fix", seg: 0.425, wire: "M750 550 L500 320" },
];

export default function TheAssembly() {
  const runwayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const runway = runwayRef.current;
    const stage = stageRef.current;
    if (!runway || !stage || typeof window === "undefined") return;

    // Reduced motion: no pin, no scrub — CSS renders the static final frame.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = "";

    const update = () => {
      raf = 0;
      const rect = runway.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      const value = p.toFixed(3);
      if (value !== last) {
        last = value;
        stage.style.setProperty("--p", value);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Pause the Act-1 idle drift (and the hub's breathing glow) off-screen.
    const io = new IntersectionObserver(([entry]) => {
      stage.classList.toggle("lf-as-live", entry.isIntersecting);
    });
    io.observe(stage);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  return (
    <section className="lf-assembly" aria-labelledby="lf-assembly-heading">
      <h2 id="lf-assembly-heading" className="lf-assembly__vh">
        The mess becomes one system
      </h2>
      <p className="lf-assembly__vh">
        A normal Tuesday for a small shop: the register app is down, the
        contact form goes nowhere, Google shows the wrong hours, three
        spreadsheets tell three different stories, DMs pile up, and email lands
        in spam. We take that mess and pull it into one clean system. We keep
        what works, connect what matters, replace what drags, and build what
        fits. You keep the shop. We keep it running.
      </p>

      <div ref={runwayRef} className="lf-assembly__runway">
        <div ref={stageRef} className="lf-assembly__stage">
          <div className="lf-assembly__head" aria-hidden="true">
            <p className="lf-mono lf-assembly__overline">A normal Tuesday</p>
            <div className="lf-assembly__titles">
              <p className="lf-display lf-assembly__title lf-assembly__title--chaos">
                Sound familiar?
              </p>
              <p className="lf-display lf-assembly__title lf-assembly__title--fix">
                We take the mess.
              </p>
            </div>
          </div>

          <div className="lf-assembly__canvas" aria-hidden="true">
            <svg
              className="lf-assembly__wires"
              viewBox="0 0 1000 640"
              focusable="false"
            >
              <g className="lf-assembly__wireset lf-assembly__wireset--desktop">
                {CARDS.map((c) => (
                  <path
                    key={c.id}
                    className="lf-assembly__wire"
                    d={c.wire}
                    pathLength={1}
                    vectorEffect="non-scaling-stroke"
                    style={{ ["--seg-start" as string]: c.seg }}
                  />
                ))}
              </g>
              <g className="lf-assembly__wireset lf-assembly__wireset--mobile">
                {CARDS.filter((c) => c.wireM).map((c) => (
                  <path
                    key={c.id}
                    className="lf-assembly__wire"
                    d={c.wireM}
                    pathLength={1}
                    vectorEffect="non-scaling-stroke"
                    style={{ ["--seg-start" as string]: c.seg }}
                  />
                ))}
              </g>
            </svg>

            {CARDS.map((c) => (
              <div
                key={c.id}
                className={`lf-assembly__card lf-assembly__card--${c.id}`}
                style={{ ["--seg-start" as string]: c.seg }}
              >
                <div className="lf-assembly__card-inner">
                  <span className="lf-assembly__card-label">{c.label}</span>
                  <span className="lf-assembly__chip" data-verdict={c.verdict}>
                    {c.verdict}
                  </span>
                </div>
              </div>
            ))}

            <div className="lf-assembly__hub">
              <span className="lf-assembly__hub-label">One system</span>
              <span className="lf-assembly__chip lf-assembly__chip--build">
                Build
              </span>
            </div>
          </div>

          <p className="lf-assembly__sub" aria-hidden="true">
            You keep the shop. We keep it running.
          </p>

          <div className="lf-assembly__cta-row">
            <Link to="/tech-audit/" viewTransition className="lf-assembly__cta">
              Get a free second opinion
              <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

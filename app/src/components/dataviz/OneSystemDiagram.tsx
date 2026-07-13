import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CalendarCheck, CreditCard, Mail, MapPin, Table2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { proofSignals } from "@/data/site";
import "./OneSystemDiagram.css";

/**
 * OneSystemDiagram — the "One System" moment on the home OS card.
 * Five scattered, muted tool nodes joined by a faint tangle of lines resolve
 * into clean orange connectors feeding a single hub node. Each tool wears its
 * Keep / Connect / Replace verdict chip (labels from proofSignals); the hub
 * wears Build. Draws in on scroll; reduced motion renders the final state.
 * After the draw-in, small orange packets travel each connector into the hub
 * on a slow loop (CSS offset-path; paused off-viewport; none under
 * prefers-reduced-motion — the composed final state stands on its own).
 */

const VERDICT = Object.fromEntries(proofSignals.map((s) => [s.label, s.label])) as Record<
  string,
  string
>;

type Tool = {
  id: string;
  label: string;
  verdict: string;
  icon: LucideIcon;
  x: number;
  y: number;
  side?: "right";
};

// Scattered positions, % of the canvas (x from the anchored side).
const TOOLS: Tool[] = [
  { id: "booking", label: "Booking app", verdict: VERDICT.Keep, icon: CalendarCheck, x: 3, y: 6 },
  { id: "pos", label: "POS", verdict: VERDICT.Connect, icon: CreditCard, x: 6, y: 2, side: "right" },
  { id: "sheet", label: "Spreadsheet", verdict: VERDICT.Replace, icon: Table2, x: 0, y: 58 },
  { id: "google", label: "Google profile", verdict: VERDICT.Keep, icon: MapPin, x: 0, y: 60, side: "right" },
  { id: "inbox", label: "Inbox", verdict: VERDICT.Connect, icon: Mail, x: 28, y: 84 },
];

type Pt = { x: number; y: number };

export default function OneSystemDiagram() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.35 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [centers, setCenters] = useState<Record<string, Pt>>({});

  // Pause the packet loop whenever the diagram is off-viewport (the packets
  // only run while `data-inview="true"` — see OneSystemDiagram.css).
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-inview", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          el.setAttribute("data-inview", entry.isIntersecting ? "true" : "false");
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof window === "undefined") return;

    const compute = () => {
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const next: Record<string, Pt> = {};
      el.querySelectorAll<HTMLElement>("[data-os-node]").forEach((n) => {
        const r = n.getBoundingClientRect();
        next[n.dataset.osNode as string] = {
          x: r.left - box.left + r.width / 2,
          y: r.top - box.top + r.height / 2,
        };
      });
      setSize({ w: box.width, h: box.height });
      setCenters(next);
    };

    compute();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hub = centers.hub;

  return (
    <div
      ref={ref}
      className="lf-onesys"
      role="img"
      aria-label="Diagram: five scattered tools — booking app, POS, spreadsheet, Google profile, inbox — each marked keep, connect, or replace, resolving into one system we build."
    >
      <div ref={canvasRef} className="lf-onesys__canvas" aria-hidden="true">
        <svg
          className="lf-onesys__wires"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          focusable="false"
        >
          {hub &&
            TOOLS.map(
              (t, i) =>
                centers[t.id] && (
                  <path
                    key={`s-${t.id}`}
                    className="lf-onesys__spoke"
                    d={`M ${centers[t.id].x} ${centers[t.id].y} L ${hub.x} ${hub.y}`}
                    pathLength={1}
                    style={{ ["--lf-i" as string]: i }}
                  />
                ),
            )}
        </svg>

        {/* Living packets — one per spoke, travelling tool → hub. */}
        {hub &&
          TOOLS.map(
            (t, i) =>
              centers[t.id] && (
                <span
                  key={`p-${t.id}`}
                  className="lf-onesys__packet"
                  style={{
                    offsetPath: `path("M ${centers[t.id].x} ${centers[t.id].y} L ${hub.x} ${hub.y}")`,
                    ["--lf-i" as string]: i,
                  }}
                />
              ),
          )}

        {TOOLS.map((t, i) => (
          <div
            key={t.id}
            className="lf-onesys__node"
            data-os-node={t.id}
            style={{
              [t.side === "right" ? "right" : "left"]: `${t.x}%`,
              top: `${t.y}%`,
              ["--lf-i" as string]: i,
            }}
          >
            <span className="lf-onesys__node-label">
              <t.icon size={12} strokeWidth={1.75} aria-hidden="true" />
              {t.label}
            </span>
            <span className="lf-onesys__chip" data-verdict={t.verdict}>
              {t.verdict}
            </span>
          </div>
        ))}

        <div className="lf-onesys__hub" data-os-node="hub">
          <span className="lf-onesys__hub-label">One system</span>
          <span className="lf-onesys__chip lf-onesys__chip--build">{VERDICT.Build}</span>
        </div>
      </div>
      <p className="lf-onesys__legend">Keep · Connect · Replace · Build</p>
    </div>
  );
}

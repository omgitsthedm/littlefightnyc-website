import { useLayoutEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import { proofSignals } from "@/data/site";
import "./OneSystemDiagram.css";

/**
 * OneSystemDiagram — the "One System" moment on the home OS card.
 * Five scattered, muted tool nodes joined by a faint tangle of lines resolve
 * into clean orange connectors feeding a single hub node. Each tool wears its
 * Keep / Connect / Replace verdict chip (labels from proofSignals); the hub
 * wears Build. Draws in on scroll; reduced motion renders the final state.
 */

const VERDICT = Object.fromEntries(proofSignals.map((s) => [s.label, s.label])) as Record<
  string,
  string
>;

type Tool = {
  id: string;
  label: string;
  verdict: string;
  x: number;
  y: number;
  side?: "right";
};

// Scattered positions, % of the canvas (x from the anchored side).
const TOOLS: Tool[] = [
  { id: "booking", label: "Booking app", verdict: VERDICT.Keep, x: 3, y: 6 },
  { id: "pos", label: "POS", verdict: VERDICT.Connect, x: 6, y: 2, side: "right" },
  { id: "sheet", label: "Spreadsheet", verdict: VERDICT.Replace, x: 0, y: 58 },
  { id: "google", label: "Google profile", verdict: VERDICT.Keep, x: 0, y: 60, side: "right" },
  { id: "inbox", label: "Inbox", verdict: VERDICT.Connect, x: 28, y: 84 },
];

// The before-state tangle — pairs of tools talking past each other.
const TANGLE: Array<[string, string]> = [
  ["booking", "sheet"],
  ["booking", "pos"],
  ["pos", "google"],
  ["sheet", "inbox"],
  ["google", "inbox"],
  ["booking", "google"],
];

type Pt = { x: number; y: number };

export default function OneSystemDiagram() {
  const ref = useScrollReveal<HTMLDivElement>({ threshold: 0.35 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [centers, setCenters] = useState<Record<string, Pt>>({});

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

  const tangleD = (a: Pt, b: Pt, i: number) => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (i % 2 === 0 ? 1 : -1) * Math.min(34, len * 0.22);
    return `M ${a.x} ${a.y} Q ${mx + (-dy / len) * bend} ${my + (dx / len) * bend}, ${b.x} ${b.y}`;
  };

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
            TANGLE.map(([a, b], i) =>
              centers[a] && centers[b] ? (
                <path
                  key={`t-${i}`}
                  className="lf-onesys__tangle"
                  d={tangleD(centers[a], centers[b], i)}
                  pathLength={1}
                  style={{ ["--lf-i" as string]: i }}
                />
              ) : null,
            )}
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
            <span className="lf-onesys__node-label">{t.label}</span>
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

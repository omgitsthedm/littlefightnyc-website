import { useLayoutEffect, useRef, useState } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./FlowDiagram.css";

/**
 * FlowDiagram — labeled nodes joined by connector lines that draw in on
 * scroll. Nodes are real HTML (crisp text at any width, columns stack on
 * mobile); connectors are a measured inline-SVG overlay recomputed on
 * resize. Muted "before" nodes vs the orange signal path. Zero dependencies.
 * Reduced motion: everything resolves to the final state instantly.
 */

export type FlowNode = {
  id: string;
  label: string;
  sub?: string;
  chips?: string[];
  tone?: "muted" | "signal" | "hub" | "default";
  col: number;
};

export type FlowEdge = {
  from: string;
  to: string;
  tone?: "muted" | "signal";
  chip?: string;
  pulse?: boolean;
};

type Rect = { x: number; y: number; w: number; h: number };
type Drawn = {
  d: string;
  tone: "muted" | "signal";
  pulse?: boolean;
  chip?: string;
  mx: number;
  my: number;
  horizontal: boolean;
};

function anchorPath(
  a: Rect,
  b: Rect,
): { d: string; mx: number; my: number; horizontal: boolean } {
  // Horizontal when the dominant gap is to the right; otherwise the layout
  // has stacked (mobile) and we connect bottom → top.
  const dx = b.x - (a.x + a.w);
  const dy = b.y - (a.y + a.h);
  if (dx >= dy) {
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    const c = (x2 - x1) / 2;
    return {
      d: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
      mx: (x1 + x2) / 2,
      my: (y1 + y2) / 2,
      horizontal: true,
    };
  }
  const x1 = a.x + a.w / 2;
  const y1 = a.y + a.h;
  const x2 = b.x + b.w / 2;
  const y2 = b.y;
  const c = (y2 - y1) / 2;
  return {
    d: `M ${x1} ${y1} C ${x1} ${y1 + c}, ${x2} ${y2 - c}, ${x2} ${y2}`,
    mx: (x1 + x2) / 2,
    my: (y1 + y2) / 2,
    horizontal: false,
  };
}

export default function FlowDiagram({
  label,
  summary,
  caption,
  nodes,
  edges,
  className,
}: {
  /** Short accessible name for the figure. */
  label: string;
  /** Full text equivalent of the diagram — visually hidden, same facts. */
  summary: string;
  caption?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  className?: string;
}) {
  const revealRef = useScrollReveal<HTMLElement>({ threshold: 0.25 });
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState<Drawn[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const colCount = nodes.reduce((m, n) => Math.max(m, n.col + 1), 0);
  const cols: FlowNode[][] = Array.from({ length: colCount }, (_, c) =>
    nodes.filter((n) => n.col === c),
  );

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el || typeof window === "undefined") return;

    const compute = () => {
      const box = el.getBoundingClientRect();
      if (box.width === 0) return;
      const pos: Record<string, Rect> = {};
      el.querySelectorAll<HTMLElement>("[data-flow-node]").forEach((n) => {
        const r = n.getBoundingClientRect();
        pos[n.dataset.flowNode as string] = {
          x: r.left - box.left,
          y: r.top - box.top,
          w: r.width,
          h: r.height,
        };
      });
      setSize({ w: box.width, h: box.height });
      setDrawn(
        edges
          .filter((e) => pos[e.from] && pos[e.to])
          .map((e) => {
            const { d, mx, my, horizontal } = anchorPath(pos[e.from], pos[e.to]);
            return {
              d,
              mx,
              my,
              horizontal,
              tone: e.tone ?? "signal",
              pulse: e.pulse,
              chip: e.chip,
            };
          }),
      );
    };

    compute();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(nodes.map((n) => n.id)), JSON.stringify(edges)]);

  return (
    <figure
      ref={revealRef}
      className={`lf-flow${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      <p className="lf-viz-sr">{summary}</p>
      <div ref={gridRef} className="lf-flow__grid" aria-hidden="true">
        <svg
          className="lf-flow__wires"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          focusable="false"
        >
          {drawn.map((e, i) => (
            <g key={i}>
              <path
                className="lf-flow__wire"
                data-tone={e.tone}
                d={e.d}
                pathLength={1}
                style={{ ["--lf-i" as string]: i }}
              />
              {e.pulse && (
                <circle className="lf-flow__pulse" r="3">
                  <animateMotion dur="2.6s" repeatCount="indefinite" path={e.d} />
                </circle>
              )}
            </g>
          ))}
        </svg>
        {drawn.map(
          (e, i) =>
            e.chip && (
              <span
                key={`chip-${i}`}
                className="lf-flow__edge-chip"
                style={{ left: e.mx, top: e.horizontal ? e.my - 34 : e.my }}
              >
                {e.chip}
              </span>
            ),
        )}
        {cols.map((col, c) => (
          <div key={c} className="lf-flow__col">
            {col.map((n, r) => (
              <div
                key={n.id}
                className="lf-flow__node"
                data-flow-node={n.id}
                data-tone={n.tone ?? "default"}
                style={{ ["--lf-i" as string]: c * 2 + r }}
              >
                <span className="lf-flow__node-label">{n.label}</span>
                {n.sub && <span className="lf-flow__node-sub">{n.sub}</span>}
                {n.chips && n.chips.length > 0 && (
                  <span className="lf-flow__node-chips">
                    {n.chips.map((chip) => (
                      <span key={chip} className="lf-flow__node-chip">
                        {chip}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      {caption && <figcaption className="lf-flow__caption">{caption}</figcaption>}
    </figure>
  );
}

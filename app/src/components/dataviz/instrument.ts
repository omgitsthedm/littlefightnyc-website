import { useEffect, useRef, type RefObject } from "react";
import { useScrollReveal } from "@/components/editorial/useScrollReveal";
import "./instrument.css";

/**
 * instrument — the shared canvas-instrument harness (Small Craft doctrine).
 *
 * Every instrument (MoneyLeaving, AuditBench,
 * LeadsCaught, WhoAnswers, SiteInFourteen, TheFreeRead) is a 2D-canvas story
 * with the same physical contract:
 *
 * - DPR-scaled canvas sized to its wrapper (ResizeObserver)
 * - IntersectionObserver pause off-viewport; the story REPLAYS FROM THE TOP on
 *   re-entry (renderer.reset)
 * - prefers-reduced-motion → a single settled end-state frame, no rAF at all
 *   (re-drawn on resize and once fonts land, since ctx text measures shift)
 * - a settled first paint before the rAF starts, so there is never an empty box
 * - all DOM/canvas work inside useEffect — module scope stays pure (SSR-safe)
 *
 * Only the story differs per instrument, so only the story lives per file:
 * pass a `create(cx)` that builds sprites/sim in closure and returns the three
 * renderer verbs. Everything else — the part that was previously copy-pasted
 * across seven files — lives here once.
 *
 * Font gotcha (the reason DISP/MONO exist): canvas `ctx.font` CANNOT parse CSS
 * `var()` — it silently falls back to 10px. Use these literal stacks.
 * Oswald Variable tops out at weight 700; JetBrains Mono is loaded at 500.
 */

export const DISP = '"Oswald Variable", "Oswald", "Barlow", system-ui, sans-serif';
export const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

/* Signal colors, mirroring the tokens (--lf-fight / --lf-error / --lf-success).
 * Literal because canvas fillStyle can't read CSS custom properties. */
export const ORANGE = "#F97316";
export const RED = "#F87171";
export const GREEN = "#4ADE80";

/** Rounded-rect path (does not fill/stroke — caller does). */
export function rr(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Cached additive-glow sprite (draw with globalCompositeOperation="lighter").
 * `col` must be an rgba(...,1) string — the .5 stop is derived from it.
 * Client-side only (creates a canvas) — call inside the renderer closure. */
export function glow(col: string, sz: number): HTMLCanvasElement {
  const s = document.createElement("canvas");
  s.width = s.height = sz;
  const g = s.getContext("2d")!;
  const rad = g.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  rad.addColorStop(0, col);
  rad.addColorStop(0.4, col.replace("1)", ".5)"));
  rad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rad;
  g.beginPath();
  g.arc(sz / 2, sz / 2, sz / 2, 0, 7);
  g.fill();
  return s;
}

export type InstrumentRenderer = {
  /** Restart the story from the top — called on every viewport (re)entry. */
  reset: (now: number) => void;
  /** One animation frame: advance the sim and draw it. */
  frame: (now: number, w: number, h: number) => void;
  /** The settled end-state frame — reduced-motion and the pre-rAF first paint. */
  still: (now: number, w: number, h: number) => void;
};

export function useInstrumentCanvas(
  create: (cx: CanvasRenderingContext2D) => InstrumentRenderer,
): {
  wrapRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
} {
  const wrapRef = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || typeof window === "undefined") return;
    const cx = canvas.getContext("2d");
    if (!cx) return;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const renderer = create(cx);
    let W = 0;
    let H = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      if (!r.width || !r.height) return;
      W = r.width;
      H = r.height;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const still = () => {
      resize();
      if (!W) return;
      renderer.still(performance.now(), W, H);
    };

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) still();
    });
    ro.observe(wrap);

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (reduced) still();
    });

    if (reduced) {
      still();
      return () => ro.disconnect();
    }

    let raf = 0;
    let running = false;
    const frame = (now: number) => {
      renderer.frame(now, W, H);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      resize();
      if (!W) return;
      running = true;
      renderer.reset(performance.now());
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // First paint immediately so there's never an empty box.
    still();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(wrap);

    return () => {
      io.disconnect();
      ro.disconnect();
      stop();
    };
    // create is intentionally captured once — instruments pass inline closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { wrapRef, canvasRef };
}

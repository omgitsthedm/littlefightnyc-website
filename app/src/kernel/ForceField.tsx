/**
 * ForceField — the one physics (Small Craft doctrine, Part Four).
 *
 * A single provider that publishes normalized forces to CSS custom properties on
 * the document root. Components SUBSCRIBE (read the vars in CSS, or via useForce);
 * they never wire their own pointer/scroll listeners. One throttled, DPR-aware
 * requestAnimationFrame ticker for the whole site.
 *
 * Published (all `@property`-registered in force-field.css so the compositor can
 * interpolate them):
 *   --ptr-x, --ptr-y   pointer position, 0..1 of viewport (smoothed, inertial)
 *
 * --ptr-active, --scroll-vel and --scroll-progress were published here too,
 * and nothing ever read them. They cost a scroll listener and three :root
 * custom-property writes per frame, each invalidating style for the whole
 * document. Removed 2026-07-29; re-add with a consumer, not before.
 *
 * Laws honored: reduced-motion → the ticker never runs and forces sit at neutral
 * rest (Law 7 / Reward-never-tax); tab hidden → paused; no subscribers → not
 * mounted (Conservation of Attention). Magic is additive: the site is whole with
 * this dead.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { ForceContext, NEUTRAL, type Forces } from "./force-context";
import "./force-field.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

const hasFineHoverPointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches === true;

export function ForceFieldProvider({ children }: { children: ReactNode }) {
  const forces = useRef<Forces>({ ...NEUTRAL });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    // Only --ptr-x and --ptr-y are read by anything (PageHero.css and
    // QuietHero.css). --ptr-active, --scroll-vel and --scroll-progress were
    // published on every frame and consumed by nobody: three inherited custom
    // properties set on :root, each invalidating style for the whole document.
    const write = (f: Forces) => {
      root.style.setProperty("--ptr-x", f.ptrX.toFixed(4));
      root.style.setProperty("--ptr-y", f.ptrY.toFixed(4));
    };

    // Touch devices do not have a useful pointer-parallax interaction, and
    // publishing inherited root variables on every scroll frame is expensive
    // on mobile WebKit. Keep the complete resting state and do not install the
    // pointer/scroll ticker unless the device has a real fine hover pointer.
    if (prefersReducedMotion() || !hasFineHoverPointer()) {
      forces.current = { ...NEUTRAL };
      write(NEUTRAL);
      return;
    }

    let raf = 0;
    let running = false;
    // Targets fed by raw events; the RAF eases current → target (inertia).
    let tx = 0.5,
      ty = 0.5,
      lastMoveAt = 0;
    const onMove = (e: PointerEvent) => {
      tx = clampUnit(e.clientX / window.innerWidth);
      ty = clampUnit(e.clientY / window.innerHeight);
      lastMoveAt = performance.now();
      start();
    };

    const frame = (now: number) => {
      const f = forces.current;
      // pointer inertia
      f.ptrX += (tx - f.ptrX) * 0.12;
      f.ptrY += (ty - f.ptrY) * 0.12;
      const movingRecently = now - lastMoveAt < 120;
      write(f);

      // Sleep the ticker once everything has settled to rest — no wasted frames.
      const atRest =
        Math.abs(tx - f.ptrX) < 0.001 &&
        Math.abs(ty - f.ptrY) < 0.001 &&
        !movingRecently;
      if (atRest || document.hidden) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    function start() {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    const onVisibility = () => {
      if (!document.hidden) start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <ForceContext.Provider value={{ get: () => forces.current }}>{children}</ForceContext.Provider>;
}

function clampUnit(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

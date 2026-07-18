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
 *   --ptr-active       1 while the pointer is moving, eases to 0 at rest
 *   --scroll-vel       scroll velocity, roughly -1..1 (down positive), smoothed
 *   --scroll-progress  document scroll progress, 0..1
 *
 * Laws honored: reduced-motion → the ticker never runs and forces sit at neutral
 * rest (Law 7 / Reward-never-tax); tab hidden → paused; no subscribers → not
 * mounted (Conservation of Attention). Magic is additive: the site is whole with
 * this dead.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { motionVars } from "./motion";
import { ForceContext, NEUTRAL, type Forces } from "./force-context";
import "./force-field.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

/** Inject the motion grammar's CSS vars once, so DOM and canvas share exact numbers. */
function registerMotionVars() {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(motionVars)) root.style.setProperty(k, v);
}

export function ForceFieldProvider({ children }: { children: ReactNode }) {
  const forces = useRef<Forces>({ ...NEUTRAL });

  useEffect(() => {
    if (typeof window === "undefined") return;
    registerMotionVars();

    const root = document.documentElement;
    const write = (f: Forces) => {
      root.style.setProperty("--ptr-x", f.ptrX.toFixed(4));
      root.style.setProperty("--ptr-y", f.ptrY.toFixed(4));
      root.style.setProperty("--ptr-active", f.ptrActive.toFixed(4));
      root.style.setProperty("--scroll-vel", f.scrollVel.toFixed(4));
      root.style.setProperty("--scroll-progress", f.scrollProgress.toFixed(4));
    };

    // Reduced motion: publish a calm, complete resting state and never tick.
    if (prefersReducedMotion()) {
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
    let lastScrollY = window.scrollY;
    let scrollVelTarget = 0;

    const onMove = (e: PointerEvent) => {
      tx = clampUnit(e.clientX / window.innerWidth);
      ty = clampUnit(e.clientY / window.innerHeight);
      lastMoveAt = performance.now();
      start();
    };
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastScrollY;
      lastScrollY = y;
      // normalize by a viewport-ish window; clamp to a sane band
      scrollVelTarget = clamp(dy / 40, -1, 1);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      forces.current.scrollProgress = clampUnit(y / max);
      start();
    };

    const frame = (now: number) => {
      const f = forces.current;
      // pointer inertia
      f.ptrX += (tx - f.ptrX) * 0.12;
      f.ptrY += (ty - f.ptrY) * 0.12;
      const movingRecently = now - lastMoveAt < 120;
      f.ptrActive += ((movingRecently ? 1 : 0) - f.ptrActive) * 0.1;
      // scroll velocity decays toward its target, then toward zero
      f.scrollVel += (scrollVelTarget - f.scrollVel) * 0.2;
      scrollVelTarget *= 0.85;
      write(f);

      // Sleep the ticker once everything has settled to rest — no wasted frames.
      const atRest =
        Math.abs(tx - f.ptrX) < 0.001 &&
        Math.abs(ty - f.ptrY) < 0.001 &&
        f.ptrActive < 0.01 &&
        Math.abs(f.scrollVel) < 0.001 &&
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
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onScroll(); // seed scroll-progress at mount

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <ForceContext.Provider value={{ get: () => forces.current }}>{children}</ForceContext.Provider>;
}

function clampUnit(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
function clamp(v: number, a: number, b: number) {
  return v < a ? a : v > b ? b : v;
}

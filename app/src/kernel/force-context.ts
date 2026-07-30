/**
 * force-context.ts — the ForceField context + subscription hook.
 *
 * Split from ForceField.tsx so the component file exports only a component
 * (React Fast Refresh requirement). See ForceField.tsx for the physics.
 */

import { createContext, useContext } from "react";

// ptrActive, scrollVel and scrollProgress were part of this shape and were
// published every frame, but nothing ever read them — so the type promised
// more than the field was worth maintaining. Narrowed 2026-07-29 to what the
// provider actually publishes and two stylesheets actually consume.
export type Forces = {
  ptrX: number;
  ptrY: number;
};

export const NEUTRAL: Forces = { ptrX: 0.5, ptrY: 0.5 };

export const ForceContext = createContext<{ get: () => Forces } | null>(null);

/**
 * useForce — subscribe to the field. Returns a live getter for the current
 * forces (read inside your own rAF/canvas loop). Falls back to neutral rest when
 * no provider is mounted or under reduced motion, so callers never branch.
 */
export function useForce() {
  const ctx = useContext(ForceContext);
  return ctx?.get ?? (() => ({ ...NEUTRAL }));
}

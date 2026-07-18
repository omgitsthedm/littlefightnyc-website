/**
 * force-context.ts — the ForceField context + subscription hook.
 *
 * Split from ForceField.tsx so the component file exports only a component
 * (React Fast Refresh requirement). See ForceField.tsx for the physics.
 */

import { createContext, useContext } from "react";

export type Forces = {
  ptrX: number;
  ptrY: number;
  ptrActive: number;
  scrollVel: number;
  scrollProgress: number;
};

export const NEUTRAL: Forces = { ptrX: 0.5, ptrY: 0.5, ptrActive: 0, scrollVel: 0, scrollProgress: 0 };

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

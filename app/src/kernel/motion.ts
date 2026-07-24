/**
 * motion.ts — the closed motion grammar (Small Craft doctrine, Part Four).
 *
 * One vocabulary for the whole site, named by INTENT, never by raw numbers.
 * Each intent carries a duration, CSS curve, and matching JS easing so canvas
 * instruments can use the same vocabulary as the DOM. The canonical CSS
 * custom properties live in editorial/tokens.css; this module mirrors them for
 * JavaScript without waiting for a provider effect to mutate document styles.
 *
 * Law 1 (one machine): components pull curves/durations from here, never invent
 * their own. Raw physics *internal* to a single instrument (gravity, springs)
 * may stay local; anything that crosses components speaks this grammar.
 *
 * The math helpers (clamp/lerp/easings) are the shared primitives the instrument
 * family is built from — extracted so every instrument uses identical curves.
 */

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// --- easing functions (canvas / JS side) ---
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t: number) => {
  const c = 1.5;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

// Doctrine aliases (short names used inside instruments).
export const eoc = easeOutCubic;
export const eio = easeInOutCubic;
export const eoBack = easeOutBack;

/** A named motion intent — the atom of the grammar. */
type Intent = {
  /** duration in ms */
  ms: number;
  /** CSS timing function for DOM transitions/animations */
  css: string;
  /** matching JS easing for canvas instruments (domain 0..1 → 0..1) */
  fn: (t: number) => number;
};

/**
 * THE GRAMMAR. Five intents, and only five.
 * - settle:      things coming to rest (reveals, hovers releasing)
 * - consolidate: the house motion — Many → One (the brand made physical)
 * - signal:      a decisive, snappy state change (act-here moments)
 * - reveal:      arrivals with a touch of weight (an object landing)
 * - weenie:      a slow, quiet lead — a visual magnet inviting the eye onward
 */
export const MOTION: Record<"settle" | "consolidate" | "signal" | "reveal" | "weenie", Intent> = {
  settle: { ms: 320, css: "cubic-bezier(0.22, 1, 0.36, 1)", fn: easeOutCubic },
  consolidate: { ms: 900, css: "cubic-bezier(0.22, 1, 0.36, 1)", fn: easeOutCubic },
  signal: { ms: 180, css: "cubic-bezier(0.22, 0.61, 0.36, 1)", fn: easeOutCubic },
  reveal: { ms: 480, css: "cubic-bezier(0.22, 1, 0.36, 1)", fn: easeOutCubic },
  weenie: { ms: 1200, css: "cubic-bezier(0.65, 0.05, 0.36, 1)", fn: easeInOutCubic },
};

import { useLayoutEffect, useRef } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  revealOnMount?: boolean;
  fallbackMs?: number;
};

/**
 * Attaches a ref and marks the element `data-revealed="true"` — the attribute
 * components style their reveal off — IMMEDIATELY on mount, before paint.
 *
 * The site loads "all at once": every section is present the instant it's in
 * the DOM, no scroll-gated entrance. Because this runs in useLayoutEffect it
 * fires before the browser paints, so the element never renders in its
 * opacity:0 entrance state on the client — no fade, no pop-in, no flash. This
 * is the permanent form of what prefers-reduced-motion always did here.
 *
 * The Options (threshold/rootMargin/once/revealOnMount/fallbackMs) are kept so
 * the 30+ call sites don't need to change; they're now no-ops.
 */
// Options kept for call-site compatibility (30+ consumers pass them); no-op now.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useScrollReveal<T extends HTMLElement>(_options: Options = {}) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    el.setAttribute("data-revealed", "true");
  }, []);

  return ref;
}

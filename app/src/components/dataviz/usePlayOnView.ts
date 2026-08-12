import { useEffect, useRef } from "react";

/**
 * usePlayOnView — the DOM counterpart to the instrument harness replay rule.
 *
 * Toggles `data-play="true"` while the element is inside the viewport so CSS
 * keyframe stories (rail draws, dot pops) run on entry and replay on re-entry,
 * exactly like the canvas instruments. Base styles without the attribute are
 * ALWAYS the settled final state: no-JS, prerender, and reduced-motion readers
 * see the complete section on first paint. Reduced motion never sets the
 * attribute, so the story simply never plays.
 */
export function usePlayOnView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) el.setAttribute("data-play", "true");
          else el.removeAttribute("data-play");
        }
      },
      { threshold },
    );
    io.observe(el);

    return () => io.disconnect();
  }, [threshold]);

  return ref;
}

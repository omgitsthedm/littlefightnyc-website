import { useLayoutEffect, useRef } from "react";

type Options = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  revealOnMount?: boolean;
  fallbackMs?: number;
};

/**
 * Adds a `data-revealed="true"` attribute to the element when it enters the
 * viewport, or on mount when requested. Components style their reveal off this
 * attribute. Respects prefers-reduced-motion by revealing immediately.
 */
export function useScrollReveal<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -10% 0px",
  once = true,
  revealOnMount = false,
  fallbackMs = 1800,
}: Options = {}) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.setAttribute("data-revealed", "true");
      return;
    }

    if (revealOnMount) {
      el.setAttribute("data-revealed", "true");
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      el.setAttribute("data-revealed", "true");
      return;
    }

    const fallback = window.setTimeout(() => {
      el.setAttribute("data-revealed", "true");
    }, fallbackMs);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute("data-revealed", "true");
            window.clearTimeout(fallback);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            el.setAttribute("data-revealed", "false");
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, [threshold, rootMargin, once, revealOnMount, fallbackMs]);

  return ref;
}

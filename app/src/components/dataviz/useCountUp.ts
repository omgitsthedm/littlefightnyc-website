import { useEffect, useRef, useState } from "react";

type Options = {
  /** Cap on the count duration in ms (small targets finish sooner). */
  duration?: number;
  /** Delay after the host reveals before the count starts (match the CSS stagger). */
  delay?: number;
};

/**
 * useCountUp — counts 0 → target on scroll reveal, requestAnimationFrame only.
 *
 * The returned `ref` goes on the rendered number's element; the hook finds the
 * nearest ancestor carrying `data-revealed` (the useScrollReveal host) and
 * starts when it flips to "true". Rules:
 *  - The FINAL value renders first (SSR/prerender, no-JS, and any element
 *    without a reveal host all read the true number — never a stuck 0).
 *  - prefers-reduced-motion: the final value, instantly, no animation.
 *  - Ease-out cubic, duration scales down for small targets so "2" doesn't
 *    crawl and "84" doesn't blink.
 * Only use for values that are pure numbers.
 */
export function useCountUp<T extends HTMLElement>(
  target: number,
  { duration = 1000, delay = 0 }: Options = {},
) {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState(target);
  // Render-time reset if the target ever changes (React-sanctioned pattern) —
  // the state must never keep a stale target's number.
  const [prevTarget, setPrevTarget] = useState(target);
  if (prevTarget !== target) {
    setPrevTarget(target);
    setValue(target);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    // Every early-exit keeps the initial state — the final value — so the
    // number is never trapped at 0 (SSR, reduced motion, no reveal host).
    if (!Number.isFinite(target) || target < 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The reveal host must exist at mount (components render data-revealed="true").
    const host = el.closest("[data-revealed]");
    if (!host) return;

    let raf = 0;
    let zeroTimer = 0;
    let timer = 0;
    let mo: MutationObserver | null = null;

    const run = () => {
      const dur = Math.max(480, Math.min(duration, 320 + target * 60));
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(eased * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const arm = () => {
      // Zero out as the host reveals (async — the element is still fading in),
      // then count after the caller's stagger delay.
      zeroTimer = window.setTimeout(() => setValue(0), 0);
      timer = window.setTimeout(run, delay);
    };

    if (host.getAttribute("data-revealed") === "true") {
      arm();
    } else {
      mo = new MutationObserver(() => {
        if (host.getAttribute("data-revealed") === "true") {
          mo?.disconnect();
          mo = null;
          arm();
        }
      });
      mo.observe(host, { attributes: true, attributeFilter: ["data-revealed"] });
    }

    return () => {
      mo?.disconnect();
      window.clearTimeout(zeroTimer);
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return { ref, value };
}

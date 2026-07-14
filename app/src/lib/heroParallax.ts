/**
 * heroParallax — Safari/WebKit fallback for the Chrome-only scroll-driven hero
 * zoom. The CSS uses `animation-timeline: view()` (Chromium only), gated behind
 * `@supports`, so on Safari the hero images simply sit static — part of why the
 * site "feels flat" on Safari. This replicates the same `cover 0% → cover 100%`
 * scale drift with one rAF-throttled passive scroll listener.
 *
 * On Chromium this is a no-op (the CSS animation handles it). It never runs
 * under reduced-motion. Transform-only, so it stays on the compositor.
 */

const SELECTOR =
  ".lf-pagehero__image img, .lf-pagehero--case .lf-pagehero__backdrop img, .lf-line__image img, .lf-studio__image img";

type Spec = { s0: number; s1: number; ty0: number; ty1: number };

function specFor(el: Element): Spec {
  // Values mirror the CSS keyframes exactly so Safari matches Chrome.
  if (el.matches(".lf-pagehero--case .lf-pagehero__backdrop img")) return { s0: 1.04, s1: 1.12, ty0: 0, ty1: 0 };
  if (el.matches(".lf-line__image img")) return { s0: 1.0, s1: 1.08, ty0: 0, ty1: -2 };
  if (el.matches(".lf-studio__image img")) return { s0: 1.0, s1: 1.06, ty0: 0, ty1: 0 };
  return { s0: 1.0, s1: 1.06, ty0: 0, ty1: 0 }; // .lf-pagehero__image img
}

export function initHeroParallax(): void {
  if (typeof window === "undefined" || typeof CSS === "undefined") return;
  // Chromium drives this via CSS `animation-timeline: view()` — leave it alone.
  if (CSS.supports("animation-timeline: view()")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;
    // Re-query each pass so hero images that mount on SPA navigation are picked up.
    const els = document.querySelectorAll(SELECTOR);
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      // `animation-range: cover 0% cover 100%`: 0 as the element enters the
      // bottom of the viewport, 1 as it fully exits the top.
      let p = (vh - r.top) / (vh + r.height);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      const s = specFor(el);
      const scale = s.s0 + (s.s1 - s.s0) * p;
      const ty = s.ty0 + (s.ty1 - s.ty0) * p;
      (el as HTMLElement).style.transform = ty ? `scale(${scale}) translateY(${ty}%)` : `scale(${scale})`;
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Apply once now and again shortly after (covers SPA route changes that scroll
  // to top without a manual scroll gesture).
  update();
  window.setTimeout(update, 300);
}

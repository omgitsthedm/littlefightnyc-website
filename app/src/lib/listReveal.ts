/* One-time scroll reveals for editorial list items and long-form images.
 * Replaces the old CSS `animation-timeline: view()` approach, which reversed
 * (re-hid content) whenever an element left the viewport — glitchy on
 * scroll-up and left black voids in print/capture. Elements reveal exactly
 * once; reduced-motion reveals instantly. */

const LIST_SELECTORS = [
  ".lf-cases__item",
  ".lf-studio__item",
  ".lf-sd-issues__item",
  ".lf-sd-fallacies__item",
  ".lf-answers-index__item",
  ".lf-archive__entry",
  ".lf-svc__card",
];

const IMAGE_SELECTORS = [
  ".lf-post__inner img",
  ".lf-answer-page img",
  "figure img",
  ".lf-img-reveal",
];

const SELECTOR = [...LIST_SELECTORS, ...IMAGE_SELECTORS]
  .map((s) => `.lf-editorial ${s}`)
  .join(", ");

const REVEAL_ATTR = "data-lf-reveal";

function revealNow(el: Element) {
  el.setAttribute(REVEAL_ATTR, "in");
}

/** Reveal every list/image target immediately. The site loads "all at once":
 * items are present the instant they're in the DOM, never scroll-gated. This
 * only ever sets the "in" (shown) state — it never sets "pending", so the
 * base.css `[data-lf-reveal="pending"]` opacity:0 entrance never applies and
 * nothing waits to fade in. Safe to call repeatedly (idempotent per element). */
function refreshListReveals(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const els = document.querySelectorAll<HTMLElement>(SELECTOR);
  els.forEach(revealNow);
}

/** Watch a container for late-mounting content (lazy routes, fetched HTML). */
export function watchListReveals(root: Element): () => void {
  refreshListReveals();
  if (typeof MutationObserver === "undefined") return () => undefined;

  let scheduled = false;
  const mo = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      refreshListReveals();
    });
  });
  mo.observe(root, { childList: true, subtree: true });
  return () => mo.disconnect();
}

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
const FALLBACK_MS = 1800;

let observer: IntersectionObserver | null = null;

function revealNow(el: Element) {
  el.setAttribute(REVEAL_ATTR, "in");
}

function staggerIndex(el: HTMLElement): number {
  const parent = el.parentElement;
  if (!parent) return 0;
  let i = 0;
  for (const child of Array.from(parent.children)) {
    if (child === el) return i;
    if (child.matches(SELECTOR)) i += 1;
  }
  return i;
}

/** Scan for unseen reveal targets and arm them. Safe to call repeatedly. */
export function refreshListReveals(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const els = document.querySelectorAll<HTMLElement>(SELECTOR);
  if (els.length === 0) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof IntersectionObserver === "undefined") {
    els.forEach(revealNow);
    return;
  }

  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          revealNow(entry.target);
          observer?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );

  const armed: HTMLElement[] = [];
  els.forEach((el) => {
    if (el.hasAttribute(REVEAL_ATTR)) return;
    el.setAttribute(REVEAL_ATTR, "pending");
    el.style.setProperty("--lf-i", String(staggerIndex(el) % 8));
    observer?.observe(el);
    armed.push(el);
  });

  if (armed.length > 0) {
    // Same guarantee the useScrollReveal hook makes: nothing stays trapped
    // invisible (print, capture, odd viewports).
    window.setTimeout(() => {
      armed.forEach((el) => {
        if (el.getAttribute(REVEAL_ATTR) === "pending") {
          revealNow(el);
          observer?.unobserve(el);
        }
      });
    }, FALLBACK_MS);
  }
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

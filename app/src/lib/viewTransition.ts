import { flushSync } from "react-dom";

/**
 * Native route transitions (progressive).
 *
 * The app's baseline navigation is the `.lf-page-enter` re-key fade in
 * motion.css — it plays on every route change and must keep working
 * everywhere. On top of that, GlobalViewTransitions (the app-wide capture-phase
 * click interceptor — the ONLY caller of this module) runs every same-origin
 * navigation through `document.startViewTransition`, so all routes share one
 * native crossfade and elements with paired `view-transition-name`s (case-study
 * card → detail hero, journal title → post h1) morph.
 *
 * Progressive rules:
 * - No View Transitions API, or prefers-reduced-motion → plain navigation with
 *   the re-key fade, untouched.
 * - While a scripted transition drives a navigation we stamp `data-vt-route`
 *   on <html>; motion.css uses it to suppress the re-key fade for that one
 *   navigation so the page never double-animates.
 * - Same-document SPA navigations only.
 */

type ViewTransitionLike = {
  finished: Promise<void>;
};

type DocumentWithVT = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => ViewTransitionLike;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function supportsViewTransitions(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as DocumentWithVT;
  if (typeof doc.startViewTransition !== "function") return false;
  return !prefersReducedMotion();
}

/**
 * Wait until React has committed the destination page. React Router v7 wraps
 * navigation state in React.startTransition, so even flushSync(navigate)
 * commits nothing synchronously — the old page is still on screen when the
 * update callback returns. We therefore wait for BOTH:
 *   1. the re-keyed page wrapper (`.lf-page-enter`) to be a NEW node
 *      (EditorialShell re-keys it per pathname), and
 *   2. the lazy-route Suspense fallback (`.route-loading`) to be gone,
 * capped so a slow chunk can never freeze the page inside a held snapshot.
 * (Verified 2026-07-12: without #1 the new snapshot captured the loader.)
 */
function settled(before: Element | null, timeoutMs = 450): Promise<void> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const current = document.querySelector(".lf-page-enter");
      const committed = current !== null && current !== before;
      const loading = document.querySelector(".route-loading") !== null;
      if ((committed && !loading) || Date.now() - start >= timeoutMs) {
        resolve();
      } else {
        window.setTimeout(check, 16);
      }
    };
    window.setTimeout(check, 0);
  });
}

/** Run `navigateFn(to)` inside a native view transition. */
export function navigateWithViewTransition(
  navigateFn: (to: string) => void,
  to: string,
): void {
  if (!supportsViewTransitions()) {
    navigateFn(to);
    return;
  }

  const doc = document as DocumentWithVT;
  const root = document.documentElement;
  root.dataset.vtRoute = "1";
  const clear = () => {
    delete root.dataset.vtRoute;
  };
  let vt: ViewTransitionLike;
  try {
    vt = doc.startViewTransition!(async () => {
      const before = document.querySelector(".lf-page-enter");
      flushSync(() => navigateFn(to));
      await settled(before);
    });
  } catch {
    clear();
    navigateFn(to);
    return;
  }
  vt.finished.then(clear, clear);
}

import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { MouseEvent } from "react";

/**
 * Shared-element route transitions (progressive).
 *
 * The app's baseline navigation is the `.lf-page-enter` re-key fade in
 * motion.css — it plays on every route change and must keep working
 * everywhere. This module ADDS a scripted `document.startViewTransition`
 * around specific navigations (case-study card → detail hero, journal title
 * → post h1) so paired elements sharing a `view-transition-name` morph.
 *
 * Progressive rules:
 * - No View Transitions API, or prefers-reduced-motion → we do nothing and
 *   the plain <Link> navigation (with the re-key fade) runs untouched.
 * - While a scripted transition drives a navigation we stamp
 *   `data-vt-route` on <html>; motion.css uses it to suppress the re-key
 *   fade for that one navigation so the page never double-animates.
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

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function supportsViewTransitions(): boolean {
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

/**
 * Run `navigateFn(to)` inside a view transition. `preload` (usually
 * `() => import("...")` of the destination page chunk) is awaited first —
 * briefly, capped — so the new snapshot captures the real page, not the
 * route loader.
 */
export function navigateWithViewTransition(
  navigateFn: (to: string) => void,
  to: string,
  preload?: () => Promise<unknown>,
): void {
  if (!supportsViewTransitions()) {
    navigateFn(to);
    return;
  }

  const go = () => {
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
  };

  if (preload) {
    // Warm the destination chunk, capped — never block the tap on a slow net.
    Promise.race([
      preload().catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 350)),
    ]).then(go, go);
  } else {
    go();
  }
}

/**
 * Click-handler factory for <Link>s that should morph. Returns an onClick
 * that, when the API is available, takes over the navigation; otherwise it
 * does nothing and the <Link> behaves exactly as before (re-key fade).
 */
export function useViewTransitionNav() {
  const navigate = useNavigate();
  return useCallback(
    (to: string, preload?: () => Promise<unknown>) =>
      (event: MouseEvent<HTMLAnchorElement>) => {
        if (!supportsViewTransitions()) return; // plain Link + re-key fade
        if (event.defaultPrevented || event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
          return;
        event.preventDefault();
        navigateWithViewTransition((t) => navigate(t), to, preload);
      },
    [navigate],
  );
}

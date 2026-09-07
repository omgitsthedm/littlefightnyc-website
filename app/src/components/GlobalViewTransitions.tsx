import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigateWithViewTransition } from "@/lib/viewTransition";
import { preloadSelectedPublicRoute } from "@/lib/publicRoutePreload";

let latestNavigation = 0;

/**
 * No-seam navigation, everywhere.
 *
 * Every same-origin, same-tab link click is routed through ONE scripted View
 * Transition (`document.startViewTransition`) — the same native crossfade the
 * case-study / journal shared-element morphs already use. So all 178 routes
 * share one motion, and paired `view-transition-name` elements still morph
 * wherever they exist. No per-link wiring required.
 *
 * Why capture-phase + preventDefault (and NOT stopPropagation):
 * - This listener runs in the CAPTURE phase on `document`, BEFORE React's
 *   delegated onClick handlers (attached at #root, bubble phase). It marks the
 *   event defaultPrevented and takes over the navigation itself.
 * - React Router's <Link> only calls navigate() `if (!event.defaultPrevented)`,
 *   so our preventDefault silently suppresses its duplicate navigation — no
 *   double-nav — without us having to stop the event.
 * - We deliberately do NOT stopPropagation, so every other onClick still runs:
 *   the mobile-drawer NavLinks close via their own `onClick={() => setOpen(false)}`
 *   (QuietNav relies on that, not a route-change effect). Shared-element morphs
 *   (case-study card → detail hero, journal title → post h1) need no per-link
 *   wiring — their paired `view-transition-name`s morph inside this transition.
 *
 * Fallbacks are inherited from navigateWithViewTransition: no View Transitions
 * API, or prefers-reduced-motion → plain SPA navigation with the `.lf-page-enter`
 * re-key fade, exactly as before. The re-key fade also covers browsers that
 * never reach this code.
 *
 * Escapes (left untouched, native behavior): modifier / non-left clicks
 * (open-in-new-tab), `target` other than _self, `download`, `rel="external"`,
 * cross-origin or non-http(s) (mailto:/tel:), pure in-page hash jumps, and an
 * explicit `data-no-vt` opt-out.
 */
export default function GlobalViewTransitions() {
  const navigate = useNavigate();
  const location = useLocation();

  // Browser Back/Forward and imperative router navigation must beat a route
  // preload that began under an older page state.
  useEffect(() => {
    latestNavigation += 1;
  }, [location.key]);

  useEffect(() => {
    const cancelPendingNavigation = () => {
      latestNavigation += 1;
    };
    window.addEventListener("popstate", cancelPendingNavigation);
    return () => window.removeEventListener("popstate", cancelPendingNavigation);
  }, []);

  useEffect(() => {
    const selectedRoute = (anchor: HTMLAnchorElement): URL | null => {
      const href = anchor.getAttribute("href");
      if (!href) return null;
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        return url;
      } catch {
        return null;
      }
    };

    const preloadAnchor = (anchor: HTMLAnchorElement) => {
      const url = selectedRoute(anchor);
      if (!url) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      void preloadSelectedPublicRoute(url.pathname)?.catch(() => {});
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement) preloadAnchor(anchor);
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (anchor instanceof HTMLAnchorElement) preloadAnchor(anchor);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      // Explicit escapes → let the browser / RR handle it natively.
      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (/\bexternal\b/.test(anchor.getAttribute("rel") ?? "")) return;
      if ((anchor as HTMLElement).dataset.noVt !== undefined) return;

      const url = selectedRoute(anchor);
      if (!url) return;
      // Cross-origin or non-http(s) (mailto:/tel: resolve to a different origin).
      if (url.origin !== window.location.origin) return;

      // Same document (in-page #hash scroll, or an exact re-nav) → leave it be.
      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePage) {
        // A hash jump is still a deliberate newer navigation. Do not let a
        // previous delayed route replace it when its chunk finally arrives.
        latestNavigation += 1;
        return;
      }

      // Take over: mark handled (suppresses RR <Link>'s own navigate) and run
      // the navigation only after the selected route is ready. Until then, the
      // live source page remains visible, interactive, and available to AT.
      event.preventDefault();
      const destination = url.pathname + url.search + url.hash;
      const navigationToken = ++latestNavigation;
      const preload = preloadSelectedPublicRoute(url.pathname);
      if (!preload) {
        navigateWithViewTransition((to) => navigate(to), destination);
        return;
      }
      void preload.then(
        () => {
          if (navigationToken !== latestNavigation) return;
          navigateWithViewTransition((to) => navigate(to), destination);
        },
        () => {
          if (navigationToken !== latestNavigation) return;
          // Let the route's own lazy import/error boundary present recovery.
          navigate(destination);
        },
      );
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      latestNavigation += 1;
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("focusin", onFocusIn, true);
    };
  }, [navigate]);

  return null;
}

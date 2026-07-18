import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { navigateWithViewTransition } from "@/lib/viewTransition";

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
 *   (QuietNav relies on that, not a route-change effect), and the tuned
 *   case-study / journal `useViewTransitionNav` handlers simply early-return on
 *   the already-defaultPrevented event, ceding the navigation to this one path.
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

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest?.("a");
      if (!anchor) return;

      // Explicit escapes → let the browser / RR handle it natively.
      const anchorTarget = anchor.getAttribute("target");
      if (anchorTarget && anchorTarget !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (/\bexternal\b/.test(anchor.getAttribute("rel") ?? "")) return;
      if ((anchor as HTMLElement).dataset.noVt !== undefined) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // Cross-origin or non-http(s) (mailto:/tel: resolve to a different origin).
      if (url.origin !== window.location.origin) return;

      // Same document (in-page #hash scroll, or an exact re-nav) → leave it be.
      const samePage =
        url.pathname === window.location.pathname &&
        url.search === window.location.search;
      if (samePage) return;

      // Take over: mark handled (suppresses RR <Link>'s own navigate) and run
      // the navigation inside a single native View Transition.
      event.preventDefault();
      navigateWithViewTransition(
        (to) => navigate(to),
        url.pathname + url.search + url.hash,
      );
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return null;
}

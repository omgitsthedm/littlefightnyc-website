import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route focus and announcement.
 *
 * A client-side route change replaces the page without telling anyone who is
 * not watching it happen. Scroll resets and the title updates, but focus stays
 * on <body>: a keyboard user's next Tab starts over at the top of the document
 * instead of the content they just asked for, and a screen reader says nothing
 * at all. Verified on production before this existed — focus sat on BODY after
 * navigating, with no live region announcing the change.
 *
 * So on every pathname change after the first paint we move focus to the <main>
 * landmark and announce the new title politely. The initial load is skipped:
 * the browser already puts focus in the right place, and stealing it there
 * would fight the skip link.
 *
 * Hash navigation is left alone — RouteScrollManager is already targeting the
 * fragment, and moving focus to <main> would undo it.
 */
export default function RouteFocusManager() {
  const { pathname, hash } = useLocation();
  const isFirstRender = useRef(true);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return undefined;
    }

    if (hash) return undefined;

    // One frame was not enough. Home renders its own root rather than
    // EditorialShell, so on the first navigation away from it there is a window
    // where the old tree is gone and the lazily-imported route has not mounted.
    // A single rAF landed inside it: <main> was null so focus stayed on <body>,
    // <h1> was null so the announcement fell back to document.title — which
    // still held the PREVIOUS page's title. Reduced-motion users got that every
    // time; everyone else was saved by accident, because view transitions delay
    // the frame past the remount. The group most likely to depend on this was
    // the only one it failed for.
    //
    // Two separate jobs, so they are no longer gated on each other: focus the
    // landmark the moment it exists, and announce the heading whenever it turns
    // up. Waiting for both meant a slow chunk delayed the focus too.
    //
    // Nothing is announced if the heading never arrives. A stale document.title
    // names the page the user just left, and telling someone they are still on
    // the home page is worse than telling them nothing — silence they can
    // resolve by reading; a wrong announcement they cannot.
    let raf = 0;
    let cancelled = false;
    let focused = false;
    const deadline = performance.now() + 5000;

    const settle = () => {
      if (cancelled) return;

      if (!focused) {
        const main =
          document.getElementById("main-content") ??
          document.querySelector("main");
        if (main instanceof HTMLElement) {
          // Programmatically focusable without joining the tab order.
          if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
          main.focus({ preventScroll: true });
          focused = true;
        }
      }

      // Prefer the page's own heading over the document title — it is the
      // shorter, human half, without the site-name suffix.
      const heading = document.querySelector("h1")?.textContent?.trim();
      if (heading) {
        setAnnouncement(heading);
        return;
      }

      if (performance.now() < deadline) raf = window.requestAnimationFrame(settle);
    };


    raf = window.requestAnimationFrame(settle);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [pathname, hash]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {announcement}
    </div>
  );
}

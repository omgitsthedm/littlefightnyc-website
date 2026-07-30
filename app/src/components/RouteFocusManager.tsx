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

    // The new route's <main> mounts with the page, so wait a frame for it.
    const raf = window.requestAnimationFrame(() => {
      const main =
        document.getElementById("main-content") ??
        document.querySelector("main");

      if (main instanceof HTMLElement) {
        // Programmatically focusable without joining the tab order.
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
      }

      // Prefer the page's own heading over the document title — it is the
      // shorter, human half, without the site-name suffix.
      const heading = document.querySelector("h1")?.textContent?.trim();
      setAnnouncement(heading || document.title);
    });

    return () => window.cancelAnimationFrame(raf);
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

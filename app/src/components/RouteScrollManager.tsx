import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

function jumpToTop() {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  root.style.scrollBehavior = previousBehavior;
}

export default function RouteScrollManager() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      jumpToTop();
      return undefined;
    }

    let cancelled = false;
    let attempts = 0;
    // decodeURIComponent throws URIError on a malformed escape — "#%", "#%zz",
    // a truncated "#%E0%A4%A". This runs in a layout effect mounted outside the
    // error boundary, so the throw took the whole tree down: littlefightnyc.com/#%
    // rendered a blank page with an empty #root. A mangled share link or a
    // clipped email URL was enough. Fall back to the raw fragment, which simply
    // will not match an element id, and the existing retry path gives up
    // gracefully and scrolls to top.
    let targetId: string;
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      targetId = hash.slice(1);
    }

    const scrollToHash = () => {
      if (cancelled) return;

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "auto" });
        // A link straight to a form field should land the visitor typing,
        // not hunting for the box: /website-check/#website-check-url puts the
        // cursor in the URL input. Only form controls — a heading anchor must
        // not steal focus.
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
          target.focus({ preventScroll: true });
        }
        return;
      }

      attempts += 1;
      if (attempts < 16) {
        window.setTimeout(scrollToHash, 80);
      } else {
        jumpToTop();
      }
    };

    window.setTimeout(scrollToHash, 0);

    return () => {
      cancelled = true;
    };
  }, [pathname, search, hash]);

  return null;
}

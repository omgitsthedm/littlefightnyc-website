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
    const targetId = decodeURIComponent(hash.slice(1));

    const scrollToHash = () => {
      if (cancelled) return;

      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ block: "start", behavior: "auto" });
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

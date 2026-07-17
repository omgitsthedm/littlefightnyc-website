import { lazy, Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

// fonts/tokens/base are imported once at the entry (src/main.tsx). Only the
// shell-specific overrides stay here.
import "@/styles/editorial/legacy-overrides.css";

// RouteMeta keeps <head> in sync on client-side navigation. The prerendered
// HTML already carries correct per-page meta on first paint, so it's not on the
// critical path — lazy-load it off the shell's eager chunk.
const RouteMeta = lazy(() => import("@/components/RouteMeta"));
import { watchListReveals } from "@/lib/listReveal";
import QuietNav from "./QuietNav";
import QuietFooter from "./QuietFooter";
import StickyHelpBar from "./StickyHelpBar";
import CommandPalette from "./CommandPalette";

export default function EditorialShell() {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return watchListReveals(rootRef.current);
  }, []);

  return (
    <div className="lf-editorial" id="top" ref={rootRef}>
      <Suspense fallback={null}>
        <RouteMeta />
      </Suspense>
      <a href="#main-content" className="lf-skip-link">Skip to content</a>
      <QuietNav />
      <main id="main-content" className="lf-page">
        {/* Re-key on path so the page content fades + rises on each navigation;
            nav/footer are siblings and never re-mount. */}
        <div className="lf-page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>
      <StickyHelpBar />
      <QuietFooter />
      <CommandPalette />
    </div>
  );
}

import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

import "@/styles/editorial/fonts.css";
import "@/styles/editorial/tokens.css";
import "@/styles/editorial/base.css";
import "@/styles/editorial/legacy-overrides.css";

import RouteMeta from "@/components/RouteMeta";
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
      <RouteMeta />
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

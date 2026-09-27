// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { useEffect, useRef } from "react";
import RouteMeta from "@/components/RouteMeta";
import QuietNav from "@/components/editorial/QuietNav";
import HomeWall from "@/components/editorial/HomeWall";
import ServiceSections from "@/components/editorial/ServiceSections";
import QuietContact from "@/components/editorial/QuietContact";
import QuietFooter from "@/components/editorial/QuietFooter";
import StickyHelpBar from "@/components/editorial/StickyHelpBar";
import CommandPalette from "@/components/editorial/CommandPalette";
import { watchListReveals } from "@/lib/listReveal";
import "./Home.css";

/**
 * Three moves: who this is for, what we do, how to reach us.
 *
 * The page used to run hero → proof chapter → services → close, and the client
 * work appeared in all three. The hero now places one real, named client path
 * beside the opening decision, while the gallery and service sections carry
 * the wider range of work. The separate proof chapter was saying the same
 * thing a third time, so it is gone and the page stays shorter.
 */
export default function Home() {
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
      <main id="main-content" className="lf-home-main">
        <HomeWall />
        <ServiceSections />
        <QuietContact intent="website" />
      </main>
      <StickyHelpBar />
      <QuietFooter />
      <CommandPalette />
    </div>
  );
}

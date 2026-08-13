// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { lazy, Suspense, useEffect, useRef } from "react";
import RouteMeta from "@/components/RouteMeta";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import GrowthPath from "@/components/editorial/GrowthPath";
import TheFight from "@/components/editorial/TheFight";
import TheFour from "@/components/editorial/TheFour";
import ClientContinuity from "@/components/editorial/ClientContinuity";
import QuietContact from "@/components/editorial/QuietContact";
import QuietFooter from "@/components/editorial/QuietFooter";
import StickyHelpBar from "@/components/editorial/StickyHelpBar";
import CommandPalette from "@/components/editorial/CommandPalette";
import { watchListReveals } from "@/lib/listReveal";
import "./Home.css";

// These rich below-the-hero sections keep their own chunks. The prerendered
// first response already carries the page's complete owner-facing meaning;
// splitting the interactive layer keeps every visit from paying for the full
// portfolio catalog and calculator before the hero is useful.
const OwnerPath = lazy(() => import("@/components/dataviz/OwnerPath"));
const WebsiteNightShift = lazy(() => import("@/components/dataviz/WebsiteNightShift"));
const MoneyLeakMeter = lazy(() => import("@/components/dataviz/MoneyLeakMeter"));
const RecentClients = lazy(() => import("@/components/editorial/RecentClients"));

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
        <QuietHero />
        <Suspense fallback={null}>
          <OwnerPath />
        </Suspense>
        <Suspense fallback={null}>
          <WebsiteNightShift />
        </Suspense>
        <Suspense fallback={null}>
          <MoneyLeakMeter />
        </Suspense>
        <GrowthPath />
        <TheFour />
        <QuietContact />
        <Suspense fallback={null}>
          <RecentClients />
        </Suspense>
        <TheFight />
        <ClientContinuity />
      </main>
      <StickyHelpBar />
      <QuietFooter />
      <CommandPalette />
    </div>
  );
}

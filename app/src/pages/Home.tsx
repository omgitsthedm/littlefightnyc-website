// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { useEffect, useRef } from "react";
import RouteMeta from "@/components/RouteMeta";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import OwnerFight from "@/components/editorial/OwnerFight";
import QuietContact from "@/components/editorial/QuietContact";
import QuietFooter from "@/components/editorial/QuietFooter";
import StickyHelpBar from "@/components/editorial/StickyHelpBar";
import CommandPalette from "@/components/editorial/CommandPalette";
import RecentClients from "@/components/editorial/RecentClients";
import { watchListReveals } from "@/lib/listReveal";
import "./Home.css";

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
        <RecentClients />
        <OwnerFight />
        <QuietContact intent="website" />
      </main>
      <StickyHelpBar />
      <QuietFooter />
      <CommandPalette />
    </div>
  );
}

// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { lazy, Suspense, useEffect, useRef } from "react";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import BlueprintFrame from "@/components/editorial/BlueprintFrame";
import { importWithRetry } from "@/lib/importWithRetry";
import { watchListReveals } from "@/lib/listReveal";

const RouteMeta = lazy(() => importWithRetry(() => import("@/components/RouteMeta")));
const RecentClients = lazy(() => importWithRetry(() => import("@/components/editorial/RecentClients")));
const TheFight = lazy(() => importWithRetry(() => import("@/components/editorial/TheFight")));
const TheFour = lazy(() => importWithRetry(() => import("@/components/editorial/TheFour")));
const QuietContact = lazy(() => importWithRetry(() => import("@/components/editorial/QuietContact")));
const QuietFooter = lazy(() => importWithRetry(() => import("@/components/editorial/QuietFooter")));
const StickyHelpBar = lazy(() => importWithRetry(() => import("@/components/editorial/StickyHelpBar")));
const CommandPalette = lazy(() => importWithRetry(() => import("@/components/editorial/CommandPalette")));

export default function Home() {
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
      <main id="main-content">
        <QuietHero />
        <Suspense fallback={null}>
            {/* Proof follows the hook. One New York point of view follows the
                proof, then four plain ways to help, then the contact door. */}
            <BlueprintFrame index={1} label="Shipped proof">
              <RecentClients />
            </BlueprintFrame>
            <BlueprintFrame index={2} label="The fight">
              <TheFight />
            </BlueprintFrame>
            <BlueprintFrame index={3} label="What we do">
              <TheFour />
            </BlueprintFrame>
            <QuietContact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <StickyHelpBar />
        <QuietFooter />
        <CommandPalette />
      </Suspense>
    </div>
  );
}

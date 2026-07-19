// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { lazy, Suspense, useEffect, useRef } from "react";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import BlueprintFrame from "@/components/editorial/BlueprintFrame";
import { importWithRetry } from "@/lib/importWithRetry";
import { watchListReveals } from "@/lib/listReveal";

const RouteMeta = lazy(() => importWithRetry(() => import("@/components/RouteMeta")));
const TheFight = lazy(() => importWithRetry(() => import("@/components/editorial/TheFight")));
const TheFour = lazy(() => importWithRetry(() => import("@/components/editorial/TheFour")));
const RecentClients = lazy(() => importWithRetry(() => import("@/components/editorial/RecentClients")));
const NeonSign = lazy(() => importWithRetry(() => import("@/components/editorial/NeonSign")));
const BrandLine = lazy(() => importWithRetry(() => import("@/components/editorial/BrandLine")));
const SignatureBand = lazy(() => importWithRetry(() => import("@/components/editorial/SignatureBand")));
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
            {/* BlueprintFrame = opt-in drafting marginalia on the major
                section boundaries (corner ticks + SEC. NN margin notes,
                ≥1280px only — see BlueprintFrame.css).

                Stacking law (David, 2026-07-19): dramatics at the top, the
                work at the bottom above the door. Hook (hero) → why we exist
                (the fight card) → FOUR ITEMS OF FOCUS: Web Design, Tech
                Support, Consulting, Personalized Software, each proven by its
                living instrument → the record → recent work as closing proof →
                the sign → the door. No repeated pitches. */}
            <BlueprintFrame index={1} label="The fight">
              <TheFight />
            </BlueprintFrame>
            <BlueprintFrame index={2} label="What we do">
              <TheFour />
            </BlueprintFrame>
            <BlueprintFrame index={3} label="The record">
              <SignatureBand />
            </BlueprintFrame>
            <BlueprintFrame index={4} label="Recent work">
              <RecentClients />
            </BlueprintFrame>
            <BlueprintFrame index={5} label="Open for business">
              <NeonSign />
            </BlueprintFrame>
            <BrandLine />
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

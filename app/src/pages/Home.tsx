import "@/styles/editorial/fonts.css";
import "@/styles/editorial/tokens.css";
import "@/styles/editorial/base.css";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import BlueprintFrame from "@/components/editorial/BlueprintFrame";
import { watchListReveals } from "@/lib/listReveal";

const RouteMeta = lazy(() => import("@/components/RouteMeta"));
const TheAssembly = lazy(() => import("@/components/editorial/TheAssembly"));
const FaqList = lazy(() => import("@/components/editorial/FaqList"));
const TheFight = lazy(() => import("@/components/editorial/TheFight"));
const WorkGrid = lazy(() => import("@/components/editorial/WorkGrid"));
const MomentumSection = lazy(() => import("@/components/editorial/MomentumSection"));
const MomentumCursorGlow = lazy(() => import("@/components/editorial/MomentumCursorGlow"));
const RecentClients = lazy(() => import("@/components/editorial/RecentClients"));
const BrandLine = lazy(() => import("@/components/editorial/BrandLine"));
const SignatureBand = lazy(() => import("@/components/editorial/SignatureBand"));
const QuietContact = lazy(() => import("@/components/editorial/QuietContact"));
const QuietFooter = lazy(() => import("@/components/editorial/QuietFooter"));
const StickyHelpBar = lazy(() => import("@/components/editorial/StickyHelpBar"));
const CommandPalette = lazy(() => import("@/components/editorial/CommandPalette"));

/* Mirrors the FAQPage JSON-LD for "/" in seo-pages.json — marked-up content
 * must be visible on the page (Google guideline). Keep the two in sync. */
const HOME_FAQ = [
  {
    question: "What does Little Fight NYC do?",
    answer:
      "Little Fight NYC builds websites for small businesses, fixes urgent tech, gives free consulting, and creates focused software clients own.",
  },
  {
    question: "Who does Little Fight NYC help?",
    answer:
      "Little Fight NYC helps New York shops, salons, pharmacies, restaurants, studios, service businesses, and teams under 50.",
  },
];

function useDeferredSections() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    // Mount the below-the-fold sections as soon as the main thread is idle
    // after the hero paints — no artificial delay. (The old 2.2s setTimeout made
    // the whole page appear broken/blank below the hero for seconds.)
    const ric = window.requestIdleCallback;
    if (typeof ric === "function") {
      const id = ric(() => setReady(true), { timeout: 250 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = globalThis.setTimeout(() => setReady(true), 50);
    return () => globalThis.clearTimeout(id);
  }, []);

  return ready;
}

export default function Home() {
  const showDeferred = useDeferredSections();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return watchListReveals(rootRef.current);
  }, []);

  return (
    <div className="lf-editorial" id="top" ref={rootRef}>
      {showDeferred && (
        <Suspense fallback={null}>
          <RouteMeta />
        </Suspense>
      )}
      <a href="#main-content" className="lf-skip-link">Skip to content</a>
      <QuietNav />
      <main id="main-content">
        <QuietHero />
        {showDeferred && (
          <Suspense fallback={null}>
            {/* BlueprintFrame = opt-in drafting marginalia on the major
                section boundaries (corner ticks + SEC. NN margin notes,
                ≥1280px only — see BlueprintFrame.css). */}
            <BlueprintFrame index={1} label="Recent work">
              <RecentClients />
            </BlueprintFrame>
            <BlueprintFrame index={2} label="Ways to start">
              <WorkGrid />
            </BlueprintFrame>
            <BlueprintFrame index={3} label="The assembly">
              <TheAssembly />
            </BlueprintFrame>
            <BlueprintFrame index={4} label="The fight">
              <TheFight />
            </BlueprintFrame>
            <BlueprintFrame index={5} label="Software you own">
              <MomentumSection />
              <MomentumCursorGlow />
            </BlueprintFrame>
            <BlueprintFrame index={6} label="The record">
              <SignatureBand />
            </BlueprintFrame>
            <BrandLine />
            <div className="lf-home-faq">
              <FaqList title="Quick answers" items={HOME_FAQ} />
            </div>
            <QuietContact />
          </Suspense>
        )}
      </main>
      {showDeferred && (
        <Suspense fallback={null}>
          <StickyHelpBar />
          <QuietFooter />
          <CommandPalette />
        </Suspense>
      )}
    </div>
  );
}

import "@/styles/editorial/fonts.css";
import "@/styles/editorial/tokens.css";
import "@/styles/editorial/base.css";

import { lazy, Suspense, useEffect, useState } from "react";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";

const RouteMeta = lazy(() => import("@/components/RouteMeta"));
const WorkGrid = lazy(() => import("@/components/editorial/WorkGrid"));
const MomentumSection = lazy(() => import("@/components/editorial/MomentumSection"));
const RecentClients = lazy(() => import("@/components/editorial/RecentClients"));
const BrandLine = lazy(() => import("@/components/editorial/BrandLine"));
const QuietContact = lazy(() => import("@/components/editorial/QuietContact"));
const QuietFooter = lazy(() => import("@/components/editorial/QuietFooter"));
const StickyHelpBar = lazy(() => import("@/components/editorial/StickyHelpBar"));

function useDeferredSections() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const id = globalThis.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => setReady(true), { timeout: 1200 });
        return;
      }

      setReady(true);
    }, 2200);
    return () => globalThis.clearTimeout(id);
  }, []);

  return ready;
}

export default function Home() {
  const showDeferred = useDeferredSections();

  return (
    <div className="lf-editorial" id="top">
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
            <WorkGrid />
            <MomentumSection />
            <RecentClients />
            <BrandLine />
            <QuietContact />
          </Suspense>
        )}
      </main>
      {showDeferred && (
        <Suspense fallback={null}>
          <StickyHelpBar />
          <QuietFooter />
        </Suspense>
      )}
    </div>
  );
}

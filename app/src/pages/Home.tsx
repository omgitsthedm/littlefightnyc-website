// fonts/tokens/base are imported once at the entry (src/main.tsx) so their
// @font-face rules live in a single stylesheet (no duplicate font downloads).

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import RouteMeta from "@/components/RouteMeta";
import QuietNav from "@/components/editorial/QuietNav";
import QuietHero from "@/components/editorial/QuietHero";
import TheFour from "@/components/editorial/TheFour";
import QuietContact from "@/components/editorial/QuietContact";
import QuietFooter from "@/components/editorial/QuietFooter";
import StickyHelpBar from "@/components/editorial/StickyHelpBar";
import CommandPalette from "@/components/editorial/CommandPalette";
import RecentClients from "@/components/editorial/RecentClients";
import { watchListReveals } from "@/lib/listReveal";
import "./Home.css";

// These rich below-the-hero sections keep their own chunks. The prerendered
// first response already carries the page's complete owner-facing meaning;
// splitting the interactive layer keeps every visit from paying for the full
// portfolio catalog and calculator before the hero is useful.
const OwnerPath = lazy(() => import("@/components/dataviz/OwnerPath"));
const MoneyLeakMeter = lazy(() => import("@/components/dataviz/MoneyLeakMeter"));

const DESKTOP_PROOF_QUERY = "(min-width: 48rem)";

function DesktopProofFallback({ kind }: { kind: "path" | "money" }) {
  const copy = kind === "path"
    ? {
        eyebrow: "LF / 03 · One accountable path",
        title: "Five handoffs. One customer waiting.",
        body: "Loading the connected customer path.",
      }
    : {
        eyebrow: "Your numbers · Local calculation",
        title: "What could missed inquiries cost you?",
        body: "Loading the private, in-browser calculator.",
      };

  return (
    <div
      className={`lf-home-proof-loading lf-home-proof-loading--${kind}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="lf-home-proof-loading__eyebrow">{copy.eyebrow}</p>
      <p className="lf-home-proof-loading__title">{copy.title}</p>
      <p className="lf-home-proof-loading__body">{copy.body}</p>
    </div>
  );
}

function useDesktopProofStory() {
  const [show, setShow] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia(DESKTOP_PROOF_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_PROOF_QUERY);
    const update = () => setShow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return show;
}

export default function Home() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const showDesktopProof = useDesktopProofStory();

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
        {showDesktopProof ? (
          <>
            <Suspense fallback={<DesktopProofFallback kind="path" />}>
              <OwnerPath />
            </Suspense>
            <TheFour />
            <Suspense fallback={<DesktopProofFallback kind="money" />}>
              <MoneyLeakMeter />
            </Suspense>
            <QuietContact />
          </>
        ) : (
          <>
            <QuietContact />
            <TheFour />
          </>
        )}
      </main>
      <StickyHelpBar />
      <QuietFooter />
      <CommandPalette />
    </div>
  );
}

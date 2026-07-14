import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/editorial/motion.css'
import App from './App.tsx'

/** Run at idle, or ASAP where requestIdleCallback is unavailable. */
function onIdle(fn: () => void, timeout = 1) {
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    window.requestIdleCallback(fn);
  } else {
    window.setTimeout(fn, timeout);
  }
}

if (typeof window !== "undefined") {
  // If the SEO snapshot already painted (normal prerendered load), flag it so
  // the hero skips its character-cascade re-animation — no visible "restart".
  const root = document.getElementById("root");
  if (root && root.children.length > 0) {
    document.documentElement.dataset.snap = "1";
  }

  // Analytics + attribution are not on the first-paint critical path, so keep
  // them out of the entry chunk and load them at idle. Attribution still runs
  // early enough to capture UTM/referrer before the visitor navigates away.
  onIdle(() => {
    void import("./lib/attribution").then((m) => m.captureAttribution());
    void import("./lib/analytics").then((m) => m.installAnalyticsHooks());
  });
}

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);

// Safari has no scroll-driven CSS animations, so restore the hero zoom drift
// with a rAF-throttled JS fallback (no-op on Chromium). Dynamically imported at
// idle so it neither competes with first paint nor sits in the entry chunk.
onIdle(() => {
  void import("./lib/heroParallax").then((m) => m.initHeroParallax());
}, 200);

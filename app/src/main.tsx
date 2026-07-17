import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
// The editorial foundation (fonts/tokens/base) is imported ONCE here, at the
// single entry, so it lands in the one global stylesheet. Previously both
// Home.tsx AND EditorialShell.tsx imported these, and both stylesheets load on
// the home route — so every @font-face was declared twice and each woff2 was
// fetched TWICE (~160KB of duplicate font transfer on first paint).
import './styles/editorial/fonts.css'
import './styles/editorial/tokens.css'
import './styles/editorial/base.css'
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

// Dismiss the tugboat splash (index.html) only once the site is actually
// COMPOSED — not at React's first render() call. We hold it until fonts are
// ready (no post-reveal text reflow) AND the real content has mounted
// (markAppReady, fired from the shell/Home effect after their route subtree
// commits), then let two frames settle so the reveal is one clean motion
// instead of the header/footer-then-content assembly you'd otherwise watch
// (worst in Safari, which schedules the lazy chunks independently).
//
// Lives in the bundle — the CSP is `script-src 'self'`, so no inline handler
// could do it. A MIN floor keeps it a graceful beat; a MAX cap guarantees it
// never hangs on a stalled resource; and index.html's CSS safety-dismiss is the
// last-resort backstop if this code never runs at all.
if (typeof document !== "undefined") {
  const MIN_MS = 500;
  // Cap the wait so a stalled asset can't trap the splash. Kept just under the
  // 6.5s CSS safety-dismiss so JS stays in control on any real (even slow) load.
  const MAX_MS = 6000;
  const start = performance.now();

  const twoFrames = () =>
    new Promise<void>((res) =>
      requestAnimationFrame(() => requestAnimationFrame(() => res())),
    );
  const timeout = (ms: number) =>
    new Promise<void>((res) => window.setTimeout(res, ms));
  const fontsReady =
    "fonts" in document ? document.fonts.ready.then(() => undefined) : Promise.resolve();

  void import("./lib/appReady").then(({ appReady }) => {
    // Composed = fonts loaded + content mounted; capped so a stalled asset can't
    // trap the splash.
    const composed = Promise.all([fontsReady, appReady]).then(() => undefined);
    Promise.race([composed, timeout(MAX_MS)])
      .then(twoFrames)
      .then(() => timeout(Math.max(0, MIN_MS - (performance.now() - start))))
      .then(() => {
        const el = document.getElementById("lf-boot");
        if (!el) return;
        el.classList.add("lf-boot--out");
        window.setTimeout(() => el.remove(), 460);
      });
  });
}

// Safari has no scroll-driven CSS animations, so restore the hero zoom drift
// with a rAF-throttled JS fallback (no-op on Chromium). Dynamically imported at
// idle so it neither competes with first paint nor sits in the entry chunk.
onIdle(() => {
  // WebKit intermittently rejects this dynamic import with "Importing a module
  // script failed" when the modulepreload hint and the import() race on cold
  // loads (~1 in 3 Safari first-visits). The parallax is a progressive
  // enhancement, so swallow the rejection (one silent retry) instead of leaking
  // an uncaught TypeError into the console / error monitoring.
  const loadParallax = () => import("./lib/heroParallax").then((m) => m.initHeroParallax());
  loadParallax().catch(() => {
    window.setTimeout(() => { void loadParallax().catch(() => {}); }, 300);
  });
}, 200);

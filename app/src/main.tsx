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

// Dismiss the tugboat splash (index.html) once the app has painted its first
// frame. Lives here in the bundle — the site CSP is `script-src 'self'`, so no
// inline handler could do it. A ~450ms floor keeps it a graceful beat rather
// than a jarring flash on fast loads; the CSS safety-dismiss is the backstop if
// this never runs.
if (typeof document !== "undefined") {
  const dismissBoot = () => {
    const el = document.getElementById("lf-boot");
    if (!el) return;
    const wait = Math.max(0, 450 - performance.now());
    window.setTimeout(() => {
      el.classList.add("lf-boot--out");
      window.setTimeout(() => el.remove(), 460);
    }, wait);
  };
  requestAnimationFrame(() => requestAnimationFrame(dismissBoot));
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

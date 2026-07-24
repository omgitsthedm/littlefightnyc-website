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
import './styles/editorial/primitives.css'
import './styles/editorial/motion.css'
// Last — neutralizes the scroll-reveal entrance states so the site loads
// "all at once" (see reveal-static.css). Imported after base/motion so it wins.
import './styles/editorial/reveal-static.css'
import App from './App.tsx'
import { ForceFieldProvider } from './kernel/ForceField'
import { getAnalyticsConsent, installConsentDefaults, onAnalyticsConsentChange } from './lib/consent'

/** Run at idle, or ASAP where requestIdleCallback is unavailable. */
function onIdle(fn: () => void, timeout = 1) {
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    window.requestIdleCallback(fn);
  } else {
    window.setTimeout(fn, timeout);
  }
}

if (typeof window !== "undefined") {
  // Privacy defaults have to exist before any analytics config or event. The
  // stored choice, if there is one, is applied synchronously here too.
  installConsentDefaults();

  // If the SEO snapshot already painted (normal prerendered load), flag it so
  // the hero skips its character-cascade re-animation — no visible "restart".
  const root = document.getElementById("root");
  if (root && root.children.length > 0) {
    document.documentElement.dataset.snap = "1";
  }

  // Analytics + attribution are not on the first-paint critical path, so keep
  // them out of the entry chunk and load them at idle. Campaign attribution is
  // measurement rather than essential storage, so it follows the same opt-in.
  onIdle(() => {
    void import("./lib/analytics").then((m) => m.installAnalyticsHooks());
    void import("./lib/rum").then((m) => m.installRum());

    const captureAttribution = () => {
      void import("./lib/attribution").then((m) => m.captureAttribution());
    };
    if (getAnalyticsConsent() === "granted") captureAttribution();
    onAnalyticsConsentChange((consent) => {
      if (consent === "granted") captureAttribution();
    });
  });
}

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);
root.render(
  <BrowserRouter>
    <ForceFieldProvider>
      <App />
    </ForceFieldProvider>
  </BrowserRouter>,
);

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

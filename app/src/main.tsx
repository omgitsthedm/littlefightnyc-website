import { createRoot, type Root } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/editorial/motion.css'
import App from './App.tsx'
import { installAnalyticsHooks } from './lib/analytics'
import { captureAttribution } from './lib/attribution'
import { initHeroParallax } from './lib/heroParallax'

function mountReact(rootEl: HTMLElement): Root {
  const root = createRoot(rootEl);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
  );
  return root;
}

function whenStylesReady(callback: () => void) {
  // The async stylesheet is marked ready by the inline onload handler. If it
  // already loaded (or if JS beat the load event), call back immediately.
  if (document.documentElement.classList.contains("lf-css-ready")) {
    callback();
    return;
  }
  const link = document.getElementById("lf-main-css") as HTMLLinkElement | null;
  if (!link || link.rel === "stylesheet" || link.sheet) {
    callback();
    return;
  }
  link.addEventListener("load", callback, { once: true });
  link.addEventListener("error", callback, { once: true });
  // Failsafe: never block hydration for more than 4s on a truly broken link.
  window.setTimeout(callback, 4000);
}

if (typeof window !== "undefined") {
  captureAttribution();
  // If the SEO snapshot already painted (normal prerendered load), flag it so
  // the hero skips its character-cascade re-animation — no visible "restart".
  const root = document.getElementById("root");
  if (root && root.children.length > 0) {
    document.documentElement.dataset.snap = "1";
  }
  if (window.requestIdleCallback) {
    window.requestIdleCallback(installAnalyticsHooks);
  } else {
    window.setTimeout(installAnalyticsHooks, 1);
  }
}

const rootEl = document.getElementById('root')!;
whenStylesReady(() => {
  mountReact(rootEl);

  // Safari has no scroll-driven CSS animations, so restore the hero zoom drift
  // with a rAF-throttled JS fallback (no-op on Chromium). Deferred to idle so it
  // never competes with first paint.
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => initHeroParallax());
  } else {
    window.setTimeout(() => initHeroParallax(), 200);
  }
});

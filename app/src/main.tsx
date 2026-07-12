import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/editorial/motion.css'
import App from './App.tsx'
import { installAnalyticsHooks } from './lib/analytics'
import { captureAttribution } from './lib/attribution'

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

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)

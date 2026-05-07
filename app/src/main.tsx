import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { installAnalyticsHooks } from './lib/analytics'

if (typeof window !== "undefined") {
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

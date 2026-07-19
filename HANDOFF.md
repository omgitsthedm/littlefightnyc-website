# HANDOFF — littlefightnyc.com
updated: 2026-07-19 (end of the Fortress Campaign session)

state: SITE-COMPLETE. 182 routes / 125 sitemap / 18 areas (5 boroughs) / en+es+zh
  / nationwide door / all QA audits passed or doctrine-accepted. Everything live
  on auto-deploy (main → Netlify). Session record: SESSION-2026-07-19-FORTRESS.md.
  Plan of record: FORTRESS.md (read it first, always).

next action (ONE): David runs ~/Desktop/LFNYC-PAPERWORK-RUNBOOK.md
  (Task 1 Bing Webmaster is the gate — site is absent from Bing/ChatGPT/Copilot
  until then).

claude follow-ups, gated: IndexNow wiring (after Bing) · reviews surface +
  aggregateRating (after 3-5 GBP reviews) · watchtower Mondays ("run the
  watchtower") → replicate winning doors from GSC data.

gotchas for the next session: canvas verification = computed display +
  offsetHeight AND readback, never readback alone · Lighthouse on a busy
  machine lies — CDP real-throttle is the method · never script-remove CSS
  rules by brace-hunting · seo-pages.json + site-areas.ts stay in lockstep ·
  hero-* og images ARE the rendered heroes (preloads depend on it) · the
  micro-interaction zooms use the composing `scale` property on purpose.

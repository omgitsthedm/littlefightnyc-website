# Handoff — 2026-07-14 · Cross-browser quality + session repair

OBJECTIVE
Pick up the interrupted Kimi/Codex work, ship the Fit Check→Tech Audit rename +
PWA lane, reposition the "who answers" copy, and fix the site's Safari/WebKit
rendering, scroll, spacing, and load so it reads as a $100k flagship on every platform.

CURRENT STATE
main @ `49a1d17`, clean + synced. littlefightnyc.com auto-deploys from main (~30s);
latest is LIVE. Full WebKit sweep (14 routes × 2 viewports) = 0 console errors,
0 overflow, 0 failures. agency-status: house in order.

COMPLETED (all live)
- Repaired the broken working tree (usePwaInstall TS error, PwaInstallPrompt lint).
- Fit Check→Tech Audit rename finished (ask.mts front-facing copy, tech-audit-schema.sql,
  dead-code Supabase REST paths, dropped FIT_CHECK_ env shims).
- "Who answers" repositioned company-first (FounderCard + prerender founderBlock;
  David stays only on /about/).
- PWA manifest drift fixed (prerender clobbered the enriched manifest) + un-ignored
  public PNGs so Netlify ships icons/screenshots/startup images.
- Wave 1 Safari rendering: autoprefixer + browserslist (now owns vendor prefixing);
  solid fallbacks before every color-mix() card/chrome background; oklch→srgb borders.
- Wave 2: lazy-loaded install prompt (site was already well-optimized; mobile LH 96).
- Wave 3: disabled fixed mix-blend grain on (pointer:coarse); throttled AmbientField to 28 nodes on touch.
- Wave 4: routed 7 hand-rolled pages through .lf-container (gutter alignment); nav pill 40→44px.
- Wave 5: --lf-text-2xs token + inline label migration; removed dead opsz + empty media blocks.
- Wave 6: removed Safari-only hanging-punctuation (broke left edges on Safari only).
- H2: lib/heroParallax.ts — Safari fallback for the Chrome-only scroll-driven hero zoom.

REMAINING (deliberately NOT done — judgment calls, not defects)
- createRoot→hydrateRoot SSR rewrite: high risk to the 178-route prerender/SEO for a
  Lighthouse metric on an already-fast site. Not worth breaking working code.
- site.ts un-barrel: idle-loaded, doesn't gate LCP — high churn, no load-feel gain.
- Full CSS label-size unification / <SectionLabel> extraction / motion-token migration:
  invisible internal churn; size-unification would risk visible inconsistency.

David-gated (cannot be code-fixed — see MASTER-PLAN doc §Standing): GSC token, sameAs
handles (IG/Yelp/GBP, not LinkedIn), registered streetAddress, GBP listing work,
AHA/PHC/Rachel honesty confirmations, consent policy, DataForSEO key.

FILES CHANGED
See commits 103bf6c…49a1d17 (plus fa5c487 PWA assets, fbe6056 manifest, a108146 repair+rename).
Key new: app/src/lib/heroParallax.ts, app/postcss.config.js, _qa/MASTER-PLAN-CROSSBROWSER-QUALITY-2026-07-14.md.

DECISIONS
- littlefightnyc.com IS auto-deploy from GitHub main (NOT manual — the general LiFi
  manual-deploy rule does not apply here; see repo CLAUDE.md).
- Tech Audit Supabase path is unwired dead code; live leads = Netlify Forms → /thanks/.
  So the DB "rename" was code-only (no live table exists).
- theme-color on macOS Safari desktop: WebKit ignores it entirely — not fixable there
  (works on iOS Safari + Chrome).

RISKS
- Color-mix solid fallbacks target Safari <16.2, which NO headless engine reproduces.
  Verified on current WebKit only; real-device confirmation is required.

VALIDATION
npm run build (178 routes) + npm run lint green on every wave. Live WebKit sweep clean.
heroParallax verified tracking scroll (scale 1.032→1.050) with the CSS animation isolated.

NEXT ACTION
David does a physical iPhone/iPad Safari pass on the live site (scroll smoothness +
card/header fills + hero drift). Report exact page+section for anything still off.

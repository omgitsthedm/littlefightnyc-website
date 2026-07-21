# Session Record — 2026-07-20 — Audit, Conversion, and Layout Closeout

## Objective

Finish the full production audit, stop the mobile reload failure, remove stale
or risky code, strengthen the client-acquisition path, repair the shared contact
block, and rebuild the page system so structured content uses modern,
density-aware layouts instead of unexplained editorial dead space.

## Final state

- Application release: `fb61c526bf4e446d585cf70a41aa865500202885`
  (`Redesign sitewide page layouts`).
- Canonical branch: `main`.
- GitHub: `omgitsthedm/littlefightnyc-website`.
- Netlify: project `littlefightnyc`, production `https://littlefightnyc.com`.
- Canonical Git deploy: `6a5e55378669530008288a16`, state `ready`, commit
  reference `fb61c52`.
- Live application asset at closeout: `/assets/index-DR6AtTk9.js` on both the
  apex and `www` domains.
- Worktree, `origin/main`, and GitHub `main` were identical before this
  documentation-only closeout.

## What shipped

### Mobile stability and runtime audit

- Found the mobile “crash and reload” cause: the service-worker update path
  took control of an open tab and forced a reload on `controllerchange`.
- Removed forced activation/reload behavior. Updates now wait for controlled
  tabs to close and activate on a normal future visit.
- Hardened chunk-load recovery so Safari gets at most one guarded recovery
  attempt; blocked storage falls back to the branded error surface instead of
  entering a reload loop.
- Added `audit:mobile-lifecycle` as a regression ratchet.
- Removed confirmed dead runtime modules, duplicate interactive marquee links,
  stale data/helpers, and ineffective analytics splitting.
- Changed prerender preloads so each route fetches only critical site data.

Primary commits: `3815446`, `b01a483`, `13b5293`.

### Repository, measurement, and privacy hardening

- Removed 107 deployment-inactive legacy HTML files plus their retired root
  CSS, JavaScript, generators, and old static runtime. Recovery remains on
  `archive/old-static-main-20260630`.
- Added a repository-boundary audit so the retired tree cannot quietly return.
- Added privacy-first analytics consent: GA4, Clarity, TikTok, attribution, and
  RUM remain off unless a visitor chooses analytics. The choice is reopened
  from the footer and Privacy page; it no longer interrupts first arrival.
- Added sanitized real-user monitoring and documented conversion events,
  release checks, and the monthly lead-delivery proof loop.
- Removed the public “Site update ready / Refresh now” takeover. Service-worker
  updates remain passive.
- Removed the retired Twilio voice webhook from deployable source while keeping
  the public phone number as a normal `tel:` contact path.

Primary commits: `4212ba2`, `7e95134`, `0a1dde9`.

### Client-acquisition improvements

- Put shipped proof directly after the homepage hero.
- Shortened the high-intent website inquiry path and clarified website-fit
  proof, founder accountability, and primary calls to action.
- Added honest client-proof collection, conversion measurement, and search
  acquisition runbooks. No testimonials or outcome metrics were invented.
- Increased spacing between the primary-nav phone number and “Start a project.”
- Preloaded the Tech Audit LCP image, right-sized proof/founder/example imagery,
  tightened long SEO titles, improved the CRM glossary description, removed
  unreachable redirect duplicates, and moved Lighthouse off retired
  `/field-guide/` to `/examples/`.

Primary commits: `1fefc3c`, `87e7738`, `0a1dde9`.

### Shared contact block

- Opened the vertical rhythm around “Start with the right next step.”
- Removed the unwanted divider between contact cards and promise cards.
- Restored consistent row and baseline alignment across Call, Text, Email,
  Form, and the four service promises.
- Verified the shared component on the homepage, Contact, and a service page at
  mobile and desktop widths.

Primary commits: `e8eec05`, `5b1a5b9`, `2d14557`.

### Sitewide density-aware layout system

- Added `app/src/styles/editorial/tiled-layout.css` as the shared composition
  layer for structured editorial routes.
- Rebuilt service, area, About, Nationwide, glossary/detail, legal, answer, and
  service-area templates around content density instead of fixed left columns.
- Replaced the decorative service montage with a clear 2x2 service card system.
- Set four-item groups as 2x2 grids, three-item groups as three columns, and
  two-item groups as paired rows when the content supports it.
- Reworked Areas and Studio into proper grids; Examples now resolves as a
  balanced four-plus-three composition.
- Added grid behavior to FAQ, related-content, stepper, proof, and contact
  patterns while preserving readable single-column measure for real long-form
  prose.

Primary commit: `fb61c52` (28 files, 1,119 insertions, 856 deletions).

## Design decision now on record

The 2026-07-17 note that “left-hugging is not a bug” is historical context, not
an unconditional layout rule. The current rule is:

- asymmetry must have a compositional reason;
- sparse structured content should tile instead of stranding half a viewport;
- dense information gets more room, not tighter cards;
- four related items default to a 2x2 grid, three to columns, and two to a row;
- long-form reading remains constrained to a comfortable measure;
- a full-bleed image must belong to the adjacent story, not feel like a page
  break.

## Validation

Final frozen application build passed:

- `npm run lint`.
- `npm run build` — 182 prerendered SEO/AEO routes.
- `npm run audit:signal`.
- `npm run audit:mobile-lifecycle`.
- `npm run audit:repo-boundary`.
- `git diff --check`.

Layout regression coverage:

- 125 sitemap routes across 1440px, 820px, and 390px: 375 captures.
- Average and minimum Site Lab score: 100/100.
- Axe violation nodes: 0.
- Horizontal-overflow captures: 0.
- Console errors: 0.
- Risk flags: 0.
- Missing alt text across captures: 0.
- Additional service-area checks passed at 390px, 768px, 1024px, and 1440px.

Live production checks:

- Homepage and seven representative route families returned HTTP 200.
- `www.littlefightnyc.com` canonicalized to the apex domain.
- `audit.littlefightnyc.com` returned the required 301 to `/tech-audit/`.
- Homepage, Contact, and Custom Local Websites passed real-browser checks at
  390px and 1440px with no horizontal overflow.
- Browser console: 0 errors, 0 warnings.
- Netlify Lighthouse: Performance 90; Accessibility, Best Practices, SEO, and
  PWA 100.

## Deployment note

This repository auto-deploys from GitHub `main`; that remains the only supported
release workflow. A manual production deploy (`6a5e55414c289918a35dcd89`) was
also run during this pass. Netlify's canonical Git deploy completed immediately
after it with commit reference `fb61c52`, and both produced the same live asset
fingerprint, so no source/live divergence remains. Do not repeat the manual
deploy on future releases.

## Remaining work

No blocking code or production work remains from this pass. The next leverage is
external acquisition work already documented in:

- `SEARCH-ACQUISITION-RUNBOOK.md`.
- `CLIENT-PROOF-COLLECTION.md`.
- `CONVERSION-MEASUREMENT.md`.
- `~/Desktop/LFNYC-PAPERWORK-RUNBOOK.md`.

The first next action remains the authenticated Bing/Business Profile/paperwork
work, not another redesign pass.

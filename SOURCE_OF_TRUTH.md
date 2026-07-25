# Little Fight NYC — Source of Truth

Last verified: 2026-07-24 (canonical Git path, GitHub `main`, ready Netlify
deploy, and the live apex/`www` revision re-verified).

This repository (`Little Fight NYC Business/Website/littlefightnyc-website/`) is THE source of truth for
`https://littlefightnyc.com`. Branch **`main` is canonical** and the site **auto-deploys
from `main`**.

## Production Linkage

- Netlify site name: `littlefightnyc`
- Netlify site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`
- Netlify config: `netlify.toml`
- Build command: `cd app && npm ci && npm run build`
- Publish directory: `app/dist`
- **Deploy mechanism: GitHub `main` → Netlify auto-build → auto-publish.**
  (As of 2026-06-30 `main` equals the live source; pushing `main` deploys production.)
- Production application release
  `df7c90ded191d909648ed86401fc5816809648ec` (`df7c90d`) is the verified
  ready Netlify release currently served on the apex and `www` domains.
- `df7c90d` is the current last-known-good production rollback point.

## Current local candidate — not production

The local `main` candidate is based on `df7c90d`. It is not the live release
and has not been authorized, pushed, or deployed. Inspect local `HEAD`,
`origin/main`, and Netlify before describing its exact state.

The candidate currently includes:

- a Quality Spine in `.lifi/` and the five standard quality command lanes;
- a Node 24 pin through `.nvmrc` and package engine declarations;
- a four-project Playwright browser suite with axe checks, mobile scroll
  stability, form-validation coverage, and indexed-route first-response versus
  hydrated-H1 parity;
- generated share-card identity and route-level social metadata work;
- route metadata, prerender, and H1-parity corrections.

The integrated candidate passed `quality:release` from a clean commit under
Node 24.18.0, including **32/32 browser checks** across Chromium, Firefox, and
WebKit plus revision-matched release-artifact validation. That is local
candidate evidence, not production approval. Every future handoff or release
must repeat the exact-commit gate and perform revision-matched live
verification after an authorized push.

## Deploy workflow (the only one you need)

1. Edit the app under `app/` (see Current Source).
2. Use Node 24 and run the quality lane appropriate to the change. A release
   candidate requires `npm run quality:release`, including the browser suite.
3. Record unresolved owner, external, form-delivery, analytics/search, rights,
   and research gates rather than treating them as code passes.
4. Commit the verified local candidate; local commits do not deploy.
5. After explicit production authorization, push the exact commit to `main`.
6. Netlify builds `app/dist` from `main` and publishes to littlefightnyc.com.
7. Verify the ready deploy, live revision, priority routes, and applicable
   external delivery paths before announcing release.

Manual `netlify deploy --prod` is no longer required and should be avoided — it
re-introduces the main-vs-live divergence that caused the 2026-06-30 incident.

## Current Source

Edit the React/Vite app in `app/`:

- `app/src/**`
- `app/public/**`
- `app/index.html`
- `app/scripts/prerender-seo.mjs`
- `app/package.json`
- `app/playwright.config.ts` / `app/tests/**`

Root files that still matter:

- `netlify.toml`
- `netlify/functions/**` and `netlify/functions/lib/**` — the live Website
  Audit uses eight public/background/scheduled function surfaces, shared
  helpers, Netlify Blobs, email delivery, and optional provider integrations
- `.netlify/state.json`
- `.nvmrc`
- `.lifi/**`
- `AGENTS.md` / `CLAUDE.md` / `HANDOFF.md` /
  `SITE-REINVENTION-DOSSIER.md`

Generated output:

- `app/dist/**` is build output (gitignored). Do not hand-edit.

The former Twilio webhook and AI phone agent are retired and are **not a
service**. The public number is an ordinary `tel:`/`sms:` path; after-hours
callers leave a normal message. Do not restore or advertise AI phone-answering
behavior without a new, explicit business and technical decision.

## Secrets

- `app/.env` is gitignored. Never commit secrets. Public build configuration such as
  analytics IDs belongs in Netlify environment variables.

## History / archives (2026-06-30 consolidation)

- The previous `main` (an unrelated OLD static site) is preserved on branch
  `archive/old-static-main-20260630` — NOT deleted.
- Stale local clones were moved to `Brand/_archive_littlefightnyc_20260630/`.
- Full mirror of the live site at consolidation time:
  `Brand/_littlefightnyc-LIVE-backup-20260630/`.
- Netlify deploy history is intact (`netlify api restoreSiteDeploy` to roll back).
- On 2026-07-20, the 107 inactive HTML files, root-level CSS/JS runtime, and
  static-site generators were removed from `main`. They were never in the
  `app/dist` publish path and remain recoverable on
  `archive/old-static-main-20260630`.

## Incident lesson (2026-06-30)

The site had been published via MANUAL Netlify deploys while git `main` held a stale,
unrelated static site that ALSO auto-deployed. A push to `main` auto-deployed the stale
version over the manual production build, so the site briefly showed the old version.
Fixed by making `main` the canonical source so git and live can never diverge again.
Before touching production, always confirm `main` builds and matches live.

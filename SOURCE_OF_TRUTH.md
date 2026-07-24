# Little Fight NYC — Source of Truth

Last verified: 2026-07-24 (canonical Git path and clean worktree re-verified
before the Brand Kit v2 implementation).

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
- Application release `fb61c52` was verified on GitHub, in a `ready` Netlify
  Git deploy with the same commit reference, and on the live apex/`www` domains
  on 2026-07-20. See
  `SESSION-2026-07-20-AUDIT-CONVERSION-LAYOUT-CLOSEOUT.md`.

## Deploy workflow (the only one you need)

1. Edit the app under `app/` (see Current Source).
2. `cd app && npm run build` to sanity-check locally.
3. `git add -A && git commit && git push origin main`.
4. Netlify builds `app/dist` from `main` and publishes to littlefightnyc.com automatically.
5. Verify the live URL.

Manual `netlify deploy --prod` is no longer required and should be avoided — it
re-introduces the main-vs-live divergence that caused the 2026-06-30 incident.

## Current Source

Edit the React/Vite app in `app/`:

- `app/src/**`
- `app/public/**`
- `app/index.html`
- `app/scripts/prerender-seo.mjs`
- `app/package.json`

Root files that still matter:

- `netlify.toml`
- `netlify/functions/**` if a future serverless feature is intentionally added
- `.netlify/state.json`
- `AGENTS.md` / `CLAUDE.md` / `HANDOFF.md`

Generated output:

- `app/dist/**` is build output (gitignored). Do not hand-edit.

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

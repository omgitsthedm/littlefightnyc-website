# Little Fight NYC source of truth

Last verified: 2026-08-01

This file routes agents to the current website source. Recheck point-in-time deploy and commit IDs before a production release.

## Canonical map

| Field | Verified value |
| --- | --- |
| Property | Little Fight NYC website and embedded supporting experiences |
| Production URL | `https://littlefightnyc.com` |
| Netlify URL | `https://littlefightnyc.netlify.app` |
| Current domain alias | `https://hey.littlefightnyc.com` |
| Netlify site | `littlefightnyc` |
| Netlify site ID | `0907d8fe-7018-48db-a6be-1f906e4b2619` |
| Production deploy | Resolve from Netlify before release; do not pin stale IDs here |
| Deployed application commit | Resolve from `/release.json` and Netlify before release |
| GitHub | `https://github.com/omgitsthedm/littlefightnyc-website` |
| Default and production branch | `main` |
| Canonical local checkout | `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website` |
| Netlify configuration | `netlify.toml` |
| Build command | `cd app && npm ci && cd .. && npm run typecheck:functions && npm --prefix app run build` |
| Publish directory | `app/dist` |

## Deployment relationship

GitHub `main` is the canonical source and Netlify production branch. Source pushes to `main` can auto-build and auto-publish. Manual production deploys are not part of the supported workflow.

Documentation-only housekeeping commits may intentionally advance GitHub `main` beyond the deployed application commit. The most recent commit in such a push must contain `[skip netlify]`, and the operator must verify that the production deploy ID and live fingerprint did not change. Do not mistake a skipped documentation commit for source drift.

For an authorized application release:

1. Confirm the candidate commit, clean worktree, GitHub relationship, and Netlify site ID.
2. Run `npm run quality:release` under Node 24.
3. Push the exact authorized commit to `main`.
4. Wait for that exact commit to reach a ready production deploy.
5. Run `npm run quality:live` and verify representative routes and any authorized external delivery path.

Do not use `netlify deploy --prod`, relink the site, or change domains, DNS, build settings, environment variables, or the production branch as part of routine work.

## Current source

- React/Vite application: `app/src/**`, `app/public/**`, `app/index.html`
- Build and verification scripts: `app/scripts/**`, `app/tests/**`, `app/playwright.config.ts`
- Live serverless surfaces: `netlify/functions/**`
- Deployment configuration: `netlify.toml`
- Quality contract: `.lifi/quality.yml`
- Generated output: `app/dist/**`, ignored and reproducible

The current visual system is Axiom Momentum. Read `app/DESIGN.md` for its contract and `app/src/styles/editorial/tokens.css` for implemented values. Do not use the removed historical design files as current direction.

The Website Audit has live function, storage, email, and optional provider surfaces. Routine tests must not create external side effects. Local environment files and secrets are never source.

The former AI phone agent is retired. Public phone actions are ordinary `tel:` and `sms:` paths.

## On-demand business and brand evidence

These files remain current but are not mandatory startup reading:

- `VOICE.md`: approved voice and claim boundaries
- `canva_brand_kit_little_fight_nyc.md`: brand-kit evidence
- `CLIENT-PROOF-COLLECTION.md`: private client-proof collection rules
- `CONVERSION-MEASUREMENT.md`: measurement contract
- `SEARCH-ACQUISITION-RUNBOOK.md`: search operating procedure
- `OFF_DOMAIN_PLAYBOOK.md`: off-domain acquisition procedure
- `PLACEHOLDERS.md`: unresolved owner-supplied values

Read only the document relevant to the task.

## Recovery

- The active GitHub repository carries only the production branch and current
  source. Legacy branches and standalone Audit/Lab checkouts are not sources.
- Normal source recovery uses verified current Git history. Production rollback
  is a new Git release; historical Netlify deploys are not recovery sources.

Independent Little Fight Lab, brand, template, demo, and experiment repositories are separate fleet properties or cold storage. This website repository must not absorb or replace them without an explicit source-map change.

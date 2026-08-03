# Little Fight NYC source of truth

Last source verification: 2026-08-03

This file routes agents to the current website source. The Dakota consolidation
was verified live on 2026-08-03: the marketing site and private Dakota desk use
one GitHub repository, one build, and one Netlify production property. Recheck
the point-in-time deploy, commit, Identity configuration, Blob state, and custom
domain attachment before a future production release.

## Canonical map

| Field | Verified value |
| --- | --- |
| Property | Little Fight NYC website, private Dakota desk, and embedded supporting experiences |
| Production URL | `https://littlefightnyc.com` |
| Netlify URL | `https://littlefightnyc.netlify.app` |
| Current domain alias | `https://hey.littlefightnyc.com` |
| Dakota primary host | `https://www.dakota.littlefightnyc.com` |
| Dakota redirect host | `https://dakota.littlefightnyc.com` |
| Dakota operator route | `/app/` |
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

There is one canonical website repository, build, and Netlify production
property. The Dakota hosts and `littlefightnyc.com` must resolve to the same
site ID above. The former standalone Dakota Netlify property was deleted after
the verified cutover. Its preserved local checkout is historical material only:
it is not a source, build, deployment target, or rollback path and must not
receive new product work.

## Deployment relationship

GitHub `main` is the canonical source and Netlify production branch. Source pushes to `main` can auto-build and auto-publish. Manual production deploys are not part of the supported workflow.

Documentation-only housekeeping commits may intentionally advance GitHub `main` beyond the deployed application commit. The most recent commit in such a push must contain `[skip netlify]`, and the operator must verify that the production deploy ID and live fingerprint did not change. Do not mistake a skipped documentation commit for source drift.

For an authorized application release:

1. Confirm the candidate commit, clean worktree, GitHub relationship, and Netlify site ID.
2. Run `npm run quality:release` under Node 24. This includes the Dakota unit
   and server-contract suite through `npm run test:dakota`.
3. Push the exact authorized commit to `main`.
4. Wait for that exact commit to reach a ready production deploy.
5. Run `npm run quality:live` and verify representative public routes plus the
   authorized Dakota host, Identity, queue, and operator-state paths without
   exposing or submitting prospect data.

Do not use `netlify deploy --prod`, relink the site, or change domains, DNS, build settings, environment variables, or the production branch as part of routine work.

## Current source

- React/Vite application: `app/src/**`, `app/public/**`, `app/index.html`, `app/dakota.html`
- Dakota private browser entry: `app/src/dakota/**`
- Build and verification scripts: `app/scripts/**`, `app/tests/**`, `app/playwright.config.ts`
- Live serverless surfaces: `netlify/functions/**`
- Deployment configuration: `netlify.toml`
- Quality contract: `.lifi/quality.yml`
- Generated output: `app/dist/**`, ignored and reproducible

The current visual system is Axiom Momentum. Read `app/DESIGN.md` for its contract and `app/src/styles/editorial/tokens.css` for implemented values. Do not use the removed historical design files as current direction.

The Website Audit has live function, storage, email, and optional provider surfaces. Routine tests must not create external side effects. Local environment files and secrets are never source.

The former AI phone agent is retired. Public phone actions are ordinary `tel:` and `sms:` paths.

## Dakota architecture and private boundary

Dakota is a private second HTML entry in the canonical Vite build, served at
`/app/` and the two Dakota hosts above. It intentionally does not join the
public marketing React Router shell, analytics boot, consent interface,
prerender catalog, sitemap, or service-worker cache. Its static assets contain
no candidate or operator data and its document is `noindex` and `no-store`.

Access uses Netlify Identity on the canonical site. The only accepted identity
is normalized email `hello@littlefightnyc.com` with the server-controlled role
`dakota_operator`. The browser gate is presentation; these server functions are
the security boundary:

- `identity-signup`, `identity-login`, and `identity-validate`: exact-account
  Identity lifecycle enforcement and role assignment
- `dakota-publish` at `/api/dakota/publish`: HMAC-signed, replay-protected queue
  ingestion using protected environment variable `DAKOTA_PUBLISH_TOKEN`
- `dakota-queue` at `/api/dakota/queue`: exact-email-and-role private queue read
- `dakota-operator-state` at `/api/dakota/operator-state`: exact-email-and-role
  bounded private state read/write with same-origin write enforcement

Netlify Blobs are site-scoped. Queue store `dakota-private` uses key
`current/v1` and replay prefix `replay/v1/`; operator store
`dakota-operator-state` uses key `state/v1`. Identity users, roles, sessions,
Blob data, the publisher secret, and custom-domain attachment must be verified
against site ID `0907d8fe-7018-48db-a6be-1f906e4b2619`; they do not migrate
because source files moved.

The research engine is deliberately not part of the deployed website. Its
private repository is
`/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Internal/dakota-2`,
and runtime SQLite, queues, snapshots, and logs stay outside Git under
`~/Library/Application Support/LiFi NYC/Dakota 2.0`. The engine performs
bounded read-only public-source research and publishes only a validated,
signed queue of at most ten records. Dakota has no automatic outreach path and
must not send email, SMS, calls, forms, or CRM writes.

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
- The former standalone Dakota dashboard checkout is historical material only,
  not a recovery or development source. Its Netlify project has been deleted.
  Recover the web surface through this repository and the site ID above; keep
  the separate private engine boundary intact.
- Normal source recovery uses verified current Git history. Production rollback
  is a new Git release; historical Netlify deploys are not recovery sources.

Independent Little Fight Lab, brand, template, demo, and experiment repositories are separate fleet properties or cold storage. This website repository must not absorb or replace them without an explicit source-map change.

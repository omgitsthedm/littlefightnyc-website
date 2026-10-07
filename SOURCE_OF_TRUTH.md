# Little Fight NYC source of truth

Last source verification: 2026-10-02 (owner-directed tile website release candidate)

This file routes agents to the current website source. The marketing site and
public VERA browser product use one public website repository, one build, and
one Netlify production property. VERA's separate engine publishes only
sanitized upstream data. Recheck the point-in-time deploy, commit, and
custom-domain attachment before a future production release.

## Canonical map

| Field | Verified value |
| --- | --- |
| Property | Little Fight NYC website, public VERA product, and embedded supporting experiences |
| Production URL | `https://littlefightnyc.com` |
| VERA public product | `https://littlefightnyc.com/vera/` |
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

There is one canonical website repository, build, and Netlify production
property. The VERA route and `littlefightnyc.com` must resolve to the same site
ID above. The former sales product and the `vera-pipeline` property are
historical material only: they are not sources, builds, deployment targets, or
rollback paths and must not receive new product work.

## Deployment relationship

GitHub `main` is the canonical source and Netlify production branch. Source pushes to `main` can auto-build and auto-publish. Manual production deploys are not part of the supported workflow.

Documentation-only housekeeping commits may intentionally advance GitHub `main` beyond the deployed application commit. The most recent commit in such a push must contain `[skip netlify]`, and the operator must verify that the production deploy ID and live fingerprint did not change. Do not mistake a skipped documentation commit for source drift.

For an authorized application release:

1. Confirm the candidate commit, clean worktree, GitHub relationship, and Netlify site ID.
2. Run `npm run quality:release` under Node 24.
3. Push the exact authorized commit to `main`.
4. Wait for that exact commit to reach a ready production deploy.
5. Run `npm run quality:live` to verify the exact revision and representative public routes.

Do not use `netlify deploy --prod`, relink the site, or change domains, DNS, build settings, environment variables, or the production branch as part of routine work.

## Current source

- Static tile website: `app/preview-content/**`, `app/preview-ui/**`, `app/scripts/build-tile-preview.py`
- Progressive intake, contact and consent islands: `app/src/tile-bridge/**`
- Preserved applications and supporting source: `app/public/**`, `app/src/**`
- Build and verification scripts: `app/scripts/**`, `app/tests/**`, `app/playwright.config.ts`
- Live serverless surfaces: `netlify/functions/**`
- Deployment configuration: `netlify.toml`
- Quality contract: `.lifi/quality.yml`
- Generated output: `app/dist/**`, ignored and reproducible

The current marketing direction is the owner-approved Soft Mineral + Edge Light tile mosaic. Its source contract is `app/preview-content/import-provenance.json`; implemented styles and physical tile motion live in `app/preview-ui/**`. Preserve all 110 original tile destinations and the original desktop/mobile square-unit geometry. Older React styles support the retained intake islands only; they are not the marketing design authority.

The construction showcase at `/construction/` uses dedicated, shareable readers at
`/labs/<slug>/`. Working experiences remain at `/examples/lab/concepts/<slug>/` and
load only when their reader opens. The Cabinet Lab is an isolated presentation
derivative of an existing test project.
Farm House retains the `/labs/house-explorer/` route and presents the original
Farm House geometry, materials, grounds, camera views, and lighting. Its sanitized
Inside and Find tools present construction geometry and illustrative service routes.
The presentation source and pinned import/check tools live under
`app/scripts/property-explorer/`. Public output excludes addresses, source drawings,
records, maps, and private project references. The original Farm House project and
standalone deployment remain unchanged.
Both studies are authorized for this showcase on 2026-10-06. Upstream private projects
remain separate and unchanged. Inclusion does not turn a design study into a client
result, measured plan, estimate, or connected business system.

The Website Audit has live function, storage, email, and optional provider surfaces. Routine tests must not create external side effects. Local environment files and secrets are never source.

The former AI phone agent is retired. Public phone actions are ordinary `tel:` and `sms:` paths.

## VERA public demo product

VERA is David's working Little Fight product and a public demonstration of
custom software at `https://littlefightnyc.com/vera/`. Its complete browser
surface, metadata, privacy and terms pages, and PWA shell live under
`app/public/vera/**`; its public rewrites, audits, and browser coverage live in
`app/public/_redirects`, `app/scripts/**`, and `app/tests/**`. The resulting
browser product publishes on the canonical Little Fight Netlify site ID above.

The browser reads only first-party endpoints under `/vera/data/`. Exact forced
rewrites in `app/public/_redirects` proxy `public.json`, `archive.json`, and
`meta.json` from the VERA engine's sanitized GitHub Actions `feed` branch. That
branch is upstream publication output, not a second website or Netlify product.
Private/raw hunt data, contacts, working notes, credentials, and engine state
must never enter this repository, its Netlify property, or a browser response.

Publication delivery has three deliberate resilience layers: the browser uses
one same-origin Little Fight URL; the VERA Netlify edge middleware keeps a
short shared cache with a bounded stale-while-revalidate safety window; and the
VERA service worker retains only the last validated public JSON publication for
an explicitly labeled offline fallback. Browser conditional requests must not
surface a bodyless `304` to the app, and errors must never replace either cache.
The generated publication timestamp remains the freshness truth at every layer.

The former `vera-pipeline` Netlify project and `vera-dashboard` checkout are not
runtime dependencies or deployment targets. Do not restore their browser feed
fallback, proxy routes, CSP exceptions, scheduled Mac deploy, or standalone UI.

VERA's restartable cross-repository operating map is maintained in
[`VERA-HANDOFF.md`](https://github.com/omgitsthedm/vera-apartment-search/blob/main/VERA-HANDOFF.md).
Use it to locate the engine, sanitized publication contract, schedules, release
rail, recovery boundary, and current verification commands without reviving a
retired standalone property.

Durable public-product release evidence lives outside the deployed
`app/public/**` tree under the repository's declared evidence registry,
`.lifi/evidence/releases/<release-id>/`. The VERA 2.0 closeout is
`.lifi/evidence/releases/vera-2.0-2026-08-13/`; it records the exact production
revision, decision, verification, rollback, supply-chain evidence, and dated
observation work without publishing private engine material. Do not create a
top-level `docs/` tree: the repository-boundary audit reserves that retired
path.

## Retired product boundary

The former private sales product is retired by the owner. The approved release
removed its browser entry, Identity flow, product server functions, scheduled
work, public assets, and operating contract. Legacy paths and former hosts return
a plain HTTP 410 response. Canonical legacy paths have noindex and no-store;
this correction release also applies those headers to the exact former hosts.
Three minimal Identity rejection handlers remain solely to deny login, signup,
and validation without storage or provider calls. They have no schedules or
product behavior; account settings and existing records stay untouched.
Do not restore or rebuild that product. Historical stored records are preserved.

This correction release distinguishes complete, partial, and unavailable audit
measurements in the report, email, and browser handoff. The LFNYC OpenSEO Google
project has PageSpeed enabled with a dedicated PageSpeed-only key. Its value is
stored as a production Functions-only Netlify secret and never in this repository.
The owner approved setup and publication on 2026-09-27. Verify the deployed
revision and a real measured audit before calling the live correction complete.
Current release and runtime evidence are recorded in the existing desktop growth
evidence ledger; do not infer publication from a local commit or passing build.

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
- The former standalone sales dashboard checkout is historical material only,
  not a recovery or development source. Do not restore it through this
  repository or the current Netlify property.
- Normal source recovery uses verified current Git history. Production rollback
  is a new Git release; historical Netlify deploys are not recovery sources.

Independent Little Fight Lab, brand, template, demo, and experiment repositories are separate fleet properties or cold storage. This website repository must not absorb or replace them without an explicit source-map change.

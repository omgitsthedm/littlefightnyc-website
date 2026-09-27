# Little Fight NYC agent contract

## Canonical route

- Physical root: `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website`
- GitHub: `omgitsthedm/littlefightnyc-website`
- Production branch: `main`
- Netlify site: `littlefightnyc` (`0907d8fe-7018-48db-a6be-1f906e4b2619`)
- Production: `https://littlefightnyc.com`

Resolve current deploys, aliases, private routes, and recovery records from
`SOURCE_OF_TRUTH.md` and live evidence. Do not pin mutable deploy IDs here. Do not route work
to old Little Fight, Lab, brand-kit, template, demo, or experiment checkouts.

## Before work

```bash
pwd -P
git rev-parse --show-toplevel
git status --short --branch
```

Check remotes or worktrees only when routing looks wrong. Preserve unrelated work; never
reset, clean, or stash it.

Open only what the task needs:

- Deployment or routing: `SOURCE_OF_TRUTH.md` and `netlify.toml`
- Product or visual work: `app/DESIGN.md`, then `app/src/styles/editorial/tokens.css`
- Voice or public claims: `VOICE.md` and the relevant business policy
- Quality behavior: `.lifi/quality.yml`, the applicable package script, and the failing test

Do not load history, recovery branches, evidence folders, or all Markdown at startup.

## Source and safety

- Application: `app/src/**`, `app/public/**`, `app/index.html`
- Tests and build tooling: `app/scripts/**`, `app/tests/**`, `app/playwright.config.ts`
- Serverless code: `netlify/functions/**`
- Deployment and quality: `netlify.toml`, `.lifi/**`
- Generated output: `app/dist/**`; never hand-edit or commit it

Never inspect, expose, or commit secrets, local environment files, credentials, private form
data, provider payloads, or Netlify tokens. Website Audit functions can send email, write
Blobs, or call providers; routine tests must remain read-only. Do not submit production forms
without explicit authorization.

The former private sales product is retired. Do not restore its browser entry,
Identity flow, server functions, schedules, hosts, assets, or instructions. Legacy
URLs must stay on the plain retirement response. Historical records stay outside
the active website source and release scope.

The retired AI phone agent is not a current service. Public phone actions are ordinary call
and text links.

## Validation

Node 24 and npm 10 or newer are required. Run the narrowest relevant lane from the repository
root:

```bash
npm run quality:fast
npm run quality:full
npm run quality:release
npm run quality:live
```

- Markdown outside deployed source: check links, paths, prose, and the complete diff.
- Small source change: targeted checks plus `quality:fast`.
- Broad behavior change: `quality:full`.
- Production candidate: `quality:release` before push and `quality:live` after the exact
  deploy is ready.

Changes under `app/public/` are production content, including Markdown.

## Design and content

`app/DESIGN.md` is the controlling design narrative; implemented values live in
`app/src/styles/editorial/tokens.css`. Preserve Axiom Momentum, the established type and color
system, restrained motion, accessibility, honest claims, and privacy boundaries unless the
task explicitly changes them. Do not duplicate those rules here.

## Git and production

Netlify auto-builds GitHub `main`. Develop and verify unfinished work in a local
preview. A passing build is not visual approval: inspect the rendered desktop,
tablet, and phone layouts and the actual image assets. Prepare at most one hosted
review preview after local checks. Publish only after a scoped owner instruction
approves that release candidate; approval is not permission for later iterations.

- Never run a manual production deploy.
- Never relink the site or change its ID, domains, build settings, environment, or production
  branch without explicit authorization.
- Never push application or configuration changes to `main` without production authorization.
- A non-deployed documentation-only housekeeping push must use `[skip netlify]` in its latest
  commit and verify that production did not change.
- For a production release, commit the exact candidate, run the release gate, push that
  commit, wait for its ready deploy, then prove live revision parity.
- Do not rewrite shared history.

## Completion

1. Review `git diff --check`, the full scoped diff, and final status.
2. Run proportional validation and report any external gate not exercised.
3. Confirm no secret, generated output, unrelated change, or unintended side effect entered.
4. If pushed, verify GitHub and production parity as applicable.

Update `SOURCE_OF_TRUTH.md` only when its facts change. Git history is the work log.

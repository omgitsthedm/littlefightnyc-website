# Little Fight NYC agent contract

## Canonical project

- Canonical physical root: `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website`
- GitHub: `https://github.com/omgitsthedm/littlefightnyc-website`
- Default and production branch: `main`
- Netlify site: `littlefightnyc`, ID `0907d8fe-7018-48db-a6be-1f906e4b2619`
- Production: `https://littlefightnyc.com`
- Netlify domain: `https://littlefightnyc.netlify.app`
- Current alias: `https://hey.littlefightnyc.com`
- Deployment IDs are intentionally not pinned here. Resolve the current ready
  production deploy and `/release.json` revision before every release action.

`SOURCE_OF_TRUTH.md` holds the concise deployment map and recovery pointers. Recheck live Netlify and GitHub state before a release because point-in-time IDs can change.

Do not route website work to an older Little Fight checkout or to an independent Lab, brand-kit, template, demo, or experiment repository. Those are separate properties or history unless the fleet manifest explicitly maps them here.

Repository-local `.agents/`, `.claude/`, `.superpowers/`, old static-site
trees, and standalone Audit checkouts are retired. Do not recreate or load them.

## Start here

Run these checks before editing:

```bash
pwd -P
git rev-parse --show-toplevel
git status --short --branch
git remote -v
git worktree list
```

Preserve unrelated local work. Do not reset, clean, stash, commit, push, or deploy changes outside the requested scope.

Read only the files the task needs:

- Deployment or routing: `SOURCE_OF_TRUTH.md`, `netlify.toml`
- Product and visual work: `app/DESIGN.md`, then `app/src/styles/editorial/tokens.css`
- Voice or claims: `VOICE.md` and the relevant on-demand business document named in `SOURCE_OF_TRUTH.md`
- Quality behavior: `.lifi/quality.yml`, the applicable script in `app/package.json`, and the failing test

Do not load historical Git commits, recovery branches, evidence folders, or every Markdown file at startup.

## Source boundaries

The deployed React/Vite application lives in `app/`. Live Netlify functions live in `netlify/functions/`. Deployment configuration lives in `netlify.toml`.

Key source paths:

- `app/src/**`
- `app/public/**`
- `app/index.html`
- `app/scripts/**`
- `app/tests/**`
- `app/playwright.config.ts`
- `netlify/functions/**`
- `netlify.toml`
- `.lifi/**`

`app/dist/` is generated and ignored. Never hand-edit or commit it. Never expose, inspect, or commit secrets, local environment files, credentials, private form data, or Netlify tokens.

The Website Audit functions can send email, write blobs, or call providers. Keep tests read-only unless the task explicitly authorizes an external side effect. Do not submit production forms during routine verification.

The retired AI phone agent is not a current service. Public phone actions are ordinary `tel:` and `sms:` links. Do not restore or advertise AI call answering without a new explicit decision.

## Commands

Node 24 and npm 10 or newer are required. Install only when dependencies are missing or changed:

```bash
nvm use
npm ci
npm --prefix app ci
```

Run commands from the repository root:

```bash
npm run dev
npm run lint
npm run build
npm run typecheck:functions
npm run quality:fast
npm run quality:full
npm run quality:release
npm run quality:live
```

Choose the narrowest proportional lane:

- Documentation-only changes: check links, paths, byte limits, and the staged diff. Do not rebuild the application solely for Markdown changes.
- Small source changes: targeted checks plus `npm run quality:fast`.
- Broad behavior changes: `npm run quality:full`.
- Authorized production candidates: `npm run quality:release` before push and `npm run quality:live` after the exact deploy is ready.

The Netlify build command is `cd app && npm ci && cd .. && npm run typecheck:functions && npm --prefix app run build`; the publish directory is `app/dist`.

## Design and content

The current design system is Axiom Momentum. `app/DESIGN.md` is the only controlling design narrative, and `app/src/styles/editorial/tokens.css` is the implemented token source. Preserve the near-black editorial base, Oswald/Barlow/JetBrains Mono type system, orange lead accent, blue support accent, strong grid, restrained motion, and evidence/privacy guardrails unless the user explicitly authorizes a new direction.

Do not duplicate design rules into this file or `CLAUDE.md`. Preserve approved brand, claim, legal, privacy, and client-proof boundaries in their existing on-demand documents.

## Git and deployment safety

Netlify is Git-connected to GitHub `main`. A normal source commit pushed to `main` can build and publish production.

- Never run a manual `netlify deploy --prod` for this property.
- Never link or unlink the Netlify site, change its site ID, domains, build settings, environment variables, or production branch without explicit authorization.
- Never push an application or configuration change to `main` without explicit production authorization.
- For an authorized documentation-only housekeeping push that must not deploy, put `[skip netlify]` in the most recent commit message and verify that the production deploy ID and live fingerprint remain unchanged.
- Do not rewrite shared history. Legacy branches belong in cold storage, not in
  the active GitHub branch list or a routed local checkout.

## Completion

Before handoff:

1. Review `git diff --check`, the full scoped diff, and `git status --short --branch`.
2. Run proportional validation and report any skipped external gate plainly.
3. Confirm no secret, generated output, unrelated file, or production side effect entered the change.
4. If anything was pushed, verify GitHub branch state and Netlify production parity.
5. Keep the repository clean and leave no unexplained unpushed commit.

Do not create append-only agent diaries or a new handoff for routine work. Update `SOURCE_OF_TRUTH.md` only when canonical routing or deployment facts change; Git history preserves completed work.

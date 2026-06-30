# Little Fight NYC Current Workspace

Last verified: 2026-05-12 by Codex.

This repository is the current local source of truth for `https://littlefightnyc.com`.

## Production Linkage

- Netlify site name: `littlefightnyc`
- Netlify site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`
- Netlify config: `netlify.toml`
- Build command: `cd app && npm ci && npm run build`
- Publish directory: `app/dist`
- Current production deploy ID: `6a02b70bc2dc6fac47dcc643`
- Current production deploy published: `2026-05-12T05:14:04.813Z`

The current production deploy was made through the Netlify API/manual deploy path. It is not a GitHub `main` deploy.

## Current Source

Edit the React/Vite app in `app/`:

- `app/src/**`
- `app/public/**`
- `app/index.html`
- `app/scripts/prerender-seo.mjs`
- `app/package.json`

Root files that still matter:

- `netlify.toml`
- `netlify/functions/**`
- `.netlify/state.json`
- `AGENTS.md`
- `CLAUDE.md`
- `HANDOFF.md`

Generated output:

- `app/dist/**` is build output.
- Do not hand-edit `app/dist/**` for normal work.

## Git Warning

Current branch: `little-fight-overhaul`.

This branch and its dirty/untracked files are ahead of `origin/main` for live-site purposes. Treat the dirty working tree as recovered production source. Do not reset, checkout, clean, or overwrite it without explicit instruction.

Before making changes, run:

```bash
git status --short --branch
```

Before handing off, run:

```bash
cd app && npm run build
```

## Legacy Material

The root static pages, root `dist/`, and old folders are legacy/reference material unless a task explicitly targets them. The current live app is built from `app/`.


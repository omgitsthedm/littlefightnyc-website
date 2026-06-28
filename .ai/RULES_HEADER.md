# LittleFightNYC Core AI-Ops Rules Header

Project Code:

LFNYC-CORP

Project Name:

Little Fight NYC Core (agency site)

Business Line:

Little Fight NYC Core

Tier:

Tier 2 (Tier 3 candidate) — live agency site with serverless functions + lead pipeline

Risk:

Medium-High

Canonical Path:

/Users/davidmarsh/Desktop/LiFi NYC/Clients/LittleFightNYC/littlefightnyc-website

Remote:

https://github.com/omgitsthedm/littlefightnyc-website.git

Host:

Netlify — build `node scripts/build-netlify-publish.mjs`, **publish dir `dist/`** (repo-only files like `.ai/` are NOT published)

Live URL:

`https://littlefightnyc.com` (repo-evidenced in CLAUDE.md/HANDOFF.md). Separate audit site: `audit.littlefightnyc.com` / `audits.littlefightnyc.com`.

Stack:

Static HTML/CSS/JS (built into `dist/`) + **Netlify Functions** (`netlify/functions`). Fit Check conversational lead flow: `/api/fit-check/submit`, optional OpenAI classification, optional Supabase storage, optional Resend email. GA4 (consent-gated). No retail commerce. (Twilio voice + SMS removed 2026-06-28; `(646) 360-0318` kept as a normal call line.)

## Onboarding Note

This `.ai/` was created on a **fresh clone** of `origin/main` (2026-06-28) after the prior local checkout was found 68 commits behind. The stale checkout is preserved at `littlefightnyc-website.STALE-2026-06-28` (sibling folder) — it holds the old `.ai/` and 6 untracked files for David to cherry-pick if any are still wanted.

## Locked Rules

- This is Little Fight NYC's own LIVE site — treat as production.
- **Never publish prices** — only the four time-bound promises per the LFNYC pricing doctrine. Do not add prices/quotes to any page.
- Deploy is Netlify; `git push` to `main` triggers a production build/deploy. Push/deploy require explicit `APPROVE LIVE CHANGE`.
- Fit Check is a REAL lead pipeline. Do not submit the Fit Check form, send emails (Resend), or write leads to Supabase against production unless sandboxed or David-run. These are transactional.
- Preserve mobile-first / WCAG AA / brand palette+fonts / the required footer ("Designed, Hosted and Cared For by LittleFightNYC.com") and existing SEO/sitemap/robots/redirect/CSP behavior on any content work.
- Dirty/untracked files must be recorded, not cleaned or committed, unless David explicitly approves.
- `.env`/`.env.local` and secrets are off-limits — never read or echo. Env-gated integrations: `OPENAI_API_KEY`, `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`. Twilio was removed 2026-06-28 — David should delete `TWILIO_*` env vars in Netlify and close the Twilio account/number. Never echo credentials.

## LFNYC Core QA Harness Map

Observational checks an agent may run later (read-only, no writes):

- `git status`, `git remote -v`, `git branch`, `git log`
- read config/docs: `package.json`, `netlify.toml`, `CLAUDE.md`, `HANDOFF.md`, HTML/CSS/JS source (never `.env*`, never secrets)
- local build/preview (`node scripts/build-netlify-publish.mjs` to `dist/`, local static server) — local-only, non-mutating
- public site GET to `https://littlefightnyc.com` only if David explicitly requests it (analytics caveat)
- read-only Netlify deploy metadata (no deploy)

Transactional/gated checks (David-run / approved only):

- `git push` / Netlify publish / promote (production build+deploy)
- Fit Check form submission, Resend email sends, Supabase lead writes
- domain / DNS / env / secret changes
- any edit to live page content / function behavior

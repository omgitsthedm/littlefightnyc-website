# LittleFightNYC Core AI-Ops State

## Identity

- Project Code: LFNYC-CORP
- Name: Little Fight NYC Core (agency site)
- Business Line: Little Fight NYC Core
- Tier: Tier 2 (Tier 3 candidate)
- Risk: Medium-High
- Canonical Path: /Users/davidmarsh/Desktop/LiFi NYC/Clients/LittleFightNYC/littlefightnyc-website
- Git-backed: yes
- Remote: https://github.com/omgitsthedm/littlefightnyc-website.git

## Current Stamp

- Updated: 2026-06-28
- Updated By: Claude
- Basis: AI-Ops onboarding on a FRESH clone of origin/main (prior local was 68 commits behind; replaced via Option A)
- Git HEAD at onboarding: 0610f67901a96c7e9131e25c4feb72e39c2a2ea3

## Rules Version

- 2026-06-27-aiops-foundation-v1

## State Confidence

- High for canonical path, repo, branch, remote, stack, publish model, and live URL (repo-evidenced).
- Low/TBD for live deploy revision/runtime health (not inspected this pass).

## Current Live Truth

- Live URL: `https://littlefightnyc.com` (repo-evidenced; not health-checked this pass). Audit site: `audit.littlefightnyc.com` / `audits.littlefightnyc.com` (separate Netlify project).
- Host: Netlify — build `node scripts/build-netlify-publish.mjs`, publish `dist/`.
- Deploy: `git push` to `main` triggers a production build/deploy.
- Production QA status: Not run.

## Repo State

- Branch: main, at origin/main `0610f67` after fresh clone (clean, no dirty files in the fresh clone).
- The PREVIOUS local checkout (68 commits behind) was preserved as `littlefightnyc-website.STALE-2026-06-28`, then DELETED 2026-06-28 (David-approved); its 6 untracked files were stale boilerplate (`.env.example` had no secrets).
- `.ai/` is repo-only (publish dir is `dist/`) so it is not served publicly — no `/.ai/*` exclude needed.

## Commerce / Data Risk

- No retail commerce. Risk driver = live lead pipeline: Netlify Functions, Fit Check (`/api/fit-check/submit`), optional OpenAI/Supabase/Resend integrations. (Twilio voice removed 2026-06-28.)
- Twilio fully removed 2026-06-28 (account closed by David; 9 `TWILIO_*` Netlify vars deleted). Never echo any credentials.

## QA-PENDING

- Live verified 2026-06-28: littlefightnyc.com 200, new copy live, `.ai/` 404.
- Verify Netlify deploy metadata before deployment claims.
- Confirm whether LFNYC Core needs an AI-Ops pointer appended to the tracked `CLAUDE.md` (not added this pass).

## Do Not Touch

- `.env`, `.env.local`, secrets, OpenAI/Supabase/Resend credentials
- Live page content / function behavior
- Fit Check production submissions, email/DB writes
- Netlify deploy settings / build config; `git push`

## Proposed Changes / Inbox

- None yet. Use this section for proposed rule changes before promoting them into `.ai/RULES_HEADER.md` or `~/AI-OPS/TEMPLATES/RULES_BASE.md`.

## Next Steps Queue

- Optional read-only live health verification of littlefightnyc.com.
- Decide on a CLAUDE.md AI-Ops pointer.

## Recent Session History

- 2026-06-28: Claude onboarded LFNYC Core via Option A — fresh clone of origin/main (prior local 68 behind), created `.ai/{LOCK,RULES_HEADER,RULES,STATE}.md`, generated `.ai/RULES.md`. No `/.ai/*` exclude needed (publish dir is `dist/`). Committed `.ai/` only and pushed. Stale checkout preserved at `littlefightnyc-website.STALE-2026-06-28`. No source/function behavior change, no env inspection, no Fit Check/Twilio/email/DB action.
- 2026-06-28: Twilio BACKEND removed locally (NOT deployed): deleted `netlify/functions/fit-check-voice.mts` (Twilio Voice webhook) and surgically removed Twilio SMS from `fit-check-submit.mts` (`isE164`, `conversionPath`, `sendTwilioSms`, `sendSmsNotifications`, handler block, response field). Core lead flow intact (deterministic→OpenAI→Supabase→Resend email).
- 2026-06-28: Twilio COPY SWEEP done (David decisions: keep `(646) 360-0318` as a normal call line; strip voice/AI-agent marketing sitewide; after-hours = "leave a message, David calls back next business day"). Reworded ~46 instances across ~107 pages — JSON-LD schema, page titles, OG/Twitter meta, FAQ/comparison/hero copy — plus `llms.txt`, `CLAUDE.md`, `PLACEHOLDERS.md`, and these `.ai/` files. Verified: zero agent/voice/Twilio tokens remain; competitor "24/7 human" + "24-hour cancellation" + "within 24 hours" untouched; `tel:+16463600318` count unchanged (386); all 135 JSON-LD blocks valid. **DEPLOYED LIVE 2026-06-28** (`4fa6dc6`, pushed `main`; verified live: new "leave a message, next-business-day callback" copy on homepage/it-support/vs-geek-aid, 0 agent tokens, `.ai/` → 404, JSON-LD valid). Netlify env: 9 `TWILIO_*` + 5 orphaned `FIT_CHECK_*`/`URGENT_SUPPORT_*` vars deleted. David closed the Twilio account/number externally. Build excludes `.ai/` from `dist/`. `(646) 360-0318` kept as a normal call line.

## Next Agent Directive

Read `.ai/RULES.md` and `.ai/STATE.md` before working. LFNYC Core is the agency's own LIVE site with Netlify Functions + a real Fit Check lead pipeline (OpenAI/Supabase/Resend, env-gated; Twilio removed 2026-06-28). Never publish prices. Treat `git push`/deploy, Fit Check submissions, emails, and DB writes as production actions requiring `APPROVE LIVE CHANGE`. Do not inspect `.env`/secrets.

## Emergency / Bypass Notes

- No bypass approved for source/function edits, deploy, push, Fit Check/email/DB actions, or production mutations.
- Bypass/YOLO is only an execution accelerator for approved local setup and read-only verification.
- Emergency mode: stop forward work, preserve evidence, use the smallest reversible action.

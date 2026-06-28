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
- The PREVIOUS local checkout was 68 commits behind and is preserved at sibling `littlefightnyc-website.STALE-2026-06-28` (contains old `.ai/` + 6 untracked files: `README.md`, `AGENTS.md`, `CLAUDE.md` [local-untracked variant], `NEXT_STEPS.md`, `PROJECT_STATUS.md`, `.env.example`). David to decide if any belong in the live repo.
- `.ai/` is repo-only (publish dir is `dist/`) so it is not served publicly — no `/.ai/*` exclude needed.

## Commerce / Data Risk

- No retail commerce. Risk driver = live lead pipeline: Netlify Functions, Fit Check (`/api/fit-check/submit`, `/api/fit-check/voice` Twilio), optional OpenAI/Supabase/Resend integrations.
- Per HANDOFF: a trial Twilio Auth Token + API key/secret were shared in chat and need rotation — never echo credentials.

## QA-PENDING

- Health-check `https://littlefightnyc.com` (read-only) before any production claim.
- David: decide disposition of the 6 untracked files in the STALE backup (keep/merge/discard); then the backup folder can be removed.
- Verify Netlify deploy metadata before deployment claims.
- Confirm whether LFNYC Core needs an AI-Ops pointer appended to the tracked `CLAUDE.md` (not added this pass).

## Do Not Touch

- `.env`, `.env.local`, secrets, Twilio/OpenAI/Supabase/Resend credentials
- Live page content / function behavior
- Fit Check production submissions, Twilio voice, email/DB writes
- Netlify deploy settings / build config; `git push`
- The `littlefightnyc-website.STALE-2026-06-28` backup (David's to review/remove)

## Proposed Changes / Inbox

- None yet. Use this section for proposed rule changes before promoting them into `.ai/RULES_HEADER.md` or `~/AI-OPS/TEMPLATES/RULES_BASE.md`.

## Next Steps Queue

- David reviews the STALE backup's 6 untracked files; remove backup once cleared.
- Optional read-only live health verification of littlefightnyc.com.
- Decide on a CLAUDE.md AI-Ops pointer.

## Recent Session History

- 2026-06-28: Claude onboarded LFNYC Core via Option A — fresh clone of origin/main (prior local 68 behind), created `.ai/{LOCK,RULES_HEADER,RULES,STATE}.md`, generated `.ai/RULES.md`. No `/.ai/*` exclude needed (publish dir is `dist/`). Committed `.ai/` only and pushed. Stale checkout preserved at `littlefightnyc-website.STALE-2026-06-28`. No source/function behavior change, no env inspection, no Fit Check/Twilio/email/DB action.
- 2026-06-28: Twilio BACKEND removed locally (NOT deployed): deleted `netlify/functions/fit-check-voice.mts` (Twilio Voice webhook) and surgically removed Twilio SMS from `fit-check-submit.mts` (`isE164`, `conversionPath`, `sendTwilioSms`, `sendSmsNotifications`, handler block, response field). Core lead flow intact (deterministic→OpenAI→Supabase→Resend email). **BLOCKED on deploy** pending David decisions: (1) fate of sitewide phone number `(646) 360-0318` = `tel:+16463600318` on ~106 pages; (2) whether to strip "24/7 AI phone agent / voice intake / Twilio" marketing across pages + `llms.txt`. Do NOT deploy until resolved — would leave a dead advertised AI line. David must also remove `TWILIO_*` env vars in Netlify + close the Twilio account/number externally.

## Next Agent Directive

Read `.ai/RULES.md` and `.ai/STATE.md` before working. LFNYC Core is the agency's own LIVE site with Netlify Functions + a real Fit Check lead pipeline (Twilio/OpenAI/Supabase/Resend, env-gated). Never publish prices. Treat `git push`/deploy, Fit Check submissions, Twilio voice, emails, and DB writes as production actions requiring `APPROVE LIVE CHANGE`. Do not inspect `.env`/secrets. The stale backup folder is David's to review.

## Emergency / Bypass Notes

- No bypass approved for source/function edits, deploy, push, Fit Check/Twilio/email/DB actions, or production mutations.
- Bypass/YOLO is only an execution accelerator for approved local setup and read-only verification.
- Emergency mode: stop forward work, preserve evidence, use the smallest reversible action.

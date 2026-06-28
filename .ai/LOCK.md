# LittleFightNYC Core AI-Ops Lock

Status: Inactive
Owner:
Agent:
Branch: main
Worktree: /Users/davidmarsh/Desktop/LiFi NYC/Clients/LittleFightNYC/littlefightnyc-website
Task:
Files:
- .ai/RULES_HEADER.md
- .ai/RULES.md
- .ai/STATE.md
- .ai/LOCK.md
Started:
Expected Closeout:
Recovery Note: This is the agency's own LIVE site (littlefightnyc.com) with Netlify Functions + a Fit Check lead flow (OpenAI/Supabase/Resend). Treat push/deploy, form submissions, emails, and DB writes as production actions. (Twilio voice/SMS removed 2026-06-28.) `.ai/` is repo-only (publish dir is `dist/`), so it is not served publicly.

## Use

Before parallel AI-Ops work, set this lock or explicitly assign one agent as the owner of the target file/task.
The lock does not override safety gates.

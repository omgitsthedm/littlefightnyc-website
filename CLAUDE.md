# Claude compatibility adapter

`AGENTS.md` is the controlling agent contract for this repository. Read it first and follow it without restating it here.

Use `SOURCE_OF_TRUTH.md` for the current GitHub, Netlify, domain, branch, deploy, and recovery map. Load `app/DESIGN.md` and `app/src/styles/editorial/tokens.css` only for product or visual work. Load voice, evidence, acquisition, or brand documents only when the task needs them.

Work from the canonical physical root:

```text
/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website
```

Run all project commands from that root. The standard lanes are `npm run quality:fast`, `npm run quality:full`, `npm run quality:release`, and `npm run quality:live`.

GitHub `main` is connected to production. Do not push source changes or deploy without explicit authorization. An authorized documentation-only main push must place `[skip netlify]` in the most recent commit message and must be followed by a no-deploy parity check.

Do not use this file as a session log, status diary, second design system, or historical handoff.

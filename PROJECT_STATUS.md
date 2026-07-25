# LittleFight NYC — PROJECT STATUS (cold-start entry point)

> **Read this first.** If you are a person or an AI agent picking this up cold, this file tells you what LittleFight NYC is, exactly where it stands, what to do next, and where everything lives. One screen to orientation.
>
> **Last updated:** 2026-07-24 · **Updated by:** Codex (LiFi NYC) · **Stage:** Verified live flagship; local reinvention candidate in validation

---

## 1. What it is
LittleFight NYC (LFNYC) is **the agency's own flagship marketing/shopfront website** — `https://littlefightnyc.com`. It sells right-sized websites, tools, local visibility, and business systems to small/mid New York businesses. It is a **live, public production site** held to an Apple-tier craft bar (it is the agency's own storefront, so it is the reference standard for everything else).

## 2. Current state (2026-07-24)
- **Verified production:** `df7c90ded191d909648ed86401fc5816809648ec`
  (`df7c90d`) is the ready Netlify release currently verified on
  https://littlefightnyc.com/ and `www`. It is the last-known-good rollback
  point.
- **Local candidate:** local `main` contains Quality Spine, runtime pin,
  browser-quality, social-share identity, and route metadata/H1 parity work
  based on `df7c90d`. Verify local `HEAD` before quoting the candidate SHA.
- **Release state:** the local candidate passes the clean release lane but is
  **not production-authorized, pushed, or deployed**. It is not production.
- **Browser state:** `quality:full` passed under Node 24.18.0, including
  **32/32 Playwright checks** across desktop/mobile Chromium, desktop Firefox,
  and mobile WebKit. Release and live verification remain separate gates.
- **Git:** `main` is the production branch. Use `git status --short` and compare the Netlify deployed commit before calling it synced.
- **Branch:** `main` ✅ (canonical; the intended default).
- ⚠️ **This repo AUTO-DEPLOYS from `main`** (push → Netlify auto-build → live in ~40s). This is a deliberate **exception** to LiFi's usual manual-deploy rule. Do **NOT** run `netlify deploy --prod` manually (caused the 2026-06-30 divergence incident).
- **Phone service:** Twilio and the AI phone agent are retired. The public
  number remains an ordinary call/text line; AI answering is not a service.
- **Governance:** [SITE-REINVENTION-DOSSIER.md](SITE-REINVENTION-DOSSIER.md)
  records the open owner, research, proof, service, external, and care gates.

## 3. Where everything lives
| Thing | Location |
|---|---|
| **Canonical code** | `~/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website` — app source lives under `app/`. |
| **GitHub** | `github.com/omgitsthedm/littlefightnyc-website` |
| **Hosting** | Netlify project `littlefightnyc` (site ID `0907d8fe-7018-48db-a6be-1f906e4b2619`) → https://littlefightnyc.com — **auto-deploy from `main`** |
| **Data / persistence** | `/tech-audit/` posts through Netlify Forms. The public Website Audit uses Netlify Functions plus Blob stores for job, status, report, view, engagement, and rate-limit state; scheduled cleanup expires reports. There is no traditional relational database. |
| **Design / handoff material** | In-repo: `DESIGN_LANGUAGE.md`, `docs/UIUX-DOCTRINE.md`, `VOICE.md`, `SOURCE_OF_TRUTH.md`, `HANDOFF.md`; design tokens in `app/src/styles/editorial/tokens.css` |
| **Secrets / build env** | Netlify build env (e.g. `VITE_GA_ID` for GA4); nothing sensitive committed |
| **Related sibling property** | **The Lab source repo** — `omgitsthedm/littlefight-lab`, code at `~/Code/LiFi NYC/Little Fight NYC Business/Website/Lab`. The main site also serves a public showcase beneath `/examples/lab/`; source-repo work remains a separate lane. |

## 4. What's done
The verified production baseline is a React 19 + TypeScript + Vite 7 SPA with
build-time prerendering, Netlify Forms, consent-gated analytics, security
headers, Axiom Momentum, a proof-first homepage, service/case-study/Library
routes, Spanish and Chinese landing pages, a directly explorable public Lab
showcase, and a service-enabled Website Audit backed by Netlify Functions,
background processing, Blob persistence, report/email delivery, and scheduled
cleanup.

The current generated inventory has **200 routes: 127 indexable and 73
noindex**, including 72 noindex area/service combinations.

The local candidate adds:

- `.lifi/quality.yml` plus debt/dead-code governance and
  `quality:fast/full/release/live/maintenance`;
- Node 24 pinning in `.nvmrc` and package engines;
- Chromium desktop, Chromium mobile/touch, Firefox desktop, and WebKit mobile
  Playwright projects with axe and interaction checks;
- indexed-route first-response versus hydrated-H1 parity coverage;
- route-level share identity/social cards and metadata generation;
- release metadata, readiness, and live-verification tooling.

These candidate capabilities pass `quality:release` locally under Node 24.
That is release-artifact evidence, not production or external-provider proof.

## 5. What's next (immediate)
The verified site remains live while the local candidate is validated:

- Obtain explicit production release authorization before pushing `main`.
- After an authorized push, verify the ready Netlify deploy and new live SHA
  before announcing release.
- Collect approval-backed client outcomes and quotes using `CLIENT-PROOF-COLLECTION.md`; do not invent testimonials.
- Run the acquisition experiments one at a time and record raw counts using `CONVERSION-MEASUREMENT.md`.
- Complete the authenticated Google actions in `SEARCH-ACQUISITION-RUNBOOK.md`; repository work alone cannot submit Search Console or edit the Business Profile.
- Once David provides GBP URL + social handles: populate `site.sameAs` and add real `streetAddress`/registered address to LocalBusiness schema for NAP/entity strength (`streetAddress` intentionally omitted today — service-area business).
- **⏳ Awaiting David's DataForSEO key** to stand up OpenSEO keyword-volume/competitor audit (paid key; not started until provided).
- Complete the owner/research/service/care evidence requested in
  `SITE-REINVENTION-DOSSIER.md`; code cannot satisfy those gates by itself.

## 6. How to run / build / deploy
```bash
cd "~/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website"
nvm use
npm --prefix app ci
npm run quality:fast
npm run quality:full       # includes the four-project browser suite
npm run quality:release    # release candidate gate; must pass on one exact commit
npm run quality:live       # read-only live verification; does not submit forms

# DEPLOY, only after explicit production authorization:
#   git push origin main
# Netlify runs `cd app && npm ci && npm run build`, publishes `app/dist`, live in ~40s.
# ⚠️ NEVER `netlify deploy --prod` manually on this repo.
```
Note: `app/package.json` holds the implementation scripts. The root `package.json` is a thin proxy for the same dev, build, preview, lint, and audit commands; the retired static-site generators are archived off `main`.

## 7. Non-negotiable boundaries (do not break)
- **Auto-deploy is live:** anything pushed to `main` goes to production in ~40s. Verify before pushing; never manual `netlify deploy --prod`.
- **Brand doctrine:** **orange (`#F97316`) = signal** (text/buttons/accents, used sparingly); **background bursts = blue (`#3B82F6`)** on a near-black base (`#050507`). Type = **Oswald-700 display + Barlow-400 body**. Orange browser chrome (theme-color) is intentional — do not revert to a dark/default tab bar. Don't dilute orange by over-using it (e.g. all-orange proof grids were deliberately de-saturated).
- **CSP is `script-src 'self'`** (no `'unsafe-inline'`): **never** use onload-swap async-CSS (it once shipped the whole live site unstyled); keep pre-paint JS external in `app/public/boot.js`. CSS must ship as a normal render-blocking `<link rel="stylesheet">`.
- **CSS gotchas:** `.lf-editorial button` reset strips custom `<button>` fill/border/padding — scope custom button rules under `.lf-editorial`. The global `.lf-editorial a` color rule can override a single-class CTA color (caused white-on-orange AA fails) — scope CTA color rules too. Use `rgba()` not `color-mix()` inside gradients.
- **Data sync:** `src/data/site.ts` is the app source of truth; `src/data/seo-pages.json` is a **separate** prerender copy — keep FAQ/meta in sync.
- **Redirects live ONLY in `app/public/_redirects`** (toml-only redirect rules are dead). New Netlify Form fields must also be registered in `app/public/__forms.html`.
- Home `/` is a **standalone layout** (not `EditorialShell`) — shell-only globals must also be rendered in `Home.tsx`.
- No fabricated metrics on case studies (honest, verifiable facts only).
- The browser suite has no approved visual baselines and never submits the Tech
  Audit. A browser run is green only when the complete configured suite passes.
- Do not advertise or restore Twilio/AI phone-agent behavior. Calls and texts
  use the public number directly; after-hours callers leave a normal message.

## 8. Deeper docs (read in this order)
`SOURCE_OF_TRUTH.md` → `SITE-REINVENTION-DOSSIER.md` → `AGENTS.md`
(tech stack + gotchas) → `HANDOFF.md` →
`SESSION-2026-07-20-AUDIT-CONVERSION-LAYOUT-CLOSEOUT.md` → `CLAUDE.md`
(dated session log, newest first) → `DESIGN_LANGUAGE.md` /
`docs/UIUX-DOCTRINE.md` → `VOICE.md`.

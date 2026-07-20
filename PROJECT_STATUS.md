# LittleFight NYC — PROJECT STATUS (cold-start entry point)

> **Read this first.** If you are a person or an AI agent picking this up cold, this file tells you what LittleFight NYC is, exactly where it stands, what to do next, and where everything lives. One screen to orientation.
>
> **Last updated:** 2026-07-20 · **Updated by:** Codex (LiFi NYC) · **Stage:** Live flagship marketing site (acquisition pass shipped)

---

## 1. What it is
LittleFight NYC (LFNYC) is **the agency's own flagship marketing/shopfront website** — `https://littlefightnyc.com`. It sells right-sized websites, tools, local visibility, and business systems to small/mid New York businesses. It is a **live, public production site** held to an Apple-tier craft bar (it is the agency's own storefront, so it is the reference standard for everything else).

## 2. Current state (2026-07-20)
- **Status:** ✅ Live flagship with a proof-first acquisition path, a website-specific inquiry route, explicit service fit/ownership terms, and guarded mobile update/reload behavior.
- **Live URL:** https://littlefightnyc.com/ — production health and exact deployed revision must be verified at the end of each shipping session.
- **Git:** `main` is the production branch. Use `git status --short` and compare the Netlify deployed commit before calling it synced.
- **Branch:** `main` ✅ (canonical; the intended default).
- ⚠️ **This repo AUTO-DEPLOYS from `main`** (push → Netlify auto-build → live in ~40s). This is a deliberate **exception** to LiFi's usual manual-deploy rule. Do **NOT** run `netlify deploy --prod` manually (caused the 2026-06-30 divergence incident).
- **Biggest open lever is off-site:** Google Business Profile, not the code — see §5.

## 3. Where everything lives
| Thing | Location |
|---|---|
| **Canonical code** | `~/Code/LiFi NYC/Clients/LittleFightNYC/Brand/Website/littlefightnyc-website` — edit + push from here (`~/Code` is canonical; the `~/Desktop/...` path is a same-name symlink into `~/Code`). App source lives under `app/`. |
| **GitHub** | `github.com/omgitsthedm/littlefightnyc-website` |
| **Hosting** | Netlify project `littlefightnyc` (site ID `0907d8fe-7018-48db-a6be-1f906e4b2619`) → https://littlefightnyc.com — **auto-deploy from `main`** |
| **Database** | None (static prerendered SPA; `/tech-audit/` posts via Netlify Forms) |
| **Design / handoff material** | In-repo: `DESIGN_LANGUAGE.md`, `docs/UIUX-DOCTRINE.md`, `VOICE.md`, `SOURCE_OF_TRUTH.md`, `HANDOFF.md`; design tokens in `app/src/styles/editorial/tokens.css` |
| **Secrets / build env** | Netlify build env (e.g. `VITE_GA_ID` for GA4); nothing sensitive committed |
| **Related sibling property** | **The Lab** — `lab.littlefightnyc.com`, repo `omgitsthedm/littlefight-lab`, code at `~/Code/LiFi NYC/Clients/LittleFightNYC/Lab`. **Separate project with its own status doc** — THIS doc covers the MAIN site only. |

## 4. What's done
Mature React 19 + TypeScript + Vite 7 SPA (React Router 7) with build-time SEO prerendering (`scripts/prerender-seo.mjs` currently writes 182 static routes with full JSON-LD: FAQPage, BreadcrumbList, LocalBusiness/ProfessionalService, DefinedTerm, Article, HowTo). Delivered scope includes: full content build-out (services, case studies with honest metrics, answer guides, neighborhood/area hubs, glossary, journal, industries, studio), the **Axiom Momentum** design system, the **"Boxing Poster" type system** (Oswald-700 condensed display + Barlow-400 body, self-hosted via @fontsource), motion/route-transition system, command palette (Cmd/Ctrl-K), perf splits (site.ts + journal body chunking), WCAG 2.1 AA work, security headers, complete orange browser-chrome, proof-first homepage ordering, and a shortened website-lead route. Current automated gates cover lint, production build, mobile lifecycle, repo boundary, signal-law discipline, dependency vulnerabilities, and browser smoke tests.

## 5. What's next (immediate)
Site is in "maintain + proactively elevate" mode; no blocking bug backlog. Open items (from CLAUDE.md / AGENTS.md):
- Collect approval-backed client outcomes and quotes using `CLIENT-PROOF-COLLECTION.md`; do not invent testimonials.
- Run the acquisition experiments one at a time and record raw counts using `CONVERSION-MEASUREMENT.md`.
- Complete the authenticated Google actions in `SEARCH-ACQUISITION-RUNBOOK.md`; repository work alone cannot submit Search Console or edit the Business Profile.
- ⚠️ **Google Business Profile is the traffic bottleneck — NOT the site.** June GBP: 54 views, 0 calls/clicks/interactions. Needs work in Business Profile Manager (David's login): confirm URL + call button, add photos/categories/services, post, get reviews.
- Once David provides GBP URL + social handles: populate `site.sameAs` and add real `streetAddress`/registered address to LocalBusiness schema for NAP/entity strength (`streetAddress` intentionally omitted today — service-area business).
- **⏳ Awaiting David's DataForSEO key** to stand up OpenSEO keyword-volume/competitor audit (paid key; not started until provided).
- Voice intake is deployed from `netlify/functions/tech-audit-voice.mts` at `/api/tech-audit/voice`; do not use the default `/.netlify/functions/...` URL as its health check.
- Deferred perf/UX polish items are catalogued in the 2026-07-14 CLAUDE.md "Deferred" note.

## 6. How to run / build / deploy
```bash
cd "~/Code/LiFi NYC/Clients/LittleFightNYC/Brand/Website/littlefightnyc-website/app"
npm ci
npm run dev          # Vite dev (runs split-journal + build-route-meta + build-nav-index first)
npm run build        # split-journal + route-meta + nav-index + tsc -b + vite build + prerender-seo
npm run lint         # eslint
npm run preview      # vite preview

# DEPLOY = git push to main (auto-build). From the REPO ROOT:
#   git add -A && git commit -m "..." && git push origin main
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

## 8. Deeper docs (read in this order)
`SOURCE_OF_TRUTH.md` → `AGENTS.md` (tech stack + gotchas) → `CLAUDE.md` (dated session log, newest first) → `DESIGN_LANGUAGE.md` / `docs/UIUX-DOCTRINE.md` → `VOICE.md` → `HANDOFF.md` → `_qa/` audit reports (gitignored, session-local).

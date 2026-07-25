# Project AGENTS

## Source Of Truth

Last verified: 2026-07-25.

Repo (off iCloud): `~/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website`

Production work happens in the React/Vite app under `app/`. Netlify uses root `netlify.toml`, runs `cd app && npm ci && npm run build`, and publishes `app/dist`.

Verified Quality Spine application release:
- Git release commit: `d02b93549ad79cc2a904f3220d2a06b1643f114a`
  (`d02b935`)
- Netlify deploy: `6a642637809f6e0008ac8831`, state `ready`
- Production release marker: `/release.json`
- Previous rollback point: `df7c90ded191d909648ed86401fc5816809648ec`

`d02b935` was explicitly authorized, pushed to `main`, auto-deployed, and
revision-matched against production on 2026-07-25. Because later documentation
commits can advance `main` without changing the application behavior described
here, always compare local `HEAD`, GitHub `main`, Netlify, and live
`/release.json` before quoting the current production SHA.

Netlify project:
- Site name: `littlefightnyc`
- Site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`

**Deploy model (confirmed 2026-07 for THIS repo):** GitHub `main` **is** canonical and **auto-deploys** to Netlify (~40s: push → auto-build → publish). Do NOT `netlify deploy --prod` manually (caused a 2026-06-30 incident). The general "LiFi sites are manual deploys" rule does **not** apply to littlefightnyc.

See `SOURCE_OF_TRUTH.md` before major edits.

## Tech Stack & Architecture (current — 2026-07-24)

- **App:** React 19 + TypeScript + Vite 7 in `app/`. Routing = React Router 7 (`react-router-dom`, `BrowserRouter` + `<Routes>`). Icons = `lucide-react`.
- **Routing / layout:** `src/App.tsx` defines all routes. Most pages inherit `EditorialShell` (QuietNav + QuietFooter + StickyHelpBar + RouteMeta + **CommandPalette**). ⚠️ The home page `/` is a **standalone layout** (its own `.lf-editorial` wrapper, own nav/footer) — it does NOT use EditorialShell, so any shell-only global (e.g. CommandPalette) must **also** be rendered in `Home.tsx`.
- **Rendering:** client-rendered SPA. `src/main.tsx` uses `createRoot` (not hydrate). The build writes a static `index.html` snapshot for each generated route, then the client replaces that snapshot. Current metadata inventory: **200 routes, 127 indexable, 73 noindex**. The home page mounts its complete section sequence directly. First-response and hydrated H1 text must remain equal; the Playwright suite checks all 127 indexed routes.
- **Data (source of truth):** `src/data/site.ts` is the public facade over split service, case, answer, area, glossary, and studio modules; journal and industry data remain separate. `src/data/seo-pages.json` feeds prerender/search metadata and must stay synchronized through the metadata generation/parity tooling. Do not hand-edit generated `route-meta.json`.
- **Design system:** Axiom Momentum tokens in `src/styles/editorial/tokens.css` (bg `#050507`, orange `#F97316`, blue `#3B82F6` accent, `--lf-heading` Oswald + `--lf-body` Barlow). Shared responsive contracts live in `src/styles/editorial/primitives.css`. Section content is static-first; motion.css owns route/tactile state motion.
- **CSS gotchas:** (1) the shared reset is intentionally low-specificity via `:where()`; component classes should own their fill/border/padding without escalation. (2) global anchor color is also low-specificity, but CTA foregrounds should still be explicit for contrast. (3) use `rgba()` not `color-mix()` inside gradients.
- **Runtime/build:** Node 24 is pinned by root `.nvmrc` and package engine declarations. `npm run build` regenerates data/navigation, type-checks, builds, prerenders, writes release metadata, and audits metadata parity. ⚠️ **Prod build strips `console.log`** — debug built/live code with `window.__flags`, not console.
- **Conversion + infra:** `/tech-audit/` submits via Netlify Forms (registration in `app/public/__forms.html` — new form fields must be added there too). Twilio and the AI phone agent are retired and **not a service**. The public number is an ordinary `tel:`/`sms:` path; after hours, callers leave a normal message. Security headers (CSP/HSTS/X-Frame DENY/nosniff/Referrer-Policy/Permissions-Policy) live in root `netlify.toml`. **Redirects live ONLY in `app/public/_redirects`**. Analytics is denied by default and consent-gated: GA4, Clarity, and TikTok load only after a visitor allows analytics, then boot after the existing delay.
- **Website Audit:** `/examples/audit/` is a live service-enabled surface, not a static demo. Eight Netlify Functions plus shared helpers accept a URL/email, run background work, persist job/report/view/engagement/rate-limit state in Netlify Blobs, deliver reports, and expire them through scheduled cleanup. Treat provider calls, environment values, stored state, delivery, privacy, and incident handling as production boundaries; never copy secrets or submitted data into source or evidence files.
- **Quality Spine (released):** `.lifi/quality.yml`, debt/dead-code ledgers, and `quality:fast`, `quality:full`, `quality:release`, `quality:live`, and `quality:maintenance` now exist. The Playwright suite covers Chromium desktop, Chromium mobile/touch, Firefox desktop, and WebKit mobile, plus axe, form validation, Library interaction, mobile scroll lifecycle, and indexed-route H1 parity. Release `d02b935` passed `quality:release` locally under Node 24.18.0 with **32/32 browser checks**, reached a ready Node 24 Netlify deploy, passed revision-matched `quality:live`, passed a **200/200** route sweep and **78/78** share-image check, and passed an independent 390×844 mobile scroll/crash smoke. These checks do not prove form inbox or provider delivery.
- **Verified production quality history:** the 2026-07-07 Lighthouse/squirrelscan numbers remain point-in-time evidence for an earlier release; the 2026-07-25 release evidence above governs the Quality Spine application baseline.

## Design Context

### Users
Little Fight NYC serves small business owners and operators, especially in New York City. They are often juggling customers, staff, vendors, and broken systems at the same time. They come to the site to understand quickly whether Little Fight can solve messy real-world problems across websites, Wi-Fi, payments, devices, search visibility, and daily operations.

There are two main user states:
- urgent owners who need help fast and want to feel reassured that a kind, competent human can step in
- evaluating owners who are deciding whether Little Fight is premium enough to trust with their website, systems, and ongoing support

The blog also serves curious operators, founders, and neighborhood business owners who want practical insight without marketing fluff. Their job is to make better decisions fast and feel more confident about the technology that affects revenue, reputation, and daily stress.

### Brand Personality
Playful, tactile, premium.

The voice should feel warm, street-smart, insightful, and human. It should feel like a sharp local partner who understands New York small business reality, not a distant agency or sterile software company. The emotional goals are trust, relief, curiosity, momentum, and calm competence.

### Aesthetic Direction
The visual direction should feel like playful tactile NYC with premium restraint. The homepage should sell capability and energy with darker, more immersive surfaces. The editorial and service routes can shift lighter and brighter when readability and scanning matter more than drama.

The blog should feel like a hybrid of a field guide and an editorial publication: insightful, practical, and memorable. It should not look like generic SaaS, Apple-clean minimalism, dark neon gamer UI, or a startup agency template.

Brand anchors that should stay intact:
- Bright orange as the lead brand signal (`#F97316`; hover/ember for states)
- Blue (`#3B82F6`) as a real accent — background bursts/ambient are blue, orange stays the signal
- **Oswald** for display (700), **Barlow** for body (400/500/600), and **JetBrains Mono** for labels/metadata. Authoritative tokens live in `app/src/styles/editorial/tokens.css`; the full system is documented in `app/DESIGN.md`.
- Note: the hub of proof/answers is now named **"Examples"** at `/examples/` (was "Field Guide" — 301 preserved)
- React 19 + Vite + TypeScript SPA, prerendered for SEO, Netlify delivery (see Tech Stack above)
- WCAG-aware contrast, responsive intent, and reduced-motion respect
- Performance and polish should coexist; motion is welcome when it helps clarity or delight

### Brand message

- Core idea: **Small businesses have enough to fight. Their technology should not be one of them.**
- Category: **Serious technology for small businesses.**
- Promise: make the technology fit the business, not the business fit the technology.
- Customer story: name the fight, see the work, cut the drag, build the right
  thing, prove it works, and stay with it.
- Messaging jobs: **Be found. Keep moving. Cut the drag. Own what fits.**
- Competitive copy attacks bloat, lock-in, poor fit, and vendor runaround. It
  never blames an owner for choosing a familiar platform, falsely claims that a
  site builder cannot rank, or promises search rankings.
- Exact cost, delivery-time, and outcome claims require current evidence.

### Image and showcase rules

- Lead with recognizable business environments: counters, storefronts, booking
  stations, shelves, devices, receipts, cables, and back offices.
- People should be absent, distant, blurred, or incidental unless a real,
  approved client image is the proof.
- Generated environments are illustrative atmosphere, never client evidence.
  Real screenshots, dates, and approved client records carry proof.
- The public Lab is a showroom, not a repository. Never expose GitHub,
  repository metadata, source code, code-copy/share controls, specs, schemas, or
  package details. A visitor should reach the working experience in one click.

### Design Principles
1. Make every page prove competence quickly: what Little Fight does, who it helps, why it is trustworthy, and what to do next should be obvious fast.
2. Keep the brand human and neighborhood-aware: tactile, lively, and slightly playful, but never sloppy, childish, or salesy.
3. Use contrast in mode and pacing: immersive dark moments for proof and atmosphere, clearer lighter moments where reading and decision-making take over.
4. Prefer concrete proof, examples, and operational clarity over strategy jargon, explanation blocks, or generic feature scaffolding.
5. Motion should feel purposeful and premium: smooth, helpful, and optional, never noisy or gimmicky.
6. Design responsively with intent: desktop expansive, tablet composed, mobile tactile, readable, and fast.
7. Compose by information density: four related items usually form a 2x2 grid,
   three form columns, and two form a row. Preserve readable measure for long
   prose, but do not leave half a viewport empty without a deliberate visual or
   narrative reason. Asymmetry is a tool, not an automatic default.

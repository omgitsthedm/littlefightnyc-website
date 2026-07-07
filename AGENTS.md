# Project AGENTS

## Source Of Truth

Last verified: 2026-07-07.

Repo (off iCloud): `~/Code/LiFi NYC/Clients/LittleFightNYC/Brand/Website/littlefightnyc-website`
(Desktop path `~/Desktop/LiFi NYC/Clients/LittleFightNYC/...` is a same-name symlink into `~/Code`.)

Production work happens in the React/Vite app under `app/`. Netlify uses root `netlify.toml`, runs `cd app && npm ci && npm run build`, and publishes `app/dist`.

Netlify project:
- Site name: `littlefightnyc`
- Site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`

**Deploy model (confirmed 2026-07 for THIS repo):** GitHub `main` **is** canonical and **auto-deploys** to Netlify (~40s: push → auto-build → publish). Do NOT `netlify deploy --prod` manually (caused a 2026-06-30 incident). The general "LiFi sites are manual deploys" rule does **not** apply to littlefightnyc.

See `SOURCE_OF_TRUTH.md` before major edits.

## Tech Stack & Architecture (current — 2026-07-07)

- **App:** React 19 + TypeScript + Vite 7 in `app/`. Routing = React Router 7 (`react-router-dom`, `BrowserRouter` + `<Routes>`). Icons = `lucide-react`.
- **Routing / layout:** `src/App.tsx` defines all routes. Most pages inherit `EditorialShell` (QuietNav + QuietFooter + StickyHelpBar + RouteMeta + **CommandPalette**). ⚠️ The home page `/` is a **standalone layout** (its own `.lf-editorial` wrapper, own nav/footer) — it does NOT use EditorialShell, so any shell-only global (e.g. CommandPalette) must **also** be rendered in `Home.tsx`.
- **Rendering:** client-rendered SPA. `src/main.tsx` uses `createRoot` (not hydrate). At build, `scripts/prerender-seo.mjs` writes one static `index.html` per route (102) with full `<head>` SEO + JSON-LD (FAQPage, BreadcrumbList, LocalBusiness/ProfessionalService, DefinedTerm, Article, HowTo) and a lightweight SEO `snapshot()` in `#root` that `createRoot` replaces on load. ⚠️ So the visible body is **JS-gated** (not true SSR). Home below-the-fold mounts via `useDeferredSections()` on the next idle frame. **Open perf next-step:** true "instant-like-Apple" FCP needs a real SSG + `hydrateRoot` migration (route + section components are `lazy()`, which complicates `renderToString`).
- **Data (source of truth):** `src/data/site.ts` — `services`, `caseStudies` (+`metrics`), `answerGuides`, `areaPages`, `glossaryTerms`, `studioProjects`, `navItems`. Plus `journal.json`, `industries.json`. ⚠️ `src/data/seo-pages.json` is the **prerender's** SEO/schema source and is a **separate copy** — keep FAQ/meta in sync with `site.ts` (a node splice syncs area/glossary faq; scratch payloads at the session scratchpad).
- **Design system:** Axiom Momentum tokens in `src/styles/editorial/tokens.css` (bg `#050507`, orange `#F97316`, blue `#3B82F6` accent, Inter). Reveals via `src/styles/editorial/motion.css` `[data-reveal]` + `useScrollReveal`. Reusable editorial components in `src/components/editorial/` (PageHero w/ content-type icon, EditorialFigure, PullQuote, FaqList, StatBlock, SignatureBand, VisualIndex, MomentumSection, TheFight, ProcessFlow, BrandLine, AmbientField, CommandPalette).
- **CSS gotchas:** (1) `.lf-editorial button` reset strips custom `<button>` fill/border/padding — scope custom button rules under `.lf-editorial`. (2) global `.lf-editorial a` color (0,1,1) can override a single-class CTA's `color` (0,1,0) — scope CTA color rules under `.lf-editorial` too (this caused white-on-orange AA fails). (3) use `rgba()` not `color-mix()` inside gradients.
- **Build/deploy:** `cd app && npm run build` = `tsc -b && vite build && node scripts/prerender-seo.mjs`. ⚠️ **Prod build strips `console.log`** — debug built/live code with `window.__flags`, not console.
- **Conversion + infra:** `/fit-check/` (Netlify Function + Twilio voice intake). Security headers (CSP/HSTS/X-Frame DENY/nosniff/Referrer-Policy/Permissions-Policy) in root `netlify.toml`. Analytics: consent-gated GA4 + TikTok pixel via `src/lib/analytics.ts`.
- **Quality bar (live-verified 2026-07-07):** Lighthouse Home 92 / Services 90 perf, BP + SEO 100, CLS 0, TBT 0; Accessibility 100 (post contrast-fix); squirrelscan full = 83/B (ceiling = by-design HTML caching + service-area streetAddress omission + trailing-slash canonicalization).

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
- Bright orange as the lead brand signal
- Blue support tones for contrast, links, and readable accents
- Lexend for primary type
- Caveat as a selective accent voice
- React 19 + Vite + TypeScript SPA, prerendered for SEO, Netlify delivery (see Tech Stack above)
- WCAG-aware contrast, responsive intent, and reduced-motion respect
- Performance and polish should coexist; motion is welcome when it helps clarity or delight

### Design Principles
1. Make every page prove competence quickly: what Little Fight does, who it helps, why it is trustworthy, and what to do next should be obvious fast.
2. Keep the brand human and neighborhood-aware: tactile, lively, and slightly playful, but never sloppy, childish, or salesy.
3. Use contrast in mode and pacing: immersive dark moments for proof and atmosphere, clearer lighter moments where reading and decision-making take over.
4. Prefer concrete proof, examples, and operational clarity over strategy jargon, explanation blocks, or generic feature scaffolding.
5. Motion should feel purposeful and premium: smooth, helpful, and optional, never noisy or gimmicky.
6. Design responsively with intent: desktop expansive, tablet composed, mobile tactile, readable, and fast.

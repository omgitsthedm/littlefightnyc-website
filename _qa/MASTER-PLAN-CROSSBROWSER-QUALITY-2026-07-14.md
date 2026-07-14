# Little Fight NYC — Cross-Browser Quality Master Plan
**2026-07-14 · HEAD `fa5c487`**

Produced from four parallel audits (cross-browser CSS, performance, spacing/doctrine, docs reconciliation) + a live WebKit-vs-Chromium screenshot reproduction + live endpoint/asset checks. This plan targets the gap between "docs say done / Lighthouse 100" (all measured in **Chromium**) and the owner's lived **Safari** experience.

---

## Diagnosis — your complaints → root causes

| Your report | Root cause | Evidence |
|---|---|---|
| Title bar doesn't take the site color | **macOS Safari desktop ignores `theme-color` entirely** (WebKit product decision). Works only on iOS Safari 15+ and Chrome. Not a bug. | index.html:11 correct; RouteMetaManager.tsx sets valid values |
| "Sections randomly have dots behind, some black" | Dots = the blue `AmbientField` canvas (by design, rgba-safe). The **black** = card fills built as `color-mix()` gradients with **no solid fallback** → transparent on Safari <16.2, exposing `#050507` | case-studies.css:40,773,918,1045,1089; services-hub.css:86,105 |
| "Massive break in header quality" | Sticky header background is a **standalone `color-mix()` with no fallback** → transparent on older Safari; content scrolls under a plateless nav | QuietNav.css:6; RecentClients.css:168 |
| Frosted panels look wrong | 2 `backdrop-filter` missing `-webkit-` sibling → no blur on Safari (no autoprefixer in build) | CommandPalette.css:20; RecentClients.css:168 |
| "Scrolling is sloppy, not buttery" | Fixed full-viewport `mix-blend-mode` grain layers force per-frame recomposite on iOS + O(n²) canvas link loop | base.css:170-180; texture.css:14-24; AmbientField.tsx:68-85 |
| "Doesn't feel premium / flat" on Safari | Scroll-driven hero cinematics are `@supports`-gated to Chrome; **absent on Safari with no JS fallback** | PageHero.css:229,273; BrandLine.css:33; studio.css:68 |
| "Spacing all over the place, squished vs over-spaced" | **Two-tier build**: flagship pages token-driven; Areas/AreaDetail/ServiceAreaDetail/Glossary/GlossaryTerm/About/Legal hand-rolled inline, bypassing `.lf-container` + per-page rhythm | see Wave 4 |
| "Takes a long time to load" | `createRoot` **discards the prerendered snapshot and repaints** → desktop LCP 3.4s + a visible snapshot→hero flash | main.tsx:23 |
| Different spacing per browser | Safari-only `hanging-punctuation` + differing `text-wrap: balance/pretty` support → paragraphs wrap to different heights per engine | base.css:21,105,109 |

**What's already right (don't touch):** 0 TBT, 0 CLS, mobile Lighthouse 96, correct caching/preloads, leaflet + journal correctly lazy, self-hosted fonts, outcome-specific CTAs, sound color discipline, one real motion core, netlify functions live.

---

## The waves

### Wave 1 — Safari rendering repairs (kills "black sections" + "header break"). ~½ day, low risk
Mirror the defensive pattern already used correctly elsewhere (audit.css:30, TheFight.css:75, MomentumSection.css:233): declare a **solid `background` first**, then the gradient/color-mix line.
- **C1** case cards: prepend `background: var(--lf-paper);` at case-studies.css:40,773,918,1045,1089 and services-hub.css:86,105. Also drop the no-op `color-mix(...paper-2 100%, transparent)` → raw var.
- **C2** header/pills: add `background: rgba(5,7,12,0.85);` before the color-mix at QuietNav.css:6; same for RecentClients.css:168.
- **C3** add `-webkit-backdrop-filter` at CommandPalette.css:20 and RecentClients.css:168.
- **M1** change 4 `color-mix(in oklch …)` borders → `in srgb` (QuietFooter.css:75,171,196; StudioStatusStrip.css:12).
- **Systemic:** add `autoprefixer` to the build (PostCSS) so this class of bug can't recur, then let it own vendor prefixes.

### Wave 2 — Perceived speed (kills the load flash). ~½–1 day, medium risk
- **P#1** switch `createRoot` → `hydrateRoot` OR make the `.lf-seo` snapshot visually match the hero (same dark bg + hero image + H1 position) so there's no discard/reflow (main.tsx:23). Highest single lever on desktop LCP.
- **P#2** granular `manualChunks` (vite.config.ts:15-17); get eager JS under ~120KB.
- **P#3** un-barrel `site.ts` (203KB) into per-domain modules so CommandPalette/RecentClients/StickyHelpBar don't drag all site data.
- **P#4** trim eager fonts to 400/600/700; lazy-load 500/800/italics (~100KB saved).
- **P#6** hero H1 animates transform-only (never opacity) so LCP text never gates on the char cascade.

### Wave 3 — Buttery scroll + premium parity on Safari. ~½ day, medium risk
- **H1** de-fix or de-blend the grain layers (render grain on a `contain`-ed non-fixed element, or bake into section bg); gate the SVG turbulence `::before` behind `@supports`. Halve AmbientField node cap on coarse-pointer/iOS.
- **H2** add a small IntersectionObserver/scroll-position JS fallback that applies the transform-only hero scale on Safari, restoring the cinematic parity (reduced-motion already handled).

### Wave 4 — Spacing/layout unification (kills "squished vs over-spaced" + misalignment). ~1 day, medium risk
- **P1.3** replace every inline `maxWidth + marginInline` wrapper with `<div className="lf-container">` (Areas, AreaDetail, ServiceAreaDetail, Glossary, GlossaryTerm, About, Legal) → fixes desktop gutter misalignment vs nav/footer.
- **P1.1** define ONE `.lf-section` rhythm primitive (responsive `padding-block` space-8→9→10) and route every page through it; retire per-page inline paddings + ad-hoc clamps.
- **P1.2** reconcile DESIGN.md's documented 128px rhythm with reality — pick the real value and enforce.
- **P1.4** nav "Tech Audit" pill `min-height: 40px` → `44px` (48 to honor DESIGN.md). WCAG 2.5.8.

### Wave 5 — Token + component + dead-code hygiene. ~1 day, low risk
- **P2.1** add `--lf-text-2xs` (~11px) token; migrate the 10/11/12px mono labels sitewide (biggest one-off-value source).
- **P3.2** extract `<SectionLabel>` + `<LinkedIndexList>` for the 5 hand-rolled pages (also resolves P2.3).
- **P2.3** remove 4 dead `opsz` survivors (AreaDetail.tsx:184, ServiceAreaDetail.tsx:121, Glossary.tsx:64,77) + stale comment.
- **P2.4/P2.2** migrate off-token motion durations/easings + hero type to tokens.
- **P3.1** delete 3 empty media-query blocks + orphaned ⌘K comment in QuietNav.css.

### Wave 6 — Cross-browser text parity. ~2 hrs, low risk
- **H3** decide policy on Safari-only `hanging-punctuation` (base.css:21) and `text-wrap: balance/pretty` (base.css:105,109): keep as progressive enhancement or normalize so Safari/Chrome line-wrapping matches. Documentation/decision item.

---

## Standing / David-gated (cannot be code-fixed — from docs reconciliation)
Google Search Console token · `sameAs` social handles (IG/Yelp/GBP — **not** LinkedIn per PLACEHOLDERS.md) · registered `streetAddress` · GBP listing work (the real traffic bottleneck) · AHA checkout + PHC framing + Rachel "bookings" honesty confirmations · GA4/TikTok consent policy · DataForSEO paid key · **your physical iOS device QA pass**.

## Two small decisions
- Home OG image appears to have changed to a plain photo (`local-business-base.webp`); `/og-image.png` 404s. Confirm intended vs regression.
- `tech-audit-scratch` Netlify form name (analytics.ts:323) — rename or keep for form continuity.

## Doc hygiene / corrections
- CLAUDE.md top note "IN TREE, not committed" is stale (committed `1147a71`, live).
- OVERHAUL-2026-07-12.md log stops at Wave 14; git shipped through ~Wave 19.
- Correction: the docs audit wrongly reported `netlify/functions/` empty + endpoints 404 — **verified false**; ask/tech-audit functions are present and live (`/api/ask`→400, `/api/tech-audit/submit`→200).

---

## Verification protocol (the "checks" — every wave)
1. `npm run build` + `npm run lint` green.
2. **Real WebKit** screenshot pass (Playwright `--browser=webkit`) at 1440/834/390 — confirm the specific fix, no black sections, header plate present.
3. Chromium parity check (no regression).
4. Live Lighthouse (desktop + mobile) after perf waves — LCP target ≤2.5s desktop.
5. Push → Netlify auto-build (~30s) → re-verify on live.
6. **Your physical iPhone/iPad pass** — the one check no automation replaces (mandatory per doctrine).

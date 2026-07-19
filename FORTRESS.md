# THE FORTRESS PLAN — littlefightnyc.com

*Created 2026-07-19. This is the standing structural plan for the whole estate.
No more one-off fires: every change from here maps to a wave below. When a wave
ships, mark it. When priorities shift, edit THIS file — David's words: "stop
putting out a little fire here or there; build a fortified castle."*

## North star

One funnel, every page a station in it:

**SEEN** (Google, GSC-measured) → **HOOKED** (dramatics up top) →
**CONVINCED** (instruments + record + work) → **ONE DOOR** (call / tech audit).

A page that doesn't serve a station gets merged or killed.

## Ground truth — 2026-07-19 baseline (OpenSEO + GSC, sc-domain:littlefightnyc.com)

- 28 days: **306 impressions (+70%), 0 clicks, avg position 16.7** (page 2).
- ~130 impressions = "seo company upper east side" variants → `/areas/upper-east-side/`,
  positions 5–20. This is the #1 growth lever on the whole site.
- Brand queries ("little fight", "little fights", 16 imp) land `/about/`, not home.
- Estate: 179 prerendered routes. 14 area pages (8 Manhattan, 6 BK/Queens),
  56 noindexed area×service combos, 37 journal posts, 28 answers, 7 case
  studies, 3 studio, 6 glossary, 4 services + hub.
- OpenSEO dashboard: `localhost:3001` (`~/creative-tools/open-seo`, docker).

## The redundancy ledger (what exists twice or worse)

| Surface | What it is | Verdict |
|---|---|---|
| `/tech-audit/` | THE conversion form (16 internal refs, share-target, voice webhook) | **The one door. Keep.** ✅ |
| `/audit/` | Marketing wrapper that linked OUT to the subdomain tool | **RETIRED 2026-07-19** — 301 → /tech-audit/, page deleted, links swept. |
| `audit.littlefightnyc.com` (+ `audits.` alias) | "Website Audit Lab" — Netlify site `audits-littlefightnyc` (6588401d…). **Backend is DEAD: `/api/run-audit` 404s** — every scan submission errored. The homepage "Scan my website" CTA fed this broken form. | Retire: redirect-only deploy staged at scratchpad `audit-retire/`; needs David to run the netlify deploy (permission-gated). Optional future: rebuild a REAL scanner on-domain, WITH auth + rate limiting (a0cf04f lesson). |

Rule going forward: **one job, one page.** Before any new page ships, check this
ledger's logic: does an existing page already own the job?

## Home stacking law (shipped 2026-07-19)

Marketing narrative = AIDA. Dramatics top, work bottom (David's directive):

1. **Hero** — the hook + both CTAs
2. **The Fight** — the why, fight-card instrument (the drama, moved up)
3. **The Four** — Web Design / Tech Support / Consulting / Personalized Software, each with its instrument
4. **The Record** — SignatureBand credibility stats
5. **Recent work** — proof, at the bottom above the door (moved down)
6. **Neon sign** — the lights-are-on close
7. **BrandLine → Contact** — one door

## The waves

### Wave 1 — One Door Per Job (redundancy kill) — IN PROGRESS
- [x] Home restack per stacking law (`2ef50da`)
- [x] `/audit/` retired → 301 → `/tech-audit/`; page + audit.css deleted; footer,
      palette, homepage proof-band CTA repointed; dead `reportId` plumbing
      stripped from TechAudit; 178 routes (`12290a4`). (The "fold the scanner
      in" idea died on contact with reality — the scanner backend was already
      dead, so there was nothing to fold.)
- [ ] Retire `audit.littlefightnyc.com` — **David runs:**
      `netlify deploy --prod --dir <scratchpad>/audit-retire --site 6588401d-53d4-42a3-a4f8-89fb3b937446`
- [ ] Sweep for any other duplicate-job surfaces (old subdomains vs lab.)

### Wave 2 — Template Law (everything looks + functions the same) — AUDITED 2026-07-19

**Contract matrix (26 page templates, static + rendered audit):**
- PageHero + QuietContact close: **26/26 pass** (by-design exceptions: Home =
  QuietHero standalone; /es/ = own Spanish chrome; TechAudit = no contact close
  because the page IS the contact action).
- Copy register jargon sweep: **0 hits** in site copy (journal "optimized" /
  "end-to-end encryption" = topical technical terms, correct usage).
- 16px floor: **0 hardcoded sub-16px font-sizes** in CSS.
- Wow/instrument coverage: strong on Home, all 4 services, Contact, TechAudit,
  Answers detail, Journal, Examples (RECORD wall + coverage matrix), Areas
  (MiniMapNYC), 404/es (TugAvatar). Hubs carry their content grids by design.
- Estate more consolidated than feared: `/studio/` → `/services/#studio` and
  `/industries/` → `/examples/#industries` already redirect. One-door logic
  was partially in place; the audit surfaces were the real stragglers.
- [x] Same-family hero dupes fixed: west-village → `storefront-health-foods`,
  park-slope → `storefront-beauty-supply` (synced AreaDetail + Areas +
  seo-pages/og; all 14 area heroes now unique).

**📸 PHOTOGRAPHY PUNCH LIST (needs David's real photos — cross-family hero
dupes that redistribution can't fix; the 73-asset library is 100% allocated):**
- `nyc-street.webp` carries Answers hub + CaseStudies hub + a glossary term
  (+ spreads) — the most-reused photo on the site
- Contact shares East Village's hero (`nyc-stickys-steam`); Journal hub shares
  Chelsea's (`manhattan`); Examples shares LES's (`nyc-chinatown-night`);
  Services hub shares Midtown's (`nyc-street-crowd`); About shares Astoria's
  (`interior-spice-shop`)
- BK/Queens area heroes are generic interiors, not neighborhood frames
- Services right-column thumbnails mismatched (pre-existing note)
Priority order for a photo batch: hubs first (Answers, Case Studies, Journal,
Contact), then 6 BK/Queens neighborhood frames.

### Wave 3 — The Front Line (GSC-driven, highest ROI)
- `/areas/upper-east-side/`: push pos ~8–16 → top 5. Deepen content, internal
  links from home/services/journal, FAQPage schema check, title/meta CTR pass.
- Brand queries → home: title/schema so "little fight" ranks the homepage #1.
- Replicate the UES winning pattern across the other 13 area pages (they're
  authored well — 2 duplicate heroes to fix: UWS/West Village share
  `nyc-street.webp`, UES/Park Slope share `nyc-hair-salon-street.webp`; BK/Queens
  heroes are generic interiors, not neighborhood shots — needs real frames).
- Weekly GSC readout from OpenSEO; decisions follow data, not vibes.

### Wave 4 — Page-by-page fortress pass — RUN 2026-07-19
Rendered review at 1440px, funnel order. Results:
- **🔥 P0 FOUND + FIXED LIVE (`2096660`): the entire canvas-instrument fleet
  was `display:none` on shell pages** — legacy-overrides.css carried a bare
  `.lf-editorial canvas[aria-hidden]` kill from the cinematic-hero era. The
  Jul-18 service-page instruments had NEVER been visible to users; the
  tech-audit "dead void" was hidden AuditBench. Verified live post-fix:
  home ×5, contact, tech-audit, it-support all display:block with real
  heights. **Verification law: toDataURL proves painting, NOT visibility —
  always also assert computed display + offsetHeight** (CLAUDE.md corrected,
  `f21758c`).
- Fixed: minimap caption said "eight Manhattan neighborhoods" over a 14-item
  three-borough grid (`26006c2`).
- Verified healthy, no changes needed: tech-audit (post-fix), case-study
  detail (narrative arc + diagram + device frame), about (essay/promises/
  founder/census), journal hub (heatmap/featured/index), studio detail,
  services hub, examples.
- Remaining polish = photography punch list (Wave 2 section) + the sparse
  publishing heatmap (fills itself as posts ship).

### Wave 5 — Watchtower (keep it won)

**The weekly ritual (any session, David says "run the watchtower"):**
1. `cd ~/creative-tools/open-seo && docker compose up -d` → wait for
   http://localhost:3001 (first boot builds ~60s)
2. Read the littlefightnyc project's Search Performance: clicks / impressions /
   avg position (28d) + the striking-distance table
3. Compare to the log below; append a dated row; push
4. Report movement to David: first clicks ever, UES entering top 5, brand
   queries landing home instead of /about/, impressions ±30%
5. If the UES experiment proves out, replicate the winning pattern to the next
   area page — one at a time, never a mass stamp

**GSC log:**
| Date | Impressions (28d) | Clicks | Avg pos | Notes |
|---|---|---|---|---|
| 2026-07-19 | 306 (+70%) | 0 | 16.7 | Baseline. UES "seo company" cluster ~130 imp, pos 5–20. Brand queries land /about/. UES title/content experiment shipped this day. |

- Standing gates every ship: signal ratchet, jargon sweep, margin audit,
  16px floor
- New-page rule: funnel station + ledger check + template contract, or it
  doesn't ship

## Standing laws (from CLAUDE.md, restated so this file is self-sufficient)

- Founded **2021**. Four items of focus. No pricing published. No install
  prompts. No loading splash. Orange = signal only. Left-aligned editorial
  asymmetry is the brand — never "fix" it into centering. Prerender parity for
  hero copy. Mobile + iPhone/iPad verification before "done."

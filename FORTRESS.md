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
| `/tech-audit/` | THE conversion form (16 internal refs, share-target, voice webhook) | **The one door. Keep.** |
| `/audit/` | "Instant Website Scan" client-side tool (2 internal refs) | Fold INTO /tech-audit/ as the instant-scan top section, then 301. |
| `audit.littlefightnyc.com` | Standalone "Website Audit Lab" Netlify site (pre-consolidation era) | Retire: 301 whole subdomain → littlefightnyc.com/tech-audit/. |

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
- [x] Home restack per stacking law
- [ ] Move the instant scanner from `/audit/` onto `/tech-audit/` (scan first,
      form below), 301 `/audit/` → `/tech-audit/`, update footer + palette links
- [ ] Retire `audit.littlefightnyc.com` → 301 to `/tech-audit/` (Netlify)
- [ ] Sweep for any other duplicate-job surfaces (old subdomains vs lab.)

### Wave 2 — Template Law (everything looks + functions the same)
One contract per template, verified page-by-page:
- PageHero (eyebrow + icon + title + dek + distinct image) on EVERY inner page
- Same section rhythm tokens, same CTA close (QuietContact), same FAQ block
- Copy register: gritty, plain, 5th-grade clear, zero jargon (sweep = 0 hits)
- 16px floor / 18-20 body everywhere (already tokenized — verify per page)
- Every page gets its "wow": an instrument or one earned dramatic moment
- Checklist artifact: one row per route family, pass/fail per contract item

### Wave 3 — The Front Line (GSC-driven, highest ROI)
- `/areas/upper-east-side/`: push pos ~8–16 → top 5. Deepen content, internal
  links from home/services/journal, FAQPage schema check, title/meta CTR pass.
- Brand queries → home: title/schema so "little fight" ranks the homepage #1.
- Replicate the UES winning pattern across the other 13 area pages (they're
  authored well — 2 duplicate heroes to fix: UWS/West Village share
  `nyc-street.webp`, UES/Park Slope share `nyc-hair-salon-street.webp`; BK/Queens
  heroes are generic interiors, not neighborhood shots — needs real frames).
- Weekly GSC readout from OpenSEO; decisions follow data, not vibes.

### Wave 4 — Page-by-page fortress pass
Every unique template audited against the Wave-2 contract + conversion intent,
in funnel order: home → services ×4 + hub → tech-audit → areas ×14 → case
studies ×7 → examples → about → journal hub → answers hub → contact → es →
glossary → industries → studio → legal/404.

### Wave 5 — Watchtower (keep it won)
- OpenSEO weekly baseline vs. this file's numbers
- Signal ratchet, jargon sweep, margin-audit, 16px floor as standing gates
- New-page rule: funnel station + ledger check + template contract, or it
  doesn't ship

## Standing laws (from CLAUDE.md, restated so this file is self-sufficient)

- Founded **2021**. Four items of focus. No pricing published. No install
  prompts. No loading splash. Orange = signal only. Left-aligned editorial
  asymmetry is the brand — never "fix" it into centering. Prerender parity for
  hero copy. Mobile + iPhone/iPad verification before "done."

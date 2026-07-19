# THE FORTRESS PLAN — littlefightnyc.com

*Created 2026-07-19. This is the standing structural plan for the whole estate.
No more one-off fires: every change from here maps to a wave below. When a wave
ships, mark it. When priorities shift, edit THIS file — David's words: "stop
putting out a little fire here or there; build a fortified castle."*

## North star

**Revenue doctrine (David, 2026-07-19): Websites = the monthly revenue driver
— NATIONWIDE reach, as many clients as possible. Personalized Software = the
whale. Tech Support + Consulting = feeder channels that create website and
software clients. The NYC-neighbor brand stays primary; /nationwide/ is the
volume door.**

One funnel, every page a station in it:

**SEEN** (Google, GSC-measured) → **HOOKED** (dramatics up top) →
**CONVINCED** (instruments + record + work) → **ONE DOOR** (call / tech audit).

A page that doesn't serve a station gets merged or killed.

## Ground truth — 2026-07-19 baseline (OpenSEO + GSC, sc-domain:littlefightnyc.com)

- 28 days: **306 impressions (+70%), 0 clicks, avg position 16.7** (page 2).
- ~130 impressions = "seo company upper east side" variants → `/areas/upper-east-side/`,
  positions 5–20. This is the #1 growth lever on the whole site.
- Brand queries ("little fight", "little fights", 16 imp) land `/about/`, not home.
- Estate (updated Jul-19 late): 181 prerendered routes, 124 sitemap URLs.
  **18 areas — ALL FIVE BOROUGHS** (10 Manhattan, 4 Brooklyn, 2 Queens, The
  Bronx + Staten Island added with wave-2 photos), /nationwide/ + /zh/ doors live,
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

## The Door Doctrine (2026-07-19, David's brief: "a beacon of hope")

Who arrives at a door: someone broken, hurt, desperate, angry, frustrated —
mid-crisis or mid-dream, usually on a phone. Every door serves three readers
at once, and they all want the SAME thing expressed three ways:

| Reader | What they need | How it's delivered |
|---|---|---|
| The human | To feel RECOGNIZED, then given hope and a path | The emotional arc below |
| Google | Comparative usefulness, expertise, trust (May-2026 core update) | Same arc: specific h1, structured answer, local evidence, schema |
| AI engines | An extractable, citable, attributed answer | Same arc: the short-answer block, clean claims, FAQ schema, llms.txt |

**The arc every door follows (Pixar spine, NY accent):**
1. **RECOGNITION** — name their exact situation in their words, first viewport,
   before any animation. "Your card reader died mid-rush." Not "IT solutions."
   Recognition is the empathy beat AND the search-intent match AND the AI
   answer target. Speed is part of it: performance IS empathy — a panicking
   person gets the recognition line in under a second or we've failed them.
2. **HOPE** — the short answer: "This is fixable. Usually today." Confidence
   without corporate polish. (Already our shortAnswer field — keep it.)
3. **PROOF** — the wow: one earned dramatic visual that dramatizes THEIR
   problem being solved (the instruments). Show, never claim.
4. **THE PATH** — numbered, plain, honest — INCLUDING the free/DIY step.
   Generosity is neighbor behavior, and it's what AI engines cite.
5. **THE DOOR OUT** — one warm CTA, zero pressure. "No phone tree. A person."

**One voice, three tempos** (same grit, different pacing):
- Emergency doors (down/broken/urgent) → ER-nurse tempo: calm, immediate,
  action-first, wow minimal.
- Dream doors (new website, own your software) → hope tempo: vision, bigger
  wow, warmth forward.
- Research doors (glossary, comparisons, answers) → patient-teacher tempo:
  generous, complete, zero sell until the end.

**The ship-gate for any door:** it must contain something ONLY Little Fight
could write — real neighborhood knowledge, a real case detail, a real
opinion. If a competitor could publish the same page by swapping the logo,
it's a doorway page and it doesn't ship. (This is also exactly Google's
scaled-content line.)

**Blind spots named 2026-07-19 (the "what are we not considering" list):**
1. **Reviews are the biggest untapped asset** — 50+ reviews correlates with
   40× revenue (Wix 310M-site data). We have zero on-site review surface and
   the GBP has none. Bigger lever than any page polish. → David collects;
   then we build the reviews surface + aggregateRating schema.
2. **We've never tested what AI engines actually say about us.** AEO isn't
   just structure — it's being the source ChatGPT/Perplexity cite for "tech
   help small business NYC." Run the real queries, see if we appear, optimize
   toward citation. Unmeasured = unknown.
3. **Photography is trust evidence, not decoration** — stock interiors say
   "template"; David on-site in a real shop says "neighbor." E-E-A-T + human
   trust + AI entity confirmation, one asset.
4. **The promise after the click** — 2-hr callback is the hope the site
   sells; the system behind it is where hope is confirmed or betrayed. The
   /thanks/ page is currently utility — it should be the warmest page on the
   site (you just asked a stranger for help; answer THAT).
5. **Emotion isn't measured** — impressions/clicks miss "did it feel right."
   Watchtower should grow door→call conversion, scroll-to-CTA, per-door.
6. **Dead-end doors** — a door must walk the visitor to the next right room
   in-context (related service + related proof), never strand them.
7. **Scaling warmth without templating it hollow** — 121 doors can't all be
   hand-authored at once. One reference door built to this standard, then
   replicate with REAL variation, evidence-led (watchtower data picks which
   door gets authored next).

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
| 2026-07-19 (push) | — | — | — | GSC PUSH RUN: sitemap-index resubmitted; indexing requested /library/ + /areas/upper-east-side/. Page-indexing report (stale, 7/9): only 17 indexed / 24 not (6 redirect + 2 404 + 16 crawled-not-indexed — mostly April-era ghost URLs of the old static site, plus /services/ from May 9). Google is drip-crawling a young domain; sitemap ping + requests are the levers. **🚨 AI-PRESENCE TEST: site:littlefightnyc.com = ZERO results on DuckDuckGo/Bing — absent from the entire Bing index → invisible to ChatGPT search, Copilot, DDG. BING WEBMASTER TOOLS = DAVID'S #1 URGENT ITEM.** (Bing direct search blocked by CAPTCHA — human-only.) |

- Standing gates every ship: signal ratchet, jargon sweep, margin audit,
  16px floor, **reading-grade audit (target ≤8, hard ceiling 9)**
- **📖 ELI5 DEBT: ✅ PAID (2026-07-19).** Re-audit: 62 docs, avg grade 6.8,
  zero over the hard-9 ceiling. The five journal posts (11.6→6.6, 11.1→7.6,
  10.2→6.5, 9.5→7.0, 9.5→7.2) and five industry pages (all ~10→6-7.4)
  rewritten in register, facts preserved. Tail: 9 docs sit 8-9 (inside
  ceiling, above target) — tighten opportunistically, not urgent
- New-page rule: funnel station + ledger check + template contract, or it
  doesn't ship

## THE COMPLETE TABLE (2026-07-19 — "what is still left off the table?" Answer: nothing. This is all of it.)

**Mascot canon (David, 2026-07-19): the TUGBOAT is the mascot — "the tough
little boat that can," Thomas-the-tank-engine energy. David is NOT the mascot;
his photo is trust evidence (founder card, E-E-A-T spots), the tug is the
character. The tug appears at emotional beats: help-is-coming (/thanks/ ✅),
lost-but-safe (404 ✅), no-translation-needed (/es/ ✅), reading-companion
(journal sail ✅). Future tug moments must be EARNED beats, not decoration.**

### Claude executes (in order)
1. ✅ ~~Warm /thanks/~~ + ✅ ~~answer→service bridges×27~~ (`7cbfa10`)
2. ✅ ~~Library consolidation~~ — /library/ live: answers stream first, journal
   below; hubs 301; 64 detail URLs untouched; crawler snapshot lists all 64
   links (old hub snapshots listed ZERO); footer 5 groups → 4
3. ✅ ~~Case-studies hub fold~~ — 301 → /examples/; 8 details + sitemap intact;
   footer Proof group deduped; 176 routes
4. ⏸ **HELD (David): all neighborhood/area pages frozen until his real-photo
   batch lands.** Then: reference door build — UES to the full Door-Doctrine arc (recognition
   viewport, tempo, wow, path, bridge); becomes the template others inherit
5. ✅ ~~Tempo classification~~ — 5 emergency doors (website-down, POS-down,
   email-spam, GBP-suspended, form-broken) lead with the bridge: "Down right
   now? Skip the reading." Research doors keep it after the reading
6. ✅ ~~Door→call measurement~~ — door_bridge event with per-door slug label
   on every bridge; watchtower reads it alongside GSC
7. ✅ ~~Photo integration wave 1~~ — 10 of the 55 real frames live: 5 area
   heroes (EV Holy-Cow night, Midtown market, UES lit trees, UWS 72nd St
   station, WV corner café), 4 hub heroes (Contact = the warm open door,
   Examples = fish market, Services = Wall St crossing, Library = golden-hour
   avenue), About bagel-counter figure. og images synced. **Bench (45 frames,
   source: ~/Desktop/LiFi NYC/New York Neighborhoods): Radio City neon, wet-neon
   Times Sq pavement, amber fountain, ice-cream-truck sunset, LOVE-graffiti
   gate, FISH sign, juice-counter staff, UES boutique interior, diner night,
   Washington Sq Arch + WTC (fuel for Greenwich/FiDi pages #15/#16), and more —
   cast into body figures + future doors as pages get their doctrine pass.**
8. ✅ ~~GSC push phase~~ — run 2026-07-19 (see GSC log); re-run after next
   content wave; coverage re-check when the report refreshes (was 10 days stale)
9. ✅ ~~AI-engine presence test~~ — verdict: NOT PRESENT. Zero Bing-index
   results → invisible to ChatGPT/Copilot/DDG. Root cause is index absence,
   not markup (robots/llms.txt/schema all correct). Fix = Bing Webmaster Tools
   (David) + IndexNow ping (Claude can wire into deploys after registration)

### David's list (nothing here blocks Claude's list)
- **Reviews — the 40× lever.** Ask every happy client (Rachel, PHC, CC Films,
  AHA…) for a Google review. At 3-5 reviews Claude builds the on-site review
  surface + aggregateRating schema. At 50 the math says 40×.
- Subdomain kill: `netlify deploy --prod --dir <scratchpad>/audit-retire
  --site 6588401d-53d4-42a3-a4f8-89fb3b937446`
- GSC: Request Indexing on /areas/upper-east-side/ (URL Inspection)
- GBP: hours, real photos, categories, posts (June: 54 views, 0 actions)
- **Bing Webmaster Tools + Apple Business Connect** (free; Bing feeds
  ChatGPT/Copilot, Apple feeds Siri/Maps — the non-Google AI surface)
- Unsplash batch (shot list below) + any real shop/on-site photos
- iOS device pass; decide Spanish-inquiry servicing

**📸 PHOTO BATCH 1 LANDED (2026-07-19): `~/Desktop/LiFi NYC/New York Neighborhoods` —
55 real frames: Midtown 13, West Village 9, UES 9, UWS 7, Greenwich 6, FiDi 6,
East Village 5 (mixed orientation, up to 6000px). Covers 5 existing area pages
+ hub/contact dupes; Greenwich Village + FiDi = candidate area pages #15/#16
(ledger check before creating). Still wanted: Brooklyn/Queens 6 (Williamsburg,
Bushwick, Park Slope, DUMBO, Astoria, LIC) + the 4 hub-mood shots below.**

### 📸 The shot list (Unsplash, search terms included — landscape ≥1600px)
| Slot | Direction | Search |
|---|---|---|
| Answers hub | someone getting a real answer — counter conversation, NYC | "bodega counter conversation nyc" / "shopkeeper talking customer" |
| Case Studies/Examples | work being shipped — hands, tools, storefront glow | "small shop owner night nyc storefront" |
| Journal hub | notes/desk with NYC texture | "notebook coffee window city night" |
| Contact | a door literally open, warm light | "shop door open warm light night nyc" |
| Williamsburg | Bedford Ave storefront/street | "williamsburg brooklyn storefront street" |
| Bushwick | mural wall + shop | "bushwick street art storefront" |
| Park Slope | brownstone + stroller block | "park slope brooklyn brownstone street" |
| DUMBO | cobblestone + bridge frame | "dumbo brooklyn manhattan bridge street" |
| Astoria | Ditmars/broadway shop row | "astoria queens street shops" |
| Long Island City | waterfront + industrial | "long island city street queens" |
| UWS or West Village | replace the shared `nyc-street` | "west village nyc corner cafe street" |

## Final QA campaign (2026-07-19 late) — the button-up

- **Thermo review:** stale /journal/ route-meta entry killed; dead selector out
  of base.css (first attempt nearly removed the display-typeface rule — caught
  by diff review; ⛔ lesson: never script-remove CSS rules by brace-hunting);
  journal CATEGORY maps deduped into journalArt.ts. site-answers.ts at 1,196
  lines = WAIVED (pure content data).
- **Web-app chrome:** VERIFIED COMPLETE — #F97316 theme-color/msapplication/
  mask-icon/apple-touch + standalone manifest + black-translucent iOS bar. No
  changes needed.
- **Axe:** ZERO critical/serious across 12 routes (fixed: heatmap ol[role=img]
  → div/span). Every image has an alt (sweep-verified).
- **Ultraship security: 96/100, 0 vulns.** Accepted-low: CSP style-src
  unsafe-inline (React inline styles; no injection vector). REAL: Twilio
  TWILIO_AUTH_TOKEN unset in prod → webhook fails open → runbook Task 6 (David).
- **Ultraship SEO audit → QA pass 3 (`6b94b50`):** fixed the stranded link
  graph (shell links /areas/ + nationwide + es + zh on all 182 pages; /areas/
  hub HTML emits all 18 area links — was ZERO), schema truth (inLanguage per
  locale, availableLanguage trilingual, nationwide areaServed +Country:US,
  speakable selector now has a target, og:locale, square logo, es title trim).
- **Squirrel surface (125 pages): 81/B** — Core SEO 95, Security 97, NINE
  categories at 100. Remaining drag = DOCTRINE-LOCKED accepts: Structured Data
  46 (no streetAddress — SAB law), Crawlability 54 (slash-normalization 301s —
  correct), Performance 65 (HTML no-cache + render-blocking CSS — deliberate,
  real-throttle paint ~270ms; 'unminified'/'LCP-hints' = verified false
  positives). **PERF GROUND TRUTH re-measured on live prod 2026-07-19 late
  (CDP Fast-4G + 4x CPU, mobile): FCP 1.25s / LCP 1.28s / interactive 524ms /
  full load 2.4s — throttled. Unthrottled first paint remains sub-second.
  Local-machine Lighthouse runs under build load report 2.8s+ FCP — ARTIFACT,
  do not trust Lighthouse run on a busy machine; CDP real-throttle is the
  standing method.** These accepts are permanent; do not chase the score into
  breaking doctrine.
- **Lighthouse fleet (live, 8 runs):** A11y + SEO 100 on every run, TBT 0ms,
  CLS ~0; desktop perf 96-98. 🔥 ROOT-CAUSED: register-sw.js reloaded every
  FIRST visit (clients.claim → controllerchange → reload) — the site loaded
  twice for every new visitor (~4.5s mobile). Fixed with hadController guard
  (`d10a8a7`) + exact-match hero preloads for hero-* pages. Remaining minor:
  ~46KB unused entry JS, sizes-tightening on area heroes, TikTok third-party
  cookie (BP 78 on 2 desktop runs) — accepted/known.
- AGENTS.md published at /AGENTS.md (agent experience).

## Standing laws (from CLAUDE.md, restated so this file is self-sufficient)

- Founded **2021**. Four items of focus. No pricing published. No install
  prompts. No loading splash. Orange = signal only. Left-aligned editorial
  asymmetry is the brand — never "fix" it into centering. Prerender parity for
  hero copy. Mobile + iPhone/iPad verification before "done."

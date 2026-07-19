# Session Record — 2026-07-18/19 — "The Fortress Campaign"
*One overnight session, ~30 commits (`2ef50da` → `6ef2977`), all live on
littlefightnyc.com via auto-deploy. FORTRESS.md is the living plan this session
created; this document is the historical record of what happened and why.*

## The arc
David's directive that shaped everything: *"Stop putting out a little fire here
or there — build a fortified castle. A beacon of hope."* Later sharpened by the
revenue doctrine: **Websites = the monthly driver (nationwide, max clients);
Personalized Software = the whale; Tech Support + Consulting = feeders.**

## 1 · Foundations
- **OpenSEO + Google Search Console wired, $0:** created GCP project
  `rising-exchange-502906-d4`, OAuth client, connected `sc-domain:littlefightnyc.com`.
  **Baseline: 306 impressions / 0 clicks / avg pos 16.7 (28d).** UES "seo
  company" cluster = ~130 impressions, the #1 lever.
- **FORTRESS.md born** — funnel north star, redundancy ledger ("one job, one
  page"), waves, watchtower ritual + GSC log, Door Doctrine, revenue doctrine.

## 2 · Structure (Waves 1–3)
- Home restacked: Hero → The Fight → The Four → The Record → Recent Work → Neon → Contact.
- **Audit consolidation:** `/audit/` retired (301 → /tech-audit/); discovered the
  audit.littlefightnyc.com scanner backend was DEAD (`/api/run-audit` 404s) —
  the homepage "Scan my website" CTA had been feeding a broken form.
- **The Library** (`/library/`): Journal + Answers hubs merged into one front
  door; 64 article URLs untouched; crawler snapshot lists all 64 (old hubs
  listed zero). Case-studies hub folded into /examples/.
- **UES front line:** title "Upper East Side SEO Company & Web Design", 2
  SEO-intent FAQs, sitewide links, schema alternateName "Little Fight".

## 3 · The Door Doctrine
Every page serves three readers (human / Google / AI engines) with one arc:
RECOGNITION → HOPE → PROOF → PATH → DOOR OUT. One voice, three tempos
(emergency = ER-nurse, dream = hope, research = teacher). Ship-gate: a page
must contain something only Little Fight could write.
- All 27 answers now bridge to their service ("Reading done. Want it handled?");
  5 emergency doors lead with the bridge ("Down right now? Skip the reading.").
- /thanks/ became the warmest page ("We've got it from here.") with the tug.
- door_bridge conversion events per page.

## 4 · Growth surfaces
- **/nationwide/** — "Built in New York. Works anywhere." (grade-2.2 copy,
  SiteInFourteen instrument, FAQPage, crawlable body).
- **/zh/** — full Simplified-Chinese pitch on the /es/ model; hreflang
  en/es/zh trio; footer "En español · 中文".
- **Neighborhoods 15–18:** Greenwich Village, FiDi, The Bronx (Yankee Stadium
  hero), Staten Island (ferry-neon hero) — **all five boroughs, 18 areas**,
  every entry authored with ship-gate local knowledge.

## 5 · The photo layer (91 real frames from David)
~30 placed: 9 area heroes + 4 hub heroes + About's bagel counter + 16 area
figures with local-truth captions + 3 industry heroes (DRUGS-since-1904
pharmacy, Perfect Brows corner, bookshop) + the nationwide WTC avenue.
**The tugboat social card** (Oswald "The tech team your block never got." +
orange tug) replaced the coaster as og for home//es//zh/ + default. Favicons
were already the tug. Bench: ~15 frames logged for future passes.

## 6 · The tugboat (mascot canon: "the tough little boat that can")
- Carries the call in TheDirectLine (contact instrument).
- Nav logomark bobs + puffs steam on hover.
- Secret: type t-u-g anywhere → it sails the viewport. Reduced-motion: skipped.
- Appears only where it has a JOB: thanks/404/es/zh/journal-sail/nav/og.

## 7 · Copy standard (ELI5 certified)
Measured all 60+ long-form docs: **avg grade 6.8, zero jargon, zero docs over
the hard-9 ceiling** after rewriting 5 journal posts (11.6→6.6 worst) and 5
industry pages (~10→6-7.4). Standing gate: nothing ships above grade 8.

## 8 · The QA campaign (the button-up)
- **🔥 P0: the entire canvas-instrument fleet was `display:none`** on shell
  pages (legacy `.lf-editorial canvas[aria-hidden]` kill rule). The Jul-18
  service instruments had never been visible. Fixed + verification law
  corrected: readback proves painting, NOT visibility.
- **🔥 The service worker double-loaded every first visit** (clients.claim →
  controllerchange → reload). ~4.5s invisible tax on every new mobile visitor.
  Fixed with a hadController guard. Exact-match hero preloads added.
- **SEO audit fixes:** the prerendered link graph had stranded /areas/ (17
  orphan neighborhoods), /nationwide/, /es/, /zh/ — all now crawlably linked
  from every page. Schema truth: per-locale inLanguage, trilingual
  availableLanguage, Country:US on nationwide, live speakable target, og:locale,
  square logo.
- **Axe: zero critical/serious ×12 routes.** Cross-browser sweep (Chromium +
  WebKit × desktop + mobile): all clean. Security 96/100, 0 vulns.
  Squirrel 81/B — nine 100s; deductions all doctrine-locked (SAB address,
  no-cache HTML, slash 301s). Lighthouse fleet: A11y/SEO 100 every run,
  TBT 0ms, CLS ~0. Real-throttle ground truth: FCP 1.25s on Fast-4G.
- **Micro-interactions completed:** card images lean in 1.045× on hover;
  editorial photos settle 1.06→1 via scroll-driven CSS. (Caught: answers
  thumbs' base transform — used composing `scale` property.)
- AGENTS.md published; /zh/ got its main landmark.

## 9 · Research on record
- Page-count strategy (July 2026): quality-per-page > volume; doors-vs-journey
  model; scaled-content abuse; Wix 310M data (reviews 40×, blogs 5× bookings).
- Both design-video checklists verified: psychology 3/3, design tips 6/6.

## 10 · Verified-false-positive lore (do not rechase)
Local Lighthouse under machine load lies (2.8s FCP artifacts); squirrel's
"unminified JS" = license-comment detector; "LCP preload missing" = wrong
(preloads exist); transparent-text contrast flags = gradient clips.

## The handoff
- **David's runbook:** `~/Desktop/LFNYC-PAPERWORK-RUNBOOK.md` — 6 tasks
  (Bing ⚡, subdomain kill, GBP+reviews 💰, Apple, GSC quick-wins, Twilio token).
- **Gated Claude follow-ups:** IndexNow (after Bing), reviews surface (after
  3–5 reviews), watchtower Mondays → replicate winning door patterns.
- **Estate:** 182 routes · 125 sitemap URLs · 18 areas · 3 languages ·
  7 industries · 64 library articles · 8 case studies.
- **Trigger phrases:** "run the watchtower" · "paperwork done" ·
  "reviews are landing".

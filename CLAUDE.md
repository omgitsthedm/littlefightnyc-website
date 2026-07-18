# Little Fight NYC Website Config

## 2026-07-17 (later) — Full-site security + error audit (LIVE, `a0cf04f`)

Whole-site sweep. **One real finding, now fixed; everything else verified clean.**

- **FIXED — SignatureBand title collided with the stat row (`56b9273`).** "THE RECORD" section: the orange "small businesses." headline sat on top of 2012/14-day/Free/Custom. Root cause = the `.lf-editorial h1,h2,…,p { margin: 0 }` reset (0,1,1) beating the component's bare `.lf-signature__title` (0,1,0), zeroing its 96px bottom margin. Scoped both title + eyebrow under `.lf-editorial` (0,2,0). **This is the heading form of the button-reset gotcha — any bare single-class heading rule that sets margin will lose to that reset; use a descendant selector or scope under `.lf-editorial`.**
- **FIXED — removed two orphaned unauthenticated endpoints (`a0cf04f`).** `/api/ask` + `/api/tech-audit/submit` were deployed, public, unauthenticated, no rate limiting, and **unused** (the live form is Netlify Forms, `data-netlify`). Latent paid-LLM/SMS/email cost-abuse vector. Both now 404. **KEPT `tech-audit-voice.mts`** — real Twilio webhook, HMAC-SHA1 signature-validated (`timingSafeEqual`, secure default). The React frontend does NOT call the serverless functions; don't wire a form to them without adding auth + rate limiting first.
- **Verified clean:** `npm audit` 0 vulns; no hardcoded secrets, `.env` untracked, no server-env in client bundle; CSP (`script-src 'self'`, `frame-ancestors 'none'`, `base-uri`/`form-action 'self'`) + HSTS preload + X-Frame DENY + nosniff + Permissions-Policy all live; tsc + eslint clean; **0 broken internal links** (172 hrefs / 178 pages); 32 routes × 2 viewports = 0 real console errors / overflow / broken images / lost assets; 404s return HTTP 404 + noindex + real page; all 7 `dangerouslySetInnerHTML` sources are first-party static data (journal/industries JSON, hardcoded SVG) behind the strict CSP.
- **QA-tooling caveat (recurring):** a Range-rect glyph-overlap detector flags clients/fight/momentum/contact-block home headings as "colliding" (ov 7–18px). All **false positives** — line-box leading overlaps between adjacent text blocks. Verified by eye. Real collisions (SignatureBand) show the next block visually ON the heading; these don't. Discriminator: is the next block display-size (stats) or small body text (lede/dek)? Only display-size next-blocks collide when the heading margin is zeroed.

## 2026-07-17 (later) — Careful re-land, wave by wave (LIVE, `d79620c`)

After the rollback below, the reverted work was re-landed **one wave at a time, each re-verified against THIS tree instead of replayed**. That mattered — half the old commits were false in the rolled-back tree. Waves live: `21e98ef` (dead code + radius bug + WCAG icon) → `0650769` (10px dataviz floor) → `a1e5e90` (a11y/SEO/dek) → `8468177` (Tugboat) → `272b904` (splash) → `1ad20c4` (i18n scaffolding). Final sweep: **18/18 pass** across 9 routes × desktop/mobile — splash clears, tugboat present, one h1, no sub-10px dataviz, palette `#050507`, no lost assets, no overflow, no console errors.

**i18n is landed but inert, and that's the point.** `available.ts` reads a NON-eager `import.meta.glob` (keys only), so `HAS_TRANSLATIONS` is build-time and neither the JSON nor i18next enters the bundle; `LanguageSwitcher` renders null and never lazy-imports the inner component. Verified: i18next is isolated to one lazy chunk, the eager `index` chunk stayed **byte-identical (221.47 kB)**, and a real load downloads **0** i18n chunks even at the footer. Drop a second `src/i18n/locales/<code>/common.json` and it activates itself. **Land deps WITH their sources** — splitting them is what broke the rollback deploy.

**The brand kit was NOT what broke the site.** Its entire visible footprint is the nav mark + a palette shift. The centering (`1abf6a7`/`1f8e71a`) landed **~20 hours later** and is unrelated — the rollback just bundled them. So the Tugboat came back on its own.

**Landed:** the live `--lf-radius-md` bug (defined nowhere → square install card); ServiceEditorialSpread hover icon bone→ink on orange (**2.51:1 → 7.14:1**, a real WCAG failure); proven-dead code; a **10px legibility floor** on 9 sub-10px dataviz labels (the ONE SYSTEM chips were 8px mono — unreadable); the area×service dek (was lowercasing `plain` → "for **nyc** businesses… **google** signals", mangled + run-on, on 56 pages); `noindex` on the thin combos (hubs/services/home stay indexable, sitemap 121 urls / 0 combos); drawer `inert` + non-dangling `aria-controls`; `--lf-error`/`--lf-success`; Tugboat mark + full favicon set; the compose-held splash.

### ⛔ Standing rules this session established — do not relearn these

- **NO LOADING SPLASH ON THIS SITE. Ever. `272b904` reverted by `d79620c`.** The site **prerenders** — the hero headline, photo and both CTAs are painted and complete at **400ms with no JS**. A splash that waits on `fonts.ready` + hydration therefore hides a *finished page* for **~3.6s** on a real throttled phone (measured: user sees content at 400ms without it, ~4000ms with it). There is no "app-load gap" to cover here. Filmstrip at 0.8s/2.0s/3.2s with the splash = a black screen and a small tugboat, three times.
- **Lighthouse's simulated throttling actively LIES about this.** It scored the splash build *better* (perf 85 vs 79, LCP 3.7s vs 4.6s) because a fixed overlay that paints instantly flatters FCP while hiding the very content the metric represents. **Ground truth = a real-throttle filmstrip** (CDP `Network.emulateNetworkConditions` + `Emulation.setCPUThrottlingRate`, screenshots on a timer). Verify "does it clear" AND **"what is it covering"**.
- **There is no render-blocking CSS problem — don't go hunting one.** Real first-paint is **~270ms**; Lighthouse's `render-blocking-resources` audit reports **None / 0ms savings**; the LCP hero is 43KB and loads in **0ms**. The "84% render delay / 3s" reading was the splash, now gone. And the P0 rule still stands regardless: **never onload-swap async CSS** (CSP `script-src 'self'` blocks the inline handler → whole site unstyled).

- **PALETTE IS NEUTRAL BLACK. David's explicit call (2026-07-17).** `--lf-ink #050507` / `--lf-paper #1A1C23` / `--lf-bone #FFFFFF`. Do **not** re-land the midnight navy (`#06080F`/`#0E1220`/`#F0F2F8`) from `3f3837d`/`ac1a629`. Anything palette-coupled stays out with it — notably `451fd9c`'s skeleton-shimmer tokenization, which swaps `#0f0f14`/`#0d0d11` for `var(--lf-paper)`/`var(--lf-paper-2)` and only holds under navy.
- **`git checkout <ref> -- app/` does NOT delete files added after `<ref>`.** That's what broke the first rollback deploy: `package.json` reverted (dropping `i18next`) while the i18n sources stayed → Netlify's clean `npm ci && npm run build` died on `TS2307`. **The local build passed on stale `node_modules`.** Always verify in a throwaway worktree with a real `npm ci`.
- **The splash ground is hardcoded `#050507` on purpose.** It paints before any stylesheet, so it cannot read a token. The upstream version hardcodes `#06080F` — re-landing that flashes navy then snaps to black.
- **`markAppReady()` must fire from BOTH `EditorialShell` AND `Home`.** Home renders outside the shell, so the shell's signal never fires on `/` — the splash would sit until the 6s cap on the most important page.
- **RHYTHM IS DELIBERATE — the "8 different paddings" diagnosis was wrong.** Measured live: home has **2** distinct `padTop` values, and they pair (`clients` closes 64 + `work` opens 64 = 128px gap between related sections; `work` closes 128 + `fight` opens 128 = 256px break between groups). `innerW` 1440 vs 1312 is full-bleed moments vs contained columns — the asymmetric grid. Titles are already uniform 80px; contact-block's 126px is the intentional closer (same class as SignatureBand). **Flattening this to 128/128 + one column is what produced the monotony David rejected.** Do not "normalize" it.
- **Verify a claim against the tree you're in, not the commit message.** Three old claims were false here: `2a731d8` calls `listReveal` "inert" — in this tree `data-lf-reveal` is styled all over `base.css`, so deleting it strands sections blank (the exact bug `5f3d433` later fixed). `e4e573c`'s "label sizing standard" is **not** a legibility fix — it tokenizes 11px → an 11px token, explicitly zero-visual-change. `7c15a6e` deletes files that no longer exist here.
- **Your own QA lies too.** An overflow detector flags `__sr`/`lf-viz-sr` (sr-only, clipped to 1px *by design*) and Leaflet's OSM attribution. A contrast checker reports 1.00:1 on `color: transparent` gradient-clipped text. Settle asset "failures" with **never-recovered** (did the aborted URL also 200 in that load?), not abort count.

## 2026-07-17 — ⛔ ROLLED BACK: `app/` reset to `92287ec` + TheAssembly cut (LIVE)

**David's verdict on the Jul 16–17 work: "literally it's so much worse… it was so much better before the lab and brand kit."** He was right. `app/` is now restored to `92287ec` (Jul 16 08:40 — the last state before the Tugboat/brand-kit work), and TheAssembly is deleted. Everything between `cc9f3a9` and `d1b7fa6` is reverted **in the tree** (history kept; safety tag `pre-rollback-20260717`).

**What actually went wrong — the design lesson, not a code bug.**

`1abf6a7` ("kill dead-space / **left-hugging** section layouts") and `1f8e71a` read the site's **asymmetric, left-aligned editorial layout as a defect** and centered it — 11 × `text-align: center` + `margin: 0 auto`, WorkGrid's lede squeezed 58ch → 50ch. `479802b`/`cc04604` then locked every content column into a uniform centered 1200px. Net effect: the sharp editorial magazine grid became a generic centered template with dead margins either side.

**"Left-hugging" is not a bug on this site — it is the brand.** `CLAUDE.md`'s own doctrine says *sharp editorial grids*, *asymmetric grids*, *white-space-as-punctuation*. Never "fix" asymmetry into centering here. If a section looks left-heavy, that is the design language, not dead space.

**The verification lesson (this is the important one).** The presentation system was "verified" by measuring that every section resolved to 1200 / 128px / 52px — i.e. it was checked **against its own new spec**, which it passed perfectly while the site got worse. Uniform measurements are not quality. **Consistency is not the same as good.** Any design claim on this repo must be settled by *looking* at a render (and comparing against the previous deploy), not by asserting computed styles. Netlify keeps every deploy — `https://<deploy_id>--littlefightnyc.netlify.app` gives you the old site instantly for an A/B, no rebuild needed.

**TheAssembly is gone (David: "cut the section entirely").** The 200vh pinned chaos→ONE SYSTEM cinematic did technically work — it resolved correctly on scroll. But its **entry state was a full 1440×900 viewport of near-empty black** with six low-contrast chips, and it cost ~2340px of scroll to earn the payoff. A UX auditor flagged it as a dead void **twice** and both times it was dismissed as "a static screenshot froze it mid-scrub." The dismissal was wrong: scrolling it live at eye level, the void is real. Home is now 14709px → **12368px**. Deleted `TheAssembly.tsx/.css`; `BlueprintFrame` indices resequenced 1–6.

**Reverted along with it (re-land deliberately, one at a time, each verified by eye):** the tugboat splash, i18n scaffolding, the a11y/SEO audit batch (drawer inert, FAQPage match, the 56 combo-page `noindex`), the Tugboat mark + favicons, and the canonical midnight palette. These were real fixes bundled into a bad design direction — they are not lost, just not live. See `pre-rollback-20260717`.

**`ERR_ABORTED` on `/assets/` is expected here — don't re-chase it.** A QA pass will show aborted asset requests on desktop and it looks like the site failing to load its chunks. It isn't. Two separate causes, both benign:

1. **Responsive-image `srcset` candidate cancellation** (the reproducible one): the browser starts a candidate, picks a different width, and cancels the first. Always an `-NNN.webp`, and **the same URL also returns 200 in the same load**. Measured across 6 routes: 6 aborts, **0 never-recovered**.
2. **Harness teardown**: a script that prints its `requestfailed` list after `browser.close()` attributes teardown aborts of in-flight/prefetched chunks to the site. That's what made it look like route chunks (`ServiceDetail-*.js`, `ShareButton-*.css`) were failing.

**The metric that matters is never-recovered, not abort count** — i.e. for each aborted URL, did that same URL also get a 200 in that load? Assert on that, and on rendered health (`h1`, stylesheet count, broken images, console errors). Cold-cache control run: **52/52 assets × 200, 0 aborts, 0 orphans, 0 broken images**. A genuinely lost chunk would blank the route or throw, not render clean.

**Next (stated, not done):** fold the `presentation.css` retrofit into the components themselves so sections own their anatomy and the `:is()` override layer can retire.

## 2026-07-15 — Browser-chrome brand color completed (LIVE, `ecc67d6`)

Orange browser chrome is now complete across every platform surface. `theme-color`, manifest `theme_color`, and Safari `mask-icon` already carried **`#F97316`**; added `msapplication-TileColor` + `msapplication-navbutton-color` (`#F97316`) in `app/index.html` so Edge/Windows tiles match. `RouteMetaManager.tsx` re-asserts `theme-color=#F97316` on every route (add-or-update, never removes) — so the tab bar stays orange through SPA nav. Verified live: chromium + webkit × iPhone/iPad/desktop × light/dark all resolve `#F97316` (one webkit read caught the head mid-hydration → transient, self-heals). Orange chrome is intentional and matches the orange-as-signal doctrine; do not revert to a dark/default bar.

## 2026-07-15 — Type system, loading/butter, premium audit, perf split (LIVE, `fbe3b2f`)

Multi-session push continuing the Kimi pickup. Everything below is LIVE on `main` (Netlify auto-deploy) and verified; local ↔ GitHub ↔ Netlify all in sync at `fbe3b2f`.

- **Loading = butter (`482ac7a`):** the "broken order" load was the prerendered `.lf-seo` snapshot disagreeing with the client hero (different headline). Rebuilt the home snapshot to mirror `QuietHero` 1:1 (image + headline + subhead + CTA pills + trust row), surfaced the snapshot hero image (was hidden behind negative z-index), and dropped the `.lf-editorial` entrance fade (it flashed blank between two identical frames). Hydration is now a seamless settle.
- **Journal body split (`8f9a845`, flash fixed `3d3274b`):** `JournalPost` lazy-loads per-slug bodies via `import.meta.glob` (`scripts/split-journal.mjs` writes `src/data/journal-bodies/<slug>.json`). Chunk 307KB→11KB. A code review caught a `text→skeleton→text` flash on fresh loads; fixed by modulepreloading the exact per-slug body chunk in the prerender head (`journalBodyModulePreload`) + a 220ms skeleton delay. Skeleton now paints 0ms on fast loads.
- **"Boxing Poster" type system (`8369ec3`) + rebalance (`ec9124d`):** Oswald-700 condensed headlines + Barlow-400 body, self-hosted via `@fontsource` (CSP-safe). `--lf-display`→Oswald, `--lf-serif`/`--lf-sans`→Barlow; Bricolage/Inter removed. Key follow-up: 17 heading line-heights (0.85–0.98, tuned for Inter) were cramped in condensed Oswald — retuned (large display→1.0–1.02, section→1.05). Metric-matched fallback `@font-face` (Arial Narrow @ size-adjust:103%, measured Oswald≈AN×1.029) kills the FOUT re-wrap. **`fontPreloads()` was silently dead** (still pinned to retired `inter-*` filenames) → now preloads Oswald+Barlow.
- **5-lens premium audit + fixes (`0d30364`):** parallel live auditors (perf/a11y/visual/motion + research). No P0s. Fixed: `site` chunk modulepreload (removed a per-route round-trip), lucide micro-chunks → one `icons` chunk, RouteMeta lazy in shell, WebKit heroParallax import race (uncaught TypeError on ~1/3 cold Safari loads) wrapped in catch+retry, 44px touch targets (share/see-all), reduced-motion for neon-hum (specificity bug) + BrandLine parallax, TheAssembly chips now read as cards, mobile coverage-matrix keeps nouns + sticky column, contact headline de-scaled (4xl→3xl). **Myth busted:** the "fonts download twice" was a benign 0-byte cache hit, not real waste (verified by bytes). Full checkoff: `_qa/audit-2026-07-15-premium.md` (gitignored).
- **Content (`5f22050`):** `site.sameAs` = real Instagram (`instagram.com/littlefightnyc`) — schema Organization link (was empty). Swapped the one placeless stock shot (Krakow coworking) on the Services "Owner view" for `shop-interior.webp` (a small-shop interior). Other laptop uses left — they sit on tech-topic pages and read fine; the visual-pass folder's leftovers are non-NYC (Dingle/Ireland, Ladock/England, Krakow).
- **Perf — site.ts split (`d81c8df`):** the ~200KB/68KB-gz shared chunk dragged all content data onto every route. Extracted the 4 big pure-data arrays into `site-answers.ts` (96KB) / `site-areas.ts` (50KB) / `site-cases.ts` (17KB) / `site-glossary.ts` (13KB); `site.ts` re-exports as a barrel (all imports + build scripts unchanged). Core `site` chunk 200KB→**23KB / 9KB gz**; Vite tree-shakes each page to its slice (home loads only `site`; answer→answers; etc.; About loads all via SiteCensus, by design).
- **Examples pacing (`fbe3b2f`):** the "record" proof grid was ~13 all-orange cells (decoration, diluting orange-as-signal) → values now white Oswald.
- **Sweep:** squirrel 83/B (the 1 "fail" = HTML `max-age=0`, correct for a frequent-deploy site); `areaServed` (US-NY + City NY) confirmed declared so the no-storefront SAB schema is right; broken-link crawl clean (all 200, 1 h1, 0 console errors); all 37 journal bodies load; iOS device pass done by David.
- **Only open item = Google Business Profile** (David's login; June 54 views / 0 calls). Site is SEO-strong; GBP is the traffic gate. `streetAddress` intentionally omitted (remote SAB).

## 2026-07-14 — P0 recovery (unstyled prod) + 4-lane audit fixes (LIVE, `76af943`)

Picked up a Kimi Code session (`~/Desktop/kimi lifi.txt`) that had shipped `b9e84c9` and died on a Kimi quota 403 mid-deploy.

- **P0 (`dfd8439`): the LIVE flagship was rendering FULLY UNSTYLED on mobile + desktop.** `b9e84c9`'s `asyncCssPlugin` (vite.config.ts) rewrote the stylesheet `<link>` into `preload` + inline `onload="…rel='stylesheet'"`. The site CSP is `script-src 'self'` (no `'unsafe-inline'`/`'unsafe-hashes'`), so the browser blocked that inline handler → the preload never became a stylesheet → `styleSheets=1`, body transparent, default-blue nav for every visitor. Fix: removed the plugin (CSS ships as a normal render-blocking `<link rel="stylesheet">`, CSP-safe, applies pre-paint) and moved the head platform/connection inline `<script>` (also CSP-blocked) into `app/public/boot.js` served from `'self'`. **Never use onload-swap async-CSS on this repo; keep pre-paint JS external.** Verified live: 0 CSP violations, styleSheets 15.
- **Journal perf (`c35f52b`):** `journal.json` (37 posts, 83% HTML body) was bundled into a 302KB/82KB-gz chunk shared by the journal LIST, publishing heatmap, and site census. `scripts/split-journal.mjs` now derives `journal-index.json` (meta + precomputed wordCount) at build/predev; only `JournalPost` imports the full bodies. `/journal` list journal payload ~82KB → ~9KB gz (network-capture verified).
- **Correctness + perf + a11y (`9011026`):** added an `ErrorBoundary` around the routes that force-reloads once on a stale chunk-hash failure (was a blank white screen for returning visitors after a deploy; route chunks now go through `importWithRetry`); TikTok pixel now fires per SPA nav (was once/session) and boots only on the canonical domain (was firing on localhost/previews); MiniMap filters the current slug before `fitBounds`; `main.tsx` dynamic-imports analytics/attribution/heroParallax off the entry chunk; deleted 663KB of orphaned JPEGs; **nav "Start a project" CTA ink fixed 2.8:1→7.26:1** (the global `.lf-editorial a` rule had overridden it to light — the recurring specificity gotcha); home "Scan my website" blue CTA 3.68:1→5.17:1 (deep blue-600); case-study "Project at a glance" stats no longer break mid-word ("Squa/re") — word-shaped values detected semantically + no intra-word breaks.
- **A11y + UX (`76af943`):** mobile nav drawer is now `role="dialog"`+`aria-modal` with body-scroll lock; Tech Audit field errors are `role="alert"`; aside phone got a 44px tap target; case-study hero scrim deepened through the headline band; nav label "BACK 9AM ET" → "REPLIES AT 9AM ET".

Audit method note: a UX auditor flagged the home "Sound familiar?" section as a dead void — it's **TheAssembly**, the approved 260vh pinned scroll-cinematic (chaos→assembly). A static screenshot froze it mid-scrub; not a bug, left as-is.

**Deferred (scoped follow-ups, NOT done):** perf wave 2 — slim `RouteMeta` off the full 97KB `seo-pages.json` (build a flat `{path→title/desc/image}`; SEO-safe but touches per-route meta, do focused), `JournalPost` per-slug body split, font-weight prune (8 declared), `site.ts` (68KB gz, 24 importers) domain-split. Image items needing David's assets — Services/Examples/Journal heroes are European stock (not NYC), Services right-column thumbnails are mismatched. UX polish for visual iteration — journal publishing heatmap reads sparse (3/365 lit), home SignatureBand stat-row spacing.

## 2026-07-12 — Full-site defect audit: legacy closers-as-openers + chunk-scoped CSS (IN TREE, not committed)

David: "audit the whole website and find basic coding errors and why this is happening." Swept all 127 routes × chromium+webkit × 390×660/390×844/1440×900 (console errors, overflow, text-overlap detector, offscreen text, tap targets) + static tag-balance/foot-gun sweeps. Root causes found were NOT viewport geometry this time — they were two systemic classes:

- **Legacy closers-as-openers corruption** (journal.json/industries.json bodies write `</tag>` as `<tag>` for a/tr/thead/tbody/table/section/article/ul/li/svg). `prepareLegacyHtml` only repaired some, and its `<section>` separator transform ran UNCONDITIONALLY — doubling closers in the 3 already-well-formed 2026 posts. Visible damage: guide-post "Keep/Connect/Replace/Build" cards nested 9-deep (each card squeezed narrower on phones), empty 5×23 `<a>` tap targets, mashed "Call…Text usEmail usContact formBy David Marsh · Published…" runs, unstyled mashed topic-tag rows, and stripped-`<svg>` diagrams leaking junk prose ("404 independent source not found") into `/journal/ai-google…`. **Fix (all in `src/lib/legacy-html-core.mjs`):** corruption-gated section/article separator repair, bare `<a>`→`</a>`, `<tr><thead><tbody>` + `<tr><tr>` table repairs, whole-`<svg>…</svg>` removal, CTA-row/meta wrap moved into the shared pipeline (covers journal too), topic-tag runs wrapped as `.lf-post__tags` chips (styled in journal.css), and a per-tag `balanceTag()` that drops orphan closers (they'd close the prerender page's own `<article>` wrapper early) and appends missing ones. dist tag imbalance went 48 → 6 (all benign auto-closing `<p>`).
- **Prerender/app pipeline drift:** `prerender-seo.mjs` rendered industries with bare `prepareLegacyHtml` while the app uses `prepareIndustryHtml` — crawler snapshot had 14 unclosed nested `<article>`s per industry page. Now uses `prepareIndustryHtml(...).body`.
- **Chunk-scoped CSS miss (the `.lf-editorial a > span` class of bug):** `/studio/*` reuses `.lf-case-detail-related` + `.lf-case-detail__byline` markup but the styles live in `case-studies.css`, which Vite ships only with the CaseStudy chunks — the "More from the Studio" block rendered as one raw mashed line ("01AI client finderDakotaOur own AI…") on all 3 studio pages. Fixed with an explicit `case-studies.css` import in `StudioDetail.tsx`. **Gotcha to remember: any page that borrows another page's `lf-*` block must import that block's sheet — Vite code-splits CSS per lazy route.**

Verification: sweep re-run clean (0 console errors, 0 horizontal overflow, 0 real text overlaps across 762 loads); tsc + eslint green; build prerenders 127 routes. QA rig + JSON reports in the session scratchpad (`webkit-qa/audit-sweep.js`). Judged-acceptable non-fixes: footer fold links at 36×40px (WCAG 2.5.8-passing, stacked list, no adjacent targets); marquee link slivers at the clip edge (mid-animation state); wrapped-inline bounding-box "overlaps" (journal chips, bylines — no glyph overlap).

## 2026-07-07 — SEO-beast + bulletproof pass (LIVE, `74d00d1`)

- **FAQPage rich-results schema on every FAQ-bearing page.** Answers/services/home already had it; filled the gaps — 8 neighborhood hubs + 6 glossary terms — by syncing the authored `faq` into the prerender source (`seo-pages.json`) + wiring glossary faq through `glossaryPages()`. Verified in prerendered HTML: FAQPage + BreadcrumbList (+ DefinedTerm on glossary) emit. LocalBusiness/ProfessionalService (PostalAddress/GeoCoordinates/areaServed/OpeningHours) + breadcrumbs already emitted; **`streetAddress` and `site.sameAs` are still empty** — add real values to lift Structured Data + entity strength (see GBP note below).
- **Command palette (Cmd/Ctrl-K or `/`):** accessible quick-nav over all 40 destinations, fuzzy filter, arrow/enter, Esc. **Gotcha:** home renders OUTSIDE `EditorialShell` (standalone "magazine cover"), so a shell-only component never mounts on `/` — must also be rendered in `Home.tsx`. Also: **prod build strips `console.log`** — instrument with `window.__flags` when debugging live/built code.
- **Lighthouse (live final):** Home Perf 92 / A11y 96→(fixed) / BP 100 / SEO 100; Services Perf 90 / A11y 100 / BP 100 / SEO 100. CLS 0, TBT 0 across the board.
- **A11y fix:** the two home orange CTAs (`.lf-fight__cta`, `.lf-momentum__cta-button`) rendered WHITE on orange (2.8:1) because a global `.lf-editorial a` color rule (0,1,1) beat the CTA's `color:var(--lf-ink)` (0,1,0). Scoped overrides → dark ink on orange (~7:1). No other page affected.
- **Perf:** `EditorialFigure` now emits a responsive srcset (480/640/900) — killed the ~182KB oversized-image finding on service pages.
- **Security headers confirmed live:** CSP (frame-ancestors none, form-action self), HSTS+preload, X-Frame DENY, nosniff, Referrer-Policy, Permissions-Policy.

### ⚠️ Google Business Profile is the traffic bottleneck (not the site)
June GBP: 54 profile views, **0 calls / 0 chats / 0 website clicks / 0 interactions**. The website is now SEO-strong, but GBP is a **separate channel** that needs direct work in Business Profile Manager (David's login): confirm the website URL + call button are set, add real photos + categories + services, post updates, and get reviews. Website-side assists available once David provides the GBP URL + social handles: populate `site.sameAs` (currently `[]`) and add the real `streetAddress`/registered address to the LocalBusiness schema for entity/NAP strength.

## 2026-07-07 — Elevated visuals + honest case proof + signature moment + full audit (LIVE, `6ffd3c9`)

- **Case studies (7):** "Project at a glance" StatBlock of **honest, verifiable facts pulled straight from each real case body** (Rachel: `100` Lighthouse + `2 weeks`; AHA: `Next.js 14` + `1 day` drops; ClearHelp: `3 sites`/`1` Supabase; PHC: `3 tools → 1`; etc.). New `metrics?` field on `CaseStudy`. No fabricated numbers.
- **ServiceDetail (4):** outcome promise → PullQuote; each page now shows its own previously-unused `service.image` as a captioned `EditorialFigure`.
- **Signature moment:** new `SignatureBand` on home (full-bleed "THE RECORD / Punching above our weight for New York's small businesses" + 4 honest facts: 2012 / 14-day / Free / Custom) revealing in sequence over the blue `AmbientField`. Reduced-motion + off-screen-pause safe. Placed after RecentClients.
- **Full squirrelscan (`--coverage full`, 102 pages): 83/B.** Perfect (100) on Accessibility, Core SEO, Mobile, Images, Security, E-E-A-T, Local SEO, Social, URL Structure. The score ceiling is **by-design / needs-a-business-decision**, NOT code defects: canonical-chain = correct non-slash→slash 301 normalization; `perf/bad-caching` = HTML `max-age=0` is correct Netlify practice (hashed assets already immutable); `schema/local-business` streetAddress = intentionally omitted (service-area business — add a real registered address to lift Structured Data if wanted). Chasing these would risk correctness, so left as-is.
- Verified live: case metrics, service figures, and the signature band all render; 0 console errors, no overflow, mobile + desktop.

## 2026-07-07 — Wayfinding icon system (LIVE, `baee209`)

Made iconography consistent end-to-end (was only on card grids). **PageHero** now takes an optional `icon` (content-type chip by the eyebrow) — wired on all 23 detail + hub pages: MapPin (neighborhoods), BookOpen (glossary), HelpCircle (answers), Award (case studies), Sparkles (studio), Layers (services), Building2 (industries), Newspaper (journal), FileSearch (audit), ClipboardCheck (tech audit), Users (about), `service.icon` (each service). **FaqList / StatBlock** gained title icons (propagate to every glossary/area/about page); Area "What we fix"/"Nearby" + Glossary "Related" labels iconned. **Footer** group titles (Work/Proof/Answers/Local/Library) carry matching icons → footer reads as a symbol-guided site map. Verified live: hero chip + FAQ + 5 footer icons render, 0 console errors, no overflow. ⚠️ Gotcha hit: a bulk import-injection script wrongly added lucide icons to the *first* `import {` (react/react-router) in 2 files — always target the lucide import specifically.

## 2026-07-07 — Full content + visual build-out (LIVE, waves 1–2)

David: "every page needs to be real and have context and visuals — more than 2 sentences and one picture." Plus four discrete asks. Planned (`~/.claude/plans/fizzy-rolling-widget.md`), approved, shipped live in two waves (`1456977`, `d19b01c` + meta fix). Verified live desktop + mobile (390px): 0 console errors, no overflow, all pages hydrate.

**Structural (Wave 0):**
- Services overview → balanced **2×2** (new `VisualIndex variant="grid"`, no feature-span; kills the orphan 4th card). Other pages' `feature` variant untouched.
- **VenueCircuit** added to the Studio (real venuecircuit.app screenshot → `assets/case-venuecircuit.webp`, `status: "Live"`, `external` link, `/studio/venuecircuit/` prerender). Studio is now 3 cards (Dakota · Cockpit · VenueCircuit).
- **Journal filter bar** — client-side category chips (All / How To / Essay / Notebook / Software Guide, with counts). Accessible (`aria-pressed`), default All (prerender-safe). Chip CSS scoped under `.lf-editorial` to beat the button reset.
- **Field Guide → Examples** rename, incl. **URL** `/field-guide/ → /examples/` with a **301** (preserves the indexed URL). Swept nav/footer/routes/Navigate targets/site.ts/seo-pages/prerender-seo.mjs/_redirects. Component file still `FieldGuide.tsx` internally (route element only).

**Content depth — killed the filler (Wave 1):**
- **Local areas (8):** extended `AreaPage` type + authored real, neighborhood-specific `intro` / `businessLandscape` / `localSearchReality` / `whatWeFixHere[]` / `faq[]` / `nearby[]`, plus a **distinct NYC hero per area** (no more shared image). Content by a subagent, integrated + typechecked by me; no fabricated stats.
- **Glossary (6):** extended `GlossaryTerm` type + `howItWorks` / `example` / `costOfIgnoring` / `related[]` / `faq[]`; distinct hero each.
- **Answers (6):** grew 2 → 5 sections each; distinct hero per answer (was one shared image).
- **Case studies (7):** left as-is — already the richest pages after services; **declined to fabricate metrics** (VERA accuracy guardrail).

**Visuals (Wave 2):**
- New reusable components: **PullQuote** (call-out), **FaqList** (plain-English Q&A), **StatBlock** (quantified beat) — used sitewide.
- **About** rebuilt from a 6-paragraph wall → 2 captioned figures + a pull-quote + a StatBlock of the four promises (Free / 14-day / 24-hr / 2-hr).

**Types:** `AreaPage` + `GlossaryTerm` gained fields (all required; all entries populated). tsc + eslint green; build 102 routes. squirrelscan quick pass: 0 errors, no broken links, no lingering `/field-guide/` refs (warnings are pre-existing: trailing-slash redirects, streetAddress omitted by design, HTML cache headers).
- **Subagent content payloads** persisted at `scratchpad/wave1/{areaPages,glossaryTerms,answerGuides}.ts` and spliced into `site.ts` via a node marker-replace (repeatable).

## 2026-07-07 — The mission section + content-accuracy / true-wins pass (LIVE)

David: the site had no "wow / connect-the-dots" moment and the Services page was "a mess" with misrepresented work. Shipped `925d1b2` + `a169a97`, live-verified desktop + mobile.

- **New home section "The Fight"** (`components/editorial/TheFight.tsx/.css`, first in the deferred block right after the hero). The mission, told as an argument: *"The chains brought a tech team. The corner store never got one."* → a muted **WHAT THEY BROUGHT** card (Whole Foods / Great Clips / Uber Eats / DoorDash / PE roll-ups) **vs** an orange-championed **WHO WE'RE IN THE CORNER FOR** card (laundromat / hardware store / mom-and-pop diner / dental practice / corner florist) → the answer (systems the big guys have for a fraction of a big firm's bill; kill the pen-and-paper + spreadsheets; adapt to how you run; NYC ethos but the fight travels) → CTA "Put us in your corner" → /tech-audit/.
- **VERA removed entirely** (studioProjects + `/studio/vera/` prerender; both 404 live). It was fabricated on-site as a "listing intelligence pipeline" powering Local Search — in reality a killed NYC apartment-hunter that never shipped. False claim + dead → cannot be a "true win."
- **3D Schematics removed** from the Services/Studio surface — an explicitly-unproven sandbox ("the bet is not proven"), fails the true-wins bar for the flagship shopfront.
- **Dakota relabeled** `kind` → **"AI client finder"** (was "Autonomous sales agent"), per David's exact framing.
- **Studio section reframed** off "experiments" → **"Systems, not just sites."** Now the two genuine production tools only: Dakota (AI client finder) + Estimator's Cockpit. If David wants 3D Schematics back, restore the studioProjects entry + its seo-pages.json block.
- Prerender now 101 routes (was 103). No orphaned links; seo-pages.json valid; build/eslint green.

## Current Source Of Truth - Updated 2026-06-30 (consolidation)

The current live `https://littlefightnyc.com` source is this folder:

`/Users/davidmarsh/Desktop/LiFi NYC/Brand/Website/littlefightnyc-website`

Current app source is under `app/`. Netlify uses root `netlify.toml`, runs `cd app && npm ci && npm run build`, and publishes `app/dist`.

Netlify project:
- Site name: `littlefightnyc`
- Site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`
- **Deploy source: GitHub `main` → Netlify auto-build → auto-publish.**

**`main` IS now the canonical source of truth (as of 2026-06-30).** Edit `app/` → commit → `git push origin main` → Netlify auto-builds and publishes. Do NOT use manual `netlify deploy --prod` (it caused the 2026-06-30 incident where a stale `main` auto-deployed over a manual build). The old static-site `main` is archived at branch `archive/old-static-main-20260630`; stale local clones are in `Brand/_archive_littlefightnyc_20260630/`; a live mirror backup is in `Brand/_littlefightnyc-LIVE-backup-20260630/`.

Read `SOURCE_OF_TRUTH.md` before major edits.

## Latest Handoff
Read `HANDOFF.md` before making major edits. It contains the May 6, 2026 Claude Code handoff with the current live deploy, completed overhaul work, Tech Audit/phone intake state, SEO/AEO answer engine, case studies, verification results, concerns, and next work queue.

## Client
Little Fight NYC

## Positioning
Right-sized websites, tools, local visibility, and business systems for New York businesses.

Core promise:
Keep what works. Connect what matters. Replace what drags. Build what fits.

## Design Context
Audience:
Small and mid-sized New York business owners and operators, especially owner-operated teams under 50 that need clearer websites, cleaner tools, local visibility, and practical workflows.

Tone:
Direct, warm, practical, technically fluent, human, and built for New York time.

Aesthetic:
Premium midnight blue base, Little Fight orange as the lead signal, animated orange dot atmosphere, sharp editorial grids, practical system diagrams, and light fit/measurement cues without literal tailoring cosplay.


## Pending External Items
- Google Search Console verification token or HTML verification file.
- Final 1200 x 630 branded OG image (current composited coaster art is live; replace only if David supplies a newer official one).
- Real iOS device QA confirmation (David does the physical pass).

## 2026-07-06 — Full audit + Axiom Momentum design system

**Audit (live prod).** squirrelscan (100pp, overall 78/C), Lighthouse (mobile 83–97, desktop 99–100, A11y 100, SEO 100), fresh-state browser pass. Full report: `_qa/audit-2026-07-06.md`.

**Fixes shipped (in `app/`):**
- TikTok pixel `_env` TypeError (site-wide, from the prior commit) — root cause was the hand-rolled `ttq` shim omitting `window.TiktokAnalyticsObject`; TikTok's `events.js` resolves the queue via that global. Fixed in `src/lib/analytics.ts`. Restores tracking + takes Lighthouse Best-Practices 73→~100.
- CSP in `netlify.toml` now allowlists `analytics.tiktok.com` (script + connect) so the pixel isn't blocked when headers deploy.
- Added `width`/`height` to the image fallbacks missing them (WorkGrid tiles, ServiceEditorialSpread thumb) — CLS fix.
- Hero quick-contact email no longer breaks mid-address (`QuietHero.css` — `overflow-wrap: normal`).

**Design system — Axiom Momentum (product-OS soul).** David approved: scope = "formalize + evolve"; soul = "go Axiom product-OS."
- Tokens refactored to v6 in `src/styles/editorial/tokens.css`: bg `#050507`, surface `#1A1C23`, orange `#F97316` (was `#FF6F1F`), blue `#3B82F6` accent (now prominent), white/`#A1A1AA` text, border `#27272A`; added 32px radius tokens + snappy `180ms` motion. This SUPERSEDES the old midnight-blue/`#FE5800` palette FOR THIS SITE (a deliberate pivot from the agency default; documented in `app/DESIGN.md`).
- Fraunces retired → **Inter** carries display + body (weights 700/800 + italic added); dropped ~80KB from first paint. `--lf-serif` now points to Inter.
- New `MomentumSection` bento feature section on the home page (32px cards, orange icon chips, mono labels, blue Tech Audit CTA, staggered reveal, reduced-motion safe).
- Full system documented in `app/DESIGN.md` (Aura frontmatter format).
- Verified: `npm run build` green (tsc + vite + prerender), local render check (bg `#050507`, Inter h1, 0 console errors, no overflow, tap targets ≥48px on the new CTA).

**⚠️ Deploy divergence flagged.** `netlify.toml` in git already carries full security headers (CSP/HSTS/X-Frame-Options/etc.) + immutable asset caching, but LIVE serves almost none of them (only bare HSTS; assets `max-age=0`). So live is running a deploy that predates the current `netlify.toml`. Pushing main SHOULD trigger the auto-build that finally applies these — but confirm a new Netlify deploy actually fires and re-check live headers after. Do NOT manual `netlify deploy --prod` (per the 2026-06-30 rule).

**✅ RESOLVED same day.** Push to `main` DID auto-deploy (~40s) and the full headers went live (CSP, HSTS, X-Frame DENY, nosniff, Referrer-Policy). For THIS repo, `git push origin main` → Netlify auto-build → live in ~40s is confirmed working (the general "LiFi = manual deploys" memory does NOT apply to littlefightnyc — it's genuine auto-deploy from main).

## 2026-07-07 — Ultra-polish: whole-site convergence to Axiom Momentum (LIVE)

Multi-agent audit (design/copy/code) + a 26-agent polish workflow, shipped to main (commits `b1cbb4c`, `0cabcfb`). Net diff ~+880/−6215 across 88 files. Full plan: `_qa/polish-plan-2026-07-06.md`.

- **Core problem fixed:** the site was mid-migration — Momentum on 3 surfaces vs old editorial-magazine on ~90%. Converged all 24 inner-page heroes (`PageHero`) off the brown ground onto `#050507`, and VisualIndex + `legacy-overrides.css` cards to the 32px Momentum language.
- **Foundation:** deleted dead `index.css` (1280→74 lines) + 22 dead component files + Fraunces dep; swept 103 no-op `opsz` declarations; `--lf-bone-dim` → `#8A8A94` (WCAG AA); added `--lf-chip`/`--lf-lift` tokens; loaded Inter 900.
- **Chrome:** added the primary nav (`QuietNav`, desktop links + accessible mobile drawer) and the **mandated LiFi footer signature line** (both were missing).
- **TechAudit:** submit is now a Momentum orange pill with focus/error/success/disabled/loading states + client validation.
- **Copy/SEO/perf:** fixed 2 user-facing leaks, meta/voice/microcopy rewrites, Services/Studio/CaseStudies srcset (~400KB mobile), home hero preload, `/blog`→`/journal` links, LocalBusiness `postalCode` (streetAddress omitted — service-area business, no public street; add real registered address later if wanted).
- **⚠️ Button-reset gotcha (hit 3×):** `.lf-editorial button` reset (`background/border/padding: none`, specificity 0,1,1) silently strips any custom `<button>` styling (pill fill, card bg) unless the rule is scoped under `.lf-editorial` (→ 0,2,0). QuietContact/QuietHero channels and the TechAudit submit all needed this. Any NEW styled `<button>` must scope its base rule under `.lf-editorial`.
- Verified live: `/services/`, `/tech-audit/`, home — hero `#050507`, nav/footer/pill correct, 32px cards, no overflow, 0 console errors; security headers + schema live.

## 2026-07-07 — Tool-augmented pass (reconciled) + real imagery (LIVE)

A "TOOL RUNBOOK" (Firecrawl/OpenSEO/Immich/agent-browser, Astro rebuild) was handed over. **Reconciled: the runbook targets an OLDER site state** — the current React site already has real photos (136 assets), a real og-image, no CSS-shape hero, and today's polish. David chose "tools on the current site, no rebuild." Skipped Firecrawl (inventory redundant — not migrating) and the heavy Immich stack (image optimization done directly with cwebp/magick).

- **Real imagery shipped (commit `2c5963b`):** og-image → composited 1200×630 of the real Little Fight NYC coaster-at-a-bar ("Your website called. It needs us." + QR) on brand-black — every social share is now an authentic branded artifact. About hero → real Empire Diner NYC-night photo (was generic `local-business.webp` stock), responsive webp 480/640/900/1200. Verified live.
- **Form-capture QA PASSED:** live Tech Audit submit (`tech-audit-scratch`) → Netlify capture → `/thanks/` redirect works end-to-end. Used Playwright (not agent-browser — same outcome, no redundant tooling). A QA test lead was submitted (obvious "QA TEST — please ignore" markers).
## 2026-07-07 — Premium elevation (Apple-tier), waves shipping

Standing bar set by David: littlefightnyc.com is the flagship shopfront — Apple-designed-a-service-site premium, proactively elevated, never just patched. **Orange = signal (text/buttons/accents); background bursts = blue.** Editorial inspiration (do NOT integrate the cyan/magenta/Bodoni portfolio template — mine its *principles*): sequence-as-argument, white-space-as-punctuation, full-bleed moments earn drama, case-studies-as-narrative, asymmetric grids, restrained motion. Plus visual data explainers + premium cross-device scroll.

- **Blue bursts (LIVE, `517d0b8`):** flipped the orange hero/section glows to blue ambient (PageHero, QuietHero, MomentumSection) so orange text pops. rgba not color-mix in gradients.
- **Wave 1 — motion system (LIVE, `4cefda8`):** reliable route transition (page content re-keys → fade+rise, chrome persists; RR viewTransition prop is a no-op with BrowserRouter/<Routes>), scroll-aware glass nav, one motion language (choreographed reveals fade+16px/80ms stagger, tactile :active press on every CTA/card), `motion.css`. Reduced-motion safe.
- **Wave 2a — case studies as features (LIVE, `e80482a`):** `CaseStudyDetail` rebuilt data-driven for all 7 — text hero → full-bleed project moment → asymmetric sticky-meta + story → the Problem→Kept→Changed→Result **arc** as a numbered narrative spine (setup→tension→resolution), staggered reveal.
- **Wave 2b — visual data explainer (LIVE, `d1b2269`):** surfaced the unused `agencyProcess` data on About as a system-diagram flow (4 beats on an orange→blue line that draws in on scroll, icon chips on the line).

**Remaining roadmap:** Wave 2c — home/services editorial sequencing (pacing, full-bleed, asymmetric); Wave 3 — the signature showstopper (David picked "bold + wow": scroll-cinematic reveal or tasteful WebGL). Verified each: build/tsc/eslint green, desktop+mobile, 0 console errors, auto-deploy ~40s.

## Prior open item

- **⏳ OpenSEO/DataForSEO — awaiting David's key.** The SEO audit's new value = real keyword volume/difficulty + competitor SERP data + keyword→page opportunity map (not covered by on-page work). Needs a **paid DataForSEO key**: create account at dataforseo.com → top up ($50 min) → `DATAFORSEO_API_KEY = base64("login:password")`. Provide the key and I stand up OpenSEO (`every-app/open-seo`, docker) + run baseline + keyword map + final audit. Not standing up the idle Docker stack until then.

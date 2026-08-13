# VERA 2.0 diagnostic Lighthouse performance record

Release ID: `vera-2.0-2026-08-13`
Candidate: `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`
Status: **In Observation — P2 performance aftercare.** No P0/P1 functional defect was found by this diagnostic set. Before a strict Ready decision, record the adopted mobile performance budget, serial confirmation, and any approved exception.

## Method and evidence integrity

- Tool: Lighthouse CLI `13.4.1`, production `https://littlefightnyc.com/vera/`.
- Profiles: Today and Atlas, desktop and mobile, three runs per profile (12 JSON reports total).
- Mobile emulation: Moto G Power (2022)-class Chrome, 412×823 CSS pixels, 4× CPU slowdown, 150ms RTT, 1,638.4 Kbps throughput; storage, service-worker, shader-cache, and Cache Storage resets enabled.
- Evidence directory: `/Users/davidmarsh/Documents/Codex/2026-08-12/ok-w/work/vera-lighthouse-2026-08-13/`.
- Integrity: `LIGHTHOUSE-SHA256.txt` lists every report hash. The raw reports remain in that evidence directory and are intentionally not copied into the dossier.
- Important caveat: all four profile groups were launched concurrently. The reports are useful candidate diagnostics, but cross-profile comparisons and the high-variance Atlas result are not controlled serial measurements or field Core Web Vitals. Rerun the affected profile serially before asserting a hard budget or improvement.

## Exact all-run results

Times are milliseconds; transfer is bytes. Perf is Lighthouse’s 0–100 score.

| Report | Perf | FCP | LCP | Speed Index | TBT | TTI | CLS | Transfer | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `today-desktop-1` | 97 | 397 | 1,186 | 1,075 | 0 | 1,194 | 0 | 833,609 | 34 |
| `today-desktop-2` | 98 | 308 | 1,088 | 834 | 0 | 1,097 | 0 | 794,935 | 34 |
| `today-desktop-3` | 97 | 390 | 1,258 | 779 | 0 | 1,267 | 0 | 833,176 | 34 |
| `atlas-desktop-1` | 67 | 510 | 1,276 | 1,308 | 1,004 | 2,192 | 0.042 | 1,208,686 | 38 |
| `atlas-desktop-2` | 98 | 495 | 1,035 | 879 | 0 | 1,039 | 0.042 | 1,427,634 | 38 |
| `atlas-desktop-3` | 96 | 450 | 1,316 | 855 | 0 | 1,321 | 0.042 | 1,270,815 | 38 |
| `today-mobile-1` | 85 | 1,273 | 4,120 | 3,647 | 11 | 4,166 | 0 | 563,353 | 35 |
| `today-mobile-2` | 87 | 1,521 | 3,954 | 3,107 | 22 | 4,218 | 0 | 594,606 | 35 |
| `today-mobile-3` | 86 | 1,479 | 4,084 | 3,147 | 16 | 4,263 | 0 | 595,003 | 35 |
| `atlas-mobile-1` | 62 | 1,370 | 3,819 | 4,464 | 1,185 | 4,548 | 0 | 625,078 | 35 |
| `atlas-mobile-2` | 46 | 2,715 | 5,277 | 3,910 | 2,358 | 7,070 | 0 | 886,598 | 35 |
| `atlas-mobile-3` | 74 | 2,744 | 5,206 | 3,595 | 112 | 5,226 | 0 | 886,613 | 35 |

| Profile median | Perf | FCP | LCP | Speed Index | TBT | TTI | CLS | Transfer | Requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Today desktop | 97 | 390 | 1,186 | 834 | 0 | 1,194 | 0 | 833,176 | 34 |
| Atlas desktop | 96 | 495 | 1,276 | 879 | 0 | 1,321 | 0.042 | 1,270,815 | 38 |
| Today mobile | 86 | 1,479 | 4,084 | 3,147 | 16 | 4,218 | 0 | 594,606 | 35 |
| Atlas mobile | 62 | 2,715 | 5,206 | 3,910 | 1,185 | 5,226 | 0 | 886,598 | 35 |

## LCP elements and causes

### Today mobile

The LCP is text, not an image: `main#main > section.page > header.drophead > p.drophead__lede`. Its simulated LCP median is 4.08s; observed trace LCP is materially lower (1.31–1.78s), so the correct conclusion is slow under the documented cold-mobile simulation, not four seconds of literal browser paint delay.

- TTFB is healthy (median ~169ms). The high-priority `/vera/data/public.json` request starts at ~405ms and completes ~524–1,200ms; transfer is ~93KB but decoded resource size is ~1.67MB.
- VERA is a data-rendered SPA: the Today route/header arrives after the public feed is parsed/adopted. This data/render dependency, not a slow document response, controls the LCP candidate.
- `vera.css` is 23KB transferred and is render-blocking; Lighthouse estimates ~307–337ms potential FCP/LCP savings. It estimates ~17KB of current-route-unused CSS.
- Three high-priority preloaded fonts compete with the stylesheet; UI font transfer is ~82–113KB. The font-display audit passes, so this is bandwidth/critical-path contention, not invisible text.
- Today main-thread work is 483–608ms and TBT 11–22ms: it is not a sustained JS-blocking failure.
- The source unconditionally warms MapLibre with `loadMapAssets()` during idle time. Although Today never opens Atlas, every Today trace begins `maplibre-gl.js` at ~1.25–1.27s; it has zero transfer in these reports but still parses a ~939KB uncompressed library and consumes ~66–73ms CPU. A truly cold visit can transfer ~237KB.

### Atlas mobile

The LCP is also text, `section.workspace > header.workspacehead > div > p.workspacehead__lede`, not the map canvas. Atlas immediately loads/initializes MapLibre while the header is rendering.

- Two Atlas runs transfer ~887KB: ~329KB scripts, ~418KB other resources, ~92KB UI fonts, and ~237KB OpenFreeMap traffic. The lighter first run transfers ~625KB.
- `maplibre-gl.js` is ~237KB transferred / ~939KB uncompressed. MapLibre CPU is the dominant variable: ~0.70s, 2.02s, and 3.01s across the three runs; total main-thread work is 1.01s, 2.41s, and 3.33s; TBT is 112ms, 1.19s, and 2.36s.
- Runs two and three have effectively identical transfer and tile payloads, but radically different MapLibre CPU/TBT. This makes cold MapLibre/WebGL/style initialization the strongest demonstrated cause of the high score variance; tile timing contributes but is not the dominant variation.
- Two vector tiles transfer ~235KB and complete roughly 1.65–2.34s after navigation. The worst-score run did not have the slowest tile completion, reinforcing the CPU diagnosis.
- The same render-blocking CSS opportunity remains (~325–380ms), and Lighthouse estimates ~156KB unused JS, mainly MapLibre (~122KB) and route-unexecuted `vera-app.js` (~35KB).

## Non-findings

- The intentional 776-file / ~102MiB complete local MapLibre glyph bundle was **not** downloaded in any measured route. It is a deployment/storage/offline-resilience tradeoff, not an evidenced Lighthouse LCP transfer cause.
- No duplicated JavaScript is detected.
- Font display passes.
- No layout shift was observed on mobile; Atlas desktop CLS was stable at 0.042.
- No third-party JavaScript or analytics caused the result. OpenFreeMap tiles are the only relevant third-party network dependency; Atlas’s dominant cost is local MapLibre CPU.

## Evidence-backed safe candidates

1. Prevent non-Atlas idle MapLibre warm-up. Warm only after explicit Atlas pointer/focus intent or on the Atlas route. This confines MapLibre parsing/download to users likely to use the map while preserving direct Atlas-route loading.
2. On direct Atlas entry, permit header/loader first paint before starting MapLibre construction in a subsequent animation frame/task. Preserve current keyboard, focus-return, fallback, reduced-motion, and map-ready contracts; validate across the existing browser matrix.
3. Test whether only the Sans preload is needed for the LCP text, with Serif/Mono remaining `font-display: swap` resources. Preserve the visual contract and verify font-loading/reflow before adopting this change.
4. Treat route-level CSS/JS splitting as a separate aftercare refactor: inspector-only `vera-ledger.js`, Atlas-only `vera-map.js`, and route-specific CSS are evidenced opportunities but need full cache/version/service-worker and product regression coverage.

Do not change the glyph bundle, tile provider, public data proxy, or private VERA engine on the basis of this diagnostic set. Any change requires the normal candidate build, 173-test browser gate, exact production parity check, and a new serial performance measurement.

## Owner and review date

- Accountable owner: Little Fight NYC engineering/performance owner.
- Next evidence due: **2026-08-20 MST** (serial Today/Atlas rerun and physical-phone confirmation).
- Release restriction: remain **In Observation** for performance governance until the owner records the chosen budget, serial confirmation, and either an approved exception or a bounded follow-up release. This P2 aftercare finding is not, by itself, evidence of a P0/P1 functional failure.

# Tile system revision QA

Final result: passed for local review.

Preview: `http://127.0.0.1:65031/?qa=1&v=mixed-tile-rhythm#topic-web`.
Artifact SHA256: `9d4ebbbe0056d950fa52bc8ad573e9684d7f4ea8d7d260ceceddfa8bcb2e8482`.
Local review only. No commit, push, hosted preview or production release.

## Working agreement

- Master: `/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Master Design Mockup.png`.
- Treat each request as a scoped change to the existing project. A sizing request is not authorization to redesign the hero, artwork, buttons, copy or destinations.
- Preserve the hero and every existing tile's identity, approved image, icon and motion. Keep one materials, lighting, color and typography system.
- Judge Websites, Tech support, Consulting and Custom software together: comparable tile scale with deliberate tall, wide and compact cards in every category. Uniform dimensions are not the goal.
- Verify the complete scroll and all tile assets, not just the first viewport. Review desktop and phone captures and browser checks before presenting a revision.

## Current change

- Updated `AGENTS.md` and the current marketing section of `app/DESIGN.md`: the old 133-tile fixed-grid instruction is superseded, and future visual work is routed to the current design agreement and sculpture implementation. Historical React intake guidance remains scoped to those screens.

- Replaced equal-height collection rows with measured interlocking layouts. Artwork proportions and text requirements choose compact, wide and portrait cards within a common size range; the final edge closes without empty grid cells.
- A bounded layout search preserves top-to-bottom source/keyboard order. A short tail can close in rows without flattening the whole section. Enlarged text retains the measured row fallback.
- Kept 18–20px collection titles, 28px icons, 12px desktop / 10px phone gutters, category colors, charcoal surfaces, edge light and finite motion. Added room beside the plus controls and stacked headers on narrow cards.
- The missing lower-gallery art was reproduced as failed image requests in the old browser tab while its local server was unavailable. A fresh server restored the images. The review server is now detached from the task process, and both Desktop review links point to it. Its PID, URL and log are under `.lifi/evidence/mixed-tile-rhythm/`.
- Retained the earlier requested brand-front removal: 79 visible tiles remain. Eleven Website examples retain four desktop frames, two tablets, three iPhones and two Duo displays. Their approved screenshot composites are unchanged in this pass.

## Scope proof

- All 79 before/after tile inventory records are identical, including destinations, artwork, icons, motion and category identities.
- The hero HTML is byte-identical to this pass's starting artifact; its SHA256 is `cadee91a263fd5ae75f45f401bbc2beaf7c0f88af08d1f39aa28a6521639fe00`.
- Proof: `.lifi/evidence/mixed-tile-rhythm/scope-verification.json`. Starting source snapshots are stored alongside it.
- Source verification covers 50 registered originals, 56 derivatives and active composites. The historical 224-image library is not represented as recovered.

## Validation

- Final Chrome and WebKit layout sweeps: 228 checks passed per engine across 25 widths from 320–2560 CSS pixels, enlarged text and no-JavaScript fallback. All four categories have varied interlocking compositions at tablet/desktop widths; all tile text and art remain within bounds.
- Added regression checks for at least three card footprints, two heights and staggered alignment per category; Websites cannot exceed the typical other-category median tile area by more than 25%. The final browser sweeps' largest observed ratio was 1.001.
- Final four desktop and phone collections were opened and visually inspected. The live review tab also confirmed all 21 Custom software images loaded and all 22 icons present.
- Final `npm run quality:fast` passed: lint, build and artifact/content gates.
- Full tile runs: 538 Chrome checks passed before the final phone-only header-padding adjustment; 538 final WebKit checks passed. The final Chrome layout rerun verifies that padding adjustment across all widths.
- Final responsive suite: 274 passed; master hero and interaction suite: 39 passed. All remaining functional lane constituents passed, including Labs, retained routes, VERA, case studies, inquiry, readers, service anchors, accessibility, search, support-form checks and the quality manifest.
- The initial single-command `quality:full` run stopped at a 320px WebKit scale regression. It was fixed, both layout sweeps were rerun, and the remaining lanes were completed separately; the original command is not represented as a successful exit.
- Final diff whitespace check passed. Desktop browser emulation was used; physical devices were not tested.

## Review artifacts

- Eight desktop/mobile collection captures plus `Tile Scale Desktop.png` are in `/Users/davidmarsh/Desktop/Active Projects/LiFi Tile Website/Little Fight NYC Master Match Review - 2026-10-08/`.
- `/Users/davidmarsh/Desktop/Little Fight NYC Website Tiles.webloc` opens the local gallery.
- Current change evidence: `.lifi/evidence/mixed-tile-rhythm/`; browser reports: `.lifi/evidence/visual-overhaul/`; collection captures and measurements: `.lifi/evidence/website-devices/`.

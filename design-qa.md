# Design QA — Revenue Overhaul

## Target and implementation

- Source image: approved Street-level Diagnostic homepage direction (session artifact; not committed)
- Source state: homepage acquisition hero and first proof row, 1536 × 1024 desktop viewport, top of page, no consent panel
- Implementation capture: final production-build preview at 1536 × 1024 (temporary QA artifact; not committed)
- Implementation state: production build preview, 1536 × 1024 desktop viewport, top of page, essential-only consent already saved
- Combined comparison: source and implementation reviewed side by side at the same desktop viewport (temporary QA artifact; not committed)
- Mobile capture: final production-build preview at 390 × 844 (temporary QA artifact; not committed)
- Mobile state: production build preview, 390 × 844 viewport, top of page, navigation closed, essential-only consent already saved

## Comparison iterations

1. Pass 1 established the source composition: high-contrast poster headline on the left, compact diagnostic surface on the right, and proof immediately below the first decision.
2. Pass 2 corrected headline scale and line breaks, tightened the diagnostic surface, and rebuilt the mobile stack so the promise lands before the form without horizontal clipping.
3. Pass 3 balanced desktop negative space, aligned the diagnostic card with the poster block, and made the real Hair By Rachel Charles proof legible as the next beat.
4. Pass 4 compared source and implementation together at 1536 × 1024. The hierarchy, poster rhythm, orange/blue signal system, diagnostic density, and proof transition match the selected direction while the implementation uses verified client assets and working controls.

## Findings

- Typography: Oswald poster lines retain the source's compressed urgency; Barlow and JetBrains Mono preserve the existing Axiom Momentum system.
- Layout: desktop hero, diagnostic card, and proof rail align without cropped content, unintended gaps, or overflow.
- Mobile: the headline remains readable at 390 × 844, the outcome language wraps cleanly, the Website Check follows in the same decision sequence, and the fixed help bar does not cover the hero.
- Assets: the proof rail uses the real Hair By Rachel Charles project capture; no placeholder, synthetic case result, or approximate code-drawn visual appears in the implementation.
- Controls: website preflight, call/text, booking, navigation, and case-study links are real interactive elements with visible focus and at least 44-pixel touch targets.
- Responsive route sample: 21 representative route families passed at both 1536 × 1024 and 390 × 844 with exactly one H1, no broken loaded images, and no horizontal overflow.
- Privacy state: the consent panel exposes only `Allow analytics` and `Essential only`; advertising measurement is disclosed as inactive, and mobile acquisition controls are inert while the panel is open.
- Console: no error or warning was produced by the final production-build preview route pass.

Final result: passed

---

# Design QA — VERA Application Platform

## Target and implementation

- Canonical product route: `https://littlefightnyc.com/vera/`
- Selected visual directions: Browse / Signal Desk, Atlas / City Lens, and My Hunt / Decision Room.
- Final implementation captures: Browse, ledger-open Browse, Atlas, and My Hunt at 1440 × 1024 CSS pixels; Browse at 390 × 844 CSS pixels.
- The implementation-session comparison and showcase remain review artifacts; they are not shipped with the public product.

## Comparison and iteration

1. Browse preserved the selected direction's evidence-desk hierarchy: persistent command rail, high-signal search/lenses, dense comparable rows, and an interruptible record inspector. The implementation uses the current 279-listing publication rather than concept placeholders.
2. Atlas preserved the selected direction's map-plus-evidence composition and explicit Map/List modes. A visual pass exposed a valid MapLibre shell with zero rendered listings; the final canvas layer renders all 220 geocoded records with zoom-scaled, non-pulsing points.
3. My Hunt preserved the selected direction's shortlist, selected casebook, score rationale, risk/commute/signals, and decision timeline. With no saved browser-local cases, it is honestly labeled as a live-data suggested shortlist.
4. The new evidence-fold VERA mark replaced the radar glyph across the app, favicon, Apple touch icon, install icons, loading state, and manifest. It remains legible from 32 to 512 pixels and has a maskable safe-area variant.
5. The phone pass exposed a fixed tab bar positioned against the filtered masthead instead of the viewport. The containing-block defect was corrected; the tab bar now lands at the bottom safe area and the first Browse result remains above the first fold.

## Final findings

- P0: none.
- P1: none. The empty Atlas data layer and misplaced phone tab bar were resolved before this pass.
- P2: none. Browse density, filter disclosure, touch targets, inspector focus/scroll restoration, Atlas modes, and decision-stage actions are covered by regression tests.
- Motion: no blocking radar veil, ambient infinite loop, count-up theater, pulsing map marker, or scroll-gated content remains. State changes are short and interruptible; reduced-motion is read live.
- Responsive application chrome: desktop uses a persistent rail, iPad and compact desktop use full-height top chrome, and iPhone uses bottom tabs plus a filter sheet. Safe areas, 44-pixel touch targets, and `touch-action: manipulation` are enforced.
- PWA: stable `/vera/` manifest identity, Apple install metadata, real 192/512/maskable icons, shortcuts for the four primary workspaces, and a versioned offline shell are present. Publication data remains network-first with timestamped fallback.
- Browser QA: 26/26 focused instances passed across Chromium desktop, desktop WebKit, iPad WebKit, and iPhone WebKit. Strict TypeScript, ESLint, CSP audit, diff checks, 2,014-module production build, and 207 prerendered routes passed.
- Console: zero errors in the final local flows. OpenFreeMap's current dark style emits one non-blocking missing `wood-pattern` image warning; VERA's own data and layers render correctly.
- Intentional differences from the concepts: all copy, counts, addresses, scores, photos, and map points come from live sanitized VERA data; Atlas frames the full current NYC result set instead of a staged Manhattan crop; the browser-local hunt never implies a server account.

final result: passed

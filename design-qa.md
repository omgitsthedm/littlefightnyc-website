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

# Master fidelity visual QA

Result: passed

Reference: `/Users/davidmarsh/Desktop/ChatGPT Image Oct 7, 2026, 03_43_45 AM.png`.
Scope: the existing hero, all 80 homepage tile fronts and their material motion,
the reference Website reader opening, and the sharing image. Existing tile IDs,
destinations, full service content, Labs, and VERA remain available.

## Comparison history

1. Compared the previous live site with the supplied desktop, phone, and reader
   compositions. The source audit is in the Desktop master comparison folder.
2. Rebuilt the shared hero ground, tugboat, router, translucent software blocks,
   and reader notebook. Restored the compact service and featured rows, colored
   card edges, interior light, stronger typography, and reference reader frame.
3. Inspected reference and implementation together in the comparison boards.
   Corrected tablet navigation wrapping, hero scene proportions, small card copy,
   wide answer compositions, and mobile illustration spacing.
4. Opened the four contact sheets covering all 80 fronts. Checked unique primary
   illustrations, readable copy, flat review stars, consistent surface lighting,
   and loaded approved website screenshots. Rechecked 320px and 393px after the
   final mobile spacing changes. Moved the featured review's decorative quote
   mark away from its star row.

## Evidence and checks

Local evidence is preserved in `.lifi/evidence/master-fidelity/` and excluded from
the deployed source. `comparison-desktop.png`, `comparison-mobile.png`, and
`comparison-reader.png` place the reference and implementation in the same image.
`tile-board-01-20.jpg` through `tile-board-61-80.jpg` cover the full inventory.
`home-320.png`, `home-393.png`, `home-768.png`, `home-1024.png`, and `home-1440.png`
record the inspected layouts. `reader-320.png`, `reader-393.png`, and
`reader-1440.png` record the opened Website card.

Chrome and WebKit each passed the 426-check sculpture sweep. The responsive
sweep passed 274 checks, including 320–2560px widths, touch, orientation,
enlarged text, reduced motion, hero actions, and inquiry inputs. The initial
full reader sweep exposed its obsolete expectation of a fourth Website header
contact. The Website header now explicitly exposes Call, Text, and Email;
the inquiry link remains in the full body and was verified at 320px and 1440px.
The committed release gate reruns the complete functional suite and records its
final result in `final-release.log` before any production push.

The source/provenance gate verified 46 original screenshot hashes and 56
derivatives in the owner-authorized replacement screenshot library. The
1200×630 social card was opened and inspected; it shows the new hero and uses
a new filename to avoid reusing the previous sharing-image cache key.

## Deliberate differences and limits

- The pointer and explanatory project captions are absent by owner instruction.
- Screens contain authentic approved website captures. Their real text, images,
  and framing differ from the synthetic examples in the master.
- All 80 tiles and complete reader content remain. The master depicts only the
  opening tiles and one reader; it does not specify 80 separate illustrations.
- Previous, home, and next reader controls remain usable. Narrow layouts and
  200% text may grow vertically to preserve readable, reachable controls.
- The reference has no CSS viewport metadata. Comparisons normalize image widths;
  they establish visual fidelity, not a claim of identical pixels.
- Browser checks use installed Chrome and WebKit emulation, not physical devices.

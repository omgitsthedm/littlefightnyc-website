# Little Fight owner-first redesign QA

Date: 2026-08-14

## Objective

Turn the selected award-site direction into the real Little Fight system, then
carry its clarity through every public acquisition page. A future client must
be able to understand the offer, see proof, and choose Website, Call, Text,
Email, or Form without knowing technical language.

The work covers the homepage, shared inner-page opening, services, owner answer
guides, Journal, case studies, industries, glossary, neighborhood hubs and
service-area combinations, Spanish, Chinese, the separate Lab showroom, and
the Website Audit examples. VERA, Dakota, Public House Creative, VenueCircuit,
and all Studio routes remain outside this redesign.

## Selected visual source

- Reference board, desktop plus mobile:
  `/Users/davidmarsh/.codex/generated_images/019ffa58-cf42-7ce2-8f4c-ff35a926962d/exec-8c12851b-9a04-42b9-baba-d784a1b202eb.png`

The board is art direction, not client proof. The built hero uses a local
illustrative scene with no client records or made-up business metric. Verified
work remains visibly separated from illustrative direction.

## Production visual assets

- Homepage living path (2026-08-17): the hero renders the real Hair By Rachel
  Charles mobile capture, `app/public/assets/case-hair-by-rachel-charles-explore-mobile.webp`
  (390×2400 WebP, ~97 KB), inside a phone frame at every viewport and scrolls
  it beat by beat. One preload, one image. The illustrative connected-counter
  scenes were retired with that change.

## Current comparison evidence

Evidence folder:
`/Users/davidmarsh/Documents/Codex/2026-08-13/ok/award-redesign-qa-2026-08-14/`

- Reference beside implementation, desktop:
  `fullsite-reference-vs-home-desktop.png`
- Reference beside implementation, mobile:
  `fullsite-reference-vs-home-mobile.png`
- Current homepage, 1440×1024:
  `fullsite-home-desktop-1440x1024.png`
- Current homepage, 1024×768:
  `fullsite-home-1024x768.png`
- Current homepage, 768×1024:
  `fullsite-home-768x1024.png`
- Current homepage, 390×844:
  `fullsite-home-mobile-390x844.png`
- Current homepage, 320×568:
  `fullsite-home-320x568.png`
- Shared service opening, desktop:
  `fullsite-service-desktop-1440x1024.png`
- Shared service opening, mobile:
  `fullsite-service-mobile-390x844.png`
- Eight-family mobile contact sheet:
  `fullsite-mobile-family-board.png`
- Narrow mobile navigation:
  `fullsite-menu-mobile-320x568.png`

The source and implementation were put in the same comparison images before
judgment. The implementation keeps the source hierarchy, contrast, proof-first
rhythm, connected-system visual, and visible contact paths. Mobile deliberately
places its two decisions side by side so urgent help arrives sooner than in the
reference.

## Responsive and interaction evidence

1. At 320×568, the homepage promise ends at 217.7px, all five help choices are
   visible, the illustration begins at 496.2px, every visible action is at
   least 44px tall, and horizontal overflow is zero.
2. At 390×844, the homepage illustration begins at 594.8px, after the promise,
   website action, call action, Text, Email, Form, and human-hours line. The
   page is 5,057px rather than the previous multi-dozen-screen mobile page.
3. At 1024×768, the split hero has no caption/control collision and no wrapped
   oversized decision cards. At 1440×1024, the promise and two actions remain
   visible beside the complete scene.
4. The shared mobile inner-page opening uses its real page image as a dark
   backdrop. On the website service at 390×844, both decisions occupy
   554–617px and Text, Email, Form, and hours finish before 709px. No image wait
   or blank first screen remains.
5. Mobile sampling covered an owner answer, Journal article, live case study,
   industry, glossary term, neighborhood hub, noindex neighborhood/service
   page, Spanish, Chinese, Lab, and Website Audit. Every marketing sample had
   an owner opening and Call, Text, Email, and Form. Lab and Audit remain
   separately labeled experiences with their own honest next action.
6. The 320px navigation panel is viewport-bounded and scrollable; its Call and
   Text actions remain reachable. The homepage motion control changes to
   “Motion reduced” and stops the path. The main website action navigates to
   `/website-check/`.
7. No sampled route produced a browser warning or error, and none had
   horizontal overflow.

## Copy, facts, and conversion evidence

- Rendered copy contract: 206 non-protected marketing routes pass the owner
  opening, next-action, contact-channel, plain-language, placeholder, retired
  email, and source-parity checks.
- Longform parity: 27 owner answer guides and 37 Journal articles use the same
  source for the visible answer and crawler copy.
- Journal visual sources show a checked date, scope, limit, and direct source
  links. Example calculators remain labeled as examples until the owner edits
  a value.
- Lab suites now end with “Want this for your business? Start a plan.” Audit
  examples describe customer problems instead of developer implementation.
- The two-hour callback is written as a target, not an unconditional outcome.
- Public work stays internal until a visitor chooses a case story. No external
  client project was modified.

## Repository evidence

The Node 24 quality suite passes: owner-math tests, lint, production build,
211-route prerender, metadata parity, case explorer, private Dakota distribution
guard, bundle budget, conversion, 250-document integrity, Lab, Audit, booking,
mobile lifecycle, signal, brand, function safety, VERA CSP/legal, legal
snapshot, metadata length, claim scope, typography, agency voice, rendered copy,
and visual coverage. The separate quality-manifest audit also passes.

The only lint output is the unchanged unused-disable warning in the protected
vendored MapLibre file. This is a local reviewed candidate; production has not
been changed by this work.

## Result

The current build matches the selected award-directed visual system while
remaining faster to understand and act on than the reference. Desktop, compact
desktop, tablet, 390px phone, and 320px phone evidence show an immediate owner
promise, real visual, usable help path, accessible motion escape, and consistent
inner-page conversion structure.

final result: passed

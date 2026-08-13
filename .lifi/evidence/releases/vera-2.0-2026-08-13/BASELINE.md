# VERA 2.0 baseline and recovery record

Release ID: `vera-2.0-2026-08-13`
Standard: Universal Product, Feature & Website Launch, Audit & Remediation Standard `2026-08-12.1`
Status at takeover: inherited in-progress public-product work; no production or private-engine mutation made during recovery.

## Source and production baseline

| Item | Observed baseline / recovered fact |
|---|---|
| Canonical public source | `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website` |
| Public VERA source | `app/public/vera/**` in the canonical website repository |
| Production product | `https://littlefightnyc.com/vera/` on Netlify site `littlefightnyc` (`0907d8fe-7018-48db-a6be-1f906e4b2619`) |
| Public data contract | First-party `/vera/data/{public,archive,meta}.json`; proxy output is sanitized publication only |
| Private boundary | `/Users/davidmarsh/Code/Personal/vera-apartment-search` is a separate private engine and was excluded from this release |
| Initial public commit | `7119ca639df7e5f736c9ef6a310fd126fc0b66bd`, aligned with `origin/main` at takeover |
| Private-engine checkpoint | Engine `82a53b1d7f6dd233522e815308d5979e9062d0de`; feed `07949ae90b51272c5fbb81bad67139ee439e46bb`; recorded only to preserve the boundary, not as an active release dependency |

The canonical source-of-truth document identifies GitHub `main` and the above Netlify site as the only supported public release rail. The historical `vera-pipeline` project and `vera-dashboard` checkout are not deployment targets, fallbacks, or rollback paths.

## Inherited Kimi K3 state

Kimi K3 had completed the typography pass and vendored the local MapLibre Liberty style, sprites, and glyphs. Work stopped during gallery/lightbox completion. The inherited public-repository boundary was preserved before further work.

| Recovery item | Evidence |
|---|---|
| Exact boundary archive | `/Users/davidmarsh/Documents/Codex/2026-08-12/ok-w/work/vera-kimi-k3-boundary-2026-08-12.tar.gz` |
| SHA-256 | `bddddb73644510f8ee71d7d2312736eefe6ed4de907beb8c7cd491f53d27d38e` |
| Handling rule | Keep the archive immutable. Inspect or extract only into a disposable recovery directory; never unpack it over the canonical checkout. |

## Baseline findings and remediation trace

| ID | Baseline finding | Remediation incorporated in the release | Status |
|---|---|---|---|
| BASE-01 | Inherited gallery/lightbox work was incomplete. | Completed gallery controls and accessible lightbox behavior: arrows, dots, live status, focus trap, Escape/backdrop close, focus return, image failure, and reduced motion. | FIXED |
| BASE-02 | Primary navigation and narrower desktop filters did not clearly expose the intended workspaces. | Reworked navigation around Today, Atlas, Browse, and My Hunt; retained a keyboard-safe More surface and explicit More filters control. | FIXED |
| BASE-03 | Atlas needed useful map/list parity and reliable map failure behavior. | Added local style assets, four-borough map framing, clusters, price/score points, keyboard popup and focus return, retry/fallback, list parity, and reduced-motion behavior. | FIXED |
| BASE-04 | Coordinate input could be malformed or ambiguous. | Centralized strict coordinate guards: reject absent, blank, non-scalar, nonnumeric, non-finite, and out-of-range values; retain valid numeric strings. | FIXED |
| BASE-05 | Optional base-map POI icons could generate live MapLibre console warnings. | Added bounded transparent fallbacks for unfamiliar optional icon IDs without changing VERA listing semantics. | FIXED |
| BASE-06 | Cache/version coupling, local-style provenance, and privacy/security checks needed stronger release evidence. | Added cache/version, CSP, legal-content, provenance/size, coordinate, and browser/acceptance contracts. | FIXED |

## Candidate and production baseline after remediation

| Item | Verified result |
|---|---|
| Feature commit | `5320c757ab89ac44c90658d207ac6ccb3f8cec7f` — `feat(vera): make the city legible and interactive` |
| Stabilization commit | `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` — `fix(vera): absorb optional map icon fallbacks` |
| Production deploy | Netlify `6a7d752e5c61310008bc3a9f`, Git-connected `main`, published `2026-08-13T07:42:18.105Z` |
| Public revision parity | Local `main`, `origin/main`, Netlify deploy, and live `/release.json` all recorded `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`; live metadata recorded `source_dirty: false` |
| Automated/browser evidence | Clean-source build and release audit passed; 173/173 Playwright project executions passed across Chromium desktop/mobile, Firefox desktop, WebKit desktop/mobile, and iPad. |
| Live VERA evidence | `EXPECTED_REVISION=0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183 npm run quality:live` passed; in-page acceptance harness passed 160/160 with no console warnings/errors. |
| Live Atlas evidence | `vera-surveyor-liberty` loaded; clusters and price-score points reported; nine optional POI fallbacks installed; keyboard activation opened the Inspect listing popup and moved focus to its action. |

## Intentional map-asset tradeoff

The release retains the full first-party MapLibre support bundle: 776 files / approximately 102 MiB, including full Unicode glyph ranges for the three referenced Noto font variants. This is an intentional availability/style-resilience tradeoff, not accidental dead weight.

- OpenFreeMap source commit: `72e1480dfc92858d334647037988bd2591fdb021`
- Local style SHA-256: `c3b181be9436e3e2eb80668382768644a8b14ec90fa1d158317d5dc6cb0f06ec`
- Glyph-manifest digest: `02f4cb94608d049fae80f6de53511836b4ce79e7540b75be4ad1b1b44c95a986`
- Provenance and licensing: `app/public/vera/assets/vendor/maplibre/style/SOURCE.md`, `LICENSE-OPENFREEMAP.md`, and `LICENSE-NOTO.txt`

Only live basemap tiles remain remote through the approved OpenFreeMap source. The style document, sprite, and glyphs are served first-party. Glyph subsetting/lazy loading remains an owned performance follow-up, not a retroactive claim that the current artifact is small.

## Known baseline limits to carry into observation

1. VERA-specific diagnostic Lighthouse evidence is captured in 12 JSON reports, with an integrity manifest at `LIGHTHOUSE-SHA256.txt`. Medians: Today desktop 97 / 1.19s LCP; Atlas desktop 96 / 1.28s LCP; Today mobile 86 / 4.08s LCP / 16ms TBT; Atlas mobile 62 / 5.21s LCP / 1.19s TBT. See `PERFORMANCE.md` for the exact all-run table, method, causes, and safe candidates.
2. The four Lighthouse profile groups (Today/Atlas × desktop/mobile) were launched concurrently. They are valid diagnostic evidence for this candidate but not a controlled serial comparison or a field Core Web Vitals dataset; repeat the relevant profile serially before using the values as a hard release budget or before/after claim.
3. The browser suite covers emulated mobile/tablet WebKit and Chromium. A physical-phone check and a manual screen-reader journey were not preserved as release evidence at this checkpoint.
4. VERA has no accounts, advertising, analytics, lead capture, payment, booking, or outbound landlord-contact flow. The optional address lookup is a user-initiated request directly to NYC Planning; no production address should be submitted for a release test without the approved production-test class and minimized test record.
5. The current renter-law content owner and primary-citation contract are recorded PASS for this candidate. Trigger a new substantive legal/content review before materially expanding public legal claims, markets, or advice; content-consistency automation is not a substitute for that future review.
6. Noncanonical custom/platform/branch/deploy hosts return VERA with the correct canonical link but do not redirect or return noindex. The site-wide host disposition is P2 aftercare and must not be changed from this VERA dossier-only closeout.

## Evidence custody

This baseline is part of the retained release dossier. It contains no credential, private-feed, raw-hunt, or personal-data export. The authoritative production evidence remains the canonical Git commit, Netlify deploy metadata, live `/release.json`, and the scoped quality/live test outputs. Do not use the Kimi archive as a deployable source.

# VERA redesign release (2026-10-18)

## Release record

| Field | Value |
| --- | --- |
| Netlify site | `littlefightnyc` (`0907d8fe-7018-48db-a6be-1f906e4b2619`) |
| Production deploy | `6ad59f3c8591bcc684da960f`, ready and published 2026-10-19T04:41:29Z |
| Commit | `97c3cca453ef8f260a825a8b56423929e8b50db4` (`main`, `source_dirty: false`) |
| Previous production | deploy `6ad5539d1bbe7fcdcbfc8c78` at `e24bb7d162548744ca39e2f556f06365b2f13a61` |
| Authorization | Owner instruction on 2026-10-18: "Ship the VERA redesign: merge claude/vera-design-20261017 to main, push, and run quality:live." |
| Path | Git push of the exact candidate to `main`, followed by the Netlify auto-build. No manual deploy was made and no preview was used. |
| Credit effect | One production build and deploy. No previews or extra deploys. |

## What shipped

`/vera/` only, plus its share cards and pins. The release includes:

- **Index design system:** Whole Earth Index–inspired black and ink, IBM Plex Serif and Mono, and a Phosphor Light icon sprite (MIT).
- **Street maps:** real street-map snapshots drawn from the Atlas style.
- **Today, answer first:** a ruled answer list under the headline.
- **Concierge layer:** greeting, tallies, standouts, and reveal motion kept under 300ms.
- **Tour mode:** a swipe deck with Undo, a history-aware Back, resume, and live announcements.
- **Honest copy:** each card's verdict follows the engine's own rating, broker-fee lines come from the listing, value comparisons are same-size only, and the figures add up.
- **Mobile-first layout:** phone base, then 761px tablet and 1180px desktop layers, checked from 320x568 to 1440x900 and in landscape.
- **Accessibility:** fixes to the ledger dialog, tablist, filters region, and row names.
- **Share cards:** seven VERA share cards and 18 recorded VERA pins.

The full scope is in the branch history from `98a09d1a` to `771f69f8`, plus the merge `97c3cca4`.

## Verification

| Check | Result |
| --- | --- |
| `npm run quality:release`, Node 24, on `97c3cca4` with a clean tree | PASS. Includes the sculpture pins in Chrome and WebKit, VERA CSP, legal content, service worker, and data edge. |
| VERA product spec, installed Chrome (desktop and mobile) | 44/44 |
| VERA in-app suite (`?test=1`) | 161/161 |
| axe, every VERA route at 320, 390, 852x393, 768 and 1440 | 0 violations |
| Lighthouse mobile (local) | 0.89–0.90, LCP 3.6–3.7s, TBT 20ms, CLS 0 |
| `/release.json` | Reported `97c3cca4` about 61s after the push |
| `EXPECTED_REVISION=97c3cca4… npm run quality:live` | PASS |
| Live smoke test at 390x844 and 1440x900 | PASS: new Today, Tour pass and undo, a street map ready, `vera-shell-v19`, no page errors |

## Rollback

Republish deploy `6ad5539d1bbe7fcdcbfc8c78` from the Netlify deploy list, or revert the merge on `main`. Either path needs the owner's instruction.

## Still open

These need an engine change or an owner decision:

- **LCP:** a small `today.json` from the publisher.
- **Value comparisons:** per-size StreetEasy series (`series[hood].by_unit`).
- **`ownerRead` check:** it tests for a `broker_fee` value that never occurs. Changing it would also change the No-brokers filter.
- **Footer credit:** the site-wide credit animation loops forever.

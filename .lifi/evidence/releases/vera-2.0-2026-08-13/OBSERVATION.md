# VERA 2.0 production observation record

Release ID: `vera-2.0-2026-08-13`
Canonical candidate: `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`
Production deploy: Netlify `6a7d752e5c61310008bc3a9f`, Git-connected `main`, published `2026-08-13T07:42:18.105Z`
Canonical URL: `https://littlefightnyc.com/vera/`
Observation owner: David Marsh
Current status: **In Observation**

## T0 — completed immediately after release

| Check | Status | Evidence |
|---|---|---|
| Source, remote, host, and live revision parity | PASS | Clean canonical `main`, `origin/main`, Netlify production deploy, and live `/release.json` all identified `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`; live metadata recorded `source_dirty: false`. |
| Build and product regression | PASS | Clean-source build/release audit; 173/173 browser executions across Chromium desktop/mobile, Firefox desktop, WebKit desktop/mobile, and iPad. |
| Live public contract | PASS | `EXPECTED_REVISION=0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183 npm run quality:live` passed; public `/vera/data/{public,archive,meta}.json` contract and cache/robots checks passed. |
| Live VERA acceptance | PASS | In-page acceptance harness 160/160; no console warnings/errors recorded. |
| Atlas smoke and accessibility behavior | PASS | Local Liberty style loaded; clusters/price-score points active; nine bounded optional POI fallbacks installed; keyboard map activation opened Inspect listing and moved focus to its action. |
| Live HTTP/security asset checks | PASS | VERA root, versioned map JavaScript, local style/sprite/glyph representative assets returned expected HTTP 200/content types; VERA CSP/HSTS/frame and content-type protections checked. |
| Production test boundary | PASS | Read-only checks only. No feed dispatch, form, address, booking, payment, notification, landlord contact, account, or other external submission was created. |

## Timed checkpoint ledger

Future checkpoints are intentionally unfilled. Do not pre-mark them PASS: append a timestamp/timezone, evidence reference, observed values, incidents, decision, and owner note after each completed review.

| Window | Due | Status | Completed at | Evidence / outcome | Decision |
|---|---|---|---|---|---|
| T+24h | 2026-08-14 MST | DEFERRED |  |  |  |
| T+7d | 2026-08-20 MST | DEFERRED |  |  |  |
| T+30d | 2026-09-12 MST | DEFERRED |  |  |  |

## Read-only review checklist

Perform each scheduled review without creating a renter, provider, or customer-visible record.

### Release/deploy parity

- Fetch `https://littlefightnyc.com/release.json`; confirm `revision` matches the intended deployed SHA, `branch` is `main`, `context` is `production`, and `source_dirty` is false.
- Inspect Netlify read-only deploy metadata: site ID, ready production state, commit SHA, deploy ID, publish time, error state, and unexpected manual/preview transformation.
- Record any difference among local release record, GitHub `main`, Netlify, and canonical host; do not infer parity from a push alone.

### Feed origin, age, and HTTP contract

- Request the public first-party URL `https://littlefightnyc.com/vera/data/public.json`; record HTTP status, `ETag`, `Cache-Control`, `X-Robots-Tag`, `Source-Age` when returned, and public feed `generated_at`.
- Confirm the browser/public URL remains first-party `/vera/data/*` and that no private VERA engine host, raw feed, contact, or research data appears in page/source/network evidence.
- Check GET/HEAD header parity and a safe conditional GET only; do not dispatch a feed, run a private pipeline, or alter publication state.

### Core HTTP, browser, map, and service-worker health

- Check VERA root, Atlas, Browse, My Hunt, documents, current versioned assets, and representative map style/sprite/glyph responses for expected status, content type, and intended cache behavior.
- Recheck the canonical, `hey`, Netlify platform, `main` branch, and immutable deploy hosts. Record any change in redirect, noindex, or canonical-link behavior; do not alter site-wide host configuration from observation.
- In a read-only browser session, inspect console errors/warnings on Today and Atlas, then verify Atlas map/list rendering, keyboard focus/open/return, fallback/retry message, and reduced-motion behavior.
- Confirm MapLibre tiles load from the approved OpenFreeMap origin and the VERA CSP continues to allow only the documented map/address capabilities.
- Check the optional GeoSearch integration passively: preserve CSP/configuration and failure/retry behavior. **Do not submit an address** without separately recorded production-test authority, minimized non-personal data, and reconciliation steps.
- Confirm service-worker registration/scope/cache version and ordinary shell recovery behavior; do not fabricate offline, storage, or user-state records beyond an authorized test boundary.

### Operations and support signals

- Review read-only Netlify deploy/function/error signals, public route 404s/failed requests, map and GeoSearch dependency health, cache/revalidation behavior, service limits, and cost/quota dashboards where authorized.
- Review support or correction reports through the existing approved Little Fight NYC channel; record only count/category and an access-controlled reference, never personal data in this dossier.
- VERA has no accounts, advertising, analytics, lead capture, booking, payment, landlord-contact, or notification journey. Mark those as N/A for this scoped observation unless the product scope changes.

## Stop conditions

Immediately retain or return the status to **In Observation**, pause any exposure expansion, and obtain David’s release decision when a check finds:

- public exposure of private/raw VERA-engine data, a security/CSP regression, or loss of the first-party data boundary;
- canonical VERA route/data/map failure, broken primary keyboard journey, reproducible console error, required-request failure, or material service-worker regression;
- local/GitHub/Netlify/live revision drift, failed Netlify production state, wrong host/branch, or unapproved manual/preview deployment;
- materially incorrect public renter-law guidance, a withdrawn source/content approval, or a new legal/privacy claim outside the recorded contract;
- sustained map/GeoSearch external dependency failure, material error/404 spike, quota/cost issue, or a customer/support report showing a P0/P1 impact.

The response may be a bounded forward fix or a normal Git revert through the canonical `main` rail. Do not force-push, manually deploy production, alter DNS/host configuration, dispatch feeds, or submit external forms/addresses/payments/messages as part of observation.

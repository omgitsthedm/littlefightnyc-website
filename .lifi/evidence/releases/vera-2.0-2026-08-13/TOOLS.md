# VERA 2.0 Tool Sign-Off Records

Release ID: `vera-2.0-2026-08-13`
Decision: **In Observation**

All costs, quotas, retention, support terms, and vendor service-level details are **unknown unless stated below**; they were not inferred from source or release checks. No secret, token, credential, or private engine record is reproduced here.

## GitHub

- Category: Canonical source control, code review surface, Actions, secret scanning, and push protection.
- Vendor/configuration: <https://github.com/omgitsthedm/littlefightnyc-website>; canonical source is `main`; engine feed workflow is in its separate repository.
- Owner: David Marsh / Little Fight NYC (product, technical, release, and cost owner).
- Data and permissions: Public source/build inputs and sanitized feed source only. Do not store raw hunt data, contacts, credentials, or private runtime state in the website repository.
- License/support/cost/quota: Repository service terms, plan, quota, and support are unknown from this release evidence.
- Evidence: Secret scanning and push protection enabled; 0 open alerts. Dependabot security updates are disabled and remain P2 governance aftercare. `npm audit --omit=dev` reported 0 vulnerabilities.
- Removal/rollback: Preserve Git history; do not delete or replace the canonical source. A rollback is a new authorized Git release.
- Decision: Approved with P2 Dependabot aftercare; last reviewed 2026-08-13.

## Netlify

- Category: Git-connected static hosting and deployment.
- Vendor/configuration: <https://www.netlify.com/>; site `littlefightnyc` / `0907d8fe-7018-48db-a6be-1f906e4b2619`; production from `main` only.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: Public static VERA application and sanitized first-party data rewrites only; no private engine state or credentials.
- License/support/cost/quota: Existing service plan, limits, and support are unknown from release evidence; no VERA-specific hosting purchase was added.
- Evidence: Exact deploy `6a7d752e5c61310008bc3a9f` matches final commit `0a4d1d4…`.
- Removal/rollback: New Git rollback release. Never use manual production deploy, change site identity/domains, or recreate standalone VERA hosting.
- Decision: Approved; last reviewed 2026-08-13.

## MapLibre GL JS 5.6.0

- Category: In-browser map rendering.
- Vendor/configuration: <https://maplibre.org/maplibre-gl-js/docs/>; VERA uses vendored map script/version 5.6.0 with `vera-map.js` integration.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: Browser receives already-sanitized public listing/map coordinates; no authentication or private state is required for map rendering.
- License/support/cost/quota: Open-source project license applies; commercial support/cost/quota are unknown/not purchased for this release.
- Evidence: Map/list, clusters, keyboard popup, reduced motion, failure fallback, and missing optional-icon regression passed across the browser matrix and live Atlas.
- Removal/rollback: Revert the canonical source release; preserve map/list accessibility parity before a renderer replacement.
- Decision: Approved; last reviewed 2026-08-13.

## OpenFreeMap pinned style and tiles

- Category: Map style source and live read-only basemap tiles.
- Vendor/configuration: <https://github.com/hyperknot/openfreemap-styles>; local style source commit `72e1480dfc92858d334647037988bd2591fdb021`; style, sprites, and glyph assets vendored first-party; only basemap tiles remain remote.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: Browser makes anonymous public tile requests; no credentials or user submissions.
- License/support/cost/quota: Source/license records retained under VERA vendor assets; tile service availability, quota, support, and cost are unknown from release evidence.
- Evidence: Local style SHA-256 `c3b181be9436e3e2eb80668382768644a8b14ec90fa1d158317d5dc6cb0f06ec`; live style/sprite/glyph assets HTTP 200; fallback behavior prevents optional POI icon warnings.
- Removal/rollback: Retain first-party assets and revert through Git if needed. Do not replace tiles/style without licensing, availability, visual parity, and privacy review.
- Decision: Approved with external-tile dependency observation; last reviewed 2026-08-13.

## Noto glyph assets

- Category: Local glyph/font data for map labels.
- Vendor/configuration: Noto Fonts license record <https://raw.githubusercontent.com/notofonts/noto-fonts/main/LICENSE>; static glyphs under `app/public/vera/assets/vendor/maplibre/style/fonts/`.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: First-party static asset delivery only; no user data.
- License/support/cost/quota: License retained; no separate paid plan. Vendor support/quota are not applicable/unknown.
- Evidence: Glyph manifest digest `02f4cb94608d049fae80f6de53511836b4ce79e7540b75be4ad1b1b44c95a986`; complete bundle 776 files/~102 MiB passes source/license/size checks.
- Removal/rollback: Preserve language/render parity before subsetting; revert via Git. Full bundle size is a documented P2 optimization opportunity, not a waiver.
- Decision: Approved with size aftercare; last reviewed 2026-08-13.

## NYC Planning GeoSearch

- Category: Public geocoding/reference integration used by VERA public map context.
- Vendor/configuration: NYC Planning GeoSearch public service; exact runtime request path is controlled by VERA map/geo source and must remain read-only.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: Only after a visitor submits the optional confirmation form, the browser sends the entered address to `https://geosearch.planninglabs.nyc/v2/search` and requests up to three matches. NYC Planning also receives normal connection metadata such as IP address and user agent. VERA omits browser credentials and the referring page. Do not transmit private hunt notes, contacts, or owner-only fields.
- License/support/cost/quota: Public-service terms, availability, rate limits, support, and cost are unknown from this release evidence.
- Evidence: No new GeoSearch configuration or credential was introduced by VERA 2.0; the Privacy page discloses the direct address request; strict coordinate guards and failure behavior passed. Release testing did not submit a live address.
- Removal/rollback: Disable/revert client use through canonical source only after retaining an honest map fallback; no account change is authorized.
- Decision: Conditional on continued public-service availability and privacy boundary; last reviewed 2026-08-13.

## Sanitized feed proxy

- Category: First-party data proxy/rewrite from the separate engine’s sanitized `feed` branch.
- Vendor/configuration: Canonical `app/public/_redirects` and the VERA engine’s `scripts/public_lens.py` boundary; browser routes are only `/vera/data/public.json`, `/vera/data/archive.json`, and `/vera/data/meta.json`.
- Owner: David Marsh / Little Fight NYC.
- Data and permissions: Sanitized public JSON only. Raw hunt data, contacts, notes, credentials, private runtime state, and engine logs are prohibited from browser, website repository, Netlify, and feed branch.
- License/support/cost/quota: No dedicated VERA proxy service/cost; upstream GitHub/Netlify service limits/support are unknown from this release evidence.
- Evidence: Repository-boundary/release checks and live first-party data availability passed. Engine schedules, publishing, and LaunchAgents were untouched.
- Removal/rollback: Preserve the three-route contract or release an intentional compatible successor through the canonical Git rail. Never point the browser directly at a provider or restore `vera-pipeline`.
- Decision: Approved; last reviewed 2026-08-13.

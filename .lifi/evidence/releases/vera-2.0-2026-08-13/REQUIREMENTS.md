# VERA 2.0 release requirements matrix

Release ID: `vera-2.0-2026-08-13`

Standard applied: *Universal Product, Feature & Website Launch, Audit & Remediation Standard* `2026-08-12.1`

Product: public VERA browser product at <https://littlefightnyc.com/vera/>

Candidate / production revision: `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`

Production deploy: Netlify `6a7d752e5c61310008bc3a9f` on site `littlefightnyc` / `0907d8fe-7018-48db-a6be-1f906e4b2619`
Posture: **In Observation — ready with documented deferred aftercare; no known P0/P1 product blocker.**

## How to read this matrix

This is a VERA-only, release-scoped application of the universal standard. It does not use a passing public VERA check to sign off private Dakota, the Website Audit, site-wide form delivery, or unrelated Little Fight surfaces.

Statuses are final-status vocabulary from the standard:

- **PASS** — acceptance criterion has release evidence.
- **FIXED** — a discovered release defect was remediated and re-verified.
- **N/A** — outside VERA's present scope; rationale is recorded.
- **DEFERRED** — valid follow-up evidence is still needed; not a P0/P1 ship blocker.
- **BLOCKED** — none at closeout.

Matrix total: **71 requirements** — 40 PASS, 6 FIXED, 9 N/A, 16 DEFERRED, 0 BLOCKED, and 0 WAIVED.

`David Marsh` is the accountable product/release owner. `DECISION.md` records the attributable **In Observation** decision. It does not claim that the 24-hour, 7-day, or 30-day checks have already happened.

## Release definition, authority, and evidence

### REL-001 — Release identity and target

- Priority: P0
- Status: PASS
- Acceptance criterion: One release ID, target environment, release lane, exact candidate, target domain, and change risk are unambiguous.
- Evidence: This dossier identity block; `README.md`; `REPORT.md`; production URL; commit `0a4d1d4a…`; deploy `6a7d752e…`.
- Owner / approver: David Marsh / David Marsh (release authority).

### REL-002 — Product outcome, users, non-goals, and guardrails

- Priority: P0
- Status: PASS
- Acceptance criterion: The product problem, public audience, observable result, non-goals, and safety guardrails are recorded.
- Evidence: `BASELINE.md`, `REPORT.md`, and `SOURCE_OF_TRUTH.md` “VERA public demo product.”
- Owner / approver: David Marsh / David Marsh.
- Notes: VERA is a public rental-research browser product. Private engine data, contacts, raw snapshots, watchlists, credentials, LaunchAgents, Dakota, PHC, and unrelated site work are non-goals and out of scope.

### REL-003 — Risk classification and applicability

- Priority: P0
- Status: PASS
- Acceptance criterion: The release uses a process proportional to its actual blast radius and records applicable versus excluded surfaces.
- Evidence: Public PWA with a sanitized data-feed and remote map/address dependencies; no authentication, payment, server-side user account, migration, or new personal-data collection. Standard release rail, rollback, browser matrix, and live verification applied.
- Owner / approver: David Marsh / David Marsh.
- Notes: Classified **Standard**: user-facing public product with external dependencies and a public data projection, but no new high-risk identity, payment, regulated-data, or irreversible-state change.

### REL-004 — Requirement traceability and evidence custody

- Priority: P0
- Status: FIXED
- Acceptance criterion: Each VERA-applicable control has a stable ID, status, owner/approver, acceptance criterion, and evidence location; evidence excludes secrets and private data.
- Evidence: This matrix; `BASELINE.md`; `REPORT.md`; Git commits; Netlify deploy record; release and live quality commands.
- Owner / approver: David Marsh / David Marsh.
- Notes: This requirement was not represented as an itemized universal-standard matrix during implementation; this closeout supplies the durable mapping.

### REL-005 — Attributable go/no-go decision

- Priority: P0
- Status: FIXED
- Acceptance criterion: A named decision records release ID, exact commit, environment, reviewed evidence, timestamp/timezone, and **In Observation** decision.
- Evidence: Current user direction authorizes this VERA closeout; `DECISION.md` is the durable companion decision record for release `vera-2.0-2026-08-13`, candidate `0a4d1d4a…`, evidence set, and In Observation posture.
- Owner / approver: David Marsh / David Marsh.
- Notes: This fixes the previously missing release-decision record without falsely promoting the release beyond In Observation.

### REV-001 — Independent review / protected-branch evidence

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: Standard/high-risk changes normally receive independent review of the exact candidate.
- Evidence: The change used the established direct `main` Git-connected rail; technical compensating controls were full release gate, 173/173 browser executions, live 160/160 harness, exact revision verification, complete diff review, and recoverable takeover archive.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Retain the evidence of the current sole-owner release process; use independent review on the next material VERA candidate where available. No emergency exception is asserted.

### REL-006 — Release evidence retention

- Priority: P1
- Status: FIXED
- Acceptance criterion: A human-readable release dossier and machine-readable dependency inventory are retained with the release evidence.
- Evidence: `BASELINE.md`, `REQUIREMENTS.md`, `REPORT.md`, `EVIDENCE-INDEX.md`, `ROLLBACK.md`, `CLIENT-ACTIONS.md`, and CycloneDX `SBOM.cdx.json` in this release dossier.
- Owner / approver: David Marsh / David Marsh.
- Notes: The dossier is redacted by design and does not contain credentials, raw private VERA data, or production user records.

### REL-007 — Automated artifact-retention policy

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Browser, accessibility, visual, performance, and live-smoke artifacts have a durable automated-retention policy.
- Evidence: `.lifi/quality.yml` still declares CI artifact policy `UNDEFINED`; the current dossier retains the release-level human-readable evidence and SBOM.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Define proportionate redacted artifact retention before the next material VERA release.

## Architecture, source control, and Netlify delivery

### ARC-001 — Canonical source and system of record

- Priority: P0
- Status: PASS
- Acceptance criterion: Canonical repository, resolved checkout, production branch, host/site ID, domain, build, and delivery route are identified.
- Evidence: `AGENTS.md`; `SOURCE_OF_TRUTH.md`; `.lifi/quality.yml`; canonical checkout `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website`; `main`; Netlify site ID above.
- Owner / approver: David Marsh / David Marsh.

### ARC-002 — Clean candidate and branch parity

- Priority: P0
- Status: PASS
- Acceptance criterion: Exact release candidate is committed, the canonical worktree is clean, and local `main` equals `origin/main`.
- Evidence: Final status recorded clean; `HEAD` and `origin/main` both resolve to `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`.
- Owner / approver: David Marsh / David Marsh.

### ARC-003 — Reproducible build/runtime contract

- Priority: P0
- Status: PASS
- Acceptance criterion: Runtime, package manager, lockfiles, build and test commands, and generated artifact behavior are declared and release-tested.
- Evidence: `app/package.json`, repository locks, `.nvmrc`, `netlify.toml`, `AGENTS.md`, `.lifi/quality.yml`; Node 24 release lane; clean-source build and release audit passed.
- Owner / approver: David Marsh / David Marsh.

### NET-001 — Approved production delivery path

- Priority: P0
- Status: PASS
- Acceptance criterion: Production follows canonical source → `main` → Netlify Git auto-build → canonical domain, without an unrecorded manual deploy.
- Evidence: `SOURCE_OF_TRUTH.md` and `AGENTS.md` prohibit manual production deploys; handoff confirms existing Git-connected `main` rail and no manual deploy.
- Owner / approver: David Marsh / David Marsh.

### NET-002 — Exact live deployment provenance

- Priority: P0
- Status: PASS
- Acceptance criterion: The exact source revision is tied to a ready Netlify deployment and the canonical live URL.
- Evidence: Netlify deploy `6a7d752e5c61310008bc3a9f`; `EXPECTED_REVISION=0a4d1d4a… npm run quality:live` passed; live `/release.json` matched `main` and the expected revision.
- Owner / approver: David Marsh / David Marsh.

### NET-003 — Netlify configuration and response behavior

- Priority: P0
- Status: PASS
- Acceptance criterion: Required rewrites, headers, and deployed response behavior are tested rather than assumed from configuration.
- Evidence: `audit-vera-csp.mjs`; `verify-live.mjs`; live feed GET/HEAD/conditional-304 checks; HTTP 200/content-type verification for versioned map JS, style, sprites, and glyphs.
- Owner / approver: David Marsh / David Marsh.

### NET-004 — Unsupported manual-provider changes

- Priority: P1
- Status: N/A
- Acceptance criterion: Host UI, DNS, domain, environment, build setting, or production-branch changes would need their own authority and before/after evidence.
- Evidence: No such change was made; no Netlify relink, manual deploy, DNS/domain, environment, or build-setting mutation occurred.
- Owner / approver: David Marsh / David Marsh.

### NET-005 — Reachable host and indexing disposition

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Every canonical, custom-alias, platform, branch, and immutable deploy host has an explicit redirect, noindex, canonicalization, or approved evidence-host disposition.
- Evidence: HTTP redirects to HTTPS and `www` redirects to the canonical domain. The canonical VERA route, `hey.littlefightnyc.com`, `littlefightnyc.netlify.app`, `main--littlefightnyc.netlify.app`, and the immutable deploy host all return VERA successfully; each rendered document points its canonical URL to `https://littlefightnyc.com/vera/`. The noncanonical 200 hosts do not redirect or return noindex.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Decide the site-wide alias/platform-host redirect or noindex policy before the next host/SEO release. Keep immutable deployment evidence reachable if required, but do not change Netlify domains or host configuration from this VERA documentation closeout.

## Public data, privacy boundary, and feed resilience

### DATA-001 — Explicit public payload allowlist

- Priority: P0
- Status: PASS
- Acceptance criterion: Browser-visible data is a positive schema projection; unknown fields/private overlays are excluded by default.
- Evidence: Private engine `scripts/public_lens.py` defines public top-level/listing/nested allowlists, uses a public lens rather than denylist-only filtering, and tests unknown structures.
- Owner / approver: David Marsh / David Marsh.

### DATA-002 — Sensitive-data and malformed-data rejection

- Priority: P0
- Status: PASS
- Acceptance criterion: Public-data audits traverse nested containers and reject private keys, email/phone patterns, credentials, filesystem paths, malformed shapes, unexpected objects/lists, and unsafe scalar types.
- Evidence: `public_lens.py` sensitive key/email/phone/path guards and `audit_public_payload`; `tests/test_public_lens.py` covers personal-layer leaks, nested unknown data, watchlist wording, and malformed containers/scalars.
- Owner / approver: David Marsh / David Marsh.

### DATA-003 — Browser data contract and retirement boundary

- Priority: P0
- Status: PASS
- Acceptance criterion: VERA reads only the first-party sanitized `public`, `archive`, and `meta` contract; former public hosts and fallback browser feeds cannot return.
- Evidence: `app/public/_redirects`; `SOURCE_OF_TRUTH.md`; `audit-vera-csp.mjs`; engine `tests/test_public_product_boundary.py`; browser code declares `./data/public.json` only.
- Owner / approver: David Marsh / David Marsh.

### DATA-004 — Feed freshness, provenance, and degraded behavior

- Priority: P0
- Status: PASS
- Acceptance criterion: Feed has an origin/freshness rule, immutable build revision where applicable, safe fallback behavior, and read-only health verification.
- Evidence: `vera-prerender.mjs` resolves one immutable feed revision; engine `check_public_feed_health.py` and tests fail closed for non-cloud, empty, stale (>36h), fallback, malformed, or future metadata; service worker badges cached-feed age instead of claiming a current sweep.
- Owner / approver: David Marsh / David Marsh.

### DATA-005 — HTTP cache, crawler, and conditional-request contract

- Priority: P0
- Status: PASS
- Acceptance criterion: Data GET, HEAD, cache, validator, revalidation, content-type, and crawler headers preserve the privacy/freshness contract.
- Evidence: `verify-live.mjs` confirms `X-Robots-Tag: noindex, nofollow`, `max-age=300`, ETag, matching GET/HEAD headers, and conditional 304 for every data endpoint; live quality passed.
- Owner / approver: David Marsh / David Marsh.

### DATA-006 — Coordinate and map-input validation

- Priority: P0
- Status: FIXED
- Acceptance criterion: Coordinates used in cards, map, and minimaps reject null, blank, non-scalar, nonnumeric, nonfinite, and out-of-range values while retaining valid numeric strings.
- Evidence: Centralized strict coordinate guards in VERA code; release browser contract tests cover valid and invalid coordinate cases; live Atlas verification passed.
- Owner / approver: David Marsh / David Marsh.

### DATA-007 — Data migrations, public writes, and consumer breaking change

- Priority: P1
- Status: N/A
- Acceptance criterion: A migration/contract-change plan is required only when this release changes persistent data, public write behavior, or a consumer-visible schema.
- Evidence: This release made no database/storage migration, public write, engine-feed schema change, or private-engine mutation; public feed remains an existing sanitized projection.
- Owner / approver: David Marsh / David Marsh.

## PWA and user-facing product behavior

### PWA-001 — Manifest and install identity

- Priority: P1
- Status: PASS
- Acceptance criterion: Manifest, name, start URL, scope, colors, language, display mode, shortcuts, and install icons are valid and available.
- Evidence: `app/public/vera/manifest.webmanifest`; VERA browser test “manifest is installable on desktop and iOS”; icons include 192, 512, and maskable 512 variants.
- Owner / approver: David Marsh / David Marsh.

### PWA-002 — Service-worker caching and update behavior

- Priority: P0
- Status: PASS
- Acceptance criterion: Shell/data strategy is intentional; document and feed freshness do not trap users on stale content; version/cache coupling is asserted.
- Evidence: `sw.js` shell `vera-shell-v10`; network-first documents and data, cache-first versioned shell, stale-feed timestamp; legal-content audit asserts HTML/SW version agreement.
- Owner / approver: David Marsh / David Marsh.

### PWA-003 — Offline/network-failure honesty

- Priority: P1
- Status: PASS
- Acceptance criterion: Offline failures have useful degraded behavior and never present cached data as fresh.
- Evidence: Service worker returns cached feed only with `X-Vera-Cache`/stored timestamp; map route has retry and legible static fallback; handoff records failure/retry behavior and browser coverage.
- Owner / approver: David Marsh / David Marsh.

### PROD-001 — Feature acceptance and recovery states

- Priority: P0
- Status: PASS
- Acceptance criterion: Navigation, Atlas list/map, gallery/lightbox, listing inspection, minimaps, filter discoverability, failure/retry, keyboard return, and reduced-motion behavior work on the supported test matrix.
- Evidence: 173/173 Playwright executions; release handoff delivered list; live VERA acceptance harness 160/160; Atlas live keyboard popup and focus verification.
- Owner / approver: David Marsh / David Marsh.

### PROD-002 — Map asset and optional-icon resiliency

- Priority: P1
- Status: FIXED
- Acceptance criterion: First-party style/sprite/glyph assets remain local and unfamiliar optional POI icons do not create console noise or break VERA listing semantics.
- Evidence: `0a4d1d4a…` adds bounded transparent missing-style-image fallback; targeted Chromium/Firefox/WebKit test passed; live Atlas installed nine optional fallbacks with no warning/error.
- Owner / approver: David Marsh / David Marsh.

### SCOPE-001 — Accounts, authenticated access, and notifications

- Priority: P1
- Status: N/A
- Acceptance criterion: Account lifecycle, authorization, export/deletion, and notification-permission controls apply only if VERA offers them.
- Evidence: VERA has no account, login, role, server-side user profile, push notification, or notification permission request. Local hunt state is browser-local.
- Owner / approver: David Marsh / David Marsh.

### SCOPE-002 — Payments, checkout, forms, booking, CRM, and webhooks

- Priority: P0
- Status: N/A
- Acceptance criterion: Payment/form/provider delivery controls apply only to a VERA interaction that collects or transmits those data.
- Evidence: VERA has no checkout, payment, booking, lead form, CRM, webhook, or automated outreach. Global Little Fight forms and private systems are expressly not VERA release scope.
- Owner / approver: David Marsh / David Marsh.

## Accessibility, responsive compatibility, and practical QA

### A11Y-001 — Semantics, names, status, and visual accessibility

- Priority: P0
- Status: PASS
- Acceptance criterion: Core VERA controls, maps, galleries, icons, dynamic states, and lightbox retain appropriate semantics, names, status communication, contrast, and visible focus.
- Evidence: axe Playwright coverage in `app/tests/vera-product.spec.ts`; semantic map region/label assertions; gallery, inspector, and UI accessibility contracts; desktop/mobile visual QA.
- Owner / approver: David Marsh / David Marsh.

### A11Y-002 — Keyboard and focus behavior

- Priority: P0
- Status: PASS
- Acceptance criterion: Keyboard-only use can open/close/navigate the gallery, inspect Atlas points, use controls, preserve focus across rerenders, and return focus correctly.
- Evidence: Playwright tests for gallery focus trap/Escape/restoration, Atlas keyboard inspection and focus, list/map mode focus, and modal accessibility; live Atlas keyboard popup verified.
- Owner / approver: David Marsh / David Marsh.

### A11Y-003 — Motion and touch/pointer accommodations

- Priority: P1
- Status: PASS
- Acceptance criterion: Reduced-motion behavior is respectful, touch targets are operable, and motion does not create an interaction or accessibility failure.
- Evidence: VERA tests assert `prefers-reduced-motion` map behavior, touch target minimums, mobile MapLibre controls, and non-looping status/background/map decoration.
- Owner / approver: David Marsh / David Marsh.

### A11Y-004 — Human assistive-technology validation

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: At least Apple and Windows screen-reader pathways receive a manual pass over primary VERA journeys.
- Evidence: Automated axe and keyboard coverage are present, but no retained VoiceOver/NVDA/Narrator session evidence was found.
- Owner / approver: David Marsh / David Marsh; manual specialist evidence remains pending and is not implied by owner acceptance.
- Follow-up: Perform and record VoiceOver on macOS/iPhone plus one Windows screen-reader pass for Today, Atlas, gallery, My Hunt, privacy, and corrections.

### QA-001 — Automated browser matrix

- Priority: P0
- Status: PASS
- Acceptance criterion: Relevant Chromium, Firefox, WebKit, desktop/mobile, iPad, and keyboard behavior execute for the release candidate.
- Evidence: 173/173 full Playwright executions across Chromium desktop/mobile, Firefox desktop, WebKit desktop/mobile, and iPad projects; VERA-specific behavior covered.
- Owner / approver: David Marsh / David Marsh.

### QA-002 — Real-device and in-app-browser matrix

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: A real phone, real tablet where relevant, and required in-app browsers are manually tested when those environments are part of support policy.
- Evidence: Emulated/browser-engine coverage is strong; retained proof of real iPhone/iPad/Android and social/email in-app browser testing is absent.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Smoke test current canonical VERA on a real iPhone and iPad; add Android/Chrome if adopted support policy includes it. Treat third-party social in-app browser testing as required only if VERA is intentionally distributed through those surfaces.

### QA-003 — Live visual and console verification

- Priority: P0
- Status: PASS
- Acceptance criterion: Representative production routes/interactions render correctly with no normal-use console warning/error or failed critical asset.
- Evidence: Live desktop/mobile visual QA of Today, Atlas, Browse, Ledger, More, gallery/lightbox, and reduced motion; live Atlas no-warning/no-error check; versioned map assets HTTP 200.
- Owner / approver: David Marsh / David Marsh.

## Performance, assets, and reliability

### PERF-001 — Production bundle and lazy-loading hygiene

- Priority: P1
- Status: PASS
- Acceptance criterion: Release build is optimized; map/tile work is not performed until map mode; noncritical map resources do not load unnecessarily.
- Evidence: Build/release audit passed; Atlas tests assert no live tile requests before Map view, one MapLibre script, local first-party style assets, and mobile GPU pixel-ratio cap.
- Owner / approver: David Marsh / David Marsh.

### PERF-002 — Map-support asset decision and budget

- Priority: P1
- Status: PASS
- Acceptance criterion: Large intentional assets are licensed, bounded, audited, and explicitly justified rather than accidental bundle growth.
- Evidence: 776 files / approximately 102 MiB first-party map support bundle; glyph cap `105,000,000` bytes; style SHA and glyph digest; source/license/provenance audit.
- Owner / approver: David Marsh / David Marsh.
- Notes: This is a resilience tradeoff for complete local Unicode glyph support. Glyph subsetting/lazy loading is an optional future optimization, not an undisclosed defect.

### PERF-003 — Representative lab performance evidence

- Priority: P1
- Status: PASS
- Acceptance criterion: A release-tied, three-run diagnostic Lighthouse baseline captures route/profile medians and preserves the raw results.
- Evidence: `PERFORMANCE.md` and `LIGHTHOUSE-SHA256.txt` retain the method, exact local raw-evidence root, and three runs each of Today and Atlas on desktop and mobile. Exact medians: Today desktop — Performance 97, LCP 1186.0065 ms, CLS 0.0002458839163237311, TBT 0 ms; Today mobile — Performance 86, LCP 4084.189 ms, CLS 0, TBT 15.5 ms; Atlas desktop — Performance 96, LCP 1276.017 ms, CLS 0.04175988675831072, TBT 0 ms; Atlas mobile — Performance 62, LCP 5206.471 ms, CLS 0, TBT 1185 ms.
- Owner / approver: David Marsh / David Marsh.
- Notes: The run group was concurrent and variance is material (notably Atlas), so this is a retained diagnostic baseline, not a serial, physical-device performance certification or a claim of field Core Web Vitals compliance.

### PERF-004 — Field performance and post-release regression monitoring

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Field CWV and release regression signals are observed after sufficient real traffic, without claiming lab and field data are interchangeable.
- Evidence: No VERA-specific field CWV evidence exists at release closeout.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Review at T+30 days or once sample size is sufficient; compare against the recorded lab baseline and investigate regressions.

### PERF-005 — Serial/physical-device performance and safe optimization

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Repeat the performance study serially on a physical device and assess improvements without compromising product integrity, privacy, or map-data correctness.
- Evidence: PERF-003 establishes only a concurrent diagnostic baseline. The retained results indicate Atlas mobile is the highest-value investigation surface.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Run serial cold/warm measurements on a physical mobile device before deciding on safe work such as reducing Today map preload or deferring Atlas paint-before-map work. Preserve the first-party data contract, Atlas list/map parity, a11y, offline honesty, and map fallback while testing any optimization.

### OPS-001 — Feed, dependency, and production observation

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: Post-launch checks verify production revision, feed freshness/origin, tile/GeoSearch availability, service-worker update behavior, console/network errors, 404s, and correction/support signals.
- Evidence: Release-time live checks passed, but the required post-launch observation intervals have not elapsed.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Run/read-only checks at T+24 hours, T+7 days, and T+30 days; record failures, owner, response, and any forward fix.

### OPS-002 — Uptime, alert ownership, and service levels

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Operational alerts and response ownership are defined proportionally for the public product and its data freshness/dependency risks.
- Evidence: `.lifi/quality.yml` identifies production synthetic coverage but says alert ownership and some external monitoring evidence remain unresolved.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Define a proportionate read-only VERA availability/feed-freshness monitor and response path; do not add invasive visitor tracking merely to satisfy monitoring.

## Security, supply chain, and recovery

### SEC-001 — HTTPS and browser security headers

- Priority: P0
- Status: PASS
- Acceptance criterion: Production applies HTTPS and the required CSP, HSTS, `nosniff`, referrer, and permissions headers across relevant VERA routes and data responses.
- Evidence: `verify-live.mjs` checks these live headers; exact live quality passed; VERA CSP audit validates the `/vera/*` policy separately from the site-wide policy.
- Owner / approver: David Marsh / David Marsh.

### SEC-002 — Least-privilege CSP and external-origin controls

- Priority: P0
- Status: PASS
- Acceptance criterion: CSP grants only real VERA capabilities and browser URL handling validates trusted origins before rendering.
- Evidence: `audit-vera-csp.mjs` permits exact OpenFreeMap tiles, NYC Planning GeoSearch, blob/worker requirements, and removes GA origins from VERA; core/map trusted-host guards and tests enforce the contract.
- Owner / approver: David Marsh / David Marsh.

### SEC-003 — No private client material / safe public rendering

- Priority: P0
- Status: PASS
- Acceptance criterion: No credentials, private engine material, raw hunt data, contact details, private paths, or unvalidated unsafe external links enter browser content.
- Evidence: `SOURCE_OF_TRUTH.md` boundary; public lens tests; public-data audit; trusted URL parsing/allowlist checked by `audit-vera-csp.mjs`; no private engine/feed mutation in release handoff.
- Owner / approver: David Marsh / David Marsh.

### SEC-004 — Dependency, secret-scanning, and SCA evidence

- Priority: P1
- Status: PASS
- Acceptance criterion: Current dependency-vulnerability and secret-scanning results are retained and triaged for the exact release ecosystem.
- Evidence: `npm audit` reported zero vulnerabilities at all severities (including zero high); GitHub secret scanning and push protection are enabled with zero open alerts. The release SBOM is retained as `SBOM.cdx.json`.
- Owner / approver: David Marsh / David Marsh.
- Notes: Dependabot security updates are disabled; that configuration is recorded separately rather than hidden as a passing automation control.

### SEC-007 — Dependency update automation posture

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Dependency update monitoring/automation has a named owner and an intentional review cadence.
- Evidence: Dependabot security updates are currently disabled, while the release-time audit and GitHub security controls passed.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Decide whether to enable Dependabot security updates or retain an explicit manual dependency-review cadence before the next material release.

### SEC-005 — Third-party source, license, and removal posture

- Priority: P1
- Status: PASS
- Acceptance criterion: New material map assets have verified origin, compatible license, limited integration scope, and a feasible removal/fallback path.
- Evidence: OpenFreeMap source commit `72e1480…`; local style SHA `c3b181…`; glyph digest `02f4cb…`; `LICENSE-OPENFREEMAP.md`, `LICENSE-NOTO.txt`, and `SOURCE.md`; fallback map state and normal Git rollback.
- Owner / approver: David Marsh / David Marsh.

### SEC-006 — Security disclosure route

- Priority: P2
- Status: N/A
- Acceptance criterion: RFC 9116 `security.txt` is required when VERA becomes publicly operated software materially depended upon by others or when contract/policy requires it.
- Evidence: No `/.well-known/security.txt` is present; VERA is a non-critical public browser product with no supported public API, external operator dependency, or contractual security-disclosure requirement in this release.
- Owner / approver: David Marsh / David Marsh.
- N/A rationale: Revisit before launching an API, partner integration, contractual service, or externally operated/distributed VERA component.

### ROL-001 — Rollback deployment and takeover recovery

- Priority: P0
- Status: PASS
- Acceptance criterion: Code rollback and inherited-work recovery are executable without treating historical hosts/deploys as sources of truth.
- Evidence: Normal Git release can revert stabilization then feature commits in reverse; source recovery uses current Git history; archived inherited boundary `/Users/davidmarsh/Documents/Codex/2026-08-12/ok-w/work/vera-kimi-k3-boundary-2026-08-12.tar.gz` SHA-256 `bddddb73644510f8ee71d7d2312736eefe6ed4de907beb8c7cd491f53d27d38e`.
- Owner / approver: David Marsh / David Marsh.

### ROL-002 — Data rollback separation

- Priority: P0
- Status: PASS
- Acceptance criterion: Reverting VERA UI code cannot corrupt or reinterpret release-created persistent data or private-engine data.
- Evidence: VERA changes did not alter private engine/feed schema, public write behavior, database state, or user account data; browser hunt state remains local and existing feed contract remains unchanged.
- Owner / approver: David Marsh / David Marsh.

## Privacy, legal content, analytics, and commercial scope

### PRIV-001 — Accurate VERA privacy and terms disclosures

- Priority: P0
- Status: PASS
- Acceptance criterion: Privacy/terms describe VERA's actual processing, storage, providers, and user choices, and remain reachable from the product.
- Evidence: `app/public/vera/privacy/index.html`, `terms/index.html`, and footer routes; disclosures cover browser-local hunt state, optional direct NYC Planning address lookup, Netlify/GitHub/OpenFreeMap/listing-photo requests, and no accounts/ads/analytics.
- Owner / approver: David Marsh / David Marsh.

### PRIV-002 — Consent and optional tracking controls

- Priority: P0
- Status: N/A
- Acceptance criterion: Consent UI is required only if VERA deploys non-essential storage/tracking or other consent-based processing.
- Evidence: Privacy disclosure says no VERA cookie, advertising, analytics, tag manager, session recorder, social widget, or font CDN; VERA CSP deliberately excludes Google Analytics origins.
- Owner / approver: David Marsh / David Marsh.
- N/A rationale: Essential browser-local hunt state and service-worker caches support the requested product behavior; no optional tracker is active. Do not introduce a decorative banner.

### PRIV-003 — Sale/share/GPC and privacy-choice route

- Priority: P1
- Status: N/A
- Acceptance criterion: GPC and “Do Not Sell or Share” controls apply if VERA sells/shares personal data or performs targeted advertising under an applicable law/contract.
- Evidence: No VERA accounts, ads, advertising network, analytics, lead resale, or targeted-advertising flow; privacy page makes this claim.
- Owner / approver: David Marsh / David Marsh.
- N/A rationale: Reassess before adding any advertising, analytics, cross-site tracking, account, or lead-capture capability.

### PRIV-004 — Market/regulatory applicability record

- Priority: P1
- Status: N/A
- Acceptance criterion: Current VERA scope is assessed for children, health, payment-card, public-sector/procurement, regulated-data, and internationalization triggers without making unsupported legal conclusions.
- Evidence: VERA is a public NYC rental-information product using a sanitized public-record projection; no child-directed experience, medical data, payment card, government procurement commitment, user account, or regulated-data intake is in scope.
- Owner / approver: David Marsh / David Marsh (legal conclusion not implied).
- N/A rationale: This is a feature-scope record, not a legal opinion. Reassess if markets, audience, contracts, payments, or data categories expand.

### LEG-001 — High-impact renter-law guidance ownership

- Priority: P0
- Status: PASS
- Acceptance criterion: Renter-law/consumer-protection statements retain primary citations and have an accountable content/legal review trigger.
- Evidence: `audit-vera-legal-content.mjs` asserts current specific copy and five primary-source links; rendered manual content is tested after build; David Marsh owns the current public-content scope.
- Owner / approver: David Marsh / David Marsh (content authority).
- Notes: This is current-source/content-owner verification, not legal advice or a claim of legal counsel. Reconfirm cited wording and obtain appropriate legal review before expanding advice, certainty claims, geographic scope, or regulated claims.

### ANAL-001 — Intentional VERA measurement decision

- Priority: P1
- Status: PASS
- Acceptance criterion: VERA's measurement posture is intentional and does not install duplicate/unconsented analytics.
- Evidence: Product intentionally has no analytics; privacy disclosure and VERA CSP confirm no GA/tag-manager origins; live browser checks found no console warning/error.
- Owner / approver: David Marsh / David Marsh.

### ANAL-002 — Product-health monitoring without visitor tracking

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: VERA has a proportionate, privacy-preserving post-launch health signal for revision/feed/dependency correctness.
- Evidence: `quality:live` is a read-only exact-revision synthetic; ongoing cadence/alert ownership remains unresolved.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Use revision/feed health and error/404 observations; do not add client analytics without a new privacy, consent, and measurement decision.

### SCOPE-003 — Commercial communications and customer handover

- Priority: P2
- Status: N/A
- Acceptance criterion: CAN-SPAM/CASL/TCPA, client handover, sales approval, refunds, and customer support contracts apply only to a commercial/customer launch.
- Evidence: VERA is a free public Little Fight product demonstration with no VERA lead capture, outreach, subscription, sale, payment, or client delivery.
- Owner / approver: David Marsh / David Marsh.

## Tooling and AI-assisted work

### TOOL-001 — Material VERA tool inventory

- Priority: P1
- Status: PASS
- Acceptance criterion: Material VERA dependencies and their data paths are identified.
- Evidence: `.lifi/quality.yml` lists Netlify, GitHub feed, VERA public feed, and hosting direction/data; `SOURCE_OF_TRUTH.md` and CSP audit identify OpenFreeMap tiles, NYC Planning GeoSearch, MapLibre, first-party assets, and their boundary.
- Owner / approver: David Marsh / David Marsh.

### TOOL-002 — Provider operational sign-off

- Priority: P1
- Status: PASS
- Acceptance criterion: Each material provider has a durable sign-off covering purpose, owner, data access, licensing/cost/renewal where applicable, configuration source, support posture, and removal/rollback.
- Evidence: `TOOLS.md` records GitHub, Netlify, MapLibre GL JS, OpenFreeMap styles/tiles, Noto glyphs, NYC Planning GeoSearch, and the public sanitized-feed proxy with their purpose, owner, data boundary, configuration source, validation, and removal/rollback route.
- Owner / approver: David Marsh / David Marsh.
- Notes: No material VERA provider is admitted solely because it worked in a demo; operational/tool boundaries are tied to the verified release contract.

### TOOL-003 — Provider cost, quota, contract, and renewal detail

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Known cost, quota, contract, renewal, cancellation, and support details are recorded for each material provider, or the unknown is assigned an owner and review date.
- Evidence: `TOOLS.md` records the implementation-side provider posture, but no new VERA-specific cost or contract was introduced and some external provider quotas/contract terms remain unknown.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Confirm applicable Netlify, map-tile, GeoSearch, and feed-hosting quota/cost/contract facts during observation; do not invent values or treat public availability as an SLA.

### AI-001 — AI-assisted implementation provenance

- Priority: P1
- Status: FIXED
- Acceptance criterion: AI assistance is disclosed as implementation assistance, never treated as production authority, and bounded by human review/test evidence.
- Evidence: Takeover handoff records inherited Kimi K3 boundary/archive and Codex completion; final source was reviewed through deterministic audits, browser tests, live verification, and Git/Netlify provenance.
- Owner / approver: David Marsh / David Marsh.
- Notes: AI is not a VERA runtime dependency or user-facing decision maker.

### AI-002 — AI data and change-safety boundary

- Priority: P0
- Status: PASS
- Acceptance criterion: Private engine/raw feed, contacts, credentials, customer data, and secrets are excluded from AI-assisted work and from the public release; generated changes are tested before release.
- Evidence: Handoff records no private engine/feed-schema/scoring/private-data/LaunchAgent changes; public lens and repository boundaries; release audits, 173/173 browser tests, and live 160/160 harness.
- Owner / approver: David Marsh / David Marsh.

### AI-003 — AI tool approval record

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: If AI tooling remains part of the delivery system, its vendor/version, approved purpose, data boundary, access, retention, cost/owner, and removal plan are recorded.
- Evidence: Work provenance is recorded, but no complete durable AI-tool sign-off record for the delivery system was found.
- Owner / approver: David Marsh / David Marsh.
- Follow-up: Create a non-secret tool record before next material VERA release; it should not claim that an AI model approved or deployed production.

## Closeout schedule and stop rules

### POST-001 — Immediate deployment verification

- Priority: P0
- Status: PASS
- Acceptance criterion: Exact live revision, canonical domain, critical VERA routes/assets, data headers, browser acceptance, and console behavior are checked after production is ready.
- Evidence: Exact `quality:live` passed; live harness 160/160; live Atlas keyboard behavior and zero console warnings/errors; map asset HTTP checks; Netlify exact deploy verification.
- Owner / approver: David Marsh / David Marsh.

### POST-002 — T+24-hour observation

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: Verify revision, feed age/origin, public route/asset responses, console/network condition, map/address dependencies, service-worker update, and corrections/support signals approximately 24 hours after release.
- Evidence: Interval has not elapsed at release closeout.
- Owner / approver: David Marsh / David Marsh.

### POST-003 — T+7-day observation

- Priority: P1
- Status: DEFERRED
- Acceptance criterion: Review user-impact signals, 404/error patterns, feed/dependency reliability, legal/corrections inputs, and newly observed browser/device issues after one week.
- Evidence: Interval has not elapsed at release closeout.
- Owner / approver: David Marsh / David Marsh.

### POST-004 — T+30-day observation and care-window closeout

- Priority: P2
- Status: DEFERRED
- Acceptance criterion: Review field performance if data is sufficient, repeat production health checks, and close or extend each deferred requirement with current evidence.
- Evidence: Interval has not elapsed at release closeout.
- Owner / approver: David Marsh / David Marsh.

## Final decision record

| Decision | Status | Authority | Basis |
|---|---|---|---|
| Product release | In Observation | David Marsh | Current user direction and `DECISION.md` record the scoped closeout; all P0 release-product/data/security/Netlify/functional checks above pass or are fixed; no known P0/P1 product blocker. |
| Known release defects | None open | David Marsh | The optional MapLibre POI icon warning was fixed in `0a4d1d4a…` and re-verified across browsers and live. |
| Deferred aftercare | Active | David Marsh | Manual assistive-tech/real-device checks, serial/physical-device and field performance evidence, post-launch observation, noncanonical-host disposition, Dependabot/review cadence, provider quota/contract facts, AI tool record, and automated artifact-retention policy. |
| Rollback authority | Available | David Marsh | New Git revert release through the canonical `main`→Netlify rail; no manual deploy or historical host recovery. |

No control in this dossier is silently treated as a blanket section pass. A later release must reopen any requirement affected by a material change in data collection, feed/schema, user account, provider, market, legal guidance, deployment path, or product scope.

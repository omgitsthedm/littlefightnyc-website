# VERA 2.0 Release Evidence Index

Release ID: `vera-2.0-2026-08-13`
Decision state: **In Observation**
Standard: Universal Product Feature Website Launch Standard `2026-08-12.1`
Canonical local location: `.lifi/evidence/releases/vera-2.0-2026-08-13/` in `omgitsthedm/littlefightnyc-website`; this project-specific evidence registry overrides the standard's default dossier path.

## Evidence custody

- System of record: Canonical Git repository, GitHub `main`, Netlify production history, and this release dossier.
- Owner: David Marsh / Little Fight NYC.
- Approved access roles: Release owner and authorized maintainers.
- Retention: Retain with canonical source and recovery records until product retirement plus applicable business/recovery retention.
- Recovery/export: Git remote, Netlify deploy history, and the documented pre-takeover archive. No raw private engine data, credentials, browser profiles, production logs, or customer data are retained here.
- Hold status: No legal, incident, or contractual hold known at closeout time.

## Release identity

| Key | Value |
|---|---|
| Canonical public repository | `omgitsthedm/littlefightnyc-website` |
| Public branch | `main` |
| Canonical checkout | `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website` |
| Feature commit | `5320c757ab89ac44c90658d207ac6ccb3f8cec7f` |
| Stabilization / final release commit | `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` |
| Netlify site | `littlefightnyc` / `0907d8fe-7018-48db-a6be-1f906e4b2619` |
| Netlify production deploy | `6a7d752e5c61310008bc3a9f` |
| Canonical public URL | <https://littlefightnyc.com/vera/> |
| Production verification | `EXPECTED_REVISION=0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183 npm run quality:live` — PASS |
| Browser gate | 173/173 Playwright executions — PASS |
| Live in-page acceptance harness | 160/160 — PASS |
| Owner product acceptance | User explicitly accepted the finished product and requested standard closeout, 2026-08-13 |

## Evidence register

| ID | Evidence | Source / command / stable location | Date | Result | Retention / notes |
|---|---|---|---|---|---|
| E-01 | Canonical public source and branch identity | Canonical checkout `git status --short --branch`; `git log` | 2026-08-13 | Application release checkpoint clean and aligned with `origin/main` at `0a4d1d4…` | The later dossier checkpoint is local, documentation-only, and outside deployed `app/public/**`. |
| E-02 | Authorized feature implementation | Git commit `5320c757ab89ac44c90658d207ac6ccb3f8cec7f` | 2026-08-13 | PASS | Primary 2.0 implementation. |
| E-03 | Post-release optional-POI remediation | Git commit `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` | 2026-08-13 | PASS | Bounded map image fallback; final release commit. |
| E-04 | Host identity | Netlify site `littlefightnyc`, ID `0907d8fe-7018-48db-a6be-1f906e4b2619` | 2026-08-13 | PASS | Existing Git-connected production property. |
| E-05 | Exact production deploy | Netlify production deploy `6a7d752e5c61310008bc3a9f` | 2026-08-13 | Exact revision verified | Manual production deploy was not used; release decision remains In Observation. |
| E-06 | Candidate/release browser quality | `npm run quality:release` | 2026-08-13 | PASS; 173/173 Playwright executions plus release audits | Browser projects cover Chromium desktop/mobile, Firefox desktop, WebKit desktop/mobile, and iPad. |
| E-07 | Live production quality | `EXPECTED_REVISION=0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183 npm run quality:live`; live VERA `?test=1` harness | 2026-08-13 | PASS; 160/160 harness, exact revision, no console warnings/errors | Read-only anonymous test. |
| E-08 | Public/private boundary | `SOURCE_OF_TRUTH.md`, canonical VERA route/rewrite audits, no engine changes | 2026-08-13 | PASS | Browser only reads first-party sanitized `/vera/data/{public,archive,meta}.json`; private engine is isolated. |
| E-09 | VERA public asset delivery | Live HTTP checks for `/vera/`, versioned `vera-map.js?v=57`, local style JSON, sprite JSON/PNG, representative glyph PBF | 2026-08-13 | PASS; HTTP 200 / expected types | Read-only verification. |
| E-10 | Atlas operational QA | Live 1440×900 Atlas check; map ready, `vera-surveyor-liberty`, clusters, `price-score` points, keyboard popup/focus, optional-icon fallbacks | 2026-08-13 | PASS; no console warning/error | Nine unfamiliar optional POI image IDs were absorbed without changing VERA listing semantics. |
| E-11 | Map asset provenance/licensing/integrity | `app/public/vera/assets/vendor/maplibre/style/SOURCE.md`, `LICENSE-OPENFREEMAP.md`, `LICENSE-NOTO.txt`; release/legal audits | 2026-08-13 | PASS | 776 files/~102 MiB. OpenFreeMap commit `72e1480dfc92858d334647037988bd2591fdb021`; style SHA-256 `c3b181be9436e3e2eb80668382768644a8b14ec90fa1d158317d5dc6cb0f06ec`; glyph digest `02f4cb94608d049fae80f6de53511836b4ce79e7540b75be4ad1b1b44c95a986`. |
| E-12 | Privacy/legal/cache/release contracts | Lint, TypeScript, JS syntax, diff integrity, legal-content, CSP, metadata, repository-boundary, retired-integration, Dakota-distribution, and release-readiness checks within quality lane | 2026-08-13 | PASS | No raw engine/private data or secrets inspected/recorded. |
| E-13 | Takeover recovery boundary | `/Users/davidmarsh/Documents/Codex/2026-08-12/ok-w/work/vera-kimi-k3-boundary-2026-08-12.tar.gz` | 2026-08-12 | Preserved | SHA-256 `bddddb73644510f8ee71d7d2312736eefe6ed4de907beb8c7cd491f53d27d38e`; scratch/recovery material, not public source. |
| E-14 | Cross-repository operating boundary | `/Users/davidmarsh/Code/Personal/vera-apartment-search/VERA-HANDOFF.md` | Reviewed 2026-08-13 | PASS | Defines engine, public feed boundary, recovery rail, and prohibition on restoring standalone host/dashboard. |
| E-15 | Observation follow-up | Canonical `/vera/` and `/vera/data/*` read-only checks plus `public-feed-health.yml` outcome | Due 2026-08-14 MST | DEFERRED | Required to upgrade decision from In Observation; do not dispatch publishing or alter engine schedules. |
| E-16 | Post-release performance diagnostic | `PERFORMANCE.md`, `LIGHTHOUSE-SHA256.txt`, and the local raw-evidence root named in those files; Lighthouse 13.4.1, three runs each for Today/Atlas desktop/mobile, executed as four concurrent route/profile groups | 2026-08-13 | Diagnostic, not strict gate | Today desktop median 97/LCP1.186s/TBT0/833176 bytes/34 req/CLS .000246; Today mobile 86/LCP4.084s/TBT15.5ms/594606 bytes/35 req/CLS0; Atlas desktop 96/LCP1.276s/TBT0/1270815 bytes/38 req/CLS .04176; Atlas mobile 62/LCP5.206s/TBT1.185s/886598 bytes/35 req/CLS0. |
| E-17 | Explicit owner acceptance | User accepted product and requested this standard closeout | `2026-08-13 01:37:51 MST (-0700)` | Recorded | David is release/product owner; this is not an independent peer, legal, or professional accessibility approval. |
| E-18 | Software supply chain/security posture | `SBOM.cdx.json`; `npm audit --omit=dev`; GitHub security settings | 2026-08-13 | PASS / aftercare noted | CycloneDX 1.5, 24 components: 21 production npm packages and 3 vendored VERA map components; SBOM SHA-256 `2dbbd2ef1e5b98400236685c7ae2c6358d0eac2ca6a1db4ef96aa79572023609`; npm audit 0 vulnerabilities; secret scanning/push protection enabled, 0 open alerts; Dependabot security updates disabled (P2). |
| E-19 | Material provider register | `TOOLS.md` | 2026-08-13 | PASS / unknown terms deferred | GitHub, Netlify, MapLibre, OpenFreeMap, Noto, NYC Planning GeoSearch, and sanitized-feed proxy boundaries, owners, evidence, and removal routes recorded. |
| E-20 | Reachable host inventory | Read-only HTTP/document checks for canonical, `www`, `hey`, Netlify platform, `main` branch, and immutable deploy hosts | 2026-08-13 | Canonical route PASS; P2 disposition deferred | HTTP and `www` redirect correctly. Noncanonical 200 hosts render the canonical VERA link but do not redirect or return noindex; site-wide host policy remains owner aftercare. |
| E-21 | Applied release standard | User-provided `Universal Product Feature Website Launch Standard.md`, version `2026-08-12.1` | 2026-08-13 | PASS | 2,594 lines; source SHA-256 `b9d37bb3435b7361d81eb17757438786542694d3848a46793f4c4b239aa2c795`. The standard itself remains in its user-provided location and is not duplicated into the product repository. |
| E-22 | Dossier integrity | `DOSSIER-SHA256.txt` | 2026-08-13 | PASS | Every retained dossier file except the self-referential manifest is covered by SHA-256 and verifies from the dossier directory. |

## Approval and exception evidence

| ID | Decision | Authority | Evidence | Status |
|---|---|---|---|---|
| A-01 | Canonical `main` production release | David Marsh | Release authority in session and repository contract | Recorded |
| A-02 | No manual deploy / platform-console change | Repository `AGENTS.md` and `SOURCE_OF_TRUTH.md` | Git-connected Netlify exact deploy evidence | PASS |
| A-03 | Complete local glyph/style bundle | David Marsh | Release audits and vendor provenance files | Approved; observe size impact |
| A-04 | Final status held at In Observation | David Marsh | `REPORT.md` VERA-OBS-001 | Open until post-release evidence is recorded |
| A-05 | Product acceptance and standard closeout request | David Marsh, release/product owner | User instruction, 2026-08-13 | Recorded; does not waive independent/specialist review |

## Requirements status summary

| Status | IDs / disposition |
|---|---|
| PASS | VERA-REL-001, VERA-DATA-001, VERA-PWA-001, VERA-SC-001 |
| FIXED | VERA-UX-001, VERA-A11Y-001, VERA-MAP-001 |
| DEFERRED | VERA-OBS-001: one normal post-release observation window, owned by David Marsh, target 2026-08-14 MST; VERA-PERF-001: serial/physical performance aftercare before next performance release; VERA-REV-001: independent peer review before Ready; VERA-HOST-001: site-wide noncanonical-host disposition before the next host/SEO release |
| BLOCKED | None |
| WAIVED | None |
| N/A | Client handover, customer write tests, payments, booking, form submission, engine/private-runtime mutation, migration, and infrastructure change |

## Evidence integrity and access notes

- Production evidence is revision-bound: `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` was the exact local candidate, remote branch, deployed, and live release identity at capture time. A later local documentation-only checkpoint does not replace the production revision.
- The evidence index deliberately contains no secrets, access tokens, user listing data, private engine logs, contacts, or credentials.
- The private VERA engine is not a deploy target for this release. Its scheduled publication and LaunchAgent configuration were untouched.
- Retired `vera-pipeline` hosting and archived dashboard material are retained only as historical/recovery references and must not become a production path.
- The final decision is not Ready. Capture E-15 and resolve or explicitly reclassify the deferred peer/performance aftercare before changing the decision state. There are no WAIVED items.

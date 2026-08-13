# VERA 2.0 owner-action packet

Release ID: `vera-2.0-2026-08-13`
Scope: VERA is a Little Fight NYC public product, not a client delivery. This is an owner-action packet, not a request for client access or approval.
Current decision: **In Observation** — production parity and scoped acceptance have passed; final Ready decision awaits the records/checkpoints below.

## Action summary

| ID | Owner action | Priority | Current status | Requested by |
|---|---|---:|---|---|
| OA-01 | Named release decision and approvals for the exact candidate. | P1 governance | PASS — recorded | Completed 2026-08-13 MST |
| OA-02 | Complete 24-hour production observation. | P1 operations | DEFERRED | 2026-08-14 MST |
| OA-03 | Complete seven-day production review. | P2 operations | DEFERRED | 2026-08-20 MST |
| OA-04 | Complete 30-day health and maintenance review. | P2 operations | DEFERRED | 2026-09-12 MST |
| OA-05 | Serial performance rerun, physical-phone evidence, and bounded VERA optimization decision. | P2 performance | DEFERRED | 2026-08-20 MST |
| OA-06 | Capture a real-phone and manual screen-reader primary-journey record. | P1 accessibility evidence | DEFERRED | 2026-08-20 MST |
| OA-07 | Current legal-content owner and primary-citation contract. | P1 legal-content governance | PASS — recorded | Completed 2026-08-13 MST |
| OA-08 | Track Dependabot status and material-tool cost/quota review. | P2 supply chain | DEFERRED | 2026-08-20 MST |
| OA-09 | Classify any future live external address-lookup test before it is run. | P1 production-test control | DEFERRED | Before such a test |
| OA-10 | Decide the site-wide alias/platform-host redirect or noindex policy. | P2 host/SEO governance | DEFERRED | Before next host, DNS, or SEO release |

## Completed records

- **OA-01 PASS:** The named release decision and attributable approvals for candidate `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` are recorded. The decision remains **In Observation** until the timed operational checkpoints are complete.
- **OA-07 PASS:** Current renter-law content ownership and primary-source citation contract are recorded for this candidate. Re-open the review before a material expansion of claims, markets, or legal guidance.
- **Supply-chain/tool record completed:** SBOM, audit, secret-scan, provenance, and material-tool records are complete for this candidate. OA-08 retains only the independently owned P2 follow-ups below.

## OA-02 — 24-hour production observation

- **Recipient/accountable role:** Little Fight NYC operations/support owner.
- **Copy-ready request:** “At or after 2026-08-14 MST, review the VERA release’s uptime, new errors, failed requests/404s, cache and data-endpoint health, OpenFreeMap/NYC Planning dependency health, deploy logs, service limits/cost, and any support reports. Compare them with the release stop conditions. Record the timestamp, sources checked, outcome, incidents, and continue/pause/revert decision.”
- **Safe boundary:** Read-only production inspection. Do not submit a VERA address, form, payment, lead, landlord message, or notification as part of this check.
- **Implementation after receipt:** Update the observation record and either retain In Observation, open a bounded fix, or advance only with recorded authority.

## OA-03 — seven-day production review

- **Recipient/accountable role:** Product/business and operations/support owners.
- **Copy-ready request:** “At or after 2026-08-20 MST, review real-user performance where available, browser/device errors, public route/indexing and sitemap behavior, 404s/failed requests, external map/data dependency health, any user reports, and all deferred items. Confirm whether a material regression, temporary shim, or unowned legacy path remains.”
- **Implementation after receipt:** Add evidence, close/re-date deferred requirements, and open a normal release only if a change is needed.

## OA-04 — 30-day health and maintenance review

- **Recipient/accountable role:** Product/business, operations/support, and technical owners.
- **Copy-ready request:** “At or after 2026-09-12 MST, review Core Web Vitals field data where available, public visibility/crawl/indexing, VERA content/law-source currency, dependency/platform updates, map-service health/cost, backup and rollback validity, and whether the local glyph strategy remains justified. Convert any durable finding into a test, documentation, or owned maintenance task.”
- **Implementation after receipt:** Close the observation cycle or document continued maintenance risks with an owner and review date.

## OA-05 — serial performance confirmation and bounded optimization decision

- **Recipient/accountable role:** Engineering/performance owner.
- **Completed baseline:** 12 candidate-specific Lighthouse reports, exact medians, root-cause analysis, and SHA-256 manifest are recorded in `PERFORMANCE.md` and `LIGHTHOUSE-SHA256.txt`. The local 102 MiB glyph bundle was not downloaded by these runs and is not an evidenced LCP cause.
- **Copy-ready request:** “Rerun Today and Atlas serially—not alongside the other profile groups—using the documented Lighthouse profile, then repeat representative journeys on a physical phone. Confirm whether the diagnostic mobile medians hold. If optimization is warranted, choose only a bounded VERA-source change, such as preventing non-Atlas idle MapLibre warm-up, preserving first paint before direct-Atlas map construction, or validating lower-priority non-LCP font preloads. Record the selected budget, before/after evidence, and rollback gate.”
- **Why:** The current reports are diagnostic because their four profile groups ran concurrently; they are not a controlled field or serial baseline. The Atlas result points to cold MapLibre CPU, while Today points to SPA/feed-render and CSS/font critical-path behavior.
- **Implementation after receipt:** Attach serial/physical results to the evidence index; release any selected change only through the normal full regression and production-verification rail.

## OA-06 — real-device and screen-reader evidence

- **Recipient/accountable role:** Accessibility/quality owner.
- **Copy-ready request:** “Use at least one physical phone and perform a manual screen-reader primary journey. Cover navigation, Today, Atlas map/list, listing inspection, gallery/lightbox, My Hunt local-state controls, error/retry behavior, visible focus, zoom/reflow, and reduced motion. Record device, OS/browser, assistive technology, test date, issues, and outcome.”
- **Why:** The passed Playwright matrix is strong emulated browser coverage, but it is not a durable physical-phone or manual assistive-technology record.
- **Implementation after receipt:** Mark the relevant accessibility/browser requirements PASS, FIXED, or DEFERRED with evidence; escalate any P0/P1 finding before a Ready decision.

## OA-08 — Dependabot and material-tool cost/quota review

- **Recipient/accountable role:** Engineering/security owner.
- **Completed baseline:** SBOM, dependency/audit disposition, Netlify secret-scan evidence, local map license/provenance, and material-tool register are recorded for this candidate.
- **Copy-ready request:** “Confirm whether Dependabot is enabled and whether any material tool has an unrecorded cost, quota, or renewal boundary. Record each unknown as an owner-assigned P2 follow-up with a review date; do not infer a plan, credential, or spend from absence of evidence.”
- **Implementation after receipt:** Update the tool/sign-off register or close the P2 follow-up with attributable evidence.

## OA-09 — external address lookup test classification

- **Recipient/accountable role:** Release/quality owner.
- **Copy-ready request:** “Before any live exact-address test, classify it under the production-test policy. If a real address could be sent to NYC Planning, use an approved read-only/synthetic/reversible boundary, minimized non-personal test data, and record the authority, date, expected side effect, and reconciliation. Do not use a renter’s address or create an unnecessary external record.”
- **Why:** The product intentionally makes this user-initiated external request only when a visitor chooses it. A release test must not create an unrecorded third-party data effect.
- **Implementation after receipt:** Add the outcome to Production Tests; otherwise retain passive contract evidence and mark an active live submission N/A/DEFERRED.

## OA-10 — noncanonical host disposition

- **Recipient/accountable role:** Product/SEO and hosting owner.
- **Completed baseline:** HTTP and `www` redirect correctly. The canonical, `hey`, Netlify platform, `main` branch, and immutable deploy VERA hosts were checked. Each successful document points its canonical URL to `https://littlefightnyc.com/vera/`, but the noncanonical 200 hosts do not redirect or return noindex.
- **Copy-ready request:** “Choose and record the site-wide disposition for each custom alias, Netlify platform host, branch host, and immutable deploy host: redirect, noindex, canonicalized evidence host, or approved distribution. Preserve deploy evidence where needed and avoid changing DNS or Netlify configuration without a separate host release and rollback plan.”
- **Implementation after receipt:** Update `NET-005`, the source-of-truth host map, and live verification only through a separately authorized site-wide host/SEO change.

## Required response format

For each action, record: owner and role, release ID and exact candidate SHA, decision/status (`PASS`, `FIXED`, `N/A`, `BLOCKED`, `DEFERRED`, or `WAIVED`), timestamp/timezone, evidence link or redacted reference, risk/compensating control, and next review date. Do not place credentials, raw production logs, user addresses, or private VERA-engine material in the dossier.

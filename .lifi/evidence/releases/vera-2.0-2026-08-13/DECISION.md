# VERA 2.0 Release Decision

## Decision

**In Observation** — not unconditional Ready.

The accepted public product is the exact canonical release:

| Field | Value |
|---|---|
| Release ID | `vera-2.0-2026-08-13` |
| Final commit | `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` |
| Netlify deploy | `6a7d752e5c61310008bc3a9f` |
| Canonical route | <https://littlefightnyc.com/vera/> |
| Release/product owner | David Marsh / Little Fight NYC |
| Owner acceptance | User explicitly accepted the product and requested this standard closeout on 2026-08-13 |
| Decision recorded | `2026-08-13 01:37:51 MST (-0700)` |

## Basis

- Exact local, remote, Netlify, and live revision parity passed.
- `npm run quality:release` passed with 173/173 browser executions.
- Revision-bound `quality:live` and the live VERA acceptance harness passed, with 160/160 harness checks and no observed live console warnings/errors.
- The public/private engine boundary, first-party sanitized data contract, map asset provenance, legal/cache contracts, and production asset delivery were verified.

## What this decision does and does not mean

David is recorded as the release and product owner and has accepted the shipped product. That acceptance does **not** assert or substitute for professional legal review, professional accessibility review, a formal performance certification, or independent peer review.

No requirement is WAIVED. The release remains In Observation while these items are recorded and resolved or consciously reclassified:

| ID | Item | Owner | Target / hold |
|---|---|---|---|
| VERA-OBS-001 | One normal post-release observation window: canonical route/data availability and read-only feed-health outcome | David Marsh | 2026-08-14 MST |
| VERA-PERF-001 | Serial Lighthouse rerun; physical phone; remove non-Atlas global idle map preload; paint Atlas header before map construction; assess font preloads | David Marsh | Before next performance-affecting VERA release |
| VERA-REV-001 | Named independent peer review of final candidate/dossier | David Marsh | Before a Ready decision |
| VERA-A11Y-002 | Manual assistive-technology session and 200%/400% text-reflow evidence | David Marsh | Future quality tranche; no specialist approval implied |
| VERA-HOST-001 | Site-wide redirect, noindex, or evidence-host disposition for each noncanonical 200 host | David Marsh | Before next host, DNS, or SEO release |

## Observation stop conditions and authority

David Marsh holds rollout and rollback authority. Stop and assess rollback through the canonical Git release rail if a privacy-boundary breach, primary-route/data failure, exact-revision mismatch, repeatable P0/P1 functional defect, or material public console error appears.

No production write, engine feed publication, schedule change, account change, or manual Netlify deploy is authorized by this closeout.

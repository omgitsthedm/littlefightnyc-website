# VERA 2.0 release dossier

Release `vera-2.0-2026-08-13` is live and **In Observation**. No known P0 or P1 product blocker remains.

This dossier uses the repository's declared `.lifi/evidence` registry. That project-specific system overrides the universal standard's default `docs/releases/<release-id>/` path; the repository boundary audit prohibits a top-level `docs/` tree.

| Field | Value |
|---|---|
| Canonical product | <https://littlefightnyc.com/vera/> |
| Production revision | `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` |
| Netlify deploy | `6a7d752e5c61310008bc3a9f` |
| Release owner | David Marsh / Little Fight NYC |
| Applied standard | `2026-08-12.1`, source SHA-256 `b9d37bb3435b7361d81eb17757438786542694d3848a46793f4c4b239aa2c795` |

## Start here

- `DECISION.md` records the attributable release decision and its limits.
- `REPORT.md` follows the standard's Section 20 closeout structure.
- `REQUIREMENTS.md` is the complete stable-ID applicability and status matrix.
- `EVIDENCE-INDEX.md` maps release claims to retained evidence.
- `BASELINE.md` records takeover state and fixed findings.
- `PERFORMANCE.md` and `LIGHTHOUSE-SHA256.txt` retain the diagnostic performance method, results, analysis, and raw-report integrity references.
- `OBSERVATION.md` is the T0, T+24-hour, T+7-day, and T+30-day ledger.
- `ROLLBACK.md` contains stop conditions and the normal Git recovery rail.
- `CLIENT-ACTIONS.md` is the owner-action packet; VERA is not a client engagement.
- `TOOLS.md` records material providers, data boundaries, evidence, and removal paths.
- `SBOM.cdx.json` is the CycloneDX 1.5 release inventory.
- `DOSSIER-SHA256.txt` verifies every retained dossier file except itself.

## Current hold points

The shipped product remains available. “In Observation” preserves evidence honesty while the dated operational checks, independent review, physical-device/manual assistive-technology evidence, serial performance confirmation, noncanonical-host disposition, and lower-priority governance items remain open.

This folder sits outside `app/public/**` and is not deployed as VERA content. It contains no credentials, raw hunt data, contacts, private engine state, or production user records. Product changes, host changes, feed publication, schedule changes, and manual Netlify deployment are outside this dossier-only closeout.

# VERA 2.0 rollback record

Release ID: `vera-2.0-2026-08-13`
Release candidate: `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`
Production deploy: Netlify `6a7d752e5c61310008bc3a9f`
Canonical public URL: `https://littlefightnyc.com/vera/`

## Scope and authority

This rollback applies only to the public VERA work released through the canonical Little Fight NYC website repository and its existing GitHub `main` -> Netlify production rail. The rollback authority is the recorded Little Fight NYC release/go-no-go authority. Do not use a manual Netlify production deploy, force-push, `git reset --hard`, historical `vera-pipeline`, or `vera-dashboard` as a rollback mechanism.

The private VERA engine, its schedules, private/raw research, sanitized feed branch, LaunchAgents, Dakota, and PHC were not changed by this release. They require no rollback and must remain out of this procedure.

## Previous stable public state

| Item | Value |
|---|---|
| Previous public release commit | `7119ca639df7e5f736c9ef6a310fd126fc0b66bd` |
| Feature commit to reverse, if full product rollback is needed | `5320c757ab89ac44c90658d207ac6ccb3f8cec7f` |
| Stabilization commit to reverse first | `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` |
| Pre-takeover recovery archive | `/Users/davidmarsh/Documents/Codex/2026-08-12/ok-w/work/vera-kimi-k3-boundary-2026-08-12.tar.gz` |
| Archive SHA-256 | `bddddb73644510f8ee71d7d2312736eefe6ed4de907beb8c7cd491f53d27d38e` |

The archive preserves the inherited dirty boundary for historical inspection/recovery. It is not a production rollback artifact and must never be overlaid onto the canonical checkout.

## Stop conditions and decision thresholds

Pause exposure and request the release authority to decide whether to rollback when any of the following is confirmed:

- a P0 privacy boundary breach, public exposure of private engine/feed data, or security header/host regression;
- VERA root, public data contract, Atlas, Browse, My Hunt, gallery/lightbox, or document routes are unavailable or materially broken on the canonical domain;
- reproducible console errors, failed required first-party requests, accessibility failure in the primary journey, or a map regression that blocks listings;
- live revision/deploy/source parity diverges or an unapproved platform/host transformation is detected;
- a legal-content owner withdraws approval for a public claim or discovers a materially incorrect renter-law statement;
- observation shows a material performance, quota, cost, or external OpenFreeMap/NYC Planning dependency failure without an acceptable recovery path.

For a non-blocking regression, first determine whether reverting only the stabilization commit restores the required behavior. Do not conflate a transient external map-tile or GeoSearch condition with a code defect without evidence.

## Rollback paths

### Path A — remove only the POI-icon fallback stabilization

Use only if the transparent optional-icon fallback itself causes a confirmed regression and the feature commit remains otherwise safe.

1. Confirm current canonical checkout, clean working tree, target Netlify site ID, and current `main` tip.
2. Create a normal revert commit for `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183`; do not amend history or force-push.
3. Run the same proportional release gate against that new revert candidate.
4. Push the revert to `main`; wait for the exact Git-connected Netlify production deploy.
5. Verify exact live revision with `EXPECTED_REVISION=<revert-sha> npm run quality:live`, then inspect VERA Atlas behavior and console.

### Path B — return public VERA to the prior stable website state

Use for a material VERA 2.0 defect that cannot be safely mitigated in a bounded forward fix.

1. Reverse `0a4d1d4a31ea3c2ac1f512afa653bb305dbc9183` first.
2. Reverse `5320c757ab89ac44c90658d207ac6ccb3f8cec7f` second.
3. Resolve conflicts only within the canonical public website source, preserving any later unrelated work. If `main` has advanced, base the reverts on the actual current tip and record every conflict decision.
4. Run the standard release gate on the resulting candidate; do not deploy from a locally edited historical tree.
5. Push the revert commits to GitHub `main`. Netlify must produce a ready production deploy tied to the final revert SHA.
6. Check `/release.json`, VERA routes, data headers, robots/sitemap behavior, and core user journeys on `https://littlefightnyc.com/vera/`.

### Path C — forward fix instead of rollback

For a bounded, reversible defect with no privacy/security/law breach, create a narrowly scoped fix on the canonical source, preserve the public data boundary, pass the proportional gate, and deploy through the normal Git-connected rail. The go/no-go authority must record why a forward fix is safer than a revert.

## Required rollback verification

- Local tree, GitHub `main`, Netlify ready production deploy, and live `/release.json` identify the same post-rollback revision.
- `npm run quality:release` passes for the candidate and `EXPECTED_REVISION=<final-sha> npm run quality:live` passes against the canonical domain.
- VERA homepage, Atlas map/list, Browse, My Hunt, gallery/lightbox, public documents, data endpoint headers, and map assets load as expected.
- Check console errors/warnings and focus/keyboard behavior for the affected journey.
- Confirm public data remains restricted to `/vera/data/{public,archive,meta}.json`, with no raw/private-engine material introduced.
- Record Netlify deploy ID, published timestamp, verification timestamp/timezone, decision authority, and user/client communication disposition.

## Communication and observation

The VERA product does not create customer bookings, payments, leads, landlord contact, or messages. If a rollback changes public availability or published renter guidance, the release owner should post a concise status note through the approved Little Fight NYC channel and update the release dossier. Do not submit test forms, addresses, payments, or notifications merely to prove rollback.

After any rollback or forward fix, restart the observation clock and retain the original release evidence, decision reason, before/after deploy IDs, and recovery test results.

# Little Fight NYC Conversion Measurement

Last updated: 2026-07-20

## Privacy boundary

- Analytics is denied by default.
- Google Analytics, Microsoft Clarity, TikTok, lead attribution, and real-user monitoring start only after `Allow analytics`.
- `Essential only` loads none of those vendors. The Tech Audit, phone, text, email, navigation, and service worker still work.
- The footer and Privacy page reopen the same choice at any time.
- RUM sends coarse route/browser/device/network buckets, Core Web Vitals, and sanitized error summaries. It does not send form values, URLs with query strings, stack traces, email addresses, phone numbers, or names.

## Canonical funnel

Build one GA4 Exploration funnel using **active users** and these ordered events:

1. `page_view` — awareness
2. `website_plan_intent`, `tech_audit_intent`, or `tech_audit_started` — consideration
3. `intake_step_1` — issue selected
4. `intake_step_2` — urgency selected
5. `tech_audit_submit` — native form handoff started
6. `lead_success` — Netlify returned the visitor to `/thanks/`

Every tracked event carries `funnel_stage`. Break the funnel down by:

- `page_path`
- `placement`
- `intent` (`website` or `general`)
- device category
- default channel group / source / medium

Use `lead_success` as the primary website conversion. Do not add `form_submit` and `tech_audit_submit` together; they describe the same browser submit. Phone, text, and email are separate contact conversions (`phone_click`, `sms_click`, `email_click`).

## Reliability view

Create a second GA4 Exploration filtered to:

- `web_vital`: rows = `metric_name`; columns = `metric_rating`; breakdown = `page_path`, `browser`, `device`, `connection`.
- `client_error`: rows = `error_type`, `error_message`, `file_name`; breakdown = `page_path`, `browser`, `device`.

Core Web Vital values are integers. CLS is multiplied by 1,000 before transport (for example, `90` means `0.09`). Treat a new error signature, a poor LCP/INP cluster, or repeated Safari resource errors as a release investigation.

## Monthly lead-loop proof

Run this once per month and after any form or deploy change:

1. Open production in a clean browser context.
2. Submit `tech-audit-scratch` with a unique marker formatted `LFNYC E2E YYYY-MM-DD HHMM` and clearly label the business/message as a delivery test.
3. Confirm the browser reaches `/thanks/` and the confirmation handoff renders.
4. Confirm the matching submission exists in Netlify Forms with the intended fields.
5. Confirm the notification reaches the configured Little Fight inbox. Record the received time and compare it with the submit time.
6. Do not send passwords, client data, or a real prospect's contact information in the test.

The browser success page proves only the POST path. The loop is not green until both Netlify capture and inbox delivery are observed.

## Release check

For a production release, verify:

- no analytics vendor request before a choice;
- `Essential only` keeps vendor requests at zero after navigation and contact clicks;
- `Allow analytics` loads only the configured vendors and persists after reload;
- changing back to `Essential only` sends vendor consent revocation and prevents new app events;
- a pending service-worker update never reloads the page until `Refresh now` is pressed.

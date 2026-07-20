# Little Fight NYC Conversion Measurement

Last updated: 2026-07-20

## Privacy boundary

- Analytics is denied by default.
- Google Analytics, Microsoft Clarity, TikTok, lead attribution, and real-user monitoring start only after `Allow analytics`.
- `Essential only` loads none of those vendors. The Tech Audit, phone, text, email, navigation, and service worker still work.
- The footer and Privacy page reopen the same choice at any time.
- RUM sends coarse route/browser/device/network buckets, Core Web Vitals, and sanitized error summaries. It does not send form values, URLs with query strings, stack traces, email addresses, phone numbers, or names.

## Canonical funnel

Build one GA4 Exploration funnel using **active users**. The general Tech Audit path uses these ordered events:

1. `page_view` — awareness
2. `website_plan_intent`, `tech_audit_intent`, or `tech_audit_started` — consideration
3. `intake_step_1` — issue selected
4. `intake_step_2` — urgency selected
5. `tech_audit_submit` — native form handoff started
6. `lead_success` — Netlify returned the visitor to `/thanks/`

The high-intent website path is deliberately shorter:

1. `page_view`
2. `website_plan_intent`
3. `tech_audit_submit`
4. `lead_success`

Do not treat the missing `intake_step_1` and `intake_step_2` events as abandonment when `intent=website`. That route now opens directly on the website brief.

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

## Acquisition experiment queue

This is a low-volume local-services funnel. Run one meaningful change at a time, keep it live for at least 28 days, and report raw counts beside rates. Do not declare a winner from a handful of consented sessions.

| State | Change | Hypothesis | Primary read | Guardrail |
| --- | --- | --- | --- | --- |
| Live 2026-07-20 | Shipped proof directly after the homepage hero | Visitors who see real work before the agency story are more likely to start a website plan | `website_plan_intent` and `lead_success` from `page_path=/` | Mobile LCP, case-study exits, phone clicks |
| Live 2026-07-20 | Website intent opens directly on the contact brief | Removing two setup steps will increase completed website inquiries | `lead_success` with `intent=website` | Validation errors, form delivery, urgent calls |
| Live 2026-07-20 | Real client screenshot and fit terms on the website service page | Concrete proof and clear fit will reduce uncertainty before inquiry | `website_plan_intent` with `placement=website_service_proof` | Service-page engagement and exits |
| Live 2026-07-20 | Named founder accountability beside the website CTA | A visible accountable owner may increase trust for first-time buyers | `lead_success` and phone clicks | About-page visits, contact quality |
| Next | Test `Plan my website` against one shorter benefit-led label | A clearer outcome may improve CTA starts | `website_plan_intent` by placement | CTA wrapping, accidental clicks, lead quality |

Record the release date, production commit, observation window, raw event counts, and decision. Keep a losing result; it prevents the same idea from being recycled later.

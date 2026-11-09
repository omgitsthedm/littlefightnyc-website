# Little Fight NYC Conversion Measurement

Last updated: 2026-09-06 (local candidate; production publication unverified)

## Privacy boundary

- Analytics is denied by default.
- Google Analytics and real-user monitoring start only after `Allow visit counting`.
- Microsoft Clarity and TikTok are not configured or active. Advertising consent and advertising vendors stay off.
- `Essential only` loads none of those vendors. The Tech Audit, phone, text, email, navigation, and service worker still work.
- The footer and Privacy page reopen the same choice at any time.
- RUM sends coarse route/browser/device/network buckets, Core Web Vitals, and sanitized error summaries. It does not send form values, URLs with query strings, stack traces, email addresses, phone numbers, or names.
- Vendor scripts load only on `littlefightnyc.com` or `www.littlefightnyc.com`. Local, branch, and deploy-preview builds can exercise the event contract without sending to the production properties.
- The standalone Audit Lab uses the same consent choice. Its funnel events never include the submitted website, email address, audit ID, report URL, or provider error text.
- Automatic GA4 outbound-click collection is off. The site records a bounded
  `external_link_click` with destination domain and path only, so external URL
  query strings do not enter the property.

## Canonical funnel

The human first-look form now opens directly for every intent: website,
support, consulting, systems and general. Owners without a website use the
same form; the dedicated no-site arrival carries `intent=website` and
`source=no_website_check`. Do not classify that arrival as an existing website.

Use this common funnel, with **active users** beside raw event counts:

1. `page_view` on `/tech-audit/` — the inquiry page was viewed.
2. `tech_audit_started` — a field received non-empty input, or a valid submission began.
3. `tech_audit_submit` — validation allowed the native POST to begin.
4. `generate_lead` with `method=tech_audit_form` — `/thanks/` rendered with a submission marker.

`first_look_opened`, `website_plan_intent`, `human_review_requested`,
`service_inquiry` and the legacy `tech_audit_intent` describe entry actions.
Keep them as an optional entry breakdown; a direct or shared-link arrival need
not emit a preceding CTA click. Do not require `intake_step_1` or
`intake_step_2` for any intent. Their legacy handlers remain in source, but
the current form starts at step 3.

The success-page marker is browser evidence, not a provider receipt. It can
come from the redirect query or tab storage and is removed after tracking to
avoid ordinary reload duplicates. A direct unmarked visit does not emit
`generate_lead`, but a manually supplied marker or stale submission state can
produce the browser signal. Neither the marker nor the success-page text
proves inbox delivery, an available buyer, an accepted scope or payment.

Every tracked event carries `funnel_stage`. Break the funnel down by:

- `page_path`
- `placement`
- `intent` where emitted (`website`, `support`, `consulting`, `systems` or `general`)
- device category
- default channel group / source / medium

Use `generate_lead` as the **only configured GA4 key event**, retaining the
browser-evidence limitation above. This is the intended configuration; local
source does not prove the current GA4 account settings. The Tech Audit form
does not also emit generic `form_submit`. Its submit event carries
`form_name` and `page_path`, but not `intent` or `placement`; do not assume
every event has every breakdown dimension. `tech_audit_started` and the
thanks-page event carry the resolved intent.

Phone, text and email events (`phone_click`, `sms_click`, `email_click`) remain
observation events until a call or reply is reconciled outside GA4. Those
events include `placement` and `page_path`. `booking_started` measures
scheduling intent only; it does not prove that a meeting was booked or held.

The public site loads the owned GA4 stream directly after consent with `send_page_view: false`; React Router sends the one canonical page view for the initial route and each later route. The direct transport is intentional: the prior GTM container delivered page views but had no allowlisted custom-event mapping, so conversion events stopped in the data layer. Advertising signals and ad personalization stay disabled.

The standalone Audit Lab has a separate diagnostic funnel:

1. `page_view` — consented visit to `/examples/audit/`
2. `audit_scan_started` — valid URL and email passed client validation
3. `audit_scan_accepted` — the audit service returned a successful response and an audit ID
4. `generate_lead` — the request endpoint accepted the audit job
5. `audit_report_ready` — status polling confirmed the report is ready

The Audit Lab emits `generate_lead` once when the request endpoint accepts
the job. For an unauthenticated public production request, the endpoint first
writes a durable follow-up ingress receipt; non-production and programmatic
flows do not establish that private record. Acceptance does not prove later
report generation, reconciliation or email delivery. It is the same key-event name, not
another key-event definition. Separate Audit Lab and human inquiries by
`page_path`, method and available placement before comparing them.

`website_check_started` occurs at both the `/website-check/` handoff and the
Lab's actual request start; those are two stages, not necessarily two owners
or reports. `website_check_ready` accompanies the Lab's ready status, and
`report_opened` measures the report-opening action. Neither event proves a
human has reviewed the business or that email arrived. No-site human
inquiries must not be required to produce any automated-check events.

The local candidate now handles a ready report whose email copy could not
be sent: final public status includes only `email_delivery=unavailable`, and
the Lab presents an Open report link and human contact option. This is still
a generated report, so `audit_report_ready` and `website_check_ready` remain
valid. The email state and private provider details do not enter analytics.
An omitted email state retains the existing redirect for sent and older
reports; omission is not proof of inbox receipt.

All these browser observations depend on consent and working JavaScript.
Consent-denied and native no-JavaScript inquiries can be received without
appearing in GA4. Report observed counts and the known coverage limit; do not
extrapolate a total inquiry count or close rate from consented traffic alone.

Use `audit_scan_failed` with `failure_category` (`rejected`, `rate_limit`, `provider`, `network`, or `timeout`) to diagnose loss. It is not a conversion.

## Private Dakota commercial truth

Dakota keeps the v3 sales record separate from browser analytics. Verified Tech Audit form submissions and public Website Audit requests may enter Dakota as consented inbound records. Names, verified contacts, `selectedContactId`, drafts, tasks, activity notes, proposal references, invoice references, and money values remain in the private `dakota.operator-state.v3` store and must never enter GA4 events.

The durable task ledger is the canonical source for next action and due time. Creating, opening, copying, completing, or skipping a task is operational work, not a conversion. The commercial path remains research ready, pursuit ready, pursuing, replied, meeting, proposal, won, then paid. A `paid` record remains operational until its onboarding next action is handled.

Every newly recorded non-note activity must reference the durable task and exact selected contact route that produced it. Legacy unlinked history remains visible but cannot prove a newly advanced stage. Proposal, signature, invoice, and payment changes each require newly appended matching evidence; cash cannot be reduced or silently rewritten in place.

Gmail, Google Voice, Calendar, and booking-link actions are manual handoffs. Opening a compose window, opening Voice or Calendar, copying a draft, copying a value brief, or copying or opening the booking link does not count as outreach, a booked meeting, or a conversion.

Each handoff stays tied to the exact persisted selected contact route. Voice never automates a call or message, and Calendar never creates an event or invitation. SMS is eligible only through a schema-valid SMS route classified `explicit_inquiry` or `existing_relationship`. A public business email remains research evidence, while a qualified public phone may support only a deliberate manual phone task and never text consent.

Stored drafts remain URL-free. Dakota adds the verified booking link only to an approved outbound email body for Gmail or manual copy.

A proposal amount is not revenue, a signature is not payment, and an invoice is not cleared cash. Record `amountPaid` and the paid milestone only after the operator verifies cleared funds. Paid status also requires invoice evidence, a zero balance, an onboarding next action, and an open operational task.

Report raw weekly counts beside rates: reviewed, approved, contacted, replied, meetings held, proposals sent, signed clients, amount due, amount paid, and remaining balance. Break results down by inbound versus public research, source, business category, and offer. Never infer intent, contact, a meeting, a sale, or revenue from a queue score, page view, link click, task change, draft copy, or opened handoff.

## Reliability view

Create a second GA4 Exploration filtered to:

- `web_vital`: rows = `metric_name`; columns = `metric_rating`; breakdown = `page_path`, `browser`, `device`, `connection`.
- `client_error`: rows = `failure_category`; breakdown = `page_path`, `browser`, `device`, `connection`. Browser error text, filenames, stack traces, and URLs remain local.

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
- `Allow visit counting` loads only the configured measurement vendor and persists after reload;
- changing back to `Essential only` sends vendor consent revocation and prevents new app events;
- a pending service-worker update never reloads the page until `Refresh now` is pressed.

## Acquisition experiment queue

This is a low-volume local-services funnel. Run one meaningful change at a time, keep it live for at least 28 days, and report raw counts beside rates. Do not declare a winner from a handful of consented sessions.

| State | Change | Hypothesis | Primary read | Guardrail |
| --- | --- | --- | --- | --- |
| Live 2026-07-20 | Shipped proof directly after the homepage hero | Visitors who see real work before the agency story are more likely to start a website plan | `website_plan_intent` and `generate_lead` from `page_path=/` | Mobile LCP, case-study exits, phone clicks |
| Live 2026-07-20 | Website intent opens directly on the contact brief | Removing two setup steps will increase completed website inquiries | `generate_lead` with `intent=website` | Validation errors, form delivery, urgent calls |
| Live 2026-07-20 | Real client screenshot and fit terms on the website service page | Concrete proof and clear fit will reduce uncertainty before inquiry | `website_plan_intent` with `placement=website_service_proof` | Service-page engagement and exits |
| Live 2026-07-20 | Named founder accountability beside the website CTA | A visible accountable owner may increase trust for first-time buyers | `generate_lead` and phone clicks | About-page visits, contact quality |
| Next | Test `Plan my website` against one shorter benefit-led label | A clearer outcome may improve CTA starts | `website_plan_intent` by placement | CTA wrapping, accidental clicks, lead quality |

Record the release date, production commit, observation window, raw event counts, and decision. Keep a losing result; it prevents the same idea from being recycled later.

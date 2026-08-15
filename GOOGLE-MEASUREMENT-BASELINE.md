# Little Fight NYC Google measurement baseline

Last verified: 2026-08-14

This is the non-secret account and release contract for Little Fight’s public
marketing measurement. It records what is connected, what counts, and what
must stay off until there is a real advertising program.

## Owned surfaces

| Surface | Verified state |
| --- | --- |
| Google Analytics account | `Little Fight NYC` — account `384652620` |
| GA4 property | `Little Fight NYC` — property `524790284` |
| Web stream | `https://littlefightnyc.com` — stream `13610127545` |
| Measurement ID | `G-0Q1TGWH0HL` |
| Search Console | Domain property `sc-domain:littlefightnyc.com` |
| Business Profile | `Little Fight NYC`, owned by the Little Fight Workspace account |
| Google Ads | Not linked; no Ads tag, campaign, billing, or spend |

GA4 reports that the web stream is receiving traffic. Search Console and the
Business Profile were linked to the GA4 property on 2026-08-02. The Business
Profile hides the street address and uses NYC service areas.

## Measurement contract

- Google Analytics is **Basic Consent Mode**: denied by default and the Google
  tag does not load until the visitor chooses `Allow visit counting`.
- Choosing `Essential only` sets Google’s property-level disable switch before
  cleanup, so a tag loaded earlier cannot send later cookieless pings.
- Advertising storage, advertising user data, advertising personalization,
  Google Signals, and ad-personalization signals stay denied/off.
- The site loads the owned GA4 stream directly after consent. The previous GTM
  container delivered page views but did not forward the site’s allowlisted
  custom events.
- React Router sends the initial and later SPA page views; Google tag config
  uses `send_page_view: false` to prevent a duplicate first view.
- `generate_lead` is the only lead key event. The main site sends it after a
  successful native Tech Audit handoff reaches `/thanks/`; the separate Audit
  Lab sends it once when the server accepts both the audit job and follow-up
  record.
- `tech_audit_submit` is a funnel step, not a second lead. Phone, text, email,
  booking starts, form starts, Website Check actions, and content engagement
  remain observation events.
- Form values, names, email addresses, phone numbers, messages, submitted
  websites, audit IDs, report URLs, and provider error text must never enter
  GA4. Page locations keep only the exact approved Google Business Profile UTM
  values and drop every other query field. Paid-click IDs are not copied into
  custom events; if Ads is later approved, Google may use its own IDs for
  acquisition attribution.
- Event names and parameters are allowlisted in the application. Browser error
  messages and filenames stay local; GA4 receives only a bounded failure
  category.

The event-scoped reporting fields registered on 2026-08-14 are:

- `funnel_stage`
- `placement`
- `entry_source`
- `intent`
- `service`
- `contact_channel`
- `form_name`
- `failure_category`
- `link_domain`
- `entry_point`
- `response_status`
- `metric_name`
- `metric_rating`
- `selection`
- `skipped`

The event-scoped `metric_value` custom metric makes the integer Web Vital value
reportable; CLS is multiplied by 1,000 before transport so no mixed decimal
convention is hidden in a dashboard.

GA4 event and user-data retention are both 14 months. The internal-traffic
filter remains in **Testing**, not Active, until a stable rule is proven.
Automatic GA4 form interactions and browser-history page views are off because
the site owns safer success-aware form and route-view contracts. Scrolls,
video engagement, and file downloads remain available. Automatic outbound
clicks are off; the site sends its own bounded `external_link_click` with only
the destination domain and path, never its query string. GA4 also redacts
sensitive URL keys such as `url`, `text`, `title`, `report`,
`email`, `contact`, and `message` before collection while leaving standard
campaign attribution keys intact.

## Search and local acquisition

- `https://littlefightnyc.com/sitemap-index.xml` is the canonical submitted
  sitemap index. It was resubmitted successfully on 2026-08-14.
- The homepage was inspected on 2026-08-14 and Search Console reported it as
  indexed, HTTPS, with one valid breadcrumb item.
- The Business Profile website link is live as
  `https://littlefightnyc.com/?utm_source=google&utm_medium=organic&utm_campaign=business_profile`.
- The Profile's Little Fight booking link is canonical and separately
  attributable as
  `https://littlefightnyc.com/tech-audit/?utm_source=google&utm_medium=organic&utm_campaign=business_profile&utm_content=booking`.
- Business Profile services were expanded on 2026-08-14 with website design,
  website repair, small-business IT support, business systems setup,
  technology consulting, and website care and maintenance.
- The Business Profile description was replaced with owner-first, policy-safe
  service and coverage copy on 2026-08-14; Google marked the edit pending its
  normal review.
- A storefront photo is intentionally not supplied for a service-area
  business with no customer-facing storefront. Never add a private address or
  stock photo merely to increase Profile Strength.
- Search Console reports no manual actions and no security issues. Its three
  historical 404 examples include two URLs that already redirect and the
  retired `/services-7` path, which is now covered by a permanent redirect.

## Release and monthly proof

For every measurement release:

1. Prove no Google request occurs before a visitor choice.
2. Prove `Essential only` remains vendor-free.
3. Prove consent loads only `G-0Q1TGWH0HL` and sends one page view.
4. Prove a bounded CTA event reaches GA4, not merely `dataLayer`.
5. With explicit approval to submit synthetic data, prove a successful Tech
   Audit test reaches Netlify, the staffed inbox, `/thanks/`, and one
   `generate_lead` event. Test the Audit Lab acceptance path separately.
6. Recheck Search Console sitemap status and material changed URLs.
7. Record Business Profile website clicks, calls, messages, and search terms
   separately from GA4 sessions.

Do not connect Ads, import a key event, enable remarketing, add enhanced
conversions, create a campaign, or add billing until there is an owned Ads
account, an approved budget, and an explicit advertising measurement plan.

Official references:

- [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent)
- [GA4 key events](https://support.google.com/analytics/answer/13128484)
- [Link Search Console and GA4](https://support.google.com/analytics/answer/10737381)
- [Search Console sitemaps](https://support.google.com/webmasters/answer/7451001)
- [Business Profile representation rules](https://support.google.com/business/answer/3038177)
- [Business Profile service areas](https://support.google.com/business/answer/9157481)
- [Business Profile performance](https://support.google.com/business/answer/9918094)

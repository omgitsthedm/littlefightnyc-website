# Little Fight NYC Search Acquisition Runbook

Last updated: 2026-08-14

## Current code readiness

The production build generates:

- canonical URLs, indexable robots meta, and page-specific structured data;
- `sitemap.xml`, `image-sitemap.xml`, and `sitemap-index.xml`;
- honest per-page `lastmod` values where authored dates exist;
- `robots.txt` with all three sitemap locations;
- one-hour revalidation headers for robots and sitemap files.

Validate these on the exact production deploy before touching Google accounts.

## Search Console release pass

Ownership is already verified through the `sc-domain:littlefightnyc.com` DNS
property under the Little Fight Workspace account as of 2026-08-01. Do not add
an HTML verification tag unless Google explicitly invalidates that domain
verification.

Google says a sitemap helps discovery but does not guarantee crawling or indexing. It also says URL Inspection is the path for requesting a recrawl of a small number of URLs. Repeated requests do not make crawling faster.

Official references:

- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Search Console basics and URL Inspection](https://developers.google.com/search/docs/monitor-debug/search-console-start)

After the production deploy:

1. Confirm owner access to `sc-domain:littlefightnyc.com`.
2. Confirm the Search Console domain property remains linked to GA4 stream
   `13610127545`.
3. Open the Sitemaps report and confirm
   `https://littlefightnyc.com/sitemap-index.xml` succeeds. It was resubmitted
   on 2026-08-14; do not resubmit repeatedly while processing is healthy.
4. Use URL Inspection and test the live URL for these priority pages. Request
   indexing only for the first four acquisition routes when their live test is
   correct:
   - `https://littlefightnyc.com/`
   - `https://littlefightnyc.com/services/custom-local-websites/`
   - `https://littlefightnyc.com/tech-audit/` (the website-intent query is a conversion state, not a separate canonical page)
   - `https://littlefightnyc.com/case-studies/hair-by-rachel-charles/`
   - `https://littlefightnyc.com/case-studies/public-house-creative/`
   - `https://littlefightnyc.com/case-studies/venuecircuit/`
5. Treat Public House Creative and VenueCircuit as protected verification-only
   routes: inspect their current indexed/live state, but do not request a new
   crawl or change their presentation without separate approval.
6. Check the rendered HTML in URL Inspection for the current title, description, canonical, proof copy, and website form.
7. Record the request date and the indexed canonical. Do not request the same URLs repeatedly.
8. Check the branded result weekly until the stale homepage title and snippet are replaced. Search results remain an external, asynchronous system.

## Business Profile pass

Google reviews profile edits before they appear. Keep every field consistent with the website and do not use categories as keywords.

Official references:

- [Edit a Business Profile](https://support.google.com/business/answer/3039617?hl=en)
- [Manage Business Profile photos and videos](https://support.google.com/business/answer/6103862?hl=en)
- [Manage customer reviews](https://support.google.com/business/answer/3474050?hl=en)
- [Create and manage Business Profile posts](https://support.google.com/business/answer/7342169?hl=en)
- [Business Profile representation guidelines](https://support.google.com/business/answer/3038177?hl=en)

In the verified profile:

1. Confirm the public name is exactly `Little Fight NYC`.
2. Confirm the website is
   `https://littlefightnyc.com/?utm_source=google&utm_medium=organic&utm_campaign=business_profile`
   and the phone is `(646) 360-0318`.
3. Confirm hours match the website response window, or label the difference clearly if public service hours are different.
4. Choose the most specific available primary category for the main website offer. Add only secondary categories that match services actually delivered.
5. Keep services in owner language: website design, website repair, small-business
   IT support, business systems setup, technology consulting, software the
   business owns, and website care.
6. Add current founder/team, work, and service-context photos. Do not use stock imagery as proof of the business.
7. Publish one useful update per month: a shipped case study, an owner guide, or a service change.
8. Ask real clients for reviews without incentives. Reply to every review with specific, private-data-safe language.
9. Check profile performance monthly: website clicks, calls, direction requests if applicable, and the search terms report. Record raw counts and date ranges.

## Monthly acquisition review

Report four groups separately:

- Search Console: branded clicks, non-branded clicks, impressions, CTR, average position, and indexed priority pages.
- Business Profile: website clicks, calls, messages if enabled, and direction requests if applicable.
- Website: website-plan starts, Tech Audit submits, `generate_lead`, phone clicks, and case-study visits.
- Proof pipeline: approved quotes, verified outcome metrics, pending approvals, and claims retired because their source is weak.

Never combine impressions, clicks, form starts, and qualified leads into one percentage. Keep the whole path visible.

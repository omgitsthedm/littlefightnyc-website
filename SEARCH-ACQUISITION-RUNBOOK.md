# Little Fight NYC Search Acquisition Runbook

Last updated: 2026-08-25

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

## Weekly content cadence (routine-driven)

A scheduled cloud routine ("LFNYC weekly search cadence", Tuesdays 09:17 ET)
clones this repo, does ONE unit of work, and opens a pull request. It never
pushes to `main`. A human (or a Claude Code session) merges after the release
gate passes.

Each run:

1. Takes the first `pending` row below, writes the page it names in the house
   voice (VOICE.md, COPY-CONTRACT.md, EVIDENCE-CLAIM-LEDGER.md; no prices;
   answer first, then 2–3 pillars, proof last; sources cited), registers it
   everywhere the neighbours are registered (`site-answers.ts` guide +
   OWNER_QUESTIONS + UPDATED_OVERRIDES + bridge; `answersArt.ts` cluster;
   `seo-pages.json` entry; audit pins in `audit-visual-coverage.mjs`,
   `audit-copy-contract.mjs`, `audit-release-readiness.mjs`,
   `tests/quality-smoke.spec.ts` indexed-route count), and marks the row `done`
   with the date and path.
2. Refreshes ONE ranking page (rotate through the list below): a genuine content
   touch — a sharper FAQ answer, an updated fact, a tighter dek — then bumps
   that page's `updated` date. Never bump a date without a real change.
3. Runs `npm ci` and `npm run quality:fast` in `app/` (Playwright browsers may
   not exist in the cloud environment; if `quality:release` is possible, run
   it), commits generated `route-meta.json` / `nav-index.json`, and opens a PR
   titled `cadence: <query>` whose body pastes the gate summary and lists the
   files touched.

Sourcing rule, learned on the 2026-08-25 run: "sources cited" is not satisfied
by a help-centre root. Cite the exact page that carries the claim, and label it
with the date it was checked — `Instagram Terms of Use — checked Aug. 25, 2026`,
not `Instagram Help Center`. Then write the claim so it tracks what that page
actually says. "The company running it decides what shows and who sees it" was
an unsourced assertion about a named company; "Instagram's terms say it may
suspend or end access to the service" is the same warning, and a reader can
check it in one click. If the sandbox cannot reach the source to confirm the
page says what the copy claims, say so in the PR body rather than citing it.

Recrawl requests (Search Console → URL Inspection → Request indexing) are a
local, signed-in-Chrome job and are NOT part of the routine: about 10 URLs a
day per property; work through the "Discovered – currently not indexed" list,
service pages first.

### Query queue

| status | query (intent) | page |
| --- | --- | --- |
| done 2026-08-18 | website design for small business nyc | /answers/website-design-for-small-business-nyc/ |
| done 2026-08-18 | it consultants for small business nyc | /answers/it-consultants-for-small-business-nyc/ |
| done 2026-08-18 | computer security for small business ny | /answers/computer-security-for-small-business-ny/ |
| done 2026-08-18 | web design upper east side / soho / lower east side / east village | "Website design in {area}" blocks on those area pages |
| done 2026-08-19 | web designer lenox hill | /areas/upper-east-side/ — Lenox Hill named in the web-design block, plus a "Do you build websites for Lenox Hill businesses?" FAQ |
| done 2026-08-25 | do i need a website if i have instagram (nyc shop) | /answers/instagram-instead-of-a-website-nyc-shop/ |
| pending | wordpress vs custom website small business | /answers/wordpress-vs-custom-website-small-business/ |
| pending | how much does a small business website cost nyc (no prices: what drives cost, how to compare quotes) | /answers/what-drives-the-cost-of-a-small-business-website-nyc/ |
| pending | website redesign checklist small business | /answers/website-redesign-checklist-small-business/ |
| pending | managed it services vs break fix small business | /answers/managed-it-vs-break-fix-small-business/ |
| pending | google business profile photos tips (nyc storefront) | journal post |
| pending | small business wifi keeps dropping (shop / restaurant) | /answers/small-business-wifi-keeps-dropping/ |
| pending | it support brooklyn small business | /answers/it-support-brooklyn-small-business/ |
| pending | web design brooklyn small business | /answers/web-design-brooklyn-small-business/ |

### Refresh rotation (pages that already earn impressions)

`/`, `/services/`, `/services/custom-local-websites/`, `/services/it-support/`,
`/areas/upper-east-side/`, `/areas/soho/`, `/nationwide/`, `/website-check/`,
`/journal/cybersecurity-for-small-business/`, `/about/`.
Rotate in that order; record the last refreshed page and date here:

- last refreshed: `/services/` 2026-08-25 (hero dek now names the 9am–9pm Eastern
  response window the first screen was missing, replacing "No tech words needed";
  the quick answer moved from "We build…" to "You get…"; `updated` bumped with it)
- previously: `/` 2026-08-19 (home quick answer rewritten in owner voice so it
  names the same three things the first screen does; `updated` bumped with it)

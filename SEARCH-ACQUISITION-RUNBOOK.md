# Little Fight NYC Search Acquisition Runbook

Last updated: 2026-10-20

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
4. Use URL Inspection and test the live URL for materially changed canonical
   pages. Request indexing once when the live test is correct:
   - `https://littlefightnyc.com/`
   - `https://littlefightnyc.com/services/custom-local-websites/`
   - `https://littlefightnyc.com/tech-audit/` (the website-intent query is a conversion state, not a separate canonical page)
   - `https://littlefightnyc.com/case-studies/hair-by-rachel-charles/`
5. Public House Creative is protected and outside this work. Do not inspect,
   change or reactivate its source. Do not change owned-product case presentation
   without scoped authorization.
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

## Current acquisition focus — 2026-10-05

Prioritize three existing buyer paths with actual published work:

1. Appointment businesses: Hair By Rachel and The Tarot Hotline; service choice
   and booking paths. Booking actions are not confirmed appointments or revenue.
2. Visual home-service trades: Chromatic Painting & Design; real project imagery,
   service detail and a clear inquiry path. Do not imply plumbing or roofing work.
3. Hospitality and venues: Easy Tiger and The Break Room; menus, events,
   directions and visit planning. Do not imply measured footfall increases.

Use the existing industry and case pages. Connect each offer to relevant real
work and the contextual website inquiry. Do not create pages for every query
variation or publish the reported client-acquisition anecdote without a sourced
result and permission. The existing private proof process is
`CLIENT-PROOF-COLLECTION.md`.

The first readout is received inquiries and qualified opportunities per buyer
path, then proposals and won work in the private lead ledger. GA4 contact taps
remain intent only. At an assumed 25% qualified-opportunity close rate, four
projects per week requires 16 qualified opportunities; this is planning math,
not a measured close rate or forecast. Report actual counts before changing it.

Search Console was read live on October 5:

- July 3–October 2 web search: 11 clicks, 909 impressions, 1.2% CTR, average
  position 20.9. The website service page had 48 impressions and no clicks.
- Search generative AI features: 43 impressions in the selected three-month
  report. These are not clicks, inquiries, cross-engine citations or sales.
- Homepage, website service and Hair case URL Inspection records were indexed.
- Sitemap index: Success, last read October 5, 290 discovered pages. Sitemap:
  Success, last read October 2, 143 discovered pages. Counts can overlap and
  do not establish that every discovered page is indexed.

These observations identify weak search-to-visit performance, not a crawl
block. They predate any business-result measurement for the October 5 release.
Keep dated older snapshots below separate from these current observations.

## Monthly acquisition review

Report four groups separately:

- Search Console: branded clicks, non-branded clicks, impressions, CTR, average position, and indexed priority pages.
- Business Profile: website clicks, calls, messages if enabled, and direction requests if applicable.
- Website: website-plan starts, Tech Audit submits, `generate_lead`, phone clicks, and case-study visits.
- Proof pipeline: approved quotes, verified outcome metrics, pending approvals, and claims retired because their source is weak.

Never combine impressions, clicks, form starts, and qualified leads into one percentage. Keep the whole path visible.

## Manual content queue

The former routine description is historical, not an active scheduling
contract. Do not create or enable recurring automations. Use the queue below
only during an explicitly requested content session; pending rows are ideas,
not missing pages promised by this maintenance release. A scheduled firing or
an older routine prompt is not a new explicit request. If one fires, stop
before changing content or opening a PR and report the scheduling conflict.

Each requested content session:

1. Reads current `main` and checks each candidate topic and path against the
   published content, `app/preview-content/consolidation.json`,
   `app/public/_redirects`, and GitHub PRs in **all states**. Search by query,
   intent and route, then read relevant PR descriptions and closing comments.
   An open PR reserves its topic even if this table still says `pending`.
   Resume or consolidate that work; do not create a competing PR. A closed,
   unmerged PR is not permission to restart: honor its closure decision.
2. Selects the first eligible `pending` idea after that check. Prefer improving
   an existing canonical page when it already answers the intent. Record the
   selected path and any predecessor PRs in the working PR. If current PR or
   route evidence is unavailable, leave the topic blocked rather than guess.
   Write in the house voice (VOICE.md, COPY-CONTRACT.md,
   EVIDENCE-CLAIM-LEDGER.md; no prices; answer first, then 2–3 pillars, proof
   last; sources cited).
3. Updates the actual rendered tile sources, following a current neighbouring
   page: `app/preview-content/live-pages.json` and applicable
   `answer-guides.json`, `article-updates.json` or page-body source; answer-hub membership in
   `app/scripts/retained_answers.py`; relevant `article_visuals.py` treatment;
   and `app/preview-content/social-cards.json` with its matching image asset.
   Keep retained data in `app/src/data/site-answers.ts` (guide, owner question,
   update date and service bridge), `answersArt.ts`, `seo-pages.json`, and
   `site.ts` consistent where applicable. Regenerate and review route, nav and
   measurement metadata; do not hand-patch generated entries to hide source
   drift. Updating retained React data alone does not update the tile website.
4. Refreshes ONE eligible page from the rotation with a genuine content change,
   checking existing PRs and redirects first. Update the rendered source and
   authored date together. Never bump a date without a real change or repeat
   a refresh already awaiting integration.
5. Installs dependencies at both root and `app/` and runs the root quality lanes
   under Node 24, as required by `AGENTS.md`. Run `quality:fast` during work and
   `quality:release` on the exact production candidate; a blocked browser or
   other required gate leaves the release blocked, not validated. Reconcile
   audit counts with actual generated routes and explicit consolidation policy,
   including `audit-tile-content.py`, `retained_answers.py`, release readiness,
   copy/visual coverage and browser assertions. Do not blindly add one to stale
   counts or lower them merely to make a check pass.
6. Opens or updates one PR titled `cadence: <query>` with the canonical path,
   predecessor decisions, scoped diff and gate results. After safe integration
   into `main` and exact-deploy verification, reconcile this queue and refresh
   rotation. Close superseded PRs only after useful work is retained; keep their
   branches and history. Record consolidation/closure decisions here so the
   next session does not need to rediscover them.

Queue states: `pending` is an unclaimed idea; `in review #N` reserves work to
an open PR; `blocked #N` names work awaiting a specific gate or decision;
`done DATE` means integrated and verified; `covered DATE` means an existing,
verified canonical page satisfies the intent, with its path and decision link.
A `done` edit on an unmerged branch is only a proposal. Main plus current PR
state controls selection; preserve historical dates and map retired paths to
their current canonical destination rather than reopening completed topics.

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
signed-in browser task. Follow the quota actually shown by Google; do not
assume a fixed daily allowance or repeat a queued request.

### Verified search state — 2026-09-29

- Google sitemap index and `sitemap.xml`: Success; no manual actions or security issues. Search generative AI: Include.
- Google's authenticated Generative AI features report is available (Beta). It showed 42 total impressions for June 28–September 27, with the homepage, About and owner guides among the listed pages. These are Search generative-feature impressions, not clicks, cross-engine citations, qualified leads or sales.
- The nine refreshed case pages are live, self-canonical, indexable, and present in the sitemap. Google's current indexed results include Hair By Rachel Charles and Chromatic Painting & Design; CC Films, ClearHelp, Logan Loans and Grand Funding LLC were discovered but not indexed; The Break Room, Easy Tiger and The Tarot Hotline were unknown before recrawl requests.
- Bing's five sitemap records had no reported errors or warnings; its main sitemap/index last-crawl date was August 19. URL counts overlap. Rachel's live test was indexable but its indexed record had not been crawled.
- Bing AI Performance showed no citation data for June 29–September 28. This is the selected report's observation, not proof of zero citations on every engine.
- Record accepted indexing requests separately from actual indexing. IndexNow acceptance also establishes a notification, not a crawl or citation. Do not repeat unchanged notifications as a maintenance loop.

### Query queue

| status | query (intent) | page |
| --- | --- | --- |
| done 2026-08-18 | website design for small business nyc | /answers/website-design-for-small-business-nyc/ |
| done 2026-08-18 | it consultants for small business nyc | /answers/it-consultants-for-small-business-nyc/ |
| done 2026-08-18 | computer security for small business ny | /answers/computer-security-for-small-business-ny/ |
| done 2026-08-18 | web design upper east side / soho / lower east side / east village | "Website design in {area}" blocks on those area pages |
| done 2026-08-19 | web designer lenox hill | /areas/upper-east-side/ — Lenox Hill named in the web-design block, plus a "Do you build websites for Lenox Hill businesses?" FAQ |
| done 2026-08-25 | do i need a website if i have instagram (nyc shop) | /answers/instagram-instead-of-a-website-nyc-shop/ |
| covered 2026-10-20 | wordpress vs custom website small business | /journal/wordpress-vs-webflow-vs-custom-nyc/ — [consolidation decision](https://github.com/omgitsthedm/littlefightnyc-website/pull/30#issuecomment-6262750124) |
| pending | how much does a small business website cost nyc (no prices: what drives cost, how to compare quotes) | /answers/what-drives-the-cost-of-a-small-business-website-nyc/ |
| pending | website redesign checklist small business | /answers/website-redesign-checklist-small-business/ |
| pending | managed it services vs break fix small business | /answers/managed-it-vs-break-fix-small-business/ |
| pending | google business profile photos tips (nyc storefront) | journal post |
| pending | small business wifi keeps dropping (shop / restaurant) | /answers/small-business-wifi-keeps-dropping/ |
| pending | it support brooklyn small business | /answers/it-support-brooklyn-small-business/ |
| pending | web design brooklyn small business | /answers/web-design-brooklyn-small-business/ |

WordPress comparison reconciliation, 2026-10-20: the canonical journal guide
is already integrated in `main` at `09d877a15705f2fbaa1a14dbd44ee7237b2de32e`
and verified on the matching ready production deploy. Its rendered comparison
is self-canonical, indexable, and listed once in `sitemap.xml`. PR #30's
October 19 closure deliberately retained this deeper guide. Do not recreate
`/answers/wordpress-vs-custom-website-small-business/` from PR #27, #30 or #31.
The `covered` state records that existing publication, not publication of any
later draft improvements. Preserve useful draft material in the canonical guide
only after its release gates pass. Other pending ideas still need the preflight
above; their position in this table does not prove they need another page.

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

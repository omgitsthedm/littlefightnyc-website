# Route metadata source of truth

The site has two rendering moments that must agree:

1. `prerender-seo.mjs` writes the first HTML response for crawlers, no-JavaScript
   visitors, and the first paint.
2. `RouteMeta.tsx` updates that `<head>` after in-site navigation.

`build-route-meta.mjs` emits the catalog used after client-side navigation.
`prerender-seo.mjs` independently derives the same pages for the first
response. Shared route builders live in `metadata-source.mjs`; authored copy
stays in:

- `src/data/seo-pages.json` for core routes
- `src/data/site.ts` (and its split `site-*.ts` sources) for dynamic route
  copy: Answer Guides, area hubs, case studies, service details, glossary
  terms, and Studio pages
- `src/data/journal.json` for Journal route identity and factual dates
- `src/data/journal-copy.json` for the public Journal title, description, and body
- `src/data/industries.json` for industry routes

The browser catalog contains only fields `RouteMeta.tsx` reads: path, title,
description, image/share details, type, index policy, locale, and dates. Full
H1, short-answer, FAQ, and body copy remain in the authored sources and the
generated route HTML; do not duplicate that unused prose into the entry bundle.

`split-journal.mjs` requires exact slug parity between the two Journal sources,
then derives `journal-index.json` and the split bodies before the route catalog
is built. Do not add Journal posts to a second metadata array or hand-edit the
generated index and body files.

## Dynamic route copy

`enrichAuthoredRoutePages()` in `metadata-source.mjs` runs in both
`build-route-meta.mjs` and `prerender-seo.mjs`. It keeps a dynamic route’s
visible H1, short answer, description, FAQ, dates, and social-image alt tied to
the exact typed record the React page renders. `seo-pages.json` may retain a
truthful curated title and image, but it is not a second copy source for those
dynamic fields.

The four fleet-inventory case records are emitted from `site-cases.ts` only.
They are intentionally `noindex` until a public-safe client proof is approved;
do not add temporary hostnames or duplicate route records to `seo-pages.json`.
Descriptions are capped at 160 characters only at a whole-word boundary.

## Dates

Journal publication and update dates are factual claims. Missing or invalid
values are omitted from visible bylines, meta tags, and schema. Older imported
posts may recover a missing top-level date only from an explicit
`<time itemprop="datePublished">` or `dateModified` in their authored HTML. An
update date must never be relabeled as a publication date.

## 404 and query-selected images

The 404 head and visible heading come from `NOT_FOUND_PAGE` in
`metadata-source.mjs`, which is also emitted into `route-meta.json`.

`/tech-audit/` intentionally has no static case-image preload. Its general and
`?intent=website` modes render different proof images, so one static preload
would waste a download for the other mode.

## Build gate

`npm run build` ends with `audit-metadata-parity.mjs`. It compares every
generated route title, description, and robots directive with
`route-meta.json`; verifies all Journal routes, headings, and authored date
claims; keeps the prerendered primary CTA aligned with the hydrated navigation;
checks the 404; and prevents a query-conflicting Tech Audit preload.

Run the gate by itself after a completed build with:

```sh
npm run audit:metadata
```

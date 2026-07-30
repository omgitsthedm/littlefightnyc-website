# Lighthouse evidence — hairbyrachelcharles.com

Captured 2026-07-30 because the published claim was unverifiable, inconsistent
across three languages, and — measured — false in its strongest form.

## What the site was claiming

Three different things about the same client:

| Where | Claim |
| --- | --- |
| `app/src/pages/TechAudit.tsx:403` (English) | "live in two weeks, with 100 Lighthouse scores" |
| `app/src/pages/Espanol.tsx:64` (Spanish) | "100 en Lighthouse · lista en 2 semanas" |
| `app/src/pages/Zhongwen.tsx:64` (Chinese) | "Lighthouse 四项满分，两周上线" — *perfect scores in all four categories* |

No stored artifact existed for any of them, so none could be defended if a
prospect asked. The Chinese reader was given the strongest version.

## Method

    npx lighthouse https://hairbyrachelcharles.com \
      --only-categories=performance,accessibility,best-practices,seo \
      --form-factor=mobile --screenEmulation.mobile \
      --chrome-flags="--headless --no-sandbox"

    npx lighthouse https://hairbyrachelcharles.com \
      --only-categories=performance,accessibility,best-practices,seo \
      --preset=desktop --chrome-flags="--headless --no-sandbox"

Lighthouse 13.4.1, Chrome headless, from a New York residential connection.
Same version and method as `ccfilms-2026-07-29.md`. Single run per form factor —
Lighthouse varies a point or two between runs, so treat 96 as "mid-90s on
mobile", not a hard floor.

## Result

| Category | Mobile | Desktop |
| --- | --- | --- |
| Performance | **96** | 99 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

Final URL: `https://hairbyrachelcharles.com/`

## What this means for the claim

"100 Lighthouse scores" is false on mobile: performance is 96. The Chinese
"四项满分" (perfect in all four) is the same claim stated more strongly, and is
also false.

What is true, and is a good claim: **three perfect categories and 96 on
performance, on mobile.** Accessibility, best practices and SEO are all 100 —
that is worth saying plainly, and it is defensible because this file exists.

Per the house rule set by the CC Films entry, the published figure is the mobile
one. Desktop scores are the easy half and say little about how a site actually
feels on the phone a client's customers are holding.

## Re-measuring

Re-run both commands above. If performance has moved materially, update the
three copy sites and this file together — `audit-brand-system` fails if a
Lighthouse claim exists in the copy with no artifact alongside it.

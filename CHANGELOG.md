# Changelog

## 2026-10-28 — production `6ae1a142` (merge `662754f2`, PR #35, candidate `9c15ee04`)
- Two new client case studies; the Phoenix market page joins the sitemap.
- Thanks page styling restored (contact options and numbered steps had been unstyled on production).
- 16px text floor and 44px tap targets across the site; Lucide arrow-left replaces the Unicode back arrow.
- Website-audit intake rejects non-web URL schemes and dotless hosts; 16 new handler tests.
- Lead reconciliation keeps the observed source for "Other"/"Prefer not to say" and counts direct-to-proposal or won as qualified.
- `quality:live` passes; its Pool Room check now reads a VideoObject inside `@graph`.

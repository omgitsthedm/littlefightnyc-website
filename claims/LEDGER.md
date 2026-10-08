# Claim ledger — Little Fight NYC website (SEO pass 2026-10-08)

Technical SEO audit: no gaps requiring new claims. Verified in generated `app/dist`:
robots.txt allows AI crawlers incl. GPTBot, ClaudeBot, PerplexityBot, Google-Extended
(all with /app/, /dakota.html, /api/dakota/ disallows); sitemap.xml (145 URLs) +
image sitemap + index; llms.txt; hreflang en-US/es/zh/x-default; speakable schema;
ProfessionalService + Organization JSON-LD with NAP (646) 360-0318 /
hello@littlefightnyc.com, GBP sameAs Maps link, g.page review href in
`app/src/data/contact.ts`. Port list for parent: files in `git status` below
plus this ledger.

| # | New/changed claim | Location | Evidence | Label |
|---|---|---|---|---|
| 1 | UES headline "Local SEO, AI visibility, and better websites." | app/src/data/site-areas.ts (upper-east-side) | Service names match seo-pages.json services (websites, local search); "AI visibility" names existing llms.txt/structured-data practice, hedged in FAQ #4 | supportable interpretation |
| 2 | "Start with a free first look" / "first look is free" | site-areas.ts UES shortAnswer/FAQ, llms.txt (existing) | seo-pages.json carries "first look is free" / "free first look" as the standing offer; Tech Audit page | approved fact |
| 3 | Lenox Hill / Yorkville geographic references | site-areas.ts UES intro/businessLandscape/webDesign | Real UES sub-neighborhoods; Lenox Hill Hospital corridor already named in prior webDesign copy | supportable interpretation |
| 4 | "AI platforms choose their own sources; inclusion cannot be guaranteed" | site-areas.ts UES extraFaq | Recommendation framing with explicit no-guarantee; no outcome promised | supportable interpretation |
| 5 | Measurement via Search Console queries/impressions/clicks + approved call/booking tracking | site-areas.ts UES extraFaq | Describes standard tooling + owner-approved setup; matches CONVERSION-MEASUREMENT.md posture | supportable interpretation |
| 6 | "You get the scope and price before paid work starts" | site-areas.ts UES extraFaq | Process promise consistent with Tech Audit "plain next step, not a pitch" | supportable interpretation |
| 7 | FAQPage schema capped to visibly rendered Q&A (emittableFaqFor) | app/scripts/prerender-seo.mjs | Code-only parity fix; no copy added or removed | no new claim |

Owner decisions: none requested. No ratings, testimonials, prices, or rank promises added.
Gate: root EVIDENCE-CLAIM-LEDGER.md (claim approval) + build audits
(audit-claim-scope, audit-copy-contract, audit-agency-voice) must pass.
Out of scope, observed not authored here: app/scripts/marketing-apis.mjs(.test),
og-business-systems.jpg regen, CONVERSION-MEASUREMENT.md/package.json edits.

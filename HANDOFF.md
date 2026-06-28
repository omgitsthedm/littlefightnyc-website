# Little Fight NYC Website - Claude Code Handoff

Last updated: May 6, 2026

This is the current working handoff for Claude Code. It covers the Little Fight NYC website overhaul, Fit Check intake system, phone intake work, SEO/AEO expansion, case studies, live deploy state, verification results, known concerns, and the next recommended work.

## Current State

Little Fight NYC is now positioned around local business advantage, not generic tech support.

Core promise:

Keep what works. Connect what matters. Replace what drags. Build what fits.

Plain-language brand direction:

Little Fight NYC helps New York small and mid-sized businesses lower software waste, fix broken digital paths, get found locally, improve websites, and build practical systems that make the business easier to run.

Important voice direction:

- Speak to suspicious, busy New York business owners.
- Avoid technical jargon unless it is explained in business terms.
- Lead with dollars, time, trust, help, kindness, local advantage, and practical support.
- Do not make the site feel like a SaaS startup, IT help desk, corporate consultancy, or fake gritty NYC brand.
- Keep the midnight blue premium base and orange animated dot atmosphere.
- Use visuals, wayfinding, short sections, and answer-first copy so non-technical and non-native-English readers can still orient themselves.

## Source, Git, and Deploy

Local repo:

`/Users/davidmarsh/Desktop/LiFi NYC/Brand/Website/littlefightnyc-website`

GitHub:

`https://github.com/omgitsthedm/littlefightnyc-website.git`

Branch:

`main`

Current pushed head:

`cc3165383abec16a8bc3f94070991eedfc37a073`

Latest commit:

`cc31653 Add answer engine and case studies`

Live site:

`https://littlefightnyc.com`

Netlify project:

- Name: `littlefightnyc`
- Site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`
- Current Git-backed production deploy: `69fa8fbd7a69000008ebb1d8`
- Deploy title: `Add answer engine and case studies`
- Production context: `main`

Important: production is synced across local source, GitHub, and Netlify for the tracked site changes through commit `cc31653`.

## Recent Commit Trail

Recent relevant commits:

- `cc31653 Add answer engine and case studies`
- `e3a1699 Thin live audit surface for Ultraship`
- `5e4e199 Record Ultraship verification pass`
- `c8a522b Simplify Little Fight site copy`
- `87009a7 Add NYC SEO and IT support coverage cluster`
- `507de67 Add photo-led homepage visuals`
- `b9bfdb7 Add visual wayfinding to Little Fight site`
- `7a0bf9a Retune Little Fight copy for local business advantage`
- `65cb333 Bust visual stylesheet cache`
- `977027a Polish Little Fight visual system`

## What Changed

### 1. Brand and Positioning

The old center of gravity was concierge tech support.

The new center of gravity is right-sized websites, IT support, local visibility, software cleanup, and practical business systems for New York businesses.

Preserved:

- Midnight blue premium base.
- Little Fight orange.
- Animated orange dot atmosphere.
- Warm local tone.
- "Less friction, not more software."
- "Tell us what feels messy."
- "Disconnected tools" and "tiny friction points."
- "Not a teardown. A sharper refit."

Shifted:

- "Concierge tech support" is no longer the primary identity.
- The main conversion path is `Start Here` / `Fit Check`, not passive contact.
- The brand now speaks to local businesses fighting large-company advantages and monthly software waste.

### 2. Copy Direction

The site copy was thinned and retuned to be simpler, warmer, more direct, and more useful.

Current copy standard:

- Short headlines.
- Fewer abstract service descriptions.
- More "what is broken, what money is leaking, what happens next."
- Stronger local business advantage framing.
- Less jargon.
- More owner-recognition lines.

Examples of the intended style:

- Better tech. Fewer bills. More customers.
- Bring us the messy setup.
- Start here if something is broken, expensive, confusing, or not bringing in business.
- We help you lower waste, fix the path, and keep the tools that actually work.

Avoid regressing into:

- "Digital transformation."
- "Operational optimization."
- "AI-powered synergy."
- Dense technical service menus.
- Unsupported claims.

### 3. Visual System

The visual system was upgraded in multiple passes:

- Midnight blue remains the premium base.
- Orange remains the signature signal.
- Supporting accents are used for scanning: teal, gold, green, rose, sky.
- Photo-led homepage visuals were added.
- Visual wayfinding was added so pages are not just long text blocks.
- Cards, badges, CTAs, icons, comparison surfaces, and route panels were improved.
- CSS cache busting was used after visual changes.

Primary visual/style files:

- `css/brand-tokens.css`
- `css/lifi-overhaul.css`
- `css/lifi-overhaul.min.css`
- `css/lifi-nav-footer.css`
- `css/lifi-core.css`
- `css/lifi-dark-theme.css`
- `css/lifi-motion-polish.css`
- `css/lifi-animations.css`

Do not remove the orange dot atmosphere or midnight blue base unless David explicitly changes the brand direction.

### 4. Site Architecture

The site now has a stronger acquisition architecture:

- `/` - homepage
- `/fit-check/` - main conversion route
- `/business-systems/` - saving money, software cleanup, workflow systems
- `/websites/` - websites for local business
- `/it-support/` - urgent and practical IT support
- `/local-search/` - Google visibility and local SEO/AEO
- `/nyc-websites-it-support/` - combined NYC website and IT support page
- `/software-guides/` - software decision hub
- `/software-cost-calculator/` - cost framing tool
- `/answers/` - answer-first SEO/AEO hub
- `/case-studies/` - anonymized case-study proof page
- `/work/` - work overview
- `/industries/` - industry hub
- `/areas/` - borough/neighborhood pages
- `/pricing/` - pricing/starting point page
- `/contact/` - secondary contact route

The smart-home service path has been retired from public acquisition and redirects to `/business-systems/`.

### 5. Fit Check Web Intake

The Fit Check is the primary lead qualification and conversion system.

Public route:

`/fit-check/`

Frontend:

- `fit-check/index.html`
- `js/fit-check-intake.js`
- `js/fit-check-intake.min.js`

Backend:

- `netlify/functions/fit-check-submit.mts`
- Public endpoint: `/api/fit-check/submit`

Purpose:

- Ask a few pointed questions.
- Classify the issue.
- Route urgent issues faster.
- Capture preferred follow-up.
- Generate useful context for David.
- Avoid turning the experience into a long form.

Important UX/copy decisions:

- Keep the sensitive-info warning short: "Do not share sensitive information here."
- Ask how David should follow up: text, phone, email, or fastest available.
- Do not ask for passwords, keys, recovery codes, payment details, or private credentials.
- Do not give firm quotes.
- Always preserve human review before scope or pricing.

Fit Check backend behavior:

- Deterministic local/server classification exists as a fallback.
- OpenAI classification can be enabled with `OPENAI_API_KEY`.
- Netlify Forms backup exists.
- Supabase storage can be enabled with Supabase env vars.
- Resend email notification can be enabled with Resend env vars.
- Twilio SMS notification can be enabled with Twilio env vars.

Critical bug fix already made:

Explicit user choices like `planned_improvement`, `exploratory`, and `urgent_but_not_emergency` override keyword urgency detection, so words like "booking" do not automatically create emergency routing.

### 6. Fit Check Phone Intake

Phone intake was added as a Twilio Voice webhook.

Backend:

- `netlify/functions/fit-check-voice.mts`
- Public webhook: `/api/fit-check/voice`
- Status callback: `/api/fit-check/voice?step=status`

Twilio voice flow direction:

- Keep it short.
- Be natural.
- Avoid reading a legal memo.
- Do not say "do not share passwords, keys, recovery codes..." in a long list. Use short language.
- Ask about the issue, urgency, one context question, preferred follow-up, and contact.
- Target four or five questions total.

Phone intake routes to:

- Urgent support
- Paid Fit Check / business system review
- Light review / not-fit capture

Current conversion gap:

The call flow captures and routes leads, but it is not yet fully monetized until real payment/deposit and scheduling URLs are configured.

### 7. Phone Notifications and Follow-Up

The system can notify David for every phone call through Twilio SMS if the relevant env vars are configured.

It can also send caller recovery/follow-up SMS links.

Important env names:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_NOTIFY_FROM`
- `TWILIO_NOTIFY_TO`
- `TWILIO_PUBLIC_VOICE_URL`
- `TWILIO_TTS_LANGUAGE`
- `TWILIO_TTS_RATE`
- `TWILIO_TTS_VOICE`
- `TWILIO_ALLOW_SIGNATURE_FALLBACK`
- `FIT_CHECK_BOOKING_URL`
- `FIT_CHECK_PAYMENT_URL`
- `FIT_CHECK_URL`
- `FIT_CHECK_CALLER_SMS_ENABLED`
- `FIT_CHECK_RECOVERY_SMS_ENABLED`
- `FIT_CHECK_URGENT_FORWARD_NUMBER`
- `FIT_CHECK_URGENT_SUPPORT_URL`
- `URGENT_SUPPORT_PAYMENT_URL`
- `FIT_CHECK_TRANSFER_NUMBER`
- `FIT_CHECK_TRANSFER_AFTER_HOURS`
- `FIT_CHECK_BUSINESS_TIMEZONE`

Do not print, commit, or paste actual secret values.

### 8. Twilio Trial Notes

Twilio trial behavior caused trust and UX issues:

- Trial account preamble played before calls.
- Voice sounded slow and computer-like.
- There was an application error during early testing.
- The flow initially felt too long and jargon-heavy.

Actions already taken:

- Shortened the voice flow.
- Added TTS voice/rate/language env controls.
- Made prompts more natural.
- Added status callback handling for abandoned-call recovery.
- Added call notification path.

Concern:

Credentials were shared in chat during testing. They were not committed, and a repository scan found no matching secrets in files, but the Twilio Auth Token and API key/secret should still be rotated after testing.

### 9. Audit Site

There is a separate audit app/site.

Live URLs:

- `https://audit.littlefightnyc.com`
- `https://audits.littlefightnyc.com`

Audit app Netlify project:

- `audits-littlefightnyc`
- Site ID previously used: `6588401d-53d4-42a3-a4f8-89fb3b937446`

Canonical local audit source found during work:

`/Users/davidmarsh/Desktop/LiFi NYC/Brand/Internal/Audits/site/index.html`

The audit app copy was synced to support the new Fit Check positioning:

- Website audit is a feeder into Business System Fit Check.
- It keeps midnight blue/orange styling.
- It links into `https://littlefightnyc.com/fit-check/`.

Concern:

The audit app is separate from this main repo. Before editing or deploying the audit app again, confirm the correct source folder so old audit copy does not overwrite the synced version.

### 10. SEO/AEO Answer Engine

An answer-first SEO/AEO engine was added.

Hub:

`/answers/`

Generated pages:

- `/answers/website-form-not-working-small-business/`
- `/answers/business-not-showing-on-google-maps/`
- `/answers/small-business-website-cost-nyc/`
- `/answers/reduce-monthly-software-costs-small-business/`
- `/answers/square-vs-toast-nyc-restaurant-pos/`
- `/answers/best-booking-software-nyc-salons/`
- `/answers/connect-website-form-to-crm/`
- `/answers/replace-spreadsheet-with-business-dashboard/`
- `/answers/pos-system-keeps-freezing/`
- `/answers/business-email-not-working/`
- `/answers/domain-dns-help-small-business/`
- `/answers/google-business-profile-suspended-nyc/`
- `/answers/local-pharmacy-website-community-support/`
- `/answers/hair-salon-save-money-software/`
- `/answers/restaurant-website-booking-payments/`
- `/answers/service-business-lead-tracking-nyc/`
- `/answers/shopify-vs-squarespace-local-retail/`
- `/answers/webflow-vs-squarespace-small-business/`
- `/answers/when-custom-business-system-beats-saas/`
- `/answers/urgent-it-support-small-business-nyc/`
- `/answers/google-business-profile-help-nyc-small-business/`
- `/answers/website-designer-disappeared-what-now/`
- `/answers/local-seo-for-neighborhood-businesses-nyc/`
- `/answers/small-business-ai-tools-worth-it/`

Generator:

`scripts/generate-aeo-beast-pages.mjs`

The generator also updates:

- Nav/footer links
- `sitemap.xml`
- `llms.txt`
- `netlify.toml` route rewrites
- `work/ai-change-log.txt`

Run after modifying generated answer data:

`npm run generate:aeo`

### 11. Case Studies

New page:

`/case-studies/`

File:

`case-studies/index.html`

Purpose:

Proof without unsupported claims.

Current case-study patterns:

- Neighborhood pharmacy
- Salon and wellness studio
- Restaurant and bar
- Medical and wellness practice
- Creative studio
- Local retail shop

Important proof rule:

Client names stay private until approved. Do not invent metrics. Use operational changes only unless David provides real evidence.

### 12. IndexNow

IndexNow support was added.

Files:

- `scripts/submit-indexnow.mjs`
- `indexnow-key.txt`
- `7d0370e4dfc84b29a119bc73cd4635c8.txt`

NPM script:

`npm run indexnow`

Last successful submission:

`Submitted 84 URL(s) to IndexNow.`

The IndexNow key is public verification material, not a private secret.

### 13. Sitemap, LLMS, Schema, Routes

Updated:

- `sitemap.xml`
- `llms.txt`
- `netlify.toml`

Structured data is currently strong:

- Organization
- LocalBusiness
- WebPage
- Article
- FAQPage
- BreadcrumbList
- ItemList / CreativeWork for case studies

Important fix already made:

The generated Article schema originally failed Squirrel because publisher was only referenced by `@id`. It now includes direct `@type`, `name`, `url`, and `logo`.

## Verification Results

Latest live Netlify Lighthouse plugin for `/` on deploy `69fa8fbd7a69000008ebb1d8`:

- Performance: 99
- Accessibility: 98
- Best Practices: 100
- SEO: 100
- PWA: 30

Latest Squirrel live crawl:

- Crawled: 85 pages
- Overall: 92
- Grade: A
- Passed: 8992
- Warnings: 253
- Failed: 0

Squirrel category scores:

- Performance: 90
- Crawlability: 99
- Accessibility: 100
- Security: 93
- Content: 100
- E-E-A-T: 84
- Core SEO: 100
- Internationalization: 100
- Images: 100
- Legal Compliance: 100
- Links: 100
- Local SEO: 100
- Mobile: 100
- Structured Data: 100
- Social Media: 100
- URL Structure: 100

Live route checks confirmed:

- `https://littlefightnyc.com/answers` returns 200
- `https://littlefightnyc.com/answers/` returns 200
- slashless answer pages return 200
- `https://littlefightnyc.com/case-studies` returns 200
- `https://littlefightnyc.com/case-studies/` returns 200
- IndexNow verification key returns 200

Local checks that passed:

- `node --check scripts/generate-aeo-beast-pages.mjs`
- `node --check scripts/submit-indexnow.mjs`
- `node --check scripts/build-netlify-publish.mjs`
- `node --check js/main.js`
- `node --check js/fit-check-intake.js`
- `node scripts/build-netlify-publish.mjs`
- `npx netlify functions:build --src netlify/functions --functions tmp/functions-build`
- `xmllint --noout sitemap.xml`
- JSON-LD parse sanity check across public HTML files
- `git diff --check`
- credential scan for previously pasted Twilio values

## Known Warnings and Concerns

### Security

Squirrel warnings:

- CSP still allows `unsafe-inline`.
- The public Fit Check form has no CAPTCHA/Turnstile yet.
- HTTP to HTTPS redirect warnings appear for HTTP URLs.

Recommended next security work:

- Add Turnstile or another low-friction anti-spam layer to Fit Check.
- Tighten CSP after inline dependencies are reduced.
- Keep HSTS and existing security headers.

### Secrets

Concern:

Twilio credentials were shared in chat during testing. They were not committed. Still rotate them.

Next steps:

- Rotate Twilio Auth Token.
- Rotate Twilio API key/secret.
- Remove `TWILIO_ALLOW_SIGNATURE_FALLBACK` after production validation no longer needs trial fallback.
- Do not paste secrets into chat, docs, commits, logs, or screenshots.

### Phone Conversion

Current gap:

The phone flow captures and routes leads, but it does not yet fully convert to payment.

Next steps:

- Configure a real paid Fit Check booking link.
- Configure a real urgent support payment/deposit link.
- Set `FIT_CHECK_URGENT_SUPPORT_URL` or `URGENT_SUPPORT_PAYMENT_URL`.
- Confirm whether urgent calls should live-transfer to David during business hours.
- Upgrade off Twilio trial if this becomes production-facing.

### Email Notifications

Current gap:

Function-sent email alerts are not live unless Resend env vars are configured.

Set:

- `RESEND_API_KEY`
- `FIT_CHECK_NOTIFY_EMAIL`
- `FIT_CHECK_EMAIL_FROM`

Netlify Forms backup exists, but real inbox arrival should still be confirmed.

### Data Storage

Supabase storage is optional and may not be fully configured in production.

Relevant schema:

`docs/fit-check-schema.sql`

Set only if database storage should be enabled:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### SEO/AEO

Current scores are strong, but not finished forever.

Remaining SEO/AEO opportunities:

- Add more first-party proof.
- Convert real repeated Fit Check phrases into answer pages.
- Build service-city matrix pages carefully, not spammy.
- Add real neighborhood pages only when they contain specific local context.
- Add comparison tables where useful.
- Add more author/date signals if Squirrel E-E-A-T warnings need to be reduced.
- Add more internal links from older blog posts to new answer pages.
- Continue IndexNow submissions after major content changes.

### Content Warnings

Squirrel keyword-density warnings exist on three answer pages:

- `business-email-not-working`
- `business-not-showing-on-google-maps`
- `website-form-not-working-small-business`

Content score is still 100, but future copy edits can reduce repetition.

### Performance

Squirrel warnings:

- Render-blocking CSS.
- Critical request chains.
- Heavy page warning around tracked resources.

Netlify Lighthouse homepage performance is currently 99, so this is not urgent, but future technical cleanup can:

- Inline smaller critical CSS.
- Defer non-critical CSS more aggressively.
- Audit duplicated CSS layers.

### Accessibility

Netlify Lighthouse accessibility is 98.

Squirrel accessibility score is 100, but warnings remain:

- Potential contrast heuristics on white/light text.
- One older page has identical "case studies" link text pointing to different destinations.

Do not degrade focus states, contrast, reduced-motion support, or form labels.

### Proof and Case Studies

Do not invent proof.

Current case studies are anonymized and supportable at an operational pattern level. Replace with named projects only after David approves client names, stacks, and outcome claims.

### External Setup Still Needed

Likely still needs human/account access:

- Google Search Console verification token or HTML file.
- Google Tag Manager container ID if GTM is desired.
- Google Ads conversion ID/label.
- Final confirmation that GA4 is receiving desired events.
- Netlify form notification recipient confirmation.
- Real iOS device QA.
- Founder photo set.
- Final logo export set.
- Final branded 1200 x 630 OG image.

## Build and Deploy Commands

From repo root:

```bash
node scripts/build-netlify-publish.mjs
```

Build Netlify functions:

```bash
npx netlify functions:build --src netlify/functions --functions tmp/functions-build
```

Validate sitemap:

```bash
xmllint --noout sitemap.xml
```

Generate answer engine pages:

```bash
npm run generate:aeo
```

Submit sitemap URLs to IndexNow:

```bash
npm run indexnow
```

Deploy to production:

```bash
npx netlify deploy --prod
```

Check Netlify project/deploy state:

```bash
npx netlify status
npx netlify api listSiteDeploys --data '{"site_id":"0907d8fe-7018-48db-a6be-1f906e4b2619"}'
```

Run live Squirrel audit:

```bash
squirrel audit https://littlefightnyc.com --format llm
```

## Local Git State at Handoff

Tracked site changes through commit `cc31653` were pushed to `origin/main`.

Untracked local items existed after the last implementation and were intentionally not added unless David explicitly asks:

- `.impeccable.md`
- `AGENTS.md`
- `backup/`
- `deploy-1774613740316-76014a44-fd1b-47ba-bf80-1e9cd4e8661f.zip`
- `squirrel.toml`
- `tmp/`

This `HANDOFF.md` is the exception because David explicitly requested a Claude Code handoff.

Before future commits:

```bash
git status --short
```

Stage deliberately. Do not bulk-add `tmp/`, `backup/`, old deploy zips, screenshots, browser profiles, or secrets.

## Recommended Next Work Order

1. Rotate Twilio credentials and remove temporary signature fallback when safe.
2. Configure paid conversion links for Fit Check and urgent support.
3. Add Turnstile/CAPTCHA to Fit Check without making the intake feel like paperwork.
4. Configure Resend email alerts if David wants email for every Fit Check/call.
5. Confirm Netlify Forms notification delivery in the real inbox.
6. Add real scheduling/payment handoff inside the phone SMS follow-up path.
7. Add more answer pages from real owner questions and Fit Check phrases.
8. Replace anonymized case-study patterns with approved named proof when available.
9. Add more visual proof assets: screenshots, dashboard mockups, tool maps, before/after paths.
10. Tighten CSP and reduce render-blocking CSS only after ensuring visual regressions do not appear.

## Operating Rules for Claude Code

- Read `CLAUDE.md` and this file before major edits.
- Keep the site static-first unless David explicitly changes the architecture.
- Use existing visual and copy patterns.
- Preserve midnight blue, Little Fight orange, and the local business advantage voice.
- Do not reintroduce dense technical copy.
- Do not lead with "concierge tech support."
- Do not make unsupported claims.
- Do not commit secrets.
- Do not delete client or local artifacts without explicit permission.
- Run build, function build, sitemap, JSON-LD, and live route checks before saying work is done.
- For major content additions, update `sitemap.xml`, `llms.txt`, internal links, schema, and IndexNow.

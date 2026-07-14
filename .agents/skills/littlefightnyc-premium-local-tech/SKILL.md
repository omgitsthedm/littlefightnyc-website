---
name: littlefightnyc-premium-local-tech
description: Use when improving or reviewing the Little Fight NYC website so visual polish, conversion paths, copy, and technical decisions stay premium, blunt, local, and founder-led.
---

# Little Fight NYC Premium Local Tech Polish
Use this skill when improving or reviewing the Little Fight NYC website.
## Purpose
Polish a premium, founder-led NYC small business tech website.
Little Fight NYC helps small and mid-sized New York businesses with websites, IT support, local visibility, software cleanup, and practical systems.
This is not a generic agency site.
This is not a SaaS startup site.
This is not a corporate IT help desk.
This is not fake gritty NYC theater.
The site should feel:
- Midnight blue
- Orange-signal sharp
- Human
- Founder-led
- Useful fast
- Blunt but kind
- Premium without being slick
- Local without being cliché
- Built for tired owners who need the path fixed
## Core promise
Keep what works.
Connect what matters.
Replace what drags.
Build what fits.
## Mission frame
Little Fight NYC exists to help NYC small businesses survive against bigger competitors.
Use concrete examples:
- The bodega across from a chain pharmacy
- The salon next to a Sephora
- The cafe watching a Starbucks open down the block
- The bar manager drowning in POS subscriptions
- The shop owner paying for five tools that do not talk to each other
Do not turn this into politics.
Do not preach.
Do not say “saving the neighborhood.”
Show the practical work:
- Shrink bills
- Grow business
- Fix broken paths
- Keep the shop running
- Give small shops tools the chains use, sized for the corner shop
## Brand feel
Use:
- Premium midnight blue base
- Little Fight orange as the lead signal
- Animated orange dot atmosphere
- Sharp editorial grids
- Practical system diagrams
- Functional accents for routing and state
- Clear four-channel contact blocks
Do not remove:
- Midnight blue
- Orange signal
- Founder-led tone
- Four-channel contact pattern
- Tech Audit route
- Phone/text/email/form clarity
## Color rules
Primary:
- Midnight blue: `#080b14`
- Elevated blue: `#0d1120`
- Panel blue: `#111827`
- Little Fight orange: `#fe5800`
- Soft orange: `#ff7a35`
- Cream text: `#f7efe2`
- Muted text: `#a7adbb`
Supporting accents:
- Copper
- Gold
- Teal
- Sky
- Green
- Rose
Use supporting accents to help people scan.
Do not make the site rainbow.
Orange is the brand signal.
Midnight is the base.
## Voice
Kind, not nice.
Kind means:
- Direct
- Helpful
- Real
- Specific
- Respectful of time
- Willing to say no
Nice means:
- Customer-service fluff
- Agency voice
- “We’d love to”
- “Reach out”
- “Unlock your potential”
- “Transform your business”
- “Best-in-class solutions”
Avoid nice.
Use kind.
## Audience test
Every page must work for:
- An 80-year-old cobbler
- A 20-year-old bar manager
Both should know:
- What Little Fight does within 3 seconds
- Whether it is for them within 8 seconds
- How to reach David within 15 seconds
- What happens next within 25 seconds
- How to act within 30 seconds
## Contact rule
Every major page should make these four contact routes easy to find:
1. Call: `(646) 360-0318`
2. Text: same number
3. Email: `hello@littlefightnyc.com`
4. Form: `/tech-audit/` or `/contact/`, depending on context
Use the hours line where appropriate:
“9am-9pm Eastern: a human answers. After hours: AI takes the message and David calls back.”
Do not hide all contact behind a single form.
Do not over-gate visitors with Tech Audit.
Let people pick their channel.
## Copy rules
Use:
- “Tell us what’s broken.”
- “We pick up.”
- “First hour free.”
- “Websites in 14 days.”
- “Tools the chains use, sized for the corner shop.”
- “Call. Text. Email. Form.”
- “If we can’t help, we’ll tell you who can.”
- “Software costing too much?”
- “Computer broken?”
- “Website not bringing in business?”
Avoid:
- “Reach out”
- “We’d love to”
- “Don’t hesitate”
- “Trusted partner”
- “Our team”
- “Industry-leading”
- “Best-in-class”
- “Unlock”
- “Transform”
- “Empower”
- “Solutions”
- “Schedule a consultation”
- “Tailored”
- “Bespoke”
- “Curated”
- “Digital transformation”
- “Operational optimization”
- “AI-powered synergy”
## Design polish rules
Premium here does not mean luxury.
Premium means:
- Faster understanding
- Less clutter
- Stronger hierarchy
- Sharper contact paths
- Better spacing
- Better scannability
- More confidence
- Fewer decorative distractions
Preserve:
- Midnight base
- Orange signal
- Dot atmosphere
- Local business edge
- Founder-led human proof
- Short copy
- Answer-first sections
Improve:
- Above-the-fold clarity
- Mobile breathing room
- CTA priority
- Four-channel contact blocks
- Card hierarchy
- Section transitions
- Proof bands
- Route panels
- Typography rhythm
## Hard avoid list
Avoid:
- Generic startup gradients
- Corporate IT blue
- Fake dashboards
- Fake metrics
- Stock-photo handshakes
- “Gritty NYC” clichés
- Over-polished agency language
- Too many cards with equal weight
- Long paragraphs
- Hidden phone number
- Tech Audit as the only path
- Unsupported guarantees
- Invented case study metrics
- Unapproved client names
- Jargon-heavy service menus
## Technical constraints
This is a static-first Netlify site.
Build:
- Netlify publishes from `dist`
- `dist` is generated by `scripts/build-netlify-publish.mjs`
- Functions live in `netlify/functions`
Do not add:
- New framework
- CDN dependency
- Unnecessary animation library
- Heavy third-party scripts
- Secrets in code or docs
If editing CSS:
1. Prefer existing CSS layers.
2. Keep brand tokens intact unless a small token refinement is necessary.
3. Preserve reduced-motion behavior.
4. Preserve contrast and focus states.
5. Run the build after changes.
If editing JS:
1. Keep `js/main.js` and minified JS in sync if minified file exists.
2. Verify nav, drawer, conversion rail, Tech Audit, forms, and tracking still work.
3. Do not alter function routes unless explicitly required.
If editing generated answer pages:
1. Update the generator data, not just generated output.
2. Run `npm run generate:aeo`.
3. Confirm sitemap, llms.txt, nav/footer links, and netlify redirects remain correct.
## Validation checklist
Run:
- `node scripts/build-netlify-publish.mjs`
- `node --check js/main.js`
- `node --check js/tech-audit-intake.js`
- `npx netlify functions:build --src netlify/functions --functions tmp/functions-build`
- `xmllint --noout sitemap.xml`
- `git diff --check`
Check routes:
- `/`
- `/tech-audit/`
- `/contact/`
- `/websites/`
- `/systems/`
- `/consulting/`
- `/it-support/`
- `/answers/`
- `/case-studies/`
- `/lifetime-cost/`
Check viewports:
- `360x740`
- `390x844`
- `768x1024`
- `1440x1000`
Look for:
- Overflow
- CTA confusion
- Weak contrast
- Bad tap targets
- Text too small
- Headline wrapping issues
- Hidden contact channels
- Overdecorated sections
- Agency voice
- Generic AI page smell
## Final standard
The finished site should feel like:
“The NYC small business tech resource a shop owner calls when the site is not bringing in business, the tools cost too much, the POS is broken, or the setup is a mess.”
Clear. Human. Fast. No fluff.

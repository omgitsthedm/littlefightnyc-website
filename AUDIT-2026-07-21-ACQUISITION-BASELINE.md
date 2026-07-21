# Acquisition and Interface Baseline

Date: 2026-07-21

Scope: production homepage, Services, Examples, one representative case study,
Contact, Tech Audit, The Lab, and Website Audit Lab. This is the before-state for
the July 2026 acquisition pass.

## Anti-pattern verdict

Little Fight does not look like a generic AI-built agency site. The Oswald,
Barlow, JetBrains Mono, orange, NYC photography, tugboat, and boxing language
form a recognizable system. The main risk is overproduction rather than visual
genericness: the site repeats proof, contact choices, metrics, and brand
statements until the clearest offer loses force.

Profile used: marketing and acquisition pages, full-strength review.

Design direction: New York service counter. Swiss clarity, industrial grit,
plain words, one orange signal, current client work, and purposeful motion.

## Executive summary

- Critical: 0
- High: 8
- Medium: 6
- Low: 3
- Automated accessibility: 100 on the React acquisition routes; 91 on The Lab
- Best Practices and SEO: 100 on all eight Lighthouse samples
- Main performance gap: mobile LCP is above the 2.5 second target on every
  sampled proof route except Tech Audit

## High-severity findings

### 1. The homepage first screen repeats the same decision

Location: `app/src/components/editorial/QuietHero.tsx`,
`app/src/components/editorial/StickyHelpBar.tsx`

The hero presents two large actions, three trust claims, a problem marquee, and
the mobile sticky bar presents the same phone and website choices again before
the visitor scrolls. On a 390 by 844 viewport, the sticky bar covers the bottom
of an already crowded hero.

Impact: the visitor must parse six messages to make one decision. The strongest
website offer feels less important because every supporting statement competes
with it.

Recommendation: keep two hero doors, move supporting proof out of the hero,
remove the problem marquee, and reveal the sticky bar only after the hero action
has left the viewport.

### 2. The case-study story is told multiple times

Location: `app/src/pages/CaseStudyDetail.tsx`

The long body repeats the problem, change, and outcome. The four-beat arc then
repeats those facts. Metrics and diagrams restate parts of the same result.

Impact: a buyer must read past repetition before reaching the shipped work.

Recommendation: one compact Before / Kept / Changed / After story, one result
rail, then the live proof object.

### 3. Client proof is static and mostly stale

Location: `app/public/assets/case-*.webp`, `app/src/pages/FieldGuide.tsx`

Seven case-study images were captured in May 2026. VenueCircuit was captured in
early July. All eight production client URLs currently return HTTP 200, but
their current interfaces are not represented on the site.

Impact: the proof page understates the quality and range of the work available
today.

Recommendation: recapture every live client at desktop and mobile sizes, then
present the captures in an interactive site explorer. Seven sites correctly
forbid cross-site framing, so a public iframe gallery is not reliable.

### 4. The Examples page has no single job

Location: `app/src/pages/FieldGuide.tsx`

Case studies, a record wall, The Lab, The Audit, industries, and owner answers
all compete on one page. The Library already owns the answer content.

Impact: a buyer looking for work sees a directory instead of a proof-led sales
story.

Recommendation: make current client work the primary interactive section,
combine Lab and Audit into one working-tools section, keep industry routing,
and send educational questions to the Library.

### 5. Homepage brand statements outnumber acquisition sections

Location: `app/src/pages/Home.tsx`

The Fight, Signature Band, Neon Sign, and Brand Line each restate the local,
independent-business positioning after proof and services have already made the
point.

Impact: the page becomes several screens longer without adding a new buying
reason.

Recommendation: keep The Fight as the one New York point of view. Remove the
three redundant signature sections from the homepage sequence.

### 6. Lab accessibility defects

Location: `app/public/examples/lab/index.html`,
`app/public/examples/lab/assets/lab.css`

Lighthouse found a note inside a `role=list`, 4.3:1 caption contrast where 4.5:1
is required, and a visible brand name missing from the link's accessible name.

Impact: semantic navigation and text readability regress on the flagship proof
surface.

Standard: WCAG 1.3.1, 1.4.3, 2.5.3.

### 7. Audit Lab accessible-name defect

Location: `app/public/examples/audit/index.html`

The sample-result card's `aria-label` does not contain its visible text.

Impact: speech-input users cannot reliably activate the card by its visible
name.

Standard: WCAG 2.5.3.

### 8. Proof-route LCP misses the target

Lighthouse mobile results:

| Route | Performance | LCP | Accessibility |
| --- | ---: | ---: | ---: |
| Home | 86 | 3.6s | 100 |
| Services | 87 | above target | 100 |
| Examples | 80 | 4.2s | 100 |
| Tech Audit | 91 | near target | 100 |
| Case study | 86 | 3.4s | 100 |
| The Lab | 73 | 4.7s | 91 |
| Website Audit Lab | 84 | 3.4s | 100 |
| Contact | 89 | above target | 100 |

The Lab loads a Three.js Brownstone iframe eagerly on the hub and Lighthouse
reports about 113 KiB of unused JavaScript. The proof pages also carry
render-blocking font and stylesheet work.

Impact: the most trust-sensitive pages feel slower than the quieter utility
pages.

Recommendation: use a lightweight Brownstone poster on the hub and activate
the live 3D preview on demand; self-host the static Audit/Lab fonts; keep current
image dimensions and lazy loading.

## Medium-severity findings

1. `QuietNav.tsx` uses a scroll event listener for an eight-pixel state change.
   Use a one-pixel IntersectionObserver sentinel instead.
2. Primary contact intent uses several labels: Start a project, Plan my website,
   Free Tech Audit, Tech Audit, and Start with the free read. Standardize by
   intent and context.
3. The footer repeats navigation, current-status, city/time/weather, contact,
   and legal information across several large bands.
4. Examples uses repeated eyebrow, heading, paragraph rhythms and two identical
   Lab-style rows for Lab and Audit.
5. Raw arrow characters and middle-dot separators appear throughout marketing
   copy even where icons and layout already communicate direction.
6. Audit Lab uses an external Google Fonts stylesheet and multiple CSS files on
   the critical path, contributing to a measured 2.24 second render-blocking
   opportunity.

## Low-severity findings

1. Several internal comments still describe older stacking decisions as if they
   are product requirements.
2. Case-study published and capture dates do not tell the visitor when the live
   visual was last refreshed.
3. The Lab hub caption misses the AA contrast threshold by a small margin.

## Positive findings

- All eight published client URLs return HTTP 200.
- Core React routes score 100 in Lighthouse accessibility, Best Practices, and
  SEO.
- Total Blocking Time is zero on the sampled acquisition routes.
- CLS is zero or 0.001 on the sampled acquisition routes.
- Focus, semantic landmarks, reduced motion, responsive images, consent-gated
  analytics, and service-worker lifecycle protections are already strong.
- The Brownstone, Audit instrument, current client work, and NYC photography
  are distinctive proof objects worth foregrounding.

## Fix order

1. Repair the four confirmed accessibility failures.
2. Replace stale proof with current desktop and mobile captures.
3. Build the interactive work explorer and remove case-study repetition.
4. Simplify the homepage and mobile sticky behavior.
5. Simplify Examples and the footer.
6. Re-run Lighthouse, keyboard, contrast, responsive, build, route, and live
   pipeline checks before release.

## Remediation closeout

Completed on 2026-07-21.

- The homepage is now a five-part acquisition journey: clear offer, current
  proof, New York point of view, four plain-language services, and one contact
  decision. The duplicate brand bands and first-screen CTA repetition are gone.
- The Examples page now begins with an interactive explorer containing fresh
  desktop and mobile captures for all eight live clients. Lab and Audit are
  paired as working proof tools instead of repeated directory rows.
- Case studies now lead with the result, show the current site, and tell one
  concise Before / Kept / Changed / After story.
- The Lab hub now gives the Brownstone the flagship position and loads its live
  Three.js scene only when the visitor asks for it. Every concept has shared Lab
  navigation, motion controls, responsive containment, and a local font rail.
- The Website Audit Lab uses self-hosted fonts and its production pipeline was
  exercised end to end against `https://littlefightnyc.com`. The completed Blob
  report ID is `littlefightnyc-com-9951c9ee`.
- Generated audit reports now contain the correct Accessibility category label,
  wrap long titles, contain the rotated score on a 390px viewport, and use the
  tightened local-font content-security policy.

### After-state validation

| Surface | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| The Lab | 99 | 100 | 100 | 100 |
| Website Audit Lab | 99 | 100 | 100 | 100 |
| Home | 81 | 100 | 100 | 100 |
| Examples | 81 | 100 | 100 | 100 |
| Representative case study | 82 | 100 | 100 | 100 |

The React-route performance scores remain constrained by the shared application
runtime under Lighthouse's simulated mobile throttle. Measured Total Blocking
Time is zero on Examples and the case study and 179ms on Home; CLS is 0.022 or
lower. The proof images themselves load in roughly 10ms locally, and case-study
LCP discovery now passes after adding route-aware image and chunk preloads.

All 11 Lab concepts passed a separate Lighthouse sweep at 100 Accessibility and
100 Best Practices. The pass included real browser interaction checks for the
Brownstone lighting/model controls, Studio Engine signal generation, pill-scroll
sequence, micro-animation filters and code reveal, growth replay, AHA replay and
glow, and the legacy tech-support mobile menu. No concept has horizontal mobile
overflow.

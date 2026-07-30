# Little Fight NYC — Site Reinvention Dossier

**Dossier date:** 2026-07-24  
**Scope:** Main public site at `https://littlefightnyc.com`  
**Canonical checkout:** `/Users/davidmarsh/Code/LiFi NYC/Little Fight NYC Business/Website/littlefightnyc-website`  
**Mandate:** Little Fight NYC Master Client/Project Reinvention Handoff, July 2026  
**Current readiness:** `AMBER` — the 2026-07-25 Quality Spine release is
verified live; additional reinvention directions, stronger claims, and
service/funding commitments remain gated.

This is the durable decision and evidence record for the main site. It
separates facts verified in the checkout from business assertions, external
state, and approvals that still need an owner. The dossier is not itself
authority for a commit, push, production deploy, new commercial promise, or
publication of unapproved client material; any such authority must come from
the owner’s separately stated scope.

**Release addendum — 2026-07-25:** David explicitly authorized the integrated
candidate for production. Commit `d02b93549ad79cc2a904f3220d2a06b1643f114a`
was pushed to `main`; Netlify deploy `6a642637809f6e0008ac8831` reached
`ready`; revision-matched live, 200-route, share-image, and mobile scroll/crash
checks passed. No form or external-provider delivery test was submitted. This
release does not approve the still-open audience, proof, funding, service,
measurement, or care gates below.

## 1. Status and classification

| Dimension | Current classification | Basis |
| --- | --- | --- |
| Portfolio state | `LIVE / ACTIVE — ELEVATION IN PROGRESS` | The site is the agency storefront. Quality Spine application release `d02b935` is verified ready and live; future elevation directions remain gated. |
| Investment lane | `SIGNATURE CANDIDATE` | The agency’s own site warrants signature-level ambition, but amount, capacity, production schedule, and maintenance tier are not yet recorded. This is not an `E3` approval. |
| Experience type | `SERVICE-ENABLED MARKETING SITE` | `/tech-audit/` collects business and contact details through Netlify Forms. The public Website Audit also accepts a URL and email, starts background Functions work, persists job/report state in Netlify Blobs, and can deliver results through external providers. |
| Consequence tier | `MODERATE` | A failed or delayed form/audit can lose a lead or report, and the workflows handle contact details plus persistent audit state. There are no accounts, billing, or authenticated multi-tenant roles, but the Function, Blob, provider, scheduled-cleanup, privacy, and incident boundaries are live operational responsibilities. |
| Current creative system | `AXIOM MOMENTUM — INCUMBENT, NOT ELEVATION-APPROVED` | The implemented design constitution is documented in [app/DESIGN.md](app/DESIGN.md). No first-party research and three-direction approval record currently closes `E1`. |
| Release authority | `2026-07-25 RELEASE EXECUTED; FUTURE RELEASES REQUIRE NEW AUTHORITY` | David authorized release `d02b935`, which auto-deployed successfully. This dossier grants no standing authority for later production changes. |

## 2. Exact current baseline

### Verified locally on 2026-07-24 and released on 2026-07-25

- Repository root and working directory both resolved to the canonical checkout above.
- Branch: `main`.
- Session-start local HEAD and `origin/main`:
  `df7c90ded191d909648ed86401fc5816809648ec`.
- Origin: `https://github.com/omgitsthedm/littlefightnyc-website.git`.
- The session began from verified production revision `df7c90d`; it remains
  the previous rollback point.
- The working tree was clean immediately before this work began. The integrated
  candidate based on `df7c90d` became released application baseline `d02b935`
  through ready Netlify deploy `6a642637809f6e0008ac8831`. Verify current
  `HEAD`, GitHub `main`, Netlify, and `/release.json` independently.
- Generated route metadata contains **203 pages** (verified 2026-07-29 against
  the build output and the live sitemap):
  - **130 indexable**;
  - **73 noindex**;
  - **72 noindex area/service combinations**.
- Application source is under `app/`: React 19, TypeScript, Vite 7, React Router, build-time route snapshots/prerendering, and Netlify Forms.
- The Tech Audit form is registered in [app/public/__forms.html](app/public/__forms.html) and submitted from [app/src/pages/TechAudit.tsx](app/src/pages/TechAudit.tsx).
- The released application has a Quality Spine in [.lifi/quality.yml](.lifi/quality.yml),
  debt/dead-code ledgers, and all five standard command lanes:
  `quality:fast`, `quality:full`, `quality:release`, `quality:live`, and
  `quality:maintenance`.
- Node 24 is pinned in [.nvmrc](.nvmrc) and the package engine declarations.
- [app/playwright.config.ts](app/playwright.config.ts) and
  [app/tests/quality-smoke.spec.ts](app/tests/quality-smoke.spec.ts) define a
  four-project browser suite with axe, representative-route contracts, mobile
  scroll lifecycle, form validation, Library interaction, and all-indexed-route
  first-response/hydrated-H1 parity.
- Route-level share identity, generated social-card assets, release metadata,
  and route metadata/H1 parity corrections are present in the released baseline.
- `quality:full` passed under Node 24.18.0/npm 10.9.8, including **32/32**
  browser checks across desktop/mobile Chromium, desktop Firefox, and mobile
  WebKit. After release, `quality:live`, the 200-route sweep, 78 share-image
  checks, and an independent 390×844 mobile scroll/crash smoke passed.

### Production linkage and release boundary

- [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md), [AGENTS.md](AGENTS.md), and [netlify.toml](netlify.toml) identify:
  - Netlify site name `littlefightnyc`;
  - Netlify site ID `0907d8fe-7018-48db-a6be-1f906e4b2619`;
  - build command `cd app && npm ci && npm run build`;
  - publish directory `app/dist`;
  - GitHub `main` → Netlify auto-build → production.
- The linked GitHub/Netlify/live production evidence identifies `d02b935` as
  the released application baseline and `6a642637809f6e0008ac8831` as its ready
  production deploy.
- Current production SHA must always be read from live `/release.json` and
  compared with GitHub `main`; a documentation-only commit may advance the Git
  revision without changing the application behavior recorded here.

### Open truth debt

- The clean release passed the full tier locally under Node 24, including
  32/32 browser checks and revision-matched artifact validation, then passed
  revision-matched production verification.
- Route metadata/H1 parity and share identity work is live. Social-platform
  debugger/cache rendering remains externally unverified.
- The public Lab experience is served beneath `/examples/lab/` by
  [netlify.toml](netlify.toml), while the separate Lab repository remains a
  distinct implementation/source lane.
- The current prerender emits FAQPage and HowTo schema and publishes permissive AI crawler/`llms.txt` output. Their visible-content purpose and policy owner have not been recorded.
- No first-party audience research, three-direction prototype record, funded
  care tier, or completed proof/rights ledger has been supplied.
- Twilio and the AI phone agent are retired. AI phone answering is not a
  service and must not reappear in copy or operating assumptions.

## 3. E0–E5 elevation gates

Gate status is evidence-based. `CONDITIONAL PASS` permits only the named bounded work; it is not permission to cross the next hard checkpoint.

| Gate | Decision | Evidence present | Missing evidence / exact next action | Consequence |
| --- | --- | --- | --- | --- |
| `E0 — READY` | **CONDITIONAL PASS** | Canonical checkout, branch, origin, verified production SHA, source boundary, deployment model, authority boundary, site classification, and initial blockers are recorded here. | David must name decision owners, implementation owner, independent verifier, review deadlines, ambition tier, available capacity, and release approver. | Continue evidence work and reversible prototypes only. No broad implementation or production push. |
| `E1 — EVIDENCED` | **BLOCKED** | Incumbent Brand Foundation and voice exist in [app/DESIGN.md](app/DESIGN.md), [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md), and [VOICE.md](VOICE.md). Current route, offer, and proof surfaces are inspectable. | Complete 3–5 audience conversations, three prototype sessions, claims ledger, proof/rights ledger, competitive/intent evidence, route baseline, and approved Service Blueprint. | No Experience Constitution may be called selected or approved. |
| `E2 — OPERABLE` | **BLOCKED** | A frontstage Tech Audit flow and conversion path exist. [CONVERSION-MEASUREMENT.md](CONVERSION-MEASUREMENT.md) defines a controlled delivery test. | Name the form-delivery inbox and human owner; verify a controlled submission end to end; document response, escalation, missed-lead recovery, service capacity, scope/approval behavior, and support owner. | Do not publish stronger response, delivery, or support promises. |
| `E3 — FUNDED` | **BLOCKED** | The incumbent system and likely production needs are documented. | Record approved amount and currency, funding owner, committed/deferred scope, production schedule, asset/vendor costs, rights, implementation capacity, contingency, and funded maintenance tier. | No high-production direction, broad build, commissioned asset plan, or release schedule may be treated as committed. |
| `E4 — LEARNABLE` | **CONDITIONAL PASS** | [CONVERSION-MEASUREMENT.md](CONVERSION-MEASUREMENT.md) defines consent boundaries, funnel events, reliability views, a lead-loop test, and an experiment queue. [SEARCH-ACQUISITION-RUNBOOK.md](SEARCH-ACQUISITION-RUNBOOK.md) defines search/listing review steps. | Verify analytics properties and event receipt, record current baselines, name the decision owner, create the experiment register, and attach exact production commits and observation windows. | Measurement preparation may continue; no release candidate is approved until the live instrumentation path is proven. |
| `E5 — DURABLE` | **BLOCKED** | The released application includes the Quality Spine, standard command lanes, release/live verification tooling, browser coverage, security headers, privacy defaults, and an auto-deploy source path; exact-commit local and live lanes passed for `d02b935`. | Fund and name the Care and Reliability SLA; add incident escalation, renewals, access succession, form/CRM monitoring, rights/claim expiry, dependency/security/accessibility/performance cadence, backup/restore evidence, and sunset ownership. | The project cannot be closed as durable or left without an accountable care owner. |

**Current gate owners:** unassigned unless an existing artifact explicitly names one. Silence never means approval.  
**Gate review date:** owner to schedule after the evidence requests in Section 11 are answered.

## 4. Incumbent Experience Constitution

### Axiom Momentum — working constitution

This is the current implemented direction, not a newly approved strategic conclusion.

- **Core idea:** Small businesses have enough to fight. Their technology should not be one of them.
- **Category:** Serious technology for small businesses.
- **Promise:** Make the technology fit the business, not the business fit the technology.
- **Commercial order:** custom websites first; urgent IT support second; free consulting as the uncertainty-removing path; focused software the premium “software you own” continuation.
- **Story sequence:** name the fight → see the work → cut the drag → build the right thing → prove it works → stay with it.
- **Owner journey:** “That is my kind of business” → “I understand what they fix” → “I can see real work” → “I know the first safe step” → “I remain in control.”
- **Depth contract:** one-look comprehension for a non-technical owner; a short second layer for fit and process; deeper proof for people who want evidence.
- **Visual grammar:** near-black operating-system ground; orange as the single action/live signal; blue as support; Oswald headings; Barlow body; generous, legible surfaces; business environments rather than generic office imagery.
- **Imagery rule:** storefronts, counters, shelves, booking stations, receipts, devices, cables, back offices, and shipped products lead. People are absent, distant, blurred, incidental, or real and explicitly approved. Generated environments are illustration, never client proof.
- **Motion rule:** complete first paint; purposeful signal/settle motion; transform/opacity where possible; no scroll tax; full static and reduced-motion meaning. The house motion is many → one.
- **Proof rule:** anything that looks like data must be real. Timelines require a verified start event, current state, latest completed milestone, last-verified date, next milestone, privacy state, and publication approval.
- **Lab rule:** the Lab is a directly explorable showroom, never a code repository. No GitHub, source, copy-code, package, commit, schema, spec, or file-tree UI.
- **Language rule:** short, plain New York English without cliché, jargon, condescension, or shame. Explain value before technology. Do not imply Wix or another platform cannot rank; criticize poor fit, bloat, lock-in, waste, and runaround only when the statement is supportable.

**Constitution status:** incumbent and implemented in part. It remains a candidate until `E1` research and direction selection are complete.

## 5. Three materially different direction options

These are hypotheses for testing. None is approved for production.

| Direction | Experience | Signature moment | Strength | Primary risk | Status |
| --- | --- | --- | --- | --- | --- |
| **A. Axiom Momentum / Calm Operating System** | A product-like agency storefront organized around owner stories, shipped proof, four plain jobs, and calm technical instruments. | A tangled business problem resolves through the existing many → one motion language into one clear next move. | Already implemented; clear commercial ladder; strong legibility and performance doctrine. | Can feel like software UI rather than a warm neighborhood business if environments and proof are too sparse. | **INCUMBENT — NOT FORMALLY APPROVED** |
| **B. NYC Walk-Up Operations Studio** | The site behaves like a familiar mixed-use New York building: storefront, buzzer, floors, workroom, archive, and rooftop signal. Visitors enter through the business problem they recognize. | A direct “doorbell” opens the correct floor in one action; windows reveal active client work and real milestones. | Memorable, place-specific, visual, and approachable without relying on human portraits. | A spatial metaphor can become navigation friction or theme-park decoration unless every destination stays direct and accessible. | **CONCEPT — NOT APPROVED** |
| **C. The Quiet Upgrade** | Documentary before/after operating flows: a missed form, overloaded software bill, broken booking path, or paper process becomes a simpler owned system. Evidence and service behavior lead; the agency brand recedes. | A real workflow map changes from scattered handoffs into one visible, recoverable path, with each improvement tied to proof. | Most concrete for owners who fear technology; makes value and service delivery visible. | Can become dry process consulting or imply outcomes that have not been measured. | **CONCEPT — NOT APPROVED** |

### Direction decision test

Test all three against the same tasks with at least three prototype sessions:

1. In ten seconds, what does Little Fight NYC do?
2. Which problem would you trust it to solve first?
3. Can you reach relevant proof without hunting?
4. What do you expect after submitting the Tech Audit?
5. What feels risky, confusing, too technical, or unbelievable?
6. Which direction feels distinctive without making the work harder?

Record the selected, rejected, and deferred elements. Do not combine all three into an ungoverned collage.

## 6. Audience, intent, proof, and action by route family

| Route family | Primary audience and intent | Proof required | Primary action | Current decision |
| --- | --- | --- | --- | --- |
| `/` | Busy owner or successor deciding whether LFNYC understands real small-business problems. | Recognizable owner situations, shipped work, plain offer, accountable contact path. | Start a website plan, take the free Tech Audit, or call/text. | Keep one-look comprehension and proof near the top; test the incumbent owner stories before replacing them. |
| `/services/` and `/services/*` | Owner who knows the job: website, urgent IT, independent advice, or a right-sized business system. | Deliverables, fit/non-fit, process, relevant case proof, supported claims. | Choose the matching service action; preserve a direct urgent-help path. | Maintain the commercial hierarchy instead of four visually equal service boxes. |
| `/tech-audit/`, `/contact/`, `/thanks/` | Owner ready to explain the problem and learn the next move. | Human-review expectation, privacy boundary, response behavior, no-obligation terms. | Submit, call, text, or email; receive a clear acknowledgement and next step. | Treat this as a service workflow, not only a form UI. Delivery and recovery evidence are mandatory. |
| `/examples/`, `/case-studies/*`, `/studio/*` | Prospect looking for evidence of craft, relevance, and follow-through. | Approved screenshots, implementation facts, verified timelines/outcomes, clear client-vs-owned-product labels. | Open proof directly, then start the relevant plan. | Use a uniform, density-aware proof system; no squeezed rails, unexplained gaps, or hidden drill-down. |
| `/examples/lab/` | Curious prospect exploring what the studio can make. | Working visual experiences with concise business context and a clear way back. | Open an experience directly; return to Examples or start a conversation. | Reduce clicks and remove all repository/code/share-code framing. |
| `/library/`, `/answers/*`, `/journal/*`, `/glossary/*` | Owner researching a live problem or comparing tools before contacting anyone. | Useful answer first, named limits, current sources where needed, related first-party experience. | Continue to the next useful answer or choose a relevant audit/service path. | This is the strongest owned-utility/return-loop candidate; measure return use before expanding volume. |
| `/areas/*`, `/industries/*`, `/nationwide/` | Owner checking local/industry relevance and service availability. | Distinct local or operational facts, applicable proof, honest coverage and response limits. | Choose a service or Tech Audit. | Review all 72 noindex area/service combinations for unique user value; merge or retire thin permutations. |
| `/about/` | Owner evaluating trust, scale, accountability, and working style. | Named accountability, operating principles, real service behavior, approved business facts. | Contact the studio or inspect proof. | Use one coherent story; avoid fragmented manifesto blocks. |
| `/privacy/`, `/terms/`, `/legal/` | Prospect checking data handling, scope, and risk. | Accurate policy, form/data flow, ownership and scope terms, contact route. | Continue safely to contact or audit. | Legal/business review remains required for promises and data handling. |
| `/es/`, `/zh/` | Visitors who prefer a language other than English. | Meaning and offer parity, human language review, equal contact access. | Reach the same service and contact outcomes. | Do not call these complete until a qualified human reviewer approves the content and critical states. |

## 7. Service Blueprint — Tech Audit and direct contact

| Stage | Visitor experience | Backstage requirement | Evidence status |
| --- | --- | --- | --- |
| Discover | Finds LFNYC through home, search, an answer, a local page, proof, or referral. | Accurate metadata, index policy, consent behavior, useful landing intent. | Code exists; current live/search state is externally unverified. |
| Recognize | Sees a familiar business problem and chooses website, IT, advice, or software help. | Route-to-offer mapping and supported claims. | Implemented in part; audience comprehension has not been formally tested. |
| Trust | Reviews examples, case studies, About, policies, and service terms. | Approved proof, rights, named accountability, current facts. | Proof collection process exists; completed approval records are not linked here. |
| Start | Opens the Tech Audit or uses the ordinary call, text, or email paths. There is no Twilio/AI phone-agent service. | Accessible controls, consent-safe analytics, accurate availability and after-hours message language. | Frontstage exists; live event receipt and service capacity are unverified. |
| Submit | Sends `tech-audit-scratch`; browser should reach `/thanks/`. | Netlify capture, spam handling, notification routing, field parity with hidden form registration. | Form code exists; a current controlled production delivery test is required. |
| Acknowledge | Receives a clear success state and expected next step. | Duplicate handling, failure copy, alternative contact, no false “received” signal when delivery failed. | Success copy exists; failure and inbox-delivery recovery need evidence. |
| Human triage | A person reviews context and responds. | Named inbox owner, schedule, callback clock, escalation, urgent-support capacity, record of disposition. | Owner, monitoring evidence, and SLA are not recorded. |
| Scope and approve | Prospect receives a plain recommendation, written scope, timing, responsibilities, ownership terms, and price. | Offer policy, estimator/proposal workflow, factual/legal approval, change control. | Public principles exist; the complete operating artifact is not linked. |
| Deliver and support | Work moves through verified milestones, launch, handoff, and care. | Project record, client approvals, support tier, incident/recovery path, current-work publication permission. | Rules exist in [app/DESIGN.md](app/DESIGN.md); project-level evidence is incomplete. |
| Return | Owner receives support, useful guidance, proof updates, and a reason to come back. | Lifecycle owner, content cadence, experiment review, renewal/expiry checks. | Candidate plan exists below; owner and funded tier are unassigned. |

### Required service acceptance proof

1. Submit one clearly labeled production test with a unique timestamp marker.
2. Confirm browser success, Netlify capture, intended field values, inbox delivery, and elapsed delivery time.
3. Confirm who responds, when the clock starts, how after-hours messages are handled, and what happens when the first owner is unavailable.
4. Test invalid, duplicate, offline, spam-filtered, and notification-failure paths without using client or prospect data.
5. Retain the result with the exact production commit and date.

## 8. Claims, proof, and permissions

`REPO-ASSERTED` means the statement appears publicly or in current source. It does not mean the supporting business, legal, operational, or client evidence has been attached.

| Claim or proof class | Current source | Status | Evidence needed before stronger reuse |
| --- | --- | --- | --- |
| “Custom websites live in 14 days or you do not pay.” | Service, Nationwide, About, metadata, and visual-instrument copy. | `REPO-ASSERTED / OWNER APPROVAL REQUIRED` | Written eligibility, start event, client dependencies, review delays, exclusions, remedy, and approver. |
| Free consulting / free Tech Audit / no obligation. | Services and Tech Audit surfaces. | `REPO-ASSERTED / OWNER APPROVAL REQUIRED` | Confirm scope, limits, qualification, availability, and whether any recommendation can create a paid obligation. |
| Callback within two hours, 9am–9pm ET. | About, Thanks, Nationwide, answer content, and interface instruments. | `REPO-ASSERTED / E2 BLOCKER` | Named service owner, clock definition, schedule/coverage, logs or operating evidence, missed-response recovery, and exception language. |
| On-site help within 24 hours when hands are needed. | IT service copy and visual instruments. | `REPO-ASSERTED / E2 BLOCKER` | Coverage area, availability/capacity, start clock, exclusions, escalation, and owner approval. |
| Client owns code, domain, content, data, hosting, and/or documentation. | Service and Nationwide copy; wording varies by offer. | `REPO-ASSERTED / CONTRACT PROOF REQUIRED` | Standard scope/contract and handoff checklist showing exactly what transfers for each offer and what remains a third-party account. |
| Case-study results, Lighthouse facts, integrations, timelines, and quotes. | Case-study data and rendered pages. | `PER-CLAIM VERIFICATION REQUIRED` | Source, baseline/date range, caveat, approving contact, written publication scope, approval date, and review/expiry date. |
| Current-work timelines and project status. | Desired experience; publication rules exist in [app/DESIGN.md](app/DESIGN.md). | `NOT GENERALLY APPROVED` | Real start event, state, completed milestone, last-verified date, next milestone, privacy state, client approval, and separate forecast label. |
| Generated business environments. | Brand/imagery direction. | `ILLUSTRATION ONLY` | Label/context that cannot be mistaken for a client, location, testimonial, or measured result. |

Use [CLIENT-PROOF-COLLECTION.md](CLIENT-PROOF-COLLECTION.md) as the per-client record format. Its collection order is a plan, not completed approval evidence. When a reliable outcome baseline does not exist, publish an implementation fact instead.

## 9. Measurement, lifecycle, and care plan

### Measurement Contract — draft

- **Primary outcome:** a qualified inquiry completes and is received by the intended human owner.
- **Primary browser signal:** `lead_success`, interpreted only after Netlify capture and inbox delivery are confirmed.
- **Separate contact signals:** phone, text, and email clicks; do not combine them with submissions or impressions into one conversion rate.
- **Consideration signals:** website-plan intent, Tech Audit start, relevant proof visits, and route family.
- **Reliability guardrails:** delivery failure, validation failure, new client-error signatures, poor Core Web Vitals clusters, consent leakage, broken case-study routes, and mobile reload/scroll regressions.
- **Learning rule:** one meaningful acquisition or comprehension experiment at a time, at least 28 days where traffic permits, with raw counts beside rates and lead quality reviewed.
- **Baseline status:** repository event definitions exist; current GA4, Clarity, search, listing, and production-form baselines are not attached to this dossier.
- **Decision owner:** unassigned.

The canonical event and privacy details remain in [CONVERSION-MEASUREMENT.md](CONVERSION-MEASUREMENT.md). Search and Business Profile measures remain in [SEARCH-ACQUISITION-RUNBOOK.md](SEARCH-ACQUISITION-RUNBOOK.md).

### Lifecycle

`Discover → Recognize → Explore proof → Choose a safe first step → Submit/contact → Human triage → Scope and approve → Deliver → Support → Return/refer`

Each transition needs an accountable owner and a recoverable failure path. A thank-you page is not proof that a lead reached the business. A published launch is not proof that the owner received a maintainable handoff.

### Care and review cadence

| Timing | Minimum action |
| --- | --- |
| Every release | Exact-commit build/release evidence; accessibility, critical-route, form, consent, metadata, social preview, security-header, and mobile checks. |
| First 24–72 hours | Verify live SHA, priority routes, form capture/inbox delivery, error signatures, Core Web Vitals, and rollback readiness. |
| Day 7 / 28 / 90 | Review raw inquiries, lead quality, search/listing movement, experiment evidence, user feedback, and any mismatch between promise and delivery. |
| Monthly | Controlled lead-loop test; proof/permission queue; Search Console and Business Profile review; content accuracy; broken links/routes; experiment decision. |
| Quarterly | Dependency and vulnerability review; accessibility and performance sampling; route/index/schema/crawler review; incident drill; access and renewal review. |
| At expiry or change | Reapprove or retire claims, quotes, logos, screenshots, timelines, service hours, prices, availability, legal language, and generated-vs-real asset labels. |

**Funded care tier:** unselected.  
**Incident owner:** unassigned.  
**Form/CRM owner:** unassigned.  
**Search/listing owner:** unassigned.  
**Content/proof/rights owner:** unassigned.  
**Transfer/succession and sunset plan:** not recorded.

## 10. Existing artifact map

| Artifact | Use in this dossier | Current caveat |
| --- | --- | --- |
| [SOURCE_OF_TRUTH.md](SOURCE_OF_TRUTH.md) | Canonical repository, `d02b935` application baseline, Netlify linkage, deploy model, release boundary, source map. | Reverify live `/release.json` after every authorized release. |
| [AGENTS.md](AGENTS.md) | Current project operating rules, architecture, route inventory, released quality boundary, brand rules. | Browser evidence does not replace form/provider delivery proof. |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | Current cold-start summary of the verified release and open external/business gates. | Keep it synchronized with each release and gate decision. |
| [app/DESIGN.md](app/DESIGN.md) | Incumbent Axiom Momentum constitution, commercial hierarchy, imagery, motion, timeline, Lab, and Small Craft rules. | Implemented incumbent, not an `E1` research approval. |
| [DESIGN_LANGUAGE.md](DESIGN_LANGUAGE.md) | Supporting visual and copy rules. | Reconcile any overlap against the newer token and design constitution. |
| [VOICE.md](VOICE.md) | Plain-language and audience doctrine. | Requires audience testing and route-level enforcement. |
| [CLIENT-PROOF-COLLECTION.md](CLIENT-PROOF-COLLECTION.md) | Proof-record schema, evidence questions, collection order, approval request. | Process template; completed client approvals are not attached. |
| [CONVERSION-MEASUREMENT.md](CONVERSION-MEASUREMENT.md) | Consent boundary, funnel, reliability view, lead-loop test, experiment queue. | External property/event receipt and current baselines are not attached. |
| [SEARCH-ACQUISITION-RUNBOOK.md](SEARCH-ACQUISITION-RUNBOOK.md) | Search Console, Business Profile, and monthly acquisition work. | Authenticated actions and current external evidence require owner access. |
| [SESSION-2026-07-20-AUDIT-CONVERSION-LAYOUT-CLOSEOUT.md](SESSION-2026-07-20-AUDIT-CONVERSION-LAYOUT-CLOSEOUT.md) | Exact evidence for the earlier `fb61c52` release and that session’s changes. | Historical point-in-time evidence; the Quality Spine application baseline is `d02b935`. |
| [HANDOFF.md](HANDOFF.md) | Historical project handoff context. | Treat as a snapshot and verify against current source. |
| [app/src/data/route-meta.json](app/src/data/route-meta.json) | Generated route inventory used for the 200/73/72 baseline above. | Generated artifact; regenerate after content/route changes. |
| [.lifi/quality.yml](.lifi/quality.yml) | Quality charter, applicability, commands, evidence and maintenance policy. | Local and production release evidence passed; external delivery gates remain open. |
| [.lifi/debt-and-exceptions.yml](.lifi/debt-and-exceptions.yml) | Debt and exception ledger. | Maintain with every approved exception or retired debt item. |
| [.lifi/dead-code-candidates.yml](.lifi/dead-code-candidates.yml) | Reachability/deletion-candidate governance. | A candidate record is not deletion authority. |
| [.nvmrc](.nvmrc) | Node 24 runtime pin. | CI/Netlify runtime must be checked against it. |
| [app/playwright.config.ts](app/playwright.config.ts) / [app/tests/quality-smoke.spec.ts](app/tests/quality-smoke.spec.ts) | Four-project browser, axe, interaction, mobile lifecycle, and indexed-route H1 parity suite. | `quality:release` passed under Node 24.18.0 with 32/32 browser checks; live and mobile smoke also passed for `d02b935`. |
| [app/package.json](app/package.json) | Build, audit, browser, and five Quality Spine command lanes. | The clean local release lane passed; repeat it for every changed candidate. |

## 11. Owner and external evidence needed

### Decision rights and resources

- Executive sponsor and final launch approver.
- Day-to-day owner and consolidated-feedback owner.
- Business-fact, offer/pricing, brand/creative, privacy/legal, accessibility, technical, analytics/search/listing, content/asset, and client-proof approvers.
- Little Fight implementation owner and independent verifier.
- Response deadlines, escalation route, and the consequence of a missed review.
- Approved ambition tier, amount/currency, production capacity, schedule, contingency, and maintenance tier.

### Audience and service evidence

- Three to five first-party conversations with intended owner/operators or successors, including people who are wary of technical change.
- Three comparable prototype sessions across Directions A, B, and C.
- Current form destination, notification owner, service schedule, response logs or operating proof, escalation, missed-lead recovery, urgent/on-site capacity, and support boundaries.
- Plain-language scope, proposal, ownership/handoff, change-control, cancellation, and support artifacts.

### Claims, assets, and rights

- Written approval and operational terms for every offer/SLA claim in Section 8.
- Per-client proof records and publication permission for names, logos, quotes, screenshots, metrics, outcomes, and timelines.
- Source/rights records for photography, video, illustration, fonts, audio, and generated assets.
- Human language review for Spanish and Chinese routes and every critical conversion state.

### Production and external systems

- Retain `d02b935` release approval, Netlify deploy
  `6a642637809f6e0008ac8831`, ready status, live-verification evidence, and
  rollback point; repeat the record for every future authorized release.
- Controlled production form capture and inbox receipt.
- GA4/Clarity configuration and event receipt; current raw baselines; consent proof.
- Search Console, Bing, Business Profile, social profile, and social-preview evidence.
- Domain, DNS, certificate, email, form notification, analytics, and third-party account owners plus renewal dates.
- Security/incident contact, access succession, backups where applicable, restore evidence, debt/exception register, and sunset plan.

## 12. Exact next sequence

1. **Hold the verified release:** use `d02b935` as the released application
   baseline and `df7c90d` as the previous rollback point. Read live
   `/release.json` before quoting the current deployment SHA.
2. **Close `E0`:** assign decision rights, ambition, capacity, review deadlines, independent verification, authority boundary, and release approver.
3. **Maintain the installed Quality Spine:** the clean revision-bound release
   tier is green under Node 24. Repeat it on every changed candidate and keep
   live verification tied to the exact deployed SHA.
4. **Build the evidence layer:** claims ledger, offer decisions, client proof/permission records, asset rights, baseline limitations, and current search/market intent evidence.
5. **Prove the service:** complete the controlled form-delivery test, name backstage owners, and approve response, recovery, scope, handoff, support, and lifecycle behavior.
6. **Research before choosing:** run 3–5 audience conversations and three comparable prototype sessions. Record what changes and what is rejected.
7. **Pass `E1`, `E2`, and `E3`:** select and sign the Experience Constitution only after evidence; commit the production scope, funding, asset plan, schedule, capacity, rights, contingency, and care tier.
8. **Implement the approved gaps site-wide:** content/IA, proof density, route hierarchy, imagery, one signature interaction, Lab access, schema/crawler policy, responsive states, static/reduced-motion behavior, and social identity.
9. **Pass `E4`:** verify analytics/consent/event receipt, baselines, guardrails, experiment register, and decision owner before approving one exact release candidate.
10. **Verify future releases only with explicit authority:** run full independent accessibility, performance, browser, form, metadata, social, security, and release checks; obtain new production authorization; push the approved commit to `main`; verify the new ready auto-deploy SHA and controlled lead delivery.
11. **Pass `E5`:** complete 24–72-hour stabilization, the 7/28/90-day learning reviews, funded care/incident/renewal/rights cadences, transfer/succession, debt handling, and sunset ownership.

Until those gates pass, the safe status is:

> **QUALITY SPINE APPLICATION RELEASE `d02b935` IS VERIFIED READY AND LIVE. REVISION-MATCHED LOCAL, ROUTE, ASSET, AND MOBILE CHECKS PASSED. FORM/PROVIDER DELIVERY AND THE REMAINING REINVENTION DIRECTIONS ARE STILL OPEN GATES.**

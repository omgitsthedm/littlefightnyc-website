# Service-Business Netlify Tool

## Product Thesis

Build an internal tool that accepts structured service-business inputs, validates them against a normalized schema, generates a decision-ready website brief in JSON and Markdown, renders a deployable mockup from preset templates, and publishes a Netlify review URL for internal approval.

The product is intentionally narrow in v1:

- Target customers: local service businesses, professional services, clinics and wellness practices, home services, agencies and studios, legal/accounting/advisory firms, hospitality groups with service-led conversion, and multi-location or franchise-style service brands.
- Excluded from v1: pure ecommerce, marketplaces, complex SaaS products, and media-heavy brands.
- Primary outcome: reduce time from intake to reviewable website concept from days to under 30 minutes.

## Decisions

| Area | Decision |
| --- | --- |
| Market | Service-business only in v1, with preset-specific content and conversion models. |
| Core outputs | 1 normalized JSON brief, 1 Markdown brief, 1 deployable static mockup, 1 Netlify review URL. |
| Presets | `local-service`, `professional-service`, `clinic-wellness`, `multi-location-service`. |
| Conversion models | `lead_form`, `booking`, `phone_call`. Each project has one primary conversion model and one optional secondary CTA. |
| Mockup engine | Static Astro site generated from structured content and design tokens. |
| Internal app | Next.js + TypeScript admin app hosted on Netlify. |
| Validation | JSON Schema 2020-12 + AJV. Validation runs on submit and before generation/deploy. |
| Deployment method | Netlify site creation plus ZIP deploy of built static output. Use the site URL as the rolling preview URL and store immutable deploy permalinks per revision. |
| Git integration | Optional phase 2 only. Do not block v1 on repository creation or Git-connected builds. |
| Asset storage | Object storage for uploads and generated artifacts. Store references in the brief; do not embed binaries. |
| Secrets | Store secrets outside the normalized brief. The brief references secret IDs only. |
| Review model | Internal review happens against the live Netlify preview site and the generated Markdown brief. |

## Why This Deployment Model

Netlify supports preview workflows for pull requests, branches, and AI-powered generators. For this tool, the cleanest v1 path is still the Build API flow that Netlify recommends for AI-driven deployments: create a site, upload built output as a ZIP deploy, and treat the site URL plus deploy permalink as the review surface. That keeps the system deterministic and avoids blocking on repository provisioning.

The v1 deployment flow is:

1. Create or reuse a Netlify site under the internal team.
2. Build the mockup inside the tool pipeline.
3. Upload the built static output as a ZIP deploy.
4. Surface the site URL as the current preview URL.
5. Persist the deploy permalink as the immutable review artifact for that revision.

That gives the team a reviewable Netlify URL without forcing Git-backed deployment orchestration on day one.

## Users

- Intake strategist: fills the form, uploads brand assets, and kicks off generation.
- Creative reviewer: reviews the brief and mockup, requests revisions, and approves direction.
- Delivery engineer: optionally exports the approved brief and mockup into a production project later.

## User Workflow

### 1. Start Project

- Choose a preset.
- Enter business basics.
- Attach available assets.
- Select the primary conversion model.

### 2. Complete Structured Intake

The form is split into these sections:

1. Business basics
2. Conversion model
3. Proof
4. Brand
5. Content
6. Compliance
7. Technical
8. Deployment

### 3. Validate

Validation happens in three layers:

- Schema validation: required fields, formats, enums, relationships.
- Business-rule validation: regulated-industry requirements, location completeness, CTA routing completeness.
- Generator-readiness validation: enough content exists to render every required page and CTA block.

### 4. Generate Brief

The tool creates:

- `brief.json`: normalized machine-readable source of truth.
- `brief.md`: internal review document with sections, missing-input notes, and implementation instructions.

### 5. Generate Mockup

The generator maps the brief into:

- preset layout
- design token set
- page list
- CTA logic
- proof modules
- compliance/footer content

### 6. Deploy Preview

- Build the static site.
- Create or update the Netlify site.
- Upload a ZIP deploy.
- Poll until the deploy is live.
- Save `site_url`, `deploy_url`, `deploy_id`, and `revision`.

### 7. Review and Revise

- Reviewer opens the Markdown brief and Netlify preview URL.
- Feedback is logged against the project revision.
- Revised briefs generate a new deploy and retain previous immutable deploy links.

### 8. Approve or Export

Approval options:

- approve brief only
- approve mockup only
- approve both
- export package for production handoff

## Functional Requirements

### Intake Form

- Must support preset-based defaults.
- Must support draft save and resume.
- Must support file uploads for logos, imagery, and documents.
- Must distinguish required, optional, and conditional fields.
- Must show validation errors inline and by section.

### Brief Generator

- Must output JSON and Markdown from the same normalized source.
- Must flag placeholders and missing optional content clearly.
- Must rewrite inputs into implementation-ready language without changing factual meaning.
- Must preserve uploaded asset references and source attribution for testimonials, stats, and certifications.

### Mockup Generator

- Must produce a complete static site from the normalized brief.
- Must support homepage-first and multi-page service-business structures.
- Must include local SEO blocks, proof sections, contact paths, and legal pages.
- Must support multi-location routing when location count is greater than 1.
- Must not invent regulated claims, outcomes, or certifications.

### Netlify Deployment

- Must support one internal team slug as the default deployment target.
- Must create deterministic site names from company slug plus project ID.
- Must support update-in-place redeploys for the same project.
- Must keep the latest site URL stable for reviewers.
- Must record immutable deploy permalinks per revision.
- Must support site-scoped environment variable injection by reference.

### Review

- Must expose project status: `draft`, `validated`, `generated`, `deployed`, `needs_revision`, `approved`, `archived`.
- Must retain revision history for briefs and deploys.
- Must allow reviewers to mark issues by page or section.

### QA

- Must run basic automated checks before a deploy is marked ready:
  - schema valid
  - required pages rendered
  - no broken internal links
  - robots and sitemap present
  - legal pages present when required
  - Lighthouse-style thresholds for accessibility and performance on homepage

## Preset Definitions

### `local-service`

- Single location or service-area business.
- Homepage plus services, about, FAQ, contact, privacy, terms.
- Strong call/quote/booking emphasis.

### `professional-service`

- Trust and credibility dominant.
- Homepage plus services, about, case studies, FAQ, contact, privacy, terms.
- More proof density, less visual merchandising.

### `clinic-wellness`

- Booking or consultation first.
- Strong compliance/disclaimer support.
- Homepage plus services, practitioner/about, FAQ, contact, privacy, terms.

### `multi-location-service`

- Homepage plus services, locations index, location detail pages, FAQ, contact, privacy, terms.
- Location-specific SEO and CTA routing.

## Normalized Data Model

Core entities:

- `project`: metadata, ownership, preset, status, revision.
- `brief`: normalized content and requirements.
- `asset`: uploaded or generated asset with storage reference.
- `deploy`: Netlify site/deploy metadata for each revision.
- `feedback`: reviewer comments tied to a revision and page/section.

Suggested tables:

- `projects`
- `project_revisions`
- `assets`
- `deployments`
- `feedback_items`
- `audit_runs`

## Architecture

The recommended implementation is a monorepo with separate packages for the schema, validator, generator, renderer, and Netlify deployment client.

### Monorepo Layout

```text
apps/
  admin/                  # Next.js internal tool
packages/
  brief-schema/           # JSON Schema + generated TS types
  brief-validator/        # AJV rules + business-rule checks
  brief-generator/        # JSON -> Markdown brief pipeline
  mockup-renderer/        # Brief -> Astro site input
  site-template/          # Astro template and preset blocks
  netlify-client/         # Site creation, env vars, deploy polling
  qa/                     # Link checks, sitemap/robots, perf smoke tests
```

### Runtime Flow

1. User submits or updates a project in `apps/admin`.
2. `brief-validator` runs schema and business-rule validation.
3. `brief-generator` emits JSON and Markdown artifacts.
4. `mockup-renderer` transforms the brief into template data.
5. `site-template` builds a static site.
6. `netlify-client` creates or updates the site and publishes the ZIP deploy.
7. `qa` runs smoke checks against the preview URL.
8. Status updates and artifacts are saved back to the database.

### Recommended Stack

- UI/admin app: Next.js, React, TypeScript
- Validation: JSON Schema 2020-12, AJV
- Static mockups: Astro
- Database: Postgres
- Object storage: S3-compatible bucket
- Job runner: queue-backed worker for build/deploy jobs
- Auth: Google Workspace SSO or equivalent domain-restricted auth

## Internal UI Direction

The internal product should feel showpiece-worthy. The target visual language is a modern neo-terminal interface with old-school matrix influence, branded for Little Fight NYC, but without falling into parody.

Design rules:

- Dark, high-contrast base with Little Fight NYC orange as the lead accent, muted steel grays, and selective bright highlights.
- Terminal-inspired surfaces, grids, status rails, and command-line motifs paired with polished spacing, strong hierarchy, and modern motion.
- Typography should mix a sharp monospace display face with a complementary sans serif for readability.
- Use subtle scanlines, noise, glow, and data-panel framing as atmospheric details, not as decoration on every element.
- Forms should feel tactile and cinematic: progressive sections, live validation, animated status states, and clear completion momentum.
- The preview/deploy flow should feel impressive in demos: split-view brief plus live preview, deploy logs, revision timeline, and strong visual feedback.
- Avoid generic dashboard styling, default SaaS cards, and cliché hacker visuals.

## Content and Design System Rules

- Templates are modular, not freeform.
- Each preset owns its required page set and approved section inventory.
- Each brief maps to design tokens instead of arbitrary styling.
- Brand uploads can influence color, typography preference, image treatment, and icon style, but they do not change the structural block system.
- The generator can soften or omit empty modules; it cannot fabricate social proof or compliance claims.

## Input Rules

- One primary conversion goal per project.
- At least one location for every project.
- At least one service category and one service detail item.
- Regulated presets require disclaimers before deploy approval.
- Multi-location projects require a locations index page and location detail pages.
- `lead_form` projects require at least one active form definition.
- `booking` projects require booking URL or scheduling integration metadata.
- `phone_call` projects require a public phone number and click-to-call CTA.

## Output Contract

Every successful generation creates:

- `/artifacts/<project-id>/<revision>/brief.json`
- `/artifacts/<project-id>/<revision>/brief.md`
- `/artifacts/<project-id>/<revision>/site.zip`
- deployment metadata with preview URL and deploy permalink

## Implementation Plan

### Phase 1: Schema and Presets

Deliverables:

- finalized JSON Schema
- preset registry
- section-level validation rules
- initial admin form scaffolding

Exit criteria:

- a strategist can complete intake for all four presets
- validation catches missing CTA routing, missing pages, and missing regulated disclaimers

### Phase 2: Brief Generation

Deliverables:

- normalized JSON artifact
- Markdown brief renderer
- revisioning model

Exit criteria:

- one form submission reliably generates both artifacts
- reviewers can read the brief without raw intake noise

### Phase 3: Mockup Rendering

Deliverables:

- Astro site template
- preset-specific block library
- design token mapping from brief data

Exit criteria:

- each preset generates a valid static site
- multi-location routing works
- proof and CTA modules render conditionally

### Phase 4: Netlify Deploy Pipeline

Deliverables:

- site create/update logic
- ZIP deploy upload
- deploy polling and status sync
- preview URL persistence

Exit criteria:

- a validated project produces a stable preview URL and immutable deploy permalink
- failed deploys surface actionable errors back to the admin app

### Phase 5: Review and QA

Deliverables:

- reviewer status workflow
- revision comments
- smoke checks
- approval/export flow

Exit criteria:

- reviewers can approve or request revisions without leaving the tool
- broken-link and required-page checks block approval

## Milestones

| Week | Goal |
| --- | --- |
| 1 | Schema, presets, admin IA |
| 2 | Validation engine and draft-save flow |
| 3 | JSON and Markdown brief generation |
| 4 | Astro mockup renderer and preset pages |
| 5 | Netlify deployment pipeline and deploy status handling |
| 6 | QA checks, review workflow, and production hardening |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Intake quality is too inconsistent | Make more fields structured and conditional; reduce freeform text. |
| Mockups feel generic | Use preset-specific layouts, token systems, and block rules instead of open-ended generation. |
| Regulated industries create compliance risk | Force disclaimers, preserve source material, and require reviewer approval before export. |
| Netlify preview management becomes messy | Keep one stable site per project, persist immutable deploy URLs, and avoid Git-backed preview complexity in v1. |
| Asset uploads become disorganized | Store every upload with typed metadata and link assets into the normalized brief by ID. |

## Success Metrics

- Median time from intake start to live preview under 30 minutes
- First-pass validation success above 80% after onboarding
- Reviewer approval within 2 revision cycles for at least 70% of projects
- Fewer than 5% deploy failures caused by incomplete input after validation passes

## Non-Goals

- Ecommerce carts, product catalogs, and checkout
- Marketplace listing flows
- App-style SaaS onboarding or dashboard UI generation
- Fully custom visual systems generated from scratch per brand
- Production CMS integration in v1

## Immediate Next Build Order

1. Implement the schema and preset registry.
2. Build the admin intake UI against the schema.
3. Generate JSON and Markdown briefs.
4. Build the Astro renderer for the four presets.
5. Add the Netlify deploy client and preview status handling.
6. Add review workflow and QA gates.

# Project AGENTS

## Source Of Truth

Last verified: 2026-05-12 by Codex.

This folder is the current local source of truth for `https://littlefightnyc.com`:

`/Users/davidmarsh/Desktop/LiFi NYC/Brand/Website/littlefightnyc-website`

Current production work happens in the React/Vite app under `app/`. Netlify uses root `netlify.toml`, runs `cd app && npm ci && npm run build`, and publishes `app/dist`.

Netlify project:
- Site name: `littlefightnyc`
- Site ID: `0907d8fe-7018-48db-a6be-1f906e4b2619`
- Current production deploy ID verified on 2026-05-12: `6a02b70bc2dc6fac47dcc643`

Important: GitHub `main` is not guaranteed to match the current live site. The live deploy was made through the Netlify API/manual deploy path, and the local `little-fight-overhaul` branch has dirty/untracked recovered source. Do not reset, clean, or overwrite that working tree unless David explicitly asks.

See `SOURCE_OF_TRUTH.md` before major edits.

## Design Context

### Users
Little Fight NYC serves small business owners and operators, especially in New York City. They are often juggling customers, staff, vendors, and broken systems at the same time. They come to the site to understand quickly whether Little Fight can solve messy real-world problems across websites, Wi-Fi, payments, devices, search visibility, and daily operations.

There are two main user states:
- urgent owners who need help fast and want to feel reassured that a kind, competent human can step in
- evaluating owners who are deciding whether Little Fight is premium enough to trust with their website, systems, and ongoing support

The blog also serves curious operators, founders, and neighborhood business owners who want practical insight without marketing fluff. Their job is to make better decisions fast and feel more confident about the technology that affects revenue, reputation, and daily stress.

### Brand Personality
Playful, tactile, premium.

The voice should feel warm, street-smart, insightful, and human. It should feel like a sharp local partner who understands New York small business reality, not a distant agency or sterile software company. The emotional goals are trust, relief, curiosity, momentum, and calm competence.

### Aesthetic Direction
The visual direction should feel like playful tactile NYC with premium restraint. The homepage should sell capability and energy with darker, more immersive surfaces. The editorial and service routes can shift lighter and brighter when readability and scanning matter more than drama.

The blog should feel like a hybrid of a field guide and an editorial publication: insightful, practical, and memorable. It should not look like generic SaaS, Apple-clean minimalism, dark neon gamer UI, or a startup agency template.

Brand anchors that should stay intact:
- Bright orange as the lead brand signal
- Blue support tones for contrast, links, and readable accents
- Lexend for primary type
- Caveat as a selective accent voice
- Static-first HTML, CSS, and JavaScript with Netlify delivery
- WCAG-aware contrast, responsive intent, and reduced-motion respect
- Performance and polish should coexist; motion is welcome when it helps clarity or delight

### Design Principles
1. Make every page prove competence quickly: what Little Fight does, who it helps, why it is trustworthy, and what to do next should be obvious fast.
2. Keep the brand human and neighborhood-aware: tactile, lively, and slightly playful, but never sloppy, childish, or salesy.
3. Use contrast in mode and pacing: immersive dark moments for proof and atmosphere, clearer lighter moments where reading and decision-making take over.
4. Prefer concrete proof, examples, and operational clarity over strategy jargon, explanation blocks, or generic feature scaffolding.
5. Motion should feel purposeful and premium: smooth, helpful, and optional, never noisy or gimmicky.
6. Design responsively with intent: desktop expansive, tablet composed, mobile tactile, readable, and fast.

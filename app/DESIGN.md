---
version: "littlefight-axiom-momentum-2026-07-23"
name: "Little Fight NYC — Axiom Momentum"
description: "The Little Fight NYC design system: near-black ground, Oswald poster headings, Barlow body, one orange lead signal, blue as a supporting accent, fluid responsive primitives, 32px card language, and restrained motion. Source of truth for tokens lives in src/styles/editorial/tokens.css."
mode: dark
colors:
  primary: "#F97316"      # orange — the lead signal (--lf-fight)
  hover: "oklch(0.752 0.185 48)"   # OKLCH ramp (--lf-fight-hover; --lf-ember retired 2026-07-18)
  accent: "#3B82F6"       # blue — the real second signal (--lf-blue)
  accent-soft: "#60A5FA"  # lighter blue (--lf-blue-soft)
  background: "#050507"   # primary ground (--lf-ink)
  surface: "#1A1C23"      # elevated cards/panels (--lf-paper)
  surface-2: "#12141A"    # recessed surface (--lf-paper-2)
  border: "#27272A"       # rules, dividers (--lf-hairline)
  text-primary: "#FFFFFF" # (--lf-bone)
  text-secondary: "#A1A1AA" # (--lf-bone-soft)
  text-tertiary: "#8A8A94"  # captions, marginalia (--lf-bone-dim)
typography:
  display: "Oswald"       # Boxing Poster v7 (2026-07-15) — weight 700, 0 tracking (--lf-heading)
  body: "Barlow"          # 400/500/600 (--lf-body); JetBrains Mono for labels
  label: "JetBrains Mono" # 500, uppercase, 0.08em (--lf-mono)
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "clamp(64px, 8vw, 128px)"  # --lf-section-space
radius:
  sm: "12px"
  control: "32px"
  card: "32px"
  pill: "9999px"
motion:
  signal: "180ms"           # decisive state feedback (--m-signal-ms)
  settle: "320ms"           # ordinary transitions (--m-settle-ms)
  ease-standard: "cubic-bezier(0.22, 0.61, 0.36, 1)"
  ease-out: "cubic-bezier(0.22, 1, 0.36, 1)"
---

# Little Fight NYC — Axiom Momentum

Evolved 2026-07-06 from the editorial v5 ("Elevate") system to a **product-OS soul**,
seeded from the Axiom "Momentum" design system and reconciled with the Little Fight brand.

## Overview

Right-sized tech for New York's owner-operated shops, presented as one calm operating
system. The look is product-OS, not marketing-brochure: near-black ground, Oswald poster
headings over readable Barlow body, a single orange lead signal, blue as a supporting accent, generously
rounded (32px) surface cards, and restrained motion.

## Commercial hierarchy

The visual system must make the business ladder visible, not flatten it into four equal
services. Custom local websites are the acquisition front door. Urgent remote or on-site
support is the second path. Consulting is always free and removes uncertainty before paid
work. Focused custom software is the premium destination when a small business should own
the tool instead of renting another bloated platform. Do not publish base website pricing
or support rates without an explicit business decision.

On marketing pages, show shipped website proof immediately after the hero, keep the website
action visually dominant, preserve a direct urgent-help path, and disclose owned software as
the higher-value continuation. The customer-facing phrase is **software you own**; the stable
route remains `/services/business-systems/`.

**Tokens are the source of truth** — shared color, type, spacing, radius, control, layout,
and motion values live in `src/styles/editorial/tokens.css` under `.lf-editorial`.
Components consume semantic variables instead of repeating foundation values. Canvas-only
instrument physics may stay local when it has no DOM equivalent.

## Colors

Anchor in primary `#F97316` (orange lead), accent `#3B82F6` (blue), background `#050507`,
surface `#1A1C23`, text-primary `#FFFFFF`, text-secondary `#A1A1AA`. Roles stay distinct so
contrast holds (white on `#050507` and muted `#A1A1AA` both clear WCAG AA). Orange leads;
blue supports (labels, one CTA surface, accents) and must never out-shout the orange.

## Typography

**Oswald** carries headings and prominent names at weight `700` through
`--lf-heading`. **Barlow** carries body, lists, controls, and italic emphasis through
`--lf-body`. Labels and technical metadata use **JetBrains Mono**, uppercase, `0.08em`
tracking. `--lf-serif`, `--lf-display`, and `--lf-sans` are compatibility aliases only;
new work uses the semantic tokens.

## Layout

Deliberate spacing sits on an 8px base with a `1440px` maximum shell.
`--lf-page-gutter` flows from `20px` to `64px`; `--lf-section-space` flows from
`64px` to `128px`; readable copy defaults to `--lf-measure-reading` (`68ch`).

The canonical viewport bands are compact below `48rem`, composed from `48rem` to
`79.99rem`, and expansive at `80rem` and above. Use `.lf-container` for the fluid,
safe-area-aware page shell and `.lf-shell-grid` for new 4/8/12-column layouts. Components
that can appear in more than one shell should respond to their own width: wrap the boundary
in `.lf-cq` and put `.lf-cq-grid` on its child. Existing pages migrate opportunistically;
do not rewrite route markup just to adopt a helper.

## Components

- **Cards / bento tiles** — `--lf-paper` surface, `1px` `--lf-hairline` border, `32px`
  radius (`--lf-radius-card`). Hover lifts `-4px` with an orange-tinted border/background
  over `--m-signal-ms`. `.lf-surface` is the shared opt-in primitive.
- **Buttons / CTAs** — pill radius (`9999px`), orange fill on the primary action,
  `--lf-control-height` (`48px`) for ordinary controls, and a global `44px` minimum target.
  `.lf-control` supplies the shared geometry; hover uses `--lf-fight-hover`.
- **Icon chips** — `44px`, `--lf-radius-sm`, orange glyph on a 12% orange wash.
- **Labels** — `.lf-mono`, uppercase, tertiary or accent color.
- **Composition** — `.lf-stack`, `.lf-cluster`, `.lf-auto-grid`, `.lf-measure`, and
  `.lf-section` are opt-in layout primitives in `src/styles/editorial/primitives.css`.

## Motion

Snappy and restrained. Ordinary state feedback uses the named `signal` (`180ms`) and
`settle` (`320ms`) intents from `--m-*`; route transitions and tactile feedback consume the
same vocabulary. `src/kernel/motion.ts` mirrors the five names for canvas. Sections render
complete on first paint—global scroll-gated entrances are retired. Bespoke storytelling or
instrument motion must remain transform/opacity based, have a communication job, and collapse
under `prefers-reduced-motion: reduce`.

## Guardrails

- Keep Oswald on headings and Barlow on body; do not use the legacy `--lf-serif` name in new work.
- Do not let blue rival orange — orange is the single lead signal.
- Keep cards on the 32px radius language; editorial hairline rules stay sharp (`0`).
- Use semantic foundation tokens for repeated color/spacing/radius/motion values.
- Preserve a `44px` interactive target, visible keyboard focus, 16px type floor, safe-area
  insets, and wrapping for long or translated text.
- Preserve the LiFi footer line ("Designed, Hosted and Cared For by LittleFightNYC.com").

---

## The Small Craft Doctrine — distilled (2026-07-18)

The full philosophy document served its purpose and was retired once the site
embodied it. These are the standing laws it left behind; the code enforces most
of them (kernel/, instrument.ts, motion.ts, scripts/audit-signal.mjs).

**The one line:** Fewer surfaces, deeper systems. The site practices what it
sells — not more tools, one owned system where the parts talk to each other.

**The Nine Laws**
1. One machine — all interactivity descends from the shared kernel (ForceField,
   motion.ts, instrument harness). No component invents its own physics.
2. Signal is sacred — orange means act/live/the-point, never decoration
   (ratchet-enforced). Blue is ambient only. Red = fault, green = confirmed.
3. Many → One is the house motion (MoneyLeaving is canonical).
4. Weight before flash — mass, settle, follow-through; nothing teleports.
5. No seams — complete first paint, silent enhancement, no spinners, NO SPLASH.
6. Honest instruments — anything that looks like data IS data (counts come from
   the animation itself or the page's real promises). No invented metrics.
7. One-look legibility — visually AND verbally, for a 65-year-old non-technical
   owner. Type floor 16px; body 18-20px; reading tier 20-23px; inputs ≥16px.
8. Reward, never tax — reduced-motion and low-power paths are first-class.
9. Owned, not rented — hand-built primitives, no template DNA, no widget chrome.

**Hard budgets:** complete first paint on "/" ≤400ms (never regress) · LCP ≤2s ·
CLS ≤0.02 · instruments 60fps at DPR ≤2. A feature that breaks the budget gets
simplified — never the budget.

**Refused on sight:** bento feature walls · decorative gradients/blobs · logo
walls & vanity counters · scroll-jacking · fake urgency · spinners on complete
content · cursor followers · AI faces · orange as decoration · corporate jargon
(leverage/seamless/solutions/etc.) · anything failing the one-look test.

**Mission storytelling pattern:** poster type + a living instrument (the fight
card), never parallel bullet lists.

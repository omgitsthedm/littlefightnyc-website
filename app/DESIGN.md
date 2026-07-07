---
version: "littlefight-axiom-momentum-2026-07-06"
name: "Little Fight NYC — Axiom Momentum"
description: "The Little Fight NYC design system, evolved to a product-OS soul from the Axiom 'Momentum' system. Near-black ground, Inter display, one orange lead signal, blue as a real accent, 32px card language, snappy restrained motion. Source of truth for tokens lives in src/styles/editorial/tokens.css."
mode: dark
colors:
  primary: "#F97316"      # orange — the lead signal (--lf-fight)
  ember: "#FB8B3C"        # hover / active warmth (--lf-ember)
  accent: "#3B82F6"       # blue — the real second signal (--lf-blue)
  accent-soft: "#60A5FA"  # lighter blue (--lf-blue-soft)
  background: "#050507"   # primary ground (--lf-ink)
  surface: "#1A1C23"      # elevated cards/panels (--lf-paper)
  surface-2: "#12141A"    # recessed surface (--lf-paper-2)
  border: "#27272A"       # rules, dividers (--lf-hairline)
  text-primary: "#FFFFFF" # (--lf-bone)
  text-secondary: "#A1A1AA" # (--lf-bone-soft)
  text-tertiary: "#71717A"  # captions, marginalia (--lf-bone-dim)
typography:
  display: "Inter"        # weight 700, tracking -0.03em (--lf-display)
  body: "Inter"           # 400/500/600
  label: "JetBrains Mono" # 500, uppercase, 0.08em (--lf-mono)
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "128px"  # --lf-space-10, editorial breathing
radius:
  sm: "12px"
  control: "32px"
  card: "32px"
  pill: "9999px"
motion:
  snappy: "180ms"           # hovers, bento reveals (--lf-time-snappy)
  base: "320ms"             # section transitions
  ease-standard: "cubic-bezier(0.22, 0.61, 0.36, 1)"
  ease-out: "cubic-bezier(0.22, 1, 0.36, 1)"
---

# Little Fight NYC — Axiom Momentum

Evolved 2026-07-06 from the editorial v5 ("Elevate") system to a **product-OS soul**,
seeded from the Axiom "Momentum" design system and reconciled with the Little Fight brand.

## Overview

Right-sized tech for New York's owner-operated shops, presented as one calm operating
system. The look is product-OS, not marketing-brochure: near-black ground, Inter at
display scale, a single orange lead signal, blue as a genuine second accent, generously
rounded (32px) surface cards, and restrained motion.

**Tokens are the source of truth** — every color, type, radius, and motion value lives in
`src/styles/editorial/tokens.css` under `.lf-editorial`. Components consume `var(--lf-*)`;
they never hardcode hex. Changing a token cascades site-wide.

## Colors

Anchor in primary `#F97316` (orange lead), accent `#3B82F6` (blue), background `#050507`,
surface `#1A1C23`, text-primary `#FFFFFF`, text-secondary `#A1A1AA`. Roles stay distinct so
contrast holds (white on `#050507` and muted `#A1A1AA` both clear WCAG AA). Orange leads;
blue supports (labels, one CTA surface, accents) and must never out-shout the orange.

## Typography

**Inter** carries both display and body — Fraunces was retired 2026-07-06 (removed ~80KB
from first paint). Display distinction comes from weight (`700`, `--lf-display-weight`) and
negative tracking (`-0.03em`, `--lf-display-tracking`), not a serif face. Italic emphasis
uses real Inter italic (400/600). Labels and technical metadata use **JetBrains Mono**,
uppercase, `0.08em` tracking.

## Layout

Deliberate, stable spacing on an 8px base. Max width `1440px`. Bento/feature sections use a
6-column grid that collapses to 1 column at 640px. Editorial rhythm (large `section-padding`)
is preserved — the product-OS shift is in surface + type, not density.

## Components

- **Cards / bento tiles** — `--lf-paper` surface, `1px` `--lf-hairline` border, `32px`
  radius (`--lf-radius-card`). Hover lifts `-4px` with an orange-tinted border/background
  over `--lf-time-snappy`.
- **Buttons / CTAs** — pill radius (`9999px`), orange fill on the primary action, `>=48px`
  tap target, snappy hover to `--lf-ember`.
- **Icon chips** — `44px`, `--lf-radius-sm`, orange glyph on a 12% orange wash.
- **Labels** — `.lf-mono`, uppercase, tertiary or accent color.
- Reference implementation: `src/components/editorial/MomentumSection.tsx` (the Momentum
  bento feature section on the home page).

## Motion

Snappy and restrained. Hovers and bento reveals run `180ms` (`--lf-time-snappy`) on
`--lf-ease-standard`; section entrances use scroll-reveal (`useScrollReveal`) with a per-tile
stagger (`calc(var(--i) * 70ms)`). Everything collapses instantly under
`prefers-reduced-motion: reduce`.

## Guardrails

- Do not reintroduce a serif display face; Inter is the display voice now.
- Do not let blue rival orange — orange is the single lead signal.
- Keep cards on the 32px radius language; editorial hairline rules stay sharp (`0`).
- Never hardcode color/spacing/radius in a component — add or use a token.
- Preserve the LiFi footer line ("Designed, Hosted and Cared For by LittleFightNYC.com").

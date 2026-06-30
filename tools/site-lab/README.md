# Little Fight Site Lab

This is the command center for making Little Fight NYC sharper across the whole website, not one page at a time.

It runs against the generated sitemap, captures every route at desktop/tablet/mobile, checks accessibility with axe, reads SEO and conversion signals from the DOM, analyzes screenshot energy and dark-space risk, and generates a visual contact sheet.

## Install

```bash
npm install
npx playwright install chromium
```

## Core Commands

```bash
npm run scan:live
npm run scan:local
npm run scan:smoke
npm run links
npm run backstop:write
npm run backstop:reference
npm run backstop:test
npm run unlighthouse
npm run lhci
```

## Outputs

- `reports/live/report.md` - sortable human/agent audit summary.
- `reports/live/manifest.json` - machine-readable route metrics.
- `reports/live/contact-sheet.html` - visual wall of the site at three breakpoints.
- `reports/live/screenshots/` - desktop, tablet, and mobile screenshots.
- `backstop.config.cjs` and `backstop_data/` - baseline visual regression testing.
- `reports/lhci/` - Lighthouse CI output for priority routes.
- `reports/unlighthouse/ci-result.json` - Unlighthouse budget output for priority routes.

Generated reports are ignored by Git on purpose. They are local working artifacts that can be regenerated after every design or performance pass.

## Scoring Model

The custom scanner intentionally combines mechanical and creative signals:

- **Foundation:** title, description, H1, horizontal overflow, load errors.
- **Access:** axe violations, missing image alt text, tap/call routes.
- **Conversion:** Fit Check, call, audit, or contact actions above the fold.
- **Visual power:** screenshot edge density, colorfulness, saturation, image density.
- **Dead-zone risk:** very dark, low-edge, low-color areas that can read as empty black space.

The score is not a replacement for taste. It is a triage system that tells us where to put taste first.

## Workflow

1. Run `npm run scan:live`.
2. Open `reports/live/contact-sheet.html`.
3. Fix the lowest-scoring page family, not isolated routes.
4. Run `npm run scan:live` again and compare `report.md`.
5. Promote stable screenshot baselines with Backstop before larger redesign passes.

The goal is a site that can keep becoming more cinematic, useful, fast, accessible, and locally specific without losing control of the details.

## Initial Baseline: 2026-05-12

Latest full live custom scan:

- 98 sitemap routes scanned.
- 294 screenshots captured.
- Average custom site-lab score: 87/100.
- No horizontal overflow found.
- 24 routes flagged for dark dead-zone risk.
- 16 routes flagged for low visual power.
- 122 axe violations detected across the sitemap, mostly contrast.
- Linkinator scanned 195 links successfully.
- squirrelscan scored the live site 89/B with 0 failed rules and 340 warnings.

Highest-leverage families from the first run:

- `industries`: duplicate H1s, contrast, and one weak visual route.
- `journal`: duplicate H1s on older articles, several dark/dead-zone routes.
- `glossary`: visually thin term pages.
- `fit-check`: low visual power and dark-space risk.
- `services`, `field-guide`, and `journal`: image alt text and performance pressure.

Priority performance findings:

- Lighthouse CI warnings: `/services/` 0.80, `/field-guide/` 0.80, `/fit-check/` 0.84, `/journal/read-your-monthly-software-bill/` 0.81.
- Unlighthouse priority run passed overall budget scores above 0.84 but failed the strict 80 performance category budget on the same priority routes.

Backstop baseline:

- First 40 sitemap routes are configured across desktop, tablet, and mobile.
- Backstop uses a static capture hook that disables animation and hides canvas/video so layout regression testing is stable.
- Current comparison result: 114 passed, 6 failed.
- The remaining failed captures are `home` tablet/mobile, `services` tablet/mobile, and `field-guide` desktop/mobile. Treat those as intentional instability until the moving surfaces are either made deterministic or given custom thresholds.

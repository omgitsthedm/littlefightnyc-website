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

Use `--sitemap=/path.xml` with `creative-scan.mjs` or `discover-routes.mjs`
when auditing generated, noindex, or otherwise intentionally unlisted routes.

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
- **Conversion:** Tech Audit, call, audit, or contact actions above the fold.
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

## Verified Baseline: 2026-07-20

Latest full local production scan:

- 125 sitemap routes and 375 desktop/tablet/mobile captures.
- Average custom site-lab score: 100/100 rounded.
- Zero axe violations, horizontal-overflow routes, dark dead-zone risks, or low-visual-power routes.
- The shared contact block passed a separate 12-case regression matrix on `/`, `/contact/`, and `/services/custom-local-websites/` at 390, 768, 1024, and 1440 CSS pixels.
- Priority performance tooling targets `/examples/`; `/field-guide/` remains only as a deliberate 301 redirect.

Generated evidence lives under `reports/local/` and `reports/contact-closeout/` and is intentionally ignored by Git.

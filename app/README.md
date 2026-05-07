# Little Fight NYC Scratch Rebuild

This is the May 7, 2026 React/Vite scratch rebuild branch.

It intentionally starts smaller than the current live static site:

- Home
- Services
- Fit Check
- Owner Answers
- Case Studies
- Contact

The goal is to establish a clean visual/product foundation before migrating the full SEO/AEO surface, Fit Check backend, phone conversion, schema, sitemap, and Netlify production config.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Current Principles

- Midnight blue base.
- Orange dot atmosphere.
- Plain language for local business owners.
- Visual routing before long explanations.
- No generic agency pages.
- No fake metrics.
- No dense technical service menus.
- No heavy Three/GSAP/Lenis baseline until a specific interaction earns the weight.

## Known Next Work

- Wire the Fit Check form to the existing Netlify Function or confirmed Netlify Forms flow.
- Add real SEO route generation before replacing the static production site.
- Add schema, sitemap, robots, llms, and OG image handling.
- Migrate or rebuild the answer engine and case studies.
- Add security headers and Netlify config for the app build.
- Run Lighthouse and Squirrel after a deploy preview exists.

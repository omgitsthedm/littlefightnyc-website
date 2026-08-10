# Internationalization source map

The site has two separate localization paths.

## Live standalone pages

`/es/` and `/zh/` are real Spanish and Chinese landing pages with localized copy, metadata,
canonical URLs, `hreflang`, routing, and prerendered HTML. Their page sources live outside
this folder in `app/src/pages/`.

## Optional shared UI bundles

This folder supports a future locale switcher for shared application components. It currently
contains only `locales/en/common.json`, so that generic bundle system remains English-only and
the switcher stays hidden.

- `locales.ts`: locale registry and text direction
- `config.ts`: i18next bundle discovery and document language synchronization
- `available.ts`: build-time translation availability without loading i18next
- `LanguageSwitcher.tsx`: lazy gate for the shared UI switcher

Adding `locales/<code>/common.json` registers a shared UI bundle. Components must still adopt
`useTranslation()` and keep the same keys in every bundle. Missing keys fall back to English.

Do not describe this bundle scaffold as the source of `/es/` or `/zh/`. New localized routes
still need translated page content, metadata, canonicals, `hreflang`, routing, and prerendering
equivalent to the existing standalone pages.

# Internationalization (i18n)

Little Fight NYC will eventually serve NYC's communities in **Spanish, Chinese,
Vietnamese, Japanese, Arabic, and French** (plus English). This folder wires the
**capability** to do that. **Nothing is translated yet** — every language
currently resolves to English via the fallback.

## What's set up

- **`locales.ts`** — the language registry (code, endonym, writing direction).
  Arabic is flagged `rtl`.
- **`config.ts`** — i18next runtime. Discovers locale bundles with
  `import.meta.glob`, sets English as default + fallback, and keeps
  `<html lang>` / `<html dir>` in sync on every language change (Arabic → `rtl`).
- **`locales/en/common.json`** — the English base and the key-naming pattern.
- **`available.ts`** — a build-time constant (`HAS_TRANSLATIONS`) computed from
  the glob keys, with **no** i18next in it.
- **`components/LanguageSwitcher.tsx`** — a gate mounted in the footer. It
  renders nothing (and ships no i18next) while English is the only bundle. When
  a second bundle lands, it lazy-loads **`LanguageSwitcherInner.tsx`**, which
  carries the i18n runtime.

**Zero cost until used:** because English is the only bundle today, the ~15KB
i18next runtime is **not** in the entry bundle — it loads as its own chunk only
once there's a language to switch to.

## To add a language (phase 2 — content)

1. Create `locales/<code>/common.json` mirroring `locales/en/common.json`
   (e.g. `locales/es/common.json`). The code must already be in `LOCALES`
   (all six targets already are).
2. That's it — the bundle auto-registers and the footer switcher appears.

## To translate a string in the UI (phase 2 — extraction)

Existing components still use hard-coded English. Migrate them incrementally:

```tsx
import { useTranslation } from "react-i18next";

function Example() {
  const { t } = useTranslation();
  return <button>{t("nav.planMyWebsite")}</button>; // was "Plan my website"
}
```

Add the same key to every `locales/*/common.json`. Untranslated keys fall back
to English, so partial coverage is safe to ship.

Once you wire `t()` into components that render on first paint, add
`import "./i18n/config";` to `main.tsx` so i18n initializes eagerly (at that
point translations are live, so the runtime cost is earned).

## SEO — the real multilingual work (phase 3, NOT set up here)

This is **client-side** switching. Crawlers see the English prerender, so it
does **not** by itself rank in other languages. Proper multilingual SEO needs:

- **Per-locale prerendering** — extend `scripts/prerender-seo.mjs` to emit
  `/es/...`, `/zh/...`, etc. with translated content.
- **`hreflang` alternates** + a locale-aware canonical in each page head.
- **Locale URL routing** (path prefix `/es/` or subdomain) wired into the
  router and `_redirects`.

Deliberately deferred — the runtime capability above is the foundation it builds
on.

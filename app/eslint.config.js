import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // The 19 build and audit scripts in scripts/ generate route metadata,
    // prerender every page, and enforce the quality gates — and none of them
    // were linted, because the block above only matches ts/tsx. They are
    // Node ESM, not browser code, so they get Node globals and no React rules.
    files: ['scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    // This one script drives a headless browser, so its page.evaluate()
    // callbacks legitimately reference `document`. Scoping browser globals to
    // this file keeps `document` an error everywhere else in scripts/, where
    // it would be a genuine mistake.
    files: ['scripts/generate-social-cards.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
])

/**
 * Which locale bundles actually exist on disk — computed from the glob KEYS
 * only (no `eager`, so neither the JSON nor i18next is pulled into the bundle).
 * This lets the app cheaply answer "are there any translations yet?" without
 * loading the i18n runtime. Today: `["en"]`.
 */
const bundlePaths = import.meta.glob("./locales/*/common.json");

export const AVAILABLE_LOCALE_CODES: string[] = Object.keys(bundlePaths)
  .map((p) => p.split("/")[2]) // "./locales/<code>/common.json" -> "<code>"
  .sort();

/** True once at least one non-English translation bundle has been added. */
export const HAS_TRANSLATIONS = AVAILABLE_LOCALE_CODES.length > 1;

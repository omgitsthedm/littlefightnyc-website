/**
 * The languages Little Fight NYC intends to serve to NYC's communities.
 * Only English is populated today — this is the registry the rest of the i18n
 * setup reads from. Adding a language here + a matching
 * `locales/<code>/common.json` is all it takes to light it up (see README).
 */
export type Locale = {
  /** BCP-47 code used by i18next + <html lang>. */
  code: string;
  /** Endonym — the language's name in its own script (for the switcher). */
  label: string;
  /** English name (for aria / tooling). */
  english: string;
  /** Writing direction — Arabic is rtl. */
  dir: "ltr" | "rtl";
};

export const LOCALES: Locale[] = [
  { code: "en", label: "English", english: "English", dir: "ltr" },
  { code: "es", label: "Español", english: "Spanish", dir: "ltr" },
  { code: "zh", label: "中文", english: "Chinese", dir: "ltr" },
  { code: "vi", label: "Tiếng Việt", english: "Vietnamese", dir: "ltr" },
  { code: "ja", label: "日本語", english: "Japanese", dir: "ltr" },
  { code: "ar", label: "العربية", english: "Arabic", dir: "rtl" },
  { code: "fr", label: "Français", english: "French", dir: "ltr" },
];

export const DEFAULT_LOCALE = "en";

/** Codes that render right-to-left. Drives <html dir> + layout mirroring. */
export const RTL_LOCALES = new Set(
  LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code),
);

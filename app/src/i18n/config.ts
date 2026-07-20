/**
 * i18next runtime setup. This wires the CAPABILITY to translate — it does not
 * translate anything yet. Only `locales/en/common.json` exists, so every
 * language currently resolves to English via the fallback.
 *
 * How it scales: `import.meta.glob` discovers whichever locale bundles exist at
 * build time. Drop in `locales/es/common.json` and Spanish auto-registers — no
 * change to this file. See README.md in this folder.
 *
 * SEO note: this is CLIENT-side switching. Prerendered pages stay English for
 * crawlers. Per-locale prerendering + hreflang + /es/ routing is the phase-2
 * work documented in the README; it is intentionally NOT set up here.
 */
import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, LOCALES, RTL_LOCALES } from "./locales";

// Any locale bundle that exists on disk is registered. Today: en only.
const bundles = import.meta.glob("./locales/*/common.json", { eager: true });
const resources: Resource = {};
for (const [path, mod] of Object.entries(bundles)) {
  // "./locales/<code>/common.json" -> "<code>"
  const code = path.split("/")[2];
  resources[code] = {
    common: (mod as { default: Record<string, unknown> }).default,
  };
}

void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: LOCALES.map((l) => l.code),
  defaultNS: "common",
  ns: ["common"],
  interpolation: { escapeValue: false }, // React already escapes
  returnEmptyString: false,
  // No async backend yet (bundles are eager), so Suspense would never fire —
  // disable it to keep hydration simple and avoid a fallback flash.
  react: { useSuspense: false },
});

/** Keep <html lang> + dir honest so the browser, a11y tools, and RTL layout
 *  all follow the active language (Arabic flips to rtl). */
function syncDocument(lng: string) {
  if (typeof document === "undefined") return;
  const base = lng.split("-")[0];
  document.documentElement.lang = lng;
  document.documentElement.dir = RTL_LOCALES.has(base) ? "rtl" : "ltr";
}

i18n.on("languageChanged", syncDocument);
syncDocument(i18n.language || DEFAULT_LOCALE);

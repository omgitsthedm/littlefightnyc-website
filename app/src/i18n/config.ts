/**
 * i18next runtime for the optional shared-UI locale bundles. Only
 * `locales/en/common.json` exists here, so this bundle system currently falls
 * back to English. The standalone `/es/` and `/zh/` pages use separate sources.
 *
 * How it scales: `import.meta.glob` discovers whichever locale bundles exist at
 * build time. Drop in `locales/es/common.json` and Spanish auto-registers — no
 * change to this file. See README.md in this folder.
 *
 * SEO note: adding a bundle here does not create a localized public route.
 * See README.md for the route-level requirements and existing standalone pages.
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

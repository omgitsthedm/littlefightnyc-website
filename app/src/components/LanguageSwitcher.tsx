import { lazy, Suspense } from "react";
import { HAS_TRANSLATIONS } from "@/i18n/available";

/**
 * Language picker gate. This file carries NO i18next — it just checks whether
 * any translation bundle exists (a build-time constant). English-only today, so
 * it renders nothing and the ~15KB i18n runtime is never shipped.
 *
 * The moment a second `src/i18n/locales/<code>/common.json` lands,
 * HAS_TRANSLATIONS flips true and the real switcher (which pulls in i18next)
 * loads as its own chunk. Zero cost until there's something to switch to.
 */
const LanguageSwitcherInner = lazy(() => import("./LanguageSwitcherInner"));

export default function LanguageSwitcher() {
  if (!HAS_TRANSLATIONS) return null;
  return (
    <Suspense fallback={null}>
      <LanguageSwitcherInner />
    </Suspense>
  );
}

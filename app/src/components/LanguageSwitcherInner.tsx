import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
// Importing the config here (not in main.tsx) is what keeps i18next out of the
// entry bundle — it only initializes when this lazy chunk loads, i.e. once a
// real translation exists.
import "@/i18n/config";
import { LOCALES } from "@/i18n/locales";
import "./LanguageSwitcher.css";

/** The actual switcher — only reached when >1 language bundle exists. */
export default function LanguageSwitcherInner() {
  const { i18n, t } = useTranslation();

  const available = LOCALES.filter((l) =>
    i18n.hasResourceBundle(l.code, "common"),
  );
  if (available.length < 2) return null;

  const current = i18n.language?.split("-")[0] || "en";

  return (
    <div className="lf-lang">
      <Languages
        className="lf-lang__icon"
        size={15}
        strokeWidth={2}
        aria-hidden="true"
      />
      <label className="lf-lang__label" htmlFor="lf-lang-select">
        {t("language.label")}
      </label>
      <select
        id="lf-lang-select"
        className="lf-lang__select"
        value={current}
        aria-label={t("language.choose")}
        onChange={(e) => {
          void i18n.changeLanguage(e.target.value);
        }}
      >
        {available.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

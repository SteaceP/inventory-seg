import { useCallback, use } from "react";

import { UserContext } from "./contexts/UserContextDefinition";
import en from "./locales/en";
import fr from "./locales/fr";

type Lang = "fr" | "en";

const translations: Record<Lang, Record<string, string>> = {
  fr,
  en,
};

/**
 * Custom hook for localized text and dynamic translations.
 * Automatically respects the language setting from UserContext.
 *
 * @returns {Object} t function for lookups and current language code.
 */
export function useTranslation() {
  const context = use(UserContext);
  const language = context?.language || "fr";

  /**
   * Translates a specific key using the current language.
   *
   * @param key - The translation key path.
   * @param params - Optional template variables to inject into the string.
   * @returns {string} The translated (and interpolated) string.
   */
  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number | boolean | null | undefined>
    ) => {
      let translation = translations[language || "fr"][key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          translation = translation.split(`{{${k}}}`).join(String(v));
        });
      }
      return translation;
    },
    [language]
  );
  return { t, lang: language };
}

export default translations;

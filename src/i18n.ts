import { useUserContext } from "./contexts/UserContext";
import { useCallback } from "react";

import ar from "./locales/ar";
import fr from "./locales/fr";
import en from "./locales/en";

type Lang = "fr" | "en" | "ar";

const translations: Record<Lang, Record<string, string>> = {
  ar,
  fr,
  en,
};

export function useTranslation() {
  const { language } = useUserContext();
  const t = useCallback(
    (
      key: string,
      params?: Record<string, string | number | boolean | null | undefined>
    ) => {
      let translation = translations[language || "fr"][key] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          translation = translation.replace(`{{${k}}}`, String(v));
        });
      }
      return translation;
    },
    [language]
  );
  return { t, lang: language };
}

export default translations;

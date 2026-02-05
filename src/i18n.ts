import { useCallback, use } from "react";

import { UserContext } from "./contexts/UserContext";
import en from "./locales/en";
import fr from "./locales/fr";

type Lang = "fr" | "en";

const translations: Record<Lang, Record<string, string>> = {
  fr,
  en,
};

export function useTranslation() {
  const context = use(UserContext);
  const language = context?.language || "fr";
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

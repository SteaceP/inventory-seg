import { useUserContext } from "./contexts/useUserContext";
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
    (key: string) => translations[language || "fr"][key] || key,
    [language]
  );
  return { t, lang: language };
}

export default translations;

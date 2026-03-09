import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import trCommon from "./locales/tr/common.json";

export type AppLanguage = "en" | "tr";

export const LANG_STORAGE_KEY = "macroapp.lang";

const FALLBACK_LANGUAGE: AppLanguage = "en";
const supportedLanguages: AppLanguage[] = ["en", "tr"];

function getInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return FALLBACK_LANGUAGE;

  const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (saved === "en" || saved === "tr") return saved;

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith("tr")) return "tr";
  return FALLBACK_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    tr: { common: trCommon }
  },
  lng: getInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: supportedLanguages,
  defaultNS: "common",
  interpolation: {
    escapeValue: false
  }
});

i18n.on("languageChanged", (language) => {
  if (typeof window === "undefined") return;
  const nextLanguage = language === "tr" ? "tr" : "en";
  window.localStorage.setItem(LANG_STORAGE_KEY, nextLanguage);
});

export default i18n;

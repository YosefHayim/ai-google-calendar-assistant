export type { SupportedLocale, TextDirection, I18nTranslator, TranslationSection } from "./types";

export {
  createTranslator,
  getTranslatorFromLanguageCode,
  getLocaleFromLanguageCode,
  getDirection,
  SUPPORTED_LOCALES,
  initI18n,
  initI18nSync,
  getI18nInstance,
} from "./translator";

export { LOCALE_CONFIG, DEFAULT_LOCALE, LANGUAGE_CODE_MAP, I18N_RESOURCES } from "./config";

export { en } from "./locales/en";
export { he } from "./locales/he";
export { de } from "./locales/de";
export { ar } from "./locales/ar";
export { fr } from "./locales/fr";

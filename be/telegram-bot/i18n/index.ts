export {
  DEFAULT_LOCALE,
  I18N_RESOURCES,
  LANGUAGE_CODE_MAP,
  LOCALE_CONFIG,
} from "./config"
export { ar } from "./locales/ar"
export { de } from "./locales/de"

export { en } from "./locales/en"
export { fr } from "./locales/fr"
export { he } from "./locales/he"
export { ru } from "./locales/ru"
export {
  createTranslator,
  getDirection,
  getI18nInstance,
  getLocaleFromLanguageCode,
  getTranslatorFromLanguageCode,
  initI18n,
  initI18nSync,
  SUPPORTED_LOCALES,
} from "./translator"
export type {
  I18nTranslator,
  SupportedLocale,
  TextDirection,
  TranslationSection,
} from "./types"

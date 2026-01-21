export type { SupportedLocale, TextDirection } from "./config";
export {
  DEFAULT_LOCALE,
  getDirection,
  getDisplayName,
  getLocaleFromLanguageCode,
  I18N_RESOURCES,
  LANGUAGE_CODE_MAP,
  LOCALE_CONFIG,
  SUPPORTED_LOCALES,
} from "./config";
export type { I18nTranslator } from "./translator";
export {
  createTranslator,
  getI18nInstance,
  getTranslator,
  getTranslatorFromLanguageCode,
  initI18n,
  initI18nSync,
} from "./translator";

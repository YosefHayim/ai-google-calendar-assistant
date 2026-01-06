export type {
  SupportedLocale,
  TextDirection,
  TranslatedListItem,
  TranslatedSection,
  CommandTranslations,
  AuthTranslations,
  ErrorTranslations,
  CommonTranslations,
  BotMenuTranslations,
  LocaleTranslations,
  Translator,
} from "./types"

export {
  createTranslator,
  getTranslatorFromLanguageCode,
  getLocaleFromLanguageCode,
  getDirection,
  SUPPORTED_LOCALES,
} from "./translator"

export { en } from "./locales/en"
export { he } from "./locales/he"

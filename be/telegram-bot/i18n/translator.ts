import type { LocaleTranslations, SupportedLocale, TextDirection, Translator } from "./types"
import { en } from "./locales/en"
import { he } from "./locales/he"

const LOCALES: Record<SupportedLocale, LocaleTranslations> = {
  en,
  he,
}

const RTL_LOCALES: SupportedLocale[] = ["he"]

const LANGUAGE_CODE_MAP: Record<string, SupportedLocale> = {
  en: "en",
  "en-US": "en",
  "en-GB": "en",
  he: "he",
  "he-IL": "he",
  iw: "he",
}

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "he"]

export function getLocaleFromLanguageCode(languageCode: string | undefined): SupportedLocale {
  if (!languageCode) return "en"
  return LANGUAGE_CODE_MAP[languageCode] || "en"
}

export function getDirection(locale: SupportedLocale): TextDirection {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr"
}

export function createTranslator(locale: SupportedLocale): Translator {
  const translations = LOCALES[locale] || LOCALES.en

  return {
    locale,
    direction: getDirection(locale),
    translations,
  }
}

export function getTranslatorFromLanguageCode(languageCode: string | undefined): Translator {
  const locale = getLocaleFromLanguageCode(languageCode)
  return createTranslator(locale)
}

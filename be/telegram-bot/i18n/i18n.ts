import i18next, { type i18n, type TFunction } from "i18next"
import { en } from "./locales/en"
import { he } from "./locales/he"

export type SupportedLocale = "en" | "he"
export type TextDirection = "ltr" | "rtl"

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

let i18nInstance: i18n | null = null

export async function initI18n(): Promise<i18n> {
  if (i18nInstance) {
    return i18nInstance
  }

  i18nInstance = i18next.createInstance()

  await i18nInstance.init({
    lng: "en",
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LOCALES,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
  })

  return i18nInstance
}

export function getI18nInstance(): i18n {
  if (!i18nInstance) {
    throw new Error("i18n not initialized. Call initI18n() first.")
  }
  return i18nInstance
}

export interface I18nTranslator {
  t: TFunction
  locale: SupportedLocale
  direction: TextDirection
}

export function getTranslator(locale: SupportedLocale): I18nTranslator {
  const instance = getI18nInstance()
  const t = instance.getFixedT(locale)

  return {
    t,
    locale,
    direction: getDirection(locale),
  }
}

export function getTranslatorFromLanguageCode(languageCode: string | undefined): I18nTranslator {
  const locale = getLocaleFromLanguageCode(languageCode)
  return getTranslator(locale)
}

export function createTranslator(locale: SupportedLocale): I18nTranslator {
  return getTranslator(locale)
}

export { i18next }

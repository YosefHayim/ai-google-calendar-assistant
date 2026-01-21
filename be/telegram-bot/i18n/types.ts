import type { TFunction } from "i18next"
import type { SupportedLocale, TextDirection } from "./config"

export type { SupportedLocale, TextDirection }

export type I18nTranslator = {
  t: TFunction
  locale: SupportedLocale
  direction: TextDirection
}

export type TranslationSection = {
  emoji: string
  title: string
  items: string[]
}

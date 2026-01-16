import { ar } from "./locales/ar";
import { de } from "./locales/de";
import type { TranslationKey } from "./locales/en";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { he } from "./locales/he";
import { ru } from "./locales/ru";

type TranslationResource = Record<TranslationKey, string>;

export const LOCALE_CONFIG = {
  en: {
    translation: en,
    direction: "ltr",
    languageCodes: ["en", "en-US", "en-GB"],
  },
  fr: {
    translation: fr,
    direction: "ltr",
    languageCodes: ["fr", "fr-FR"],
  },
  he: {
    translation: he,
    direction: "rtl",
    languageCodes: ["he", "he-IL", "iw"],
  },
  de: {
    translation: de,
    direction: "ltr",
    languageCodes: ["de", "de-DE"],
  },
  ar: {
    translation: ar,
    direction: "rtl",
    languageCodes: ["ar", "ar-SA"],
  },
  ru: {
    translation: ru,
    direction: "ltr",
    languageCodes: ["ru", "ru-RU"],
  },
} as const;

export type SupportedLocale = keyof typeof LOCALE_CONFIG;
export type TextDirection = "ltr" | "rtl";

export const SUPPORTED_LOCALES = Object.keys(
  LOCALE_CONFIG
) as SupportedLocale[];

export const DEFAULT_LOCALE: SupportedLocale = "en";

export const LANGUAGE_CODE_MAP: Record<string, SupportedLocale> =
  Object.entries(LOCALE_CONFIG).reduce(
    (acc, [locale, config]) => {
      for (const code of config.languageCodes) {
        acc[code] = locale as SupportedLocale;
      }
      return acc;
    },
    {} as Record<string, SupportedLocale>
  );

export const I18N_RESOURCES: Record<
  SupportedLocale,
  { translation: TranslationResource }
> = {
  en: { translation: en as TranslationResource },
  fr: { translation: fr as TranslationResource },
  he: { translation: he as TranslationResource },
  de: { translation: de as TranslationResource },
  ar: { translation: ar as TranslationResource },
  ru: { translation: ru as TranslationResource },
};

export function getDirection(locale: SupportedLocale): TextDirection {
  return LOCALE_CONFIG[locale]?.direction ?? "ltr";
}

export function getLocaleFromLanguageCode(
  languageCode: string | undefined
): SupportedLocale {
  if (!languageCode) {
    return DEFAULT_LOCALE;
  }
  return LANGUAGE_CODE_MAP[languageCode] ?? DEFAULT_LOCALE;
}

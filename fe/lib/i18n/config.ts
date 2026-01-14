import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { en } from './locales/en'
import { he } from './locales/he'
import { ru } from './locales/ru'
import { fr } from './locales/fr'
import { de } from './locales/de'
import { ar } from './locales/ar'

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
  },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    dir: 'ltr',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    dir: 'ltr',
  },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code']

export const resources = {
  en: { translation: en },
  he: { translation: he },
  ru: { translation: ru },
  fr: { translation: fr },
  de: { translation: de },
  ar: { translation: ar },
} as const

const LANGUAGE_STORAGE_KEY = 'ally-language'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

export { i18n, LANGUAGE_STORAGE_KEY }
export default i18n

import type { SupportedLanguageCode } from './i18n'

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // Israel
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',

  // Germany
  'Europe/Berlin': 'DE',

  // France
  'Europe/Paris': 'FR',

  // Russia
  'Europe/Moscow': 'RU',
  'Europe/Kaliningrad': 'RU',
  'Europe/Samara': 'RU',
  'Europe/Volgograd': 'RU',
  'Asia/Yekaterinburg': 'RU',
  'Asia/Omsk': 'RU',
  'Asia/Novosibirsk': 'RU',
  'Asia/Krasnoyarsk': 'RU',
  'Asia/Irkutsk': 'RU',
  'Asia/Yakutsk': 'RU',
  'Asia/Vladivostok': 'RU',
  'Asia/Magadan': 'RU',
  'Asia/Kamchatka': 'RU',

  // Arabic
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Baghdad': 'IQ',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/Algiers': 'DZ',
  'Africa/Tunis': 'TN',
}

const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguageCode> = {
  // Hebrew
  IL: 'he',

  // German (includes Austria, Switzerland)
  DE: 'de',
  AT: 'de',
  CH: 'de',

  // French (includes Belgium, Canada)
  FR: 'fr',
  BE: 'fr',
  CA: 'fr',

  // Russian (includes Belarus, Kazakhstan)
  RU: 'ru',
  BY: 'ru',
  KZ: 'ru',

  // Arabic
  SA: 'ar',
  AE: 'ar',
  QA: 'ar',
  KW: 'ar',
  BH: 'ar',
  IQ: 'ar',
  JO: 'ar',
  LB: 'ar',
  EG: 'ar',
  MA: 'ar',
  DZ: 'ar',
  TN: 'ar',
}

const BROWSER_LANG_TO_SUPPORTED: Record<string, SupportedLanguageCode> = {
  he: 'he',
  'he-IL': 'he',
  de: 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  fr: 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'fr-BE': 'fr',
  ru: 'ru',
  'ru-RU': 'ru',
  ar: 'ar',
  'ar-SA': 'ar',
  'ar-AE': 'ar',
  'ar-EG': 'ar',
  en: 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-AU': 'en',
  'en-CA': 'en',
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

export function getCountryFromTimezone(timezone: string): string | null {
  return TIMEZONE_TO_COUNTRY[timezone] ?? null
}

export function getLanguageForCountry(countryCode: string): SupportedLanguageCode | null {
  return COUNTRY_TO_LANGUAGE[countryCode] ?? null
}

export function getLanguageFromBrowserLang(browserLang: string): SupportedLanguageCode | null {
  if (browserLang in BROWSER_LANG_TO_SUPPORTED) {
    return BROWSER_LANG_TO_SUPPORTED[browserLang]
  }

  const baseLang = browserLang.split('-')[0]
  if (baseLang in BROWSER_LANG_TO_SUPPORTED) {
    return BROWSER_LANG_TO_SUPPORTED[baseLang]
  }

  return null
}

export function detectUserLanguage(): SupportedLanguageCode | null {
  const timezone = getUserTimezone()
  if (timezone) {
    const country = getCountryFromTimezone(timezone)
    if (country) {
      const language = getLanguageForCountry(country)
      if (language) {
        return language
      }
    }
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    const browserLanguage = getLanguageFromBrowserLang(navigator.language)
    if (browserLanguage) {
      return browserLanguage
    }

    if (navigator.languages && navigator.languages.length > 0) {
      for (const lang of navigator.languages) {
        const detectedLang = getLanguageFromBrowserLang(lang)
        if (detectedLang) {
          return detectedLang
        }
      }
    }
  }

  return null
}

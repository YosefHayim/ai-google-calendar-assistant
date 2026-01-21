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

/**
 * Detects the user's current timezone using the browser's Intl API.
 *
 * Uses Intl.DateTimeFormat().resolvedOptions().timeZone to get the system's
 * configured timezone. Falls back to empty string if detection fails.
 *
 * @returns The IANA timezone identifier (e.g., "America/New_York") or empty string on error
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return ''
  }
}

/**
 * Maps an IANA timezone identifier to its corresponding country code.
 *
 * Uses a predefined mapping of timezones to ISO 3166-1 alpha-2 country codes.
 * Returns null if the timezone is not in the mapping.
 *
 * @param timezone - The IANA timezone identifier (e.g., "Europe/Berlin")
 * @returns The ISO country code (e.g., "DE") or null if not found
 */
export function getCountryFromTimezone(timezone: string): string | null {
  return TIMEZONE_TO_COUNTRY[timezone] ?? null
}

/**
 * Maps an ISO country code to its primary supported language.
 *
 * Uses a predefined mapping of countries to their primary languages.
 * Returns null if the country is not in the mapping or not supported.
 *
 * @param countryCode - The ISO 3166-1 alpha-2 country code (e.g., "DE")
 * @returns The supported language code or null if not found
 */
export function getLanguageForCountry(countryCode: string): SupportedLanguageCode | null {
  return COUNTRY_TO_LANGUAGE[countryCode] ?? null
}

/**
 * Maps a browser language string to a supported language code.
 *
 * Handles full locale strings (e.g., "en-US") and base language codes (e.g., "en").
 * Falls back to base language if full locale is not supported.
 *
 * @param browserLang - The browser language string (e.g., "en-US", "de", "fr-CA")
 * @returns The supported language code or null if not supported
 */
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

/**
 * Detects the user's preferred language using timezone and browser settings.
 *
 * Attempts to determine language in order of preference:
 * 1. Timezone-based detection (maps timezone → country → language)
 * 2. Browser language settings (navigator.language and navigator.languages)
 *
 * Returns null if no supported language can be detected.
 *
 * @returns The detected supported language code or null
 */
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

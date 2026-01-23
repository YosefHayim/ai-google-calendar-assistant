import type { SupportedLocale } from "@/whatsapp-bot/i18n/config"

const PHONE_PREFIX_TO_LANGUAGE: Record<string, SupportedLocale> = {
  // Hebrew - Israel
  "972": "he",

  // Arabic countries
  "20": "ar", // Egypt
  "212": "ar", // Morocco
  "213": "ar", // Algeria
  "216": "ar", // Tunisia
  "218": "ar", // Libya
  "249": "ar", // Sudan
  "962": "ar", // Jordan
  "963": "ar", // Syria
  "964": "ar", // Iraq
  "965": "ar", // Kuwait
  "966": "ar", // Saudi Arabia
  "967": "ar", // Yemen
  "968": "ar", // Oman
  "970": "ar", // Palestine
  "971": "ar", // UAE
  "973": "ar", // Bahrain
  "974": "ar", // Qatar
  "961": "ar", // Lebanon

  // French
  "33": "fr", // France
  "32": "fr", // Belgium (French-speaking)
  "41": "fr", // Switzerland (French-speaking)
  "352": "fr", // Luxembourg
  "377": "fr", // Monaco

  // German
  "49": "de", // Germany
  "43": "de", // Austria
  "423": "de", // Liechtenstein

  // Russian
  "7": "ru", // Russia & Kazakhstan
  "375": "ru", // Belarus
  "380": "ru", // Ukraine (Russian widely spoken)
}

const DEFAULT_LANGUAGE: SupportedLocale = "en"

const THREE_DIGIT_PREFIX_LENGTH = "972".length
const TWO_DIGIT_PREFIX_LENGTH = "33".length
const ONE_DIGIT_PREFIX_LENGTH = "7".length

const extractCountryCode = (phoneNumber: string): string | null => {
  const digits = phoneNumber.replace(/\D/g, "")

  if (!digits) {
    return null
  }

  const threeDigitPrefix = digits.slice(0, THREE_DIGIT_PREFIX_LENGTH)
  if (PHONE_PREFIX_TO_LANGUAGE[threeDigitPrefix]) {
    return threeDigitPrefix
  }

  const twoDigitPrefix = digits.slice(0, TWO_DIGIT_PREFIX_LENGTH)
  if (PHONE_PREFIX_TO_LANGUAGE[twoDigitPrefix]) {
    return twoDigitPrefix
  }

  const oneDigitPrefix = digits.slice(0, ONE_DIGIT_PREFIX_LENGTH)
  if (PHONE_PREFIX_TO_LANGUAGE[oneDigitPrefix]) {
    return oneDigitPrefix
  }

  return null
}

export const detectLanguageFromPhone = (
  phoneNumber: string
): SupportedLocale => {
  const countryCode = extractCountryCode(phoneNumber)

  if (!countryCode) {
    return DEFAULT_LANGUAGE
  }

  return PHONE_PREFIX_TO_LANGUAGE[countryCode] || DEFAULT_LANGUAGE
}

export const hasDetectableLanguage = (phoneNumber: string): boolean => {
  const countryCode = extractCountryCode(phoneNumber)
  return countryCode !== null && countryCode in PHONE_PREFIX_TO_LANGUAGE
}

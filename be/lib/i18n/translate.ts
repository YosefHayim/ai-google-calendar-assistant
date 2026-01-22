import {
  backendTranslations,
  type SupportedBackendLanguage,
} from "./translations"

/**
 * Simple translation utility for backend API responses
 * Supports variable interpolation and fallback to English
 */
export function translate(
  key: keyof typeof backendTranslations.en,
  language: string | null | undefined,
  variables: Record<string, string | number> = {}
): string {
  const normalizedLang = (language?.toLowerCase() ||
    "en") as SupportedBackendLanguage
  const translations =
    backendTranslations[normalizedLang] || backendTranslations.en

  let message: string = translations[key] || backendTranslations.en[key]

  for (const [variable, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${variable}}}`, "g"), String(value))
  }

  return message
}

/**
 * Get the appropriate locale string for date formatting based on language
 */
export function getDateLocale(language: string | null | undefined): string {
  const normalizedLang = language?.toLowerCase() || "en"

  // Map our supported languages to Intl locale strings
  const localeMap: Record<string, string> = {
    en: "en-US",
    he: "he-IL",
    ar: "ar-SA", // Arabic (Saudi Arabia)
    fr: "fr-FR",
    de: "de-DE",
    ru: "ru-RU",
  }

  return localeMap[normalizedLang] || "en-US"
}

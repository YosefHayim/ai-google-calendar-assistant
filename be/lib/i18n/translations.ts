/**
 * Backend translations for API response messages
 * These should match the frontend translations where applicable
 */

export const backendTranslations = {
  en: {
    eventsRetrieved:
      "{{count}} events retrieved successfully from {{calendars}} calendars{{dateRange}}",
    eventsRetrievedDateRange: " from {{start}} to {{end}}",
  },
  he: {
    eventsRetrieved:
      "{{count}} אירועים נמצאו בהצלחה מ-{{calendars}} יומנים{{dateRange}}",
    eventsRetrievedDateRange: " מ-{{start}} עד {{end}}",
  },
  ar: {
    eventsRetrieved:
      "{{count}} تم العثور على الأحداث بنجاح من {{calendars}} تقاويم{{dateRange}}",
    eventsRetrievedDateRange: " من {{start}} إلى {{end}}",
  },
  fr: {
    eventsRetrieved:
      "{{count}} événements récupérés avec succès depuis {{calendars}} calendriers{{dateRange}}",
    eventsRetrievedDateRange: " du {{start}} au {{end}}",
  },
  de: {
    eventsRetrieved:
      "{{count}} Ereignisse erfolgreich von {{calendars}} Kalendern abgerufen{{dateRange}}",
    eventsRetrievedDateRange: " von {{start}} bis {{end}}",
  },
  ru: {
    eventsRetrieved:
      "{{count}} событий успешно получено из {{calendars}} календарей{{dateRange}}",
    eventsRetrievedDateRange: " с {{start}} по {{end}}",
  },
} as const

export type SupportedBackendLanguage = keyof typeof backendTranslations
export type BackendTranslations = typeof backendTranslations

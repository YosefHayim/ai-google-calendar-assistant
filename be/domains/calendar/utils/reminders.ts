import type { calendar_v3 } from "googleapis"
import { SUPABASE } from "@/config"
import {
  getPreference,
  type ReminderDefaultsPreference,
  updatePreference,
} from "@/domains/settings/services/user-preferences-service"
import { fetchCredentialsByEmail } from "@/domains/auth/utils"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init"

export type EventReminder = {
  method: "email" | "popup"
  minutes: number
}

export type EventReminders = {
  useDefault: boolean
  overrides: EventReminder[]
}

export type ReminderPreferences = {
  enabled: boolean
  defaultReminders: EventReminder[]
  useCalendarDefaults: boolean
}

/**
 * @description Retrieves a user's reminder preferences from the database.
 * Returns the user's configured default reminders and whether they prefer calendar defaults.
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<ReminderPreferences | null>} The user's reminder preferences, or null if not found.
 * @example
 * const prefs = await getUserReminderPreferences("user-uuid-123");
 * if (prefs?.enabled) {
 *   console.log("Default reminders:", prefs.defaultReminders);
 * }
 */
export async function getUserReminderPreferences(
  userId: string
): Promise<ReminderPreferences | null> {
  return getPreference<ReminderDefaultsPreference>(userId, "reminder_defaults")
}

/**
 * @description Looks up a user's ID in the database by their email address.
 * Performs case-insensitive matching on trimmed email.
 * @param {string} email - The email address to search for.
 * @returns {Promise<string | null>} The user's UUID if found, or null if not found.
 * @example
 * const userId = await getUserIdByEmail("User@Example.com");
 * if (userId) {
 *   console.log("Found user:", userId);
 * }
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await SUPABASE.from("users")
    .select("id")
    .ilike("email", email.trim().toLowerCase())
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}

/**
 * @description Retrieves the default reminders configured for a specific Google Calendar.
 * Fetches calendar metadata from Google Calendar API and extracts reminder settings.
 * @param {string} email - The user's email address for authentication.
 * @param {string} [calendarId="primary"] - The calendar ID to get reminders for.
 * @returns {Promise<{ defaultReminders: EventReminder[]; calendarName: string } | null>} Calendar reminders and name, or null if credentials not found.
 * @example
 * const result = await getCalendarDefaultReminders("user@example.com", "primary");
 * if (result) {
 *   console.log(`${result.calendarName} has ${result.defaultReminders.length} default reminders`);
 * }
 */
export async function getCalendarDefaultReminders(
  email: string,
  calendarId = "primary"
): Promise<{ defaultReminders: EventReminder[]; calendarName: string } | null> {
  const credentials = await fetchCredentialsByEmail(email)
  if (!credentials) {
    return null
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)
  const response = await calendar.calendarList.get({ calendarId })

  const entry = response.data
  return {
    defaultReminders: (entry.defaultReminders as EventReminder[]) ?? [],
    calendarName: entry.summary ?? calendarId,
  }
}

/**
 * @description Updates the default reminders for a specific Google Calendar.
 * Patches the calendar list entry with new default reminder settings.
 * @param {string} email - The user's email address for authentication.
 * @param {string} calendarId - The calendar ID to update reminders for.
 * @param {EventReminder[]} defaultReminders - Array of reminder configurations to set as defaults.
 * @returns {Promise<calendar_v3.Schema$CalendarListEntry>} The updated calendar list entry.
 * @throws {Error} Throws if user credentials are not found.
 * @example
 * const updated = await updateCalendarDefaultReminders("user@example.com", "primary", [
 *   { method: "popup", minutes: 30 },
 *   { method: "email", minutes: 1440 }
 * ]);
 */
export async function updateCalendarDefaultReminders(
  email: string,
  calendarId: string,
  defaultReminders: EventReminder[]
): Promise<calendar_v3.Schema$CalendarListEntry> {
  const credentials = await fetchCredentialsByEmail(email)
  if (!credentials) {
    throw new Error("User credentials not found")
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)
  const response = await calendar.calendarList.patch({
    calendarId,
    requestBody: { defaultReminders },
  })

  return response.data
}

/**
 * @description Updates the reminders for a specific calendar event.
 * Patches the event with new reminder settings, allowing override of calendar defaults.
 * @param {string} email - The user's email address for authentication.
 * @param {string} calendarId - The calendar ID containing the event.
 * @param {string} eventId - The ID of the event to update.
 * @param {EventReminders} reminders - The reminder configuration (useDefault flag and/or overrides).
 * @returns {Promise<calendar_v3.Schema$Event>} The updated event.
 * @throws {Error} Throws if user credentials are not found.
 * @example
 * const updated = await updateEventReminders("user@example.com", "primary", "event123", {
 *   useDefault: false,
 *   overrides: [{ method: "popup", minutes: 15 }]
 * });
 */
export async function updateEventReminders(
  email: string,
  calendarId: string,
  eventId: string,
  reminders: EventReminders
): Promise<calendar_v3.Schema$Event> {
  const credentials = await fetchCredentialsByEmail(email)
  if (!credentials) {
    throw new Error("User credentials not found")
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials)
  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: { reminders },
  })

  return response.data
}

/**
 * @description Resolves the appropriate reminders configuration for a new or updated event.
 * Prioritizes explicit reminders, then falls back to user preferences or calendar defaults.
 * @param {ReminderPreferences | null} userPreferences - The user's saved reminder preferences.
 * @param {EventReminders | null} [explicitReminders] - Optional explicit reminders for this specific event.
 * @returns {EventReminders | undefined} The resolved reminder configuration, or undefined if no reminders should be set.
 * @example
 * const reminders = resolveRemindersForEvent(userPrefs, null);
 * // If userPrefs.enabled and has defaultReminders, returns { useDefault: false, overrides: [...] }
 * // If userPrefs.useCalendarDefaults, returns { useDefault: true, overrides: [] }
 */
export function resolveRemindersForEvent(
  userPreferences: ReminderPreferences | null,
  explicitReminders?: EventReminders | null
): EventReminders | undefined {
  if (explicitReminders) {
    return explicitReminders
  }

  if (!userPreferences?.enabled) {
    return
  }

  if (userPreferences.useCalendarDefaults) {
    return { useDefault: true, overrides: [] }
  }

  if (userPreferences.defaultReminders.length > 0) {
    return {
      useDefault: false,
      overrides: userPreferences.defaultReminders,
    }
  }

  return { useDefault: true, overrides: [] }
}

/**
 * @description Saves a user's reminder preferences to the database.
 * Stores the configuration for default reminders and calendar default usage.
 * @param {string} userId - The unique identifier of the user.
 * @param {ReminderPreferences} preferences - The reminder preferences to save.
 * @returns {Promise<void>} Resolves when preferences are saved.
 * @example
 * await saveUserReminderPreferences("user-uuid-123", {
 *   enabled: true,
 *   defaultReminders: [{ method: "popup", minutes: 30 }],
 *   useCalendarDefaults: false
 * });
 */
export async function saveUserReminderPreferences(
  userId: string,
  preferences: ReminderPreferences
): Promise<void> {
  await updatePreference(userId, "reminder_defaults", preferences)
}

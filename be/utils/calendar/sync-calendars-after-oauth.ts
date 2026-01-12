import { Database } from "@/database.types"
import { SUPABASE, REDIRECT_URI, env } from "@/config"
import { google, calendar_v3 } from "googleapis"
import { logger } from "../logger"

type UserCalendarInsert = Database["public"]["Tables"]["user_calendars"]["Insert"]

/**
 * @description Synchronizes a user's Google Calendar list to the Supabase database after OAuth completion.
 * Creates a fresh OAuth client with the provided tokens, fetches all calendars, and upserts them
 * into the user_calendars table. Used during the OAuth callback flow.
 * @param {string} userId - The unique identifier of the user in the Supabase database.
 * @param {string} accessToken - The OAuth access token obtained from the authorization flow.
 * @param {string} [refreshToken] - Optional OAuth refresh token for token renewal.
 * @returns {Promise<void>} Resolves when synchronization is complete.
 * @example
 * // In OAuth callback handler:
 * await syncUserCalendarsAfterOAuth(user.id, tokens.access_token, tokens.refresh_token);
 */
export const syncUserCalendarsAfterOAuth = async (
  userId: string,
  accessToken: string,
  refreshToken?: string,
): Promise<void> => {
  try {
    const oauth2Client = new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI)

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })
    const response = await calendar.calendarList.list({ prettyPrint: true })
    const items = response.data.items || []

    if (items.length === 0) {
      logger.info(`syncUserCalendarsAfterOAuth: No calendars found for user ${userId}`)
      return
    }

    const calendarsToUpsert: UserCalendarInsert[] = items.map(
      (cal: calendar_v3.Schema$CalendarListEntry, index: number) => ({
        calendar_id: cal.id ?? "",
        calendar_name: cal.summary ?? null,
        access_role: (cal.accessRole as Database["public"]["Enums"]["calendar_access_role"]) ?? null,
        timezone: cal.timeZone ?? null,
        user_id: userId,
        is_primary: cal.primary ?? index === 0,
        background_color: cal.backgroundColor ?? null,
        foreground_color: cal.foregroundColor ?? null,
        is_visible: !cal.hidden,
      }),
    )

    const { error } = await SUPABASE.from("user_calendars").upsert(calendarsToUpsert, {
      onConflict: "user_id,calendar_id",
    })

    if (error) {
      logger.error(`syncUserCalendarsAfterOAuth: Failed to upsert calendars for user ${userId}: ${error.message}`)
      return
    }

    logger.info(`syncUserCalendarsAfterOAuth: Successfully synced ${items.length} calendars for user ${userId}`)
  } catch (error) {
    logger.error(`syncUserCalendarsAfterOAuth: Error syncing calendars for user ${userId}:`, error)
  }
}

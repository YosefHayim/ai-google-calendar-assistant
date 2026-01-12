import type { Database } from "@/database.types";
import { SUPABASE } from "@/config";
import type { calendar_v3 } from "googleapis";
import { logger } from "../logger";

type UserCalendarInsert =
  Database["public"]["Tables"]["user_calendars"]["Insert"];

/**
 * @description Ensures that a user's Google Calendar list is synchronized with the Supabase database.
 * Checks if the user already has calendars stored in the database; if not, fetches all calendars
 * from Google Calendar API and upserts them into the user_calendars table.
 * @param {calendar_v3.Calendar} calendar - An authenticated Google Calendar API client instance.
 * @param {string} userId - The unique identifier of the user in the Supabase database.
 * @returns {Promise<void>} Resolves when synchronization is complete or skipped (if calendars already exist).
 * @example
 * const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
 * await ensureCalendarsSynced(calendar, "user-uuid-123");
 */
export const ensureCalendarsSynced = async (
  calendar: calendar_v3.Calendar,
  userId: string
): Promise<void> => {
  try {
    const { count } = await SUPABASE.from("user_calendars")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (count && count > 0) {
      return;
    }

    const response = await calendar.calendarList.list({ prettyPrint: true });
    const items = response.data.items || [];

    if (items.length === 0) {
      logger.info(
        `ensureCalendarsSynced: No calendars found for user ${userId}`
      );
      return;
    }

    const calendarsToUpsert: UserCalendarInsert[] = items.map(
      (cal: calendar_v3.Schema$CalendarListEntry, index: number) => ({
        calendar_id: cal.id ?? "",
        calendar_name: cal.summary ?? null,
        access_role:
          (cal.accessRole as Database["public"]["Enums"]["calendar_access_role"]) ??
          null,
        timezone: cal.timeZone ?? null,
        user_id: userId,
        is_primary: cal.primary ?? index === 0,
        background_color: cal.backgroundColor ?? null,
        foreground_color: cal.foregroundColor ?? null,
        is_visible: !cal.hidden,
      })
    );

    const { error } = await SUPABASE.from("user_calendars").upsert(
      calendarsToUpsert,
      {
        onConflict: "user_id,calendar_id",
      }
    );

    if (error) {
      logger.error(
        `ensureCalendarsSynced: Failed to upsert calendars for user ${userId}: ${error.message}`
      );
      return;
    }

    logger.info(
      `ensureCalendarsSynced: Successfully synced ${items.length} calendars for user ${userId}`
    );
  } catch (error) {
    logger.error(
      `ensureCalendarsSynced: Error syncing calendars for user ${userId}:`,
      error
    );
  }
};

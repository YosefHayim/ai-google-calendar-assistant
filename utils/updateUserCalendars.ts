/**
 * Improved Calendar Update Utility
 *
 * Replaces updateCalendarCategories with better structure and type safety.
 * Maps Calendar domain entities to database records.
 */

import type { Tables, TablesInsert } from "@/database.types";

import { Calendar } from "@/domain/entities/Calendar";
import { SUPABASE } from "@/config/root-config";
import type { UpdateCalendarCategoriesProps } from "@/types";
import { asyncHandler } from "./asyncHandlers";

/**
 * Update user calendars from Google Calendar sync data
 *
 * @param payload - Array of calendar data from Google Calendar API
 * @param userId - User ID (required, replaces email-based lookup)
 * @returns Array of saved calendar records or false if invalid input
 */
export const updateUserCalendars = asyncHandler(
  async (payload: UpdateCalendarCategoriesProps[] | undefined, userId: string): Promise<Tables<"user_calendars">[] | false> => {
    if (!payload?.length || !userId) {
      return false;
    }

    // Map payload to Calendar entities first for validation
    const calendars = payload
      .filter((p) => p?.calendarId && p?.calendarName)
      .map((p) => {
        try {
          return new Calendar(
            p.calendarId as string,
            p.calendarName as string,
            userId,
            {
              timeZone: p.timeZoneForCalendar || "UTC",
              description: undefined,
              location: undefined,
            },
            false, // isDefault - will be set separately if needed
            (p.accessRole as "owner" | "writer" | "reader" | "freeBusyReader") || "owner"
          );
        } catch (error) {
          console.error(`Failed to create Calendar entity: ${error}`);
          return null;
        }
      })
      .filter((cal): cal is Calendar => cal !== null);

    if (!calendars.length) {
      return false;
    }

    // Convert to database format
    const rows: TablesInsert<"user_calendars">[] = calendars.map((calendar) => ({
      user_id: userId,
      calendar_id: calendar.id,
      calendar_name: calendar.name,
      access_role: calendar.accessRole,
      time_zone: calendar.settings.timeZone,
      is_primary: calendar.isDefault,
      default_reminders: payload.find((p) => p.calendarId === calendar.id)?.defaultReminders || null,
      description: calendar.settings.description || null,
      location: calendar.settings.location || null,
      background_color: calendar.settings.backgroundColor || null,
      foreground_color: calendar.settings.foregroundColor || null,
      created_at: calendar.createdAt?.toISOString() || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Upsert with conflict resolution on (user_id, calendar_id)
    const { data, error } = await SUPABASE.from("user_calendars")
      .upsert(rows, {
        onConflict: "user_id,calendar_id",
      })
      .select();

    if (error) {
      throw new Error(`Failed to update user calendars: ${error.message}`);
    }

    return data ?? false;
  }
);

/**
 * Legacy function - kept for backward compatibility
 * @deprecated Use updateUserCalendars instead
 */
export const updateCalenderCategories = asyncHandler(
  async (payload: UpdateCalendarCategoriesProps[] | undefined, email: string, userId: string | null): Promise<Tables<"calendar_categories">[] | false> => {
    if (!userId) {
      console.warn("updateCalenderCategories called without userId - using email fallback");
      // Fallback to old behavior if userId not provided
      if (!(payload?.length && email)) {
        return false;
      }

      const rows = payload
        .filter((p) => p?.calendarId)
        .map((p) => ({
          access_role: p.accessRole ?? null,
          calendar_id: p.calendarId as string,
          calendar_name: p.calendarName ?? null,
          email,
          time_zone_of_calendar: p.timeZoneForCalendar ?? null,
          default_reminders: p.defaultReminders ?? null,
          updated_at: new Date().toISOString(),
          user_id: userId,
        })) as TablesInsert<"calendar_categories">[];

      if (!rows.length) {
        return false;
      }

      const { data, error } = await SUPABASE.from("calendar_categories").upsert(rows).select();

      if (error) {
        throw error;
      }
      return data ?? false;
    }

    // If userId is provided, use new function
    const result = await updateUserCalendars(payload, userId);
    // Return in old format for compatibility
    if (!result) return false;

    return result.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      calendar_id: row.calendar_id,
      calendar_name: row.calendar_name,
      access_role: row.access_role,
      time_zone_of_calendar: row.time_zone,
      default_reminders: row.default_reminders,
      email: null, // No longer stored
      created_at: row.created_at,
      updated_at: row.updated_at,
    })) as Tables<"calendar_categories">[];
  }
);

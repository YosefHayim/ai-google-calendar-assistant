import { Database } from "@/database.types";
import { SUPABASE } from "@/config/clients/supabase";
import { calendar_v3 } from "googleapis";
import { logger } from "../logger";

// Define the specific Insert type for user_calendars table
type UserCalendarInsert = Database["public"]["Tables"]["user_calendars"]["Insert"];

export const updateUserSupabaseCalendarCategories = async (calendar: calendar_v3.Calendar, email: string, userId: string): Promise<void> => {
  const response = await calendar.calendarList.list({ prettyPrint: true });

  const items = response.data.items || [];

  if (items.length === 0) return;

  // Map to the correct object structure matching user_calendars table
  const calendarsToUpsert: UserCalendarInsert[] = items.map((cal: calendar_v3.Schema$CalendarListEntry, index: number) => {
    return {
      calendar_id: cal.id ?? "",
      calendar_name: cal.summary ?? null,
      access_role: (cal.accessRole as Database["public"]["Enums"]["calendar_access_role"]) ?? null,
      timezone: cal.timeZone ?? null,
      user_id: userId,
      is_primary: cal.primary ?? (index === 0), // First calendar is primary if not specified
      background_color: cal.backgroundColor ?? null,
      foreground_color: cal.foregroundColor ?? null,
      is_visible: !cal.hidden,
    };
  });

  const { error } = await SUPABASE.from("user_calendars").upsert(calendarsToUpsert, {
    onConflict: "user_id,calendar_id",
  });

  if (error) {
    logger.error(`Calendar: updateUserSupabaseCalendarCategories called: error: ${error.message}`);
    throw error;
  }
};

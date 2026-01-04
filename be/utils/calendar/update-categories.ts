import { Database } from "@/database.types";
import { SUPABASE } from "@/config/clients/supabase";
import { calendar_v3 } from "googleapis";
import { logger } from "../logger";

// 1. Define the specific Insert type for safety
type CalendarCategoryInsert = Database["public"]["Tables"]["calendar_categories"]["Insert"];

export const updateUserSupabaseCalendarCategories = async (calendar: calendar_v3.Calendar, email: string, userId: string): Promise<void> => {
  const response = await calendar.calendarList.list({ prettyPrint: true });

  const items = response.data.items || [];

  if (items.length === 0) return;

  // 3. Map to the correct object structure matching your Supabase Row
  const calendarsToUpsert: CalendarCategoryInsert[] = items.map((cal: calendar_v3.Schema$CalendarListEntry) => {
    return {
      calendar_id: cal.id ?? null,
      calendar_name: cal.summary ?? null,
      access_role: cal.accessRole ?? null,
      time_zone_of_calendar: cal.timeZone ?? null,
      email: email,
      user_id: userId,
      // Removed 'calendar_color_for_events' as it does not exist in your provided Row definition
    };
  });

  const { error } = await SUPABASE.from("calendar_categories").upsert(calendarsToUpsert, {
    onConflict: "calendar_id",
  });

  if (error) {
    logger.error(`Calendar: updateUserSupabaseCalendarCategories called: error: ${error.message}`);
    throw error;
  }
};

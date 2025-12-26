import { SUPABASE } from "@/config";
import type { Tables, TablesInsert } from "@/database.types";
import type { UpdateCalendarCategoriesProps } from "@/types";
import { asyncHandler } from "../http/async-handlers";

export const updateCalenderCategories = asyncHandler(
  async (payload: UpdateCalendarCategoriesProps[] | undefined, email: string, userId: string | null): Promise<Tables<"user_calendars">[] | false> => {
    if (!payload?.length || !userId) {
      return false;
    }

    const rows = payload
      .filter((p) => p?.calendarId && p?.calendarName)
      .map((p) => ({
        user_id: userId,
        calendar_id: p.calendarId as string,
        calendar_name: p.calendarName as string,
        access_role: (p.accessRole as string) || "owner",
        time_zone: p.timeZoneForCalendar || "UTC",
        is_primary: false, // Will be set separately if needed
        default_reminders: p.defaultReminders || null,
        description: null,
        location: null,
        background_color: null,
        foreground_color: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })) as TablesInsert<"user_calendars">[];

    if (!rows.length) {
      return false;
    }

    const { data, error } = await SUPABASE.from("user_calendars")
      .upsert(rows, {
        onConflict: "user_id,calendar_id",
      })
      .select();

    if (error) {
      throw error;
    }
    return data ?? false;
  }
);

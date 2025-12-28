import { SUPABASE } from "@/config/clients";
import { Tables } from "@/database.types";
import { asyncHandler } from "../http/async-handlers";
import { calendar_v3 } from "googleapis";

type Calendar = Tables<"user_calendars">["calendars"];

export const updateUserSupabaseCalendarCategories = asyncHandler(async (calendar: calendar_v3.Calendar, email: string, userId: string): Promise<void> => {
  const calendars = await calendar.calendarList.list({ prettyPrint: true })
  
  const { error } = await SUPABASE.from("calendar_categories").upsert(calendars, {
    onConflict: "calendar_id",
  });
  if (error) {
    throw error;
  }
});

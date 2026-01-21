import type { calendar_v3 } from "googleapis";
import { SUPABASE } from "@/infrastructure/supabase/supabase";
import type { Database } from "@/database.types";
import { logger } from "@/lib/logger";

type UserCalendarInsert =
  Database["public"]["Tables"]["user_calendars"]["Insert"];

const ensureUserExists = async (
  userId: string,
  email: string
): Promise<void> => {
  const { data: existingUser } = await SUPABASE.from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (existingUser) {
    return;
  }

  const { error } = await SUPABASE.from("users").insert({ id: userId, email });

  if (error) {
    if (error.code === "23505") {
      logger.warn(
        `ensureUserExists: User ${userId} or email ${email} already exists, skipping`
      );
      return;
    }
    logger.error(`ensureUserExists: Failed: ${error.message}`);
    throw error;
  }
};

export const updateUserSupabaseCalendarCategories = async (
  calendar: calendar_v3.Calendar,
  email: string,
  userId: string
): Promise<void> => {
  const response = await calendar.calendarList.list({ prettyPrint: true });
  const items = response.data.items || [];

  if (items.length === 0) {
    return;
  }

  await ensureUserExists(userId, email);

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
      `updateUserSupabaseCalendarCategories: error: ${error.message}`
    );
    throw error;
  }
};

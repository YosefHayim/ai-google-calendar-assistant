import { type calendar_v3, google } from "googleapis";
import { env, REDIRECT_URI } from "@/config/env";
import { SUPABASE } from "@/infrastructure/supabase/supabase";
import type { Database } from "@/database.types";
import { logger } from "@/lib/logger";

type UserCalendarInsert =
  Database["public"]["Tables"]["user_calendars"]["Insert"];

export const syncUserCalendarsAfterOAuth = async (
  userId: string,
  email: string,
  accessToken: string,
  refreshToken?: string
): Promise<void> => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      env.googleClientId,
      env.googleClientSecret,
      REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const response = await calendar.calendarList.list({ prettyPrint: true });
    const items = response.data.items || [];

    if (items.length === 0) {
      logger.info(
        `syncUserCalendarsAfterOAuth: No calendars found for user ${userId}`
      );
      return;
    }

    const { error: userError } = await SUPABASE.from("users").upsert(
      { id: userId, email },
      { onConflict: "id", ignoreDuplicates: true }
    );
    if (userError) {
      logger.error(
        `syncUserCalendarsAfterOAuth: Failed to ensure user exists: ${userError.message}`
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
        `syncUserCalendarsAfterOAuth: Failed to upsert calendars for user ${userId}: ${error.message}`
      );
      return;
    }

    logger.info(
      `syncUserCalendarsAfterOAuth: Successfully synced ${items.length} calendars for user ${userId}`
    );
  } catch (error) {
    logger.error(
      `syncUserCalendarsAfterOAuth: Error syncing calendars for user ${userId}:`,
      error
    );
  }
};

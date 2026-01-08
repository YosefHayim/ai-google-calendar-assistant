import type { calendar_v3 } from "googleapis";
import { SUPABASE } from "@/config";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "./init";

export interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface EventReminders {
  useDefault: boolean;
  overrides: EventReminder[];
}

export interface ReminderPreferences {
  enabled: boolean;
  defaultReminders: EventReminder[];
  useCalendarDefaults: boolean;
}

export async function getUserReminderPreferences(
  userId: string,
): Promise<ReminderPreferences | null> {
  const { data, error } = await SUPABASE.from("user_preferences")
    .select("preference_value")
    .eq("user_id", userId)
    .eq("preference_key", "reminder_defaults")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.preference_value as unknown as ReminderPreferences;
}

export async function getUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await SUPABASE.from("users")
    .select("id")
    .ilike("email", email.trim().toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

export async function getCalendarDefaultReminders(
  email: string,
  calendarId = "primary",
): Promise<{ defaultReminders: EventReminder[]; calendarName: string } | null> {
  const credentials = await fetchCredentialsByEmail(email);
  if (!credentials) return null;

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
  const response = await calendar.calendarList.get({ calendarId });

  const entry = response.data;
  return {
    defaultReminders: (entry.defaultReminders as EventReminder[]) ?? [],
    calendarName: entry.summary ?? calendarId,
  };
}

export async function updateCalendarDefaultReminders(
  email: string,
  calendarId: string,
  defaultReminders: EventReminder[],
): Promise<calendar_v3.Schema$CalendarListEntry> {
  const credentials = await fetchCredentialsByEmail(email);
  if (!credentials) {
    throw new Error("User credentials not found");
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
  const response = await calendar.calendarList.patch({
    calendarId,
    requestBody: { defaultReminders },
  });

  return response.data;
}

export async function updateEventReminders(
  email: string,
  calendarId: string,
  eventId: string,
  reminders: EventReminders,
): Promise<calendar_v3.Schema$Event> {
  const credentials = await fetchCredentialsByEmail(email);
  if (!credentials) {
    throw new Error("User credentials not found");
  }

  const calendar =
    await initUserSupabaseCalendarWithTokensAndUpdateTokens(credentials);
  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: { reminders },
  });

  return response.data;
}

export function resolveRemindersForEvent(
  userPreferences: ReminderPreferences | null,
  explicitReminders?: EventReminders | null,
): EventReminders | undefined {
  if (explicitReminders) {
    return explicitReminders;
  }

  if (!userPreferences?.enabled) {
    return undefined;
  }

  if (userPreferences.useCalendarDefaults) {
    return { useDefault: true, overrides: [] };
  }

  if (userPreferences.defaultReminders.length > 0) {
    return {
      useDefault: false,
      overrides: userPreferences.defaultReminders,
    };
  }

  return { useDefault: true, overrides: [] };
}

export async function saveUserReminderPreferences(
  userId: string,
  preferences: ReminderPreferences,
): Promise<void> {
  const preferenceValue = JSON.parse(JSON.stringify(preferences));

  const { error } = await SUPABASE.from("user_preferences").upsert(
    {
      user_id: userId,
      preference_key: "reminder_defaults",
      preference_value: preferenceValue,
      category: "assistant",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,preference_key" },
  );

  if (error) {
    throw new Error(`Failed to save reminder preferences: ${error.message}`);
  }
}

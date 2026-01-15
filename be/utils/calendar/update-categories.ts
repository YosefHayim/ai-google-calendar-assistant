import { Database } from "@/database.types"
import { SUPABASE } from "@/config/clients/supabase"
import { calendar_v3 } from "googleapis"
import { logger } from "../logger"

type UserCalendarInsert = Database["public"]["Tables"]["user_calendars"]["Insert"]

const ensureUserExists = async (userId: string, email: string): Promise<void> => {
  const { error } = await SUPABASE.from("users").upsert(
    { id: userId, email },
    { onConflict: "id", ignoreDuplicates: true }
  )
  if (error) {
    logger.error(`ensureUserExists: Failed to ensure user ${userId} exists: ${error.message}`)
    throw error
  }
}

export const updateUserSupabaseCalendarCategories = async (
  calendar: calendar_v3.Calendar,
  email: string,
  userId: string
): Promise<void> => {
  const response = await calendar.calendarList.list({ prettyPrint: true })
  const items = response.data.items || []

  if (items.length === 0) return

  await ensureUserExists(userId, email)

  const calendarsToUpsert: UserCalendarInsert[] = items.map(
    (cal: calendar_v3.Schema$CalendarListEntry, index: number) => ({
      calendar_id: cal.id ?? "",
      calendar_name: cal.summary ?? null,
      access_role: (cal.accessRole as Database["public"]["Enums"]["calendar_access_role"]) ?? null,
      timezone: cal.timeZone ?? null,
      user_id: userId,
      is_primary: cal.primary ?? (index === 0),
      background_color: cal.backgroundColor ?? null,
      foreground_color: cal.foregroundColor ?? null,
      is_visible: !cal.hidden,
    })
  )

  const { error } = await SUPABASE.from("user_calendars").upsert(calendarsToUpsert, {
    onConflict: "user_id,calendar_id",
  })

  if (error) {
    logger.error(`updateUserSupabaseCalendarCategories: error: ${error.message}`)
    throw error
  }
}

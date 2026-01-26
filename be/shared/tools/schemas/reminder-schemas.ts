import { z } from "zod"

const REMINDER_MAX_MINUTES = 40_320

export const reminderMethodSchema = z.enum(["email", "popup"], {
  description:
    "Reminder notification method: 'email' for email notification, 'popup' for browser/device popup.",
})

export const eventReminderSchema = z.object({
  method: reminderMethodSchema,
  minutes: z.coerce
    .number()
    .int()
    .min(0, "Reminder minutes must be non-negative")
    .max(
      REMINDER_MAX_MINUTES,
      `Reminder cannot be more than ${REMINDER_MAX_MINUTES} minutes (4 weeks) before event`
    ),
})

export const eventRemindersSchema = z.object({
  useDefault: z.boolean({
    description:
      "If true, use the calendar's default reminders. If false, use the overrides array.",
  }),
  overrides: z
    .array(eventReminderSchema)
    .max(5, "Maximum 5 reminder overrides allowed")
    .default([])
    .describe(
      "Custom reminders array. Required field - use empty array [] when useDefault is true, or provide up to 5 reminder objects when useDefault is false."
    ),
})

export const setEventRemindersSchema = z
  .object({
    eventId: z.coerce
      .string()
      .trim()
      .min(1, "Event ID is required.")
      .describe("The ID of the event to update reminders for."),
    calendarId: z.coerce
      .string()
      .nullable()
      .default(null)
      .transform((val) => {
        if (!val || val === "/" || val.trim() === "") {
          return null
        }
        return val.trim()
      }),
    reminders: eventRemindersSchema,
  })
  .describe(
    "Set reminders for a specific event. Can use calendar defaults or custom overrides."
  )

export const getCalendarDefaultRemindersSchema = z
  .object({
    calendarId: z.coerce
      .string()
      .default("primary")
      .describe("Calendar ID to get default reminders for."),
  })
  .describe("Get the default reminders configured for a calendar.")

export const updateCalendarDefaultRemindersSchema = z
  .object({
    calendarId: z.coerce
      .string()
      .default("primary")
      .describe("Calendar ID to update default reminders for."),
    defaultReminders: z
      .array(eventReminderSchema)
      .max(5, "Maximum 5 default reminders allowed")
      .describe("Array of default reminders to set for the calendar."),
  })
  .describe(
    "Update the default reminders for a calendar. These will be used when useDefault is true on events."
  )

export const getUserReminderPreferencesSchema = z
  .object({})
  .describe("Get the user's stored reminder preferences from Ally's brain.")

export const updateUserReminderPreferencesSchema = z
  .object({
    enabled: z
      .boolean()
      .describe(
        "Whether to automatically apply reminder preferences to new events."
      ),
    defaultReminders: z
      .array(eventReminderSchema)
      .max(5, "Maximum 5 default reminders allowed")
      .describe("User's preferred default reminders to apply to new events."),
    useCalendarDefaults: z
      .boolean()
      .default(true)
      .describe(
        "If true, use the calendar's defaults. If false, use the user's custom defaults."
      ),
  })
  .describe("Update the user's reminder preferences stored in Ally's brain.")

export type EventReminder = z.infer<typeof eventReminderSchema>
export type EventReminders = z.infer<typeof eventRemindersSchema>
export type SetEventRemindersParams = z.infer<typeof setEventRemindersSchema>
export type GetCalendarDefaultRemindersParams = z.infer<
  typeof getCalendarDefaultRemindersSchema
>
export type UpdateCalendarDefaultRemindersParams = z.infer<
  typeof updateCalendarDefaultRemindersSchema
>
export type UserReminderPreferencesParams = z.infer<
  typeof updateUserReminderPreferencesSchema
>

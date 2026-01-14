import { z } from "zod"
import { TIMEZONE } from "@/config"

export const calendarIdSchema = z.coerce
  .string({
    description:
      "The ID of the calendar. Use the calendarId from the event when updating. Falls back to 'primary' if not provided.",
  })
  .transform((val) => {
    if (!val || val === "/" || val.trim() === "") return null
    return val.trim()
  })
  .nullable()

export const requiredString = (description: string, message = "Required.") =>
  z.coerce.string({ description }).trim().min(1, { message })

export const eventTimeSchema = z
  .object({
    date: z.coerce
      .string({
        description:
          'The date in "yyyy-mm-dd" format for all-day events. Not needed if dateTime is provided.',
        invalid_type_error: 'Invalid date format. Example: "2025-07-17"',
      })
      .nullable(),
    dateTime: z.coerce
      .string({
        description:
          "RFC3339 date-time value. A timezone offset is required unless timeZone is specified.",
        invalid_type_error: `Invalid date-time format. Example: "${new Date().toISOString()}"`,
      })
      .nullable(),
    timeZone: z.coerce
      .string({
        description: `IANA Time Zone Database name, e.g. "${TIMEZONE.ASIA_JERUSALEM}"`,
        invalid_type_error: "Must be a valid IANA Time Zone Database name.",
      })
      .nullable(),
  })
  .describe("Event start or end time, with optional timezone.")

export const makeEventTime = () => eventTimeSchema

export const getEventSchema = z
  .object({
    timeMin: z.coerce
      .string({
        description: "Minimum date-time for events, RFC3339 format.",
      })
      .nullable()
      .optional(),
    timeMax: z.coerce
      .string({
        description:
          "Maximum date-time for events, RFC3339 format. IMPORTANT: Always set to limit query scope.",
      })
      .nullable()
      .optional(),
    q: z.coerce
      .string({
        description: "Free-text search query across all event fields.",
      })
      .nullable()
      .optional(),
    searchAllCalendars: z.coerce
      .boolean({
        description:
          "When true, searches ALL user calendars. Set to true when searching by name/title.",
      })
      .default(true),
    calendarId: z.coerce
      .string({
        description:
          "Specific calendar ID. Only used when searchAllCalendars is false.",
      })
      .nullable()
      .optional(),
  })
  .describe("Fetch events with optional filters. Email provided from context.")

export const insertEventSchema = z
  .object({
    calendarId: calendarIdSchema.default(null),
    summary: requiredString("Title of the event.", "Summary is required."),
    description: z.coerce
      .string({ description: "Description of the event." })
      .nullable()
      .optional(),
    location: z.coerce
      .string({ description: "Geographic location of the event." })
      .nullable()
      .optional(),
    start: eventTimeSchema,
    end: eventTimeSchema,
    addMeetLink: z.coerce
      .boolean({
        description:
          "Set to true to automatically add a Google Meet video conference link to the event. Use when user asks for a video call, meeting link, virtual meeting, or online meeting.",
      })
      .default(false),
  })
  .describe("Create a new calendar event. Email provided from context.")

const cleanEmptyToNull = (val: string | null | undefined) =>
  val === "" ? null : val

const cleanEventTime = (val: z.infer<typeof eventTimeSchema> | null) => {
  if (!val) return null
  const cleaned = {
    date: val.date === "" ? null : val.date,
    dateTime: val.dateTime === "" ? null : val.dateTime,
    timeZone: val.timeZone === "" ? null : val.timeZone,
  }
  if (!cleaned.date && !cleaned.dateTime) return null
  return cleaned
}

export const updateEventSchema = z
  .object({
    eventId: requiredString(
      "The ID of the event to update.",
      "Event ID is required.",
    ),
    calendarId: calendarIdSchema.default(null),
    summary: z.coerce
      .string({
        description:
          "New title. ONLY pass if explicitly renaming. Do NOT pass for time changes.",
      })
      .transform(cleanEmptyToNull)
      .nullable()
      .default(null),
    description: z.coerce
      .string({ description: "New description. Only pass if changing." })
      .transform(cleanEmptyToNull)
      .nullable()
      .default(null),
    location: z.coerce
      .string({ description: "New location. Only pass if changing." })
      .transform(cleanEmptyToNull)
      .nullable()
      .default(null),
    start: eventTimeSchema.transform(cleanEventTime).nullable().default(null),
    end: eventTimeSchema.transform(cleanEventTime).nullable().default(null),
    addMeetLink: z.coerce
      .boolean({
        description:
          "Set to true to add a Google Meet video conference link to an existing event. Use when user asks to add a video call, meeting link, or virtual meeting to an existing event.",
      })
      .default(false),
  })
  .describe(
    "Update event by ID. CRITICAL: Only pass fields you want to change.",
  )

export const deleteEventSchema = z
  .object({
    eventId: requiredString(
      "The ID of the event to delete.",
      "Event ID is required.",
    ),
    calendarId: calendarIdSchema,
  })
  .describe("Delete event by ID. Use calendarId from the event.")

export const checkConflictsSchema = z
  .object({
    calendarId: z.coerce.string().default("primary"),
    start: eventTimeSchema,
    end: eventTimeSchema,
  })
  .describe("Check for event conflicts in a time range.")

export const checkConflictsAllCalendarsSchema = z
  .object({
    startTime: z.coerce.string().describe("Start time in RFC3339 format."),
    endTime: z.coerce.string().describe("End time in RFC3339 format."),
    excludeEventId: z.coerce
      .string()
      .nullable()
      .optional()
      .describe("Event ID to exclude (the event being moved)."),
  })
  .describe("Check conflicts across ALL calendars.")

export const preCreateValidationSchema = z
  .object({
    summary: z.coerce.string().nullable(),
    description: z.coerce.string().nullable(),
    location: z.coerce.string().nullable(),
    start: eventTimeSchema.nullable(),
    end: eventTimeSchema.nullable(),
  })
  .describe(
    "Combined validation: user, timezone, calendar selection, conflicts. Much faster than sequential calls.",
  )

export type EventTime = z.infer<typeof eventTimeSchema>
export type GetEventParams = z.infer<typeof getEventSchema>
export type InsertEventParams = z.infer<typeof insertEventSchema>
export type UpdateEventParams = z.infer<typeof updateEventSchema>
export type DeleteEventParams = z.infer<typeof deleteEventSchema>
export type CheckConflictsParams = z.infer<typeof checkConflictsSchema>
export type CheckConflictsAllCalendarsParams = z.infer<
  typeof checkConflictsAllCalendarsSchema
>
export type PreCreateValidationParams = z.infer<
  typeof preCreateValidationSchema
>

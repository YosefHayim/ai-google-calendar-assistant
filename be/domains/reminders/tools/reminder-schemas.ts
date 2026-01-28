import { z } from "zod"

export const createReminderSchema = z.object({
  message: z.coerce
    .string()
    .describe("The reminder message to send to the user at the scheduled time"),
  scheduledAt: z.coerce
    .string()
    .describe(
      "ISO 8601 datetime string with timezone offset for when to send the reminder. " +
        "MUST include the user's timezone offset from context (e.g., '2025-01-26T17:00:00+02:00' for Asia/Jerusalem). " +
        "NEVER use 'Z' (UTC) - always use the user's actual timezone offset."
    ),
  deliveryChannel: z
    .enum(["origin", "telegram", "whatsapp", "slack", "email", "push"])
    .default("origin")
    .describe(
      "Where to deliver the reminder. 'origin' sends to the same channel where the reminder was created"
    ),
  relatedEventId: z.coerce
    .string()
    .nullable()
    .default(null)
    .describe(
      "Google Calendar event ID if this reminder is related to an event. Null if not related to any event"
    ),
})

export const listRemindersSchema = z.object({
  status: z
    .enum(["pending", "sent", "failed", "cancelled"])
    .nullable()
    .default(null)
    .describe("Filter reminders by status. If null, returns all statuses"),
  limit: z.coerce
    .number()
    .nullable()
    .default(null)
    .describe("Maximum number of reminders to return. Default is 20 if null"),
})

export const cancelReminderSchema = z.object({
  reminderId: z.coerce.string().describe("The UUID of the reminder to cancel"),
})

export const getReminderSchema = z.object({
  reminderId: z.coerce
    .string()
    .describe("The UUID of the reminder to retrieve"),
})

export const cancelAllRemindersSchema = z.object({
  confirm: z
    .boolean()
    .default(false)
    .describe(
      "Must be true to actually cancel all reminders. " +
        "If false, returns list of reminders that would be cancelled for user confirmation"
    ),
})

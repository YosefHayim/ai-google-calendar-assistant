import { z } from "zod"

export const createReminderSchema = z.object({
  message: z.coerce
    .string()
    .describe("The reminder message to send to the user at the scheduled time"),
  scheduledAt: z.coerce
    .string()
    .describe(
      "ISO 8601 datetime string for when to send the reminder (e.g., '2025-01-26T17:00:00Z')"
    ),
  deliveryChannel: z
    .enum(["origin", "telegram", "whatsapp", "slack", "email", "push"])
    .default("origin")
    .describe(
      "Where to deliver the reminder. 'origin' sends to the same channel where the reminder was created"
    ),
  relatedEventId: z.coerce
    .string()
    .optional()
    .describe(
      "Optional Google Calendar event ID if this reminder is related to an event"
    ),
})

export const listRemindersSchema = z.object({
  status: z
    .enum(["pending", "sent", "failed", "cancelled"])
    .optional()
    .describe("Filter reminders by status. If omitted, returns all statuses"),
  limit: z.coerce
    .number()
    .optional()
    .describe("Maximum number of reminders to return. Default is 20"),
})

export const cancelReminderSchema = z.object({
  reminderId: z.coerce
    .string()
    .describe("The UUID of the reminder to cancel"),
})

export const getReminderSchema = z.object({
  reminderId: z.coerce.string().describe("The UUID of the reminder to retrieve"),
})

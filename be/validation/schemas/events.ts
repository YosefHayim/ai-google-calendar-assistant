import { z } from "zod"

export const calendarIdSchema = z.object({
  calendarId: z
    .string()
    .min(1, "Calendar ID is required")
    .max(500, "Calendar ID must be less than 500 characters"),
})

export const eventIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "Event ID is required")
    .max(500, "Event ID must be less than 500 characters"),
})

export const createEventSchema = z.object({
  summary: z
    .string()
    .min(1, "Event summary is required")
    .max(1000, "Summary must be less than 1000 characters"),
  description: z
    .string()
    .max(10_000, "Description must be less than 10000 characters")
    .optional(),
  location: z
    .string()
    .max(1000, "Location must be less than 1000 characters")
    .optional(),
  start: z.object({
    dateTime: z.string().datetime().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    timeZone: z.string().max(100).optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    timeZone: z.string().max(100).optional(),
  }),
  attendees: z
    .array(
      z.object({
        email: z.string().email("Invalid attendee email"),
        displayName: z.string().max(200).optional(),
        optional: z.boolean().optional(),
      })
    )
    .max(100, "Maximum 100 attendees allowed")
    .optional(),
  recurrence: z.array(z.string().max(500)).max(10).optional(),
  reminders: z
    .object({
      useDefault: z.boolean().optional(),
      overrides: z
        .array(
          z.object({
            method: z.enum(["email", "popup"]),
            minutes: z.number().min(0).max(40_320),
          })
        )
        .max(5)
        .optional(),
    })
    .optional(),
  calendarId: z.string().max(500).optional(),
})

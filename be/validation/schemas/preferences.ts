import { z } from "zod";
import { sanitizeString } from "../middleware";

export const allyBrainSchema = z.object({
  enabled: z.boolean(),
  instructions: z
    .string()
    .max(1000, "Instructions must be 1000 characters or less")
    .transform(sanitizeString)
    .optional()
    .default(""),
});

export const contextualSchedulingSchema = z.object({
  enabled: z.boolean(),
});

export const crossPlatformSyncSchema = z.object({
  enabled: z.boolean(),
});

export const geoLocationSchema = z.object({
  enabled: z.boolean(),
  lastKnownLocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      timestamp: z.string(),
    })
    .optional(),
});

export const preferenceKeyParamSchema = z.object({
  key: z.enum(
    [
      "ally_brain",
      "contextual_scheduling",
      "reminder_defaults",
      "voice_preference",
      "daily_briefing",
      "cross_platform_sync",
      "geo_location",
    ],
    {
      errorMap: () => ({
        message:
          "Invalid preference key. Must be 'ally_brain', 'contextual_scheduling', 'reminder_defaults', 'voice_preference', 'daily_briefing', 'cross_platform_sync', or 'geo_location'",
      }),
    }
  ),
});

export type AllyBrainBody = z.infer<typeof allyBrainSchema>;
export type ContextualSchedulingBody = z.infer<
  typeof contextualSchedulingSchema
>;

export const eventReminderSchema = z.object({
  method: z.enum(["email", "popup"]),
  minutes: z.number().int().min(0).max(40_320),
});

export const reminderPreferencesSchema = z.object({
  enabled: z.boolean(),
  defaultReminders: z.array(eventReminderSchema).max(5).optional(),
  useCalendarDefaults: z.boolean().optional().default(true),
});

export type ReminderPreferencesBody = z.infer<typeof reminderPreferencesSchema>;

export const updateCalendarRemindersSchema = z.object({
  defaultReminders: z.array(eventReminderSchema).max(5),
});

export type UpdateCalendarRemindersBody = z.infer<
  typeof updateCalendarRemindersSchema
>;

const ttsVoiceSchema = z.enum([
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
]);

export const voicePreferenceSchema = z.object({
  enabled: z.boolean(),
  voice: ttsVoiceSchema.optional().default("alloy"),
});

export type VoicePreferenceBody = z.infer<typeof voicePreferenceSchema>;

const ianaTimezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid IANA timezone" }
);

export const dailyBriefingSchema = z.object({
  enabled: z.boolean(),
  time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:MM 24-hour format (e.g., 08:30)"
    ),
  timezone: ianaTimezoneSchema,
});

export type DailyBriefingBody = z.infer<typeof dailyBriefingSchema>;

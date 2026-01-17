import { z } from "zod"
import { sanitizeString } from "../middleware"

const dayOfWeekSchema = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
])

const supportedEventLanguageSchema = z.enum([
  "en",
  "de",
  "fr",
  "he",
  "ar",
  "ru",
])

export const gapAnalysisQuerySchema = z.object({
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  calendarId: z
    .string()
    .max(500, "Calendar ID must be less than 500 characters")
    .optional()
    .default("primary"),
  lookbackDays: z.coerce
    .number()
    .int()
    .min(1, "Lookback days must be at least 1")
    .max(90, "Lookback days cannot exceed 90")
    .optional()
    .default(7),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional()
    .default(10),
})

export const gapIdParamSchema = z.object({
  gapId: z.string().uuid("Invalid gap ID format").min(1, "Gap ID is required"),
})

export const fillGapSchema = z.object({
  summary: z
    .string()
    .min(1, "Event summary is required")
    .max(1000, "Summary must be less than 1000 characters")
    .transform(sanitizeString),
  description: z
    .string()
    .max(10_000, "Description must be less than 10000 characters")
    .transform(sanitizeString)
    .optional(),
  location: z
    .string()
    .max(1000, "Location must be less than 1000 characters")
    .transform(sanitizeString)
    .optional(),
  calendarId: z
    .string()
    .max(500, "Calendar ID must be less than 500 characters")
    .optional(),
})

export const skipGapSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .transform(sanitizeString)
    .optional(),
})

export const updateGapSettingsSchema = z.object({
  autoGapAnalysis: z.boolean().optional(),
  minGapThreshold: z.coerce
    .number()
    .int()
    .min(5, "Minimum gap threshold must be at least 5 minutes")
    .max(480, "Minimum gap threshold cannot exceed 480 minutes")
    .optional(),
  maxGapThreshold: z.coerce
    .number()
    .int()
    .min(60, "Maximum gap threshold must be at least 60 minutes")
    .max(1440, "Maximum gap threshold cannot exceed 1440 minutes (24 hours)")
    .optional(),
  ignoredDays: z
    .array(dayOfWeekSchema)
    .max(7, "Cannot ignore more than 7 days")
    .optional(),
  lookbackDays: z.coerce
    .number()
    .int()
    .min(1, "Lookback days must be at least 1")
    .max(90, "Lookback days cannot exceed 90")
    .optional(),
  minConfidenceThreshold: z.coerce
    .number()
    .min(0, "Confidence threshold must be at least 0")
    .max(1, "Confidence threshold cannot exceed 1")
    .optional(),
  eventLanguages: z
    .array(supportedEventLanguageSchema)
    .min(1, "At least one language is required")
    .max(6, "Cannot select more than 6 languages")
    .optional(),
  languageSetupComplete: z.boolean().optional(),
})

export type GapAnalysisQuery = z.infer<typeof gapAnalysisQuerySchema>
export type FillGapBody = z.infer<typeof fillGapSchema>
export type SkipGapBody = z.infer<typeof skipGapSchema>
export type UpdateGapSettingsBody = z.infer<typeof updateGapSettingsSchema>

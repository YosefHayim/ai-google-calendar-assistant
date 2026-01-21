import { z } from "zod"

export const analyzeGapsSchema = z
  .object({
    lookbackDays: z.coerce
      .number()
      .int()
      .min(1)
      .max(90)
      .default(7)
      .describe("Number of days to look back for gaps. Default is 7 days."),
    calendarId: z.coerce
      .string()
      .default("primary")
      .describe("Calendar ID to analyze. Defaults to 'primary'."),
  })
  .describe(
    "Parameters for analyzing gaps in the user's calendar. Email is automatically provided from user context."
  )

export const fillGapSchema = z
  .object({
    gapStart: z.coerce
      .string()
      .describe("Start time of the gap in ISO format."),
    gapEnd: z.coerce.string().describe("End time of the gap in ISO format."),
    summary: z.coerce
      .string()
      .min(1)
      .describe("Title for the new event to fill the gap."),
    description: z.coerce
      .string()
      .nullable()
      .optional()
      .describe("Description for the new event."),
    location: z.coerce
      .string()
      .nullable()
      .optional()
      .describe("Location for the new event."),
    calendarId: z.coerce
      .string()
      .default("primary")
      .describe("Calendar ID to create the event in."),
  })
  .describe(
    "Parameters for filling a gap with a new calendar event. Email is automatically provided from user context."
  )

export const formatGapsDisplaySchema = z
  .object({
    gapsJson: z.coerce
      .string()
      .describe("The gaps array from analyze_gaps_direct as a JSON string."),
  })
  .describe("Format gaps for display.")

export type AnalyzeGapsParams = z.infer<typeof analyzeGapsSchema>
export type FillGapParams = z.infer<typeof fillGapSchema>
export type FormatGapsDisplayParams = z.infer<typeof formatGapsDisplaySchema>

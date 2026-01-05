import OpenAI from "openai"
import { z } from "zod"

import { MODELS } from "@/config"
import { env } from "@/config/env"
import { logger } from "@/utils/logger"

import type { InsightsMetrics } from "@/utils/ai/insights-calculator"

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export const INSIGHT_ICONS = [
  "zap",
  "users",
  "coffee",
  "bar-chart",
  "calendar",
  "clock",
  "trending-up",
  "trending-down",
  "sun",
  "moon",
  "target",
  "activity",
  "award",
  "briefcase",
  "check-circle",
  "compass",
  "flame",
  "heart",
  "layers",
  "pie-chart",
] as const

export const INSIGHT_COLORS = ["amber", "sky", "emerald", "rose", "indigo", "orange"] as const

export type InsightIconName = (typeof INSIGHT_ICONS)[number]
export type InsightColor = (typeof INSIGHT_COLORS)[number]

export const InsightSchema = z.object({
  id: z.string().describe("Unique identifier for the insight (e.g., 'busiest-day', 'focus-time')"),
  icon: z.enum(INSIGHT_ICONS).describe("Icon name from the allowed set"),
  title: z.string().max(25).describe("Short title for the insight card (max 25 chars)"),
  value: z.string().max(15).describe("The main value to display (e.g., 'Tuesday', '8.5h', '+23%')"),
  description: z.string().max(100).describe("Brief explanation of the insight (max 100 chars)"),
  color: z.enum(INSIGHT_COLORS).describe("Color theme for the card"),
})

export const InsightsResponseSchema = z.object({
  insights: z.array(InsightSchema).length(4).describe("Exactly 4 unique insights"),
})

export type AIInsight = z.infer<typeof InsightSchema>
export type AIInsightsResponse = z.infer<typeof InsightsResponseSchema>

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const INSIGHTS_SYSTEM_PROMPT = `You are an analytics assistant that generates personalized calendar insights. Given the user's calendar metrics, generate exactly 4 unique, interesting insights.

IMPORTANT RULES:
1. Pick 4 DIFFERENT insight types - never repeat categories
2. Base insights on the ACTUAL data provided - don't make up numbers
3. Make descriptions personal and actionable
4. Use varied colors across the 4 cards
5. Mix positive insights with areas for improvement
6. Keep values concise (max 15 chars) and descriptions brief (max 100 chars)

INSIGHT CATEGORIES TO CHOOSE FROM:

TIME INSIGHTS:
- "Busiest Day": Day with most hours | icon: zap | color: amber
- "Quietest Day": Day with least activity | icon: coffee | color: emerald
- "Total Hours": Total scheduled time | icon: clock | color: sky
- "Peak Hours": When most events occur (Morning/Afternoon/Evening) | icon: sun | color: amber
- "Night Owl": Late events pattern | icon: moon | color: indigo
- "Early Bird": Early start pattern | icon: sun | color: orange

PRODUCTIVITY INSIGHTS:
- "Focus Blocks": Uninterrupted time available | icon: target | color: emerald
- "Meeting Marathon": Longest back-to-back streak | icon: activity | color: rose
- "Average Meeting": Typical duration | icon: clock | color: sky
- "Longest Event": Marathon session | icon: bar-chart | color: indigo
- "Quick Syncs": Short meetings count | icon: zap | color: amber

COLLABORATION INSIGHTS:
- "Team Time": Multi-attendee events | icon: users | color: sky
- "Solo Time": Individual work events | icon: compass | color: emerald
- "Collaboration Load": Percentage in group meetings | icon: users | color: sky

BALANCE INSIGHTS:
- "Weekend Work": Weekend hours | icon: briefcase | color: rose
- "Work-Life Split": Weekday vs weekend ratio | icon: pie-chart | color: sky
- "Free Days": Days with no events | icon: check-circle | color: emerald
- "Overloaded Days": Days with 8+ hours | icon: flame | color: rose
- "Buffer Score": Average gap between meetings | icon: activity | color: emerald

PATTERN INSIGHTS:
- "Recurring Events": Percentage that repeat | icon: layers | color: sky
- "All-Day Events": Full-day commitments | icon: calendar | color: indigo
- "Event Count": Total events in period | icon: bar-chart | color: sky
- "Calendar Mix": Distribution across calendars | icon: pie-chart | color: indigo

TREND INSIGHTS:
- "Productivity Trend": Based on busy vs free time ratio | icon: trending-up | color: emerald
- "Meeting Density": Events per day average | icon: activity | color: amber
- "Time Distribution": Morning vs afternoon preference | icon: sun | color: orange

Return a JSON object with exactly 4 insights that tell an interesting story about this user's schedule.`

// ============================================================================
// GENERATOR FUNCTION
// ============================================================================

const INSIGHTS_MODEL = MODELS.GPT_4_1_NANO

/**
 * Generate AI-powered insights from calendar metrics
 * Uses OpenAI structured output for reliable JSON parsing
 *
 * @param metrics - Calculated metrics from calendar events
 * @param periodStart - Start date of the analysis period
 * @param periodEnd - End date of the analysis period
 * @returns Array of 4 AI-generated insights
 */
export async function generateInsights(
  metrics: InsightsMetrics,
  periodStart: string,
  periodEnd: string
): Promise<AIInsightsResponse> {
  const openai = new OpenAI({ apiKey: env.openAiApiKey })

  logger.debug(`Generating insights for period ${periodStart} to ${periodEnd}`)

  // Build the JSON schema instruction for the model
  const jsonSchemaInstruction = `
You MUST respond with a valid JSON object matching this exact structure:
{
  "insights": [
    {
      "id": "unique-id",
      "icon": "one of: ${INSIGHT_ICONS.join(", ")}",
      "title": "max 25 chars",
      "value": "max 15 chars",
      "description": "max 100 chars",
      "color": "one of: ${INSIGHT_COLORS.join(", ")}"
    }
  ]
}
The insights array MUST contain exactly 4 items.`

  const response = await openai.chat.completions.create({
    model: INSIGHTS_MODEL,
    messages: [
      {
        role: "system",
        content: INSIGHTS_SYSTEM_PROMPT + "\n\n" + jsonSchemaInstruction,
      },
      {
        role: "user",
        content: `Generate 4 insights for the period ${periodStart} to ${periodEnd}.

Calendar Metrics:
${JSON.stringify(metrics, null, 2)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7, // Some variety in insight selection
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error("Failed to get AI response - no content returned")
  }

  // Parse and validate with Zod
  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new Error(`Failed to parse AI response as JSON: ${content.substring(0, 200)}`)
  }

  const result = InsightsResponseSchema.safeParse(parsed)

  if (!result.success) {
    logger.error(`Insights validation failed: ${result.error.message}`)
    throw new Error(`Invalid insights format: ${result.error.message}`)
  }

  logger.debug(`Generated ${result.data.insights.length} insights successfully`)

  return result.data
}

/**
 * Generate insights with retry logic
 * Attempts up to maxRetries times with exponential backoff
 *
 * @param metrics - Calculated metrics from calendar events
 * @param periodStart - Start date of the analysis period
 * @param periodEnd - End date of the analysis period
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Array of 4 AI-generated insights
 * @throws Error if all retries fail
 */
export async function generateInsightsWithRetry(
  metrics: InsightsMetrics,
  periodStart: string,
  periodEnd: string,
  maxRetries = 3
): Promise<AIInsightsResponse> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateInsights(metrics, periodStart, periodEnd)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      logger.warn(`Insights generation attempt ${attempt}/${maxRetries} failed: ${lastError.message}`)

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = 1000 * Math.pow(2, attempt - 1)
        await sleep(delayMs)
      }
    }
  }

  logger.error(`All ${maxRetries} insight generation attempts failed`)
  throw lastError || new Error("Failed to generate insights after multiple attempts")
}

/**
 * Sleep utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

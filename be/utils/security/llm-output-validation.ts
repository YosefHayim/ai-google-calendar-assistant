/**
 * LLM Output Validation
 *
 * Validates and sanitizes LLM responses to prevent injection attacks
 * where malicious content in responses could affect downstream processing.
 */

import { z } from "zod"
import { logger } from "@/utils/logger"

export interface ValidationResult<T> {
  success: boolean
  data?: T
  error?: string
  rawOutput?: unknown
}

export function validateLLMJson<T>(
  output: unknown,
  schema: z.ZodSchema<T>
): ValidationResult<T> {

  try {
    if (output === null || output === undefined) {
      return { success: false, error: "LLM returned null/undefined output" }
    }

    let parsed: unknown = output

    if (typeof output === "string") {
      const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/)
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : output.trim()

      try {
        parsed = JSON.parse(jsonStr)
      } catch {
        return { success: false, error: "Failed to parse LLM output as JSON", rawOutput: output }
      }
    }

    const result = schema.safeParse(parsed)

    if (!result.success) {
      logger.warn(`SECURITY: LLM output validation failed: ${result.error.message}`)
      return {
        success: false,
        error: `Invalid LLM output structure: ${result.error.errors.map((e: z.ZodIssue) => e.message).join(", ")}`,
        rawOutput: parsed,
      }
    }

    return { success: true, data: result.data as T }
  } catch (error) {
    logger.error(`SECURITY: LLM output validation error: ${error}`)
    return { success: false, error: "Validation error", rawOutput: output }
  }
}

export function sanitizeLLMTextOutput(output: string): string {
  let sanitized = output

  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
  sanitized = sanitized.replace(/javascript:/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=/gi, "")
  sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")

  return sanitized.trim()
}

export function extractJsonFromLLMResponse(response: string): unknown | null {
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim())
    } catch {
      return null
    }
  }

  const jsonObjectMatch = response.match(/\{[\s\S]*\}/)
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0])
    } catch {
      return null
    }
  }

  const jsonArrayMatch = response.match(/\[[\s\S]*\]/)
  if (jsonArrayMatch) {
    try {
      return JSON.parse(jsonArrayMatch[0])
    } catch {
      return null
    }
  }

  return null
}

export const CommonLLMSchemas = {
  SafetyCheck: z.object({
    isSafe: z.boolean(),
    violationType: z.enum(["none", "mass_deletion", "vague_intent", "jailbreak_attempt", "pii_exposure", "rate_abuse"]),
    reasoning: z.string(),
    userReply: z.string().optional(),
  }),

  EventParsed: z.object({
    summary: z.string(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    date: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
    isAllDay: z.boolean().optional(),
  }),

  CalendarSelection: z.object({
    calendarId: z.string(),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().optional(),
  }),
}

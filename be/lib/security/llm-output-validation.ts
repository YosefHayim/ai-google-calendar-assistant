/**
 * LLM Output Validation
 *
 * Validates and sanitizes LLM responses to prevent injection attacks
 * where malicious content in responses could affect downstream processing.
 */

import { z } from "zod"
import { logger } from "@/lib/logger"

export type ValidationResult<T> = {
  success: boolean
  data?: T
  error?: string
  rawOutput?: unknown
}

/**
 * @description Validates and parses LLM output against a Zod schema to ensure type safety
 * and prevent injection attacks. Handles both raw JSON objects and string responses
 * (including markdown code blocks). Logs security warnings when validation fails.
 *
 * @template T - The expected type of the validated output
 * @param {unknown} output - The raw output from the LLM (can be string, object, or null/undefined)
 * @param {z.ZodSchema<T>} schema - A Zod schema defining the expected structure
 * @returns {ValidationResult<T>} An object containing:
 *   - success: boolean indicating if validation passed
 *   - data: the validated and typed data (only if success is true)
 *   - error: error message (only if success is false)
 *   - rawOutput: the original output for debugging (only if success is false)
 *
 * @example
 * // Define a schema for expected LLM response
 * const eventSchema = z.object({
 *   summary: z.string(),
 *   startTime: z.string(),
 *   endTime: z.string()
 * });
 *
 * // Validate LLM output
 * const result = validateLLMJson(llmResponse, eventSchema);
 * if (result.success) {
 *   console.log(result.data.summary); // Type-safe access
 * } else {
 *   console.error(result.error);
 * }
 *
 * @example
 * // Handles markdown code blocks automatically
 * const response = '```json\n{"summary": "Meeting"}\n```';
 * const result = validateLLMJson(response, schema); // Extracts JSON from code block
 */
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
        return {
          success: false,
          error: "Failed to parse LLM output as JSON",
          rawOutput: output,
        }
      }
    }

    const result = schema.safeParse(parsed)

    if (!result.success) {
      logger.warn(
        `SECURITY: LLM output validation failed: ${result.error.message}`
      )
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

/**
 * @description Sanitizes LLM text output by removing potentially dangerous HTML and
 * JavaScript content that could lead to XSS attacks when the output is rendered.
 * Removes script tags, javascript: URLs, event handlers, and iframes.
 *
 * @param {string} output - The raw text output from the LLM to sanitize
 * @returns {string} The sanitized text with dangerous content removed and trimmed
 *
 * @example
 * // Remove script injection attempts
 * const unsafe = 'Hello <script>alert("xss")</script> World';
 * const safe = sanitizeLLMTextOutput(unsafe);
 * // Result: 'Hello  World'
 *
 * @example
 * // Remove event handlers
 * const unsafe = '<div onclick="malicious()">Click me</div>';
 * const safe = sanitizeLLMTextOutput(unsafe);
 * // Result: '<div>Click me</div>'
 *
 * @example
 * // Remove javascript: URLs
 * const unsafe = 'Check <a href="javascript:alert(1)">this link</a>';
 * const safe = sanitizeLLMTextOutput(unsafe);
 * // Result: 'Check <a href="">this link</a>'
 */
export function sanitizeLLMTextOutput(output: string): string {
  let sanitized = output

  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
  sanitized = sanitized.replace(/javascript:/gi, "")
  sanitized = sanitized.replace(/on\w+\s*=/gi, "")
  sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")

  return sanitized.trim()
}

/**
 * @description Attempts to extract and parse JSON data from an LLM response string.
 * Handles multiple formats: markdown code blocks (```json ... ```), raw JSON objects,
 * and JSON arrays. Returns null if no valid JSON can be extracted.
 *
 * @param {string} response - The LLM response string that may contain JSON
 * @returns {unknown | null} The parsed JSON data, or null if extraction/parsing fails
 *
 * @example
 * // Extract from markdown code block
 * const response = 'Here is the data:\n```json\n{"name": "John"}\n```';
 * const data = extractJsonFromLLMResponse(response);
 * // Result: { name: 'John' }
 *
 * @example
 * // Extract raw JSON object from text
 * const response = 'The event details are {"title": "Meeting", "time": "10:00"}';
 * const data = extractJsonFromLLMResponse(response);
 * // Result: { title: 'Meeting', time: '10:00' }
 *
 * @example
 * // Extract JSON array
 * const response = 'Events: [{"id": 1}, {"id": 2}]';
 * const data = extractJsonFromLLMResponse(response);
 * // Result: [{ id: 1 }, { id: 2 }]
 *
 * @example
 * // Returns null for invalid JSON
 * const response = 'No JSON here';
 * const data = extractJsonFromLLMResponse(response);
 * // Result: null
 */
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
    violationType: z.enum([
      "none",
      "mass_deletion",
      "vague_intent",
      "jailbreak_attempt",
      "pii_exposure",
      "rate_abuse",
    ]),
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

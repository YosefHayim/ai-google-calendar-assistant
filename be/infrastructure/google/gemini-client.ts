import { GoogleGenAI } from "@google/genai"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"

/**
 * Gemini AI client singleton for Google's Generative AI SDK.
 * Uses the Interactions API for stateful conversations.
 */
let geminiClient: GoogleGenAI | null = null

/**
 * Returns the singleton Gemini AI client instance.
 * Creates a new instance if one doesn't exist.
 *
 * @returns GoogleGenAI client instance
 * @throws Error if GOOGLE_AI_API_KEY is not configured
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = env.googleAiApiKey
    if (!apiKey) {
      throw new Error(
        "GOOGLE_AI_API_KEY environment variable is not configured. " +
          "Please set it in your .env file to use Gemini features."
      )
    }

    geminiClient = new GoogleGenAI({ apiKey })
    logger.info("[GeminiClient] Initialized Gemini AI client")
  }

  return geminiClient
}

/**
 * Gemini model identifiers for different use cases.
 * These are the recommended models for the Calendar Agent.
 */
export const GEMINI_MODELS = {
  /** Best for complex reasoning and multi-step tasks */
  FLASH: "gemini-2.5-flash",
  /** Faster, cheaper option for simpler tasks */
  FLASH_LITE: "gemini-2.0-flash-lite",
  /** Latest preview with experimental features */
  FLASH_PREVIEW: "gemini-2.5-flash-preview-05-20",
  /** Pro model for highest quality output */
  PRO: "gemini-2.5-pro",
} as const

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS]

/**
 * Default model for the Calendar Agent.
 * Using gemini-2.5-flash for optimal balance of quality and speed.
 */
export const DEFAULT_GEMINI_MODEL: GeminiModel = GEMINI_MODELS.FLASH

/**
 * Session storage for interaction IDs.
 * Maps userId to their last interaction ID for session resumption.
 * In production, this should be persisted to Redis/Supabase.
 */
const interactionSessions = new Map<string, string>()

/**
 * Gets the last interaction ID for a user (for session resumption).
 *
 * @param userId - The user's unique identifier
 * @returns The last interaction ID or undefined if no session exists
 */
export function getLastInteractionId(userId: string): string | undefined {
  return interactionSessions.get(userId)
}

const INTERACTION_ID_PREVIEW_LENGTH = 20

/**
 * Stores an interaction ID for session resumption.
 *
 * @param userId - The user's unique identifier
 * @param interactionId - The interaction ID to store
 */
export function setLastInteractionId(
  userId: string,
  interactionId: string
): void {
  interactionSessions.set(userId, interactionId)
  logger.debug("[GeminiClient] Stored interaction ID", {
    userId,
    interactionId: `${interactionId.slice(0, INTERACTION_ID_PREVIEW_LENGTH)}...`,
  })
}

/**
 * Clears the interaction session for a user.
 *
 * @param userId - The user's unique identifier
 */
export function clearInteractionSession(userId: string): void {
  interactionSessions.delete(userId)
  logger.debug("[GeminiClient] Cleared interaction session", { userId })
}

/**
 * Checks if the Gemini client is properly configured and available.
 *
 * @returns True if the client can be initialized
 */
export function isGeminiAvailable(): boolean {
  return Boolean(env.googleAiApiKey)
}

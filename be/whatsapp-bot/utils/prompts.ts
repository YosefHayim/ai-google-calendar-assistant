/**
 * WhatsApp Prompts Utility
 * Handles prompt building and message summarization for WhatsApp conversations
 */

import { MODELS } from "@/config/constants/ai"
import OpenAI from "openai"
import { env } from "@/config"
import { logger } from "@/utils/logger"
import type { userAndAiMessageProps } from "@/types"
import type { AllyBrainPreference } from "./ally-brain"

const openai = new OpenAI({ apiKey: env.openAiApiKey })

const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO
const MAX_PROMPT_LENGTH = 3500
const MAX_CONTEXT_LENGTH = 2500

// ============================================================================
// Prompt Building
// ============================================================================

const truncateContext = (context: string, maxLength: number): string => {
  if (context.length <= maxLength) {
    return context
  }

  const truncated = context.slice(-maxLength)
  const firstNewline = truncated.indexOf("\n")

  if (firstNewline > 0 && firstNewline < 200) {
    return `[Earlier context truncated...]\n${truncated.slice(firstNewline + 1)}`
  }

  return `[Earlier context truncated...]\n${truncated}`
}

type BuildPromptOptions = {
  allyBrain?: AllyBrainPreference | null
  languageCode?: string
  personalityNotes?: string
}

/**
 * Builds an agent prompt with conversation context
 */
export const buildAgentPromptWithContext = (
  email: string | undefined,
  message: string,
  conversationContext?: string,
  options?: BuildPromptOptions
): string => {
  const timestamp = new Date().toISOString()
  const parts: string[] = []

  // Add platform-specific note
  parts.push("You are Ally, an AI calendar assistant responding via WhatsApp.")
  parts.push(
    "Keep responses concise and mobile-friendly. Use WhatsApp formatting (*bold*, _italic_) when appropriate."
  )

  if (options?.allyBrain?.enabled && options.allyBrain.instructions?.trim()) {
    parts.push("\n--- User's Custom Instructions (Always Remember) ---")
    parts.push(options.allyBrain.instructions)
    parts.push("--- End Custom Instructions ---")
  }

  parts.push(`\nCurrent date and time: ${timestamp}`)

  if (email) {
    parts.push(`User email: ${email}`)
  } else {
    parts.push("Note: User is not yet linked to an account. Calendar operations require account linking.")
  }

  if (options?.languageCode) {
    parts.push(
      `IMPORTANT: User's preferred language is "${options.languageCode}". You MUST respond in this language.`
    )
  }

  if (options?.personalityNotes) {
    parts.push(`Response style: ${options.personalityNotes}`)
  }

  if (conversationContext) {
    const truncatedContext = truncateContext(conversationContext, MAX_CONTEXT_LENGTH)
    parts.push(`\n--- Conversation History ---\n${truncatedContext}\n--- End History ---`)
  }

  parts.push(`\nUser's message: ${message}`)

  let result = parts.join("\n")

  if (result.length > MAX_PROMPT_LENGTH) {
    logger.warn(
      `WhatsApp: Prompt exceeded ${MAX_PROMPT_LENGTH} chars (${result.length}), truncating context`
    )
    const baseLength = result.length - (conversationContext?.length || 0)
    const availableForContext = MAX_PROMPT_LENGTH - baseLength - 100

    // Find the context index (after platform notes and optional ally brain)
    const contextIndex = parts.findIndex((p) => p.includes("--- Conversation History ---"))

    if (availableForContext > 200 && conversationContext && contextIndex > -1) {
      const truncatedContext = truncateContext(conversationContext, availableForContext)
      parts[contextIndex] = `\n--- Conversation History ---\n${truncatedContext}\n--- End History ---`
      result = parts.join("\n")
    } else if (contextIndex > -1) {
      parts.splice(contextIndex, 1)
      result = parts.join("\n")
    }
  }

  return result
}

/**
 * Builds a confirmation prompt for event creation despite conflicts
 */
export const buildConfirmationPrompt = (
  displayName: string,
  email: string | undefined,
  eventData: unknown
): string => {
  const timestamp = new Date().toISOString()
  return `Current date and time is ${timestamp}. User ${displayName}${
    email ? ` with email ${email}` : ""
  } confirmed the creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(
    eventData
  )}`
}

// ============================================================================
// Message Summarization
// ============================================================================

const SUMMARIZATION_PROMPT = `You are a conversation summarizer. Create a concise summary of the conversation below.

Focus on:
- Key requests and actions taken
- Important decisions or outcomes
- Any pending items or follow-ups
- Calendar events mentioned (with dates/times if available)

Keep the summary brief but informative. Use bullet points for clarity.
Do not include greetings or pleasantries. Focus on actionable information.

Conversation to summarize:`

const formatMessagesForSummary = (messages: userAndAiMessageProps[]): string => {
  return messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant"
      return `${role}: ${msg.content || ""}`
    })
    .join("\n")
}

/**
 * Summarizes conversation messages using AI
 */
export const summarizeMessages = async (messages: userAndAiMessageProps[]): Promise<string> => {
  if (messages.length === 0) {
    return ""
  }

  const formattedMessages = formatMessagesForSummary(messages)
  const fullPrompt = `${SUMMARIZATION_PROMPT}\n\n${formattedMessages}`

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes conversations concisely.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      temperature: 0.3,
    })

    const summary = response.choices[0]?.message?.content?.trim()

    if (!summary) {
      logger.error("WhatsApp: Summarize: No summary generated")
      throw new Error("No summary generated")
    }
    return summary
  } catch (error) {
    logger.error(`WhatsApp: Summarize: Error summarizing messages: ${error}`)
    return createFallbackSummary(messages)
  }
}

const createFallbackSummary = (messages: userAndAiMessageProps[]): string => {
  const userMessages = messages.filter((m) => m.role === "user")
  const topics = userMessages
    .slice(0, 3)
    .map((m) => m.content?.slice(0, 50))
    .filter(Boolean)
  if (topics.length === 0) {
    return "Previous conversation context available."
  }
  return `Previous topics discussed: ${topics.join("; ")}...`
}

const TITLE_GENERATION_PROMPT = `Generate a very short title (max 5 words) for this conversation based on the user's first message.
The title should capture the main topic or intent. Do not use quotes or punctuation. Just return the title text.

User's message:`

/**
 * Generates a short title for a conversation using AI
 */
export const generateConversationTitle = async (firstUserMessage: string): Promise<string> => {
  if (!firstUserMessage?.trim()) {
    return "New Conversation"
  }

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates very short, descriptive titles for conversations.",
        },
        {
          role: "user",
          content: `${TITLE_GENERATION_PROMPT}\n\n${firstUserMessage.slice(0, 200)}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
    })

    const title = response.choices[0]?.message?.content?.trim()

    if (!title) {
      throw new Error("No title generated")
    }

    const cleanTitle = title.replace(/^["']|["']$/g, "").slice(0, 50)
    return cleanTitle || "New Conversation"
  } catch (error) {
    logger.error(`WhatsApp: Summarize: Error generating title: ${error}`)
    const truncated = firstUserMessage.slice(0, 47)
    return truncated.length < firstUserMessage.length ? `${truncated}...` : truncated
  }
}

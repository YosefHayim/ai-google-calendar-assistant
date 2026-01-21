import type { AllyBrainPreference } from "./ally-brain"
import { MODELS } from "@/config/constants/ai"
import OpenAI from "openai"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"
import type { userAndAiMessageProps } from "@/types"

const openai = new OpenAI({ apiKey: env.openAiApiKey })

const SUMMARIZATION_MODEL = MODELS.GPT_4_1_NANO
const MAX_PROMPT_LENGTH = 3500
const MAX_CONTEXT_LENGTH = 2500

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

export const buildAgentPromptWithContext = (
  email: string | undefined,
  message: string,
  conversationContext?: string,
  options?: BuildPromptOptions
): string => {
  const timestamp = new Date().toISOString()
  const parts: string[] = []

  parts.push(`<platform>
WhatsApp - Keep responses concise and mobile-friendly.
Use WhatsApp formatting (*bold*, _italic_) when appropriate.
</platform>`)

  if (options?.allyBrain?.enabled && options.allyBrain.instructions?.trim()) {
    parts.push(`<user_instructions>
${options.allyBrain.instructions}
</user_instructions>`)
  }

  parts.push(`<context>
<timestamp>${timestamp}</timestamp>
<user>${email || "Not linked - calendar operations require account linking"}</user>
</context>`)

  if (options?.languageCode) {
    parts.push(
      `<language>User's preferred language is "${options.languageCode}". You MUST respond in this language.</language>`
    )
  }

  if (options?.personalityNotes) {
    parts.push(`<response_style>${options.personalityNotes}</response_style>`)
  }

  if (conversationContext) {
    const truncatedContext = truncateContext(
      conversationContext,
      MAX_CONTEXT_LENGTH
    )
    parts.push(`<conversation_history>
${truncatedContext}
</conversation_history>`)
  }

  parts.push(`<current_request>${message}</current_request>`)

  let result = parts.join("\n\n")

  if (result.length > MAX_PROMPT_LENGTH) {
    logger.warn(
      `WhatsApp: Prompt exceeded ${MAX_PROMPT_LENGTH} chars (${result.length}), truncating context`
    )
    const baseLength = result.length - (conversationContext?.length || 0)
    const availableForContext = MAX_PROMPT_LENGTH - baseLength - 100

    const historyIndex = parts.findIndex((p) =>
      p.includes("<conversation_history>")
    )

    if (availableForContext > 200 && conversationContext && historyIndex > -1) {
      const truncatedContext = truncateContext(
        conversationContext,
        availableForContext
      )
      parts[historyIndex] = `<conversation_history>
${truncatedContext}
</conversation_history>`
      result = parts.join("\n\n")
    } else if (historyIndex > -1) {
      parts.splice(historyIndex, 1)
      result = parts.join("\n\n")
    }
  }

  return result
}

export const buildConfirmationPrompt = (
  displayName: string,
  email: string | undefined,
  eventData: unknown
): string => {
  const timestamp = new Date().toISOString()
  return `<context>
<timestamp>${timestamp}</timestamp>
<user>${displayName}${email ? ` (${email})` : ""}</user>
</context>

<task>User confirmed event creation despite conflicts. Create the event now.</task>

<event_data>
${JSON.stringify(eventData, null, 2)}
</event_data>`
}

const SUMMARIZATION_PROMPT = `<role>You are a conversation summarizer.</role>

<task>Create a concise summary of the conversation below.</task>

<focus_areas>
- Key requests and actions taken
- Important decisions or outcomes
- Pending items or follow-ups
- Calendar events mentioned (with dates/times)
</focus_areas>

<format>
- Brief but informative
- Use bullet points
- No greetings or pleasantries
- Focus on actionable information
</format>

<conversation>`

const formatMessagesForSummary = (messages: userAndAiMessageProps[]): string =>
  messages
    .map((msg) => {
      const role = msg.role === "user" ? "User" : "Assistant"
      return `${role}: ${msg.content || ""}`
    })
    .join("\n")

export const summarizeMessages = async (
  messages: userAndAiMessageProps[]
): Promise<string> => {
  if (messages.length === 0) {
    return ""
  }

  const formattedMessages = formatMessagesForSummary(messages)
  const fullPrompt = `${SUMMARIZATION_PROMPT}
${formattedMessages}
</conversation>`

  try {
    const response = await openai.chat.completions.create({
      model: SUMMARIZATION_MODEL,
      messages: [
        {
          role: "system",
          content:
            "<role>You are a helpful assistant that summarizes conversations concisely.</role>",
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

const TITLE_GENERATION_PROMPT = `<task>Generate a very short title (max 5 words) for this conversation.</task>

<rules>
- Capture the main topic or intent
- No quotes or punctuation
- Return only the title text
</rules>

<user_message>`

export const generateConversationTitle = async (
  firstUserMessage: string
): Promise<string> => {
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
            "<role>You are a helpful assistant that generates very short, descriptive titles for conversations.</role>",
        },
        {
          role: "user",
          content: `${TITLE_GENERATION_PROMPT}${firstUserMessage.slice(0, 200)}</user_message>`,
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
    return truncated.length < firstUserMessage.length
      ? `${truncated}...`
      : truncated
  }
}

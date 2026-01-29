import { logger } from "@/lib/logger"
import { getTimezoneHandler } from "@/shared/tools/handlers"
import type { AllyBrainPreference } from "./ally-brain"

const MAX_PROMPT_LENGTH = 3500
const MAX_CONTEXT_LENGTH = 2500
const MIN_CONTEXT_THRESHOLD = 200
const CONTEXT_BUFFER = 100
const FIRST_NEWLINE_LIMIT = 200

const truncateContext = (context: string, maxLength: number): string => {
  if (context.length <= maxLength) {
    return context
  }

  const truncated = context.slice(-maxLength)
  const firstNewline = truncated.indexOf("\n")

  if (firstNewline > 0 && firstNewline < FIRST_NEWLINE_LIMIT) {
    return `[Earlier context truncated...]\n${truncated.slice(firstNewline + 1)}`
  }

  return `[Earlier context truncated...]\n${truncated}`
}

const getUserTimezone = async (email: string | undefined): Promise<string> => {
  if (!email) {
    return "UTC"
  }
  try {
    const tzResult = await getTimezoneHandler({ email })
    return tzResult.timezone
  } catch {
    return "UTC"
  }
}

const buildContextBlock = (
  timestamp: string,
  userTimezone: string,
  email: string | undefined
): string => {
  const now = new Date()
  const localTimeStr = now.toLocaleString("en-US", { timeZone: userTimezone })

  return `<context>
<timestamp>${timestamp}</timestamp>
<local_time>${localTimeStr} (${userTimezone})</local_time>
<user>${email || "Not linked - calendar operations require account linking"}</user>
<timezone>${userTimezone}</timezone>
</context>`
}

const applyPromptTruncation = (
  parts: string[],
  conversationContext: string | undefined
): string => {
  const result = parts.join("\n\n")

  if (result.length <= MAX_PROMPT_LENGTH) {
    return result
  }

  logger.warn(
    `Prompt exceeded ${MAX_PROMPT_LENGTH} chars (${result.length}), truncating context`
  )

  const baseLength = result.length - (conversationContext?.length || 0)
  const availableForContext = MAX_PROMPT_LENGTH - baseLength - CONTEXT_BUFFER
  const historyIndex = parts.findIndex((p) =>
    p.includes("<conversation_history>")
  )

  if (
    availableForContext > MIN_CONTEXT_THRESHOLD &&
    conversationContext &&
    historyIndex > -1
  ) {
    const truncatedContext = truncateContext(
      conversationContext,
      availableForContext
    )
    parts[historyIndex] = `<conversation_history>
${truncatedContext}
</conversation_history>`
    return parts.join("\n\n")
  }

  if (historyIndex > -1) {
    parts.splice(historyIndex, 1)
  }

  return parts.join("\n\n")
}

export const buildAgentPrompt = (
  email: string | undefined,
  message: string
): string => {
  const timestamp = new Date().toISOString()
  return `<context>
<timestamp>${timestamp}</timestamp>
<user>${email}</user>
</context>

<request>${message}</request>`
}

type BuildPromptOptions = {
  allyBrain?: AllyBrainPreference | null
  languageCode?: string
  personalityNotes?: string
}

export const buildAgentPromptWithContext = async (
  email: string | undefined,
  message: string,
  conversationContext?: string,
  options?: BuildPromptOptions
): Promise<string> => {
  const timestamp = new Date().toISOString()
  const parts: string[] = []

  parts.push(
    "<platform>Telegram - Keep responses concise and mobile-friendly.</platform>"
  )

  if (options?.allyBrain?.enabled && options.allyBrain.instructions?.trim()) {
    parts.push(`<user_instructions>
${options.allyBrain.instructions}
</user_instructions>`)
  }

  const userTimezone = await getUserTimezone(email)
  parts.push(buildContextBlock(timestamp, userTimezone, email))

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

  return applyPromptTruncation(parts, conversationContext)
}

export const buildConfirmationPrompt = (
  firstName: string,
  email: string | undefined,
  eventData: unknown
): string => {
  const timestamp = new Date().toISOString()
  return `<context>
<timestamp>${timestamp}</timestamp>
<user>${firstName} (${email})</user>
</context>

<task>User confirmed event creation despite conflicts. Create the event now.</task>

<event_data>
${JSON.stringify(eventData, null, 2)}
</event_data>`
}

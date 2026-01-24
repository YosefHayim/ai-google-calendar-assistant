import type { Response } from "express"
import { webConversation } from "@/domains/chat/utils/conversation/WebConversationAdapter"
import { writeTitleGenerated } from "@/domains/chat/utils/sse"
import { getAllyBrainPreference } from "@/domains/settings/services/user-preferences-service"
import { logger } from "@/lib/logger"
import type { ImageContent } from "@/shared/llm"
import { getTimezoneHandler } from "@/shared/tools/handlers"
import {
  generateConversationTitle,
  summarizeMessages,
} from "@/telegram-bot/utils/summarize"
import type { MessageImageData, ToolOutput } from "@/types"

export const EMBEDDING_THRESHOLD = 0.75
export const EMBEDDING_LIMIT = 3

export type StreamChatRequest = {
  message: string
  images?: ImageContent[]
}

export type PromptParams = {
  message: string
  conversationContext: string
  semanticContext: string
  userEmail: string
  userId: string
  hasImages?: boolean
  imageCount?: number
}

export type StreamingParams = {
  res: Response
  userId: string
  userEmail: string
  message: string
  conversationId: string | null
  isNewConversation: boolean
  fullPrompt: string
  images?: ImageContent[]
}

export type ConversationSaveParams = {
  userId: string
  message: string
  fullResponse: string
  conversationId: string | null
  isNewConversation: boolean
  images?: MessageImageData[]
  toolOutputs?: ToolOutput[]
}

export async function buildChatPromptWithContext(
  params: PromptParams
): Promise<string> {
  const {
    message,
    conversationContext,
    semanticContext,
    userEmail,
    userId,
    hasImages,
    imageCount,
  } = params
  const parts: string[] = []

  const allyBrain = await getAllyBrainPreference(userId)
  if (allyBrain?.enabled && allyBrain?.instructions) {
    parts.push("User's Custom Instructions (Always Remember) ")
    parts.push(allyBrain.instructions)
    parts.push("End Custom Instructions \n")
  }

  parts.push(`User Email: ${userEmail}`)
  parts.push(`Current Time: ${new Date().toISOString()}`)

  if (conversationContext) {
    parts.push("\nToday's Conversation ")
    parts.push(conversationContext)
    parts.push("End Today's Conversation ")
  }

  if (semanticContext) {
    parts.push("\nRelated Past Conversations ")
    parts.push(semanticContext)
    parts.push("End Past Conversations ")
  }

  if (hasImages && imageCount) {
    parts.push(
      `\n[User has attached ${imageCount} image(s) to this message. Please analyze them and help with any calendar-related content you find.]`
    )
  }

  parts.push("\n<user_request>")
  parts.push(message)
  parts.push("</user_request>")

  return parts.join("\n")
}

export async function saveConversationMessages(
  params: ConversationSaveParams
): Promise<string | null> {
  const {
    userId,
    message,
    fullResponse,
    conversationId,
    isNewConversation,
    images,
  } = params

  const LOG_PREVIEW_LEN = 50
  logger.info(
    `saveConversationMessages: userId=${userId}, isNew=${isNewConversation}, msgLen=${message?.length || 0}, respLen=${fullResponse?.length || 0}, convId=${conversationId || "null"}, msgPreview="${message?.slice(0, LOG_PREVIEW_LEN) || ""}", respPreview="${fullResponse?.slice(0, LOG_PREVIEW_LEN) || ""}"`
  )

  if (!fullResponse) {
    logger.warn("saveConversationMessages: no fullResponse, skipping save")
    return conversationId
  }

  if (isNewConversation) {
    try {
      const result = await webConversation.createConversationWithMessages(
        userId,
        { role: "user", content: message, images },
        { role: "assistant", content: fullResponse },
        summarizeMessages
      )
      logger.info(
        `saveConversationMessages: createConversationWithMessages returned ${result ? result.conversationId : "null"}`
      )
      return result ? result.conversationId : conversationId
    } catch (error) {
      logger.error(
        `saveConversationMessages: createConversationWithMessages threw error: ${error instanceof Error ? error.message : String(error)}`
      )
      throw error
    }
  }

  if (conversationId) {
    await webConversation.addMessageToConversation(
      conversationId,
      userId,
      { role: "user", content: message, images },
      summarizeMessages
    )
    await webConversation.addMessageToConversation(
      conversationId,
      userId,
      { role: "assistant", content: fullResponse },
      summarizeMessages
    )
  }

  return conversationId
}

export async function generateAndSaveTitle(
  res: Response,
  conversationId: string,
  message: string
): Promise<void> {
  try {
    const title = await generateConversationTitle(message)
    await webConversation.updateConversationTitle(conversationId, title)
    writeTitleGenerated(res, conversationId, title)
  } catch (titleError) {
    logger.error("[StreamUtils] Title generation error:", titleError)
  }
}

export async function getUserTimezone(email: string): Promise<string> {
  try {
    const result = await getTimezoneHandler({ email })
    return result.timezone
  } catch {
    return "UTC"
  }
}

/**
 * Shared types for conversation management across web and telegram platforms.
 *
 * Part of: Chat API, Telegram Bot, AI Agents
 */
import type { userAndAiMessageProps } from "@/types"
import type { Database } from "@/database.types"

export type MessageRole = Database["public"]["Enums"]["message_role"]

export type ConversationSource = "web" | "telegram" | "whatsapp" | "api"

/**
 * Common conversation context used across all platforms
 */
export type ConversationContext = {
  messages: userAndAiMessageProps[]
  summary?: string
  title?: string
  lastUpdated: string
}

/**
 * Base conversation row from database (common fields)
 */
export type BaseConversationRow = {
  id: string
  user_id: string
  message_count: number | null
  summary: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  last_message_at: string | null
}

/**
 * Web-specific conversation row
 */
export type WebConversationRow = BaseConversationRow & {
  title: string | null
}

/**
 * Telegram-specific conversation row
 */
export type TelegramConversationRow = BaseConversationRow & {
  external_chat_id: number | null
}

/**
 * Summarization function signature
 */
export type SummarizeFn = (messages: userAndAiMessageProps[]) => Promise<string>

/**
 * Conversation list item for sidebar/list views
 */
export type ConversationListItem = {
  id: string
  title: string
  messageCount: number
  lastUpdated: string
  createdAt: string
  source?: ConversationSource
}

/**
 * Full conversation with all messages
 */
export type FullConversation = {
  id: string
  userId: string
  messages: userAndAiMessageProps[]
  summary?: string
  title?: string
  messageCount: number
  lastUpdated: string
  createdAt: string
}

/**
 * Configuration for conversation service
 */
export type ConversationConfig = {
  maxContextLength: number
  maxSummaryLength: number
  maxMessagesBeforeSummarize: number
  maxContextPromptLength: number
  maxSummaryDisplayLength: number
  maxMessagesDisplayLength: number
}

/**
 * Default configuration values
 */
export const DEFAULT_CONVERSATION_CONFIG: ConversationConfig = {
  maxContextLength: 1000,
  maxSummaryLength: 1000,
  maxMessagesBeforeSummarize: 6,
  maxContextPromptLength: 2000,
  maxSummaryDisplayLength: 800,
  maxMessagesDisplayLength: 1000,
}

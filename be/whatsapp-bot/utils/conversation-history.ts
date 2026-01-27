/**
 * WhatsApp Conversation History Management
 * Handles conversation persistence and context for WhatsApp users
 * Similar to Telegram's conversation-history.ts but adapted for WhatsApp
 */

import { SUPABASE } from "@/infrastructure/supabase/supabase"
import type { Database } from "@/database.types"
import type { userAndAiMessageProps } from "@/types"
import { isToday } from "@/lib/date/date-helpers"
import { logger } from "@/lib/logger"

const MAX_CONTEXT_LENGTH = 6000
const MAX_SUMMARY_LENGTH = 1500
const MAX_MESSAGES_BEFORE_SUMMARIZE = 10
const MIN_MESSAGES_TO_KEEP = 4

type MessageRole = Database["public"]["Enums"]["message_role"]

type ConversationContext = {
  messages: userAndAiMessageProps[]
  summary?: string
  lastUpdated: string
}

type ConversationRow = {
  id: string
  user_id: string
  external_chat_id: number | null
  message_count: number | null
  summary: string | null
  is_active: boolean | null
  created_at: string
  updated_at: string
  last_message_at: string | null
}

type WhatsAppUserRow = Database["public"]["Tables"]["whatsapp_users"]["Row"]

const calculateContextLength = (messages: userAndAiMessageProps[]): number =>
  messages.reduce((total, msg) => total + (msg.content?.length || 0), 0)

const mapRoleToDb = (role: "user" | "assistant" | "system"): MessageRole =>
  role as MessageRole

const condenseSummary = async (
  existingSummary: string,
  newSummary: string,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<string> => {
  const combined = `${existingSummary}\n\n${newSummary}`

  if (combined.length <= MAX_SUMMARY_LENGTH) {
    return combined
  }

  try {
    const condensedSummary = await summarizeFn([
      {
        role: "user",
        content: `Please condense this conversation summary:\n${combined}`,
      },
    ])
    return condensedSummary.slice(0, MAX_SUMMARY_LENGTH)
  } catch {
    return combined.slice(-MAX_SUMMARY_LENGTH)
  }
}

/**
 * Gets the user ID from a WhatsApp phone number
 */
export const getUserIdFromWhatsApp = async (
  phoneNumber: string
): Promise<string | null> => {
  const { data, error } = await SUPABASE.from("whatsapp_users")
    .select("user_id")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (error || !data?.user_id) {
    return null
  }

  return data.user_id as string
}

/**
 * Gets or creates a WhatsApp user record
 */
export const getOrCreateWhatsAppUser = async (
  phoneNumber: string,
  displayName?: string
): Promise<WhatsAppUserRow | null> => {
  // Try to get existing user
  const { data: existingUser } = await SUPABASE.from("whatsapp_users")
    .select("*")
    .eq("whatsapp_phone", phoneNumber)
    .single()

  if (existingUser) {
    // Update last activity and name if provided
    const updates: Partial<WhatsAppUserRow> = {
      last_activity_at: new Date().toISOString(),
    }
    if (displayName && displayName !== existingUser.whatsapp_name) {
      updates.whatsapp_name = displayName
    }

    await SUPABASE.from("whatsapp_users")
      .update(updates)
      .eq("whatsapp_phone", phoneNumber)

    return existingUser as WhatsAppUserRow
  }

  // Create new user
  const { data: newUser, error: insertError } = await SUPABASE.from(
    "whatsapp_users"
  )
    .insert({
      whatsapp_phone: phoneNumber,
      whatsapp_name: displayName || null,
      is_linked: false,
      language_code: "en",
    })
    .select()
    .single()

  if (insertError) {
    logger.error(
      `WhatsApp: Failed to create user for ${phoneNumber}: ${insertError.message}`
    )
    return null
  }

  return newUser as WhatsAppUserRow
}

/**
 * Converts phone number to a numeric chat ID for database storage
 */
const phoneToNumericId = (phone: string): number => {
  // Remove any non-numeric characters and convert to number
  const numericPhone = phone.replace(/\D/g, "")
  // Use last 15 digits to avoid overflow (JavaScript safe integer limit)
  return Number.parseInt(numericPhone.slice(-15), 10)
}

/**
 * Gets today's conversation for a WhatsApp user
 */
export const getTodayConversationState = async (
  phoneNumber: string
): Promise<ConversationRow | null> => {
  const chatId = phoneToNumericId(phoneNumber)

  const { data, error } = await SUPABASE.from("conversations")
    .select("*")
    .eq("external_chat_id", chatId)
    .eq("source", "whatsapp")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error(
      `WhatsApp: Failed to fetch conversation for ${phoneNumber}: ${error.message}`
    )
    return null
  }

  if (!data) {
    return null
  }

  const updatedAt = data.updated_at || data.created_at
  if (!isToday(updatedAt)) {
    return null
  }

  return data as ConversationRow
}

/**
 * Gets messages for a conversation
 */
const getConversationMessages = async (
  conversationId: string
): Promise<userAndAiMessageProps[]> => {
  const { data, error } = await SUPABASE.from("conversation_messages")
    .select("role, content, sequence_number")
    .eq("conversation_id", conversationId)
    .order("sequence_number", { ascending: true })

  if (error || !data) {
    return []
  }

  return data
    .filter((msg) => msg.role === "user" || msg.role === "assistant")
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))
}

/**
 * Creates a new conversation state for a WhatsApp user
 */
export const createConversationState = async (
  phoneNumber: string,
  displayName?: string,
  initialMessage?: userAndAiMessageProps
): Promise<{ id: string; context: ConversationContext } | null> => {
  const whatsAppUser = await getOrCreateWhatsAppUser(phoneNumber, displayName)
  const chatId = phoneToNumericId(phoneNumber)

  // Get the user_id if linked
  const userId = whatsAppUser?.user_id

  if (!userId) {
    // For unlinked users, we can't create conversations in the DB
    // They can still chat but without persistence until they link their account
    logger.debug(
      `WhatsApp: User ${phoneNumber} is not linked, conversation will not be persisted`
    )
    return null
  }

  const { data: conversation, error: convError } = await SUPABASE.from(
    "conversations"
  )
    .insert({
      user_id: userId,
      source: "whatsapp" as const,
      external_chat_id: chatId,
      is_active: true,
      message_count: initialMessage ? 1 : 0,
    })
    .select()
    .single()

  if (convError || !conversation) {
    logger.error(
      `WhatsApp: Failed to create conversation for ${phoneNumber}: ${convError?.message}`
    )
    return null
  }

  if (initialMessage?.content) {
    await SUPABASE.from("conversation_messages").insert({
      conversation_id: conversation.id,
      role: mapRoleToDb(initialMessage.role),
      content: initialMessage.content,
      sequence_number: 1,
    })
  }

  return {
    id: conversation.id,
    context: {
      messages: initialMessage ? [initialMessage] : [],
      lastUpdated: new Date().toISOString(),
    },
  }
}

/**
 * Updates conversation state
 */
export const updateConversationState = async (
  conversationId: string,
  context: ConversationContext,
  messageCount: number
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      message_count: messageCount,
      summary: context.summary,
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  if (error) {
    logger.error(
      `WhatsApp: Failed to update conversation ${conversationId}: ${error.message}`
    )
    return false
  }

  return true
}

/**
 * Stores a summary for a conversation
 * Summary is now stored directly in conversations.summary column
 */
export const storeSummary = async (
  conversationId: string,
  _userId: string,
  summaryText: string,
  _messageCount: number,
  _firstSequence: number,
  _lastSequence: number
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      summary: summaryText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  if (error) {
    logger.error(
      `WhatsApp: Failed to store summary for conversation ${conversationId}: ${error.message}`
    )
    return false
  }

  return true
}

/**
 * Marks a conversation as summarized
 */
export const markAsSummarized = async (
  conversationId: string,
  summary: string
): Promise<boolean> => {
  const { error } = await SUPABASE.from("conversations")
    .update({
      summary,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)

  if (error) {
    logger.error(
      `WhatsApp: Failed to update summary for conversation ${conversationId}: ${error.message}`
    )
    return false
  }

  return true
}

/**
 * Gets or creates today's conversation context
 */
export const getOrCreateTodayContext = async (
  phoneNumber: string,
  displayName?: string
): Promise<{
  stateId: string
  context: ConversationContext
  userId?: string
}> => {
  const existingConversation = await getTodayConversationState(phoneNumber)

  if (existingConversation) {
    const messages = await getConversationMessages(existingConversation.id)
    const context: ConversationContext = {
      messages,
      summary: existingConversation.summary || undefined,
      lastUpdated:
        existingConversation.updated_at || existingConversation.created_at,
    }
    return {
      stateId: existingConversation.id,
      context,
      userId: existingConversation.user_id,
    }
  }

  const newState = await createConversationState(phoneNumber, displayName)

  if (!newState) {
    logger.warn(
      `WhatsApp: Failed to create conversation for ${phoneNumber}, using fallback`
    )
    return {
      stateId: "",
      context: { messages: [], lastUpdated: new Date().toISOString() },
    }
  }

  return {
    stateId: newState.id,
    context: newState.context,
  }
}

/**
 * Adds a message to the conversation context
 */
export const addMessageToContext = async (
  phoneNumber: string,
  displayName: string | undefined,
  message: userAndAiMessageProps,
  summarizeFn: (messages: userAndAiMessageProps[]) => Promise<string>
): Promise<ConversationContext> => {
  const { stateId, context, userId } = await getOrCreateTodayContext(
    phoneNumber,
    displayName
  )

  if (!stateId) {
    context.messages.push(message)
    context.lastUpdated = new Date().toISOString()
    return context
  }

  const { data: lastMsg } = await SUPABASE.from("conversation_messages")
    .select("sequence_number")
    .eq("conversation_id", stateId)
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSequence = (lastMsg?.sequence_number || 0) + 1

  if (message.content) {
    const { error: insertError } = await SUPABASE.from(
      "conversation_messages"
    ).insert({
      conversation_id: stateId,
      role: mapRoleToDb(message.role),
      content: message.content,
      sequence_number: nextSequence,
    })

    if (insertError) {
      logger.error(
        `WhatsApp: Failed to insert message for conversation ${stateId}: ${insertError.message}`
      )
    }
  }

  context.messages.push(message)
  context.lastUpdated = new Date().toISOString()

  const totalLength = calculateContextLength(context.messages)
  const shouldSummarize =
    totalLength > MAX_CONTEXT_LENGTH &&
    context.messages.length > MAX_MESSAGES_BEFORE_SUMMARIZE &&
    userId

  if (shouldSummarize) {
    const messagesToSummarize = context.messages.slice(0, -MIN_MESSAGES_TO_KEEP)
    const recentMessages = context.messages.slice(-MIN_MESSAGES_TO_KEEP)

    try {
      const newSummary = await summarizeFn(messagesToSummarize)

      const firstSeq = nextSequence - context.messages.length + 1
      const lastSeq = nextSequence - 2
      await storeSummary(
        stateId,
        userId,
        newSummary,
        messagesToSummarize.length,
        firstSeq,
        lastSeq
      )

      if (context.summary) {
        context.summary = await condenseSummary(
          context.summary,
          newSummary,
          summarizeFn
        )
      } else {
        context.summary = newSummary.slice(0, MAX_SUMMARY_LENGTH)
      }

      context.messages = recentMessages

      await markAsSummarized(stateId, context.summary)
    } catch (error) {
      logger.error(
        `WhatsApp: Failed to summarize conversation for ${phoneNumber}: ${error}`
      )
    }
  }

  await updateConversationState(stateId, context, nextSequence)

  return context
}

const MAX_CONTEXT_PROMPT_LENGTH = 2000
const MAX_SUMMARY_DISPLAY_LENGTH = 800
const MAX_MESSAGES_DISPLAY_LENGTH = 1000

/**
 * Builds a context prompt from conversation history
 */
export const buildContextPrompt = (context: ConversationContext): string => {
  const parts: string[] = []

  if (context.summary) {
    const truncatedSummary =
      context.summary.length > MAX_SUMMARY_DISPLAY_LENGTH
        ? context.summary.slice(-MAX_SUMMARY_DISPLAY_LENGTH)
        : context.summary
    parts.push(`Previous conversation summary:\n${truncatedSummary}`)
  }

  if (context.messages.length > 0) {
    let messageHistory = context.messages
      .map(
        (msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`
      )
      .join("\n")
    if (messageHistory.length > MAX_MESSAGES_DISPLAY_LENGTH) {
      messageHistory = messageHistory.slice(-MAX_MESSAGES_DISPLAY_LENGTH)
    }
    parts.push(`Recent messages:\n${messageHistory}`)
  }

  const result = parts.join("\n\n")

  if (result.length > MAX_CONTEXT_PROMPT_LENGTH) {
    return result.slice(-MAX_CONTEXT_PROMPT_LENGTH)
  }

  return result
}

/**
 * Gets the conversation context for a WhatsApp user
 */
export const getConversationContext = async (
  phoneNumber: string,
  displayName?: string
): Promise<ConversationContext> => {
  const { context } = await getOrCreateTodayContext(phoneNumber, displayName)
  return context
}

/**
 * Exports conversation utilities as a namespace
 */
export const whatsAppConversation = {
  getUserIdFromWhatsApp,
  getOrCreateWhatsAppUser,
  getTodayConversationState,
  createConversationState,
  updateConversationState,
  getOrCreateTodayContext,
  addMessageToContext,
  buildContextPrompt,
  getConversationContext,
}

/**
 * Chat Service
 * Handles chat with the backend AI agent via regular HTTP requests
 * Frontend uses typewriter component to simulate real-time typing
 */

import { apiClient } from '@/lib/api/client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onChunk: (chunk: string, fullText: string) => void
  onComplete: (fullText: string, conversationId?: number, title?: string) => void
  onError: (error: string) => void
}

/**
 * Send a message and get the complete AI response
 * Frontend will use typewriter component to simulate real-time typing
 * @param message - The user's message
 * @param history - Previous messages in the conversation
 * @param callbacks - Callbacks for streaming events
 * @param conversationId - Optional existing conversation ID to continue
 */
export const streamChatMessage = async (
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
  conversationId?: number | null,
): Promise<void> => {
  const { onComplete, onError } = callbacks

  try {
    const response = await apiClient.post('/api/chat', {
      message,
      history,
      source: 'web',
      conversationId: conversationId || undefined,
    })
    const content = response.data?.data?.content || 'No response received'
    const returnedConversationId = response.data?.data?.conversationId
    const title = response.data?.data?.title

    // Return the complete response - typewriter component will handle the animation
    onComplete(content, returnedConversationId, title)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    onError(errorMessage)
  }
}

/**
 * Send a message without streaming (fallback)
 * Uses apiClient for automatic token handling
 */
export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<string> => {
  const response = await apiClient.post('/api/chat', { message, history })
  return response.data?.data?.content || 'No response received'
}

// ============================================
// Conversation Management Types & Functions
// ============================================

export interface ConversationListItem {
  id: number
  title: string
  messageCount: number
  lastUpdated: string
  createdAt: string
}

export interface FullConversation {
  id: number
  userId: string
  messages: ChatMessage[]
  summary?: string
  messageCount: number
  lastUpdated: string
  createdAt: string
}

export interface ConversationListResponse {
  conversations: ConversationListItem[]
  status: string
  message: string
  pagination: {
    limit: number
    offset: number
    count: number
  }
}

/**
 * Get list of user's conversations
 * @param limit - Maximum number of conversations to return
 * @param offset - Number of conversations to skip
 * @param search - Optional search query to filter by title (minimum 2 characters)
 */
export const getConversations = async (
  limit: number = 20,
  offset: number = 0,
  search?: string,
): Promise<ConversationListResponse> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  })
  if (search && search.length >= 2) {
    params.append('search', search)
  }
  const response = await apiClient.get(`/api/chat/conversations?${params.toString()}`)
  return response.data?.data || { conversations: [], pagination: { limit, offset, count: 0 } }
}

/**
 * Get a specific conversation by ID
 */
export const getConversation = async (conversationId: number): Promise<FullConversation | null> => {
  try {
    const response = await apiClient.get(`/api/chat/conversations/${conversationId}`)
    return response.data?.data?.conversation || null
  } catch {
    return null
  }
}

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/chat/conversations/${conversationId}`)
    return true
  } catch {
    return false
  }
}

/**
 * Delete all conversations
 */
export const deleteAllConversations = async (): Promise<boolean> => {
  try {
    await apiClient.delete('/api/conversations/all', {
      data: { is_active: false },
    })
    return true
  } catch {
    return false
  }
}

/**
 * Continue an existing conversation
 */
export const continueConversation = async (
  conversationId: number,
  message: string,
  callbacks: StreamCallbacks,
): Promise<void> => {
  const { onComplete, onError } = callbacks

  try {
    const response = await apiClient.post(`/api/chat/conversations/${conversationId}/messages`, {
      message,
      source: 'web',
    })
    const content = response.data?.data?.content || 'No response received'
    const title = response.data?.data?.title
    onComplete(content, conversationId, title)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    onError(errorMessage)
  }
}

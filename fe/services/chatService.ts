import { apiClient } from '@/lib/api/client'

export interface ChatMessageImage {
  data: string // base64 encoded
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  images?: ChatMessageImage[]
}

export interface ChatResponse {
  content: string
  conversationId?: string
  title?: string
}

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
  const response = await apiClient.post('/api/chat', {
    message,
    history,
    source: 'web',
  })
  return {
    content: response.data?.data?.content || 'No response received',
    conversationId: response.data?.data?.conversationId,
    title: response.data?.data?.title,
  }
}

// ============================================
// Conversation Management Types & Functions
// ============================================

export interface ConversationListItem {
  id: string
  title: string
  messageCount: number
  lastUpdated: string
  createdAt: string
}

export interface FullConversation {
  id: string
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
export const getConversation = async (conversationId: string): Promise<FullConversation | null> => {
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
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`/api/chat/conversations/${conversationId}`)
    return true
  } catch {
    return false
  }
}

/**
 * Delete all conversations for the current user
 */
export const deleteAllConversations = async (): Promise<{ success: boolean; deletedCount: number }> => {
  try {
    const response = await apiClient.delete('/api/chat/conversations')
    return {
      success: true,
      deletedCount: response.data?.data?.deletedCount || 0,
    }
  } catch {
    return { success: false, deletedCount: 0 }
  }
}

export const continueConversation = async (conversationId: string, message: string): Promise<ChatResponse> => {
  const response = await apiClient.post(`/api/chat/conversations/${conversationId}/messages`, {
    message,
    source: 'web',
  })
  return {
    content: response.data?.data?.content || 'No response received',
    conversationId,
    title: response.data?.data?.title,
  }
}

export const startNewConversation = async (): Promise<boolean> => {
  try {
    await apiClient.post('/api/chat/conversations/new')
    return true
  } catch {
    return false
  }
}

/**
 * Reset all memory (embeddings, context, conversations) for the current user
 * This clears all learned patterns and conversation history
 */
export interface ResetMemoryResult {
  embeddings: number
  conversations: number
  redisContext: boolean
  message: string
}

export const resetMemory = async (): Promise<ResetMemoryResult> => {
  const response = await apiClient.delete('/api/chat/memory')
  return response.data?.data || {
    embeddings: 0,
    conversations: 0,
    redisContext: true,
    message: 'Memory reset completed',
  }
}

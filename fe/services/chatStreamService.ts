/**
 * Chat Stream Service
 * Handles streaming chat with the backend AI agent via Server-Sent Events
 */

import { apiClient } from '@/lib/api/client'
import { ENV, STORAGE_KEYS } from '@/lib/constants'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onChunk: (chunk: string, fullText: string) => void
  onComplete: (fullText: string) => void
  onError: (error: string) => void
}

/**
 * Get auth headers from localStorage (same tokens as apiClient uses)
 */
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}

  const headers: Record<string, string> = {}
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }
  if (refreshToken) {
    headers[STORAGE_KEYS.REFRESH_TOKEN] = refreshToken
  }

  return headers
}

/**
 * Send a message and stream the AI response
 * Note: Uses fetch for SSE streaming (axios doesn't support streaming well)
 */
export const streamChatMessage = async (
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> => {
  const { onChunk, onComplete, onError } = callbacks

  try {
    const response = await fetch(`${ENV.API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({ message, history }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'chunk') {
              fullText += data.content
              onChunk(data.content, fullText)
            } else if (data.type === 'done') {
              onComplete(fullText)
            } else if (data.type === 'error') {
              onError(data.content)
            }
          } catch {
            // Ignore JSON parse errors for incomplete chunks
          }
        }
      }
    }
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

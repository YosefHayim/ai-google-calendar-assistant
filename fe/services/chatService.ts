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
  onComplete: (fullText: string) => void
  onError: (error: string) => void
}

/**
 * Send a message and get the complete AI response
 * Frontend will use typewriter component to simulate real-time typing
 */
export const streamChatMessage = async (
  message: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks,
): Promise<void> => {
  const { onComplete, onError } = callbacks

  try {
    const response = await apiClient.post('/api/chat', { message, history })
    const content = response.data?.data?.content || 'No response received'

    // Return the complete response - typewriter component will handle the animation
    onComplete(content)
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

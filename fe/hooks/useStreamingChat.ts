'use client'

import { createStreamAbortController, streamChatMessage } from '@/services/chat-stream-service'
import { useCallback, useRef, useState } from 'react'

import type { StreamingState } from '@/types/stream'

export interface ImageContent {
  type: 'image'
  data: string
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
}

interface UseStreamingChatOptions {
  onStreamComplete?: (conversationId: string, fullResponse: string) => void
  onStreamError?: (error: string) => void
  onTitleGenerated?: (conversationId: string, title: string) => void
  onMemoryUpdated?: (preference: string, action: 'added' | 'replaced' | 'duplicate') => void
}

interface UseStreamingChatReturn {
  streamingState: StreamingState
  sendStreamingMessage: (message: string, conversationId?: string, images?: ImageContent[]) => Promise<void>
  cancelStream: () => void
  resetStreamingState: () => void
}

const initialState: StreamingState = {
  isStreaming: false,
  streamedText: '',
  currentTool: null,
  currentAgent: null,
  error: null,
}

/**
 * Hook for managing streaming chat conversations with AI agents.
 *
 * Handles real-time text streaming, tool execution tracking, agent switching,
 * and provides callbacks for various streaming events including completion,
 * errors, and dynamic conversation updates.
 *
 * @param options - Configuration options for streaming callbacks and event handlers
 * @param options.onStreamComplete - Called when streaming completes with conversation ID and full response
 * @param options.onStreamError - Called when streaming encounters an error
 * @param options.onTitleGenerated - Called when a conversation title is auto-generated
 * @param options.onMemoryUpdated - Called when user preferences/memory are updated
 * @returns Object containing streaming state and control functions
 */
export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const { onStreamComplete, onStreamError, onTitleGenerated, onMemoryUpdated } = options
  const [streamingState, setStreamingState] = useState<StreamingState>(initialState)
  const abortControllerRef = useRef<AbortController | null>(null)

  const resetStreamingState = useCallback(() => {
    setStreamingState(initialState)
  }, [])

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setStreamingState((prev) => ({
      ...prev,
      isStreaming: false,
    }))
  }, [])

  const sendStreamingMessage = useCallback(
    async (message: string, conversationId?: string, images?: ImageContent[]) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = createStreamAbortController()

      setStreamingState({
        isStreaming: true,
        streamedText: '',
        currentTool: null,
        currentAgent: null,
        error: null,
      })

      const result = await streamChatMessage({
        message,
        conversationId,
        images,
        signal: abortControllerRef.current.signal,
        callbacks: {
          onTextDelta: (delta, fullText) => {
            setStreamingState((prev) => ({
              ...prev,
              streamedText: fullText,
            }))
          },
          onToolStart: (tool, agent) => {
            setStreamingState((prev) => ({
              ...prev,
              currentTool: tool,
              currentAgent: agent,
            }))
          },
          onToolComplete: () => {
            setStreamingState((prev) => ({
              ...prev,
              currentTool: null,
            }))
          },
          onAgentSwitch: (_from, to) => {
            setStreamingState((prev) => ({
              ...prev,
              currentAgent: to,
            }))
          },
          onTitleGenerated: (convId, title) => {
            onTitleGenerated?.(convId, title)
          },
          onMemoryUpdated: (preference, action) => {
            onMemoryUpdated?.(preference, action)
          },
          onDone: (convId, fullResponse) => {
            setStreamingState((prev) => ({
              ...prev,
              isStreaming: false,
              streamedText: fullResponse,
            }))
            onStreamComplete?.(convId, fullResponse)
          },
          onError: (errorMessage) => {
            setStreamingState((prev) => ({
              ...prev,
              isStreaming: false,
              error: errorMessage,
            }))
            onStreamError?.(errorMessage)
          },
        },
      })

      if (!result.success && result.error !== 'Request aborted') {
        setStreamingState((prev) => ({
          ...prev,
          isStreaming: false,
          error: result.error || 'Unknown error',
        }))
      }

      abortControllerRef.current = null
    },
    [onStreamComplete, onStreamError, onTitleGenerated, onMemoryUpdated],
  )

  return {
    streamingState,
    sendStreamingMessage,
    cancelStream,
    resetStreamingState,
  }
}

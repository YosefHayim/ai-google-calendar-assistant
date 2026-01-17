'use client'

import { useState, useCallback, useRef } from 'react'
import { streamChatMessage, createStreamAbortController } from '@/services/chatStreamService'
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

export function useStreamingChat(options: UseStreamingChatOptions = {}): UseStreamingChatReturn {
  const { onStreamComplete, onStreamError, onTitleGenerated } = options
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
    [onStreamComplete, onStreamError, onTitleGenerated],
  )

  return {
    streamingState,
    sendStreamingMessage,
    cancelStream,
    resetStreamingState,
  }
}

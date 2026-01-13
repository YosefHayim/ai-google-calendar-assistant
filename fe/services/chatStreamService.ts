import type {
  AgentSwitchData,
  DoneData,
  ErrorData,
  SSEEvent,
  SSEEventType,
  StreamCallbacks,
  TextDeltaData,
  TitleGeneratedData,
  ToolCompleteData,
  ToolStartData,
} from '@/types/stream'
import { ENV, STORAGE_KEYS } from '@/lib/constants'

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)}`,
  }
}

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith('data: ')) return null

  try {
    const jsonStr = line.slice(6)
    return JSON.parse(jsonStr) as SSEEvent
  } catch {
    return null
  }
}

export interface ImageContent {
  type: 'image'
  data: string
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
}

export interface StreamChatOptions {
  message: string
  conversationId?: string
  profileId?: string
  images?: ImageContent[]
  callbacks: StreamCallbacks
  signal?: AbortSignal
}

export interface StreamResult {
  success: boolean
  conversationId?: string
  fullResponse?: string
  error?: string
}

export async function streamChatMessage(options: StreamChatOptions): Promise<StreamResult> {
  const { message, conversationId, profileId, images, callbacks, signal } = options

  const url = conversationId
    ? `${ENV.API_BASE_URL}/api/chat/conversations/${conversationId}/messages/stream`
    : `${ENV.API_BASE_URL}/api/chat/stream`

  const body: { message: string; profileId?: string; images?: ImageContent[] } = { message }
  if (profileId) {
    body.profileId = profileId
  }
  if (images && images.length > 0) {
    body.images = images
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text()
      callbacks.onError?.(errorText || 'Failed to start stream', 'HTTP_ERROR')
      return { success: false, error: errorText }
    }

    if (!response.body) {
      callbacks.onError?.('No response body', 'NO_BODY')
      return { success: false, error: 'No response body' }
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullResponse = ''
    let resultConversationId = conversationId

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')

      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.trim()) continue

        const event = parseSSELine(line)
        if (!event) continue

        switch (event.type as SSEEventType) {
          case 'text_delta': {
            const data = event.data as TextDeltaData
            fullResponse = data.fullText || fullResponse + data.delta
            callbacks.onTextDelta?.(data.delta, fullResponse)
            break
          }
          case 'tool_start': {
            const data = event.data as ToolStartData
            callbacks.onToolStart?.(data.tool, data.agent)
            break
          }
          case 'tool_complete': {
            const data = event.data as ToolCompleteData
            callbacks.onToolComplete?.(data.tool, data.result)
            break
          }
          case 'agent_switch': {
            const data = event.data as AgentSwitchData
            callbacks.onAgentSwitch?.(data.from, data.to)
            break
          }
          case 'title_generated': {
            const data = event.data as TitleGeneratedData
            callbacks.onTitleGenerated?.(data.conversationId, data.title)
            break
          }
          case 'done': {
            const data = event.data as DoneData
            resultConversationId = data.conversationId
            fullResponse = data.fullResponse || fullResponse
            callbacks.onDone?.(data.conversationId, fullResponse)
            break
          }
          case 'error': {
            const data = event.data as ErrorData
            callbacks.onError?.(data.message, data.code)
            return { success: false, error: data.message }
          }
          case 'heartbeat':
            break
        }
      }
    }

    return {
      success: true,
      conversationId: resultConversationId,
      fullResponse,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request aborted' }
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    callbacks.onError?.(errorMessage, 'FETCH_ERROR')
    return { success: false, error: errorMessage }
  }
}

export function createStreamAbortController(): AbortController {
  return new AbortController()
}

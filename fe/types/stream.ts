export type SSEEventType =
  | 'text_delta'
  | 'tool_start'
  | 'tool_complete'
  | 'agent_switch'
  | 'title_generated'
  | 'done'
  | 'error'
  | 'heartbeat'

export interface SSEEvent<T = unknown> {
  type: SSEEventType
  data: T
  timestamp: string
}

export interface TextDeltaData {
  delta: string
  fullText?: string
}

export interface ToolStartData {
  tool: string
  agent: string
  args?: Record<string, unknown>
}

export interface ToolCompleteData {
  tool: string
  result: 'success' | 'error'
  output?: string
}

export interface AgentSwitchData {
  from: string
  to: string
}

export interface DoneData {
  conversationId: string
  fullResponse: string
  usage?: {
    totalTokens?: number
    inputTokens?: number
    outputTokens?: number
  }
}

export interface ErrorData {
  message: string
  code: string
}

export interface TitleGeneratedData {
  conversationId: string
  title: string
}

export interface StreamingState {
  isStreaming: boolean
  streamedText: string
  currentTool: string | null
  currentAgent: string | null
  error: string | null
}

export interface StreamCallbacks {
  onTextDelta?: (delta: string, fullText: string) => void
  onToolStart?: (tool: string, agent: string) => void
  onToolComplete?: (tool: string, result: 'success' | 'error') => void
  onAgentSwitch?: (from: string, to: string) => void
  onTitleGenerated?: (conversationId: string, title: string) => void
  onDone?: (conversationId: string, fullResponse: string) => void
  onError?: (message: string, code: string) => void
}

export type MessageRole = "system" | "user" | "assistant" | "tool"

export interface Message {
  role: MessageRole
  content: string
  name?: string
  toolCallId?: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object"
  description?: string
  items?: JsonSchemaProperty
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
  nullable?: boolean
}

export interface JsonSchema {
  type: "object"
  properties: Record<string, JsonSchemaProperty>
  required?: string[]
  description?: string
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: JsonSchema
}

export interface ChatParams {
  messages: Message[]
  tools?: ToolDefinition[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  content: string
  toolCalls?: ToolCall[]
  finishReason: "stop" | "tool_calls" | "length" | "error"
}

export interface StreamChunk {
  type: "text_delta" | "tool_call_start" | "tool_call_delta" | "done" | "error"
  content?: string
  toolCall?: Partial<ToolCall>
  error?: string
}

export interface LLMProvider {
  readonly name: string
  readonly supportsTools: boolean
  readonly supportsStreaming: boolean

  chat(params: ChatParams): Promise<ChatResponse>
  stream(params: ChatParams): AsyncIterable<StreamChunk>
}

export interface ProviderConfig {
  apiKey: string
  modelId: string
  temperature?: number
  maxTokens?: number
}

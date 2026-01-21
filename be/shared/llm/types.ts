export type MessageRole = "system" | "user" | "assistant" | "tool"

export type ImageContent = {
  type: "image"
  data: string // base64 encoded image data
  mimeType: "image/png" | "image/jpeg" | "image/webp" | "image/gif"
}

export type TextContent = {
  type: "text"
  text: string
}

export type MessageContent = string | (TextContent | ImageContent)[]

export type Message = {
  role: MessageRole
  content: MessageContent
  name?: string
  toolCallId?: string
  toolCalls?: ToolCall[]
}

export type ToolCall = {
  id: string
  name: string
  arguments: string
}

export type JsonSchemaProperty = {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object"
  description?: string
  items?: JsonSchemaProperty
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
  nullable?: boolean
}

export type JsonSchema = {
  type: "object"
  properties: Record<string, JsonSchemaProperty>
  required?: string[]
  description?: string
}

export type ToolDefinition = {
  name: string
  description: string
  parameters: JsonSchema
}

export type ChatParams = {
  messages: Message[]
  tools?: ToolDefinition[]
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export type ChatResponse = {
  content: string
  toolCalls?: ToolCall[]
  finishReason: "stop" | "tool_calls" | "length" | "error"
}

export type StreamChunk = {
  type: "text_delta" | "tool_call_start" | "tool_call_delta" | "done" | "error"
  content?: string
  toolCall?: Partial<ToolCall>
  error?: string
}

export type LLMProvider = {
  readonly name: string
  readonly supportsTools: boolean
  readonly supportsStreaming: boolean

  chat(params: ChatParams): Promise<ChatResponse>
  stream(params: ChatParams): AsyncIterable<StreamChunk>
}

export type ProviderConfig = {
  apiKey: string
  modelId: string
  temperature?: number
  maxTokens?: number
}

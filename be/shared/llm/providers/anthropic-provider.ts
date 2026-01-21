import Anthropic from "@anthropic-ai/sdk"
import type {
  ChatParams,
  ChatResponse,
  JsonSchema,
  JsonSchemaProperty,
  LLMProvider,
  Message,
  MessageContent,
  ProviderConfig,
  StreamChunk,
  ToolDefinition,
} from "../types"

type AnthropicContent = string | Anthropic.ContentBlockParam[]

function convertContent(content: MessageContent): AnthropicContent {
  if (typeof content === "string") {
    return content
  }

  return content.map((part) => {
    if (part.type === "text") {
      return { type: "text" as const, text: part.text }
    }
    // Image content
    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: part.mimeType,
        data: part.data,
      },
    }
  })
}

function getStringContent(content: MessageContent): string {
  if (typeof content === "string") {
    return content
  }
  return content
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n")
}

function convertMessages(messages: Message[]): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = []

  for (const msg of messages) {
    if (msg.role === "system") {
      continue
    }

    if (msg.role === "user") {
      result.push({ role: "user", content: convertContent(msg.content) })
    } else if (msg.role === "assistant") {
      const content: (
        | Anthropic.TextBlockParam
        | Anthropic.ToolUseBlockParam
      )[] = []
      const textContent = getStringContent(msg.content)

      if (textContent) {
        content.push({ type: "text", text: textContent })
      }

      if (msg.toolCalls?.length) {
        for (const tc of msg.toolCalls) {
          content.push({
            type: "tool_use",
            id: tc.id,
            name: tc.name,
            input: JSON.parse(tc.arguments),
          })
        }
      }

      if (content.length > 0) {
        result.push({ role: "assistant", content })
      }
    } else if (msg.role === "tool" && msg.toolCallId) {
      result.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId,
            content: getStringContent(msg.content),
          },
        ],
      })
    }
  }

  return result
}

function convertJsonSchemaProperty(
  prop: JsonSchemaProperty
): Anthropic.Tool.InputSchema {
  const base: Record<string, unknown> = {
    type: prop.type,
    description: prop.description,
  }

  if (prop.type === "array" && prop.items) {
    base.items = convertJsonSchemaProperty(prop.items)
  }

  if (prop.type === "object" && prop.properties) {
    const properties: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(prop.properties)) {
      properties[key] = convertJsonSchemaProperty(value)
    }
    base.properties = properties
    if (prop.required) {
      base.required = prop.required
    }
  }

  return base as Anthropic.Tool.InputSchema
}

function convertJsonSchema(schema: JsonSchema): Anthropic.Tool.InputSchema {
  const properties: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(schema.properties)) {
    properties[key] = convertJsonSchemaProperty(value)
  }

  return {
    type: "object",
    properties,
    required: schema.required,
  } as Anthropic.Tool.InputSchema
}

function convertTools(tools: ToolDefinition[]): Anthropic.Tool[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    input_schema: convertJsonSchema(tool.parameters),
  }))
}

function getSystemPrompt(
  messages: Message[],
  systemPrompt?: string
): string | undefined {
  const systemMessages = messages.filter((m) => m.role === "system")
  const parts = systemPrompt ? [systemPrompt] : []
  parts.push(...systemMessages.map((m) => getStringContent(m.content)))
  return parts.length > 0 ? parts.join("\n\n") : undefined
}

export function createAnthropicProvider(config: ProviderConfig): LLMProvider {
  const client = new Anthropic({ apiKey: config.apiKey })

  return {
    name: "anthropic",
    supportsTools: true,
    supportsStreaming: true,

    async chat(params: ChatParams): Promise<ChatResponse> {
      const systemPrompt = getSystemPrompt(params.messages, params.systemPrompt)
      const messages = convertMessages(params.messages)

      const response = await client.messages.create({
        model: config.modelId,
        messages,
        system: systemPrompt,
        max_tokens: params.maxTokens ?? config.maxTokens ?? 4096,
        temperature: params.temperature ?? config.temperature ?? 0.7,
        tools: params.tools ? convertTools(params.tools) : undefined,
      })

      let content = ""
      const toolCalls: ChatResponse["toolCalls"] = []

      for (const block of response.content) {
        if (block.type === "text") {
          content += block.text
        } else if (block.type === "tool_use") {
          toolCalls.push({
            id: block.id,
            name: block.name,
            arguments: JSON.stringify(block.input),
          })
        }
      }

      let finishReason: ChatResponse["finishReason"] = "stop"
      if (response.stop_reason === "tool_use") {
        finishReason = "tool_calls"
      } else if (response.stop_reason === "max_tokens") {
        finishReason = "length"
      }

      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason,
      }
    },

    async *stream(params: ChatParams): AsyncIterable<StreamChunk> {
      const systemPrompt = getSystemPrompt(params.messages, params.systemPrompt)
      const messages = convertMessages(params.messages)

      const stream = client.messages.stream({
        model: config.modelId,
        messages,
        system: systemPrompt,
        max_tokens: params.maxTokens ?? config.maxTokens ?? 4096,
        temperature: params.temperature ?? config.temperature ?? 0.7,
        tools: params.tools ? convertTools(params.tools) : undefined,
      })

      let currentToolId: string | undefined
      let currentToolName: string | undefined

      for await (const event of stream) {
        if (event.type === "content_block_start") {
          const block = event.content_block
          if (block.type === "tool_use") {
            currentToolId = block.id
            currentToolName = block.name
            yield {
              type: "tool_call_start",
              toolCall: { id: block.id, name: block.name },
            }
          }
        } else if (event.type === "content_block_delta") {
          const delta = event.delta
          if (delta.type === "text_delta") {
            yield { type: "text_delta", content: delta.text }
          } else if (delta.type === "input_json_delta") {
            yield {
              type: "tool_call_delta",
              toolCall: {
                id: currentToolId,
                name: currentToolName,
                arguments: delta.partial_json,
              },
            }
          }
        } else if (event.type === "content_block_stop") {
          currentToolId = undefined
          currentToolName = undefined
        } else if (event.type === "message_stop") {
          yield { type: "done" }
        }
      }
    },
  }
}

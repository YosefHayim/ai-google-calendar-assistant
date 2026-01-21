import {
  type Content,
  type FunctionDeclarationSchema,
  type FunctionDeclarationSchemaProperty,
  GoogleGenerativeAI,
  type Part,
  SchemaType,
  type Tool,
} from "@google/generative-ai"
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

function getStringContent(content: MessageContent): string {
  if (typeof content === "string") {
    return content
  }
  return content
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n")
}

function convertContentToParts(content: MessageContent): Part[] {
  if (typeof content === "string") {
    return content ? [{ text: content }] : []
  }

  return content.map((part) => {
    if (part.type === "text") {
      return { text: part.text }
    }
    // Image content
    return {
      inlineData: {
        mimeType: part.mimeType,
        data: part.data,
      },
    }
  })
}

function convertMessages(messages: Message[]): Content[] {
  const result: Content[] = []

  for (const msg of messages) {
    if (msg.role === "system") {
      continue
    }

    const role = msg.role === "assistant" ? "model" : "user"
    const parts: Part[] = []

    // Convert content (text and/or images)
    parts.push(...convertContentToParts(msg.content))

    if (msg.toolCalls?.length) {
      for (const tc of msg.toolCalls) {
        parts.push({
          functionCall: {
            name: tc.name,
            args: JSON.parse(tc.arguments),
          },
        })
      }
    }

    if (msg.role === "tool" && msg.toolCallId) {
      parts.push({
        functionResponse: {
          name: msg.name || msg.toolCallId,
          response: { result: getStringContent(msg.content) },
        },
      })
    }

    if (parts.length > 0) {
      result.push({ role, parts })
    }
  }

  return result
}

function convertProperty(
  prop: JsonSchemaProperty
): FunctionDeclarationSchemaProperty {
  const baseProps = {
    description: prop.description,
    nullable: prop.nullable,
  }

  switch (prop.type) {
    case "string":
      return { type: SchemaType.STRING, ...baseProps }
    case "number":
      return { type: SchemaType.NUMBER, ...baseProps }
    case "integer":
      return { type: SchemaType.INTEGER, ...baseProps }
    case "boolean":
      return { type: SchemaType.BOOLEAN, ...baseProps }
    case "array": {
      if (!prop.items) {
        return {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          ...baseProps,
        }
      }
      return {
        type: SchemaType.ARRAY,
        items: convertProperty(prop.items),
        ...baseProps,
      }
    }
    case "object": {
      const properties: Record<string, FunctionDeclarationSchemaProperty> = {}
      if (prop.properties) {
        for (const [key, value] of Object.entries(prop.properties)) {
          properties[key] = convertProperty(value)
        }
      }
      return {
        type: SchemaType.OBJECT,
        properties,
        required: prop.required,
        ...baseProps,
      }
    }
  }
}

function convertJsonSchemaToGoogleSchema(
  schema: JsonSchema
): FunctionDeclarationSchema {
  const properties: Record<string, FunctionDeclarationSchemaProperty> = {}

  for (const [key, value] of Object.entries(schema.properties)) {
    properties[key] = convertProperty(value)
  }

  return {
    type: SchemaType.OBJECT,
    properties,
    required: schema.required,
    description: schema.description,
  }
}

function convertTools(tools: ToolDefinition[]): Tool[] {
  return [
    {
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: convertJsonSchemaToGoogleSchema(tool.parameters),
      })),
    },
  ]
}

function getSystemInstruction(
  messages: Message[],
  systemPrompt?: string
): string | undefined {
  const systemMessages = messages.filter((m) => m.role === "system")
  const parts = systemPrompt ? [systemPrompt] : []
  parts.push(...systemMessages.map((m) => getStringContent(m.content)))
  return parts.length > 0 ? parts.join("\n\n") : undefined
}

export function createGoogleProvider(config: ProviderConfig): LLMProvider {
  const genAI = new GoogleGenerativeAI(config.apiKey)

  return {
    name: "google",
    supportsTools: true,
    supportsStreaming: true,

    async chat(params: ChatParams): Promise<ChatResponse> {
      const systemInstruction = getSystemInstruction(
        params.messages,
        params.systemPrompt
      )
      const model = genAI.getGenerativeModel({
        model: config.modelId,
        systemInstruction,
        generationConfig: {
          temperature: params.temperature ?? config.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? config.maxTokens,
        },
        tools: params.tools ? convertTools(params.tools) : undefined,
      })

      const contents = convertMessages(params.messages)
      const result = await model.generateContent({ contents })
      const response = result.response
      const candidate = response.candidates?.[0]

      if (!candidate) {
        return { content: "", finishReason: "error" }
      }

      let content = ""
      const toolCalls: ChatResponse["toolCalls"] = []

      for (const part of candidate.content.parts) {
        if ("text" in part && part.text) {
          content += part.text
        }
        if ("functionCall" in part && part.functionCall) {
          toolCalls.push({
            id: `call_${Date.now()}_${toolCalls.length}`,
            name: part.functionCall.name,
            arguments: JSON.stringify(part.functionCall.args),
          })
        }
      }

      return {
        content,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        finishReason: toolCalls.length > 0 ? "tool_calls" : "stop",
      }
    },

    async *stream(params: ChatParams): AsyncIterable<StreamChunk> {
      const systemInstruction = getSystemInstruction(
        params.messages,
        params.systemPrompt
      )
      const model = genAI.getGenerativeModel({
        model: config.modelId,
        systemInstruction,
        generationConfig: {
          temperature: params.temperature ?? config.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? config.maxTokens,
        },
        tools: params.tools ? convertTools(params.tools) : undefined,
      })

      const contents = convertMessages(params.messages)
      const result = await model.generateContentStream({ contents })

      for await (const chunk of result.stream) {
        const candidate = chunk.candidates?.[0]
        if (!candidate) {
          continue
        }

        for (const part of candidate.content.parts) {
          if ("text" in part && part.text) {
            yield { type: "text_delta", content: part.text }
          }
          if ("functionCall" in part && part.functionCall) {
            yield {
              type: "tool_call_start",
              toolCall: {
                id: `call_${Date.now()}`,
                name: part.functionCall.name,
                arguments: JSON.stringify(part.functionCall.args),
              },
            }
          }
        }
      }

      yield { type: "done" }
    },
  }
}

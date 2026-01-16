import OpenAI from "openai";
import type {
  ChatParams,
  ChatResponse,
  LLMProvider,
  Message,
  MessageContent,
  ProviderConfig,
  StreamChunk,
  ToolDefinition,
} from "../types";

type OpenAIContent = string | OpenAI.ChatCompletionContentPart[];

function convertContent(content: MessageContent): OpenAIContent {
  if (typeof content === "string") {
    return content;
  }

  return content.map((part) => {
    if (part.type === "text") {
      return { type: "text" as const, text: part.text };
    }
    // Image content
    return {
      type: "image_url" as const,
      image_url: {
        url: `data:${part.mimeType};base64,${part.data}`,
      },
    };
  });
}

function getStringContent(content: MessageContent): string {
  if (typeof content === "string") {
    return content;
  }
  return content
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n");
}

function convertMessages(
  messages: Message[],
  systemPrompt?: string
): OpenAI.ChatCompletionMessageParam[] {
  const result: OpenAI.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    result.push({ role: "system", content: systemPrompt });
  }

  for (const msg of messages) {
    if (msg.role === "system") {
      result.push({ role: "system", content: getStringContent(msg.content) });
    } else if (msg.role === "user") {
      result.push({ role: "user", content: convertContent(msg.content) });
    } else if (msg.role === "assistant") {
      const textContent = getStringContent(msg.content);
      if (msg.toolCalls?.length) {
        result.push({
          role: "assistant",
          content: textContent || null,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        });
      } else {
        result.push({ role: "assistant", content: textContent });
      }
    } else if (msg.role === "tool" && msg.toolCallId) {
      result.push({
        role: "tool",
        tool_call_id: msg.toolCallId,
        content: getStringContent(msg.content),
      });
    }
  }

  return result;
}

function convertTools(tools: ToolDefinition[]): OpenAI.ChatCompletionTool[] {
  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: { ...tool.parameters },
    },
  }));
}

export function createOpenAIProvider(config: ProviderConfig): LLMProvider {
  const client = new OpenAI({ apiKey: config.apiKey });

  return {
    name: "openai",
    supportsTools: true,
    supportsStreaming: true,

    async chat(params: ChatParams): Promise<ChatResponse> {
      const messages = convertMessages(params.messages, params.systemPrompt);

      const response = await client.chat.completions.create({
        model: config.modelId,
        messages,
        tools: params.tools ? convertTools(params.tools) : undefined,
        temperature: params.temperature ?? config.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? config.maxTokens,
      });

      const choice = response.choices[0];
      const message = choice.message;

      return {
        content: message.content || "",
        toolCalls: message.tool_calls
          ?.filter(
            (
              tc
            ): tc is OpenAI.ChatCompletionMessageToolCall & {
              type: "function";
            } => tc.type === "function"
          )
          .map((tc) => ({
            id: tc.id,
            name: tc.function.name,
            arguments: tc.function.arguments,
          })),
        finishReason:
          choice.finish_reason === "tool_calls"
            ? "tool_calls"
            : choice.finish_reason === "length"
              ? "length"
              : "stop",
      };
    },

    async *stream(params: ChatParams): AsyncIterable<StreamChunk> {
      const messages = convertMessages(params.messages, params.systemPrompt);

      const stream = await client.chat.completions.create({
        model: config.modelId,
        messages,
        tools: params.tools ? convertTools(params.tools) : undefined,
        temperature: params.temperature ?? config.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? config.maxTokens,
        stream: true,
      });

      const toolCallBuffers: Map<
        number,
        { id: string; name: string; args: string }
      > = new Map();

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          yield { type: "text_delta", content: delta.content };
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCallBuffers.get(tc.index);

            if (!existing && tc.id) {
              toolCallBuffers.set(tc.index, {
                id: tc.id,
                name: tc.function?.name || "",
                args: tc.function?.arguments || "",
              });
              yield {
                type: "tool_call_start",
                toolCall: { id: tc.id, name: tc.function?.name },
              };
            } else if (existing) {
              if (tc.function?.name) {
                existing.name += tc.function.name;
              }
              if (tc.function?.arguments) {
                existing.args += tc.function.arguments;
              }
              yield {
                type: "tool_call_delta",
                toolCall: { arguments: tc.function?.arguments },
              };
            }
          }
        }

        if (chunk.choices[0]?.finish_reason) {
          yield { type: "done" };
        }
      }
    },
  };
}

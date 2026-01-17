/**
 * Text Agent Factory
 *
 * Creates text agents (chat/telegram) using OpenAI Agents SDK.
 * Uses the hardcoded CURRENT_MODEL for all users.
 */

import type { Agent as OpenAIAgent } from "@openai/agents"
import {
  type RunAgentUpdatedStreamEvent,
  type RunItemStreamEvent,
  type RunRawModelStreamEvent,
  run,
} from "@openai/agents"
import { buildBasePrompt } from "@/shared/prompts"

export type Modality = "chat" | "telegram" | "whatsapp"

export type TextAgentConfig = {
  systemPrompt: string
}

export type CreateTextAgentOptions = {
  modality: Modality
}

export type StreamEvent = {
  type:
    | "text_delta"
    | "tool_start"
    | "tool_complete"
    | "agent_switch"
    | "done"
    | "error"
  content?: string
  fullContent?: string
  toolName?: string
  fromAgent?: string
  toAgent?: string
  error?: string
}

export type RunTextAgentOptions = {
  prompt: string
  context?: Record<string, unknown>
  onEvent: (event: StreamEvent) => void | Promise<void>
}

/**
 * Build system prompt for text modality
 */
function buildSystemPrompt(modality: Modality): string {
  return buildBasePrompt({
    modality,
    conciseness: 0.7,
    responseStyle: "warm",
  })
}

/**
 * Create a text agent configuration
 */
export function createTextAgent(options: CreateTextAgentOptions): TextAgentConfig {
  const { modality } = options
  const systemPrompt = buildSystemPrompt(modality)

  return {
    systemPrompt,
  }
}

/**
 * Run text agent with OpenAI Agents SDK
 */
async function runWithAgentSDK(
  agent: OpenAIAgent,
  prompt: string,
  context: Record<string, unknown>,
  options: RunTextAgentOptions
): Promise<string> {
  let fullResponse = ""
  let currentAgent = agent.name

  const stream = await run(agent, prompt, {
    context,
    stream: true,
  })

  for await (const event of stream) {
    if (event.type === "raw_model_stream_event") {
      const rawEvent = event as RunRawModelStreamEvent
      const data = rawEvent.data
      if (
        "type" in data &&
        data.type === "model" &&
        "event" in data &&
        data.event &&
        typeof data.event === "object" &&
        "type" in data.event &&
        data.event.type === "response.output_text.delta" &&
        "delta" in data.event &&
        typeof data.event.delta === "string"
      ) {
        fullResponse += data.event.delta
        await options.onEvent({
          type: "text_delta",
          content: data.event.delta,
          fullContent: fullResponse,
        })
      }
    } else if (event.type === "agent_updated_stream_event") {
      const agentEvent = event as RunAgentUpdatedStreamEvent
      const newAgent = agentEvent.agent?.name
      if (newAgent && newAgent !== currentAgent) {
        await options.onEvent({
          type: "agent_switch",
          fromAgent: currentAgent,
          toAgent: newAgent,
        })
        currentAgent = newAgent
      }
    } else if (event.type === "run_item_stream_event") {
      const itemEvent = event as RunItemStreamEvent
      const item = itemEvent.item
      if (item?.type === "tool_call_item" && "name" in item) {
        await options.onEvent({
          type: "tool_start",
          toolName: String(item.name) || "unknown",
        })
      } else if (item?.type === "tool_call_output_item" && "name" in item) {
        await options.onEvent({
          type: "tool_complete",
          toolName: String(item.name) || "unknown",
        })
      }
    }
  }

  await stream.completed

  if (!fullResponse && stream.finalOutput) {
    fullResponse =
      typeof stream.finalOutput === "string"
        ? stream.finalOutput
        : String(stream.finalOutput)
    await options.onEvent({
      type: "text_delta",
      content: fullResponse,
      fullContent: fullResponse,
    })
  }

  await options.onEvent({ type: "done" })

  return fullResponse
}

export async function runTextAgent(
  _config: TextAgentConfig,
  options: RunTextAgentOptions & {
    openaiAgent: OpenAIAgent
  }
): Promise<string> {
  return runWithAgentSDK(
    options.openaiAgent,
    options.prompt,
    options.context || {},
    options
  )
}

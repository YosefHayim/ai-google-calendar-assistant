/**
 * Text Agent Factory
 *
 * Creates text agents (chat/telegram) from branded agent profiles.
 * For OpenAI profiles, uses the native OpenAI Agents SDK.
 * For other providers (Google, Anthropic), uses the multi-provider LLM layer.
 */

import {
  run,
  type RunRawModelStreamEvent,
  type RunAgentUpdatedStreamEvent,
  type RunItemStreamEvent,
} from "@openai/agents"
import type { Agent as OpenAIAgent } from "@openai/agents"
import type { AgentProfile } from "./agent-profiles"
import { getAgentProfile, DEFAULT_AGENT_PROFILE_ID } from "./agent-profiles"
import { isOpenAIProvider, createProviderFromProfile } from "@/shared/llm"
import type { LLMProvider, Message, ToolDefinition } from "@/shared/llm"
import { buildBasePrompt } from "@/shared/prompts"
import { executeTools } from "@/shared/tools/tool-executor"

export type Modality = "chat" | "telegram"

export interface TextAgentConfig {
  profile: AgentProfile
  systemPrompt: string
  provider: LLMProvider | null // null when using OpenAI Agents SDK
  useNativeAgentSDK: boolean
}

export interface CreateTextAgentOptions {
  profileId?: string
  modality: Modality
}

export interface StreamEvent {
  type: "text_delta" | "tool_start" | "tool_complete" | "agent_switch" | "done" | "error"
  content?: string
  fullContent?: string
  toolName?: string
  fromAgent?: string
  toAgent?: string
  error?: string
}

export interface RunTextAgentOptions {
  prompt: string
  context?: Record<string, unknown>
  tools?: ToolDefinition[]
  onEvent: (event: StreamEvent) => void | Promise<void>
}

/**
 * Build system prompt for text modality
 */
function buildSystemPrompt(profile: AgentProfile, modality: Modality): string {
  const basePrompt = buildBasePrompt({
    modality,
    conciseness: profile.personality.conciseness,
    responseStyle:
      profile.personality.conciseness > 0.8
        ? "concise"
        : profile.personality.casualness < 0.4
          ? "professional"
          : "warm",
  })

  if (profile.personality.notes) {
    return `${basePrompt}\n\n${profile.personality.notes}`
  }

  return basePrompt
}

/**
 * Create a text agent configuration from a profile
 */
export function createTextAgent(options: CreateTextAgentOptions): TextAgentConfig {
  const { profileId = DEFAULT_AGENT_PROFILE_ID, modality } = options

  const profile = getAgentProfile(profileId)
  const systemPrompt = buildSystemPrompt(profile, modality)
  const useNativeAgentSDK = isOpenAIProvider(profile)

  let provider: LLMProvider | null = null

  if (!useNativeAgentSDK) {
    provider = createProviderFromProfile(profile)
  }

  return {
    profile,
    systemPrompt,
    provider,
    useNativeAgentSDK,
  }
}

/**
 * Run text agent with OpenAI Agents SDK (for OpenAI profiles)
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
    fullResponse = typeof stream.finalOutput === "string"
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

const MAX_TOOL_ITERATIONS = 10

async function runWithProvider(
  provider: LLMProvider,
  systemPrompt: string,
  options: RunTextAgentOptions & { email?: string }
): Promise<string> {
  const messages: Message[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: options.prompt },
  ]

  let fullResponse = ""
  let iteration = 0

  try {
    while (iteration < MAX_TOOL_ITERATIONS) {
      iteration++
      const response = await provider.chat({
        messages,
        tools: options.tools,
        temperature: 0.7,
      })

      if (response.content) {
        fullResponse += response.content
        await options.onEvent({
          type: "text_delta",
          content: response.content,
          fullContent: fullResponse,
        })
      }

      if (response.finishReason === "tool_calls" && response.toolCalls?.length) {
        for (const tc of response.toolCalls) {
          await options.onEvent({
            type: "tool_start",
            toolName: tc.name,
          })
        }

        messages.push({
          role: "assistant",
          content: response.content || "",
          toolCalls: response.toolCalls,
        })

        if (options.email) {
          const results = await executeTools(response.toolCalls, { email: options.email })
          for (const result of results) {
            await options.onEvent({
              type: "tool_complete",
              toolName: result.name,
            })
            messages.push({
              role: "tool",
              content: result.error
                ? JSON.stringify({ error: result.error })
                : JSON.stringify(result.result),
              toolCallId: result.toolCallId,
              name: result.name,
            })
          }
        } else {
          for (const tc of response.toolCalls) {
            messages.push({
              role: "tool",
              content: JSON.stringify({ error: "No email context available for tool execution" }),
              toolCallId: tc.id,
              name: tc.name,
            })
          }
        }
        continue
      }

      break
    }

    await options.onEvent({ type: "done" })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    await options.onEvent({
      type: "error",
      error: errorMessage,
    })
    throw error
  }

  return fullResponse
}

export async function runTextAgent(
  config: TextAgentConfig,
  options: RunTextAgentOptions & {
    openaiAgent?: OpenAIAgent
    email?: string
  }
): Promise<string> {
  if (config.useNativeAgentSDK) {
    if (!options.openaiAgent) {
      throw new Error(
        "OpenAI profile requires passing the openaiAgent instance. " +
        "Use ORCHESTRATOR_AGENT or create a custom agent."
      )
    }
    return runWithAgentSDK(
      options.openaiAgent,
      options.prompt,
      options.context || {},
      options
    )
  }

  if (!config.provider) {
    throw new Error("Non-OpenAI profile requires a provider, but none was created")
  }

  return runWithProvider(config.provider, config.systemPrompt, {
    ...options,
    email: options.email,
  })
}

/**
 * Check if a profile supports tools (function calling)
 */
export function supportsTools(config: TextAgentConfig): boolean {
  if (config.useNativeAgentSDK) {
    return true // OpenAI Agents SDK always supports tools
  }
  return config.provider?.supportsTools ?? false
}

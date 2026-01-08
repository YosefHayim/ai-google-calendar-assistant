import * as openai from "@livekit/agents-plugin-openai"
import { voice, type llm } from "@livekit/agents"
import type { AgentProfile, VoiceStyle } from "./agent-profiles"
import { getAgentProfile, DEFAULT_AGENT_PROFILE_ID } from "./agent-profiles"
import { getModelSpec, getRealtimeModelId } from "./model-registry"
import { buildBasePrompt } from "@/shared/prompts"

function buildSystemPrompt(profile: AgentProfile): string {
  const basePrompt = buildBasePrompt({
    modality: "voice",
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

function mapVoiceStyle(style: VoiceStyle): "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" {
  return style
}

export interface VoiceAgentConfig {
  agent: voice.Agent
  realtimeModel: openai.realtime.RealtimeModel
  profile: AgentProfile
}

export interface CreateVoiceAgentOptions {
  profileId?: string
  tools: llm.ToolContext
}

export function createVoiceAgent(options: CreateVoiceAgentOptions): VoiceAgentConfig {
  const { profileId = DEFAULT_AGENT_PROFILE_ID, tools } = options

  const profile = getAgentProfile(profileId)
  const modelSpec = getModelSpec(profile)
  const realtimeModelId = getRealtimeModelId(profile)

  if (!realtimeModelId) {
    throw new Error(
      `Profile "${profile.id}" does not support realtime voice. ` +
      `Use a profile with supportsRealtime: true`
    )
  }

  const systemPrompt = buildSystemPrompt(profile)

  const agent = new voice.Agent({
    instructions: systemPrompt,
    tools,
  })

  const realtimeModel = new openai.realtime.RealtimeModel({
    model: realtimeModelId,
    voice: mapVoiceStyle(profile.voice.style),
    temperature: modelSpec.temperature,
    turnDetection: {
      type: "server_vad",
      threshold: 0.5,
      prefix_padding_ms: 300,
      silence_duration_ms: profile.personality.conciseness > 0.8 ? 400 : 500,
    },
  })

  return {
    agent,
    realtimeModel,
    profile,
  }
}

export interface AgentProfileResponse {
  id: string
  displayName: string
  tagline: string
  description: string
  tier: string
  supportsVoice: boolean
  supportsRealtime: boolean
}

export function formatProfileForClient(profile: AgentProfile): AgentProfileResponse {
  return {
    id: profile.id,
    displayName: profile.displayName,
    tagline: profile.tagline,
    description: profile.description,
    tier: profile.tier,
    supportsVoice: profile.capabilities.includes("voice"),
    supportsRealtime: profile.modelConfig.supportsRealtime,
  }
}

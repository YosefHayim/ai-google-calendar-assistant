import type { AgentProfile } from "./agent-profiles"

export type ModelProvider = "openai" | "google" | "anthropic"
export type ModelTier = "fast" | "balanced" | "powerful"

export interface ModelSpec {
  provider: ModelProvider
  modelId: string
  realtimeModelId?: string
  maxTokens: number
  temperature: number
  supportsTools: boolean
  supportsRealtime: boolean
}

const OPENAI_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "openai",
    modelId: "gpt-4.1-nano",
    realtimeModelId: "gpt-4o-mini-realtime-preview",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: true,
  },
  balanced: {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    realtimeModelId: "gpt-4o-realtime-preview-2024-12-17",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: true,
  },
  powerful: {
    provider: "openai",
    modelId: "gpt-5-mini",
    realtimeModelId: "gpt-4o-realtime-preview-2024-12-17",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
    supportsRealtime: true,
  },
}

const GOOGLE_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "google",
    modelId: "gemini-2.0-flash",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: false,
  },
  balanced: {
    provider: "google",
    modelId: "gemini-2.0-flash",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: false,
  },
  powerful: {
    provider: "google",
    modelId: "gemini-2.5-pro",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
    supportsRealtime: false,
  },
}

const ANTHROPIC_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "anthropic",
    modelId: "claude-3-5-haiku-latest",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: false,
  },
  balanced: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
    supportsRealtime: false,
  },
  powerful: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
    supportsRealtime: false,
  },
}

const MODEL_REGISTRY: Record<ModelProvider, Record<ModelTier, ModelSpec>> = {
  openai: OPENAI_MODELS,
  google: GOOGLE_MODELS,
  anthropic: ANTHROPIC_MODELS,
}

export function getModelSpec(profile: AgentProfile): ModelSpec {
  const { provider, tier } = profile.modelConfig
  const registry = MODEL_REGISTRY[provider]

  if (!registry) {
    return OPENAI_MODELS.balanced
  }

  return registry[tier] ?? OPENAI_MODELS.balanced
}

export function getRealtimeModelId(profile: AgentProfile): string | null {
  const spec = getModelSpec(profile)

  if (!spec.supportsRealtime || !spec.realtimeModelId) {
    return null
  }

  return spec.realtimeModelId
}

export function isRealtimeSupported(profile: AgentProfile): boolean {
  return profile.modelConfig.supportsRealtime && getRealtimeModelId(profile) !== null
}

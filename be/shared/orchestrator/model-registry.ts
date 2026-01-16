import type { AgentProfile } from "./agent-profiles";

export type ModelProvider = "openai" | "google" | "anthropic";
export type ModelTier = "fast" | "balanced" | "powerful";

export type ModelSpec = {
  provider: ModelProvider;
  modelId: string;
  maxTokens: number;
  temperature: number;
  supportsTools: boolean;
};

const OPENAI_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "openai",
    modelId: "gpt-4.1-nano",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
  },
  balanced: {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
  },
  powerful: {
    provider: "openai",
    modelId: "gpt-5-mini",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
  },
};

const GOOGLE_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "google",
    modelId: "gemini-2.0-flash",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
  },
  balanced: {
    provider: "google",
    modelId: "gemini-2.0-flash",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
  },
  powerful: {
    provider: "google",
    modelId: "gemini-2.5-pro",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
  },
};

const ANTHROPIC_MODELS: Record<ModelTier, ModelSpec> = {
  fast: {
    provider: "anthropic",
    modelId: "claude-3-5-haiku-latest",
    maxTokens: 1024,
    temperature: 0.7,
    supportsTools: true,
  },
  balanced: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 2048,
    temperature: 0.7,
    supportsTools: true,
  },
  powerful: {
    provider: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    maxTokens: 4096,
    temperature: 0.6,
    supportsTools: true,
  },
};

const MODEL_REGISTRY: Record<ModelProvider, Record<ModelTier, ModelSpec>> = {
  openai: OPENAI_MODELS,
  google: GOOGLE_MODELS,
  anthropic: ANTHROPIC_MODELS,
};

export function getModelSpec(profile: AgentProfile): ModelSpec {
  const { provider, tier } = profile.modelConfig;
  const registry = MODEL_REGISTRY[provider];

  if (!registry) {
    return OPENAI_MODELS.balanced;
  }

  return registry[tier] ?? OPENAI_MODELS.balanced;
}

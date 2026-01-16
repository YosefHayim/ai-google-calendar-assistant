import type { AgentProfile } from "@/shared/orchestrator/agent-profiles";
import { getModelSpec } from "@/shared/orchestrator/model-registry";
import { createAnthropicProvider } from "./providers/anthropic-provider";
import { createGoogleProvider } from "./providers/google-provider";
import { createOpenAIProvider } from "./providers/openai-provider";
import type { LLMProvider, ProviderConfig } from "./types";

function getApiKey(provider: string): string {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || "";
    case "google":
      return process.env.GOOGLE_API_KEY || "";
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY || "";
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export function createProviderFromProfile(profile: AgentProfile): LLMProvider {
  const modelSpec = getModelSpec(profile);
  const apiKey = getApiKey(modelSpec.provider);

  if (!apiKey) {
    throw new Error(
      `API key not configured for provider: ${modelSpec.provider}. ` +
        `Set ${modelSpec.provider.toUpperCase()}_API_KEY environment variable.`
    );
  }

  const config: ProviderConfig = {
    apiKey,
    modelId: modelSpec.modelId,
    temperature: modelSpec.temperature,
    maxTokens: modelSpec.maxTokens,
  };

  switch (modelSpec.provider) {
    case "openai":
      return createOpenAIProvider(config);
    case "google":
      return createGoogleProvider(config);
    case "anthropic":
      return createAnthropicProvider(config);
    default:
      throw new Error(`Unknown provider: ${modelSpec.provider}`);
  }
}

export function isOpenAIProvider(profile: AgentProfile): boolean {
  return profile.modelConfig.provider === "openai";
}

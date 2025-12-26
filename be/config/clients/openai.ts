import { setDefaultOpenAIKey, setTracingExportApiKey } from "@openai/agents";

import { env } from "../env";

export function initializeOpenAI(): void {
  setDefaultOpenAIKey(env.openAiApiKey);
  setTracingExportApiKey(env.openAiApiKey);
}

// Auto-initialize on import
initializeOpenAI();

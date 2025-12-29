import { setDefaultOpenAIKey, setTracingExportApiKey } from "@openai/agents";

import { env } from "../env";

/**
 * Set tracing export API key
 *
 * @description Initializes OpenAI for the tracing export.
 */
export function initializeOpenAI(): void {
  setDefaultOpenAIKey(env.openAiApiKey);
  setTracingExportApiKey(env.openAiApiKey);
}

// Auto-initialize on import
initializeOpenAI();

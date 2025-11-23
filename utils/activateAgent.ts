import { type Agent, run } from "@openai/agents";
import { AGENTS } from "@/ai-agents/agents";
import type { AGENTS_LIST } from "@/types";
import { asyncHandler } from "./asyncHandlers";

export interface AgentContext {
  conversationContext?: string;
  vectorSearchResults?: string;
}

export const activateAgent = asyncHandler(
  async (agentKey: AGENTS_LIST | Agent, prompt: string, context?: AgentContext) => {
    let agent: Agent;

    if (typeof agentKey === "string") {
      agent = AGENTS[agentKey];
    } else {
      agent = agentKey;
    }

    if (!agent) {
      throw new Error("The provided agent is not valid.");
    }

    if (!prompt) {
      throw new Error(`Please provide the prompt for the agent: ${agent.name}`);
    }

    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    if (context) {
      const contextParts: string[] = [];
      if (context.conversationContext) {
        contextParts.push(context.conversationContext);
      }
      if (context.vectorSearchResults) {
        contextParts.push(`\n## Relevant Context from Previous Conversations:\n${context.vectorSearchResults}`);
      }
      if (contextParts.length > 0) {
        enhancedPrompt = `${contextParts.join("\n\n")}\n\n## Current Request:\n${prompt}`;
      }
    }

    return await run(agent, enhancedPrompt);
  }
);

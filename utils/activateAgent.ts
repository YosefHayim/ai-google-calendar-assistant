import { type Agent, run } from "@openai/agents";
import { AGENTS, HANDS_OFF_AGENTS, ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import type { AGENTS_LIST, MODELS } from "@/types";
import { asyncHandler } from "./asyncHandlers";
import { ModelRouterService } from "@/services/ModelRouterService";

export interface AgentContext {
  conversationContext?: string;
  vectorSearchResults?: string;
  agentName?: string;
  chatId?: number;
  email?: string;
}

export interface ActivateAgentOptions {
  /** Manual model override */
  model?: MODELS;
  /** Enable automatic model routing based on task analysis */
  autoRoute?: boolean;
}

/**
 * Activate an agent with optional model routing
 * @param agentKey - Agent key from AGENTS_LIST or Agent instance
 * @param prompt - User prompt/request
 * @param context - Optional agent context (conversation history, vector search results, agent name)
 * @param options - Optional routing options (model override or autoRoute)
 * @returns Agent execution result
 */
export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST | Agent, prompt: string, context?: AgentContext, options?: ActivateAgentOptions) => {
  let agent: Agent;
  let selectedModel: MODELS | undefined;

  // Determine agent type for routing
  let agentType: string;
  if (typeof agentKey === "string") {
    agentType = agentKey;
  } else {
    agentType = agentKey.name;
  }

  // Handle model routing
  if (options?.autoRoute) {
    // Automatic routing: analyze task and select model
    const router = new ModelRouterService();
    const analysis = router.analyzeTask(prompt, context);
    const selection = router.selectModel(analysis, agentType);
    selectedModel = selection.model;
    agent = router.getAgentWithModel(agentType, selectedModel);
  } else if (options?.model) {
    // Manual model override
    selectedModel = options.model;
    const router = new ModelRouterService();
    agent = router.getAgentWithModel(agentType, selectedModel);
  } else {
    // Default behavior (backward compatible): use agent's configured model
    if (typeof agentKey === "string") {
      const agentKeyStr = agentKey as string;
      // Check for ORCHESTRATOR_AGENT first (not in AGENTS object)
      if (agentKeyStr === "calendar_orchestrator_agent" || agentKeyStr === "orchestrator") {
        agent = ORCHESTRATOR_AGENT;
      }
      // Try to find agent in AGENTS
      else if (agentKey in AGENTS) {
        agent = AGENTS[agentKey as keyof typeof AGENTS];
      }
      // Try HANDS_OFF_AGENTS
      else if (agentKey in HANDS_OFF_AGENTS) {
        agent = HANDS_OFF_AGENTS[agentKey as keyof typeof HANDS_OFF_AGENTS];
      } else {
        throw new Error(`Agent key "${agentKey}" not found`);
      }
    } else {
      agent = agentKey;
    }
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
    if (context.agentName) {
      contextParts.push(`\n## Agent Name: ${context.agentName}\nUse this name when addressing the user if appropriate.`);
    }
    if (context.email) {
      contextParts.push(
        `\n## User Email: ${context.email}\nUse this email when calling tools that require an email parameter. Do NOT ask the user for their email.`
      );
    }
    if (context.chatId) {
      contextParts.push(
        `\n## Chat ID: ${context.chatId}\nUse this chat ID when calling tools that require a chatId parameter (e.g., set_agent_name). Do NOT ask the user for the chat ID.`
      );
    }
    if (contextParts.length > 0) {
      enhancedPrompt = `${contextParts.join("\n\n")}\n\n## Current Request:\n${prompt}`;
      
      // Log context statistics for debugging
      const totalCharCount = enhancedPrompt.length;
      const promptCharCount = prompt.length;
      const contextCharCount = totalCharCount - promptCharCount;
      const approxTotalTokens = Math.ceil(totalCharCount / 4);
      const approxContextTokens = Math.ceil(contextCharCount / 4);
      
      console.log(`[Context Debug] Agent: ${agent.name}`);
      console.log(`[Context Debug] Context included:`, {
        hasConversationContext: !!context.conversationContext,
        hasVectorSearch: !!context.vectorSearchResults,
        hasAgentName: !!context.agentName,
        hasEmail: !!context.email,
        hasChatId: !!context.chatId,
      });
      console.log(`[Context Debug] Size:`, {
        promptChars: promptCharCount,
        contextChars: contextCharCount,
        totalChars: totalCharCount,
        approxPromptTokens: Math.ceil(promptCharCount / 4),
        approxContextTokens,
        approxTotalTokens,
      });
    } else {
      console.log(`[Context Debug] Agent: ${agent.name} - No context provided`);
    }
  } else {
    console.log(`[Context Debug] Agent: ${agent.name} - No context object provided`);
  }

  return await run(agent, enhancedPrompt);
});

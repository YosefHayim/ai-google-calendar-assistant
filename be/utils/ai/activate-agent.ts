import { type Agent, run, type Session } from "@openai/agents";
import { AGENTS } from "@/ai-agents";
import { createAgentSession, type CreateSessionOptions } from "@/ai-agents/sessions";
import type { AgentContext } from "@/ai-agents/tool-registry";
import type { AGENTS_LIST } from "@/types";
import { asyncHandler } from "../http/async-handlers";
import { logger } from "../logger";

export interface ActivateAgentOptions {
  /** Session for persistent memory - can be a Session instance or config to create one */
  session?: Session | CreateSessionOptions;
  /** User email for tool authentication - REQUIRED for calendar operations */
  email?: string;
  /** Additional context to pass to the agent (merged with email) */
  context?: Record<string, unknown>;
}

// Type for any agent (with or without specific context type)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAgent = Agent<any, any>;

/**
 * Activate an agent by key and prompt with optional session support
 *
 * @param {AGENTS_LIST | Agent} agentKey - The agent key or agent object.
 * @param {string} prompt - The prompt for the agent.
 * @param {ActivateAgentOptions} options - Optional session and context configuration.
 * @returns {Promise<string>} The response from the agent.
 *
 * @example
 * // Basic usage (no session)
 * const result = await activateAgent(ORCHESTRATOR_AGENT, "Create a meeting");
 *
 * @example
 * // With session for persistent memory
 * const result = await activateAgent(AGENTS.parseEventText, "Meeting tomorrow at 3pm", {
 *   session: {
 *     userId: "user123",
 *     agentName: "parse_event_text_agent",
 *     taskId: "conv456"
 *   }
 * });
 *
 * @example
 * // With pre-created session
 * const session = createAgentSession({ userId, agentName: "my_agent" });
 * const result = await activateAgent(agent, prompt, { session });
 */
export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST | AnyAgent, prompt: string, options?: ActivateAgentOptions) => {
  let agent: AnyAgent;
  logger.info(`AI: activateAgent called: agentKey: ${agentKey}`);

  if (typeof agentKey === "string") {
    agent = AGENTS[agentKey];
  } else {
    agent = agentKey;
  }

  if (!agent) {
    logger.error(`AI: activateAgent called: agent not found`);
    throw new Error("The provided agent is not valid.");
  }

  if (!prompt) {
    logger.error(`AI: activateAgent called: prompt not found`);
    throw new Error(`Please provide the prompt for the agent: ${agent.name}`);
  }

  // Build run options with context containing email
  const runOptions: { session?: Session; context?: AgentContext } = {};

  // Build context - email is REQUIRED for calendar tools
  const context: AgentContext = {
    email: options?.email || "",
    ...(options?.context as Partial<AgentContext>),
  };
  runOptions.context = context;

  if (options?.session) {
    // If session config object is passed, create the session
    if ("userId" in options.session && "agentName" in options.session) {
      runOptions.session = createAgentSession(options.session as CreateSessionOptions);
      logger.info(`AI: activateAgent: Created session for ${(options.session as CreateSessionOptions).agentName}`);
    } else {
      // It's already a Session instance
      runOptions.session = options.session as Session;
      logger.info(`AI: activateAgent: Using provided session instance`);
    }
  }

  logger.info(`AI: activateAgent: Running agent ${agent.name} with email: ${context.email}, session: ${!!runOptions.session}`);
  return await run(agent, prompt, runOptions);
});

/**
 * Run a worker agent with its own persistent session
 *
 * Convenience function for running worker agents that need to maintain
 * context across multiple invocations.
 *
 * @param agent - The agent to run
 * @param prompt - The prompt/input for the agent
 * @param sessionConfig - Configuration for the session
 * @returns The agent's final output
 *
 * @example
 * const result = await runWorkerWithSession(
 *   AGENTS.parseEventText,
 *   "Schedule a meeting with John tomorrow at 2pm",
 *   {
 *     userId: "user123",
 *     agentName: "parse_event_text_agent",
 *     taskId: conversationId,
 *     compaction: "responses",
 *     compactionConfig: { maxItems: 30 }
 *   }
 * );
 */
export async function runWorkerWithSession(agent: Agent, prompt: string, sessionConfig: CreateSessionOptions): Promise<string> {
  const session = createAgentSession(sessionConfig);

  logger.info(`AI: runWorkerWithSession: Running ${sessionConfig.agentName} with session`);

  const result = await run(agent, prompt, { session });

  const itemCount = (await session.getItems()).length;
  logger.info(`AI: runWorkerWithSession: Completed with ${itemCount} session items`);

  return result.finalOutput ?? "";
}

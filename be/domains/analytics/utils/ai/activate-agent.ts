import { type Agent, run, type Session } from "@openai/agents"
import { AGENTS } from "@/ai-agents/agents"
import {
  type CreateSessionOptions,
  createAgentSession,
} from "@/ai-agents/sessions/session-factory"
import type { AgentContext } from "@/ai-agents/tool-registry"
import type { AGENTS_LIST } from "@/types"
import { asyncHandler } from "@/lib/http/async-handlers"
import { logger } from "@/lib/logger"

export type ActivateAgentOptions = {
  /** Session for persistent memory - can be a Session instance or config to create one */
  session?: Session | CreateSessionOptions
  /** User email for tool authentication - REQUIRED for calendar operations */
  email?: string
  /** Additional context to pass to the agent (merged with email) */
  context?: Record<string, unknown>
}

// Type for any agent (with or without specific context type)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAgent = Agent<any, any>

/**
 * @description Activates and runs an AI agent with the specified prompt and configuration options.
 * Supports both agent keys (string identifiers) and direct Agent objects. Handles session
 * management for persistent memory across conversations, and builds the context required
 * for calendar tool authentication. This is the primary entry point for invoking AI agents
 * throughout the application.
 *
 * @param {AGENTS_LIST | Agent} agentKey - The agent identifier string (e.g., "parseEventText") or an Agent object instance
 * @param {string} prompt - The user input or instruction to send to the agent
 * @param {ActivateAgentOptions} [options] - Optional configuration for session and context
 * @param {Session | CreateSessionOptions} [options.session] - Session instance or config for persistent memory
 * @param {string} [options.email] - User email required for calendar operations and tool authentication
 * @param {Record<string, unknown>} [options.context] - Additional context data to pass to the agent
 * @returns {Promise<RunResult>} The complete run result from the agent, including finalOutput and execution details
 * @throws {Error} If the agent key is invalid or prompt is empty
 *
 * @example
 * // Basic usage (no session)
 * const result = await activateAgent(ORCHESTRATOR_AGENT, "Create a meeting");
 * console.log(result.finalOutput);
 *
 * @example
 * // With session for persistent memory
 * const result = await activateAgent(AGENTS.parseEventText, "Meeting tomorrow at 3pm", {
 *   session: {
 *     userId: "user123",
 *     agentName: "parse_event_text_agent",
 *     taskId: "conv456"
 *   },
 *   email: "user@example.com"
 * });
 *
 * @example
 * // With pre-created session
 * const session = createAgentSession({ userId, agentName: "my_agent" });
 * const result = await activateAgent(agent, prompt, { session });
 */
export const activateAgent = asyncHandler(
  async (
    agentKey: AGENTS_LIST | AnyAgent,
    prompt: string,
    options?: ActivateAgentOptions
  ) => {
    let agent: AnyAgent

    if (typeof agentKey === "string") {
      agent = AGENTS[agentKey]
    } else {
      agent = agentKey
    }

    if (!agent) {
      logger.error("AI: activateAgent called: agent not found")
      throw new Error("The provided agent is not valid.")
    }

    if (!prompt) {
      logger.error("AI: activateAgent called: prompt not found")
      throw new Error(`Please provide the prompt for the agent: ${agent.name}`)
    }

    // Build run options with context containing email
    const runOptions: { session?: Session; context?: AgentContext } = {}

    // Build context - email is REQUIRED for calendar tools
    const context: AgentContext = {
      email: options?.email || "",
      ...(options?.context as Partial<AgentContext>),
    }
    runOptions.context = context

    if (options?.session) {
      // If session config object is passed, create the session
      if ("userId" in options.session && "agentName" in options.session) {
        runOptions.session = createAgentSession(
          options.session as CreateSessionOptions
        )
      } else {
        // It's already a Session instance
        runOptions.session = options.session as Session
      }
    }
    return await run(agent, prompt, runOptions)
  }
)

/**
 * @description Runs a worker agent with its own persistent session for maintaining context
 * across multiple invocations. This is a convenience wrapper around the agent run function
 * that automatically creates and manages the session lifecycle. Ideal for agents that need
 * to remember previous interactions within a conversation or task.
 *
 * @param {Agent} agent - The agent instance to run (not an agent key)
 * @param {string} prompt - The user input or instruction to process
 * @param {CreateSessionOptions} sessionConfig - Configuration for creating the persistent session
 * @param {string} sessionConfig.userId - Unique identifier for the user
 * @param {string} sessionConfig.agentName - Name of the agent for session namespacing
 * @param {string} [sessionConfig.taskId] - Optional task/conversation ID for grouping related sessions
 * @param {string} [sessionConfig.compaction] - Memory compaction strategy (e.g., "responses")
 * @param {Object} [sessionConfig.compactionConfig] - Configuration for memory compaction
 * @returns {Promise<string>} The agent's final output text, or empty string if no output
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
 * console.log(`Parsed event: ${result}`);
 */
export async function runWorkerWithSession(
  agent: Agent,
  prompt: string,
  sessionConfig: CreateSessionOptions
): Promise<string> {
  const session = createAgentSession(sessionConfig)

  const result = await run(agent, prompt, { session })

  const _itemCount = (await session.getItems()).length

  return result.finalOutput ?? ""
}

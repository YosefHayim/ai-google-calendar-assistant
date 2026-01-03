import { type Agent, run } from "@openai/agents";
import { AGENTS } from "@/ai-agents";
import type { AGENTS_LIST } from "@/types";
import { asyncHandler } from "../http/async-handlers";
import { logger } from "../logger";

/**
 * Activate an agent by key and prompt
 *
 * @param {AGENTS_LIST | Agent} agentKey - The agent key or agent object.
 * @param {string} prompt - The prompt for the agent.
 * @returns {Promise<string>} The response from the agent.
 * @description Activates an agent by key and prompt and sends the response.
 * @example
 * const data = await activateAgent(agentKey, prompt);
 *
 */
export const activateAgent = asyncHandler(async (agentKey: AGENTS_LIST | Agent, prompt: string) => {
  let agent: Agent;
  logger.info(`AI: activateAgent called: agentKey: ${agentKey}`);
  logger.info(`AI: activateAgent called: prompt: ${prompt}`);
  if (typeof agentKey === "string") {
    agent = AGENTS[agentKey];
  } else {
    agent = agentKey;
  }
  logger.info(`AI: activateAgent called: agent: ${agent}`);
  if (!agent) {
    logger.error(`AI: activateAgent called: agent not found`);
    throw new Error("The provided agent is not valid.");
  }

  if (!prompt) {
    logger.error(`AI: activateAgent called: prompt not found`);
    throw new Error(`Please provide the prompt for the agent: ${agent.name}`);
  }
  logger.info(`AI: activateAgent called: prompt: ${prompt}`);
  return await run(agent, prompt);
});

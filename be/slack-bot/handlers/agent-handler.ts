import { InputGuardrailTripwireTriggered } from "@openai/agents";
import { ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { unifiedContextStore } from "@/shared/context";
import { activateAgent } from "@/utils/ai";
import { logger } from "@/utils/logger";
import {
  buildContextPrompt,
  slackConversation,
} from "../utils/conversation-history";
import { getSession, updateSession } from "../utils/session";
import { summarizeMessages } from "../utils/summarize";

type AgentRequestParams = {
  message: string;
  email: string;
  slackUserId: string;
  teamId: string;
};

const buildSlackPrompt = (
  email: string,
  message: string,
  conversationContext?: string,
  languageCode?: string
): string => {
  const timestamp = new Date().toISOString();
  const parts: string[] = [];

  parts.push(`Current date and time is ${timestamp}.`);
  parts.push(`User: ${email}`);
  parts.push("Platform: Slack");

  if (languageCode) {
    parts.push(
      `IMPORTANT: User's preferred language is "${languageCode}". You MUST respond in this language.`
    );
  }

  if (conversationContext) {
    parts.push(
      `\n--- Conversation History ---\n${conversationContext}\n--- End History ---`
    );
  }

  parts.push(`\nCurrent request: ${message}`);

  return parts.join("\n");
};

export const handleAgentRequest = async (
  params: AgentRequestParams
): Promise<string> => {
  const { message, email, slackUserId, teamId } = params;

  const session = getSession(slackUserId, teamId);

  if (session.isProcessing) {
    return "I'm still processing your previous request. Please wait a moment.";
  }

  updateSession(slackUserId, teamId, { isProcessing: true });

  const userUuid = await slackConversation.getUserIdFromSlack(slackUserId);

  if (userUuid) {
    await unifiedContextStore.setModality(userUuid, "chat");
    await unifiedContextStore.touch(userUuid);
  }

  try {
    const conversationContext = await slackConversation.addMessageToContext(
      slackUserId,
      teamId,
      { role: "user", content: message },
      summarizeMessages
    );

    const contextPrompt = buildContextPrompt(conversationContext);

    logger.info(
      `Slack Bot: Processing request for user ${slackUserId}, prompt length: ${message.length} chars`
    );

    const prompt = buildSlackPrompt(
      email,
      message,
      contextPrompt,
      session.codeLang
    );

    const result = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
      email,
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: `slack-${slackUserId}`,
          }
        : undefined,
    });
    const finalOutput = result.finalOutput || "";

    if (finalOutput) {
      await slackConversation.addMessageToContext(
        slackUserId,
        teamId,
        { role: "assistant", content: finalOutput },
        summarizeMessages
      );
    }

    if (finalOutput?.startsWith("CONFLICT_DETECTED::")) {
      return handleConflictResponse(slackUserId, teamId, finalOutput);
    }

    return finalOutput || "I couldn't generate a response. Please try again.";
  } catch (error) {
    if (error instanceof InputGuardrailTripwireTriggered) {
      logger.warn(
        `Slack Bot: Guardrail triggered for user ${slackUserId}: ${error.message}`
      );
      return error.message;
    }

    logger.error(
      `Slack Bot: Agent request error for user ${slackUserId}: ${JSON.stringify(error)}`
    );
    throw error;
  } finally {
    updateSession(slackUserId, teamId, { isProcessing: false });
  }
};

const handleConflictResponse = (
  slackUserId: string,
  teamId: string,
  output: string
): string => {
  const parts = output.split("::");

  if (parts.length < 3) {
    return output;
  }

  try {
    const conflictData = JSON.parse(parts[1]);
    const userMessage = parts.slice(2).join("::");

    updateSession(slackUserId, teamId, {
      pendingConfirmation: {
        eventData: conflictData.eventData,
        conflictingEvents: conflictData.conflictingEvents,
      },
    });

    return userMessage;
  } catch {
    logger.error("Slack Bot: Failed to parse conflict data");
    return output;
  }
};

export const handleConfirmation = async (
  slackUserId: string,
  teamId: string,
  email: string
): Promise<string> => {
  const session = getSession(slackUserId, teamId);
  const pending = session.pendingConfirmation;

  if (!pending) {
    return "No pending event to confirm.";
  }

  updateSession(slackUserId, teamId, {
    isProcessing: true,
    pendingConfirmation: undefined,
  });

  try {
    const userUuid = await slackConversation.getUserIdFromSlack(slackUserId);

    const timestamp = new Date().toISOString();
    const prompt = `Current date and time is ${timestamp}. User with email ${email} confirmed the creation of event despite conflicts. Create the event now with these details: ${JSON.stringify(pending.eventData)}`;

    const result = await activateAgent(ORCHESTRATOR_AGENT, prompt, {
      email,
      session: userUuid
        ? {
            userId: userUuid,
            agentName: ORCHESTRATOR_AGENT.name,
            taskId: `slack-${slackUserId}`,
          }
        : undefined,
    });
    const finalOutput = result.finalOutput || "";

    return finalOutput || "Event created successfully.";
  } catch (error) {
    logger.error(`Slack Bot: Confirmation error: ${error}`);
    return "Sorry, I couldn't create the event. Please try again.";
  } finally {
    updateSession(slackUserId, teamId, { isProcessing: false });
  }
};

export const handleCancellation = (
  slackUserId: string,
  teamId: string
): string => {
  updateSession(slackUserId, teamId, { pendingConfirmation: undefined });
  return "Event creation cancelled.";
};

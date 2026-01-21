import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { logger } from "@/lib/logger";
import { handleSlackAuth } from "../middleware/auth-handler";

import { checkRateLimit } from "../middleware/rate-limiter";
import { getSession, isDuplicateMessage } from "../utils/session";
import {
  handleAgentRequest,
  handleCancellation,
  handleConfirmation,
} from "./agent-handler";

const TYPING_EMOJI = "hourglass_flowing_sand";

async function addTypingIndicator(
  client: MessageArgs["client"],
  channel: string,
  timestamp: string
): Promise<void> {
  try {
    await client.reactions.add({
      channel,
      timestamp,
      name: TYPING_EMOJI,
    });
  } catch (error) {
    logger.debug(`Slack Bot: Failed to add typing indicator: ${error}`);
  }
}

async function removeTypingIndicator(
  client: MessageArgs["client"],
  channel: string,
  timestamp: string
): Promise<void> {
  try {
    await client.reactions.remove({
      channel,
      timestamp,
      name: TYPING_EMOJI,
    });
  } catch (error) {
    logger.debug(`Slack Bot: Failed to remove typing indicator: ${error}`);
  }
}

type MessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;
type AppMentionArgs = SlackEventMiddlewareArgs<"app_mention"> &
  AllMiddlewareArgs;

export const handleSlackMessage = async (args: MessageArgs): Promise<void> => {
  const { event, say, client } = args;

  if (!("text" in event && event.text)) {
    return;
  }

  if ("bot_id" in event && event.bot_id) {
    return;
  }

  const userId = event.user;
  if (!userId) {
    return;
  }

  const teamId = "team" in event ? (event.team as string) : "unknown";
  const ts = "ts" in event ? event.ts : "";

  if (isDuplicateMessage(userId, teamId, ts)) {
    return;
  }

  const text = event.text.trim();
  if (!text) {
    return;
  }

  logger.info(
    `Slack Bot: Received message from user ${userId}: "${text.substring(0, 50)}..."`
  );

  const rateCheck = checkRateLimit(userId, "message");
  if (!rateCheck.allowed) {
    await say(
      `You're sending messages too quickly. Please wait ${rateCheck.resetIn} seconds.`
    );
    return;
  }

  const authResult = await handleSlackAuth(client, userId, teamId, text);

  if (authResult.needsAuth) {
    await say(authResult.authMessage || "Please authenticate to use Ally.");
    return;
  }

  if (!authResult.session.email) {
    await say(
      "I couldn't find your email. Please enter your email address to get started."
    );
    return;
  }

  const session = getSession(userId, teamId);

  if (session.pendingConfirmation) {
    const lowerText = text.toLowerCase();
    if (lowerText === "yes" || lowerText === "confirm" || lowerText === "y") {
      const response = await handleConfirmation(
        userId,
        teamId,
        authResult.session.email
      );
      await say(response);
      return;
    }
    if (lowerText === "no" || lowerText === "cancel" || lowerText === "n") {
      const response = handleCancellation(userId, teamId);
      await say(response);
      return;
    }
  }

  const channel = "channel" in event ? (event.channel as string) : "";

  try {
    if (channel && ts) {
      await addTypingIndicator(client, channel, ts);
    }

    const response = await handleAgentRequest({
      message: text,
      email: authResult.session.email,
      slackUserId: userId,
      teamId,
    });

    await say(response);
  } catch (error) {
    logger.error(`Slack Bot: Error processing message: ${error}`);
    await say(
      "Sorry, I encountered an error processing your request. Please try again."
    );
  } finally {
    if (channel && ts) {
      await removeTypingIndicator(client, channel, ts);
    }
  }
};

export const handleAppMention = async (args: AppMentionArgs): Promise<void> => {
  const { event, say, client } = args;

  const text = event.text.replace(/<@[A-Z0-9]+>/gi, "").trim();
  const userId = event.user;
  const teamId = event.team || "unknown";
  const channel = event.channel;
  const ts = event.ts;

  if (!userId) {
    return;
  }

  logger.info(
    `Slack Bot: Received mention from user ${userId}: "${text.substring(0, 50)}..."`
  );

  const rateCheck = checkRateLimit(userId, "message");
  if (!rateCheck.allowed) {
    await say(
      `You're sending messages too quickly. Please wait ${rateCheck.resetIn} seconds.`
    );
    return;
  }

  const authResult = await handleSlackAuth(client, userId, teamId, text);

  if (authResult.needsAuth) {
    await say(authResult.authMessage || "Please authenticate to use Ally.");
    return;
  }

  if (!authResult.session.email) {
    await say(
      "I couldn't find your email. Please enter your email address to get started."
    );
    return;
  }

  if (!text) {
    await say("Hi! How can I help you with your calendar today?");
    return;
  }

  try {
    if (channel && ts) {
      await addTypingIndicator(client, channel, ts);
    }

    const response = await handleAgentRequest({
      message: text,
      email: authResult.session.email,
      slackUserId: userId,
      teamId,
    });

    await say(response);
  } catch (error) {
    logger.error(`Slack Bot: Error processing mention: ${error}`);
    await say(
      "Sorry, I encountered an error processing your request. Please try again."
    );
  } finally {
    if (channel && ts) {
      await removeTypingIndicator(client, channel, ts);
    }
  }
};

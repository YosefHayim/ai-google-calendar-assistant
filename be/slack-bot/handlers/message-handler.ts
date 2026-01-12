import type { SlackEventMiddlewareArgs, AllMiddlewareArgs } from "@slack/bolt"
import { logger } from "@/utils/logger"
import { handleAgentRequest, handleConfirmation, handleCancellation } from "./agent-handler"
import { handleSlackAuth } from "../middleware/auth-handler"
import { getSession, isDuplicateMessage } from "../utils/session"
import { checkRateLimit } from "../middleware/rate-limiter"

type MessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs
type AppMentionArgs = SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs

export const handleSlackMessage = async (args: MessageArgs): Promise<void> => {
  const { event, say, client } = args

  if (!("text" in event) || !event.text) {
    return
  }

  if ("bot_id" in event && event.bot_id) {
    return
  }

  const userId = event.user
  if (!userId) {
    return
  }

  const teamId = "team" in event ? (event.team as string) : "unknown"
  const ts = "ts" in event ? event.ts : ""

  if (isDuplicateMessage(userId, teamId, ts)) {
    return
  }

  const text = event.text.trim()
  if (!text) {
    return
  }

  logger.info(`Slack Bot: Received message from user ${userId}: "${text.substring(0, 50)}..."`)

  const rateCheck = checkRateLimit(userId, "message")
  if (!rateCheck.allowed) {
    await say({
      text: `You're sending messages too quickly. Please wait ${rateCheck.resetIn} seconds.`,
      thread_ts: ts,
    })
    return
  }

  const authResult = await handleSlackAuth(client, userId, teamId, text)

  if (authResult.needsAuth) {
    await say({
      text: authResult.authMessage || "Please authenticate to use Ally.",
      thread_ts: ts,
    })
    return
  }

  if (!authResult.session.email) {
    await say({
      text: "I couldn't find your email. Please enter your email address to get started.",
      thread_ts: ts,
    })
    return
  }

  const session = getSession(userId, teamId)

  if (session.pendingConfirmation) {
    const lowerText = text.toLowerCase()
    if (lowerText === "yes" || lowerText === "confirm" || lowerText === "y") {
      const response = await handleConfirmation(userId, teamId, authResult.session.email)
      await say({ text: response, thread_ts: ts })
      return
    }
    if (lowerText === "no" || lowerText === "cancel" || lowerText === "n") {
      const response = handleCancellation(userId, teamId)
      await say({ text: response, thread_ts: ts })
      return
    }
  }

  try {
    const response = await handleAgentRequest({
      message: text,
      email: authResult.session.email,
      slackUserId: userId,
      teamId,
    })

    await say({
      text: response,
      thread_ts: ts,
    })
  } catch (error) {
    logger.error(`Slack Bot: Error processing message: ${error}`)
    await say({
      text: "Sorry, I encountered an error processing your request. Please try again.",
      thread_ts: ts,
    })
  }
}

export const handleAppMention = async (args: AppMentionArgs): Promise<void> => {
  const { event, say, client } = args

  const text = event.text.replace(/<@[A-Z0-9]+>/gi, "").trim()
  const userId = event.user
  const teamId = event.team || "unknown"
  const ts = event.ts

  if (!userId) {
    return
  }

  logger.info(`Slack Bot: Received mention from user ${userId}: "${text.substring(0, 50)}..."`)

  const rateCheck = checkRateLimit(userId, "message")
  if (!rateCheck.allowed) {
    await say({
      text: `You're sending messages too quickly. Please wait ${rateCheck.resetIn} seconds.`,
      thread_ts: ts,
    })
    return
  }

  const authResult = await handleSlackAuth(client, userId, teamId, text)

  if (authResult.needsAuth) {
    await say({
      text: authResult.authMessage || "Please authenticate to use Ally.",
      thread_ts: ts,
    })
    return
  }

  if (!authResult.session.email) {
    await say({
      text: "I couldn't find your email. Please enter your email address to get started.",
      thread_ts: ts,
    })
    return
  }

  if (!text) {
    await say({
      text: "Hi! How can I help you with your calendar today?",
      thread_ts: ts,
    })
    return
  }

  try {
    const response = await handleAgentRequest({
      message: text,
      email: authResult.session.email,
      slackUserId: userId,
      teamId,
    })

    await say({
      text: response,
      thread_ts: ts,
    })
  } catch (error) {
    logger.error(`Slack Bot: Error processing mention: ${error}`)
    await say({
      text: "Sorry, I encountered an error processing your request. Please try again.",
      thread_ts: ts,
    })
  }
}

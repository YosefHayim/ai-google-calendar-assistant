import express from "express"
import { env, STATUS_RESPONSE } from "@/config"
import { logger } from "@/utils/logger"
import { getSlackReceiver } from "@/slack-bot/init-bot"

const router = express.Router()

/**
 * Slack Events API Endpoint
 *
 * Receives events from Slack (messages, app_mentions, etc.)
 * Request URL: https://your-domain/api/slack/events
 */
router.post("/events", async (req, res) => {
  try {
    const receiver = getSlackReceiver()
    if (!receiver) {
      logger.error("Slack events: Bot not initialized")
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      })
    }

    if (req.body?.type === "url_verification") {
      logger.info("Slack events: URL verification challenge received")
      return res.status(STATUS_RESPONSE.SUCCESS).json({
        challenge: req.body.challenge,
      })
    }

    return receiver.app(req, res)
  } catch (error) {
    logger.error("Slack events: Error processing event", { error })
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process event",
    })
  }
})

/**
 * Slack Slash Commands Endpoint
 *
 * Receives slash commands from Slack (/ally, /today, etc.)
 * Request URL: https://your-domain/api/slack/commands
 */
router.post("/commands", async (req, res) => {
  try {
    const receiver = getSlackReceiver()
    if (!receiver) {
      logger.error("Slack commands: Bot not initialized")
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      })
    }

    return receiver.app(req, res)
  } catch (error) {
    logger.error("Slack commands: Error processing command", { error })
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process command",
    })
  }
})

/**
 * Slack Interactive Components Endpoint
 *
 * Receives interactive component payloads (buttons, modals, etc.)
 * Request URL: https://your-domain/api/slack/interactions
 */
router.post("/interactions", async (req, res) => {
  try {
    const receiver = getSlackReceiver()
    if (!receiver) {
      logger.error("Slack interactions: Bot not initialized")
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Slack bot not initialized",
      })
    }

    return receiver.app(req, res)
  } catch (error) {
    logger.error("Slack interactions: Error processing interaction", { error })
    return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
      error: "Failed to process interaction",
    })
  }
})

/**
 * Health check for Slack bot
 */
router.get("/health", (_req, res) => {
  const receiver = getSlackReceiver()
  const isEnabled = env.integrations.slack.isEnabled

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: receiver && isEnabled ? "healthy" : "disabled",
    mode: "http",
  })
})

export default router

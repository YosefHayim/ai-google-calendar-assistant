import express from "express"
import { webhookCallback } from "grammy"
import { env, STATUS_RESPONSE } from "@/config"
import { logger } from "@/utils/logger"
import { getBot } from "@/telegram-bot/init-bot"

const router = express.Router()

/**
 * Telegram Webhook Endpoint
 *
 * This endpoint receives updates from Telegram when using webhook mode.
 * In production, this is more reliable than long-polling because:
 * - App Runner won't kill long-running connections during idle timeouts
 * - Auto-scaling won't create duplicate bot instances (no double replies)
 * - Lower latency for responding to messages
 *
 * Security:
 * - Validates X-Telegram-Bot-Api-Secret-Token header
 * - Returns 401 for invalid/missing tokens to prevent fake updates
 */
router.post(
  "/webhook",
  // Middleware to validate Telegram webhook secret
  (req, res, next) => {
    const webhookSecret = env.integrations.telegram.webhookSecret

    // If no webhook secret is configured, reject all requests
    if (!webhookSecret) {
      logger.warn("Telegram webhook: No webhook secret configured")
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Webhook not configured",
      })
    }

    // Validate the secret token header from Telegram
    const secretToken = req.headers["x-telegram-bot-api-secret-token"]

    if (secretToken !== webhookSecret) {
      logger.warn("Telegram webhook: Invalid secret token received", {
        hasToken: !!secretToken,
        ip: req.ip,
      })
      return res.status(STATUS_RESPONSE.UNAUTHORIZED).json({
        error: "Unauthorized",
      })
    }

    next()
  },
  // Grammy's webhook callback handler
  async (req, res) => {
    try {
      const bot = getBot()
      if (!bot) {
        logger.error("Telegram webhook: Bot not initialized")
        return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
          error: "Bot not initialized",
        })
      }

      // Use Grammy's webhookCallback adapter
      const handleUpdate = webhookCallback(bot, "express")
      return handleUpdate(req, res)
    } catch (error) {
      logger.error("Telegram webhook: Error processing update", { error })
      // Return 200 to prevent Telegram from retrying
      // (we don't want to spam our logs with retries for bad updates)
      return res.sendStatus(STATUS_RESPONSE.SUCCESS)
    }
  }
)

/**
 * Health check for Telegram bot
 * Useful for monitoring webhook status
 */
router.get("/health", (_req, res) => {
  const bot = getBot()
  const isEnabled = env.integrations.telegram.isEnabled
  const useWebhook = env.integrations.telegram.useWebhook

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: bot && isEnabled ? "healthy" : "disabled",
    mode: useWebhook ? "webhook" : "polling",
    webhookConfigured: !!env.integrations.telegram.webhookSecret,
  })
})

export default router

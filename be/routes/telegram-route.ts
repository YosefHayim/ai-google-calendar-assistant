import express from "express"
import { webhookCallback } from "grammy"
import { STATUS_RESPONSE } from "@/config/constants/http"
import { logger } from "@/lib/logger"
import { getBot, getBotStatus } from "@/telegram-bot/init-bot"

const router = express.Router()

// POST /webhook - Telegram webhook endpoint for receiving bot updates
router.post("/webhook", async (req, res) => {
  const updateId = req.body?.update_id
  const messageText = req.body?.message?.text?.substring(0, 50)
  const fromId = req.body?.message?.from?.id

  logger.info(
    `Telegram webhook: Received update ${updateId} from user ${fromId}: "${messageText || "(no text)"}"`
  )

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
    return res.sendStatus(STATUS_RESPONSE.SUCCESS)
  }
})

// GET /health - Telegram bot health check with detailed diagnostics
router.get("/health", (_req, res) => {
  const status = getBotStatus()

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: status.hasBot && status.isEnabled ? "healthy" : "disabled",
    ...status,
  })
})

export default router

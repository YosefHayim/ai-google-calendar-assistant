import express from "express";
import { webhookCallback } from "grammy";
import { env, STATUS_RESPONSE } from "@/config";
import { getBot } from "@/telegram-bot/init-bot";
import { logger } from "@/utils/logger";

const router = express.Router();

/**
 * Telegram Webhook Endpoint
 *
 * Receives updates from Telegram when using webhook mode.
 * More reliable than long-polling for App Runner:
 * - No idle timeout issues
 * - No duplicate bot instances with auto-scaling
 * - Lower latency for responding to messages
 */
router.post("/webhook", async (req, res) => {
  try {
    const bot = getBot();
    if (!bot) {
      logger.error("Telegram webhook: Bot not initialized");
      return res.status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR).json({
        error: "Bot not initialized",
      });
    }

    // Use Grammy's webhookCallback adapter
    const handleUpdate = webhookCallback(bot, "express");
    return handleUpdate(req, res);
  } catch (error) {
    logger.error("Telegram webhook: Error processing update", { error });
    // Return 200 to prevent Telegram from retrying
    return res.sendStatus(STATUS_RESPONSE.SUCCESS);
  }
});

/**
 * Health check for Telegram bot
 */
router.get("/health", (_req, res) => {
  const bot = getBot();
  const isEnabled = env.integrations.telegram.isEnabled;
  const useWebhook = env.integrations.telegram.useWebhook;

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: bot && isEnabled ? "healthy" : "disabled",
    mode: useWebhook ? "webhook" : "polling",
  });
});

export default router;

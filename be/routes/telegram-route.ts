import { STATUS_RESPONSE } from "@/config/constants/http";
import { env } from "@/config/env";
import express from "express";
import { getBot } from "@/telegram-bot/init-bot";
import { logger } from "@/lib/logger";
import { webhookCallback } from "grammy";

const router = express.Router();

// POST /webhook - Telegram webhook endpoint for receiving bot updates
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

// GET /health - Telegram bot health check
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

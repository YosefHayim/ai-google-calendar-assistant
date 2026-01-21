import { initializeJobScheduler } from "@/jobs";
import { initSlackBot } from "@/slack-bot";
import { startTelegramBot } from "@/telegram-bot/init-bot";
import { logger } from "@/lib/logger";
import { initWhatsApp } from "@/whatsapp-bot/init-whatsapp";

/**
 * Initializes heavy background services without blocking the main event loop.
 */
export const bootstrapServices = () => {
  setImmediate(async () => {
    try {
      // Initialize bots with individual error handling
      try {
        await startTelegramBot();
      } catch (err) {
        logger.error("Telegram Bot: Failed to initialize:", err);
      }

      try {
        initWhatsApp();
      } catch (err) {
        logger.error("WhatsApp: Failed to initialize:", err);
      }

      try {
        initSlackBot();
      } catch (err) {
        logger.error("Slack Bot: Failed to initialize:", err);
      }

      try {
        await initializeJobScheduler();
      } catch (err) {
        logger.error("Job Scheduler: Failed to initialize:", err);
      }

      logger.info("✅ All background services (Bots & Jobs) initialization attempted.");
    } catch (err) {
      logger.error("❌ Critical failure during background bootstrap:", err);
    }
  });
};

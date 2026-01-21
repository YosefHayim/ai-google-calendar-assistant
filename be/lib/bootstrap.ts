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
      startTelegramBot();
      initWhatsApp();
      initSlackBot();
      await initializeJobScheduler();

      logger.info("✅ All background services (Bots & Jobs) initialized.");
    } catch (err) {
      logger.error("❌ Critical failure during background bootstrap:", err);
    }
  });
};

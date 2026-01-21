import { initSlackBot } from "@/slack-bot";
import { initWhatsApp } from "@/whatsapp-bot/init-whatsapp";
import { initializeAgentRegistry } from "@/ai-agents/registry/agent-registry-service";
import { initializeJobScheduler } from "@/jobs";
import { logger } from "@/lib/logger";
import { startTelegramBot } from "@/telegram-bot/init-bot";

//* Initialize background services

export const bootstrapServices = () => {
  setImmediate(async () => {
    try {
      try {
        await initializeAgentRegistry();
      } catch (err) {
        logger.error("Agent Registry: Failed to initialize:", err);
      }

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

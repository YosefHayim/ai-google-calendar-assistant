import { run, type RunnerHandle } from "@grammyjs/runner"
import type { Bot } from "grammy"
import { env } from "@/config"
import { logger } from "@/utils/logger"
import {
  createBot,
  configureSession,
  configureMiddleware,
  registerBotCommands,
  type GlobalContext,
} from "./handlers/bot-config"
import { registerCallbackHandlers } from "./handlers/callback-handlers"
import { registerMessageHandler } from "./handlers/message-handler"

export type { GlobalContext }

// Bot instance - initialized lazily
let bot: Bot<GlobalContext> | null = null
let runnerHandle: RunnerHandle | null = null
let isInitialized = false

const MINUTES_IN_RETRY = 5
const SECONDS_IN_MINUTE = 60
const MS_IN_SECOND = 1000
const MAX_RETRY_TIME_MS = MINUTES_IN_RETRY * SECONDS_IN_MINUTE * MS_IN_SECOND

/**
 * Get the bot instance (for webhook handler)
 * Returns null if bot is not enabled or not initialized
 */
export const getBot = (): Bot<GlobalContext> | null => {
  return bot
}

/**
 * Initialize the bot instance with all middleware and handlers
 * This is called once at startup
 */
const initializeBot = (): Bot<GlobalContext> => {
  if (bot) return bot

  bot = createBot()
  configureSession(bot)
  configureMiddleware(bot)
  registerCallbackHandlers(bot)
  registerMessageHandler(bot)

  return bot
}

/**
 * Set up webhook with Telegram API
 * This tells Telegram to send updates to our webhook URL instead of polling
 */
const setupWebhook = async (botInstance: Bot<GlobalContext>): Promise<void> => {
  const webhookUrl = `${env.baseUrl}/api/telegram/webhook`
  const webhookSecret = env.integrations.telegram.webhookSecret

  try {
    // Delete any existing webhook first
    await botInstance.api.deleteWebhook({ drop_pending_updates: false })

    // Build webhook options
    const webhookOptions: Parameters<typeof botInstance.api.setWebhook>[1] = {
      // Allowed updates - specify which update types to receive
      allowed_updates: [
        "message",
        "callback_query",
        "inline_query",
        "chosen_inline_result",
        "my_chat_member",
      ],
      // Don't drop pending updates on webhook change
      drop_pending_updates: false,
    }

    // Add secret token if configured (recommended for security)
    if (webhookSecret) {
      webhookOptions.secret_token = webhookSecret
      logger.info("Telegram Bot: Webhook will use secret token validation")
    } else {
      logger.warn("Telegram Bot: No TELEGRAM_WEBHOOK_SECRET - webhook requests won't be validated!")
    }

    // Set the webhook
    await botInstance.api.setWebhook(webhookUrl, webhookOptions)

    logger.info(`Telegram Bot: Webhook set to ${webhookUrl}`)
  } catch (error) {
    logger.error(`Telegram Bot: Failed to set webhook: ${error}`)
    throw error
  }
}

/**
 * Start the bot in long-polling mode (development/fallback)
 * WARNING: Not recommended for production with App Runner due to:
 * - Idle timeout issues
 * - Duplicate bot instances with auto-scaling
 */
const startPolling = async (botInstance: Bot<GlobalContext>): Promise<void> => {
  // Delete any existing webhook before starting polling
  await botInstance.api.deleteWebhook({ drop_pending_updates: false })

  runnerHandle = run(botInstance, {
    runner: {
      maxRetryTime: MAX_RETRY_TIME_MS,
      retryInterval: "exponential",
      silent: false,
    },
  })

  logger.info("Telegram Bot: Started in polling mode")
}

/**
 * Start the Telegram bot
 * Automatically chooses webhook or polling mode based on environment
 *
 * Production (with TELEGRAM_WEBHOOK_SECRET): Uses webhooks
 * Development (or without secret): Uses long-polling
 */
export const startTelegramBot = async (): Promise<void> => {
  // Check if Telegram is enabled
  if (!env.integrations.telegram.isEnabled) {
    logger.info("Telegram Bot: Disabled (no access token)")
    return
  }

  // Prevent double initialization
  if (isInitialized) {
    logger.warn("Telegram Bot: Already initialized")
    return
  }

  try {
    // Initialize the bot
    const botInstance = initializeBot()

    // Register bot commands with Telegram
    await registerBotCommands(botInstance)

    // Choose mode based on environment
    if (env.integrations.telegram.useWebhook) {
      // Production: Use webhooks
      await setupWebhook(botInstance)
      logger.info("Telegram Bot: Running in webhook mode")
    } else {
      // Development: Use long-polling
      await startPolling(botInstance)
    }

    isInitialized = true

    // Set up graceful shutdown
    const stopBot = async (): Promise<void> => {
      logger.info("Telegram Bot: Shutting down...")

      if (runnerHandle) {
        await runnerHandle.stop()
        runnerHandle = null
      }

      // Remove webhook on shutdown (optional, but clean)
      if (bot && env.integrations.telegram.useWebhook) {
        try {
          await bot.api.deleteWebhook()
        } catch {
          // Ignore errors during shutdown
        }
      }

      bot = null
      isInitialized = false
    }

    process.once("SIGINT", stopBot)
    process.once("SIGTERM", stopBot)

    // Handle unhandled rejections gracefully
    process.on("unhandledRejection", (reason: unknown) => {
      if (
        reason instanceof Error &&
        (reason.message.includes("getUpdates") ||
          reason.message.includes("Network request"))
      ) {
        return
      }
      logger.error(`Telegram Bot: Unhandled rejection: ${reason}`)
    })
  } catch (error) {
    logger.error(`Telegram Bot: Failed to start: ${error}`)
    // In production, we want the container to restart if bot fails to start
    if (env.isProd) {
      throw error
    }
  }
}

import { Bot, session } from "grammy"
import type { BotError, Context, SessionFlavor } from "grammy"
import { authRateLimiter, messageRateLimiter } from "../middleware/rate-limiter"

import type { SessionData } from "@/types"
import { authTgHandler } from "../middleware/auth-tg-handler"
import { autoRetry } from "@grammyjs/auto-retry"
import { createRedisSessionStorage } from "../middleware/redis-session-storage"
import { env } from "@/config/env"
import { googleTokenTgHandler } from "../middleware/google-token-tg-handler"
import { logger } from "@/lib/logger"
import { sessionExpiryMiddleware } from "../middleware/session-expiry"
import { subscriptionGuardTelegram } from "../middleware/subscription-guard-tg"

export type GlobalContext = SessionFlavor<SessionData> & Context

const AUTO_RETRY_MAX_ATTEMPTS = 5
const AUTO_RETRY_MAX_DELAY_SECONDS = 30

export const createBot = (): Bot<GlobalContext> => {
  const bot = new Bot<GlobalContext>(env.telegramAccessToken ?? "")

  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: AUTO_RETRY_MAX_ATTEMPTS,
      maxDelaySeconds: AUTO_RETRY_MAX_DELAY_SECONDS,
      rethrowInternalServerErrors: false,
      rethrowHttpErrors: false,
    })
  )

  bot.catch((err: BotError<GlobalContext>) => {
    const ctx = err.ctx
    const error = err.error
    logger.error(
      `Telegram Bot: Error handling update ${ctx.update.update_id}: ${error}`
    )
  })

  return bot
}

export const configureSession = (bot: Bot<GlobalContext>): void => {
  bot.use(
    session({
      initial: (): SessionData => ({
        chatId: 0,
        codeLang: undefined,
        email: undefined,
        messageCount: 0,
        userId: 0,
        firstName: undefined,
        username: undefined,
        lastProcessedMsgId: 0,
        agentActive: false,
        isProcessing: false,
        pendingConfirmation: undefined,
        googleTokens: undefined,
        pendingEmailVerification: undefined,
        lastActivity: Date.now(),
        pendingEmailChange: undefined,
        awaitingEmailChange: undefined,
      }),
      getSessionKey: (ctx) => {
        // For most updates, use the user ID from ctx.from
        if (ctx.from?.id) {
          return ctx.from.id.toString()
        }

        // For updates without from (like channel posts, or certain bot updates),
        // use chat ID as fallback for session key
        if (ctx.chat?.id) {
          return `chat_${ctx.chat.id.toString()}`
        }

        // Last resort: use a default session key
        // This ensures session middleware doesn't fail
        return "unknown_session"
      },
      storage: createRedisSessionStorage<SessionData>(),
    })
  )
}

export const configureMiddleware = (bot: Bot<GlobalContext>): void => {
  // Note: staleMessageFilter is registered in init-bot.ts BEFORE session middleware
  // to skip session processing for old messages accumulated during server downtime
  bot.use(sessionExpiryMiddleware)
  bot.use(authRateLimiter)
  bot.use(authTgHandler)
  bot.use(googleTokenTgHandler)
  bot.use(subscriptionGuardTelegram)
  bot.use(messageRateLimiter)
}

export const BOT_COMMANDS = [
  { command: "today", description: "Today's schedule" },
  { command: "tomorrow", description: "Tomorrow's agenda" },
  { command: "week", description: "Week at a glance" },
  { command: "month", description: "Monthly overview" },
  { command: "free", description: "Find open slots" },
  { command: "busy", description: "View commitments" },
  { command: "create", description: "Schedule something" },
  { command: "update", description: "Reschedule or edit" },
  { command: "delete", description: "Cancel an event" },
  { command: "search", description: "Search calendar" },
  { command: "analytics", description: "Time insights" },
  { command: "calendars", description: "Your calendars" },
  { command: "aboutme", description: "What do you know about me?" },
  { command: "brain", description: "Teach Ally your preferences" },
  { command: "profile", description: "Choose AI profile" },
  { command: "astext", description: "Repeat last as text" },
  { command: "asvoice", description: "Repeat last as voice" },
  { command: "status", description: "Check connection" },
  { command: "settings", description: "Ally settings" },
  { command: "language", description: "Change language" },
  { command: "help", description: "How Ally helps" },
  { command: "feedback", description: "Give feedback" },
  { command: "exit", description: "End conversation" },
  { command: "website", description: "Open web dashboard" },
  { command: "reschedule", description: "Smart reschedule" },
]

export const registerBotCommands = async (
  bot: Bot<GlobalContext>
): Promise<void> => {
  try {
    await bot.api.setMyCommands(BOT_COMMANDS)
  } catch (error) {
    logger.error(`Telegram Bot: Failed to register commands: ${error}`)
  }
}

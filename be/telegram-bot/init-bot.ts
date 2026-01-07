import { run, type RunnerHandle } from "@grammyjs/runner"
import type { Context, SessionFlavor } from "grammy"
import type { SessionData } from "@/types"
import { logger } from "@/utils/logger"
import {
  createBot,
  configureSession,
  configureMiddleware,
  registerBotCommands,
} from "./handlers/bot-config"
import { registerCallbackHandlers } from "./handlers/callback-handlers"
import { registerMessageHandler } from "./handlers/message-handler"

export type GlobalContext = SessionFlavor<SessionData> & Context

const bot = createBot()

configureSession(bot)
configureMiddleware(bot)
registerCallbackHandlers(bot)
registerMessageHandler(bot)

let runnerHandle: RunnerHandle | null = null

const MINUTES_IN_RETRY = 5
const SECONDS_IN_MINUTE = 60
const MS_IN_SECOND = 1000
const MAX_RETRY_TIME_MS = MINUTES_IN_RETRY * SECONDS_IN_MINUTE * MS_IN_SECOND

export const startTelegramBot = async (): Promise<void> => {
  await registerBotCommands(bot)

  runnerHandle = run(bot, {
    runner: {
      maxRetryTime: MAX_RETRY_TIME_MS,
      retryInterval: "exponential",
      silent: false,
    },
  })

  const stopBot = async (): Promise<void> => {
    if (runnerHandle) {
      await runnerHandle.stop()
    }
    process.exit(0)
  }

  process.once("SIGINT", stopBot)
  process.once("SIGTERM", stopBot)

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
}

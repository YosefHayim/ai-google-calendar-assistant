import { App, type SlackEventMiddlewareArgs, type AllMiddlewareArgs } from "@slack/bolt"
import { env } from "@/config"
import { logger } from "@/utils/logger"
import { handleSlackMessage, handleAppMention } from "./handlers/message-handler"
import { parseAndRouteCommand } from "./handlers/commands"

let app: App | null = null
let isInitialized = false

export const getSlackApp = (): App | null => {
  return app
}

const initializeApp = (): App => {
  if (app) return app

  app = new App({
    token: env.integrations.slack.botToken,
    signingSecret: env.integrations.slack.signingSecret,
    appToken: env.integrations.slack.appToken,
    socketMode: true,
  })

  app.message(async (args) => {
    await handleSlackMessage(args as SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs)
  })

  app.event("app_mention", async (args) => {
    await handleAppMention(args as SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs)
  })

  app.command("/ally", async (args) => {
    await args.ack()
    await parseAndRouteCommand(args)
  })

  app.command("/today", async (args) => {
    await args.ack()
    args.command.text = "today"
    await parseAndRouteCommand(args)
  })

  app.command("/tomorrow", async (args) => {
    await args.ack()
    args.command.text = "tomorrow"
    await parseAndRouteCommand(args)
  })

  app.command("/week", async (args) => {
    await args.ack()
    args.command.text = "week"
    await parseAndRouteCommand(args)
  })

  app.command("/free", async (args) => {
    await args.ack()
    args.command.text = "free"
    await parseAndRouteCommand(args)
  })

  app.action(/^confirm_event_/, async ({ ack, body, client }) => {
    await ack()
    logger.info(`Slack Bot: Event confirmation action from ${body.user.id}`)
  })

  app.action(/^cancel_event_/, async ({ ack, body, client }) => {
    await ack()
    logger.info(`Slack Bot: Event cancellation action from ${body.user.id}`)
  })

  app.error(async (error) => {
    logger.error(`Slack Bot: Error: ${error.message}`)
  })

  return app
}

export const startSlackBot = async (): Promise<void> => {
  if (!env.integrations.slack.isEnabled) {
    logger.info("Slack Bot: Disabled (missing credentials)")
    return
  }

  if (isInitialized) {
    logger.warn("Slack Bot: Already initialized")
    return
  }

  try {
    const slackApp = initializeApp()

    await slackApp.start()
    isInitialized = true

    logger.info("Slack Bot: Started in Socket Mode")
    logger.info("Slack Bot: Listening for messages and commands")

    const stopBot = async (): Promise<void> => {
      logger.info("Slack Bot: Shutting down...")

      if (app) {
        await app.stop()
        app = null
      }

      isInitialized = false
    }

    process.once("SIGINT", stopBot)
    process.once("SIGTERM", stopBot)
  } catch (error) {
    logger.error(`Slack Bot: Failed to start: ${error}`)
    if (env.isProd) {
      throw error
    }
  }
}

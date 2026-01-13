import {
  App,
  ExpressReceiver,
  type SlackEventMiddlewareArgs,
  type AllMiddlewareArgs,
} from "@slack/bolt"
import { env } from "@/config"
import { logger } from "@/utils/logger"
import { handleSlackMessage, handleAppMention } from "./handlers/message-handler"
import { parseAndRouteCommand } from "./handlers/commands"

let app: App | null = null
let receiver: ExpressReceiver | null = null
let isInitialized = false

export const getSlackApp = (): App | null => {
  return app
}

export const getSlackReceiver = (): ExpressReceiver | null => {
  return receiver
}

const initializeApp = (): { app: App; receiver: ExpressReceiver } => {
  if (app && receiver) return { app, receiver }

  receiver = new ExpressReceiver({
    signingSecret: env.integrations.slack.signingSecret || "",
    processBeforeResponse: true,
  })

  app = new App({
    token: env.integrations.slack.botToken,
    signingSecret: env.integrations.slack.signingSecret,
    receiver,
  })

  app.message(async (args) => {
    await handleSlackMessage(
      args as SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs
    )
  })

  app.event("app_mention", async (args) => {
    await handleAppMention(
      args as SlackEventMiddlewareArgs<"app_mention"> & AllMiddlewareArgs
    )
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

  app.action(/^confirm_event_/, async ({ ack, body }) => {
    await ack()
    logger.info(`Slack Bot: Event confirmation action from ${body.user.id}`)
  })

  app.action(/^cancel_event_/, async ({ ack, body }) => {
    await ack()
    logger.info(`Slack Bot: Event cancellation action from ${body.user.id}`)
  })

  app.error(async (error) => {
    logger.error(`Slack Bot: Error: ${error.message}`)
  })

  return { app, receiver }
}

export const initSlackBot = (): ExpressReceiver | null => {
  if (!env.integrations.slack.isEnabled) {
    logger.info("Slack Bot: Disabled (missing credentials)")
    return null
  }

  if (isInitialized && receiver) {
    logger.warn("Slack Bot: Already initialized")
    return receiver
  }

  try {
    const { receiver: slackReceiver } = initializeApp()
    isInitialized = true

    logger.info("Slack Bot: Initialized in HTTP mode")
    logger.info("Slack Bot: Listening for events at /api/slack/events")
    logger.info("Slack Bot: Listening for commands at /api/slack/commands")
    logger.info("Slack Bot: Listening for interactions at /api/slack/interactions")

    return slackReceiver
  } catch (error) {
    logger.error(`Slack Bot: Failed to initialize: ${error}`)
    if (env.isProd) {
      throw error
    }
    return null
  }
}

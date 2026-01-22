import {
  type AllMiddlewareArgs,
  App,
  ExpressReceiver,
  type SlackEventMiddlewareArgs,
} from "@slack/bolt"
import { WebClient } from "@slack/web-api"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"
import { parseAndRouteCommand } from "./handlers/commands"
import {
  handleAppMention,
  handleSlackMessage,
} from "./handlers/message-handler"
import { handleFileShared } from "./handlers/file-handler"
import { getWorkspaceToken } from "./services/oauth-service"

let app: App | null = null
let receiver: ExpressReceiver | null = null
let isInitialized = false

const workspaceClients = new Map<string, WebClient>()

export const getSlackApp = (): App | null => app

export const getSlackReceiver = (): ExpressReceiver | null => receiver

export const getClientForTeam = async (
  teamId: string
): Promise<WebClient | null> => {
  const cached = workspaceClients.get(teamId)
  if (cached) {
    return cached
  }

  const token = await getWorkspaceToken(teamId)
  if (!token) {
    if (env.integrations.slack.botToken) {
      return new WebClient(env.integrations.slack.botToken)
    }
    return null
  }

  const client = new WebClient(token)
  workspaceClients.set(teamId, client)
  return client
}

export const clearClientCache = (teamId?: string): void => {
  if (teamId) {
    workspaceClients.delete(teamId)
  } else {
    workspaceClients.clear()
  }
}

const initializeApp = (): { app: App; receiver: ExpressReceiver } => {
  if (app && receiver) {
    return { app, receiver }
  }

  receiver = new ExpressReceiver({
    signingSecret: env.integrations.slack.signingSecret || "",
    processBeforeResponse: true,
  })

  const authorizeFn = async ({ teamId }: { teamId?: string }) => {
    if (!teamId) {
      throw new Error("No team ID provided")
    }

    const token = await getWorkspaceToken(teamId)
    if (token) {
      return { botToken: token }
    }

    if (env.integrations.slack.botToken) {
      return { botToken: env.integrations.slack.botToken }
    }

    throw new Error(`No token found for team ${teamId}`)
  }

  app = new App({
    signingSecret: env.integrations.slack.signingSecret,
    receiver,
    authorize: authorizeFn,
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

  app.event("file_shared", async (args) => {
    await handleFileShared(
      args as SlackEventMiddlewareArgs<"file_shared"> & AllMiddlewareArgs
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

    logger.info("Slack Bot: Initialized in HTTP mode (multi-workspace)")
    logger.info("Slack Bot: OAuth install URL: /api/slack/oauth/install")
    logger.info("Slack Bot: Events endpoint: /api/slack/events")
    logger.info("Slack Bot: Commands endpoint: /api/slack/commands")
    logger.info("Slack Bot: Interactions endpoint: /api/slack/interactions")

    return slackReceiver
  } catch (error) {
    logger.error(`Slack Bot: Failed to initialize: ${error}`)
    if (env.isProd) {
      throw error
    }
    return null
  }
}

import {
  ROUTES,
  STATUS_RESPONSE,
  env,
  getConnectedUserCount,
  getSocketServer,
} from "@/config"

import type { Express } from "express"
import aclRoute from "@/domains/calendar/routes/acl-route"
import adminRoute from "@/domains/admin/routes/admin-route"
import affiliateRoute from "@/domains/marketing/routes/affiliate-route"
import blogRoute from "@/domains/marketing/routes/blog-route"
import calendarListRoute from "@/domains/calendar/routes/calendar-list-route"
import calendarRoute from "@/domains/calendar/routes/calendar-route"
import channelsRoute from "@/domains/calendar/routes/channels-route"
import chatRoute from "@/domains/calendar/routes/chat-route"
import contactRoute from "@/domains/marketing/routes/contact-route"
import cronRoute from "@/domains/cron/routes/cron-route"
import eventsRoute from "@/domains/calendar/routes/events-route"
import featureFlagRoute from "@/domains/settings/routes/feature-flag-route"
import gapsRoute from "@/domains/gaps/routes/gaps-route"
import { getActiveConnectionCount } from "@/config/clients"
import { getBot } from "@/telegram-bot/init-bot"
import { getSlackReceiver } from "@/slack-bot/init-bot"
import { logger } from "@/lib/logger"
import newsletterRoute from "@/domains/marketing/routes/newsletter-route"
import paymentRoute from "@/domains/payments/routes/payment-route"
import referralRoute from "@/domains/marketing/routes/referral-route"
import riscRoute from "@/domains/auth/routes/risc-route"
import { sendR } from "@/lib/http"
import sharedRoute from "./shared-route"
import slackRoute from "@/domains/slack/routes/slack-route"
import storageRoute from "@/domains/storage/routes/storage-route"
import teamInviteRoute from "@/domains/teams/routes/team-invite-route"
import telegramRoute from "./telegram-route"
import timezonesRoute from "@/domains/calendar/routes/timezones-route"
import usersRoute from "@/domains/auth/routes/users-route"
import voiceRoute from "@/domains/voice/routes/voice-route"
import waitingListRoute from "@/domains/marketing/routes/waiting-list-route"
import webhooksRoute from "./webhooks-route"
import whatsAppRoute from "./whatsapp-route"

const getServiceStatus = (service: unknown, isEnabled: boolean) => {
  if (!isEnabled) return "disabled"
  return service ? "healthy" : "unavailable"
}

const routesConfig = {
  [ROUTES.USERS]: usersRoute,
  [ROUTES.CALENDAR_LIST]: calendarListRoute,
  [ROUTES.CALENDAR]: calendarRoute,
  [ROUTES.EVENTS]: eventsRoute,
  [ROUTES.ACL]: aclRoute,
  [ROUTES.CHANNELS]: channelsRoute,
  [ROUTES.WHATSAPP]: whatsAppRoute,
  [ROUTES.CHAT]: chatRoute,
  [ROUTES.PAYMENTS]: paymentRoute,
  [ROUTES.CONTACT]: contactRoute,
  [ROUTES.WEBHOOKS]: webhooksRoute,
  [ROUTES.VOICE]: voiceRoute,
  [ROUTES.ADMIN]: adminRoute,
  [ROUTES.AFFILIATES]: affiliateRoute,
  [ROUTES.CRON]: cronRoute,
  [ROUTES.TELEGRAM]: telegramRoute,
  [ROUTES.RISC]: riscRoute,
  [ROUTES.SLACK]: slackRoute,
  [ROUTES.SHARED]: sharedRoute,
  [ROUTES.NEWSLETTER]: newsletterRoute,
  [ROUTES.WAITING_LIST]: waitingListRoute,
  [ROUTES.REFERRAL]: referralRoute,
  [ROUTES.TEAMS]: teamInviteRoute,
  [ROUTES.BLOG]: blogRoute,
  [ROUTES.FEATURE_FLAGS]: featureFlagRoute,
  [ROUTES.GAPS]: gapsRoute,
  [ROUTES.TIMEZONES]: timezonesRoute,
  [ROUTES.STORAGE]: storageRoute,
}

export const initializeRoutes = (app: Express) => {
  app.get("/health", (_req, res) => {
    res.status(STATUS_RESPONSE.SUCCESS).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        websockets: {
          status: getServiceStatus(getSocketServer(), true),
          connectedUsers: getConnectedUserCount(),
          activeConnections: getActiveConnectionCount(),
        },
        telegram: {
          status: getServiceStatus(
            getBot(),
            env.integrations.telegram.isEnabled
          ),
          mode: env.integrations.telegram.useWebhook ? "webhook" : "polling",
        },
        slack: {
          status: getServiceStatus(
            getSlackReceiver(),
            env.integrations.slack.isEnabled
          ),
          mode: "http",
        },
      },
    })
  })

  for (const [path, handler] of Object.entries(routesConfig)) {
    app.use(path, handler)
  }

  app.use((_req, res, _next) => {
    logger.error(
      `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`
    )
    console.error(
      "Opps! It looks like this route doesn't exist:",
      _req.originalUrl
    )
    sendR(
      res,
      STATUS_RESPONSE.NOT_FOUND,
      `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`
    )
  })
}

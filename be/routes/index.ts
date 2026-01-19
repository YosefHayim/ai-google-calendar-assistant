import { ROUTES, STATUS_RESPONSE, env, getConnectedUserCount, getSocketServer } from "@/config";

import type { Express } from "express";
import aclRoute from "./google-calendar/acl-route";
import adminRoute from "./admin-route";
import affiliateRoute from "./affiliate-route";
import blogRoute from "./blog-route";
import calendarListRoute from "./google-calendar/calendar-list-route";
import calendarRoute from "./google-calendar/calendar-route";
import channelsRoute from "./google-calendar/channels-route";
import chatRoute from "./google-calendar/chat-route";
import contactRoute from "./contact-route";
import cronRoute from "./cron-route";
import eventsRoute from "./google-calendar/events-route";
import featureFlagRoute from "./feature-flag-route";
import gapsRoute from "./gaps-route";
import { getActiveConnectionCount } from "@/config/clients";
import { getBot } from "@/telegram-bot/init-bot";
import { getSlackReceiver } from "@/slack-bot/init-bot";
import { logger } from "@/utils/logger";
import newsletterRoute from "./newsletter-route";
import paymentRoute from "./payment-route";
import referralRoute from "./referral-route";
import riscRoute from "./risc-route";
import { sendR } from "@/utils";
import sharedRoute from "./shared-route";
import slackRoute from "./slack-route";
import teamInviteRoute from "./team-invite-route";
import telegramRoute from "./telegram-route";
import timezonesRoute from "./timezones-route";
import usersRoute from "./users-route";
import voiceRoute from "./voice-route";
import waitingListRoute from "./waiting-list-route";
import webhooksRoute from "./webhooks-route";
import whatsAppRoute from "./whatsapp-route";

export const initializeRoutes = (app: Express) => {

  // GET /health - Application health check
  app.get("/health", (_req, res) => {
    const socketServer = getSocketServer();
    const telegramBot = getBot();
    const slackReceiver = getSlackReceiver();
  
    const websocketsStatus = socketServer
      ? "healthy"
      : "unavailable";
    const telegramStatus = telegramBot && env.integrations.telegram.isEnabled
      ? "healthy"
      : env.integrations.telegram.isEnabled
        ? "unavailable"
        : "disabled";
    const slackStatus = slackReceiver && env.integrations.slack.isEnabled
      ? "healthy"
      : env.integrations.slack.isEnabled
        ? "unavailable"
        : "disabled";
  
    res.status(STATUS_RESPONSE.SUCCESS).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        websockets: {
          status: websocketsStatus,
          connectedUsers: getConnectedUserCount(),
          activeConnections: getActiveConnectionCount(),
        },
        telegram: {
          status: telegramStatus,
          mode: env.integrations.telegram.useWebhook ? "webhook" : "polling",
        },
        slack: {
          status: slackStatus,
          mode: "http",
        },
      },
    });
  });

app.use(ROUTES.USERS, usersRoute);
app.use(ROUTES.CALENDAR_LIST, calendarListRoute);
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.EVENTS, eventsRoute);
app.use(ROUTES.ACL, aclRoute);
app.use(ROUTES.CHANNELS, channelsRoute);
app.use(ROUTES.WHATSAPP, whatsAppRoute);
app.use(ROUTES.CHAT, chatRoute);
app.use(ROUTES.PAYMENTS, paymentRoute);
app.use(ROUTES.CONTACT, contactRoute);
app.use(ROUTES.WEBHOOKS, webhooksRoute);
app.use(ROUTES.VOICE, voiceRoute);
app.use(ROUTES.ADMIN, adminRoute);
app.use(ROUTES.AFFILIATES, affiliateRoute);
app.use(ROUTES.CRON, cronRoute);
app.use(ROUTES.TELEGRAM, telegramRoute);
app.use(ROUTES.RISC, riscRoute);
app.use(ROUTES.SLACK, slackRoute);
app.use(ROUTES.SHARED, sharedRoute);
app.use(ROUTES.NEWSLETTER, newsletterRoute);
app.use(ROUTES.WAITING_LIST, waitingListRoute);
app.use(ROUTES.REFERRAL, referralRoute);
app.use(ROUTES.TEAMS, teamInviteRoute);
app.use(ROUTES.BLOG, blogRoute);
app.use(ROUTES.FEATURE_FLAGS, featureFlagRoute);
app.use(ROUTES.GAPS, gapsRoute);
app.use(ROUTES.TIMEZONES, timezonesRoute);

app.use((_req, res, _next) => {
  logger.error(`Opps! It looks like this route doesn't exist. ${_req.originalUrl}`);
  console.error("Opps! It looks like this route doesn't exist:", _req.originalUrl);
  sendR(res, STATUS_RESPONSE.NOT_FOUND, `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`);
});

};
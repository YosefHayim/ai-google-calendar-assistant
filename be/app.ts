import { createServer } from "node:http"
import { ROUTES, STATUS_RESPONSE, env } from "@/config";
import {
  getActiveConnectionCount,
  getConnectedUserCount,
  initSocketServer,
  shutdownSocketServer,
} from "@/config/clients/socket-server"
import { initializeJobScheduler, shutdownJobScheduler } from "@/jobs";

import aclRoute from "@/routes/google-calendar/acl-route";
import adminRoute from "@/routes/admin-route";
import affiliateRoute from "@/routes/affiliate-route";
import { apiRateLimiter } from "@/middlewares/rate-limiter";
import blogRoute from "@/routes/blog-route";
import calendarListRoute from "@/routes/google-calendar/calendar-list-route";
import calendarRoute from "@/routes/google-calendar/calendar-route";
import channelsRoute from "@/routes/google-calendar/channels-route";
import chatRoute from "@/routes/google-calendar/chat-route";
import contactRoute from "@/routes/contact-route";
import cookieParser from "cookie-parser";
import cors from "cors";
import cronRoute from "@/routes/cron-route";
import errorHandler from "@/middlewares/error-handler";
import eventsRoute from "@/routes/google-calendar/events-route";
import express from "express";
import featureFlagRoute from "@/routes/feature-flag-route";
import helmet from "helmet";
import { initSlackBot } from "@/slack-bot";
import { initWhatsApp } from "@/whatsapp-bot/init-whatsapp";
import { logger } from "@/utils/logger";
import morgan from "morgan";
import newsletterRoute from "@/routes/newsletter-route";
import path from "node:path";
import paymentRoute from "@/routes/payment-route";
import referralRoute from "@/routes/referral-route";
import riscRoute from "@/routes/risc-route";
import { securityAuditMiddleware } from "@/middlewares/security-audit";
import { sendR } from "@/utils/http";
import sharedRoute from "@/routes/shared-route";
import slackRoute from "@/routes/slack-route";
import { startTelegramBot } from "@/telegram-bot/init-bot";
import teamInviteRoute from "@/routes/team-invite-route";
import telegramRoute from "@/routes/telegram-route";
import usersRoute from "@/routes/users-route";
import voiceRoute from "@/routes/voice-route";
import waitingListRoute from "@/routes/waiting-list-route";
import webhooksRoute from "@/routes/webhooks-route";
import whatsAppRoute from "@/routes/whatsapp-route";

const ACCESS_TOKEN_HEADER = "access_token";
const REFRESH_TOKEN_HEADER = "refresh_token";
const USER_KEY = "user";

const app = express();
const PORT = env.port;

// SECURITY: Add helmet for security headers
// Configures various HTTP headers to protect against common attacks
app.use(
  helmet({
    // Allow cross-origin requests for API
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Disable CSP for API (no HTML served)
    contentSecurityPolicy: false,
  })
);

// SECURITY: Configure CORS from environment
// In production, this should be set to the actual frontend URL(s)
const corsOrigins =
  env.isProd ?
    [env.urls.frontend].filter(Boolean) // Production: only allow configured frontend
  : ["http://localhost:4000", "http://127.0.0.1:4000", env.urls.frontend].filter(Boolean); // Development: allow localhost

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: [ACCESS_TOKEN_HEADER, REFRESH_TOKEN_HEADER, USER_KEY],
    allowedHeaders: ["Content-Type", "Authorization", REFRESH_TOKEN_HEADER, USER_KEY, ACCESS_TOKEN_HEADER],
  })
);

// SECURITY: Apply general API rate limiting
app.use(apiRateLimiter);

// SECURITY: Add security audit logging for compliance
app.use(securityAuditMiddleware);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev", { immediate: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  console.log("AI Google Calendar Assistant Server is running.");
  res.status(STATUS_RESPONSE.SUCCESS).json({ message: "AI Google Calendar Assistant Server is running." });
});

app.get("/health", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sockets: {
      connectedUsers: getConnectedUserCount(),
      activeConnections: getActiveConnectionCount(),
    },
  })
})

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

app.use((_req, res, _next) => {
  logger.error(`Opps! It looks like this route doesn't exist. ${_req.originalUrl}`);
  console.error("Opps! It looks like this route doesn't exist:", _req.originalUrl);
  sendR(res, STATUS_RESPONSE.NOT_FOUND, `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`);
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
});

httpServer.on("error", (error: Error) => {
  logger.error("Error starting server:", error);
  console.error("Error starting server:", error);
  throw error;
});

startTelegramBot();
initWhatsApp();
initSlackBot();
initializeJobScheduler().catch((err) => {
  logger.error("Failed to initialize job scheduler:", err);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...")
  await shutdownSocketServer()
  await shutdownJobScheduler()
  process.exit(0)
})

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...")
  await shutdownSocketServer()
  await shutdownJobScheduler()
  process.exit(0)
})

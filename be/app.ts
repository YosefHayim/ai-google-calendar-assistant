import { createServer, type IncomingMessage } from "node:http";
import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, ROUTES, STATUS_RESPONSE } from "@/config";
import {
  getActiveConnectionCount,
  getConnectedUserCount,
  getSocketServer,
  initSocketServer,
  shutdownSocketServer,
} from "@/config/clients/socket-server";
import { initializeJobScheduler, shutdownJobScheduler } from "@/jobs";
import errorHandler from "@/middlewares/error-handler";
import { apiRateLimiter } from "@/middlewares/rate-limiter";
import { securityAuditMiddleware } from "@/middlewares/security-audit";
import adminRoute from "@/routes/admin-route";
import affiliateRoute from "@/routes/affiliate-route";
import blogRoute from "@/routes/blog-route";
import contactRoute from "@/routes/contact-route";
import cronRoute from "@/routes/cron-route";
import featureFlagRoute from "@/routes/feature-flag-route";
import aclRoute from "@/routes/google-calendar/acl-route";
import calendarListRoute from "@/routes/google-calendar/calendar-list-route";
import calendarRoute from "@/routes/google-calendar/calendar-route";
import channelsRoute from "@/routes/google-calendar/channels-route";
import chatRoute from "@/routes/google-calendar/chat-route";
import eventsRoute from "@/routes/google-calendar/events-route";
import newsletterRoute from "@/routes/newsletter-route";
import paymentRoute from "@/routes/payment-route";
import referralRoute from "@/routes/referral-route";
import riscRoute from "@/routes/risc-route";
import sharedRoute from "@/routes/shared-route";
import slackRoute from "@/routes/slack-route";
import teamInviteRoute from "@/routes/team-invite-route";
import telegramRoute from "@/routes/telegram-route";
import usersRoute from "@/routes/users-route";
import voiceRoute from "@/routes/voice-route";
import waitingListRoute from "@/routes/waiting-list-route";
import webhooksRoute from "@/routes/webhooks-route";
import whatsAppRoute from "@/routes/whatsapp-route";
import { initSlackBot } from "@/slack-bot";
import { getSlackReceiver } from "@/slack-bot/init-bot";
import { getBot, startTelegramBot } from "@/telegram-bot/init-bot";
import { sendR } from "@/utils/http";
import { logger } from "@/utils/logger";
import { initWhatsApp } from "@/whatsapp-bot/init-whatsapp";

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
const corsOrigins = env.isProd
  ? [env.urls.frontend].filter(Boolean) // Production: only allow configured frontend
  : [
      "http://localhost:4000",
      "http://127.0.0.1:4000",
      env.urls.frontend,
    ].filter(Boolean); // Development: allow localhost

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    exposedHeaders: [ACCESS_TOKEN_HEADER, REFRESH_TOKEN_HEADER, USER_KEY],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      REFRESH_TOKEN_HEADER,
      USER_KEY,
      ACCESS_TOKEN_HEADER,
    ],
  })
);

// SECURITY: Apply general API rate limiting
app.use(apiRateLimiter);

// SECURITY: Add security audit logging for compliance
app.use(securityAuditMiddleware);

// JSON parser - skip WhatsApp webhook endpoint (needs raw body for signature verification)
const jsonParser = express.json({
  limit: "10mb",
  verify: (req, _res, buf) => {
    (req as IncomingMessage & { rawBody?: string }).rawBody = buf.toString();
  },
});

app.use((req, res, next) => {
  // Skip JSON parsing for WhatsApp webhook endpoint
  if (
    req.path === ROUTES.WHATSAPP ||
    req.path.startsWith(`${ROUTES.WHATSAPP}/`)
  ) {
    return next();
  }
  jsonParser(req, res, next);
});
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev", { immediate: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  console.log("AI Google Calendar Assistant Server is running.");
  res
    .status(STATUS_RESPONSE.SUCCESS)
    .json({ message: "AI Google Calendar Assistant Server is running." });
});

app.get("/health", (_req, res) => {
  const bot = getBot();
  const slackReceiver = getSlackReceiver();
  const socketServer = getSocketServer();

  res.status(STATUS_RESPONSE.SUCCESS).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      websockets: {
        status: socketServer ? "healthy" : "unavailable",
        connectedUsers: getConnectedUserCount(),
        activeConnections: getActiveConnectionCount(),
      },
      telegram: {
        status:
          bot && env.integrations.telegram.isEnabled ? "healthy" : "disabled",
        mode: env.integrations.telegram.useWebhook ? "webhook" : "polling",
      },
      slack: {
        status:
          slackReceiver && env.integrations.slack.isEnabled
            ? "healthy"
            : "disabled",
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

app.use((_req, res, _next) => {
  logger.error(
    `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`
  );
  console.error(
    "Opps! It looks like this route doesn't exist:",
    _req.originalUrl
  );
  sendR(
    res,
    STATUS_RESPONSE.NOT_FOUND,
    `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`
  );
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocketServer(httpServer);

// CRITICAL: Bind to 0.0.0.0 for AWS App Runner health checks
// Without explicit host, Node may bind to 127.0.0.1 which fails container health checks
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server successfully started on port ${PORT} (0.0.0.0)`);

  // Initialize integrations AFTER server is ready to accept health checks
  // This prevents health check failures during slow bot initialization
  setImmediate(() => {
    startTelegramBot();
    initWhatsApp();
    initSlackBot();
    initializeJobScheduler().catch((err) => {
      logger.error("Failed to initialize job scheduler:", err);
    });
  });
});

httpServer.on("error", (error: Error) => {
  logger.error("Error starting server:", error);
  console.error("Error starting server:", error);
  throw error;
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  await shutdownSocketServer();
  await shutdownJobScheduler();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  await shutdownSocketServer();
  await shutdownJobScheduler();
  process.exit(0);
});

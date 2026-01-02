import { ROUTES, STATUS_RESPONSE, env } from "@/config";

import aclRoute from "@/routes/google-calendar/acl-route";
import calendarListRoute from "@/routes/google-calendar/calendar-list-route";
import calendarRoute from "@/routes/google-calendar/calendar-route";
import channelsRoute from "@/routes/google-calendar/channels-route";
import chatRoute from "@/routes/google-calendar/chat-route";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "@/middlewares/error-handler";
import eventsRoute from "@/routes/google-calendar/events-route";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { sendR } from "./utils/http";
import { startTelegramBot } from "./telegram-bot/init-bot";
import usersRoute from "@/routes/users-route";
import whatsAppRoute from "@/routes/whatsapp-route";

const ACCESS_TOKEN_HEADER = "access_token";
const REFRESH_TOKEN_HEADER = "refresh_token";
const USER_KEY = "user";

const app = express();
const PORT = env.port;

app.use(
  cors({
    origin: ["http://localhost:4000", "http://127.0.0.1:4000"],
    credentials: true,
    exposedHeaders: [ACCESS_TOKEN_HEADER, REFRESH_TOKEN_HEADER, USER_KEY],
    allowedHeaders: ["Content-Type", "Authorization", REFRESH_TOKEN_HEADER, USER_KEY, ACCESS_TOKEN_HEADER],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev", { immediate: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).json({ message: "AI Google Calendar Assistant Server is running." });
});

app.use(ROUTES.USERS, usersRoute);
app.use(ROUTES.CALENDAR_LIST, calendarListRoute); // Must be before CALENDAR (more specific path)
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.EVENTS, eventsRoute);
app.use(ROUTES.ACL, aclRoute);
app.use(ROUTES.CHANNELS, channelsRoute);
app.use(ROUTES.WHATSAPP, whatsAppRoute);
app.use(ROUTES.CHAT, chatRoute);

app.use((_req, res, _next) => {
  sendR(res, STATUS_RESPONSE.NOT_FOUND, `Opps! It looks like this route doesn't exist. ${_req.originalUrl}`);
});

app.use(errorHandler);

app.listen(PORT, (error?: Error) => {
  if (error) {
    console.error("Error starting server:", error);
    throw error;
  }
  console.log(`AI Google Calendar Assistant Server is running on URL: ${env.baseUrl}`);
});

startTelegramBot();

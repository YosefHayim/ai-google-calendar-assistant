import { ROUTES, STATUS_RESPONSE } from "./types";

import { CONFIG } from "@/config/root-config";
import agentRoute from "@/routes/agent-route";
import calendarRoute from "@/routes/calendar-route";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "@/middlewares/error-handler";
import express from "express";
import morgan from "morgan";
import path from "node:path";
import { startTelegramBot } from "./telegram-bot/init-bot";
import usersRoute from "@/routes/users";
import whatsAppRoute from "@/routes/whatsapp-route";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "@/config/swagger";

const app = express();
const PORT = CONFIG.port;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/static", express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).send("Server is running.");
});

// Swagger API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(ROUTES.USERS, usersRoute);
app.use(ROUTES.CALENDAR, calendarRoute);
app.use(ROUTES.WHATSAPP, whatsAppRoute);
app.use(ROUTES.AGENT, agentRoute);

app.use(errorHandler);

app.listen(PORT, (error?: Error) => {
  if (error) {
    throw error;
  }
  console.log(`${CONFIG.baseUrl} server is running on port: ${PORT}`);
});

startTelegramBot();

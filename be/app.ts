import { STATUS_RESPONSE, env } from "@/config";

import { bootstrapServices } from "./utils/bootstrap";
import { createServer } from "node:http";
import errorHandler from "@/middlewares/error-handler";
import express from "express";
import { handleShutdown } from "./utils/shutdown";
import { initSocketServer } from "@/config/clients/socket-server";
import { initializeMiddlewares } from "@/middlewares";
import { initializeRoutes } from "@/routes";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";

const app = express();
const PORT = env.port;

initializeMiddlewares(app);

app.get("/health", (_req, res) => {
  res.status(STATUS_RESPONSE.SUCCESS).json({ status: "ok", uptime: process.uptime() });
});

initializeRoutes(app);

app.use((_req, res) => {
  sendR(res, STATUS_RESPONSE.NOT_FOUND, `Route not found: ${_req.originalUrl}`);
});

app.use(errorHandler);

const httpServer = createServer(app);
initSocketServer(httpServer);

httpServer.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`);
  
  bootstrapServices();
});

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
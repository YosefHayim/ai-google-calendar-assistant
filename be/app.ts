import { createServer } from "node:http";
import express from "express";
import { env, STATUS_RESPONSE } from "@/config";
import { initSocketServer } from "@/config/clients/socket-server";
import { initializeMiddlewares } from "@/middlewares";
import errorHandler from "@/middlewares/error-handler";
import { initializeRoutes } from "@/routes";
import { sendR } from "@/utils/http";
import { logger } from "@/utils/logger";
import { bootstrapServices } from "./utils/bootstrap";
import { handleShutdown } from "./utils/shutdown";

const app = express();
const PORT = env.port;

initializeMiddlewares(app);
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

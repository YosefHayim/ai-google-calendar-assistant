import { STATUS_RESPONSE } from "@/config/constants/http"
import { bootstrapServices } from "@/lib/bootstrap"
import { createServer } from "node:http"
import { env } from "@/config/env"
import errorHandler from "@/middlewares/error-handler"
import express from "express"
import { handleShutdown } from "@/lib/shutdown"
import { initSocketServer } from "@/infrastructure/socket/socket-server"
import { initializeMiddlewares } from "@/middlewares"
import { initializeRoutes } from "@/routes"
import { logger } from "@/lib/logger"
import { sendR } from "@/lib/http"

const app = express()
const PORT = env.port

initializeMiddlewares(app)
initializeRoutes(app)

app.use((_req, res) => {
  sendR(res, STATUS_RESPONSE.NOT_FOUND, `Route not found: ${_req.originalUrl}`)
})

app.use(errorHandler)

const httpServer = createServer(app)
initSocketServer(httpServer)

httpServer.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on port ${PORT}`)

  bootstrapServices()
})

process.on("SIGTERM", () => handleShutdown("SIGTERM"))
process.on("SIGINT", () => handleShutdown("SIGINT"))

import type { Server as HttpServer } from "node:http"
import type { Socket } from "socket.io"
import { Server as SocketIOServer } from "socket.io"
import { env } from "@/config/env"
import { validateSupabaseToken } from "@/utils/auth/supabase-token"
import { logger } from "@/utils/logger"

export type NotificationPayload = {
  type: "event_created" | "event_updated" | "conflict_alert" | "system"
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

type ServerToClientEvents = {
  notification: (payload: NotificationPayload) => void
  pong: (data: { timestamp: string }) => void
  "server-shutdown": (data: { message: string; reconnectDelay: number }) => void
}

type ClientToServerEvents = {
  ping: () => void
  "subscribe-notifications": () => void
}

type InterServerEvents = {
  ping: () => void
}

type SocketData = {
  userId: string
  email: string
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
type TypedServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

const PING_TIMEOUT_MS = 60_000
const PING_INTERVAL_MS = 25_000
const MAX_HTTP_BUFFER_SIZE = 1_000_000
const CONNECTION_TIMEOUT_MS = 45_000
const MAX_DISCONNECTION_DURATION_MS = 120_000
const SHUTDOWN_NOTIFY_DELAY_MS = 2000
const CLIENT_RECONNECT_DELAY_MS = 5000

let io: TypedServer | null = null
const userSockets = new Map<string, Set<string>>()

function getCorsOrigins(): string[] {
  if (env.isProd) {
    return [env.urls.frontend].filter(Boolean) as string[]
  }
  return [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    env.urls.frontend,
  ].filter(Boolean) as string[]
}

async function authenticateSocket(
  socket: TypedSocket,
  next: (err?: Error) => void
): Promise<void> {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.replace("Bearer ", "")

  if (!token) {
    const err = new Error("Authentication required")
    ;(err as Error & { data: unknown }).data = { code: "NO_TOKEN" }
    return next(err)
  }

  try {
    const validation = await validateSupabaseToken(token)
    if (!validation.user) {
      const err = new Error("Invalid or expired token")
      ;(err as Error & { data: unknown }).data = {
        code: "INVALID_TOKEN",
        needsRefresh: validation.needsRefresh,
      }
      return next(err)
    }

    socket.data = {
      userId: validation.user.id,
      email: validation.user.email || "",
    }

    next()
  } catch (error) {
    logger.error("[Socket] Auth error:", error)
    const err = new Error("Authentication failed")
    ;(err as Error & { data: unknown }).data = { code: "AUTH_ERROR" }
    next(err)
  }
}

function handleConnection(socket: TypedSocket): void {
  const { userId, email } = socket.data

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set())
  }
  userSockets.get(userId)?.add(socket.id)

  socket.join(`user:${userId}`)

  logger.debug(`[Socket] User connected: ${email} (${socket.id})`)

  socket.on("disconnect", (reason) => {
    userSockets.get(userId)?.delete(socket.id)
    if (userSockets.get(userId)?.size === 0) {
      userSockets.delete(userId)
    }
    logger.debug(`[Socket] User disconnected: ${email} (${socket.id}), reason: ${reason}`)
  })

  socket.on("ping", () => {
    socket.emit("pong", { timestamp: new Date().toISOString() })
  })

  socket.on("subscribe-notifications", () => {
    logger.debug(`[Socket] User ${email} subscribed to notifications`)
  })
}

export function initSocketServer(httpServer: HttpServer): TypedServer {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: getCorsOrigins(),
        credentials: true,
      },
      path: "/socket.io",
      transports: ["websocket", "polling"],
      pingTimeout: PING_TIMEOUT_MS,
      pingInterval: PING_INTERVAL_MS,
      maxHttpBufferSize: MAX_HTTP_BUFFER_SIZE,
      connectTimeout: CONNECTION_TIMEOUT_MS,
      allowUpgrades: true,
      connectionStateRecovery: {
        maxDisconnectionDuration: MAX_DISCONNECTION_DURATION_MS,
        skipMiddlewares: true,
      },
    }
  )

  io.use(authenticateSocket)
  io.on("connection", handleConnection)

  logger.info("[Socket] Server initialized with connection state recovery")
  return io
}

export function getSocketServer(): TypedServer | null {
  return io
}

export function emitToUser(
  userId: string,
  event: keyof ServerToClientEvents,
  payload: NotificationPayload
): boolean {
  if (!io) {
    logger.warn("[Socket] Server not initialized, cannot emit to user")
    return false
  }

  const room = `user:${userId}`
  const sockets = userSockets.get(userId)

  if (!sockets || sockets.size === 0) {
    logger.debug(`[Socket] No active connections for user ${userId}`)
    return false
  }

  io.to(room).emit(event, payload)
  logger.debug(`[Socket] Emitted ${event} to user ${userId} (${sockets.size} connections)`)
  return true
}

export function isUserConnected(userId: string): boolean {
  const sockets = userSockets.get(userId)
  return Boolean(sockets && sockets.size > 0)
}

export function getConnectedUserCount(): number {
  return userSockets.size
}

export function getActiveConnectionCount(): number {
  return io?.sockets.sockets.size ?? 0
}

export async function shutdownSocketServer(): Promise<void> {
  if (!io) {
    return
  }

  logger.info("[Socket] Starting graceful shutdown...")

  io.emit("server-shutdown", {
    message: "Server is restarting. Please wait...",
    reconnectDelay: CLIENT_RECONNECT_DELAY_MS,
  })

  await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_NOTIFY_DELAY_MS))

  await new Promise<void>((resolve) => {
    io?.close(() => {
      logger.info("[Socket] Server closed")
      resolve()
    })
  })

  userSockets.clear()
  io = null
}

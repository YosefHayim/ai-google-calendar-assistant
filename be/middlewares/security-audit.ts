import type { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { randomUUID } from "node:crypto";

/**
 * SECURITY: Security audit logging middleware
 * Logs security-relevant events for compliance and incident response
 */

export type SecurityAuditEvent = {
  timestamp: string;
  requestId: string;
  eventType: "AUTH" | "ACCESS" | "MODIFICATION" | "ERROR" | "SECURITY";
  action: string;
  userId?: string;
  userEmail?: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  statusCode?: number;
  duration?: number;
  details?: Record<string, unknown>;
};

/**
 * Generate a unique request ID for tracing
 */
export const generateRequestId = (): string => randomUUID();

/**
 * Get client IP address, handling proxies
 */
export const getClientIp = (req: Request): string => {
  // Trust X-Forwarded-For only in production (behind proxy/load balancer)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // Get the first IP in the chain (original client)
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(",")[0];
    return ips?.trim() || req.ip || "unknown";
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
};

/**
 * Log security audit event
 */
export const logSecurityEvent = (event: SecurityAuditEvent): void => {
  // Format as structured JSON for SIEM ingestion
  const logEntry = {
    "@timestamp": event.timestamp,
    "security.audit": true,
    "request.id": event.requestId,
    "event.type": event.eventType,
    "event.action": event.action,
    "user.id": event.userId,
    "user.email": event.userEmail ? maskEmail(event.userEmail) : undefined,
    "client.ip": event.ip,
    "user_agent.original": event.userAgent,
    "http.request.method": event.method,
    "url.path": event.path,
    "http.response.status_code": event.statusCode,
    "event.duration": event.duration,
    "event.details": event.details,
  };

  // Use appropriate log level based on event type
  if (event.eventType === "ERROR" || event.eventType === "SECURITY") {
    logger.error(`[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`);
  } else {
    logger.info(`[SECURITY_AUDIT] ${JSON.stringify(logEntry)}`);
  }
};

/**
 * Mask email for logging (privacy protection)
 */
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!(local && domain)) {
    return "***@***.***";
  }
  const maskedLocal =
    local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : "***";
  return `${maskedLocal}@${domain}`;
};

/**
 * Security audit middleware
 * Attaches request ID and logs security events
 */
export const securityAuditMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Attach request ID to request and response
  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  // Log request on completion
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const eventType = getEventType(req, res);

    // Only log security-relevant events
    if (shouldLogEvent(req, res)) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        requestId,
        eventType,
        action: getActionFromRoute(req),
        userId: req.user!.id,
        userEmail: req.user?.email,
        ip: getClientIp(req),
        userAgent: req.headers["user-agent"] || "unknown",
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
      });
    }
  });

  next();
};

/**
 * Determine event type based on request/response
 */
const getEventType = (
  req: Request,
  res: Response
): SecurityAuditEvent["eventType"] => {
  // Authentication events
  if (
    req.path.includes("/signin") ||
    req.path.includes("/signup") ||
    req.path.includes("/logout")
  ) {
    return "AUTH";
  }

  // Failed requests
  if (res.statusCode >= 400 && res.statusCode < 500) {
    return "ACCESS";
  }

  if (res.statusCode >= 500) {
    return "ERROR";
  }

  // Modification events
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return "MODIFICATION";
  }

  return "ACCESS";
};

/**
 * Get action description from route
 */
const getActionFromRoute = (req: Request): string => {
  const path = req.path;
  const method = req.method;

  // Auth actions
  if (path.includes("/signin")) {
    return "user_signin";
  }
  if (path.includes("/signup")) {
    return "user_signup";
  }
  if (path.includes("/logout")) {
    return "user_logout";
  }
  if (path.includes("/callback")) {
    return "oauth_callback";
  }
  if (path.includes("/verify")) {
    return "verify_otp";
  }

  // User actions
  if (path.includes("/users") && method === "DELETE") {
    return "user_deactivate";
  }
  if (path.includes("/disconnect")) {
    return "integration_disconnect";
  }

  // Calendar actions
  if (path.includes("/events") && method === "POST") {
    return "event_create";
  }
  if (path.includes("/events") && method === "DELETE") {
    return "event_delete";
  }
  if (path.includes("/events") && method === "PATCH") {
    return "event_update";
  }

  // Chat actions
  if (path.includes("/chat") && method === "POST") {
    return "chat_message";
  }

  return `${method.toLowerCase()}_${path.replace(/\//g, "_").slice(1)}`;
};

/**
 * Determine if event should be logged
 */
const shouldLogEvent = (req: Request, res: Response): boolean => {
  // Always log auth events
  if (
    req.path.includes("/signin") ||
    req.path.includes("/signup") ||
    req.path.includes("/logout")
  ) {
    return true;
  }

  // Always log failed requests (4xx, 5xx)
  if (res.statusCode >= 400) {
    return true;
  }

  // Always log modification events
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return true;
  }

  // Log sensitive routes
  if (
    req.path.includes("/callback") ||
    req.path.includes("/token") ||
    req.path.includes("/refresh")
  ) {
    return true;
  }

  // Skip logging for static files and health checks
  if (req.path.startsWith("/static") || req.path === "/") {
    return false;
  }

  return false;
};

/**
 * Log specific security events manually
 */
export const logAuthEvent = (
  req: Request,
  action: string,
  success: boolean,
  details?: Record<string, unknown>
): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    requestId: req.requestId || generateRequestId(),
    eventType: success ? "AUTH" : "SECURITY",
    action,
    userId: req.user!.id,
    userEmail: req.user?.email,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "unknown",
    method: req.method,
    path: req.path,
    details: {
      success,
      ...details,
    },
  });
};

import { env } from "@/config";
import path from "path";
import winston from "winston";

// Audit event types for authentication-related events
export const AuditEventType = {
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAIL: "AUTH_FAIL",
  EMAIL_CHANGE: "EMAIL_CHANGE",
  TOKEN_REFRESH: "TOKEN_REFRESH",
  TOKEN_REFRESH_FAIL: "TOKEN_REFRESH_FAIL",
  RATE_LIMIT_HIT: "RATE_LIMIT_HIT",
  SESSION_EXPIRED: "SESSION_EXPIRED",
  GOOGLE_AUTH_SUCCESS: "GOOGLE_AUTH_SUCCESS",
  GOOGLE_AUTH_FAIL: "GOOGLE_AUTH_FAIL",
  GOOGLE_REAUTH_REQUIRED: "GOOGLE_REAUTH_REQUIRED",
} as const;

export type AuditEventTypeValue = (typeof AuditEventType)[keyof typeof AuditEventType];

// Audit log entry structure
export type AuditLogEntry = {
  timestamp: string;
  event_type: AuditEventTypeValue;
  telegram_user_id: number;
  metadata: Record<string, unknown>;
};

// Returns "YYYY-MM-DD" format for file naming
const getDate = () => new Date().toISOString().split("T")[0];

// Log directory (same as main logger)
const logDir = "logs";

// Custom formatter for audit logs - JSON per line
const auditFormat = winston.format.printf((info) => {
  const entry: AuditLogEntry = {
    timestamp: info.timestamp as string,
    event_type: info.event_type as AuditEventTypeValue,
    telegram_user_id: info.telegram_user_id as number,
    metadata: (info.metadata as Record<string, unknown>) || {},
  };
  return JSON.stringify(entry) + "\n";
});

// Create dedicated audit logger with separate file transport
const auditWinstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), auditFormat),
  defaultMeta: { service: "telegram-auth-audit" },
  transports: [
    // Audit logs -> logs/development-audit-2024-01-03.log
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-audit-${getDate()}.log`),
    }),
  ],
});

// Add console output in development for visibility
if (env.isDev) {
  auditWinstonLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          return `[AUDIT] ${info.event_type} | user:${info.telegram_user_id} | ${JSON.stringify(info.metadata || {})}`;
        })
      ),
    })
  );
}

// Audit logger interface with typed methods
export const auditLogger = {
  /**
   * Log an audit event
   * @param eventType - The type of audit event
   * @param telegramUserId - The Telegram user ID (0 if unknown)
   * @param metadata - Additional context for the event
   */
  log: (eventType: AuditEventTypeValue, telegramUserId: number, metadata: Record<string, unknown> = {}): void => {
    auditWinstonLogger.info({
      event_type: eventType,
      telegram_user_id: telegramUserId,
      metadata,
    });
  },

  // Convenience methods for common events
  authSuccess: (telegramUserId: number, email: string, method = "email"): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.AUTH_SUCCESS,
      telegram_user_id: telegramUserId,
      metadata: { email, method },
    });
  },

  authFail: (telegramUserId: number, reason: string, email?: string): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.AUTH_FAIL,
      telegram_user_id: telegramUserId,
      metadata: { reason, email },
    });
  },

  emailChange: (telegramUserId: number, oldEmail: string, newEmail: string): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.EMAIL_CHANGE,
      telegram_user_id: telegramUserId,
      metadata: { oldEmail, newEmail },
    });
  },

  tokenRefresh: (telegramUserId: number, email: string, expiresInMs?: number): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.TOKEN_REFRESH,
      telegram_user_id: telegramUserId,
      metadata: { email, expiresInMs },
    });
  },

  rateLimitHit: (telegramUserId: number, limitType: string, resetInSeconds: number): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.RATE_LIMIT_HIT,
      telegram_user_id: telegramUserId,
      metadata: { limitType, resetInSeconds },
    });
  },

  sessionExpired: (telegramUserId: number, lastActivityIso: string, inactiveHours: number): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.SESSION_EXPIRED,
      telegram_user_id: telegramUserId,
      metadata: { lastActivity: lastActivityIso, inactiveHours },
    });
  },
};

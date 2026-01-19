import fs from "node:fs";
import path from "node:path";
import winston from "winston";
import { env } from "@/config";

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

export type AuditEventTypeValue =
  (typeof AuditEventType)[keyof typeof AuditEventType];

// Audit log entry structure
export type AuditLogEntry = {
  timestamp: string;
  event_type: AuditEventTypeValue;
  telegram_user_id: number;
  metadata: Record<string, unknown>;
};

const getDate = () => new Date().toISOString().split("T")[0];
const logDir = "logs";

const clearAuditLogOnStartup = () => {
  if (!env.isDev) {
    return;
  }

  const auditLogFile = path.join(
    logDir,
    `${env.nodeEnv}-audit-${getDate()}.json`
  );

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  try {
    fs.writeFileSync(auditLogFile, "", { flag: "w" });
  } catch {}
};

clearAuditLogOnStartup();

// Custom formatter for audit logs - JSON per line
const auditFormat = winston.format.printf((info) => {
  const entry: AuditLogEntry = {
    timestamp: info.timestamp as string,
    event_type: info.event_type as AuditEventTypeValue,
    telegram_user_id: info.telegram_user_id as number,
    metadata: (info.metadata as Record<string, unknown>) || {},
  };
  return `${JSON.stringify(entry)}\n`;
});

// Create dedicated audit logger with separate file transport
const auditWinstonLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), auditFormat),
  defaultMeta: { service: "telegram-auth-audit" },
  transports: [
    // Audit logs -> logs/development-audit-2024-01-03.json
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-audit-${getDate()}.json`),
    }),
  ],
});

// Add console output in development for visibility
if (env.isDev) {
  auditWinstonLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) =>
            `[AUDIT] ${info.event_type} | user:${info.telegram_user_id} | ${JSON.stringify(info.metadata || {})}`
        )
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
  log: (
    eventType: AuditEventTypeValue,
    telegramUserId: number,
    metadata: Record<string, unknown> = {}
  ): void => {
    auditWinstonLogger.info({
      event_type: eventType,
      telegram_user_id: telegramUserId,
      metadata,
    });
  },

  /**
   * @description Logs a successful authentication event for a user.
   * Records the user's email and authentication method used.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} email - The email address used for authentication
   * @param {string} [method="email"] - The authentication method (e.g., "email", "google", "magic_link")
   * @returns {void}
   * @example
   * auditLogger.authSuccess(123456789, "user@example.com", "google");
   */
  authSuccess: (
    telegramUserId: number,
    email: string,
    method = "email"
  ): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.AUTH_SUCCESS,
      telegram_user_id: telegramUserId,
      metadata: { email, method },
    });
  },

  /**
   * @description Logs a failed authentication attempt with the reason for failure.
   * Useful for security monitoring and detecting potential brute force attacks.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} reason - The reason for authentication failure (e.g., "invalid_password", "account_locked")
   * @param {string} [email] - The email address used in the failed attempt (optional)
   * @returns {void}
   * @example
   * auditLogger.authFail(123456789, "invalid_password", "user@example.com");
   */
  authFail: (telegramUserId: number, reason: string, email?: string): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.AUTH_FAIL,
      telegram_user_id: telegramUserId,
      metadata: { reason, email },
    });
  },

  /**
   * @description Logs when a user changes their associated email address.
   * Records both the previous and new email addresses for audit trail.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} oldEmail - The user's previous email address
   * @param {string} newEmail - The user's new email address
   * @returns {void}
   * @example
   * auditLogger.emailChange(123456789, "old@example.com", "new@example.com");
   */
  emailChange: (
    telegramUserId: number,
    oldEmail: string,
    newEmail: string
  ): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.EMAIL_CHANGE,
      telegram_user_id: telegramUserId,
      metadata: { oldEmail, newEmail },
    });
  },

  /**
   * @description Logs a successful token refresh event.
   * Tracks when authentication tokens are renewed and their new expiry time.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} email - The email address associated with the token
   * @param {number} [expiresInMs] - Time in milliseconds until the new token expires (optional)
   * @returns {void}
   * @example
   * auditLogger.tokenRefresh(123456789, "user@example.com", 3600000); // Token expires in 1 hour
   */
  tokenRefresh: (
    telegramUserId: number,
    email: string,
    expiresInMs?: number
  ): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.TOKEN_REFRESH,
      telegram_user_id: telegramUserId,
      metadata: { email, expiresInMs },
    });
  },

  /**
   * @description Logs when a user hits a rate limit.
   * Records the type of limit exceeded and when it resets.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} limitType - The type of rate limit hit (e.g., "api_requests", "login_attempts")
   * @param {number} resetInSeconds - Time in seconds until the rate limit resets
   * @returns {void}
   * @example
   * auditLogger.rateLimitHit(123456789, "api_requests", 60); // Limit resets in 60 seconds
   */
  rateLimitHit: (
    telegramUserId: number,
    limitType: string,
    resetInSeconds: number
  ): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.RATE_LIMIT_HIT,
      telegram_user_id: telegramUserId,
      metadata: { limitType, resetInSeconds },
    });
  },

  /**
   * @description Logs when a user's session expires due to inactivity.
   * Records the last activity timestamp and duration of inactivity.
   * @param {number} telegramUserId - The unique Telegram user identifier
   * @param {string} lastActivityIso - ISO 8601 timestamp of the user's last activity
   * @param {number} inactiveHours - Number of hours the user was inactive before session expired
   * @returns {void}
   * @example
   * auditLogger.sessionExpired(123456789, "2024-01-15T10:30:00Z", 24);
   */
  sessionExpired: (
    telegramUserId: number,
    lastActivityIso: string,
    inactiveHours: number
  ): void => {
    auditWinstonLogger.info({
      event_type: AuditEventType.SESSION_EXPIRED,
      telegram_user_id: telegramUserId,
      metadata: { lastActivity: lastActivityIso, inactiveHours },
    });
  },
};

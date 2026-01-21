/**
 * @module logger
 * @description Centralized logging utility for the application using Winston.
 *
 * This module provides a pre-configured Winston logger instance with environment-aware
 * transports and formatting. In development mode, logs are written to both files and
 * console with colorized output. In production, logs are sent to console only (for
 * AWS App Runner / CloudWatch capture).
 *
 * Log files are organized by date and environment:
 * - `logs/{env}-error-{date}.log` - Error-level logs only
 * - `logs/{env}-combined-{date}.log` - All log levels
 *
 * In development mode, log files are cleared on server restart for fresh debugging context.
 *
 * @example
 * import { logger } from "@/lib/logger";
 *
 * logger.info("User logged in", { userId: 123 });
 * logger.warn("Rate limit approaching", { remaining: 5 });
 * logger.error("Failed to connect", { error: err.message });
 */

import { env } from "@/config/env";
import fs from "node:fs";
import path from "node:path";
import winston from "winston";

// Returns strictly "YYYY-MM-DD" (e.g., "2024-01-03")
const getDate = () => new Date().toISOString().split("T")[0];

// Define the directory for local file logs
const logDir = "logs";

const clearLogFilesOnStartup = () => {
  // Defensive check: ensure env is initialized before accessing properties
  if (!env?.isDev) {
    return;
  }

  const today = getDate();

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    return;
  }

  try {
    const files = fs.readdirSync(logDir);
    const logFilePattern = new RegExp(`^${env.nodeEnv}-(error|combined|audit)-(\\d{4}-\\d{2}-\\d{2})\\.(log|json)$`);

    for (const file of files) {
      const match = file.match(logFilePattern);
      if (match) {
        const fileDate = match[2];
        if (fileDate !== today) {
          // Delete files that are not from today
          const filePath = path.join(logDir, file);
          try {
            fs.unlinkSync(filePath);
            logger.info(`Deleted old log file: ${file}`);
          } catch (error) {
            logger.warn(`Failed to delete old log file: ${file}`, { error: error.message });
          }
        }
      }
    }

    // Ensure today's log files exist and are empty
    const todayLogFiles = [
      path.join(logDir, `${env.nodeEnv}-error-${today}.log`),
      path.join(logDir, `${env.nodeEnv}-combined-${today}.log`),
      path.join(logDir, `${env.nodeEnv}-audit-${today}.json`),
    ];

    for (const logFile of todayLogFiles) {
      try {
        fs.writeFileSync(logFile, "", { flag: "w" });
      } catch (error) {
        logger.warn(`Failed to initialize today's log file: ${path.basename(logFile)}`, { error: error.message });
      }
    }
  } catch (error) {
    logger.warn("Failed to clean up old log files", { error: error.message });
  }
};

clearLogFilesOnStartup();

// Custom Formatter: Stringify JSON + add an extra Newline (\n) for the gap
const jsonWithGap = winston.format.printf(
  (info) => `${JSON.stringify(info)}\n`
);

// Build transports based on environment
const transports: winston.transport[] = [];

// Defensive check: ensure env is initialized before accessing properties
const isDev = env?.isDev ?? false;
const nodeEnv = env?.nodeEnv ?? "production";

if (isDev) {
  // Development: File logs + colorized console
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, `${nodeEnv}-error-${getDate()}.log`),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, `${nodeEnv}-combined-${getDate()}.log`),
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
} else {
  // Production: Console only (captured by AWS App Runner / CloudWatch)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

/**
 * @description The main application logger instance.
 * A pre-configured Winston logger with environment-specific transports.
 *
 * Available log levels (in order of severity):
 * - error: Critical errors that need immediate attention
 * - warn: Warning conditions that should be reviewed
 * - info: General informational messages (default level)
 * - http: HTTP request logging
 * - verbose: Detailed informational messages
 * - debug: Debug-level messages for development
 * - silly: Most verbose logging level
 *
 * @type {winston.Logger}
 * @example
 * import { logger } from "@/lib/logger";
 *
 * // Basic logging
 * logger.info("Application started");
 *
 * // Logging with metadata
 * logger.info("User action", { userId: 123, action: "login" });
 *
 * // Error logging with stack trace
 * logger.error("Database connection failed", { error: err.stack });
 */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), jsonWithGap),
  defaultMeta: { service: "user-service" },
  transports,
});

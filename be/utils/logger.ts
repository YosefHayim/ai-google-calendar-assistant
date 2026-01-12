import { env } from "@/config";
import path from "path";
import winston from "winston";

// Returns strictly "YYYY-MM-DD" (e.g., "2024-01-03")
const getDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Define the directory for local file logs
const logDir = "logs";

// Custom Formatter: Stringify JSON + add an extra Newline (\n) for the gap
const jsonWithGap = winston.format.printf((info) => {
  return JSON.stringify(info) + "\n";
});

// Build transports based on environment
const transports: winston.transport[] = [];

if (env.isDev) {
  // Development: File logs + colorized console
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-error-${getDate()}.log`),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-combined-${getDate()}.log`),
    }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
} else {
  // Production: Console only (captured by AWS App Runner / CloudWatch)
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    })
  );
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), jsonWithGap),
  defaultMeta: { service: "user-service" },
  transports,
});

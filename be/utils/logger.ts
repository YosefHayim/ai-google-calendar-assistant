import { env } from "@/config";
import path from "path";
import winston from "winston";

// Returns strictly "YYYY-MM-DD" (e.g., "2024-01-03")
const getDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Define the directory
const logDir = "logs";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    //
    // Error Logs -> logs/development-error-2024-01-03.log
    //
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-error-${getDate()}.log`),
      level: "error",
    }),

    //
    // Combined Logs -> logs/development-combined-2024-01-03.log
    //
    new winston.transports.File({
      filename: path.join(logDir, `${env.nodeEnv}-combined-${getDate()}.log`),
    }),
  ],
});

if (env.isDev) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

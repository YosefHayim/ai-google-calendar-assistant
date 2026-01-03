import { env } from "@/config";
import path from "path";
import winston from "winston";

// Returns strictly "YYYY-MM-DD" (e.g., "2024-01-03")
const getDate = () => {
  return new Date().toISOString().split("T")[0];
};

// Define the directory
const logDir = "logs";

// Custom Formatter: Stringify JSON + add an extra Newline (\n) for the gap
const jsonWithGap = winston.format.printf((info) => {
  return JSON.stringify(info) + "\n";
});

export const logger = winston.createLogger({
  level: "info",
  // Combine timestamp first, then use our custom gap formatter
  format: winston.format.combine(winston.format.timestamp(), jsonWithGap),
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
      // Keep console logs compact (no extra gaps usually needed here)
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

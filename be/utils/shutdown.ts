import { logger } from "@/utils/logger";
import { shutdownJobScheduler } from "@/jobs";
import { shutdownSocketServer } from "@/config/clients/socket-server";

/**
 * Handles graceful shutdown for all active connections and workers.
 */
export const handleShutdown = async (signal: string) => {
  logger.info(`${signal} signal received. Starting graceful shutdown...`);

  try {
    // Run shutdown tasks in parallel to save time
    await Promise.all([
      shutdownSocketServer(),
      shutdownJobScheduler(),
    ]);

    logger.info("Graceful shutdown complete. Exiting process.");
    process.exit(0);
  } catch (err) {
    logger.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
};
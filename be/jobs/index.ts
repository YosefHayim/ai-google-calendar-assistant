import { isRedisConnected } from "@/config/clients";
import { logger } from "@/utils/logger";
import { closeQueues, scheduleRecurringJobs } from "./queues";
import { closeWorkers, startWorkers } from "./workers";

let isInitialized = false;

export async function initializeJobScheduler(): Promise<void> {
  if (isInitialized) {
    logger.warn("BullMQ: Job scheduler already initialized");
    return;
  }

  if (!isRedisConnected()) {
    logger.warn("BullMQ: Redis not connected, skipping job scheduler init");
    return;
  }

  logger.info("BullMQ: Initializing job scheduler...");

  try {
    startWorkers();
    await scheduleRecurringJobs();
    isInitialized = true;
    logger.info("BullMQ: Job scheduler initialized successfully");
  } catch (error) {
    logger.error("BullMQ: Failed to initialize job scheduler:", error);
    throw error;
  }
}

export async function shutdownJobScheduler(): Promise<void> {
  if (!isInitialized) {
    return;
  }

  logger.info("BullMQ: Shutting down job scheduler...");

  try {
    await closeWorkers();
    await closeQueues();
    isInitialized = false;
    logger.info("BullMQ: Job scheduler shut down successfully");
  } catch (error) {
    logger.error("BullMQ: Error during shutdown:", error);
    throw error;
  }
}

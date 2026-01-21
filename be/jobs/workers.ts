import { Worker } from "bullmq";
import { logger } from "@/lib/logger";
import { bullmqConnection } from "./connection";
import { handleAnalyticsAggregation } from "./handlers/analytics-aggregation";
import {
  handleDailyDigestJob,
  handleEventReminderJob,
} from "./handlers/notifications";
import { handleStaleConversationsCleanup } from "./handlers/stale-conversations";
import { handleTokenRefreshCheck } from "./handlers/token-refresh";
import { handleUsageReset } from "./handlers/usage-reset";
import { QUEUE_NAMES } from "./queues";

const workers: Worker[] = [];

export function startWorkers(): void {
  logger.info("BullMQ: Starting workers...");

  const scheduledWorker = new Worker(
    QUEUE_NAMES.SCHEDULED,
    (job) => {
      switch (job.name) {
        case "stale-conversations-cleanup":
          return handleStaleConversationsCleanup(job);
        case "token-refresh-check":
          return handleTokenRefreshCheck(job);
        case "monthly-usage-reset":
          return handleUsageReset(job);
        default:
          logger.warn(`Unknown scheduled job: ${job.name}`);
          return Promise.resolve(null);
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    }
  );

  scheduledWorker.on("completed", (job) => {
    logger.info(`[${job.name}] Job ${job.id} completed`);
  });

  scheduledWorker.on("failed", (job, err) => {
    logger.error(`[${job?.name}] Job ${job?.id} failed:`, err);
  });

  workers.push(scheduledWorker);
  logger.info("  - Started: scheduled-jobs worker");

  const analyticsWorker = new Worker(
    QUEUE_NAMES.ANALYTICS,
    (job) => {
      switch (job.name) {
        case "daily-analytics-aggregation":
          return handleAnalyticsAggregation(job);
        default:
          logger.warn(`Unknown analytics job: ${job.name}`);
          return Promise.resolve(null);
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    }
  );

  analyticsWorker.on("completed", (job) => {
    logger.info(`[${job.name}] Job ${job.id} completed`);
  });

  analyticsWorker.on("failed", (job, err) => {
    logger.error(`[${job?.name}] Job ${job?.id} failed:`, err);
  });

  workers.push(analyticsWorker);
  logger.info("  - Started: analytics-jobs worker");

  const notificationWorker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    (job) => {
      switch (job.name) {
        case "event-reminder-check":
          return handleEventReminderJob(job);
        case "daily-digest-send":
          return handleDailyDigestJob(job);
        default:
          logger.warn(`Unknown notification job: ${job.name}`);
          return Promise.resolve(null);
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    }
  );

  notificationWorker.on("completed", (job) => {
    logger.info(`[${job.name}] Job ${job.id} completed`);
  });

  notificationWorker.on("failed", (job, err) => {
    logger.error(`[${job?.name}] Job ${job?.id} failed:`, err);
  });

  workers.push(notificationWorker);
  logger.info("  - Started: notification-jobs worker");

  logger.info("BullMQ: All workers started");
}

export async function closeWorkers(): Promise<void> {
  logger.info("BullMQ: Closing workers...");
  await Promise.all(workers.map((worker) => worker.close()));
  logger.info("BullMQ: All workers closed");
}

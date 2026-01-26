import { Queue } from "bullmq"
import { logger } from "@/lib/logger"
import { bullmqConnection } from "./connection"

export const QUEUE_NAMES = {
  SCHEDULED: "scheduled-jobs",
  NOTIFICATIONS: "notification-jobs",
  ANALYTICS: "analytics-jobs",
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

const COMPLETED_JOBS_TO_KEEP = 100
const HOURS_IN_DAY = 24
const MINUTES_IN_HOUR = 60
const SECONDS_IN_MINUTE = 60
const DAYS_TO_KEEP_FAILED_JOBS = 7
const COMPLETED_JOBS_MAX_AGE_SECONDS =
  HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE
const FAILED_JOBS_TO_KEEP = 500
const FAILED_JOBS_MAX_AGE_SECONDS =
  DAYS_TO_KEEP_FAILED_JOBS * HOURS_IN_DAY * MINUTES_IN_HOUR * SECONDS_IN_MINUTE
const DEFAULT_ATTEMPTS = 3
const NOTIFICATION_ATTEMPTS = 5
const ANALYTICS_ATTEMPTS = 2
const BACKOFF_DELAY_MS = 1000

const defaultJobOptions = {
  attempts: DEFAULT_ATTEMPTS,
  backoff: {
    type: "exponential" as const,
    delay: BACKOFF_DELAY_MS,
  },
  removeOnComplete: {
    count: COMPLETED_JOBS_TO_KEEP,
    age: COMPLETED_JOBS_MAX_AGE_SECONDS,
  },
  removeOnFail: {
    count: FAILED_JOBS_TO_KEEP,
    age: FAILED_JOBS_MAX_AGE_SECONDS,
  },
}

export const scheduledQueue = new Queue(QUEUE_NAMES.SCHEDULED, {
  connection: bullmqConnection,
  defaultJobOptions,
})

export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
  connection: bullmqConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: NOTIFICATION_ATTEMPTS,
  },
})

export const analyticsQueue = new Queue(QUEUE_NAMES.ANALYTICS, {
  connection: bullmqConnection,
  defaultJobOptions: {
    ...defaultJobOptions,
    attempts: ANALYTICS_ATTEMPTS,
  },
})

export const allQueues = [scheduledQueue, notificationQueue, analyticsQueue]

export async function scheduleRecurringJobs(): Promise<void> {
  logger.info("BullMQ: Scheduling recurring jobs...")

  const existingJobs = await scheduledQueue.getRepeatableJobs()
  for (const job of existingJobs) {
    await scheduledQueue.removeRepeatableByKey(job.key)
  }

  await scheduledQueue.add(
    "stale-conversations-cleanup",
    {},
    {
      repeat: { pattern: "0 */6 * * *" },
      jobId: "stale-conversations-cleanup",
    }
  )
  logger.info("  - Scheduled: stale-conversations-cleanup (every 6 hours)")

  await scheduledQueue.add(
    "subscription-status-check",
    {},
    {
      repeat: { pattern: "0 3 * * *" },
      jobId: "subscription-status-check",
    }
  )
  logger.info("  - Scheduled: subscription-status-check (daily at 3 AM)")

  await analyticsQueue.add(
    "daily-analytics-aggregation",
    {},
    {
      repeat: { pattern: "0 4 * * *" },
      jobId: "daily-analytics-aggregation",
    }
  )
  logger.info("  - Scheduled: daily-analytics-aggregation (daily at 4 AM)")

  await scheduledQueue.add(
    "token-refresh-check",
    {},
    {
      repeat: { pattern: "0 */12 * * *" },
      jobId: "token-refresh-check",
    }
  )
  logger.info("  - Scheduled: token-refresh-check (every 12 hours)")

  await scheduledQueue.add(
    "monthly-usage-reset",
    {},
    {
      repeat: { pattern: "0 0 1 * *" },
      jobId: "monthly-usage-reset",
    }
  )
  logger.info("  - Scheduled: monthly-usage-reset (1st of each month)")

  await notificationQueue.add(
    "event-reminder-check",
    {},
    {
      repeat: { pattern: "*/5 * * * *" },
      jobId: "event-reminder-check",
    }
  )
  logger.info("  - Scheduled: event-reminder-check (every 5 minutes)")

  await notificationQueue.add(
    "daily-digest-send",
    {},
    {
      repeat: { pattern: "0 8 * * *" },
      jobId: "daily-digest-send",
    }
  )
  logger.info("  - Scheduled: daily-digest-send (daily at 8 AM)")

  await notificationQueue.add(
    "scheduled-reminder-check",
    {},
    {
      repeat: { pattern: "* * * * *" },
      jobId: "scheduled-reminder-check",
    }
  )
  logger.info("  - Scheduled: scheduled-reminder-check (every minute)")

  logger.info("BullMQ: All recurring jobs scheduled")
}

export async function closeQueues(): Promise<void> {
  logger.info("BullMQ: Closing queues...")
  await Promise.all(allQueues.map((queue) => queue.close()))
  logger.info("BullMQ: All queues closed")
}

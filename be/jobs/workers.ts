import { Worker } from "bullmq"
import { bullmqConnection } from "./connection"
import { QUEUE_NAMES } from "./queues"
import { handleStaleConversationsCleanup } from "./handlers/stale-conversations"
import { handleSubscriptionStatusCheck } from "./handlers/subscription-check"
import { handleAnalyticsAggregation } from "./handlers/analytics-aggregation"
import { logger } from "@/utils/logger"

const workers: Worker[] = []

export function startWorkers(): void {
  logger.info("BullMQ: Starting workers...")

  const scheduledWorker = new Worker(
    QUEUE_NAMES.SCHEDULED,
    (job) => {
      switch (job.name) {
        case "stale-conversations-cleanup":
          return handleStaleConversationsCleanup(job)
        case "subscription-status-check":
          return handleSubscriptionStatusCheck(job)
        default:
          logger.warn(`Unknown scheduled job: ${job.name}`)
          return Promise.resolve(null)
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    }
  )

  scheduledWorker.on("completed", (job) => {
    logger.info(`[${job.name}] Job ${job.id} completed`)
  })

  scheduledWorker.on("failed", (job, err) => {
    logger.error(`[${job?.name}] Job ${job?.id} failed:`, err)
  })

  workers.push(scheduledWorker)
  logger.info("  - Started: scheduled-jobs worker")

  const analyticsWorker = new Worker(
    QUEUE_NAMES.ANALYTICS,
    (job) => {
      switch (job.name) {
        case "daily-analytics-aggregation":
          return handleAnalyticsAggregation(job)
        default:
          logger.warn(`Unknown analytics job: ${job.name}`)
          return Promise.resolve(null)
      }
    },
    {
      connection: bullmqConnection,
      concurrency: 1,
    }
  )

  analyticsWorker.on("completed", (job) => {
    logger.info(`[${job.name}] Job ${job.id} completed`)
  })

  analyticsWorker.on("failed", (job, err) => {
    logger.error(`[${job?.name}] Job ${job?.id} failed:`, err)
  })

  workers.push(analyticsWorker)
  logger.info("  - Started: analytics-jobs worker")

  logger.info("BullMQ: All workers started")
}

export async function closeWorkers(): Promise<void> {
  logger.info("BullMQ: Closing workers...")
  await Promise.all(workers.map((worker) => worker.close()))
  logger.info("BullMQ: All workers closed")
}

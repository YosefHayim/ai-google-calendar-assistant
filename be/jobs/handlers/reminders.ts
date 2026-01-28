import type { Job } from "bullmq"
import { dispatchReminder } from "@/domains/reminders/services/reminder-dispatcher"
import {
  getPendingRemindersInWindow,
  markReminderFailed,
  markReminderSent,
} from "@/domains/reminders/services/reminder-service"
import { logger } from "@/lib/logger"

const WINDOW_FORWARD_SECONDS = 60
const OVERDUE_LOOKBACK_SECONDS = 3600
const MS_PER_SECOND = 1000

export type ScheduledReminderCheckJobData = Record<string, never>

export type ScheduledReminderCheckResult = {
  checked: number
  sent: number
  failed: number
  errors: string[]
}

export async function handleScheduledReminderCheck(
  job: Job<ScheduledReminderCheckJobData>
): Promise<ScheduledReminderCheckResult> {
  const result: ScheduledReminderCheckResult = {
    checked: 0,
    sent: 0,
    failed: 0,
    errors: [],
  }

  logger.info(`[Job ${job.id}] Starting scheduled reminder check...`)

  const now = new Date()
  const windowStart = new Date(
    now.getTime() - OVERDUE_LOOKBACK_SECONDS * MS_PER_SECOND
  )
  const windowEnd = new Date(
    now.getTime() + WINDOW_FORWARD_SECONDS * MS_PER_SECOND
  )

  const pendingReminders = await getPendingRemindersInWindow(
    windowStart,
    windowEnd
  )
  result.checked = pendingReminders.length

  if (pendingReminders.length === 0) {
    logger.info(`[Job ${job.id}] No pending reminders in window`)
    return result
  }

  logger.info(
    `[Job ${job.id}] Found ${pendingReminders.length} reminders to process`
  )

  for (const reminder of pendingReminders) {
    try {
      const dispatchResult = await dispatchReminder(reminder)

      if (dispatchResult.success) {
        await markReminderSent(reminder.id)
        result.sent++
        logger.info(`[Job ${job.id}] Reminder ${reminder.id} sent successfully`)
      } else {
        await markReminderFailed(reminder.id, dispatchResult.error ?? "Unknown")
        result.failed++
        result.errors.push(`Reminder ${reminder.id}: ${dispatchResult.error}`)
        logger.error(
          `[Job ${job.id}] Reminder ${reminder.id} failed: ${dispatchResult.error}`
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"
      await markReminderFailed(reminder.id, errorMessage)
      result.failed++
      result.errors.push(`Reminder ${reminder.id}: ${errorMessage}`)
      logger.error(
        `[Job ${job.id}] Reminder ${reminder.id} error: ${errorMessage}`
      )
    }
  }

  logger.info(`[Job ${job.id}] Scheduled reminder check completed`, result)
  return result
}

import type { Job } from "bullmq"
import { SUPABASE } from "@/config/clients"
import { logger } from "@/utils/logger"

export type UsageResetJobData = Record<string, never>

export type UsageResetResult = {
  subscriptionsReset: number
  errors: string[]
}

async function resetSubscriptionUsage(
  subscriptionId: string,
  now: Date
): Promise<{ success: boolean; error?: string }> {
  const newPeriodEnd = new Date(now)
  newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1)

  const { error: updateError } = await SUPABASE
    .from("subscriptions")
    .update({
      ai_interactions_used: 0,
      current_period_start: now.toISOString(),
      current_period_end: newPeriodEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", subscriptionId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}

function shouldResetSubscription(periodEnd: string | null, now: Date): boolean {
  if (!periodEnd) {
    return true
  }
  return now >= new Date(periodEnd)
}

export async function handleUsageReset(
  job: Job<UsageResetJobData>
): Promise<UsageResetResult> {
  const result: UsageResetResult = {
    subscriptionsReset: 0,
    errors: [],
  }

  logger.info(`[Job ${job.id}] Starting monthly usage reset...`)

  try {
    const { data: activeSubscriptions, error: fetchError } = await SUPABASE
      .from("subscriptions")
      .select("id, user_id, ai_interactions_used, current_period_start, current_period_end")
      .in("status", ["active", "trialing"])
      .gt("ai_interactions_used", 0)

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`)
      logger.error(`[Job ${job.id}] Error fetching subscriptions:`, fetchError)
      throw fetchError
    }

    if (!activeSubscriptions || activeSubscriptions.length === 0) {
      logger.info(`[Job ${job.id}] No subscriptions need usage reset`)
      return result
    }

    const now = new Date()

    for (const subscription of activeSubscriptions) {
      if (!shouldResetSubscription(subscription.current_period_end, now)) {
        continue
      }

      const resetOutcome = await resetSubscriptionUsage(subscription.id, now)

      if (resetOutcome.success) {
        result.subscriptionsReset++
        logger.info(`[Job ${job.id}] Reset usage for subscription ${subscription.id}`)
      } else {
        result.errors.push(`Reset error for ${subscription.id}: ${resetOutcome.error}`)
        logger.error(`[Job ${job.id}] Error resetting ${subscription.id}:`, resetOutcome.error)
      }
    }

    logger.info(`[Job ${job.id}] Monthly usage reset completed`, result)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    result.errors.push(errorMessage)
    logger.error(`[Job ${job.id}] Monthly usage reset failed:`, error)
    throw error
  }
}

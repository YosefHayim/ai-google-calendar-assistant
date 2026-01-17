import type { Job } from "bullmq"
import { SUPABASE } from "@/config/clients"
import { logger } from "@/utils/logger"

export type UsageResetJobData = Record<string, never>

export type UsageResetResult = {
  usersReset: number
  errors: string[]
}

const MONTHS_OFFSET = 1

async function resetUserUsage(
  userId: string,
  now: Date
): Promise<{ success: boolean; error?: string }> {
  const newResetAt = new Date(now)
  newResetAt.setMonth(newResetAt.getMonth() + MONTHS_OFFSET)

  const { error: updateError } = await SUPABASE.from("users")
    .update({
      ai_interactions_used: 0,
      usage_reset_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  return { success: true }
}

function shouldResetUsage(resetAt: string | null, now: Date): boolean {
  if (!resetAt) {
    return true
  }
  const resetDate = new Date(resetAt)
  const nextReset = new Date(resetDate)
  nextReset.setMonth(nextReset.getMonth() + MONTHS_OFFSET)
  return now >= nextReset
}

export async function handleUsageReset(
  job: Job<UsageResetJobData>
): Promise<UsageResetResult> {
  const result: UsageResetResult = {
    usersReset: 0,
    errors: [],
  }

  logger.info(`[Job ${job.id}] Starting monthly usage reset...`)

  try {
    const { data: usersWithUsage, error: fetchError } =
      await SUPABASE.from("users")
        .select("id, ai_interactions_used, usage_reset_at")
        .gt("ai_interactions_used", 0)

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`)
      logger.error(`[Job ${job.id}] Error fetching users:`, fetchError)
      throw fetchError
    }

    if (!usersWithUsage || usersWithUsage.length === 0) {
      logger.info(`[Job ${job.id}] No users need usage reset`)
      return result
    }

    const now = new Date()

    for (const user of usersWithUsage) {
      if (!shouldResetUsage(user.usage_reset_at, now)) {
        continue
      }

      const resetOutcome = await resetUserUsage(user.id, now)

      if (resetOutcome.success) {
        result.usersReset++
        logger.info(`[Job ${job.id}] Reset usage for user ${user.id}`)
      } else {
        result.errors.push(`Reset error for ${user.id}: ${resetOutcome.error}`)
        logger.error(
          `[Job ${job.id}] Error resetting ${user.id}:`,
          resetOutcome.error
        )
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

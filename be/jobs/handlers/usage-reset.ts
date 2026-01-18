import type { Job } from "bullmq";
import { SUPABASE } from "@/config/clients";
import { logger } from "@/utils/logger";

export type UsageResetJobData = Record<string, never>;

export type UsageResetResult = {
  usersReset: number;
  errors: string[];
};

const MONTHS_OFFSET = 1;

/**
 * Reset a single user's AI usage counters and schedule next reset.
 *
 * Resets the user's AI interactions counter to zero and updates
 * the usage reset timestamp. Calculates the next monthly reset date
 * based on the current time plus one month offset.
 *
 * @param userId - The user's unique identifier
 * @param now - Current timestamp for reset scheduling
 * @returns Promise resolving to success status and optional error message
 */
async function resetUserUsage(
  userId: string,
  now: Date
): Promise<{ success: boolean; error?: string }> {
  const newResetAt = new Date(now);
  newResetAt.setMonth(newResetAt.getMonth() + MONTHS_OFFSET);

  const { error: updateError } = await SUPABASE.from("users")
    .update({
      ai_interactions_used: 0,
      usage_reset_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", userId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Determine if a user's usage should be reset based on reset schedule.
 *
 * Checks if the user's usage reset date has passed or if they
 * don't have a reset date set (first-time reset). Uses monthly
 * intervals for reset scheduling.
 *
 * @param resetAt - ISO string of last reset date, or null for new users
 * @param now - Current timestamp for comparison
 * @returns True if usage should be reset, false otherwise
 */
function shouldResetUsage(resetAt: string | null, now: Date): boolean {
  if (!resetAt) {
    return true;
  }
  const resetDate = new Date(resetAt);
  const nextReset = new Date(resetDate);
  nextReset.setMonth(nextReset.getMonth() + MONTHS_OFFSET);
  return now >= nextReset;
}

/**
 * Process monthly usage reset job for all eligible users.
 *
 * Background job that runs periodically to reset AI usage counters
 * for users whose monthly reset date has passed. Updates user records
 * and tracks success/failure statistics for monitoring.
 *
 * @param job - BullMQ job instance with job metadata
 * @returns Promise resolving to reset results with user count and errors
 */
export async function handleUsageReset(
  job: Job<UsageResetJobData>
): Promise<UsageResetResult> {
  const result: UsageResetResult = {
    usersReset: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting monthly usage reset...`);

  try {
    const { data: usersWithUsage, error: fetchError } = await SUPABASE.from(
      "users"
    )
      .select("id, ai_interactions_used, usage_reset_at")
      .gt("ai_interactions_used", 0);

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`);
      logger.error(`[Job ${job.id}] Error fetching users:`, fetchError);
      throw fetchError;
    }

    if (!usersWithUsage || usersWithUsage.length === 0) {
      logger.info(`[Job ${job.id}] No users need usage reset`);
      return result;
    }

    const now = new Date();

    for (const user of usersWithUsage) {
      if (!shouldResetUsage(user.usage_reset_at, now)) {
        continue;
      }

      const resetOutcome = await resetUserUsage(user.id, now);

      if (resetOutcome.success) {
        result.usersReset++;
        logger.info(`[Job ${job.id}] Reset usage for user ${user.id}`);
      } else {
        result.errors.push(`Reset error for ${user.id}: ${resetOutcome.error}`);
        logger.error(
          `[Job ${job.id}] Error resetting ${user.id}:`,
          resetOutcome.error
        );
      }
    }

    logger.info(`[Job ${job.id}] Monthly usage reset completed`, result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(errorMessage);
    logger.error(`[Job ${job.id}] Monthly usage reset failed:`, error);
    throw error;
  }
}

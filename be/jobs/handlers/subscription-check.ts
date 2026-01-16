import type { Job } from "bullmq";
import { SUPABASE } from "@/config/clients";
import { logger } from "@/utils/logger";

const GRACE_PERIOD_DAYS = 3;

export type SubscriptionCheckJobData = Record<string, never>;

export type SubscriptionCheckResult = {
  checked: number;
  expiredGracePeriod: number;
  errors: string[];
};

export async function handleSubscriptionStatusCheck(
  job: Job<SubscriptionCheckJobData>
): Promise<SubscriptionCheckResult> {
  const result: SubscriptionCheckResult = {
    checked: 0,
    expiredGracePeriod: 0,
    errors: [],
  };

  logger.info(`[Job ${job.id}] Starting subscription status check...`);

  try {
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - GRACE_PERIOD_DAYS);

    const { data: expiredSubscriptions, error: fetchError } =
      await SUPABASE.from("subscriptions")
        .select("id, user_id, status, current_period_end")
        .eq("status", "canceled")
        .lt("current_period_end", gracePeriodEnd.toISOString());

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`);
      logger.error(
        `[Job ${job.id}] Error fetching expired subscriptions:`,
        fetchError
      );
      throw fetchError;
    }

    result.checked = expiredSubscriptions?.length || 0;

    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      logger.info(
        `[Job ${job.id}] Found ${expiredSubscriptions.length} subscriptions past grace period`
      );

      for (const subscription of expiredSubscriptions) {
        const { error: updateError } = await SUPABASE.from("subscriptions")
          .update({
            status: "unpaid",
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        if (updateError) {
          result.errors.push(
            `Update error for subscription ${subscription.id}: ${updateError.message}`
          );
          logger.error(
            `[Job ${job.id}] Failed to update subscription ${subscription.id}:`,
            updateError
          );
        } else {
          result.expiredGracePeriod++;
          logger.info(
            `[Job ${job.id}] Marked subscription ${subscription.id} as unpaid`
          );
        }
      }
    } else {
      logger.info(`[Job ${job.id}] No expired subscriptions found`);
    }

    logger.info(`[Job ${job.id}] Subscription status check completed`, result);
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    result.errors.push(errorMessage);
    logger.error(`[Job ${job.id}] Subscription status check failed:`, error);
    throw error;
  }
}

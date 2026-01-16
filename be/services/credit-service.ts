import { SUPABASE } from "@/config/clients";
import { logger } from "@/utils/logger";

const CREDIT_COST_PER_INTERACTION = 1;

export type CreditCheckResult = {
  hasCredits: boolean;
  creditsRemaining: number;
  subscriptionId: string | null;
  source: "subscription" | "credits" | "none";
};

export type CreditDeductionResult = {
  success: boolean;
  newBalance: number;
  error?: string;
};

export async function checkUserCredits(
  userId: string
): Promise<CreditCheckResult> {
  const { data: subscription, error } = await SUPABASE.from("subscriptions")
    .select("id, ai_interactions_used, credits_remaining, plan_id, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (error) {
    logger.error(
      `[CreditService] Error checking credits for user ${userId}`,
      error
    );
    return {
      hasCredits: false,
      creditsRemaining: 0,
      subscriptionId: null,
      source: "none",
    };
  }

  if (!subscription) {
    return {
      hasCredits: false,
      creditsRemaining: 0,
      subscriptionId: null,
      source: "none",
    };
  }

  const { data: plan } = await SUPABASE.from("plans")
    .select("ai_interactions_monthly")
    .eq("id", subscription.plan_id)
    .single();

  const monthlyLimit = plan?.ai_interactions_monthly || 0;
  const used = subscription.ai_interactions_used || 0;
  const subscriptionRemaining = Math.max(0, monthlyLimit - used);
  const creditPackRemaining = subscription.credits_remaining || 0;

  if (subscriptionRemaining > 0) {
    return {
      hasCredits: true,
      creditsRemaining: subscriptionRemaining + creditPackRemaining,
      subscriptionId: subscription.id,
      source: "subscription",
    };
  }

  if (creditPackRemaining > 0) {
    return {
      hasCredits: true,
      creditsRemaining: creditPackRemaining,
      subscriptionId: subscription.id,
      source: "credits",
    };
  }

  return {
    hasCredits: false,
    creditsRemaining: 0,
    subscriptionId: subscription.id,
    source: "none",
  };
}

export async function deductCredit(
  userId: string,
  subscriptionId: string,
  source: "subscription" | "credits"
): Promise<CreditDeductionResult> {
  try {
    if (source === "subscription") {
      const { data: sub, error: subFetchError } = await SUPABASE.from(
        "subscriptions"
      )
        .select("ai_interactions_used")
        .eq("id", subscriptionId)
        .single();

      if (subFetchError || !sub) {
        return {
          success: false,
          newBalance: 0,
          error: "Subscription not found",
        };
      }

      const newUsed =
        (sub.ai_interactions_used || 0) + CREDIT_COST_PER_INTERACTION;

      const { error: subUpdateError } = await SUPABASE.from("subscriptions")
        .update({
          ai_interactions_used: newUsed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId);

      if (subUpdateError) {
        logger.error(
          "[CreditService] Error deducting subscription credit:",
          subUpdateError
        );
        return { success: false, newBalance: 0, error: subUpdateError.message };
      }

      logger.info(
        `[CreditService] Deducted 1 subscription credit for user ${userId}`
      );
      return { success: true, newBalance: newUsed };
    }

    const { data: creditSub, error: creditFetchError } = await SUPABASE.from(
      "subscriptions"
    )
      .select("credits_remaining")
      .eq("id", subscriptionId)
      .single();

    if (creditFetchError || !creditSub) {
      return { success: false, newBalance: 0, error: "Subscription not found" };
    }

    const currentCredits = creditSub.credits_remaining || 0;
    if (currentCredits < CREDIT_COST_PER_INTERACTION) {
      return {
        success: false,
        newBalance: currentCredits,
        error: "Insufficient credits",
      };
    }

    const newBalance = currentCredits - CREDIT_COST_PER_INTERACTION;

    const { error: creditUpdateError } = await SUPABASE.from("subscriptions")
      .update({
        credits_remaining: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    if (creditUpdateError) {
      logger.error(
        "[CreditService] Error deducting credit pack:",
        creditUpdateError
      );
      return {
        success: false,
        newBalance: currentCredits,
        error: creditUpdateError.message,
      };
    }

    logger.info(
      `[CreditService] Deducted 1 credit for user ${userId}, remaining: ${newBalance}`
    );
    return { success: true, newBalance };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("[CreditService] Unexpected error:", error);
    return { success: false, newBalance: 0, error: errorMessage };
  }
}

export class CreditTransaction {
  private readonly userId: string;
  private creditCheck: CreditCheckResult | null = null;
  private committed = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  async begin(): Promise<CreditCheckResult> {
    this.creditCheck = await checkUserCredits(this.userId);
    return this.creditCheck;
  }

  async commit(): Promise<CreditDeductionResult> {
    if (this.committed) {
      return { success: true, newBalance: 0, error: "Already committed" };
    }

    if (!this.creditCheck) {
      return {
        success: false,
        newBalance: 0,
        error: "No credit check performed",
      };
    }

    if (!this.creditCheck.hasCredits) {
      return { success: false, newBalance: 0, error: "No credits available" };
    }

    if (!this.creditCheck.subscriptionId) {
      return { success: false, newBalance: 0, error: "No subscription found" };
    }

    const result = await deductCredit(
      this.userId,
      this.creditCheck.subscriptionId,
      this.creditCheck.source as "subscription" | "credits"
    );

    if (result.success) {
      this.committed = true;
    }

    return result;
  }

  rollback(): void {
    this.committed = false;
    logger.info(
      `[CreditService] Transaction rolled back for user ${this.userId} (no credit deducted)`
    );
  }

  isCommitted(): boolean {
    return this.committed;
  }
}

export function createCreditTransaction(userId: string): CreditTransaction {
  return new CreditTransaction(userId);
}

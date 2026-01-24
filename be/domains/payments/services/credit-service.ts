import {
  checkUserAccess,
  getPlanLimits,
  getUserUsage,
  type PlanSlug,
  updateUserUsage,
} from "@/domains/payments/services/lemonsqueezy-service"
import { logger } from "@/lib/logger"

const CREDIT_COST_PER_INTERACTION = 1

export type CreditCheckResult = {
  hasCredits: boolean
  creditsRemaining: number
  userId: string
  source: "subscription" | "credits" | "none"
}

export type CreditDeductionResult = {
  success: boolean
  newBalance: number
  error?: string
}

export async function checkUserCredits(
  userId: string,
  email: string
): Promise<CreditCheckResult> {
  const access = await checkUserAccess(userId, email)

  if (!access.has_access) {
    return {
      hasCredits: false,
      creditsRemaining: 0,
      userId,
      source: "none",
    }
  }

  // Trial users (on_trial status with null interactions_remaining) have unlimited access
  const isOnTrial = access.subscription_status === "on_trial"
  if (isOnTrial && access.interactions_remaining === null) {
    return {
      hasCredits: true,
      creditsRemaining: Number.POSITIVE_INFINITY,
      userId,
      source: "subscription",
    }
  }

  const usage = await getUserUsage(userId)
  const planSlug = access.plan_slug as PlanSlug
  const limits = getPlanLimits(planSlug)

  // For paid plans, null means unlimited
  const monthlyLimit = limits.aiInteractionsMonthly
  const subscriptionRemaining =
    monthlyLimit === null
      ? Number.POSITIVE_INFINITY
      : Math.max(0, monthlyLimit - usage.aiInteractionsUsed)
  const creditPackRemaining = usage.creditsRemaining

  if (subscriptionRemaining > 0) {
    return {
      hasCredits: true,
      creditsRemaining:
        subscriptionRemaining === Number.POSITIVE_INFINITY
          ? Number.POSITIVE_INFINITY
          : subscriptionRemaining + creditPackRemaining,
      userId,
      source: "subscription",
    }
  }

  if (creditPackRemaining > 0) {
    return {
      hasCredits: true,
      creditsRemaining: creditPackRemaining,
      userId,
      source: "credits",
    }
  }

  return {
    hasCredits: false,
    creditsRemaining: 0,
    userId,
    source: "none",
  }
}

export async function deductCredit(
  userId: string,
  source: "subscription" | "credits"
): Promise<CreditDeductionResult> {
  try {
    const usage = await getUserUsage(userId)

    if (source === "subscription") {
      const newUsed = usage.aiInteractionsUsed + CREDIT_COST_PER_INTERACTION
      await updateUserUsage(userId, newUsed)

      logger.info(
        `[CreditService] Deducted 1 subscription credit for user ${userId}`
      )
      return { success: true, newBalance: newUsed }
    }

    const currentCredits = usage.creditsRemaining
    if (currentCredits < CREDIT_COST_PER_INTERACTION) {
      return {
        success: false,
        newBalance: currentCredits,
        error: "Insufficient credits",
      }
    }

    const newBalance = currentCredits - CREDIT_COST_PER_INTERACTION
    await updateUserUsage(userId, usage.aiInteractionsUsed, newBalance)

    logger.info(
      `[CreditService] Deducted 1 credit for user ${userId}, remaining: ${newBalance}`
    )
    return { success: true, newBalance }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error"
    logger.error("[CreditService] Unexpected error:", { error })
    return { success: false, newBalance: 0, error: errorMessage }
  }
}

export class CreditTransaction {
  private readonly userId: string
  private readonly email: string
  private creditCheck: CreditCheckResult | null = null
  private committed = false

  constructor(userId: string, email: string) {
    this.userId = userId
    this.email = email
  }

  async begin(): Promise<CreditCheckResult> {
    this.creditCheck = await checkUserCredits(this.userId, this.email)
    return this.creditCheck
  }

  async commit(): Promise<CreditDeductionResult> {
    if (this.committed) {
      return { success: true, newBalance: 0, error: "Already committed" }
    }

    if (!this.creditCheck) {
      return {
        success: false,
        newBalance: 0,
        error: "No credit check performed",
      }
    }

    if (!this.creditCheck.hasCredits) {
      return { success: false, newBalance: 0, error: "No credits available" }
    }

    const result = await deductCredit(
      this.userId,
      this.creditCheck.source as "subscription" | "credits"
    )

    if (result.success) {
      this.committed = true
    }

    return result
  }

  rollback(): void {
    this.committed = false
    logger.info(
      `[CreditService] Transaction rolled back for user ${this.userId} (no credit deducted)`
    )
  }

  isCommitted(): boolean {
    return this.committed
  }
}

export function createCreditTransaction(
  userId: string,
  email: string
): CreditTransaction {
  return new CreditTransaction(userId, email)
}

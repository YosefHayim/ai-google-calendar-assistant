import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js"
import { env } from "@/config/env"

let isInitialized = false

/**
 * Initialize the LemonSqueezy SDK with API key.
 * Must be called before using any LemonSqueezy functions.
 */
export const initializeLemonSqueezy = (): void => {
  if (isInitialized) {
    return
  }

  if (!env.lemonSqueezy.isEnabled) {
    return
  }

  lemonSqueezySetup({
    apiKey: env.lemonSqueezy.apiKey!,
    onError: (error) => console.error("LemonSqueezy Error:", error),
  })

  isInitialized = true
}

/**
 * Check if LemonSqueezy is available/configured
 */
export const isLemonSqueezyEnabled = (): boolean => env.lemonSqueezy.isEnabled

/**
 * Get LemonSqueezy store ID for API calls
 */
export const getLemonSqueezyStoreId = (): string | undefined =>
  env.lemonSqueezy.storeId

export const LEMONSQUEEZY_CONFIG = {
  TRIAL_DAYS: 14,

  MONEY_BACK_DAYS: 30,

  CHECKOUT: {
    SUCCESS_URL: `${env.urls.frontend}/dashboard/billing?success=true`,
    CANCEL_URL: `${env.urls.frontend}/pricing?canceled=true`,
  },

  METADATA_KEYS: {
    USER_ID: "user_id",
    PLAN_SLUG: "plan_slug",
    INTERVAL: "interval",
    CREDIT_PACK_SIZE: "credit_pack_size",
  },

  WEBHOOK_EVENTS: [
    "order_created",
    "order_refunded",
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_resumed",
    "subscription_expired",
    "subscription_paused",
    "subscription_unpaused",
    "subscription_payment_success",
    "subscription_payment_failed",
    "subscription_payment_recovered",
  ] as const,
} as const

export type LemonSqueezyWebhookEvent =
  (typeof LEMONSQUEEZY_CONFIG.WEBHOOK_EVENTS)[number]

export type CreateCheckoutParams = {
  userId: string
  userEmail: string
  userName?: string
  planSlug: "starter" | "pro" | "executive"
  interval: "monthly" | "yearly"
  successUrl?: string
  cancelUrl?: string
}

export type CreateCreditPackCheckoutParams = {
  userId: string
  userEmail: string
  credits: number
  planSlug: "starter" | "pro" | "executive"
  successUrl?: string
  cancelUrl?: string
}

export type SubscriptionInfo = {
  id: string
  status: string
  planName: string
  planSlug: string
  interval: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialStart: Date | null
  trialEnd: Date | null
  cancelAtPeriodEnd: boolean
  canceledAt: Date | null
}

export type BillingPortalParams = {
  customerId: string
  returnUrl?: string
}

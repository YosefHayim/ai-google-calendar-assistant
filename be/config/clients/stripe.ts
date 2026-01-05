import Stripe from "stripe";
import { env } from "@/config/env";

// ============================================================================
// Stripe Client Configuration
// ============================================================================

let stripeClient: Stripe | null = null;

/**
 * Initialize and get the Stripe client
 * @returns Stripe client instance
 * @throws Error if Stripe is not configured
 */
export const getStripeClient = (): Stripe => {
  if (!env.stripe.isEnabled) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripe.secretKey!, {
      apiVersion: "2025-08-27.basil",
      typescript: true,
      appInfo: {
        name: "ai-calendar-assistant",
        version: "1.0.0",
      },
    });
  }

  return stripeClient;
};

/**
 * Check if Stripe is available/configured
 */
export const isStripeEnabled = (): boolean => env.stripe.isEnabled;

/**
 * Get Stripe publishable key for frontend
 */
export const getStripePublishableKey = (): string | undefined => env.stripe.publishableKey;

// ============================================================================
// Stripe Configuration Constants
// ============================================================================

export const STRIPE_CONFIG = {
  // Trial period
  TRIAL_DAYS: 14,

  // Money-back guarantee period
  MONEY_BACK_DAYS: 30,

  // Currency
  DEFAULT_CURRENCY: "usd",

  // Checkout session settings
  CHECKOUT: {
    SUCCESS_URL: `${env.urls.frontend}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    CANCEL_URL: `${env.urls.frontend}/pricing?canceled=true`,
    BILLING_PORTAL_RETURN_URL: `${env.urls.frontend}/dashboard/billing`,
  },

  // Price IDs from environment
  PRICES: env.stripe.prices,

  // Product metadata keys
  METADATA_KEYS: {
    USER_ID: "user_id",
    PLAN_SLUG: "plan_slug",
    INTERVAL: "interval",
    CREDIT_PACK_SIZE: "credit_pack_size",
  },

  // Webhook event types we care about
  WEBHOOK_EVENTS: [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "customer.created",
    "customer.updated",
  ] as const,
} as const;

// ============================================================================
// Stripe Types
// ============================================================================

export type StripeWebhookEvent = (typeof STRIPE_CONFIG.WEBHOOK_EVENTS)[number];

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  planSlug: "starter" | "pro" | "executive";
  interval: "monthly" | "yearly";
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCreditPackCheckoutParams {
  userId: string;
  userEmail: string;
  credits: number;
  planSlug: "starter" | "pro" | "executive";
  successUrl?: string;
  cancelUrl?: string;
}

export interface SubscriptionInfo {
  id: string;
  status: Stripe.Subscription.Status;
  planName: string;
  planSlug: string;
  interval: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart: Date | null;
  trialEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
}

export interface BillingPortalParams {
  customerId: string;
  returnUrl?: string;
}

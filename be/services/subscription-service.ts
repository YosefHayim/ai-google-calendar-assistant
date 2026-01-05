import type Stripe from "stripe";
import { SUPABASE } from "@/config";
import { getStripeClient, STRIPE_CONFIG } from "@/config/clients";

// ============================================================================
// Types
// ============================================================================

export type PlanSlug = "starter" | "pro" | "executive";
export type PlanInterval = "monthly" | "yearly" | "one_time";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  description: string | null;
  stripe_product_id: string | null;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
  price_monthly_cents: number;
  price_yearly_cents: number;
  price_per_use_cents: number;
  ai_interactions_monthly: number | null;
  action_pack_size: number | null;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  is_highlighted: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  interval: PlanInterval;
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  first_payment_at: string | null;
  money_back_eligible_until: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  cancellation_reason: string | null;
  ai_interactions_used: number;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface CreditPack {
  id: string;
  user_id: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  credits_purchased: number;
  credits_remaining: number;
  price_cents: number;
  status: string;
  purchased_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserAccess {
  has_access: boolean;
  subscription_status: SubscriptionStatus | null;
  plan_name: string | null;
  plan_slug: string | null;
  interactions_remaining: number | null;
  credits_remaining: number;
  trial_days_left: number | null;
  money_back_eligible: boolean;
}

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  planSlug: PlanSlug;
  interval: "monthly" | "yearly";
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCreditPackCheckoutParams {
  userId: string;
  userEmail: string;
  credits: number;
  planSlug: PlanSlug;
  successUrl?: string;
  cancelUrl?: string;
}

// Use any for Supabase calls to new tables until types are regenerated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = SUPABASE as any;

// ============================================================================
// Plan Management
// ============================================================================

/**
 * Get all active plans
 */
export const getActivePlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch plans: ${error.message}`);
  return data || [];
};

/**
 * Get plan by slug
 */
export const getPlanBySlug = async (slug: PlanSlug): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
  return data;
};

/**
 * Get plan by ID
 */
export const getPlanById = async (planId: string): Promise<Plan | null> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
  return data;
};

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Get user's active subscription
 */
export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["trialing", "active", "past_due"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch subscription: ${error.message}`);
  return data;
};

/**
 * Get subscription by Stripe subscription ID
 */
export const getSubscriptionByStripeId = async (stripeSubscriptionId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", stripeSubscriptionId)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch subscription: ${error.message}`);
  return data;
};

/**
 * Check user access (subscription + credits)
 */
export const checkUserAccess = async (userId: string): Promise<UserAccess> => {
  // Get active subscription
  const subscription = await getUserSubscription(userId);
  
  // Get available credits from credit packs
  const { data: creditPacks } = await supabase
    .from("credit_packs")
    .select("credits_remaining")
    .eq("user_id", userId)
    .eq("status", "succeeded")
    .gt("credits_remaining", 0);

  const totalCredits = creditPacks?.reduce((sum: number, pack: CreditPack) => sum + pack.credits_remaining, 0) || 0;

  if (!subscription) {
    return {
      has_access: totalCredits > 0,
      subscription_status: null,
      plan_name: null,
      plan_slug: null,
      interactions_remaining: null,
      credits_remaining: totalCredits,
      trial_days_left: null,
      money_back_eligible: false,
    };
  }

  // Get plan details
  const plan = await getPlanById(subscription.plan_id);

  // Calculate trial days left
  let trialDaysLeft: number | null = null;
  if (subscription.status === "trialing" && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Calculate interactions remaining
  let interactionsRemaining: number | null = null;
  if (plan?.ai_interactions_monthly !== null) {
    interactionsRemaining = (plan?.ai_interactions_monthly || 0) - subscription.ai_interactions_used;
  }

  // Check money-back eligibility
  const moneyBackEligible = subscription.money_back_eligible_until
    ? new Date(subscription.money_back_eligible_until) > new Date()
    : false;

  return {
    has_access: ["trialing", "active"].includes(subscription.status) || totalCredits > 0,
    subscription_status: subscription.status,
    plan_name: plan?.name || null,
    plan_slug: plan?.slug || null,
    interactions_remaining: interactionsRemaining,
    credits_remaining: totalCredits + subscription.credits_remaining,
    trial_days_left: trialDaysLeft,
    money_back_eligible: moneyBackEligible,
  };
};

/**
 * Create a new subscription record
 */
export const createSubscription = async (params: {
  userId: string;
  planId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status?: SubscriptionStatus;
  interval?: PlanInterval;
  trialDays?: number;
}): Promise<UserSubscription> => {
  const now = new Date();
  const trialEnd = params.trialDays
    ? new Date(now.getTime() + params.trialDays * 24 * 60 * 60 * 1000)
    : null;

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: params.userId,
      plan_id: params.planId,
      stripe_customer_id: params.stripeCustomerId,
      stripe_subscription_id: params.stripeSubscriptionId,
      stripe_price_id: params.stripePriceId,
      status: params.status || "trialing",
      interval: params.interval || "monthly",
      trial_start: trialEnd ? now.toISOString() : null,
      trial_end: trialEnd?.toISOString() || null,
      current_period_start: now.toISOString(),
      current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create subscription: ${error.message}`);
  return data;
};

/**
 * Update subscription from Stripe webhook
 */
export const updateSubscriptionFromStripe = async (
  stripeSubscription: Stripe.Subscription
): Promise<UserSubscription | null> => {
  const subscriptionId = stripeSubscription.id;
  const customerId = typeof stripeSubscription.customer === "string"
    ? stripeSubscription.customer
    : stripeSubscription.customer.id;

  // Map Stripe status to our status
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    trialing: "trialing",
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    unpaid: "unpaid",
    incomplete: "incomplete",
    incomplete_expired: "incomplete_expired",
    paused: "paused",
  };

  const status = statusMap[stripeSubscription.status];
  const priceId = stripeSubscription.items.data[0]?.price.id;

  // Calculate money-back eligibility
  let moneyBackEligibleUntil: string | null = null;
  let firstPaymentAt: string | null = null;

  if (status === "active" && stripeSubscription.start_date) {
    const startDate = new Date(stripeSubscription.start_date * 1000);
    firstPaymentAt = startDate.toISOString();
    moneyBackEligibleUntil = new Date(
      startDate.getTime() + STRIPE_CONFIG.MONEY_BACK_DAYS * 24 * 60 * 60 * 1000
    ).toISOString();
  }

  // Use type assertion for subscription properties that may not be in the type definition
  const subAny = stripeSubscription as any;
  
  const updateData = {
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: customerId,
    stripe_price_id: priceId,
    status,
    trial_start: stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000).toISOString()
      : null,
    trial_end: stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000).toISOString()
      : null,
    current_period_start: subAny.current_period_start
      ? new Date(subAny.current_period_start * 1000).toISOString()
      : new Date().toISOString(),
    current_period_end: subAny.current_period_end
      ? new Date(subAny.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000).toISOString()
      : null,
    first_payment_at: firstPaymentAt,
    money_back_eligible_until: moneyBackEligibleUntil,
  };

  // Try to update by Stripe subscription ID first
  let { data, error } = await supabase
    .from("subscriptions")
    .update(updateData)
    .eq("stripe_subscription_id", subscriptionId)
    .select()
    .maybeSingle();

  // If not found, try to update by customer ID (for new subscriptions)
  if (!data && !error) {
    const result = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("stripe_customer_id", customerId)
      .is("stripe_subscription_id", null)
      .select()
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  if (error) throw new Error(`Failed to update subscription: ${error.message}`);
  return data;
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  reason?: string,
  cancelImmediately = false
): Promise<UserSubscription | null> => {
  const stripe = getStripeClient();
  const subscription = await getSubscriptionByStripeId(subscriptionId);

  if (!subscription?.stripe_subscription_id) {
    throw new Error("Subscription not found or not linked to Stripe");
  }

  // Cancel in Stripe
  if (cancelImmediately) {
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
  } else {
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  }

  // Update in database
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      cancel_at_period_end: !cancelImmediately,
      canceled_at: new Date().toISOString(),
      cancellation_reason: reason,
      status: cancelImmediately ? "canceled" : subscription.status,
    })
    .eq("id", subscription.id)
    .select()
    .single();

  if (error) throw new Error(`Failed to cancel subscription: ${error.message}`);
  return data;
};

// ============================================================================
// Stripe Checkout & Portal
// ============================================================================

/**
 * Get or create Stripe customer for user
 */
export const getOrCreateStripeCustomer = async (
  userId: string,
  email: string
): Promise<string> => {
  const stripe = getStripeClient();

  // Check if user already has a Stripe customer ID
  const subscription = await getUserSubscription(userId);
  if (subscription?.stripe_customer_id) {
    return subscription.stripe_customer_id;
  }

  // Check if customer exists in Stripe by email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      [STRIPE_CONFIG.METADATA_KEYS.USER_ID]: userId,
    },
  });

  return customer.id;
};

/**
 * Create Stripe Checkout session for subscription
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> => {
  const stripe = getStripeClient();
  const { userId, userEmail, planSlug, interval, successUrl, cancelUrl } = params;

  // Get plan
  const plan = await getPlanBySlug(planSlug);
  if (!plan) throw new Error(`Plan not found: ${planSlug}`);

  // Get or create Stripe price ID
  const priceId = interval === "monthly"
    ? plan.stripe_price_id_monthly || STRIPE_CONFIG.PRICES.pro?.monthly
    : plan.stripe_price_id_yearly || STRIPE_CONFIG.PRICES.pro?.yearly;

  if (!priceId) {
    throw new Error(`No Stripe price configured for plan: ${planSlug} (${interval})`);
  }

  // Get or create customer
  const customerId = await getOrCreateStripeCustomer(userId, userEmail);

  // Create checkout session with 14-day trial
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: STRIPE_CONFIG.TRIAL_DAYS,
      metadata: {
        [STRIPE_CONFIG.METADATA_KEYS.USER_ID]: userId,
        [STRIPE_CONFIG.METADATA_KEYS.PLAN_SLUG]: planSlug,
        [STRIPE_CONFIG.METADATA_KEYS.INTERVAL]: interval,
      },
    },
    metadata: {
      [STRIPE_CONFIG.METADATA_KEYS.USER_ID]: userId,
      [STRIPE_CONFIG.METADATA_KEYS.PLAN_SLUG]: planSlug,
      [STRIPE_CONFIG.METADATA_KEYS.INTERVAL]: interval,
    },
    success_url: successUrl || STRIPE_CONFIG.CHECKOUT.SUCCESS_URL,
    cancel_url: cancelUrl || STRIPE_CONFIG.CHECKOUT.CANCEL_URL,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer_update: {
      address: "auto",
    },
  });

  // Create pending subscription record
  await createSubscription({
    userId,
    planId: plan.id,
    stripeCustomerId: customerId,
    status: "incomplete",
    interval,
    trialDays: STRIPE_CONFIG.TRIAL_DAYS,
  });

  return session;
};

/**
 * Create Stripe Checkout session for credit pack (one-time purchase)
 */
export const createCreditPackCheckout = async (
  params: CreateCreditPackCheckoutParams
): Promise<Stripe.Checkout.Session> => {
  const stripe = getStripeClient();
  const { userId, userEmail, credits, planSlug, successUrl, cancelUrl } = params;

  // Get plan for pricing
  const plan = await getPlanBySlug(planSlug);
  if (!plan) throw new Error(`Plan not found: ${planSlug}`);

  // Calculate price: $1 = 100 credits
  const priceInCents = Math.ceil(credits / 100) * 100; // Round up to nearest dollar

  // Get or create customer
  const customerId = await getOrCreateStripeCustomer(userId, userEmail);

  // Create checkout session for one-time payment
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: STRIPE_CONFIG.DEFAULT_CURRENCY,
          product_data: {
            name: `${credits} AI Credits Pack`,
            description: `${credits} AI interactions for ${plan.name} tier`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      [STRIPE_CONFIG.METADATA_KEYS.USER_ID]: userId,
      [STRIPE_CONFIG.METADATA_KEYS.PLAN_SLUG]: planSlug,
      [STRIPE_CONFIG.METADATA_KEYS.CREDIT_PACK_SIZE]: credits.toString(),
    },
    success_url: successUrl || STRIPE_CONFIG.CHECKOUT.SUCCESS_URL,
    cancel_url: cancelUrl || STRIPE_CONFIG.CHECKOUT.CANCEL_URL,
  });

  // Create pending credit pack record
  await supabase.from("credit_packs").insert({
    user_id: userId,
    stripe_checkout_session_id: session.id,
    credits_purchased: credits,
    credits_remaining: credits,
    price_cents: priceInCents,
    status: "pending",
  });

  return session;
};

/**
 * Create Stripe Billing Portal session
 */
export const createBillingPortalSession = async (
  customerId: string,
  returnUrl?: string
): Promise<Stripe.BillingPortal.Session> => {
  const stripe = getStripeClient();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || STRIPE_CONFIG.CHECKOUT.BILLING_PORTAL_RETURN_URL,
  });

  return session;
};

// ============================================================================
// Webhook Event Handling
// ============================================================================

/**
 * Check if webhook event has been processed (idempotency)
 */
export const isWebhookEventProcessed = async (eventId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("stripe_webhook_events")
    .select("processed")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  return data?.processed || false;
};

/**
 * Record webhook event
 */
export const recordWebhookEvent = async (
  eventId: string,
  eventType: string,
  payload: object,
  processed = false,
  errorMessage?: string
): Promise<void> => {
  const { error } = await supabase.from("stripe_webhook_events").upsert({
    stripe_event_id: eventId,
    event_type: eventType,
    payload,
    processed,
    processed_at: processed ? new Date().toISOString() : null,
    error_message: errorMessage,
  });

  if (error) {
    console.error("Failed to record webhook event:", error);
  }
};

/**
 * Handle checkout.session.completed webhook
 */
export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session): Promise<void> => {
  const userId = session.metadata?.[STRIPE_CONFIG.METADATA_KEYS.USER_ID];
  const planSlug = session.metadata?.[STRIPE_CONFIG.METADATA_KEYS.PLAN_SLUG];
  const creditPackSize = session.metadata?.[STRIPE_CONFIG.METADATA_KEYS.CREDIT_PACK_SIZE];

  if (!userId) {
    console.error("No user_id in checkout session metadata");
    return;
  }

  // Handle credit pack purchase
  if (creditPackSize) {
    await supabase
      .from("credit_packs")
      .update({
        status: "succeeded",
        stripe_payment_intent_id: session.payment_intent as string,
        purchased_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id);

    // Record payment
    await supabase.from("payment_history").insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      amount_cents: session.amount_total || 0,
      status: "succeeded",
      description: `Credit pack purchase: ${creditPackSize} credits`,
    });

    return;
  }

  // Handle subscription checkout - subscription will be created/updated via subscription webhooks
  if (planSlug && session.subscription) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    // Update subscription with Stripe IDs
    await supabase
      .from("subscriptions")
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer as string,
        status: "trialing",
      })
      .eq("user_id", userId)
      .eq("status", "incomplete");
  }
};

/**
 * Handle invoice.paid webhook
 */
export const handleInvoicePaid = async (invoice: Stripe.Invoice): Promise<void> => {
  // Access subscription from the invoice object - use type assertion for expanded properties
  const invoiceAny = invoice as any;
  
  const subscriptionId = typeof invoiceAny.subscription === "string"
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) return;

  // Reset usage for new billing period
  await supabase
    .from("subscriptions")
    .update({
      ai_interactions_used: 0,
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    })
    .eq("id", subscription.id);

  const paymentIntentId = typeof invoiceAny.payment_intent === "string"
    ? invoiceAny.payment_intent
    : invoiceAny.payment_intent?.id;

  // Record payment
  await supabase.from("payment_history").insert({
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: paymentIntentId,
    amount_cents: invoice.amount_paid,
    status: "succeeded",
    description: `Subscription payment for ${invoice.period_start ? new Date(invoice.period_start * 1000).toLocaleDateString() : "period"}`,
    invoice_url: invoice.hosted_invoice_url,
    receipt_url: invoice.invoice_pdf,
  });
};

/**
 * Handle invoice.payment_failed webhook
 */
export const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice): Promise<void> => {
  // Access subscription from the invoice object - use type assertion for expanded properties
  const invoiceAny = invoice as any;
  
  const subscriptionId = typeof invoiceAny.subscription === "string"
    ? invoiceAny.subscription
    : invoiceAny.subscription?.id;

  if (!subscriptionId) return;

  const subscription = await getSubscriptionByStripeId(subscriptionId);
  if (!subscription) return;

  // Update subscription status
  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("id", subscription.id);

  const paymentIntentId = typeof invoiceAny.payment_intent === "string"
    ? invoiceAny.payment_intent
    : invoiceAny.payment_intent?.id;

  // Record failed payment
  await supabase.from("payment_history").insert({
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: paymentIntentId,
    amount_cents: invoice.amount_due,
    status: "failed",
    description: "Payment failed",
  });
};

// ============================================================================
// Usage Tracking
// ============================================================================

/**
 * Record usage for a user
 */
export const recordUsage = async (
  userId: string,
  actionType: string,
  quantity = 1
): Promise<boolean> => {
  // Check access first
  const access = await checkUserAccess(userId);
  if (!access.has_access) return false;

  // Get subscription
  const subscription = await getUserSubscription(userId);

  if (subscription) {
    // Check if within limits
    const plan = await getPlanById(subscription.plan_id);
    if (
      plan?.ai_interactions_monthly !== null &&
      subscription.ai_interactions_used + quantity > (plan?.ai_interactions_monthly || 0)
    ) {
      // Try to deduct from credits
      return await deductCredits(userId, quantity);
    }

    // Update subscription usage
    await supabase
      .from("subscriptions")
      .update({
        ai_interactions_used: subscription.ai_interactions_used + quantity,
      })
      .eq("id", subscription.id);

    // Record in usage_records
    const periodStart = subscription.current_period_start;
    const periodEnd = subscription.current_period_end;
    
    await supabase.from("usage_records").insert({
      user_id: userId,
      subscription_id: subscription.id,
      action_type: actionType,
      quantity,
      period_start: periodStart || new Date().toISOString(),
      period_end: periodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return true;
  }

  // No subscription, try credits
  return await deductCredits(userId, quantity);
};

/**
 * Deduct from credit packs
 */
const deductCredits = async (userId: string, quantity: number): Promise<boolean> => {
  // Get oldest credit pack with available credits
  const { data: creditPack } = await supabase
    .from("credit_packs")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "succeeded")
    .gt("credits_remaining", 0)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!creditPack || creditPack.credits_remaining < quantity) {
    return false;
  }

  // Deduct credits
  await supabase
    .from("credit_packs")
    .update({
      credits_remaining: creditPack.credits_remaining - quantity,
    })
    .eq("id", creditPack.id);

  return true;
};

// ============================================================================
// Refunds
// ============================================================================

/**
 * Process refund for money-back guarantee
 */
export const processMoneyBackRefund = async (
  subscriptionId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  const stripe = getStripeClient();
  const subscription = await getSubscriptionByStripeId(subscriptionId);

  if (!subscription) {
    return { success: false, message: "Subscription not found" };
  }

  // Check if eligible for money-back
  if (
    !subscription.money_back_eligible_until ||
    new Date(subscription.money_back_eligible_until) < new Date()
  ) {
    return { success: false, message: "Money-back guarantee period has expired" };
  }

  // Get latest payment
  const { data: payment } = await supabase
    .from("payment_history")
    .select("*")
    .eq("subscription_id", subscription.id)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment?.stripe_payment_intent_id) {
    return { success: false, message: "No payment found to refund" };
  }

  try {
    // Process refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripe_payment_intent_id,
      reason: "requested_by_customer",
    });

    // Cancel subscription
    await cancelSubscription(subscriptionId, reason, true);

    // Update payment record
    await supabase
      .from("payment_history")
      .update({
        status: "refunded",
        refunded_amount_cents: refund.amount,
        refund_reason: reason || "30-day money-back guarantee",
        refunded_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return { success: true, message: "Refund processed successfully" };
  } catch (error) {
    console.error("Refund error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process refund",
    };
  }
};

// ============================================================================
// Free Plan Management
// ============================================================================

/**
 * Ensure user has at least the free Starter plan
 */
export const ensureFreePlan = async (userId: string): Promise<UserSubscription | null> => {
  // Check if user already has a subscription
  const existing = await getUserSubscription(userId);
  if (existing) return existing;

  // Get starter plan
  const starterPlan = await getPlanBySlug("starter");
  if (!starterPlan) {
    console.error("Starter plan not found");
    return null;
  }

  // Create free subscription
  return await createSubscription({
    userId,
    planId: starterPlan.id,
    status: "active",
    interval: "monthly",
    trialDays: 0,
  });
};

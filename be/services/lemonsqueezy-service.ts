import {
  createCheckout,
  getSubscription,
  updateSubscription,
  cancelSubscription as lsCancelSubscription,
  getCustomer,
  listCustomers,
  listSubscriptionInvoices,
  type Checkout,
  type Subscription,
  type Customer,
  type SubscriptionInvoice,
} from "@lemonsqueezy/lemonsqueezy.js";
import { SUPABASE, env } from "@/config";
import { initializeLemonSqueezy, LEMONSQUEEZY_CONFIG } from "@/config/clients/lemonsqueezy";
import { ACTIVE_SUBSCRIPTION_STATUSES, VALID_SUBSCRIPTION_STATUSES } from "@/utils/db/subscription-status";

export type PlanSlug = "starter" | "pro" | "executive";
export type PlanInterval = "monthly" | "yearly" | "one_time";
// Database subscription_status enum values (matching Supabase schema)
export type SubscriptionStatus = "trialing" | "active" | "paused" | "past_due" | "unpaid" | "canceled" | "incomplete" | "incomplete_expired";

// LemonSqueezy status values (for mapping from webhooks)
type LemonSqueezyStatus = "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";

// Map LemonSqueezy status to database enum
const mapLemonSqueezyStatusToDb = (lsStatus: string): SubscriptionStatus => {
  const statusMap: Record<string, SubscriptionStatus> = {
    on_trial: "trialing",
    active: "active",
    paused: "paused",
    past_due: "past_due",
    unpaid: "unpaid",
    cancelled: "canceled",
    expired: "canceled",
  };
  return statusMap[lsStatus] || "active";
};

export interface Plan {
  id: string;
  name: string;
  slug: PlanSlug;
  description: string | null;
  lemonsqueezy_product_id: string | null;
  lemonsqueezy_variant_id_monthly: string | null;
  lemonsqueezy_variant_id_yearly: string | null;
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
  lemonsqueezy_customer_id: string | null;
  lemonsqueezy_subscription_id: string | null;
  lemonsqueezy_variant_id: string | null;
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
  lemonsqueezy_order_id: string | null;
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
  userName?: string;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = SUPABASE as any;

export const getActivePlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase.from("plans").select("*").eq("is_active", true).order("display_order", { ascending: true });

  if (error) throw new Error(`Failed to fetch plans: ${error.message}`);
  return data || [];
};

export const getPlanBySlug = async (slug: PlanSlug): Promise<Plan | null> => {
  const { data, error } = await supabase.from("plans").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();

  if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
  return data;
};

export const getPlanById = async (planId: string): Promise<Plan | null> => {
  const { data, error } = await supabase.from("plans").select("*").eq("id", planId).maybeSingle();

  if (error) throw new Error(`Failed to fetch plan: ${error.message}`);
  return data;
};

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", [...VALID_SUBSCRIPTION_STATUSES])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Failed to fetch subscription: ${error.message}`);
  return data;
};

export const getSubscriptionByLemonSqueezyId = async (lsSubscriptionId: string): Promise<UserSubscription | null> => {
  const { data, error } = await supabase.from("subscriptions").select("*").eq("lemonsqueezy_subscription_id", lsSubscriptionId).maybeSingle();

  if (error) throw new Error(`Failed to fetch subscription: ${error.message}`);
  return data;
};

export const checkUserAccess = async (userId: string): Promise<UserAccess> => {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return {
      has_access: false,
      subscription_status: null,
      plan_name: null,
      plan_slug: null,
      interactions_remaining: null,
      credits_remaining: 0,
      trial_days_left: null,
      money_back_eligible: false,
    };
  }

  const plan = await getPlanById(subscription.plan_id);

  let trialDaysLeft: number | null = null;
  if (subscription.status === "trialing" && subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  let interactionsRemaining: number | null = null;
  if (plan?.ai_interactions_monthly !== null) {
    interactionsRemaining = (plan?.ai_interactions_monthly || 0) - subscription.ai_interactions_used;
  }

  const moneyBackEligible = subscription.money_back_eligible_until ? new Date(subscription.money_back_eligible_until) > new Date() : false;

  return {
    has_access: ["trialing", "active"].includes(subscription.status),
    subscription_status: subscription.status,
    plan_name: plan?.name || null,
    plan_slug: plan?.slug || null,
    interactions_remaining: interactionsRemaining,
    credits_remaining: subscription.credits_remaining,
    trial_days_left: trialDaysLeft,
    money_back_eligible: moneyBackEligible,
  };
};

export const createSubscriptionRecord = async (params: {
  userId: string;
  planId: string;
  lemonSqueezyCustomerId?: string;
  lemonSqueezySubscriptionId?: string;
  lemonSqueezyVariantId?: string;
  status?: SubscriptionStatus;
  interval?: PlanInterval;
  trialDays?: number;
}): Promise<UserSubscription> => {
  const now = new Date();
  const trialEnd = params.trialDays ? new Date(now.getTime() + params.trialDays * 24 * 60 * 60 * 1000) : null;

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: params.userId,
      plan_id: params.planId,
      lemonsqueezy_customer_id: params.lemonSqueezyCustomerId,
      lemonsqueezy_subscription_id: params.lemonSqueezySubscriptionId,
      lemonsqueezy_variant_id: params.lemonSqueezyVariantId,
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

export const updateSubscriptionFromWebhook = async (lsSubscription: {
  id: string;
  customerId: string;
  variantId: string;
  status: string;
  trialEndsAt: string | null;
  renewsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  cancelledAt?: string | null;
}): Promise<UserSubscription | null> => {
  const status = mapLemonSqueezyStatusToDb(lsSubscription.status);

  let moneyBackEligibleUntil: string | null = null;
  let firstPaymentAt: string | null = null;

  if (status === "active" && lsSubscription.createdAt) {
    const startDate = new Date(lsSubscription.createdAt);
    firstPaymentAt = startDate.toISOString();
    moneyBackEligibleUntil = new Date(startDate.getTime() + LEMONSQUEEZY_CONFIG.MONEY_BACK_DAYS * 24 * 60 * 60 * 1000).toISOString();
  }

  const updateData = {
    lemonsqueezy_subscription_id: lsSubscription.id,
    lemonsqueezy_customer_id: lsSubscription.customerId,
    lemonsqueezy_variant_id: lsSubscription.variantId,
    status,
    trial_end: lsSubscription.trialEndsAt,
    current_period_end: lsSubscription.renewsAt || lsSubscription.endsAt,
    cancel_at_period_end: !!lsSubscription.endsAt && !lsSubscription.cancelledAt,
    canceled_at: lsSubscription.cancelledAt,
    first_payment_at: firstPaymentAt,
    money_back_eligible_until: moneyBackEligibleUntil,
  };

  let { data, error } = await supabase.from("subscriptions").update(updateData).eq("lemonsqueezy_subscription_id", lsSubscription.id).select().maybeSingle();

  if (!data && !error) {
    const result = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("lemonsqueezy_customer_id", lsSubscription.customerId)
      .is("lemonsqueezy_subscription_id", null)
      .select()
      .maybeSingle();

    data = result.data;
    error = result.error;
  }

  if (error) throw new Error(`Failed to update subscription: ${error.message}`);
  return data;
};

export const cancelSubscription = async (subscriptionId: string, reason?: string, cancelImmediately = false): Promise<UserSubscription | null> => {
  initializeLemonSqueezy();

  const subscription = await getSubscriptionByLemonSqueezyId(subscriptionId);

  if (!subscription?.lemonsqueezy_subscription_id) {
    throw new Error("Subscription not found or not linked to LemonSqueezy");
  }

  if (cancelImmediately) {
    await lsCancelSubscription(subscription.lemonsqueezy_subscription_id);
  } else {
    await updateSubscription(subscription.lemonsqueezy_subscription_id, {
      cancelled: true,
    });
  }

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

export const createCheckoutSession = async (params: CreateCheckoutSessionParams): Promise<{ url: string; id: string }> => {
  initializeLemonSqueezy();

  const { userId, userEmail, userName, planSlug, interval, successUrl, cancelUrl } = params;

  const plan = await getPlanBySlug(planSlug);
  if (!plan) throw new Error(`Plan not found: ${planSlug}`);

  const getVariantIdFromConfig = (slug: PlanSlug, int: "monthly" | "yearly") => {
    const variants = LEMONSQUEEZY_CONFIG.VARIANTS;
    if (slug === "starter") return int === "monthly" ? variants.starter?.monthly : variants.starter?.yearly;
    if (slug === "pro") return int === "monthly" ? variants.pro?.monthly : variants.pro?.yearly;
    if (slug === "executive") return int === "monthly" ? variants.executive?.monthly : variants.executive?.yearly;
    return null;
  };

  const variantId =
    interval === "monthly"
      ? plan.lemonsqueezy_variant_id_monthly || getVariantIdFromConfig(planSlug, "monthly")
      : plan.lemonsqueezy_variant_id_yearly || getVariantIdFromConfig(planSlug, "yearly");

  if (!variantId) {
    throw new Error(`No LemonSqueezy variant configured for plan: ${planSlug} (${interval})`);
  }

  const storeId = env.lemonSqueezy.storeId;
  if (!storeId) {
    throw new Error("LemonSqueezy store ID not configured");
  }

  const { data, error } = await createCheckout(storeId, variantId, {
    checkoutOptions: {
      embed: false,
      media: true,
      logo: true,
      desc: true,
      discount: true,
      subscriptionPreview: true,
    },
    checkoutData: {
      email: userEmail,
      name: userName,
      custom: {
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.USER_ID]: userId,
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.PLAN_SLUG]: planSlug,
        [LEMONSQUEEZY_CONFIG.METADATA_KEYS.INTERVAL]: interval,
      },
    },
    productOptions: {
      redirectUrl: successUrl || LEMONSQUEEZY_CONFIG.CHECKOUT.SUCCESS_URL,
    },
    testMode: env.isDev,
  });

  if (error) {
    throw new Error(`Failed to create checkout: ${error.message}`);
  }

  if (!data?.data?.attributes?.url) {
    throw new Error("No checkout URL returned from LemonSqueezy");
  }

  // Check if user has an existing orphaned subscription (not linked to LemonSqueezy)
  const existingSubscription = await getUserSubscription(userId);
  if (existingSubscription && !existingSubscription.lemonsqueezy_subscription_id) {
    // Update existing orphaned subscription instead of creating new
    const now = new Date();
    const trialEnd = new Date(now.getTime() + LEMONSQUEEZY_CONFIG.TRIAL_DAYS * 24 * 60 * 60 * 1000);

    await supabase
      .from("subscriptions")
      .update({
        plan_id: plan.id,
        status: "trialing",
        interval,
        trial_start: now.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", existingSubscription.id);
  } else {
    // Create new subscription record
    await createSubscriptionRecord({
      userId,
      planId: plan.id,
      status: "trialing",
      interval,
      trialDays: LEMONSQUEEZY_CONFIG.TRIAL_DAYS,
    });
  }

  return {
    url: data.data.attributes.url,
    id: data.data.id,
  };
};

// Credit pack checkout feature removed - subscriptions only
export const createCreditPackCheckout = async (_params: CreateCreditPackCheckoutParams): Promise<{ url: string; id: string }> => {
  throw new Error("Credit pack purchases are no longer supported. Please upgrade your subscription plan.");
};

export const getCustomerPortalUrl = async (customerId: string): Promise<string> => {
  initializeLemonSqueezy();

  const { data, error } = await getCustomer(customerId);

  if (error) {
    throw new Error(`Failed to get customer: ${error.message}`);
  }

  const portalUrl = data?.data?.attributes?.urls?.customer_portal;
  if (!portalUrl) {
    throw new Error("Customer portal URL not available");
  }

  return portalUrl;
};

export const isWebhookEventProcessed = async (eventId: string): Promise<boolean> => {
  const { data } = await supabase.from("lemonsqueezy_webhook_events").select("processed").eq("event_id", eventId).maybeSingle();

  return data?.processed || false;
};

export const recordWebhookEvent = async (eventId: string, eventType: string, payload: object, processed = false, errorMessage?: string): Promise<void> => {
  const { error } = await supabase.from("lemonsqueezy_webhook_events").upsert({
    event_id: eventId,
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

export const handleOrderCreated = async (order: {
  id: string;
  customerId: string;
  userEmail: string;
  status: string;
  totalFormatted: string;
  customData?: Record<string, string>;
}): Promise<void> => {
  const userId = order.customData?.[LEMONSQUEEZY_CONFIG.METADATA_KEYS.USER_ID];

  if (!userId) {
    console.error("No user_id in order custom data");
    return;
  }

  // Order created - subscription will be handled by handleSubscriptionCreated
  console.log(`Order ${order.id} created for user ${userId}`);
};

export const handleSubscriptionCreated = async (subscription: {
  id: string;
  customerId: string;
  variantId: string;
  status: string;
  trialEndsAt: string | null;
  renewsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  customData?: Record<string, string>;
}): Promise<void> => {
  const userId = subscription.customData?.[LEMONSQUEEZY_CONFIG.METADATA_KEYS.USER_ID];
  const planSlug = subscription.customData?.[LEMONSQUEEZY_CONFIG.METADATA_KEYS.PLAN_SLUG];

  if (!userId) {
    console.error("No user_id in subscription custom data");
    return;
  }

  await supabase
    .from("subscriptions")
    .update({
      lemonsqueezy_subscription_id: subscription.id,
      lemonsqueezy_customer_id: subscription.customerId,
      lemonsqueezy_variant_id: subscription.variantId,
      status: mapLemonSqueezyStatusToDb(subscription.status),
      trial_end: subscription.trialEndsAt,
      current_period_end: subscription.renewsAt,
    })
    .eq("user_id", userId)
    .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES]);
};

export const handleSubscriptionPaymentSuccess = async (subscription: { id: string; renewsAt: string | null }): Promise<void> => {
  const dbSubscription = await getSubscriptionByLemonSqueezyId(subscription.id);
  if (!dbSubscription) return;

  await supabase
    .from("subscriptions")
    .update({
      ai_interactions_used: 0,
      current_period_start: new Date().toISOString(),
      current_period_end: subscription.renewsAt,
      status: "active",
    })
    .eq("id", dbSubscription.id);
};

export const handleSubscriptionPaymentFailed = async (subscriptionId: string): Promise<void> => {
  const dbSubscription = await getSubscriptionByLemonSqueezyId(subscriptionId);
  if (!dbSubscription) return;

  await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
    })
    .eq("id", dbSubscription.id);
};

export const recordUsage = async (userId: string, _actionType: string, quantity = 1): Promise<boolean> => {
  const access = await checkUserAccess(userId);
  if (!access.has_access) return false;

  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return false;
  }

  const plan = await getPlanById(subscription.plan_id);
  if (plan?.ai_interactions_monthly !== null && subscription.ai_interactions_used + quantity > (plan?.ai_interactions_monthly || 0)) {
    // No more credits available - subscription limit exceeded
    return false;
  }

  await supabase
    .from("subscriptions")
    .update({
      ai_interactions_used: subscription.ai_interactions_used + quantity,
    })
    .eq("id", subscription.id);

  return true;
};

export const processMoneyBackRefund = async (subscriptionId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
  const subscription = await getSubscriptionByLemonSqueezyId(subscriptionId);

  if (!subscription) {
    return { success: false, message: "Subscription not found" };
  }

  if (!subscription.money_back_eligible_until || new Date(subscription.money_back_eligible_until) < new Date()) {
    return { success: false, message: "Money-back guarantee period has expired" };
  }

  try {
    await cancelSubscription(subscriptionId, reason, true);

    return {
      success: true,
      message: "Subscription cancelled. Refund will be processed by LemonSqueezy within 5-10 business days.",
    };
  } catch (error) {
    console.error("Refund error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to process refund",
    };
  }
};

export const ensureFreePlan = async (userId: string): Promise<UserSubscription | null> => {
  const existing = await getUserSubscription(userId);
  if (existing) return existing;

  const starterPlan = await getPlanBySlug("starter");
  if (!starterPlan) {
    console.error("Starter plan not found");
    return null;
  }

  return await createSubscriptionRecord({
    userId,
    planId: starterPlan.id,
    status: "active",
    interval: "monthly",
    trialDays: 0,
  });
};

export interface UpgradeSubscriptionParams {
  userId: string;
  newPlanSlug: PlanSlug;
  newInterval: "monthly" | "yearly";
}

export const upgradeSubscriptionPlan = async (params: UpgradeSubscriptionParams): Promise<{ subscription: UserSubscription; prorated: boolean }> => {
  initializeLemonSqueezy();

  const { userId, newPlanSlug, newInterval } = params;

  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    throw new Error("No subscription found for user");
  }

  if (!subscription.lemonsqueezy_subscription_id) {
    throw new Error("Subscription is not linked to LemonSqueezy");
  }

  const newPlan = await getPlanBySlug(newPlanSlug);
  if (!newPlan) {
    throw new Error(`Plan not found: ${newPlanSlug}`);
  }

  const getVariantIdFromConfig = (slug: PlanSlug, interval: "monthly" | "yearly") => {
    const variants = LEMONSQUEEZY_CONFIG.VARIANTS;
    if (slug === "starter") return interval === "monthly" ? variants.starter?.monthly : variants.starter?.yearly;
    if (slug === "pro") return interval === "monthly" ? variants.pro?.monthly : variants.pro?.yearly;
    if (slug === "executive") return interval === "monthly" ? variants.executive?.monthly : variants.executive?.yearly;
    return null;
  };

  const newVariantId =
    newInterval === "monthly"
      ? newPlan.lemonsqueezy_variant_id_monthly || getVariantIdFromConfig(newPlanSlug, "monthly")
      : newPlan.lemonsqueezy_variant_id_yearly || getVariantIdFromConfig(newPlanSlug, "yearly");

  if (!newVariantId) {
    throw new Error(`No LemonSqueezy variant configured for plan: ${newPlanSlug} (${newInterval})`);
  }

  // Call LemonSqueezy to update the subscription variant (this handles proration automatically)
  const { error: lsError } = await updateSubscription(subscription.lemonsqueezy_subscription_id, {
    variantId: parseInt(newVariantId, 10),
  });

  if (lsError) {
    throw new Error(`Failed to update subscription in LemonSqueezy: ${lsError.message}`);
  }

  // Update local subscription record with new plan
  const { data: updatedSubscription, error: dbError } = await supabase
    .from("subscriptions")
    .update({
      plan_id: newPlan.id,
      lemonsqueezy_variant_id: newVariantId,
      interval: newInterval,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subscription.id)
    .select()
    .single();

  if (dbError) {
    throw new Error(`Failed to update subscription in database: ${dbError.message}`);
  }

  return {
    subscription: updatedSubscription,
    prorated: true,
  };
};

export type TransactionStatus = "succeeded" | "pending" | "failed";
export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export interface PaymentMethodInfo {
  id: string;
  brand: CardBrand;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export interface TransactionInfo {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  invoiceUrl: string | null;
}

export interface BillingOverview {
  paymentMethod: PaymentMethodInfo | null;
  transactions: TransactionInfo[];
}

export const getBillingOverview = async (userId: string): Promise<BillingOverview> => {
  initializeLemonSqueezy();

  const subscription = await getUserSubscription(userId);

  if (!subscription || !subscription.lemonsqueezy_subscription_id) {
    return {
      paymentMethod: null,
      transactions: [],
    };
  }

  let transactions: TransactionInfo[] = [];

  try {
    const { data: invoicesData, error: invoicesError } = await listSubscriptionInvoices({
      filter: {
        subscriptionId: subscription.lemonsqueezy_subscription_id,
      },
    });

    if (!invoicesError && invoicesData?.data) {
      transactions = invoicesData.data.map((invoice) => {
        const attrs = invoice.attributes;
        const status: TransactionStatus = attrs.status === "paid" ? "succeeded" : attrs.status === "pending" ? "pending" : "failed";

        return {
          id: invoice.id,
          date: attrs.created_at,
          description: `${attrs.billing_reason === "initial" ? "Initial" : "Renewal"} - Subscription`,
          amount: attrs.total / 100,
          currency: attrs.currency.toUpperCase(),
          status,
          invoiceUrl: attrs.urls?.invoice_url || null,
        };
      });
    }
  } catch (error) {
    console.error("Failed to fetch subscription invoices:", error);
  }

  // LemonSqueezy doesn't expose card details - payment method is managed via customer portal
  // Return null for payment method, frontend will show "Manage via Portal" option
  return {
    paymentMethod: null,
    transactions,
  };
};

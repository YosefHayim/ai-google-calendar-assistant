import type { Request, Response } from "express";
import type Stripe from "stripe";
import { reqResAsyncHandler, sendR } from "@/utils/http";
import { STATUS_RESPONSE, env } from "@/config";
import { getStripeClient, isStripeEnabled, getStripePublishableKey, STRIPE_CONFIG } from "@/config/clients";
import {
  getActivePlans,
  getPlanBySlug,
  getUserSubscription,
  checkUserAccess,
  createCheckoutSession,
  createCreditPackCheckout,
  createBillingPortalSession,
  cancelSubscription,
  updateSubscriptionFromStripe,
  isWebhookEventProcessed,
  recordWebhookEvent,
  handleCheckoutCompleted,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
  processMoneyBackRefund,
  ensureFreePlan,
  type PlanSlug,
} from "@/services/subscription-service";

// ============================================================================
// Health & Config
// ============================================================================

/**
 * Check if Stripe is configured
 */
export const getStripeStatus = reqResAsyncHandler(async (_req: Request, res: Response) => {
  const enabled = isStripeEnabled();
  const publishableKey = getStripePublishableKey();

  sendR(res, STATUS_RESPONSE.SUCCESS, "Stripe status", {
    enabled,
    publishableKey: enabled ? publishableKey : undefined,
    trialDays: STRIPE_CONFIG.TRIAL_DAYS,
    moneyBackDays: STRIPE_CONFIG.MONEY_BACK_DAYS,
  });
});

// ============================================================================
// Plans
// ============================================================================

/**
 * Get all available plans
 */
export const getPlans = reqResAsyncHandler(async (_req: Request, res: Response) => {
  const plans = await getActivePlans();

  sendR(res, STATUS_RESPONSE.SUCCESS, "Plans retrieved", {
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      pricing: {
        monthly: plan.price_monthly_cents / 100,
        yearly: plan.price_yearly_cents / 100,
        perUse: plan.price_per_use_cents / 100,
      },
      limits: {
        aiInteractionsMonthly: plan.ai_interactions_monthly,
        actionPackSize: plan.action_pack_size,
      },
      features: plan.features,
      isPopular: plan.is_popular,
      isHighlighted: plan.is_highlighted,
    })),
  });
});

// ============================================================================
// Subscription Management
// ============================================================================

/**
 * Get current user's subscription status
 */
export const getSubscriptionStatus = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const access = await checkUserAccess(userId);
  const subscription = await getUserSubscription(userId);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Subscription status", {
    ...access,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          interval: subscription.interval,
          trialEnd: subscription.trial_end,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          moneyBackEligibleUntil: subscription.money_back_eligible_until,
        }
      : null,
  });
});

/**
 * Ensure user has free starter plan
 */
export const initializeFreePlan = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  const subscription = await ensureFreePlan(userId);

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Free plan initialized", { subscription });
});

// ============================================================================
// Checkout
// ============================================================================

/**
 * Create checkout session for subscription
 */
export const createSubscriptionCheckout = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!isStripeEnabled()) {
    return sendR(res, STATUS_RESPONSE.SERVICE_UNAVAILABLE, "Stripe is not configured");
  }

  const { planSlug, interval, successUrl, cancelUrl } = req.body;

  // Validate plan
  if (!planSlug || !["starter", "pro", "executive"].includes(planSlug)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid plan slug");
  }

  // Validate interval
  if (!interval || !["monthly", "yearly"].includes(interval)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid interval");
  }

  // Check if user already has an active subscription
  const existingSubscription = await getUserSubscription(userId);
  if (existingSubscription && ["trialing", "active"].includes(existingSubscription.status)) {
    return sendR(res, STATUS_RESPONSE.CONFLICT, "User already has an active subscription", {
      currentPlan: existingSubscription.plan_id,
      status: existingSubscription.status,
    });
  }

  try {
    const session = await createCheckoutSession({
      userId,
      userEmail,
      planSlug: planSlug as PlanSlug,
      interval,
      successUrl,
      cancelUrl,
    });

    sendR(res, STATUS_RESPONSE.SUCCESS, "Checkout session created", {
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to create checkout session"
    );
  }
});

/**
 * Create checkout session for credit pack
 */
export const createCreditPackCheckoutSession = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!isStripeEnabled()) {
    return sendR(res, STATUS_RESPONSE.SERVICE_UNAVAILABLE, "Stripe is not configured");
  }

  const { credits, planSlug, successUrl, cancelUrl } = req.body;

  // Validate credits
  if (!credits || typeof credits !== "number" || credits < 100 || credits > 10000) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Credits must be between 100 and 10000");
  }

  // Validate plan slug
  if (!planSlug || !["starter", "pro", "executive"].includes(planSlug)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid plan slug");
  }

  try {
    const session = await createCreditPackCheckout({
      userId,
      userEmail,
      credits,
      planSlug: planSlug as PlanSlug,
      successUrl,
      cancelUrl,
    });

    sendR(res, STATUS_RESPONSE.SUCCESS, "Credit pack checkout created", {
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Credit pack checkout error:", error);
    sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to create credit pack checkout"
    );
  }
});

// ============================================================================
// Billing Portal
// ============================================================================

/**
 * Create billing portal session
 */
export const createPortalSession = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!isStripeEnabled()) {
    return sendR(res, STATUS_RESPONSE.SERVICE_UNAVAILABLE, "Stripe is not configured");
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription?.stripe_customer_id) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "No billing information found");
  }

  const { returnUrl } = req.body;

  try {
    const session = await createBillingPortalSession(subscription.stripe_customer_id, returnUrl);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Portal session created", {
      portalUrl: session.url,
    });
  } catch (error) {
    console.error("Portal session error:", error);
    sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to create portal session"
    );
  }
});

// ============================================================================
// Subscription Actions
// ============================================================================

/**
 * Cancel subscription
 */
export const cancelUserSubscription = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!isStripeEnabled()) {
    return sendR(res, STATUS_RESPONSE.SERVICE_UNAVAILABLE, "Stripe is not configured");
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription?.stripe_subscription_id) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "No active subscription found");
  }

  const { reason, immediate } = req.body;

  try {
    const updatedSubscription = await cancelSubscription(
      subscription.stripe_subscription_id,
      reason,
      immediate === true
    );

    sendR(res, STATUS_RESPONSE.SUCCESS, "Subscription cancellation initiated", {
      cancelAtPeriodEnd: updatedSubscription?.cancel_at_period_end,
      currentPeriodEnd: updatedSubscription?.current_period_end,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to cancel subscription"
    );
  }
});

/**
 * Request money-back refund (within 30-day guarantee)
 */
export const requestRefund = reqResAsyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated");
  }

  if (!isStripeEnabled()) {
    return sendR(res, STATUS_RESPONSE.SERVICE_UNAVAILABLE, "Stripe is not configured");
  }

  const subscription = await getUserSubscription(userId);

  if (!subscription?.stripe_subscription_id) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "No active subscription found");
  }

  const { reason } = req.body;

  try {
    const result = await processMoneyBackRefund(subscription.stripe_subscription_id, reason);

    if (result.success) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, result.message);
    } else {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, result.message);
    }
  } catch (error) {
    console.error("Refund error:", error);
    sendR(
      res,
      STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "Failed to process refund"
    );
  }
});

// ============================================================================
// Webhook Handler
// ============================================================================

/**
 * Handle Stripe webhooks
 * NOTE: This endpoint should NOT use JSON body parser - needs raw body for signature verification
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!isStripeEnabled()) {
    res.status(503).json({ error: "Stripe is not configured" });
    return;
  }

  const stripe = getStripeClient();
  const sig = req.headers["stripe-signature"];
  const webhookSecret = env.stripe.webhookSecret;

  if (!sig) {
    res.status(400).json({ error: "No signature provided" });
    return;
  }

  if (!webhookSecret) {
    console.error("Stripe webhook secret not configured");
    res.status(500).json({ error: "Webhook secret not configured" });
    return;
  }

  let event: Stripe.Event;

  try {
    // req.body should be the raw buffer when using express.raw() middleware
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).json({ error: "Webhook signature verification failed" });
    return;
  }

  // Check idempotency
  const alreadyProcessed = await isWebhookEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log(`Webhook event ${event.id} already processed`);
    res.status(200).json({ received: true, duplicate: true });
    return;
  }

  // Record event
  await recordWebhookEvent(event.id, event.type, event.data.object as object);

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await updateSubscriptionFromStripe(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    await recordWebhookEvent(event.id, event.type, event.data.object as object, true);

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${event.type}:`, error);
    await recordWebhookEvent(
      event.id,
      event.type,
      event.data.object as object,
      false,
      error instanceof Error ? error.message : "Unknown error"
    );
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

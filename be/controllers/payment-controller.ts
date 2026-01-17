import crypto from "node:crypto";
import type { Request, Response } from "express";
import { env, STATUS_RESPONSE } from "@/config";
import {
  isLemonSqueezyEnabled,
  LEMONSQUEEZY_CONFIG,
} from "@/config/clients/lemonsqueezy";
import {
  cancelSubscription,
  checkUserAccess,
  createCheckoutSession,
  getBillingOverview,
  getCustomerPortalUrl,
  getLemonSqueezyProducts,
  getLemonSqueezyProductsWithVariants,
  getPlansFromLemonSqueezy,
  getUserSubscription,
  handleSubscriptionPaymentSuccess,
  isWebhookEventProcessed,
  type PlanSlug,
  recordWebhookEvent,
  upgradeSubscriptionPlan,
} from "@/services/lemonsqueezy-service";
import { requireUser } from "@/utils/auth";
import { reqResAsyncHandler, sendR } from "@/utils/http";

export const getPaymentStatus = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const enabled = isLemonSqueezyEnabled();

    return sendR(res, STATUS_RESPONSE.SUCCESS, "Payment status", {
      enabled,
      provider: "lemonsqueezy",
      trialDays: LEMONSQUEEZY_CONFIG.TRIAL_DAYS,
      moneyBackDays: LEMONSQUEEZY_CONFIG.MONEY_BACK_DAYS,
    });
  }
);

export const getPlans = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    const plans = await getPlansFromLemonSqueezy();

    sendR(res, STATUS_RESPONSE.SUCCESS, "Plans retrieved", {
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        pricing: plan.pricing,
        limits: plan.limits,
        features: plan.features,
        isPopular: plan.isPopular,
        isHighlighted: plan.isHighlighted,
        variantIdMonthly: plan.variantIdMonthly,
        variantIdYearly: plan.variantIdYearly,
        buyNowUrlMonthly: plan.buyNowUrlMonthly,
        buyNowUrlYearly: plan.buyNowUrlYearly,
        hasFreeTrial: plan.hasFreeTrial,
        trialDays: plan.trialDays,
      })),
    });
  }
);

export const getSubscriptionStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId, userEmail } = userResult;

    const access = await checkUserAccess(userId, userEmail);
    const subscription = await getUserSubscription(userEmail);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Subscription status", {
      ...access,
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            interval: subscription.variantName?.toLowerCase().includes("yearly")
              ? "yearly"
              : "monthly",
            trialEnd: subscription.trialEndsAt,
            currentPeriodEnd: subscription.renewsAt,
            cancelAtPeriodEnd: subscription.cancelledAt !== null,
            isLinkedToProvider: true,
          }
        : null,
    });
  }
);

export const initializeFreePlan = reqResAsyncHandler(
  async (_req: Request, res: Response) =>
    sendR(res, STATUS_RESPONSE.SUCCESS, "Free plan initialized", {
      subscription: null,
      message: "Free tier access is automatic. Subscribe for more features.",
    })
);

export const createSubscriptionCheckout = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userId, userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    const { planSlug, interval, successUrl, cancelUrl } = req.body;

    if (!(planSlug && ["starter", "pro", "executive"].includes(planSlug))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid plan slug");
    }

    if (!(interval && ["monthly", "yearly"].includes(interval))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid interval");
    }

    const existingSubscription = await getUserSubscription(userEmail);
    if (
      existingSubscription &&
      ["on_trial", "active"].includes(existingSubscription.status)
    ) {
      return sendR(
        res,
        STATUS_RESPONSE.CONFLICT,
        "User already has an active subscription",
        {
          currentPlan: existingSubscription.productName,
          status: existingSubscription.status,
        }
      );
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
        error instanceof Error
          ? error.message
          : "Failed to create checkout session"
      );
    }
  }
);

export const createCreditPackCheckoutSession = reqResAsyncHandler(
  async (_req: Request, res: Response) =>
    sendR(
      res,
      STATUS_RESPONSE.BAD_REQUEST,
      "Credit pack purchases are not yet available"
    )
);

export const createPortalSession = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    const subscription = await getUserSubscription(userEmail);

    if (!subscription?.customerId) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "No billing information found"
      );
    }

    try {
      const portalUrl = await getCustomerPortalUrl(subscription.customerId);

      sendR(res, STATUS_RESPONSE.SUCCESS, "Portal URL retrieved", {
        portalUrl,
      });
    } catch (error) {
      console.error("Portal session error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Failed to get portal URL"
      );
    }
  }
);

export const cancelUserSubscription = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    const subscription = await getUserSubscription(userEmail);

    if (!subscription?.id) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "No active subscription found"
      );
    }

    const { reason, immediate } = req.body;

    try {
      const updatedSubscription = await cancelSubscription(
        subscription.id,
        reason,
        immediate === true
      );

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Subscription cancellation initiated",
        {
          cancelAtPeriodEnd: updatedSubscription?.cancelledAt !== null,
          currentPeriodEnd: updatedSubscription?.renewsAt,
        }
      );
    } catch (error) {
      console.error("Cancel subscription error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    }
  }
);

export const requestRefund = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    const subscription = await getUserSubscription(userEmail);

    if (!subscription?.id) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "No active subscription found"
      );
    }

    const portalUrl = subscription.urls.customerPortal;
    if (!portalUrl) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Customer portal not available. Please contact support for refunds."
      );
    }

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Please use the customer portal to request a refund",
      {
        portalUrl,
        message: "Refunds are processed through LemonSqueezy customer portal",
      }
    );
  }
);

export const upgradeSubscription = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    const { planSlug, interval } = req.body;

    if (!(planSlug && ["starter", "pro", "executive"].includes(planSlug))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid plan slug");
    }

    if (!(interval && ["monthly", "yearly"].includes(interval))) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Invalid interval");
    }

    const existingSubscription = await getUserSubscription(userEmail);
    if (!existingSubscription) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "No subscription found. Please create a subscription first."
      );
    }

    try {
      const result = await upgradeSubscriptionPlan({
        email: userEmail,
        newPlanSlug: planSlug as PlanSlug,
        newInterval: interval,
      });

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Subscription upgraded successfully",
        {
          subscription: {
            id: result.subscription.id,
            status: result.subscription.status,
            variant: result.subscription.variantName,
            product: result.subscription.productName,
          },
          prorated: result.prorated,
        }
      );
    } catch (error) {
      console.error("Upgrade subscription error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to upgrade subscription"
      );
    }
  }
);

function verifyWebhookSignature(
  rawBody: Buffer,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  if (!isLemonSqueezyEnabled()) {
    res
      .status(STATUS_RESPONSE.SERVICE_UNAVAILABLE)
      .json({ error: "Payment provider is not configured" });
    return;
  }

  const signature = req.headers["x-signature"] as string;
  const webhookSecret = env.lemonSqueezy.webhookSecret;

  if (!signature) {
    res
      .status(STATUS_RESPONSE.BAD_REQUEST)
      .json({ error: "No signature provided" });
    return;
  }

  if (!webhookSecret) {
    console.error("LemonSqueezy webhook secret not configured");
    res
      .status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR)
      .json({ error: "Webhook secret not configured" });
    return;
  }

  const rawBody = req.body as Buffer;

  if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
    console.error("Webhook signature verification failed");
    res
      .status(STATUS_RESPONSE.BAD_REQUEST)
      .json({ error: "Webhook signature verification failed" });
    return;
  }

  let event: {
    meta: {
      event_name: string;
      custom_data?: Record<string, string>;
    };
    data: {
      id: string;
      attributes: Record<string, unknown>;
    };
  };

  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    console.error("Failed to parse webhook payload:", err);
    res
      .status(STATUS_RESPONSE.BAD_REQUEST)
      .json({ error: "Invalid JSON payload" });
    return;
  }

  const eventId = `${event.meta.event_name}_${event.data.id}_${Date.now()}`;
  const eventName = event.meta.event_name;

  const alreadyProcessed = await isWebhookEventProcessed(eventId);
  if (alreadyProcessed) {
    console.log(`Webhook event ${eventId} already processed`);
    res
      .status(STATUS_RESPONSE.SUCCESS)
      .json({ received: true, duplicate: true });
    return;
  }

  await recordWebhookEvent({ eventId, eventType: eventName, payload: event });

  try {
    const attrs = event.data.attributes as Record<string, unknown>;

    switch (eventName) {
      case "subscription_payment_success": {
        const userEmail = String(attrs.user_email || "");
        if (userEmail) {
          await handleSubscriptionPaymentSuccess(userEmail);
        }
        break;
      }

      case "order_created":
      case "subscription_created":
      case "subscription_updated":
      case "subscription_cancelled":
      case "subscription_resumed":
      case "subscription_expired":
      case "subscription_paused":
      case "subscription_unpaused":
      case "subscription_payment_failed":
      case "subscription_payment_recovered":
      case "affiliate_created":
        console.log(
          `Webhook event logged: ${eventName} for subscription ${event.data.id}`
        );
        break;

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    await recordWebhookEvent({
      eventId,
      eventType: eventName,
      payload: event,
      processed: true,
    });

    res.status(STATUS_RESPONSE.SUCCESS).json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook ${eventName}:`, error);
    await recordWebhookEvent({
      eventId,
      eventType: eventName,
      payload: event,
      processed: false,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    res
      .status(STATUS_RESPONSE.INTERNAL_SERVER_ERROR)
      .json({ error: "Webhook processing failed" });
  }
};

export const getBillingInfo = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const userResult = requireUser(req, res);
    if (!userResult.success) {
      return;
    }
    const { userEmail } = userResult;

    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    try {
      const billingOverview = await getBillingOverview(userEmail);

      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Billing overview retrieved",
        billingOverview
      );
    } catch (error) {
      console.error("Billing overview error:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error
          ? error.message
          : "Failed to get billing overview"
      );
    }
  }
);

export const getLemonSqueezyProductsEndpoint = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    try {
      const products = await getLemonSqueezyProducts();

      sendR(res, STATUS_RESPONSE.SUCCESS, "Products retrieved", {
        products: products.map((product) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          priceFormatted: product.priceFormatted,
          buyNowUrl: product.buyNowUrl,
          status: product.status,
          testMode: product.testMode,
        })),
      });
    } catch (error) {
      console.error("Error fetching LemonSqueezy products:", error);
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    }
  }
);

export const getLemonSqueezyProductsWithVariantsEndpoint = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    if (!isLemonSqueezyEnabled()) {
      return sendR(
        res,
        STATUS_RESPONSE.SERVICE_UNAVAILABLE,
        "Payment provider is not configured"
      );
    }

    try {
      const productsWithVariants = await getLemonSqueezyProductsWithVariants();

      const formattedProducts = productsWithVariants.map(
        ({ product, variants }) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          priceFormatted: product.priceFormatted,
          buyNowUrl: product.buyNowUrl,
          status: product.status,
          testMode: product.testMode,
          variants: variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            slug: variant.slug,
            description: variant.description,
            price: variant.price,
            priceFormatted: variant.priceFormatted,
            isSubscription: variant.isSubscription,
            interval: variant.interval,
            intervalCount: variant.intervalCount,
            hasFreeTrial: variant.hasFreeTrial,
            trialInterval: variant.trialInterval,
            trialIntervalCount: variant.trialIntervalCount,
            status: variant.status,
          })),
        })
      );

      sendR(res, STATUS_RESPONSE.SUCCESS, "Products with variants retrieved", {
        products: formattedProducts,
      });
    } catch (error) {
      console.error(
        "Error fetching LemonSqueezy products with variants:",
        error
      );
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : "Failed to fetch products"
      );
    }
  }
);

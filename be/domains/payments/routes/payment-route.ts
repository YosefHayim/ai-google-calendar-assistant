import express from "express"
import {
  cancelUserSubscription,
  createCreditPackCheckoutSession,
  createPortalSession,
  createSubscriptionCheckout,
  getBillingInfo,
  getLemonSqueezyProductsEndpoint,
  getLemonSqueezyProductsWithVariantsEndpoint,
  getPaymentStatus,
  getPlans,
  getSubscriptionStatus,
  handleWebhook,
  initializeFreePlan,
  requestRefund,
  upgradeSubscription,
} from "@/domains/payments/controllers/payment-controller"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"

const router = express.Router()

// GET /status - Get payment system status and configuration
router.get("/status", getPaymentStatus)

/**
 * GET /plans - Retrieve Available Subscription Plans
 *
 * Fetches all available subscription plans and pricing tiers offered by the service.
 * Includes plan features, pricing, and billing intervals for user selection.
 *
 * @returns {Object} Available subscription plans
 * @property {Array} plans - List of subscription plans
 * @property {string} plans[].id - Unique plan identifier
 * @property {string} plans[].name - Human-readable plan name
 * @property {string} plans[].description - Plan description and features
 * @property {Object} plans[].pricing - Pricing information
 * @property {number} plans[].pricing.monthly - Monthly price in cents
 * @property {number} plans[].pricing.yearly - Yearly price in cents
 * @property {Array} plans[].features - List of plan features/benefits
 * @property {boolean} plans[].popular - Whether this plan is recommended
 * @property {Object} metadata - Additional plan metadata
 *
 * @related Subscription management flow. Provides the data needed for pricing pages,
 * plan comparison, and subscription upgrade/downgrade decisions.
 */
router.get("/plans", getPlans)

// GET /products - Get Lemon Squeezy products
router.get("/products", getLemonSqueezyProductsEndpoint)

// GET /products/variants - Get Lemon Squeezy products with variants
router.get("/products/variants", getLemonSqueezyProductsWithVariantsEndpoint)

// POST /webhook - Handle Lemon Squeezy webhooks
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) =>
  handleWebhook(req, res)
)

/**
 * GET /subscription - Retrieve User Subscription Status
 *
 * Fetches the current subscription status and details for the authenticated user,
 * including plan information, billing status, and usage limits.
 *
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} User subscription information
 * @property {string} status - Subscription status ('active', 'past_due', 'cancelled', 'trialing')
 * @property {Object} plan - Current subscription plan details
 * @property {string} plan.id - Plan identifier
 * @property {string} plan.name - Plan name
 * @property {Array} plan.features - Plan feature list
 * @property {Object} billing - Billing information
 * @property {Date} billing.current_period_start - Current billing period start
 * @property {Date} billing.current_period_end - Current billing period end
 * @property {number} billing.amount_due - Amount due in cents
 * @property {Object} usage - Current usage against plan limits
 * @property {number} usage.ai_requests - AI requests used this period
 * @property {number} usage.ai_requests_limit - AI requests limit for plan
 *
 * @related Subscription management and feature gating. Used to display billing
 * information, enforce usage limits, and determine feature availability.
 */
router.get("/subscription", supabaseAuth(), getSubscriptionStatus)

// POST /initialize-free - Initialize free plan for user
router.post("/initialize-free", supabaseAuth(), initializeFreePlan)

/**
 * POST /checkout - Create Subscription Checkout Session
 *
 * Initiates a subscription purchase flow by creating a secure checkout session
 * with the payment processor. Redirects users to complete payment.
 *
 * @param {Object} req.body - Checkout session parameters
 * @param {string} req.body.plan_id - ID of the subscription plan to purchase
 * @param {string} req.body.billing_interval - Billing frequency ('monthly', 'yearly')
 * @param {string} req.body.success_url - URL to redirect on successful payment
 * @param {string} req.body.cancel_url - URL to redirect if payment is cancelled
 * @param {Object} req.body.metadata - Optional metadata to attach to the subscription
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Checkout session information
 * @property {string} checkout_url - URL to redirect user for payment completion
 * @property {string} session_id - Unique checkout session identifier
 * @property {Object} plan_details - Selected plan information
 * @property {Object} pricing - Pricing breakdown for the selected plan
 * @property {number} pricing.subtotal - Pre-tax amount in cents
 * @property {number} pricing.tax - Tax amount in cents
 * @property {number} pricing.total - Total amount due in cents
 *
 * @related Subscription purchase flow. Creates secure payment sessions that handle
 * the complete subscription lifecycle from initial signup to recurring billing.
 */
router.post("/checkout", supabaseAuth(), createSubscriptionCheckout)

// POST /checkout/credits - Create credit pack checkout session
router.post(
  "/checkout/credits",
  supabaseAuth(),
  createCreditPackCheckoutSession
)

// POST /upgrade - Upgrade user subscription
router.post("/upgrade", supabaseAuth(), upgradeSubscription)

// POST /portal - Create customer portal session
router.post("/portal", supabaseAuth(), createPortalSession)

// POST /cancel - Cancel user subscription
router.post("/cancel", supabaseAuth(), cancelUserSubscription)

// POST /refund - Request refund for subscription
router.post("/refund", supabaseAuth(), requestRefund)

// GET /billing - Get user billing information
router.get("/billing", supabaseAuth(), getBillingInfo)

export default router

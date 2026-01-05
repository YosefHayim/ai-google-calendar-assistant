import express from "express";
import {
  getStripeStatus,
  getPlans,
  getSubscriptionStatus,
  initializeFreePlan,
  createSubscriptionCheckout,
  createCreditPackCheckoutSession,
  createPortalSession,
  cancelUserSubscription,
  requestRefund,
  handleWebhook,
} from "@/controllers/payment-controller";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// ============================================================================
// Public Routes (no auth required)
// ============================================================================

/**
 * GET /api/payments/status
 * Check if Stripe is configured and get publishable key
 */
router.get("/status", getStripeStatus);

/**
 * GET /api/payments/plans
 * Get all available subscription plans
 */
router.get("/plans", getPlans);

/**
 * POST /api/payments/webhook
 * Handle Stripe webhook events
 * NOTE: This route needs raw body, not JSON parsed
 */
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => handleWebhook(req, res));

// ============================================================================
// Protected Routes (auth required)
// ============================================================================

/**
 * GET /api/payments/subscription
 * Get current user's subscription status
 */
router.get("/subscription", supabaseAuth(), getSubscriptionStatus);

/**
 * POST /api/payments/initialize-free
 * Initialize free starter plan for user
 */
router.post("/initialize-free", supabaseAuth(), initializeFreePlan);

/**
 * POST /api/payments/checkout
 * Create Stripe checkout session for subscription
 * Body: { planSlug: 'starter' | 'pro' | 'executive', interval: 'monthly' | 'yearly', successUrl?, cancelUrl? }
 */
router.post("/checkout", supabaseAuth(), createSubscriptionCheckout);

/**
 * POST /api/payments/checkout/credits
 * Create Stripe checkout session for credit pack
 * Body: { credits: number, planSlug: string, successUrl?, cancelUrl? }
 */
router.post("/checkout/credits", supabaseAuth(), createCreditPackCheckoutSession);

/**
 * POST /api/payments/portal
 * Create Stripe billing portal session
 * Body: { returnUrl?: string }
 */
router.post("/portal", supabaseAuth(), createPortalSession);

/**
 * POST /api/payments/cancel
 * Cancel subscription
 * Body: { reason?: string, immediate?: boolean }
 */
router.post("/cancel", supabaseAuth(), cancelUserSubscription);

/**
 * POST /api/payments/refund
 * Request money-back refund (within 30-day guarantee)
 * Body: { reason?: string }
 */
router.post("/refund", supabaseAuth(), requestRefund);

export default router;

import express from "express";
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
} from "@/domains/payments/controllers/payment-controller";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";

const router = express.Router();

// GET /status - Get payment system status and configuration
router.get("/status", getPaymentStatus);

// GET /plans - Get available subscription plans
router.get("/plans", getPlans);

// GET /products - Get Lemon Squeezy products
router.get("/products", getLemonSqueezyProductsEndpoint);

// GET /products/variants - Get Lemon Squeezy products with variants
router.get("/products/variants", getLemonSqueezyProductsWithVariantsEndpoint);

// POST /webhook - Handle Lemon Squeezy webhooks
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) =>
  handleWebhook(req, res)
);

// GET /subscription - Get user subscription status
router.get("/subscription", supabaseAuth(), getSubscriptionStatus);

// POST /initialize-free - Initialize free plan for user
router.post("/initialize-free", supabaseAuth(), initializeFreePlan);

// POST /checkout - Create subscription checkout session
router.post("/checkout", supabaseAuth(), createSubscriptionCheckout);

// POST /checkout/credits - Create credit pack checkout session
router.post(
  "/checkout/credits",
  supabaseAuth(),
  createCreditPackCheckoutSession
);

// POST /upgrade - Upgrade user subscription
router.post("/upgrade", supabaseAuth(), upgradeSubscription);

// POST /portal - Create customer portal session
router.post("/portal", supabaseAuth(), createPortalSession);

// POST /cancel - Cancel user subscription
router.post("/cancel", supabaseAuth(), cancelUserSubscription);

// POST /refund - Request refund for subscription
router.post("/refund", supabaseAuth(), requestRefund);

// GET /billing - Get user billing information
router.get("/billing", supabaseAuth(), getBillingInfo);

export default router;

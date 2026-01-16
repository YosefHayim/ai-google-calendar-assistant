import express from "express"
import {
  getPaymentStatus,
  getPlans,
  getSubscriptionStatus,
  initializeFreePlan,
  createSubscriptionCheckout,
  createCreditPackCheckoutSession,
  createPortalSession,
  cancelUserSubscription,
  requestRefund,
  upgradeSubscription,
  handleWebhook,
  getBillingInfo,
  getLemonSqueezyProductsEndpoint,
  getLemonSqueezyProductsWithVariantsEndpoint,
} from "@/controllers/payment-controller"
import { supabaseAuth } from "@/middlewares/supabase-auth"

const router = express.Router()

router.get("/status", getPaymentStatus)

router.get("/plans", getPlans)

router.get("/products", getLemonSqueezyProductsEndpoint)

router.get("/products/variants", getLemonSqueezyProductsWithVariantsEndpoint)

router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => handleWebhook(req, res))

router.get("/subscription", supabaseAuth(), getSubscriptionStatus)

router.post("/initialize-free", supabaseAuth(), initializeFreePlan)

router.post("/checkout", supabaseAuth(), createSubscriptionCheckout)

router.post("/checkout/credits", supabaseAuth(), createCreditPackCheckoutSession)

router.post("/upgrade", supabaseAuth(), upgradeSubscription)

router.post("/portal", supabaseAuth(), createPortalSession)

router.post("/cancel", supabaseAuth(), cancelUserSubscription)

router.post("/refund", supabaseAuth(), requestRefund)

router.get("/billing", supabaseAuth(), getBillingInfo)

export default router

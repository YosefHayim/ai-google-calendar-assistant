/**
 * WhatsApp Routes
 * Handles WhatsApp Cloud API webhooks and integration endpoints
 */

import express from "express"
import { whatsAppController } from "@/controllers/whatsapp-controller"
import { webhookSignatureMiddleware } from "@/whatsapp-bot/services/webhook-security"
import { supabaseAuth } from "@/middlewares/supabase-auth"

const router = express.Router()

// ============================================================================
// Public Webhook Endpoints (No auth - called by Meta)
// ============================================================================

/**
 * GET /api/whatsapp
 * Webhook verification endpoint - Meta calls this to verify your webhook URL
 * Must respond with the challenge token
 */
router.get("/", whatsAppController.verifyWebhook)

/**
 * POST /api/whatsapp
 * Webhook events endpoint - Meta sends message events here
 * Uses raw body parser for signature verification
 *
 * IMPORTANT: This endpoint uses express.raw() to get the raw body for
 * signature verification. The webhookSignatureMiddleware parses the JSON
 * after verification.
 */
router.post(
  "/",
  express.raw({ type: "application/json" }),
  webhookSignatureMiddleware,
  whatsAppController.handleWebhook
)

// ============================================================================
// Meta Callback Endpoints (No auth - called by Meta)
// ============================================================================

/**
 * POST /api/whatsapp/data-deletion
 * Data Deletion Callback - Meta calls this when users request data deletion
 * Uses URL-encoded form data (application/x-www-form-urlencoded)
 */
router.post(
  "/data-deletion",
  express.urlencoded({ extended: false }),
  whatsAppController.handleDataDeletion
)

// ============================================================================
// Protected Admin Endpoints
// ============================================================================

/**
 * GET /api/whatsapp/status
 * Returns integration configuration status (for admin dashboard)
 */
router.get("/status", supabaseAuth(), whatsAppController.getStatus)

export default router

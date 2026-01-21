/**
 * WhatsApp Webhook Security Service
 * Handles signature verification for incoming webhooks from Meta
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-security
 */

import type { NextFunction, Request, Response } from "express"

import crypto from "node:crypto"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"

const SIGNATURE_HEADER = "x-hub-signature-256"
const SIGNATURE_PREFIX = "sha256="

/**
 * Verifies the webhook signature from Meta
 * Uses HMAC SHA-256 with the app secret
 */
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  appSecret: string
): boolean => {
  if (!signature?.startsWith(SIGNATURE_PREFIX)) {
    return false
  }

  const expectedSignature = signature.slice(SIGNATURE_PREFIX.length)
  const payloadString =
    typeof payload === "string" ? payload : payload.toString("utf8")

  const hmac = crypto.createHmac("sha256", appSecret)
  hmac.update(payloadString)
  const calculatedSignature = hmac.digest("hex")

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(calculatedSignature, "hex")
    )
  } catch {
    return false
  }
}

/**
 * Express middleware for webhook signature verification
 * IMPORTANT: This must be used BEFORE express.json() middleware for the webhook route
 */
export const webhookSignatureMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appSecret = env.integrations.whatsapp.appSecret

  // Skip verification if app secret is not configured (development mode)
  if (!appSecret) {
    logger.warn(
      "WhatsApp: App secret not configured, skipping signature verification"
    )
    next()
    return
  }

  const signature = req.headers[SIGNATURE_HEADER]

  if (!signature || typeof signature !== "string") {
    logger.warn("WhatsApp: Missing webhook signature header")
    res.status(401).json({ error: "Missing signature" })
    return
  }

  // Get raw body - requires express.raw() middleware
  const rawBody = req.body

  if (!(rawBody && rawBody instanceof Buffer)) {
    logger.error("WhatsApp: Raw body not available for signature verification")
    res.status(400).json({ error: "Invalid request body" })
    return
  }

  const isValid = verifyWebhookSignature(rawBody, signature, appSecret)

  if (!isValid) {
    logger.warn("WhatsApp: Invalid webhook signature")
    res.status(401).json({ error: "Invalid signature" })
    return
  }

  // Parse the raw body to JSON and attach to request
  try {
    req.body = JSON.parse(rawBody.toString("utf8"))
    next()
  } catch (error) {
    logger.error(`WhatsApp: Failed to parse webhook body: ${error}`)
    res.status(400).json({ error: "Invalid JSON" })
  }
}

/**
 * Verifies the webhook subscription challenge from Meta
 */
export const verifyWebhookSubscription = (
  mode: string | undefined,
  token: string | undefined,
  challenge: string | undefined
): { success: boolean; challenge?: string } => {
  const verifyToken = env.integrations.whatsapp.verifyToken

  if (!verifyToken) {
    logger.error("WhatsApp: Verify token not configured")
    return { success: false }
  }

  if (mode === "subscribe" && token === verifyToken) {
    logger.info("WhatsApp: Webhook subscription verified successfully")
    return { success: true, challenge }
  }

  logger.warn(
    `WhatsApp: Webhook verification failed - mode: ${mode}, token match: ${token === verifyToken}`
  )
  return { success: false }
}

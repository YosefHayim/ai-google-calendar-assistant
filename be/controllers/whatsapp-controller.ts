/**
 * WhatsApp Controller
 * Handles incoming WhatsApp Cloud API webhooks
 */

import type { Request, Response } from "express"
import { STATUS_RESPONSE, env } from "@/config"
import { logger } from "@/utils/logger"
import { Resend } from "resend"
import { verifyWebhookSubscription } from "@/whatsapp-bot/services/webhook-security"
import { handleIncomingMessage } from "@/whatsapp-bot/handlers/message-handler"
import { isWhatsAppConfigured, getWhatsAppStatus } from "@/whatsapp-bot/init-whatsapp"
import {
  parseSignedRequest,
  deleteWhatsAppUserData,
  buildConfirmationUrl,
  buildErrorUrl,
  formatMetaResponse,
} from "@/whatsapp-bot/services/data-deletion"
import type {
  WhatsAppWebhookPayload,
  WhatsAppIncomingMessage,
  WhatsAppContact,
  WhatsAppMessageStatus,
} from "@/whatsapp-bot/types"

/**
 * GET /api/whatsapp
 * Handles webhook verification from Meta
 */
const verifyWebhook = (req: Request, res: Response): void => {
  const mode = req.query["hub.mode"] as string | undefined
  const token = req.query["hub.verify_token"] as string | undefined
  const challenge = req.query["hub.challenge"] as string | undefined

  const result = verifyWebhookSubscription(mode, token, challenge)

  if (result.success && result.challenge) {
    logger.info("WhatsApp: Webhook verification successful")
    res.status(STATUS_RESPONSE.SUCCESS).send(result.challenge)
  } else {
    logger.warn("WhatsApp: Webhook verification failed")
    res.status(STATUS_RESPONSE.FORBIDDEN).send("Verification failed")
  }
}

/**
 * POST /api/whatsapp
 * Handles incoming webhook events from WhatsApp
 */
const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  // Always respond quickly to avoid webhook timeouts
  res.status(STATUS_RESPONSE.SUCCESS).send("EVENT_RECEIVED")

  if (!isWhatsAppConfigured()) {
    logger.warn("WhatsApp: Received webhook but integration not configured")
    return
  }

  try {
    const payload = req.body as WhatsAppWebhookPayload

    // Validate payload structure
    if (payload.object !== "whatsapp_business_account") {
      logger.warn(`WhatsApp: Unexpected webhook object type: ${payload.object}`)
      return
    }

    // Process each entry
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") {
          continue
        }

        const value = change.value

        // Handle message status updates (sent, delivered, read)
        if (value.statuses) {
          for (const status of value.statuses) {
            handleMessageStatus(status)
          }
        }

        // Handle incoming messages
        if (value.messages) {
          const contacts = value.contacts || []

          for (const message of value.messages) {
            const contact = contacts.find((c) => c.wa_id === message.from)
            await processMessage(message, contact)
          }
        }

        // Handle errors from the API
        if (value.errors) {
          for (const error of value.errors) {
            logger.error(
              `WhatsApp: API Error - Code: ${error.code}, Title: ${error.title}, Message: ${error.message || "N/A"}`
            )
          }
        }
      }
    }
  } catch (error) {
    logger.error(`WhatsApp: Error processing webhook: ${error}`)
  }
}

/**
 * Processes a single incoming message
 */
const processMessage = async (
  message: WhatsAppIncomingMessage,
  contact?: WhatsAppContact
): Promise<void> => {
  const messagePreview =
    message.type === "text"
      ? message.text?.body?.slice(0, 50)
      : `[${message.type}]`

  logger.info(
    `WhatsApp: Incoming ${message.type} from ${message.from}: ${messagePreview}`
  )

  try {
    await handleIncomingMessage(message, contact)
  } catch (error) {
    logger.error(
      `WhatsApp: Error handling message ${message.id} from ${message.from}: ${error}`
    )
  }
}

/**
 * Handles message status updates
 */
const handleMessageStatus = (status: WhatsAppMessageStatus): void => {
  // Log status updates at debug level to avoid noise
  logger.debug(
    `WhatsApp: Message ${status.id} to ${status.recipient_id}: ${status.status}`
  )

  // Handle failed messages
  if (status.status === "failed" && status.errors) {
    for (const error of status.errors) {
      logger.error(
        `WhatsApp: Message failed - Code: ${error.code}, Title: ${error.title}`
      )
    }
  }
}

/**
 * GET /api/whatsapp/status
 * Returns WhatsApp integration status (for admin/debugging)
 */
const getStatus = (_req: Request, res: Response): void => {
  const status = getWhatsAppStatus()
  res.status(STATUS_RESPONSE.SUCCESS).json(status)
}

/**
 * POST /api/whatsapp/data-deletion
 * Meta Data Deletion Callback - handles user data deletion requests
 * @see https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
const handleDataDeletion = async (
  req: Request,
  res: Response
): Promise<void> => {
  const signedRequest = req.body?.signed_request as string | undefined

  if (!signedRequest) {
    logger.warn("WhatsApp: Data deletion request missing signed_request")
    res.status(STATUS_RESPONSE.BAD_REQUEST).json({
      error: "Missing signed_request parameter",
    })
    return
  }

  const payload = parseSignedRequest(signedRequest)

  if (!payload) {
    logger.warn("WhatsApp: Invalid signed_request in data deletion")
    res.status(STATUS_RESPONSE.FORBIDDEN).json({
      error: "Invalid signed_request",
    })
    return
  }

  try {
    const { confirmationCode } = await deleteWhatsAppUserData(payload.user_id)
    const confirmationUrl = buildConfirmationUrl(confirmationCode, "success")

    logger.info(
      `WhatsApp: Data deletion completed for Meta user ${payload.user_id}, code: ${confirmationCode}`
    )

    res
      .status(STATUS_RESPONSE.SUCCESS)
      .type("json")
      .send(formatMetaResponse(confirmationUrl, confirmationCode))
  } catch (error) {
    logger.error(`WhatsApp: Data deletion failed: ${error}`)

    const errorUrl = buildErrorUrl("Data deletion failed. Please contact support.")
    const errorCode = `ERR-${Date.now().toString(36)}`

    res
      .status(STATUS_RESPONSE.SUCCESS)
      .type("json")
      .send(formatMetaResponse(errorUrl, errorCode))
  }
}

export const whatsAppController = {
  verifyWebhook,
  handleWebhook,
  getStatus,
  handleDataDeletion,
}

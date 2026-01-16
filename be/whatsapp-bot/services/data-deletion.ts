/**
 * WhatsApp Data Deletion Service
 * Handles Meta's Data Deletion Callback for GDPR/privacy compliance
 * @see https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */

import crypto from "crypto"
import { env } from "@/config"
import { SUPABASE } from "@/config/clients/supabase"
import { logger } from "@/utils/logger"
import { unifiedContextStore } from "@/shared/context"

const getAppSecret = (): string | undefined => env.integrations.whatsapp.appSecret

interface MetaSignedRequestPayload {
  user_id: string
  algorithm: string
  issued_at: number
}

export interface DataDeletionResponse {
  url: string
  confirmation_code: string
}

interface DeletionResult {
  whatsappUser: boolean
  conversationHistory: boolean
  redisContext: boolean
  timestamp: string
}

/**
 * Parses and verifies Meta's signed_request (base64url: signature.payload)
 * @see https://developers.facebook.com/docs/games/gamesonfacebook/login#parsingsr
 */
export const parseSignedRequest = (
  signedRequest: string
): MetaSignedRequestPayload | null => {
  const appSecret = getAppSecret()

  if (!appSecret) {
    logger.error("WhatsApp: App secret not configured for data deletion")
    return null
  }

  try {
    const [encodedSig, encodedPayload] = signedRequest.split(".")

    if (!encodedSig || !encodedPayload) {
      logger.warn("WhatsApp: Invalid signed_request format")
      return null
    }

    const signature = base64UrlDecode(encodedSig)
    const payloadBuffer = base64UrlDecode(encodedPayload)
    const payload = JSON.parse(
      payloadBuffer.toString("utf8")
    ) as MetaSignedRequestPayload

    if (payload.algorithm?.toUpperCase() !== "HMAC-SHA256") {
      logger.warn(`WhatsApp: Unsupported algorithm: ${payload.algorithm}`)
      return null
    }

    const expectedSig = crypto
      .createHmac("sha256", appSecret)
      .update(encodedPayload)
      .digest()

    if (!crypto.timingSafeEqual(signature, expectedSig)) {
      logger.warn(
        "WhatsApp: Signature verification failed for data deletion request"
      )
      return null
    }

    if (!payload.user_id) {
      logger.warn("WhatsApp: Missing user_id in signed_request payload")
      return null
    }

    return payload
  } catch (error) {
    logger.error(`WhatsApp: Error parsing signed_request: ${error}`)
    return null
  }
}

const base64UrlDecode = (input: string): Buffer => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/")
  const padding = (4 - (base64.length % 4)) % 4
  const paddedBase64 = base64 + "=".repeat(padding)
  return Buffer.from(paddedBase64, "base64")
}

const generateConfirmationCode = (metaUserId: string): string => {
  const timestamp = Date.now().toString(36)
  const random = crypto.randomBytes(4).toString("hex")
  return `DEL-${timestamp}-${random}-${metaUserId.slice(-4)}`
}

export const deleteWhatsAppUserData = async (
  metaUserId: string
): Promise<{ result: DeletionResult; confirmationCode: string }> => {
  const confirmationCode = generateConfirmationCode(metaUserId)
  const result: DeletionResult = {
    whatsappUser: false,
    conversationHistory: false,
    redisContext: false,
    timestamp: new Date().toISOString(),
  }

  logger.info(
    `WhatsApp: Processing data deletion request for Meta user ${metaUserId}`
  )

  try {
    const { data: waUsers } = await SUPABASE.from("whatsapp_users")
      .select("id, whatsapp_phone, user_id")
      .or(`meta_user_id.eq.${metaUserId}`)
      .limit(10)

    if (waUsers && waUsers.length > 0) {
      for (const waUser of waUsers) {
        const { error: deleteError } = await SUPABASE.from("whatsapp_users")
          .delete()
          .eq("id", waUser.id)

        if (!deleteError) {
          result.whatsappUser = true
          logger.info(
            `WhatsApp: Deleted whatsapp_users record for phone ${waUser.whatsapp_phone}`
          )
        }

        if (waUser.user_id) {
          try {
            await unifiedContextStore.clearAll(waUser.user_id)
            result.redisContext = true
          } catch (redisError) {
            logger.warn(`WhatsApp: Failed to clear Redis context: ${redisError}`)
          }
        }
      }
    } else {
      logger.info(
        `WhatsApp: No WhatsApp user found for Meta user ${metaUserId} - no data to delete`
      )
      result.whatsappUser = true
    }

    logDeletionRequest(metaUserId, confirmationCode, result)

    return { result, confirmationCode }
  } catch (error) {
    logger.error(`WhatsApp: Error during data deletion: ${error}`)
    throw error
  }
}

const logDeletionRequest = (
  metaUserId: string,
  confirmationCode: string,
  result: DeletionResult
): void => {
  logger.info(
    `WhatsApp: Data deletion completed - Code: ${confirmationCode}, ` +
      `Meta User: ${metaUserId}, Result: ${JSON.stringify(result)}`
  )
}

export const buildConfirmationUrl = (
  confirmationCode: string,
  status: "success" | "error" = "success"
): string => {
  const baseUrl = env.urls.frontend
  const params = new URLSearchParams({
    code: confirmationCode,
    status,
  })
  return `${baseUrl}/data-deletion-status?${params.toString()}`
}

export const buildErrorUrl = (errorMessage: string): string => {
  const baseUrl = env.urls.frontend
  const params = new URLSearchParams({
    status: "error",
    error: errorMessage,
  })
  return `${baseUrl}/data-deletion-status?${params.toString()}`
}

/**
 * Format the data deletion response for Meta.
 * Meta expects a JSON response with 'url' and 'confirmation_code' fields.
 * The URL must be a valid HTTPS URL where users can check their deletion status.
 */
export const formatMetaResponse = (
  url: string,
  confirmationCode: string
): DataDeletionResponse => {
  return {
    url,
    confirmation_code: confirmationCode,
  }
}

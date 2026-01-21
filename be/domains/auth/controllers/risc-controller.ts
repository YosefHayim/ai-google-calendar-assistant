/**
 * Google RISC (Cross-Account Protection) Controller
 *
 * Handles incoming security events from Google's RISC system.
 * @see https://developers.google.com/identity/protocols/risc
 */

import type { Request, Response } from "express"
import { reqResAsyncHandler, sendR } from "@/lib/http"

import { STATUS_RESPONSE } from "@/config/constants/http"
import { env } from "@/config/env"
import { logger } from "@/lib/logger"
import { processRiscEvents } from "@/domains/auth/utils/risc-event-handlers"
import { verifyRiscToken } from "@/domains/auth/utils/risc-jwt-verifier"

/**
 * Handles incoming RISC Security Event Tokens from Google.
 *
 * Per Google's specification:
 * - Returns HTTP 202 immediately after successful token decoding
 * - Processes events asynchronously (fire-and-forget)
 * - Verifies JWT signature using Google's public keys
 * - Validates aud and iss claims
 */
const handleRiscEvent = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const startTime = Date.now()

    // Extract the JWT from the request body
    // Google sends RISC events as application/secevent+jwt or the JWT directly
    let token: string | undefined

    if (typeof req.body === "string") {
      // Raw JWT string
      token = req.body
    } else if (req.body?.token) {
      // Token in JSON body
      token = req.body.token
    }

    if (!token) {
      logger.error("RISC: No token found in request body")
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Missing security event token"
      )
    }

    // Get the expected audience (our Google OAuth Client ID)
    const expectedAudience = env.googleClientId

    // Verify the JWT
    const verification = await verifyRiscToken(token, expectedAudience)

    if (!(verification.valid && verification.payload)) {
      logger.error("RISC: Token verification failed", {
        error: verification.error,
      })
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        `Token verification failed: ${verification.error}`
      )
    }

    const { payload } = verification

    logger.info("RISC: Token verified successfully", {
      jti: payload.jti,
      iss: payload.iss,
      aud: payload.aud,
      eventTypes: Object.keys(payload.events),
    })

    // Return HTTP 202 Accepted immediately as per Google's specification
    // This acknowledges receipt before processing
    res.status(STATUS_RESPONSE.NO_CONTENT + 2).send() // 202 Accepted

    // Process events asynchronously (fire-and-forget)
    // Do not await - we've already responded to Google
    processRiscEvents(payload)
      .then((results) => {
        const duration = Date.now() - startTime
        logger.info("RISC: Event processing completed", {
          jti: payload.jti,
          results,
          durationMs: duration,
        })
      })
      .catch((error) => {
        logger.error("RISC: Event processing failed", {
          jti: payload.jti,
          error: error instanceof Error ? error.message : String(error),
        })
      })
  }
)

/**
 * Health check endpoint for the RISC receiver.
 * Can be used to verify the endpoint is reachable.
 */
const healthCheck = reqResAsyncHandler(async (_req: Request, res: Response) =>
  sendR(res, STATUS_RESPONSE.SUCCESS, "RISC endpoint is healthy", {
    timestamp: new Date().toISOString(),
    clientId: env.googleClientId,
  })
)

export const riscController = {
  handleRiscEvent,
  healthCheck,
}

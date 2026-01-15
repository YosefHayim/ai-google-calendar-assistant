import type { NextFunction, Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { createCalendarFromValidatedTokens } from "@/utils/calendar"

/**
 * Middleware that attaches a Google Calendar client to the request.
 * MUST be used after googleTokenValidation + googleTokenRefresh middleware.
 *
 * Uses pre-validated tokens from req.googleTokenValidation to avoid redundant
 * database calls and token refresh operations.
 */
export const withCalendarClient = reqResAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const validation = req.googleTokenValidation

    if (!validation) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Google token validation required. Ensure googleTokenValidation middleware runs first."
      )
    }

    const { tokens } = validation

    if (!tokens) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "User credentials not found."
      )
    }

    const calendar = createCalendarFromValidatedTokens(tokens)

    req.calendar = calendar
    req.tokenData = tokens

    next()
  }
)

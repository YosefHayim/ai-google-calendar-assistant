import type { NextFunction, Request, Response } from "express"
import { STATUS_RESPONSE } from "@/config"
import { reqResAsyncHandler, sendR } from "@/utils/http"
import { fetchCredentialsByEmail } from "@/utils/auth"
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar"

export const withCalendarClient = reqResAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = req.user?.email

    if (!email) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "User email not found in request."
      )
    }

    const tokenData = await fetchCredentialsByEmail(email)

    if (!tokenData) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "User credentials not found."
      )
    }

    const calendar =
      await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData)

    req.calendar = calendar
    req.tokenData = tokenData

    next()
  }
)

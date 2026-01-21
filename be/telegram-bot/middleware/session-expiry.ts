import type { MiddlewareFn } from "grammy"
import { auditLogger } from "@/lib/audit-logger"
import type { GlobalContext } from "../init-bot"

// Session TTL: 24 hours in milliseconds
const SESSION_TTL_MS = 24 * 60 * 60 * 1000

/**
 * Session Expiry Middleware
 *
 * Checks if the user's session has been inactive for more than 24 hours.
 * If expired, clears the authentication state and prompts for re-auth.
 * Updates lastActivity timestamp on every request.
 */
export const sessionExpiryMiddleware: MiddlewareFn<GlobalContext> = async (
  ctx,
  next
) => {
  const session = ctx.session
  const userId = ctx.from?.id

  if (!(session && userId)) {
    return next()
  }

  const now = Date.now()
  const lastActivity = session.lastActivity || 0

  // Check if session has expired (only if lastActivity was previously set)
  if (lastActivity > 0) {
    const inactiveTime = now - lastActivity

    if (inactiveTime > SESSION_TTL_MS) {
      const inactiveHours = Math.round(inactiveTime / (60 * 60 * 1000))

      // Log session expiry
      auditLogger.sessionExpired(
        userId,
        new Date(lastActivity).toISOString(),
        inactiveHours
      )

      // Clear authentication state
      session.googleTokens = undefined
      session.email = undefined
      session.pendingEmailVerification = undefined
      session.pendingConfirmation = undefined
      session.pendingEmailChange = undefined
      session.awaitingEmailChange = undefined
      session.agentActive = false
      session.isProcessing = false

      await ctx.reply(
        "Your session has expired due to inactivity (24 hours).\n\nPlease authenticate again to continue."
      )

      // Update lastActivity to now (session reset)
      session.lastActivity = now

      // Continue to auth handler to re-authenticate
      return next()
    }
  }

  // Update last activity timestamp
  session.lastActivity = now

  return next()
}

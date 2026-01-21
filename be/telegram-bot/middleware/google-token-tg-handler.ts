import type { MiddlewareFn } from "grammy"
import { InlineKeyboard } from "grammy"
import type { TokensProps } from "@/types"
import { AuditEventType, auditLogger } from "@/lib/audit-logger"
import {
  checkTokenExpiry,
  deactivateGoogleTokens,
  fetchGoogleTokensByEmail,
  generateGoogleAuthUrl,
  persistGoogleTokens,
  refreshGoogleAccessToken,
} from "@/domains/auth/utils"
import { logger } from "@/lib/logger"
import { getTranslatorFromLanguageCode } from "../i18n"
import type { GlobalContext } from "../init-bot"

/**
 * Validation result for Google Calendar tokens
 */
type TelegramTokenValidationResult = {
  tokens: TokensProps
  isExpired: boolean
  isNearExpiry: boolean
  expiresInMs: number | null
}

/**
 * Validate Google Calendar tokens for Telegram user
 * Returns validated tokens or null if auth is required
 */
const validateGoogleTokens = async (
  ctx: GlobalContext,
  email: string,
  langCode?: string
): Promise<TelegramTokenValidationResult | null> => {
  const { t } = getTranslatorFromLanguageCode(langCode)
  const { data: tokens, error } = await fetchGoogleTokensByEmail(email)
  if (error) {
    logger.error(
      `Telegram Bot: Google Token: validateGoogleTokens middleware error: ${error}`
    )
    console.error(
      `Telegram Bot: Google Token: validateGoogleTokens middleware error: ${error}`
    )
    await ctx.reply(
      "Error checking your calendar connection. Please try again."
    )
    return null
  }

  if (!tokens) {
    const authUrl = generateGoogleAuthUrl({ forceConsent: true })
    const keyboard = new InlineKeyboard().url(
      t("auth.googleCalendarConnectButton"),
      authUrl
    )
    await ctx.reply(t("auth.googleCalendarConnect"), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
    return null
  }

  if (!tokens.is_active) {
    const authUrl = generateGoogleAuthUrl({ forceConsent: true })
    const keyboard = new InlineKeyboard().url(
      t("auth.googleCalendarReconnectButton"),
      authUrl
    )
    await ctx.reply(t("auth.googleCalendarReconnect"), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
    return null
  }

  if (!tokens.refresh_token) {
    const authUrl = generateGoogleAuthUrl({ forceConsent: true })
    const keyboard = new InlineKeyboard().url(
      t("auth.googleCalendarReconnectButton"),
      authUrl
    )
    await ctx.reply(t("auth.googleCalendarMissingPermissions"), {
      parse_mode: "HTML",
      reply_markup: keyboard,
    })
    return null
  }

  const expiryStatus = checkTokenExpiry(tokens.expiry_date)
  return {
    tokens,
    ...expiryStatus,
  }
}

/**
 * Refresh Google Calendar tokens if expired or near expiry
 * Returns refreshed tokens or null if reauth is required
 */
const refreshGoogleTokensIfNeeded = async (
  ctx: GlobalContext,
  validation: TelegramTokenValidationResult,
  langCode?: string
): Promise<TelegramTokenValidationResult | null> => {
  const { tokens, isExpired, isNearExpiry } = validation
  const { t } = getTranslatorFromLanguageCode(langCode)

  if (!(isExpired || isNearExpiry)) {
    return validation
  }

  const email = tokens.email
  if (!email) {
    logger.error(
      "Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware user email missing from tokens"
    )
    await ctx.reply("Error with your calendar connection. Please try again.")
    return null
  }

  try {
    const refreshedTokens = await refreshGoogleAccessToken(tokens)
    await persistGoogleTokens(email, refreshedTokens)

    const expiresInMs = refreshedTokens.expiryDate - Date.now()

    auditLogger.tokenRefresh(ctx.from?.id || 0, email, expiresInMs)

    const result: TelegramTokenValidationResult = {
      tokens: {
        ...tokens,
        access_token: refreshedTokens.accessToken,
        expiry_date: refreshedTokens.expiryDate,
      },
      isExpired: false,
      isNearExpiry: false,
      expiresInMs,
    }
    return result
  } catch (error) {
    const err = error as Error
    logger.error(
      `Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware error: ${JSON.stringify(
        { name: err.name, message: err.message, stack: err.stack },
        null,
        2
      )}`
    )
    const message = err.message || "Token refresh failed"

    if (message.startsWith("REAUTH_REQUIRED:")) {
      await deactivateGoogleTokens(email)

      auditLogger.log(
        AuditEventType.GOOGLE_REAUTH_REQUIRED,
        ctx.from?.id || 0,
        {
          email,
          reason: message,
        }
      )

      const authUrl = generateGoogleAuthUrl({ forceConsent: true })
      const keyboard = new InlineKeyboard().url(
        t("auth.googleCalendarReconnectButton"),
        authUrl
      )
      await ctx.reply(t("auth.googleCalendarSessionExpired"), {
        parse_mode: "HTML",
        reply_markup: keyboard,
      })
      return null
    }

    logger.error(
      `Telegram Bot: Google Token: refreshGoogleTokensIfNeeded middleware error: ${message}`
    )
    await ctx.reply(
      "Error refreshing your calendar connection. Please try again."
    )
    return null
  }
}

/**
 * Google Token Validation and Refresh Middleware for Telegram
 *
 * Validates that the user has valid Google Calendar tokens and refreshes if needed.
 * Must be used after authTgHandler middleware (requires session.email to be set).
 */
export const googleTokenTgHandler: MiddlewareFn<GlobalContext> = async (
  ctx,
  next
) => {
  const email = ctx.session?.email
  const langCode = ctx.session?.codeLang

  if (!email) {
    return next()
  }

  const validation = await validateGoogleTokens(ctx, email, langCode)
  if (!validation) {
    return
  }

  const refreshedValidation = await refreshGoogleTokensIfNeeded(
    ctx,
    validation,
    langCode
  )
  if (!refreshedValidation) {
    return
  }

  ctx.session.googleTokens = refreshedValidation.tokens
  return next()
}

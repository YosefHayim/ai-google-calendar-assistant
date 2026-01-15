import type { Job } from "bullmq"
import { SUPABASE } from "@/config/clients"
import { logger } from "@/utils/logger"
import {
  refreshGoogleAccessToken,
  persistGoogleTokens,
  deactivateGoogleTokens,
} from "@/utils/auth/google-token"
import type { TokensProps } from "@/types"

const EXPIRY_THRESHOLD_HOURS = 12
const SECONDS_PER_HOUR = 3600
const MILLISECONDS_PER_SECOND = 1000
const MILLISECONDS_PER_HOUR = SECONDS_PER_HOUR * MILLISECONDS_PER_SECOND

export type TokenRefreshJobData = Record<string, never>

export type TokenRefreshResult = {
  checked: number
  refreshed: number
  failed: number
  errors: string[]
}

type ExpiringTokenRow = {
  user_id: string
  refresh_token: string
  access_token: string
  expires_at: string | null
  token_type: string | null
  id_token: string | null
  scope: string | null
  users: {
    email: string
  }
}

async function refreshUserToken(
  email: string,
  tokenData: Partial<TokensProps>
): Promise<{ success: boolean; error?: string }> {
  try {
    const refreshResult = await refreshGoogleAccessToken(tokenData as TokensProps)

    await persistGoogleTokens(email, refreshResult)

    logger.info(`[TokenRefresh] Refreshed token for user ${email}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    const requiresReauth = errorMessage.includes("REAUTH_REQUIRED")
    if (requiresReauth) {
      await deactivateGoogleTokens(email).catch(() => null)
      logger.warn(`[TokenRefresh] Deactivated invalid tokens for ${email}`)
    }

    return { success: false, error: errorMessage }
  }
}

export async function handleTokenRefreshCheck(
  job: Job<TokenRefreshJobData>
): Promise<TokenRefreshResult> {
  const result: TokenRefreshResult = {
    checked: 0,
    refreshed: 0,
    failed: 0,
    errors: [],
  }

  logger.info(`[Job ${job.id}] Starting token refresh check...`)

  try {
    const expiryThreshold = new Date(
      Date.now() + EXPIRY_THRESHOLD_HOURS * MILLISECONDS_PER_HOUR
    )

    const { data: expiringTokens, error: fetchError } = await SUPABASE
      .from("oauth_tokens")
      .select("user_id, refresh_token, access_token, expires_at, token_type, id_token, scope, users!inner(email)")
      .eq("provider", "google")
      .eq("is_valid", true)
      .not("refresh_token", "is", null)
      .lt("expires_at", expiryThreshold.toISOString())

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`)
      logger.error(`[Job ${job.id}] Error fetching expiring tokens:`, fetchError)
      throw fetchError
    }

    result.checked = expiringTokens?.length || 0

    if (!expiringTokens || expiringTokens.length === 0) {
      logger.info(`[Job ${job.id}] No tokens expiring within ${EXPIRY_THRESHOLD_HOURS} hours`)
      return result
    }

    logger.info(`[Job ${job.id}] Found ${expiringTokens.length} tokens to refresh`)

    for (const token of expiringTokens as ExpiringTokenRow[]) {
      if (!token.refresh_token) {
        continue
      }

      const email = token.users.email

      const tokenData: Partial<TokensProps> = {
        refresh_token: token.refresh_token,
        access_token: token.access_token,
        expires_at: token.expires_at,
        token_type: token.token_type,
        id_token: token.id_token,
        scope: token.scope,
      }

      const refreshOutcome = await refreshUserToken(email, tokenData)

      if (refreshOutcome.success) {
        result.refreshed++
      } else {
        result.failed++
        result.errors.push(`Failed for ${email}: ${refreshOutcome.error}`)
      }
    }

    logger.info(`[Job ${job.id}] Token refresh check completed`, result)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    result.errors.push(errorMessage)
    logger.error(`[Job ${job.id}] Token refresh check failed:`, error)
    throw error
  }
}

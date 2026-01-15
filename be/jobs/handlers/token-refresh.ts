import type { Job } from "bullmq"
import { SUPABASE } from "@/config/clients"
import { logger } from "@/utils/logger"
import { refreshGoogleTokens } from "@/utils/auth/google-auth"

const EXPIRY_THRESHOLD_HOURS = 12
const SECONDS_PER_HOUR = 3600
const MILLISECONDS_PER_SECOND = 1000
const MILLISECONDS_PER_HOUR = SECONDS_PER_HOUR * MILLISECONDS_PER_SECOND
const ACCESS_TOKEN_LIFETIME_SECONDS = 3600

export type TokenRefreshJobData = Record<string, never>

export type TokenRefreshResult = {
  checked: number
  refreshed: number
  failed: number
  errors: string[]
}

async function refreshUserToken(
  userId: string,
  email: string,
  refreshToken: string
): Promise<{ success: boolean; error?: string }> {
  const refreshResult = await refreshGoogleTokens(refreshToken)

  if (!refreshResult.success) {
    return { success: false, error: refreshResult.error || "Unknown error" }
  }

  if (!refreshResult.accessToken) {
    return { success: false, error: "No access token returned" }
  }

  const newExpiry = new Date(
    Date.now() + ACCESS_TOKEN_LIFETIME_SECONDS * MILLISECONDS_PER_SECOND
  )

  const { error: updateError } = await SUPABASE
    .from("users")
    .update({
      google_access_token: refreshResult.accessToken,
      google_token_expiry: newExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  logger.info(`[TokenRefresh] Refreshed token for user ${email}`)
  return { success: true }
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
      .from("users")
      .select("id, email, google_token_expiry, google_refresh_token")
      .not("google_refresh_token", "is", null)
      .lt("google_token_expiry", expiryThreshold.toISOString())

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

    for (const user of expiringTokens) {
      if (!user.google_refresh_token) {
        continue
      }

      const refreshOutcome = await refreshUserToken(
        user.id,
        user.email || "unknown",
        user.google_refresh_token
      )

      if (refreshOutcome.success) {
        result.refreshed++
      } else {
        result.failed++
        result.errors.push(`Failed for ${user.email}: ${refreshOutcome.error}`)
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

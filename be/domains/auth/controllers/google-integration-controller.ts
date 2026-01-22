import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/domains/auth/utils/cookie-utils"
import {
  OAUTH2CLIENT,
  PROVIDERS,
  STATUS_RESPONSE,
  SUPABASE,
  env,
} from "@/config"
import type { Request, Response } from "express"
import {
  refreshSupabaseSession,
  validateSupabaseToken,
} from "@/domains/auth/utils/supabase-token"
import { reqResAsyncHandler, sendR } from "@/lib/http"

import { generateGoogleAuthUrl } from "@/domains/auth/utils"
import { logger } from "@/lib/logger"
import { msToIso } from "@/lib/date/timestamp-utils"
import { sendWelcomeEmail } from "@/domains/notifications/services/notification-dispatcher"
import { syncUserCalendarsAfterOAuth } from "@/domains/calendar/utils/sync-calendars-after-oauth"
import { mineContactsInBackground } from "@/domains/contacts/services/contact-mining-service"

const TRIAL_DURATION_DAYS = 14

/**
 * Validates existing session and handles OAuth redirect flow.
 * Checks if the current access token is valid, attempts refresh if needed,
 * and redirects to frontend with appropriate authentication state.
 *
 * @param res - Express response object for cookie setting and redirection
 * @param accessToken - Current access token to validate
 * @param refreshToken - Optional refresh token for session renewal
 * @param frontendUrl - Frontend URL to redirect to after authentication
 * @returns Promise resolving to true if session is valid/active, false if authentication failed
 */
async function checkExistingSessionAndRedirect(
  res: Response,
  accessToken: string,
  refreshToken: string | undefined,
  frontendUrl: string
): Promise<boolean> {
  let validation = await validateSupabaseToken(accessToken).catch(() => null)

  if ((!validation?.user || validation.needsRefresh) && refreshToken) {
    try {
      const refreshed = await refreshSupabaseSession(refreshToken)
      setAuthCookies(
        res,
        refreshed.accessToken,
        refreshed.refreshToken,
        refreshed.user
      )
      validation = {
        user: refreshed.user,
        accessToken: refreshed.accessToken,
        error: null,
        needsRefresh: false,
      }
    } catch {
      return false
    }
  }

  if (!validation?.user?.email) {
    return false
  }

  const normalizedEmail = validation.user.email.toLowerCase().trim()

  const { data: user } = await SUPABASE.from("users")
    .select("id")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (!user) {
    return false
  }

  const { data: existingToken } = await SUPABASE.from("oauth_tokens")
    .select("refresh_token, is_valid")
    .eq("user_id", user.id)
    .eq("provider", "google")
    .limit(1)
    .maybeSingle()

  if (existingToken?.refresh_token && existingToken?.is_valid) {
    res.redirect(`${frontendUrl}/loading?redirect=dashboard`)
    return true
  }

  return false
}

const generateAuthGoogleUrl = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined
    const postmanHeaders = req.headers["user-agent"]
    const frontendUrl = env.urls.frontend
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE]
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE]

    if (!code && accessToken) {
      const redirected = await checkExistingSessionAndRedirect(
        res,
        accessToken,
        refreshToken,
        frontendUrl
      )
      if (redirected) {
        return
      }
    }

    const url = generateGoogleAuthUrl({ forceConsent: true })

    if (!code) {
      if (postmanHeaders?.includes("Postman")) {
        return sendR(res, STATUS_RESPONSE.SUCCESS, url)
      }
      return res.redirect(url)
    }

    try {
      const { tokens } = await OAUTH2CLIENT.getToken(code)

      if (!tokens.id_token) {
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "No ID token received from Google."
        )
      }

      const ticket = await OAUTH2CLIENT.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.googleClientId,
      })

      const payload = ticket.getPayload()
      if (!payload?.email) {
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "Failed to verify user profile from Google token."
        )
      }

      const googleUser = {
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
      }

      const normalizedEmail = googleUser.email.toLowerCase().trim()

      // First, sign in with Supabase Auth to get/create the auth user
      // This must happen BEFORE creating the database user to ensure ID consistency
      const { data: signInData, error: signInError } =
        await SUPABASE.auth.signInWithIdToken({
          provider: PROVIDERS.GOOGLE,
          token: tokens.id_token!,
          access_token: tokens.access_token!,
        })

      if (signInError || !signInData?.user) {
        console.error("Supabase Auth Error:", signInError)
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to sign in user via Supabase Auth.",
          signInError
        )
      }

      // Use the Supabase Auth user ID for the database record
      // This ensures consistency between auth.users and public.users
      const authUserId = signInData.user.id

      // Check if there's an existing user with this email but different ID (orphaned after re-registration)
      const { data: existingUser } = await SUPABASE.from("users")
        .select("id")
        .ilike("email", normalizedEmail)
        .limit(1)
        .maybeSingle()

      // If there's an existing user with a different ID, delete the orphaned record
      // This can happen if:
      // 1. User deleted their account (public.users deleted, auth.users deleted)
      // 2. User re-registers with same OAuth provider
      // 3. Supabase Auth creates a NEW user with a NEW ID
      // 4. But somehow there's still an orphaned record with the old ID
      if (existingUser && existingUser.id !== authUserId) {
        logger.info(
          `Cleaning up orphaned user record: old ID ${existingUser.id}, new auth ID ${authUserId}`
        )

        // Delete orphaned oauth_tokens for the old user ID
        const { error: deleteTokensError } = await SUPABASE.from("oauth_tokens")
          .delete()
          .eq("user_id", existingUser.id)

        if (deleteTokensError) {
          console.error(
            `Failed to delete orphaned oauth_tokens for user ${existingUser.id}:`,
            deleteTokensError
          )
        }

        // Delete the orphaned user record
        const { error: deleteUserError } = await SUPABASE.from("users")
          .delete()
          .eq("id", existingUser.id)

        if (deleteUserError) {
          console.error(
            `Failed to delete orphaned user record ${existingUser.id}:`,
            deleteUserError
          )
        }
      }

      const userUpsertPayload = {
        id: authUserId, // Use the Supabase Auth user ID
        email: normalizedEmail,
        first_name: googleUser.given_name ?? null,
        last_name: googleUser.family_name ?? null,
        avatar_url: googleUser.picture ?? null,
        display_name: googleUser.given_name
          ? `${googleUser.given_name} ${googleUser.family_name || ""}`.trim()
          : null,
        email_verified: true,
        status: "active" as const,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: userData, error: userError } = await SUPABASE.from("users")
        .upsert(userUpsertPayload, { onConflict: "id" })
        .select("id")
        .single()

      if (userError || !userData) {
        console.error("Supabase User Upsert Error:", userError)
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to store user in database.",
          userError
        )
      }

      const isNewUser = !existingUser || existingUser.id !== authUserId
      if (isNewUser) {
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + TRIAL_DURATION_DAYS)

        await SUPABASE.from("users")
          .update({ trial_end_date: trialEndDate.toISOString() })
          .eq("id", userData.id)

        const userName = googleUser.given_name || normalizedEmail.split("@")[0]
        sendWelcomeEmail(normalizedEmail, userName).catch((err) => {
          console.error("Failed to send welcome email:", err)
        })
      }

      const tokenUpsertPayload: {
        user_id: string
        provider: "google"
        access_token: string
        token_type?: string | null
        id_token?: string | null
        scope?: string | null
        expires_at?: string | null
        is_valid: boolean
        updated_at: string
        refresh_token?: string
        provider_user_id?: string | null
      } = {
        user_id: userData.id,
        provider: "google",
        access_token: tokens.access_token!,
        token_type: tokens.token_type ?? null,
        id_token: tokens.id_token ?? null,
        scope: tokens.scope ?? null,
        expires_at: tokens.expiry_date ? msToIso(tokens.expiry_date) : null,
        is_valid: true,
        updated_at: new Date().toISOString(),
        // Store Google subject ID for RISC (Cross-Account Protection) event matching
        provider_user_id: payload.sub ?? null,
      }

      if (tokens.refresh_token) {
        tokenUpsertPayload.refresh_token = tokens.refresh_token
      }

      const { error: tokenError } = await SUPABASE.from("oauth_tokens").upsert(
        tokenUpsertPayload,
        { onConflict: "user_id,provider" }
      )

      if (tokenError) {
        console.error("Supabase Token Save Error:", tokenError)
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to store Google tokens in database.",
          tokenError
        )
      }

      if (tokens.access_token) {
        syncUserCalendarsAfterOAuth(
          userData.id,
          normalizedEmail,
          tokens.access_token,
          tokens.refresh_token ?? undefined
        )

        mineContactsInBackground(
          userData.id,
          normalizedEmail,
          tokens.access_token,
          tokens.refresh_token ?? undefined
        )
      }

      // signInData was already obtained earlier to ensure ID consistency
      if (signInData?.session) {
        setAuthCookies(
          res,
          signInData.session.access_token,
          signInData.session.refresh_token,
          signInData.user
        )

        const frontendUrl = env.urls.frontend
        const safeParams = new URLSearchParams({
          auth: "success",
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          user: JSON.stringify({
            id: signInData.user?.id,
            email: signInData.user?.email,
            first_name: googleUser.given_name || "",
            last_name: googleUser.family_name || "",
            avatar_url: googleUser.picture || "",
          }),
        })
        return res.redirect(`${frontendUrl}/callback?${safeParams.toString()}`)
      }

      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Session creation failed without error."
      )
    } catch (error) {
      console.error("OAuth Exchange Error:", error)
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to process OAuth token exchange.",
        error
      )
    }
  }
)

const getGoogleCalendarIntegrationStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email

    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.")
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id, created_at")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (userError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch user.",
        userError
      )
    }

    if (!user) {
      const authUrl = generateGoogleAuthUrl({ forceConsent: true })
      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Google Calendar integration status fetched successfully.",
        {
          isSynced: false,
          isActive: false,
          isExpired: false,
          syncedAt: null,
          authUrl,
        }
      )
    }

    const { data: oauthToken, error: tokenError } = await SUPABASE.from(
      "oauth_tokens"
    )
      .select("is_valid, expires_at, refresh_token, created_at")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .limit(1)
      .maybeSingle()

    if (tokenError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch integration status.",
        tokenError
      )
    }

    const isSynced = Boolean(oauthToken)
    const isActive = oauthToken?.is_valid ?? false
    const hasRefreshToken = Boolean(oauthToken?.refresh_token)
    const needsReauth = !(isActive && hasRefreshToken)

    const authUrl = generateGoogleAuthUrl({ forceConsent: needsReauth })

    let isExpired = false
    if (oauthToken?.expires_at) {
      isExpired = Date.now() > new Date(oauthToken.expires_at).getTime()
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Google Calendar integration status fetched successfully.",
      {
        isSynced,
        isActive,
        isExpired,
        syncedAt: oauthToken?.created_at ?? user.created_at ?? null,
        authUrl,
      }
    )
  }
)

const disconnectGoogleCalendarIntegration = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email

    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.")
    }

    const normalizedEmail = email.toLowerCase().trim()

    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle()

    if (userError || !user) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.", userError)
    }

    const { error } = await SUPABASE.from("oauth_tokens")
      .update({ is_valid: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google")

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to disconnect Google Calendar.",
        error
      )
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Google Calendar disconnected successfully.",
      { isActive: false }
    )
  }
)

export const googleIntegrationController = {
  generateAuthGoogleUrl,
  getGoogleCalendarIntegrationStatus,
  disconnectGoogleCalendarIntegration,
}

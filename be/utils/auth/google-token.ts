import { OAUTH2CLIENT, REDIRECT_URI, SCOPES, env } from "@/config"

import type { TokensProps } from "@/types"
import { google } from "googleapis"
import { isoToMs } from "../date/timestamp-utils"
import { userRepository } from "../repositories/UserRepository"

const SECONDS_PER_MINUTE = 60
const MS_PER_SECOND = 1000
const NEAR_EXPIRY_MINUTES = 5
const MINUTES_TO_MS = SECONDS_PER_MINUTE * MS_PER_SECOND

const createFreshOAuth2Client = () =>
  new google.auth.OAuth2(
    env.googleClientId,
    env.googleClientSecret,
    REDIRECT_URI
  )

export const generateGoogleAuthUrl = (
  options: { forceConsent?: boolean } = {}
): string => {
  const { forceConsent = false } = options

  const authUrlOptions: {
    access_type: string
    scope: string[]
    include_granted_scopes: boolean
    redirect_uri: string
    prompt?: string
  } = {
    access_type: "offline",
    scope: SCOPES,
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  }

  if (forceConsent) {
    authUrlOptions.prompt = "consent"
  }

  return OAUTH2CLIENT.generateAuthUrl(authUrlOptions)
}

export const NEAR_EXPIRY_BUFFER_MS = NEAR_EXPIRY_MINUTES * MINUTES_TO_MS

export type TokenExpiryStatus = {
  isExpired: boolean
  isNearExpiry: boolean
  expiresInMs: number | null
}

export type RefreshedGoogleToken = {
  accessToken: string
  expiryDate: number
}

export const checkTokenExpiry = (
  expiryDate: number | string | null | undefined
): TokenExpiryStatus => {
  if (!expiryDate) {
    return { isExpired: true, isNearExpiry: true, expiresInMs: null }
  }

  const expiryMs =
    typeof expiryDate === "string"
      ? new Date(expiryDate).getTime()
      : expiryDate

  const now = Date.now()
  const expiresInMs = expiryMs - now
  return {
    isExpired: expiresInMs <= 0,
    isNearExpiry: expiresInMs > 0 && expiresInMs <= NEAR_EXPIRY_BUFFER_MS,
    expiresInMs: expiresInMs > 0 ? expiresInMs : null,
  }
}

export const fetchGoogleTokensByEmail = (
  email: string
): Promise<{ data: TokensProps | null; error: string | null }> =>
  userRepository.findUserWithGoogleTokens(email)

export const refreshGoogleAccessToken = async (
  tokens: TokensProps
): Promise<RefreshedGoogleToken> => {
  if (!tokens.refresh_token) {
    throw new Error("REAUTH_REQUIRED: No refresh token available")
  }

  const oauthClient = createFreshOAuth2Client()

  const expiryDate = tokens.expiry_date ?? isoToMs(tokens.expires_at)

  oauthClient.setCredentials({
    expiry_date: expiryDate,
    token_type: tokens.token_type ?? undefined,
    scope: tokens.scope ?? undefined,
    id_token: tokens.id_token ?? undefined,
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token ?? undefined,
  })

  try {
    const { credentials } = await oauthClient.refreshAccessToken()

    if (!credentials.access_token) {
      throw new Error("No access token received from Google")
    }

    if (!credentials.expiry_date) {
      throw new Error("No expiry date received from Google")
    }

    return {
      accessToken: credentials.access_token,
      expiryDate: credentials.expiry_date,
    }
  } catch (e) {
    const err = e as Error & {
      code?: string
      response?: { data?: { error?: string; error_description?: string } }
    }

    const errorCode = err.code || err.response?.data?.error
    const errorMessage =
      err.message || err.response?.data?.error_description || ""

    const invalidGrantErrors = [
      "invalid_grant",
      "invalid_request",
      "unauthorized_client",
    ]

    if (
      errorCode === "invalid_grant" ||
      invalidGrantErrors.some((code) =>
        errorMessage.toLowerCase().includes(code)
      ) ||
      errorMessage.toLowerCase().includes("token has been expired or revoked") ||
      errorMessage.toLowerCase().includes("invalid_grant") ||
      errorMessage.toLowerCase().includes("token was not found")
    ) {
      console.error(
        "Google token refresh failed: Refresh token is invalid or expired",
        { code: errorCode, message: errorMessage }
      )
      throw new Error(
        "REAUTH_REQUIRED: Refresh token is invalid, expired, or revoked. User must re-authenticate."
      )
    }

    console.error("Google token refresh failed:", {
      code: errorCode,
      message: errorMessage,
      error: err,
    })
    throw new Error(
      `TOKEN_REFRESH_FAILED: ${errorMessage || err.message || "Unknown error occurred"}`
    )
  }
}

export const persistGoogleTokens = async (
  email: string,
  refreshedTokens: RefreshedGoogleToken
): Promise<void> => {
  const userId = await userRepository.findUserIdByEmail(email)

  if (!userId) {
    console.error("Failed to find user for token persistence: User not found")
    throw new Error("Failed to find user: User not found")
  }

  await userRepository.updateGoogleTokens(
    userId,
    refreshedTokens.accessToken,
    refreshedTokens.expiryDate
  )
}

export const deactivateGoogleTokens = async (email: string): Promise<void> => {
  const userId = await userRepository.findUserIdByEmail(email)

  if (!userId) {
    console.error("Failed to find user for token deactivation: User not found")
    throw new Error("Failed to find user: User not found")
  }

  await userRepository.deactivateGoogleTokens(userId)
}

export const getUserIdByEmail = (email: string): Promise<string | null> =>
  userRepository.findUserIdByEmail(email)

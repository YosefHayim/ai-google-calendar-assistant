import { SUPABASE } from "@/config/root-config";
import { TOKEN_FIELDS } from "@/utils/storage";
import type { TokensProps } from "@/types";

/**
 * Token validation result indicating the status of user's Google OAuth tokens
 */
export interface TokenValidationResult {
  /**
   * Whether tokens are valid and can be used
   */
  isValid: boolean;
  /**
   * Whether the user needs to re-authenticate with Google
   */
  requiresReAuth: boolean;
  /**
   * Detailed status message
   */
  status: "valid" | "access_token_expired" | "refresh_token_expired" | "tokens_missing" | "tokens_invalid";
  /**
   * Human-readable message explaining the status
   */
  message: string;
  /**
   * Whether the access token is expired
   */
  isAccessTokenExpired: boolean;
  /**
   * Whether the refresh token is expired
   */
  isRefreshTokenExpired: boolean;
  /**
   * Time remaining until access token expires (in milliseconds), or null if expired
   */
  accessTokenTimeRemaining: number | null;
  /**
   * Time remaining until refresh token expires (in milliseconds), or null if expired
   */
  refreshTokenTimeRemaining: number | null;
}

/**
 * Validates Google OAuth tokens to determine if they are still valid
 * and if the user needs to re-authenticate.
 *
 * @param tokens - Token data from database (must include expiry_date, refresh_token_expires_in, and created_at)
 * @param bufferMinutes - Buffer time in minutes before considering token expired (default: 5 minutes)
 * @returns TokenValidationResult with detailed validation information
 *
 * @example
 * ```typescript
 * const tokens = await fetchCredentialsByEmail(email);
 * const validation = validateTokens(tokens);
 * if (validation.requiresReAuth) {
 *   // Direct user to re-authenticate
 * }
 * ```
 */
export function validateTokens(
  tokens: TokensProps & { created_at?: string | null },
  bufferMinutes: number = 5
): TokenValidationResult {
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;

  // Check if tokens exist
  if (!tokens.access_token || !tokens.refresh_token) {
    return {
      isValid: false,
      requiresReAuth: true,
      status: "tokens_missing",
      message: "Tokens are missing. User needs to authenticate with Google.",
      isAccessTokenExpired: true,
      isRefreshTokenExpired: true,
      accessTokenTimeRemaining: null,
      refreshTokenTimeRemaining: null,
    };
  }

  // Validate access token expiry
  const expiryDate = tokens.expiry_date;
  const isAccessTokenExpired = expiryDate
    ? now >= expiryDate - bufferMs
    : true; // If no expiry_date, consider expired
  const accessTokenTimeRemaining = expiryDate && !isAccessTokenExpired
    ? expiryDate - now - bufferMs
    : null;

  // Validate refresh token expiry
  // Refresh token expires after refresh_token_expires_in seconds from created_at
  let isRefreshTokenExpired = true;
  let refreshTokenTimeRemaining: number | null = null;

  if (tokens.refresh_token_expires_in && tokens.created_at) {
    const createdDate = new Date(tokens.created_at).getTime();
    const refreshTokenExpiryDate = createdDate + tokens.refresh_token_expires_in * 1000;
    isRefreshTokenExpired = now >= refreshTokenExpiryDate - bufferMs;
    refreshTokenTimeRemaining = !isRefreshTokenExpired
      ? refreshTokenExpiryDate - now - bufferMs
      : null;
  } else if (!tokens.refresh_token_expires_in) {
    // If refresh_token_expires_in is not set, we can't determine expiry
    // Assume it's still valid (Google refresh tokens can be long-lived)
    isRefreshTokenExpired = false;
  } else {
    // If created_at is missing but refresh_token_expires_in exists, we can't calculate
    // Assume expired to be safe
    isRefreshTokenExpired = true;
  }

  // Determine overall status
  let status: TokenValidationResult["status"];
  let message: string;
  let isValid: boolean;
  let requiresReAuth: boolean;

  if (isRefreshTokenExpired) {
    status = "refresh_token_expired";
    message = "Refresh token has expired. User needs to re-authenticate with Google.";
    isValid = false;
    requiresReAuth = true;
  } else if (isAccessTokenExpired) {
    status = "access_token_expired";
    message = "Access token has expired, but refresh token is still valid. Token can be refreshed automatically.";
    isValid = false; // Access token is expired, but refresh is possible
    requiresReAuth = false; // No re-auth needed, can refresh
  } else {
    status = "valid";
    message = "Tokens are valid and can be used.";
    isValid = true;
    requiresReAuth = false;
  }

  return {
    isValid,
    requiresReAuth,
    status,
    message,
    isAccessTokenExpired,
    isRefreshTokenExpired,
    accessTokenTimeRemaining,
    refreshTokenTimeRemaining,
  };
}

/**
 * Validates tokens by email (fetches tokens first, then validates)
 *
 * @param email - User's email address
 * @param bufferMinutes - Buffer time in minutes before considering token expired (default: 5 minutes)
 * @returns TokenValidationResult with detailed validation information
 */
export async function validateTokensByEmail(
  email: string,
  bufferMinutes: number = 5
): Promise<TokenValidationResult> {
  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select(`${TOKEN_FIELDS}, created_at`)
    .eq("email", email.trim().toLowerCase())
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      isValid: false,
      requiresReAuth: true,
      status: "tokens_missing",
      message: "No tokens found for user. User needs to authenticate with Google.",
      isAccessTokenExpired: true,
      isRefreshTokenExpired: true,
      accessTokenTimeRemaining: null,
      refreshTokenTimeRemaining: null,
    };
  }

  return validateTokens(data as TokensProps & { created_at?: string | null }, bufferMinutes);
}


// Google token utilities
export {
  checkTokenExpiry,
  fetchGoogleTokensByEmail,
  refreshGoogleAccessToken,
  persistGoogleTokens,
  deactivateGoogleTokens,
  NEAR_EXPIRY_BUFFER_MS,
  type TokenExpiryStatus,
  type RefreshedGoogleToken,
} from "./google-token";

// Supabase token utilities
export {
  validateSupabaseToken,
  refreshSupabaseSession,
  setSupabaseSession,
  type SupabaseSessionResult,
  type RefreshedSupabaseSession,
} from "./supabase-token";

// Legacy exports (kept for backwards compatibility)
export { fetchCredentialsByEmail } from "./get-user-calendar-tokens";
export { supabaseThirdPartySignInOrSignUp, initiateOAuthFlow, redirectToOAuth, sendOAuthError } from "./third-party-signin";
export { updateUserSupabaseTokens } from "./update-tokens-of-user";

// Google token utilities

// Legacy exports (kept for backwards compatibility)
export { fetchCredentialsByEmail } from "./get-user-calendar-tokens";
export {
  checkTokenExpiry,
  deactivateGoogleTokens,
  fetchGoogleTokensByEmail,
  generateGoogleAuthUrl,
  NEAR_EXPIRY_BUFFER_MS,
  persistGoogleTokens,
  type RefreshedGoogleToken,
  refreshGoogleAccessToken,
  type TokenExpiryStatus,
} from "./google-token";
// Ownership validation (anti-BOLA/IDOR)
export {
  type OwnedResourceType,
  type OwnershipValidationResult,
  requireConversationOwnership,
  requireEmailOwnership,
  requireOwnership,
  requireUserIdOwnership,
  validateResourceOwnership,
} from "./ownership-validation";
// User authentication utilities
export {
  getUserEmail,
  getUserId,
  hasUserEmail,
  isAuthenticated,
  requireUser,
  requireUserId,
  type UserExtractionError,
  type UserExtractionResult,
  type UserIdExtractionResult,
  type UserResult,
} from "./require-user";
// Supabase token utilities
export {
  type RefreshedSupabaseSession,
  refreshSupabaseSession,
  type SupabaseSessionResult,
  setSupabaseSession,
  validateSupabaseToken,
} from "./supabase-token";
export {
  initiateOAuthFlow,
  redirectToOAuth,
  sendOAuthError,
  supabaseThirdPartySignInOrSignUp,
} from "./third-party-signin";
export { updateUserSupabaseTokens } from "./update-tokens-of-user";

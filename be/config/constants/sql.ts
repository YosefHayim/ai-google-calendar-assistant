/**
 * Fields to select when querying user + oauth_tokens for Google Calendar operations.
 * Uses a join between users and oauth_tokens tables.
 */
export const USER_OAUTH_FIELDS = `
  users!inner(id, email, timezone, display_name, first_name, last_name, avatar_url, status),
  oauth_tokens!inner(access_token, refresh_token, token_type, id_token, scope, expires_at, refresh_token_expires_at, is_valid, provider)
`;

/**
 * Fields to select from oauth_tokens table directly
 */
export const OAUTH_TOKEN_FIELDS =
  "id, user_id, provider, access_token, refresh_token, token_type, id_token, scope, expires_at, refresh_token_expires_at, is_valid, last_refreshed_at";

/**
 * Fields to select from users table directly
 */
export const USER_FIELDS =
  "id, email, display_name, first_name, last_name, avatar_url, timezone, locale, status, email_verified, last_login_at, created_at, updated_at";

/**
 * @deprecated Use USER_OAUTH_FIELDS instead. This is kept for backwards compatibility during migration.
 * Legacy field selection for user_calendar_tokens table.
 */
export const TOKEN_FIELDS =
  "access_token, refresh_token, token_type, is_active, email, timezone, expiry_date, refresh_token_expires_in";

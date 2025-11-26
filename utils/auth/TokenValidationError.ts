/**
 * Error thrown when user tokens are invalid and re-authentication is required
 */
export class TokenValidationError extends Error {
  public readonly requiresReAuth: boolean;
  public readonly status: "access_token_expired" | "refresh_token_expired" | "tokens_missing" | "tokens_invalid";
  public readonly isAccessTokenExpired: boolean;
  public readonly isRefreshTokenExpired: boolean;

  constructor(
    message: string,
    status: "access_token_expired" | "refresh_token_expired" | "tokens_missing" | "tokens_invalid",
    isAccessTokenExpired: boolean,
    isRefreshTokenExpired: boolean
  ) {
    super(message);
    this.name = "TokenValidationError";
    this.requiresReAuth = isRefreshTokenExpired || status === "tokens_missing";
    this.status = status;
    this.isAccessTokenExpired = isAccessTokenExpired;
    this.isRefreshTokenExpired = isRefreshTokenExpired;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TokenValidationError);
    }
  }
}


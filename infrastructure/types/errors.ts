/**
 * Error Types for Infrastructure Layer
 * Provides properly typed error handling for external API errors
 */

/**
 * Standard error shape with optional properties for API errors
 */
export interface ApiError extends Error {
  code?: number | string;
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
  statusCode?: number;
  details?: unknown;
}

/**
 * Google Calendar API Error
 */
export interface GoogleCalendarError extends ApiError {
  code?: number;
  response?: {
    status?: number;
    statusText?: string;
    data?: {
      error?: {
        code?: number;
        message?: string;
        errors?: Array<{
          domain?: string;
          reason?: string;
          message?: string;
        }>;
      };
    };
  };
}

/**
 * Supabase Error
 */
export interface SupabaseError extends ApiError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Type guard to check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof Error &&
    (("code" in error && (typeof error.code === "number" || typeof error.code === "string")) ||
      ("response" in error && typeof error.response === "object") ||
      ("statusCode" in error && typeof error.statusCode === "number"))
  );
}

/**
 * Type guard to check if error is GoogleCalendarError
 */
export function isGoogleCalendarError(error: unknown): error is GoogleCalendarError {
  return isApiError(error) && "response" in error && typeof error.response === "object";
}

/**
 * Type guard to check if error is SupabaseError
 */
export function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    error instanceof Error &&
    "message" in error &&
    (("code" in error && typeof error.code === "string") ||
      ("details" in error && typeof error.details === "string") ||
      ("hint" in error && typeof error.hint === "string"))
  );
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Unknown error";
}

/**
 * Safely extract error code from unknown error
 */
export function getErrorCode(error: unknown): number | string | undefined {
  if (isApiError(error)) {
    return error.code || error.response?.status || error.statusCode;
  }
  return undefined;
}

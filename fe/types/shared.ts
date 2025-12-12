/**
 * Shared type utilities and helpers
 * These types are used across the application and complement generated API types
 */

/**
 * Utility type to extract the data type from an ApiResponse
 */
export type ExtractApiData<T> = T extends { data?: infer D } ? D : never;

/**
 * Utility type for API error responses
 */
export interface ApiError {
  message: string;
  error?: unknown;
}

/**
 * Status type matching backend STATUS_RESPONSE enum
 */
export type ApiStatus = "success" | "error";

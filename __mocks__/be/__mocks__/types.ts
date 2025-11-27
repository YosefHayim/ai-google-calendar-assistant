/**
 * Type definitions for mock objects used in tests
 */

/**
 * Generic database record type
 */
export interface DatabaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/**
 * Filter function for database queries
 */
export type RecordFilter<T = DatabaseRecord> = (record: T) => boolean;

/**
 * Supabase query response type
 */
export interface SupabaseResponse<T = DatabaseRecord> {
  data: T | T[] | null;
  error: SupabaseError | null;
}

/**
 * Supabase error type
 */
export interface SupabaseError {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}

/**
 * OpenAI Agent tool type
 */
export interface AgentTool {
  type: string;
  function?: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

/**
 * Generic metadata type
 */
export type Metadata = Record<string, string | number | boolean | null>;

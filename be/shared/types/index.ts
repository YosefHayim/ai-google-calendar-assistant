/**
 * @fileoverview Core types and utilities shared across all modalities (chat, voice, telegram).
 * This module provides the foundational interfaces and helper functions used throughout the backend.
 */

/**
 * Context passed to all tool handlers. Contains the authenticated user's email.
 * Used by event-handlers, direct-handlers, and gap-handlers.
 * @example
 * const ctx: HandlerContext = { email: "user@example.com" }
 * await getEventHandler(params, ctx)
 */
export type HandlerContext = {
  email: string;
};

/**
 * Context for OpenAI Agents SDK tools. Passed via RunContext<AgentContext>.
 * Extracted using getEmailFromContext() in adapters.
 * @example
 * const agent = new Agent<AgentContext>({ ... })
 * runner.run(agent, { context: { email: userEmail } })
 */
export type AgentContext = {
  email: string;
};

/**
 * Controls event data projection for different modalities.
 * - VOICE_LITE: Minimal fields for voice responses (summary, start, end)
 * - CHAT_STANDARD: Standard fields for chat UI (includes description, location)
 * - FULL: All fields for API responses
 */
export type ProjectionMode = "VOICE_LITE" | "CHAT_STANDARD" | "FULL";

/**
 * Interaction modality for cross-modal context tracking.
 * Stored in Redis to enable context continuity across channels.
 */
export type Modality = "chat" | "voice" | "telegram" | "whatsapp" | "api";

/**
 * Represents a calendar event that conflicts with a proposed time slot.
 * Returned by checkConflictsHandler and checkEventConflicts.
 */
export type ConflictingEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
};

/**
 * Result of conflict checking operations.
 * Used by pre_create_validation tool and conflict checking utilities.
 */
export type ConflictCheckResult = {
  hasConflicts: boolean;
  conflictingEvents: ConflictingEvent[];
  error?: string;
};

/**
 * Converts any error type to a user-friendly string message.
 * Handles Error instances, objects with message property, and unknown types.
 * Used in tool errorFunction callbacks and error responses.
 * @param error - Any thrown error or unknown value
 * @returns Human-readable error message string
 * @example
 * errorFunction: (_, error) => `tool_name: ${stringifyError(error)}`
 */
export function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "object" && error !== null) {
    if (
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown error occurred";
    }
  }
  return String(error);
}

/**
 * Categorizes errors into auth, database, or other types.
 * Used to provide appropriate user-facing error messages.
 * @param error - Any thrown error or unknown value
 * @returns Object with error type and user-friendly message
 * @example
 * const { type, message } = categorizeError(error)
 * if (type === "auth") return { error: "Please re-authenticate" }
 */
export function categorizeError(error: unknown): {
  type: "auth" | "database" | "other";
  message: string;
} {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const lowerMsg = errorMsg.toLowerCase();

  if (
    lowerMsg.includes("no credentials found") ||
    lowerMsg.includes("user not found") ||
    lowerMsg.includes("no tokens available") ||
    lowerMsg.includes("invalid_grant") ||
    lowerMsg.includes("token has been expired") ||
    lowerMsg.includes("token has been revoked") ||
    lowerMsg.includes("401") ||
    lowerMsg.includes("403") ||
    lowerMsg.includes("unauthorized")
  ) {
    return {
      type: "auth",
      message: "No credentials found - authorization required.",
    };
  }

  if (
    (lowerMsg.includes("column") && lowerMsg.includes("does not exist")) ||
    (lowerMsg.includes("relation") && lowerMsg.includes("does not exist")) ||
    lowerMsg.includes("connection refused") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("could not fetch credentials")
  ) {
    return {
      type: "database",
      message: "Database error - please try again in a moment.",
    };
  }

  return { type: "other", message: errorMsg };
}

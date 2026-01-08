export interface HandlerContext {
  email: string
}

export interface AgentContext {
  email: string
}

export type ProjectionMode = "VOICE_LITE" | "CHAT_STANDARD" | "FULL"

export type Modality = "chat" | "voice" | "telegram" | "api"

export interface ConflictingEvent {
  id: string
  summary: string
  start: string
  end: string
  calendarId: string
  calendarName: string
}

export interface ConflictCheckResult {
  hasConflicts: boolean
  conflictingEvents: ConflictingEvent[]
  error?: string
}

export function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "object" && error !== null) {
    if (
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      return (error as { message: string }).message
    }
    try {
      return JSON.stringify(error)
    } catch {
      return "Unknown error occurred"
    }
  }
  return String(error)
}

export function categorizeError(error: unknown): {
  type: "auth" | "database" | "other"
  message: string
} {
  const errorMsg = error instanceof Error ? error.message : String(error)
  const lowerMsg = errorMsg.toLowerCase()

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
    return { type: "auth", message: "No credentials found - authorization required." }
  }

  if (
    (lowerMsg.includes("column") && lowerMsg.includes("does not exist")) ||
    (lowerMsg.includes("relation") && lowerMsg.includes("does not exist")) ||
    lowerMsg.includes("connection refused") ||
    lowerMsg.includes("database") ||
    lowerMsg.includes("could not fetch credentials")
  ) {
    return { type: "database", message: "Database error - please try again in a moment." }
  }

  return { type: "other", message: errorMsg }
}
